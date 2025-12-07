-- Migration: 012_expire_bookings.sql
-- Description: Add soft hold expiration and booking state change logging
-- Dependencies: 007_bookings.sql

-- Add soft_hold_expires_at column to bookings table
ALTER TABLE bookings
  ADD COLUMN soft_hold_expires_at TIMESTAMPTZ;

-- Add index for efficient expiration queries
CREATE INDEX idx_bookings_soft_hold_expiration
  ON bookings(soft_hold_expires_at)
  WHERE status = 'pending' AND soft_hold_expires_at IS NOT NULL;

-- Update booking_status enum to include 'expired' state
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'expired';

-- Create booking state change log table
CREATE TABLE booking_state_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Booking reference
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- State transition
  from_state booking_status NOT NULL,
  to_state booking_status NOT NULL,

  -- Who made the change
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optional reason/notes
  reason TEXT,

  -- Metadata
  metadata JSONB
);

-- Indexes for state log
CREATE INDEX idx_booking_state_log_booking_id ON booking_state_log(booking_id);
CREATE INDEX idx_booking_state_log_changed_at ON booking_state_log(changed_at DESC);
CREATE INDEX idx_booking_state_log_changed_by ON booking_state_log(changed_by)
  WHERE changed_by IS NOT NULL;
CREATE INDEX idx_booking_state_log_transitions ON booking_state_log(from_state, to_state);

-- Function to expire pending bookings with expired soft holds
CREATE OR REPLACE FUNCTION expire_old_pending_bookings()
RETURNS TABLE(
  expired_count INTEGER,
  booking_ids UUID[]
) AS $$
DECLARE
  v_expired_count INTEGER;
  v_booking_ids UUID[];
BEGIN
  -- Get IDs of bookings to expire
  SELECT ARRAY_AGG(id)
  INTO v_booking_ids
  FROM bookings
  WHERE status = 'pending'
    AND soft_hold_expires_at IS NOT NULL
    AND soft_hold_expires_at < NOW();

  -- Count how many we found
  v_expired_count := COALESCE(array_length(v_booking_ids, 1), 0);

  -- If there are any to expire
  IF v_expired_count > 0 THEN
    -- Update the bookings to expired status
    UPDATE bookings
    SET
      status = 'expired',
      updated_at = NOW()
    WHERE id = ANY(v_booking_ids);

    -- Log the state changes
    INSERT INTO booking_state_log (booking_id, from_state, to_state, reason, changed_at)
    SELECT
      id,
      'pending'::booking_status,
      'expired'::booking_status,
      'Soft hold expired - automated expiration',
      NOW()
    FROM bookings
    WHERE id = ANY(v_booking_ids);
  ELSE
    -- No bookings to expire
    v_booking_ids := ARRAY[]::UUID[];
  END IF;

  -- Return results
  RETURN QUERY SELECT v_expired_count, v_booking_ids;
END;
$$ LANGUAGE plpgsql;

-- Function to get booking state history
CREATE OR REPLACE FUNCTION get_booking_state_history(p_booking_id UUID)
RETURNS TABLE(
  id UUID,
  from_state booking_status,
  to_state booking_status,
  changed_by UUID,
  changed_at TIMESTAMPTZ,
  reason TEXT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bsl.id,
    bsl.from_state,
    bsl.to_state,
    bsl.changed_by,
    bsl.changed_at,
    bsl.reason,
    bsl.metadata
  FROM booking_state_log bsl
  WHERE bsl.booking_id = p_booking_id
  ORDER BY bsl.changed_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get available rooms for a date range (used by soft hold system)
CREATE OR REPLACE FUNCTION get_available_rooms(
  p_hotel_id UUID,
  p_room_type_id UUID,
  p_check_in_date DATE,
  p_check_out_date DATE
)
RETURNS TABLE(
  room_id UUID,
  room_number TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS room_id,
    r.room_number
  FROM rooms r
  WHERE r.hotel_id = p_hotel_id
    AND r.room_type_id = p_room_type_id
    AND r.is_available = true
    AND NOT EXISTS (
      -- Check for overlapping bookings
      SELECT 1
      FROM bookings b
      WHERE b.room_id = r.id
        AND b.status IN ('pending', 'confirmed', 'checked_in')
        AND b.stay_range && daterange(p_check_in_date, p_check_out_date, '[)')
    )
  ORDER BY r.room_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically log state changes
CREATE OR REPLACE FUNCTION log_booking_state_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_state_log (
      booking_id,
      from_state,
      to_state,
      changed_at,
      reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NOW(),
      CASE
        WHEN NEW.status = 'cancelled' THEN NEW.cancellation_reason
        WHEN NEW.status = 'expired' THEN 'Soft hold expired'
        ELSE NULL
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to bookings table
CREATE TRIGGER trigger_log_booking_state_change
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION log_booking_state_change();

-- View to show bookings with soft hold status
CREATE OR REPLACE VIEW bookings_with_soft_hold_status AS
SELECT
  b.*,
  CASE
    WHEN b.status = 'pending' AND b.soft_hold_expires_at IS NOT NULL THEN
      CASE
        WHEN b.soft_hold_expires_at < NOW() THEN 'expired'
        ELSE 'active'
      END
    ELSE NULL
  END AS soft_hold_status,
  CASE
    WHEN b.status = 'pending' AND b.soft_hold_expires_at IS NOT NULL AND b.soft_hold_expires_at > NOW() THEN
      EXTRACT(EPOCH FROM (b.soft_hold_expires_at - NOW())) / 60
    ELSE NULL
  END AS soft_hold_minutes_remaining
FROM bookings b;

-- Comments
COMMENT ON COLUMN bookings.soft_hold_expires_at IS 'Timestamp when the soft hold expires for pending bookings';
COMMENT ON TABLE booking_state_log IS 'Audit log of all booking state transitions';
COMMENT ON FUNCTION expire_old_pending_bookings() IS 'Expires pending bookings with expired soft holds. Can be called via pg_cron or API endpoint.';
COMMENT ON FUNCTION get_available_rooms(UUID, UUID, DATE, DATE) IS 'Returns available rooms for a hotel/room_type/date range, excluding booked rooms';
COMMENT ON FUNCTION get_booking_state_history(UUID) IS 'Returns the complete state transition history for a booking';
COMMENT ON VIEW bookings_with_soft_hold_status IS 'Bookings with computed soft hold status and remaining time';

-- Example of how to set up pg_cron to automatically expire bookings
-- This is commented out - enable it if you have pg_cron installed
-- Run every 5 minutes to expire old pending bookings:
-- SELECT cron.schedule(
--   'expire-pending-bookings',
--   '*/5 * * * *',
--   $$SELECT expire_old_pending_bookings();$$
-- );

-- Alternative: Create an edge function trigger
-- You can call this via Supabase Edge Functions or an API route
-- Example API call:
-- POST /api/cron/expire-bookings
-- SELECT * FROM expire_old_pending_bookings();
