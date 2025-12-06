-- Migration: 007_bookings.sql
-- Description: Create bookings table with EXCLUDE constraint for preventing double bookings
-- Dependencies: 005_rooms.sql, 003_profiles.sql

-- Booking status enum
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
  'pending',
  'authorized',
  'paid',
  'partially_refunded',
  'refunded',
  'failed'
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Hotel & room association
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,

  -- Guest association
  guest_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Stay dates
  stay_range DATERANGE NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,

  -- Actual check-in/out times
  actual_check_in_at TIMESTAMPTZ,
  actual_check_out_at TIMESTAMPTZ,

  -- Occupancy
  num_adults INTEGER NOT NULL DEFAULT 1,
  num_children INTEGER NOT NULL DEFAULT 0,

  -- Status
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',

  -- Pricing
  total_price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_cents INTEGER NOT NULL DEFAULT 0,

  -- Applied rate plan (if any)
  rate_plan_id UUID REFERENCES rate_plans(id) ON DELETE SET NULL,

  -- Payment details
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Special requests & notes
  special_requests TEXT,
  internal_notes TEXT,

  -- Booking source
  booking_source TEXT DEFAULT 'direct', -- e.g., 'direct', 'booking_com', 'airbnb', 'phone'
  confirmation_code TEXT UNIQUE NOT NULL,

  -- Constraints
  CONSTRAINT bookings_dates_valid CHECK (check_out_date > check_in_date),
  CONSTRAINT bookings_stay_range_matches_dates CHECK (
    stay_range = daterange(check_in_date, check_out_date, '[)')
  ),
  CONSTRAINT bookings_occupancy_positive CHECK (num_adults > 0 AND num_children >= 0),
  CONSTRAINT bookings_price_positive CHECK (total_price_cents >= 0),
  CONSTRAINT bookings_tax_non_negative CHECK (tax_cents >= 0),
  CONSTRAINT bookings_cancellation_valid CHECK (
    (status = 'cancelled' AND cancelled_at IS NOT NULL) OR
    (status != 'cancelled' AND cancelled_at IS NULL)
  ),
  CONSTRAINT bookings_actual_checkin_valid CHECK (
    (status IN ('checked_in', 'checked_out') AND actual_check_in_at IS NOT NULL) OR
    (status NOT IN ('checked_in', 'checked_out'))
  ),
  CONSTRAINT bookings_actual_checkout_valid CHECK (
    (status = 'checked_out' AND actual_check_out_at IS NOT NULL) OR
    (status != 'checked_out')
  )
);

-- CRITICAL: Exclude constraint to prevent double bookings
-- This ensures no two bookings can overlap for the same room
ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    room_id WITH =,
    stay_range WITH &&
  )
  WHERE (status NOT IN ('cancelled', 'no_show'));

-- Indexes
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_room_type_id ON bookings(room_type_id);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id) WHERE guest_id IS NOT NULL;
CREATE INDEX idx_bookings_status ON bookings(hotel_id, status);
CREATE INDEX idx_bookings_payment_status ON bookings(hotel_id, payment_status);
CREATE INDEX idx_bookings_stay_range ON bookings USING gist(stay_range);
CREATE INDEX idx_bookings_check_in_date ON bookings(hotel_id, check_in_date);
CREATE INDEX idx_bookings_check_out_date ON bookings(hotel_id, check_out_date);
CREATE INDEX idx_bookings_created_at ON bookings(hotel_id, created_at DESC);
CREATE INDEX idx_bookings_confirmation_code ON bookings(confirmation_code);
CREATE INDEX idx_bookings_stripe_payment_intent ON bookings(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Updated at trigger
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Generate confirmation code
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM bookings WHERE confirmation_code = code) INTO exists;

    EXIT WHEN NOT exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate confirmation code
CREATE OR REPLACE FUNCTION set_booking_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_code IS NULL OR NEW.confirmation_code = '' THEN
    NEW.confirmation_code = generate_confirmation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_bookings_confirmation_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_confirmation_code();

-- Sync stay_range with check-in/out dates
CREATE OR REPLACE FUNCTION sync_booking_stay_range()
RETURNS TRIGGER AS $$
BEGIN
  NEW.stay_range = daterange(NEW.check_in_date, NEW.check_out_date, '[)');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_bookings_stay_range
  BEFORE INSERT OR UPDATE OF check_in_date, check_out_date ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_booking_stay_range();

-- Validate booking consistency with hotel
CREATE OR REPLACE FUNCTION validate_booking_hotel_consistency()
RETURNS TRIGGER AS $$
DECLARE
  room_hotel_id UUID;
  room_type_hotel_id UUID;
BEGIN
  -- Check room belongs to hotel
  SELECT hotel_id INTO room_hotel_id
  FROM rooms
  WHERE id = NEW.room_id;

  IF room_hotel_id != NEW.hotel_id THEN
    RAISE EXCEPTION 'Room must belong to the booking hotel';
  END IF;

  -- Check room_type belongs to hotel
  SELECT hotel_id INTO room_type_hotel_id
  FROM room_types
  WHERE id = NEW.room_type_id;

  IF room_type_hotel_id != NEW.hotel_id THEN
    RAISE EXCEPTION 'Room type must belong to the booking hotel';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_booking_hotel_consistency_trigger
  BEFORE INSERT OR UPDATE OF hotel_id, room_id, room_type_id ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_booking_hotel_consistency();

-- Comments
COMMENT ON TABLE bookings IS 'Hotel room bookings with double-booking prevention';
COMMENT ON COLUMN bookings.stay_range IS 'Date range of the stay (half-open interval [check_in, check_out))';
COMMENT ON COLUMN bookings.confirmation_code IS 'Unique booking confirmation code';
COMMENT ON CONSTRAINT bookings_no_overlap ON bookings IS 'EXCLUDE constraint preventing overlapping bookings for same room using GiST index';
