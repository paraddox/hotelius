-- Migration: 014_soft_holds_and_state_log.sql
-- Description: Add soft hold support and booking state change logging
-- Dependencies: 007_bookings.sql

-- Add soft_hold_expires_at column to bookings table
ALTER TABLE bookings
  ADD COLUMN soft_hold_expires_at TIMESTAMPTZ;

-- Create index for efficient cleanup of expired holds
CREATE INDEX idx_bookings_soft_hold_expires ON bookings(soft_hold_expires_at)
  WHERE status = 'pending' AND soft_hold_expires_at IS NOT NULL;

-- Add 'expired' to booking_status enum if not already present
-- Note: We need to check if 'expired' already exists since enums can't be modified easily
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'expired'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'booking_status')
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'expired';
  END IF;
END$$;

-- Create booking state change log table
CREATE TABLE booking_state_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Booking reference
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- State transition
  from_state booking_status NOT NULL,
  to_state booking_status NOT NULL,

  -- Metadata
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT,

  -- Audit trail
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for booking_state_log
CREATE INDEX idx_booking_state_log_booking_id ON booking_state_log(booking_id, changed_at DESC);
CREATE INDEX idx_booking_state_log_changed_at ON booking_state_log(changed_at DESC);
CREATE INDEX idx_booking_state_log_changed_by ON booking_state_log(changed_by)
  WHERE changed_by IS NOT NULL;
CREATE INDEX idx_booking_state_log_to_state ON booking_state_log(to_state, changed_at DESC);

-- Function to get available rooms for a date range
-- Returns rooms that don't have any overlapping bookings
CREATE OR REPLACE FUNCTION get_available_rooms(
  p_hotel_id UUID,
  p_room_type_id UUID,
  p_check_in_date DATE,
  p_check_out_date DATE
)
RETURNS TABLE (
  room_id UUID,
  room_number TEXT,
  floor INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS room_id,
    r.room_number,
    r.floor
  FROM rooms r
  WHERE r.hotel_id = p_hotel_id
    AND r.room_type_id = p_room_type_id
    AND r.is_active = true
    AND r.status = 'available'
    AND NOT EXISTS (
      -- Check for overlapping bookings
      SELECT 1
      FROM bookings b
      WHERE b.room_id = r.id
        AND b.status NOT IN ('cancelled', 'no_show', 'expired')
        AND daterange(p_check_in_date, p_check_out_date, '[)') && b.stay_range
    )
  ORDER BY r.room_number;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to count available rooms of a type for a date range
CREATE OR REPLACE FUNCTION count_available_rooms(
  p_hotel_id UUID,
  p_room_type_id UUID,
  p_check_in_date DATE,
  p_check_out_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  available_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO available_count
  FROM get_available_rooms(
    p_hotel_id,
    p_room_type_id,
    p_check_in_date,
    p_check_out_date
  );

  RETURN available_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if a specific room is available
CREATE OR REPLACE FUNCTION is_room_available(
  p_room_id UUID,
  p_check_in_date DATE,
  p_check_out_date DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  is_available BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.room_id = p_room_id
      AND b.status NOT IN ('cancelled', 'no_show', 'expired')
      AND daterange(p_check_in_date, p_check_out_date, '[)') && b.stay_range
  ) INTO is_available;

  RETURN is_available;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get occupancy statistics for a date range
CREATE OR REPLACE FUNCTION get_occupancy_stats(
  p_hotel_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date DATE,
  total_rooms INTEGER,
  occupied_rooms INTEGER,
  available_rooms INTEGER,
  occupancy_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_start_date, p_end_date - 1, '1 day'::interval)::date AS date
  ),
  total_rooms_count AS (
    SELECT COUNT(*)::INTEGER AS total
    FROM rooms
    WHERE hotel_id = p_hotel_id
      AND is_active = true
      AND status = 'available'
  ),
  daily_occupancy AS (
    SELECT
      ds.date,
      COUNT(b.id)::INTEGER AS occupied
    FROM date_series ds
    LEFT JOIN bookings b ON (
      b.hotel_id = p_hotel_id
      AND b.status NOT IN ('cancelled', 'no_show', 'expired')
      AND ds.date >= b.check_in_date
      AND ds.date < b.check_out_date
    )
    GROUP BY ds.date
  )
  SELECT
    do.date,
    trc.total AS total_rooms,
    do.occupied AS occupied_rooms,
    (trc.total - do.occupied) AS available_rooms,
    CASE
      WHEN trc.total > 0 THEN ROUND((do.occupied::NUMERIC / trc.total::NUMERIC) * 100, 2)
      ELSE 0
    END AS occupancy_rate
  FROM daily_occupancy do
  CROSS JOIN total_rooms_count trc
  ORDER BY do.date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comments
COMMENT ON COLUMN bookings.soft_hold_expires_at IS 'Expiration timestamp for soft holds on pending bookings';
COMMENT ON TABLE booking_state_log IS 'Audit log of all booking state transitions';
COMMENT ON FUNCTION get_available_rooms IS 'Returns list of available rooms for a specific room type and date range';
COMMENT ON FUNCTION count_available_rooms IS 'Returns count of available rooms for a specific room type and date range';
COMMENT ON FUNCTION is_room_available IS 'Checks if a specific room is available for a date range';
COMMENT ON FUNCTION get_occupancy_stats IS 'Returns daily occupancy statistics for a hotel over a date range';
