-- Migration: 015_closed_dates.sql
-- Description: Create closed dates table for blocking specific dates from booking
-- Dependencies: 002_hotels.sql, 004_room_types.sql

-- Closed dates table (for blackout dates)
CREATE TABLE closed_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Hotel & optional room type association
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id UUID REFERENCES room_types(id) ON DELETE CASCADE, -- NULL means all room types

  -- Date range when rooms are closed
  closed_range DATERANGE NOT NULL,

  -- Reason for closure
  reason TEXT,
  notes TEXT,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Constraints
  CONSTRAINT closed_dates_valid_range CHECK (
    upper(closed_range) > lower(closed_range)
  )
);

-- Indexes for fast lookups
CREATE INDEX idx_closed_dates_hotel_id ON closed_dates(hotel_id);
CREATE INDEX idx_closed_dates_room_type_id ON closed_dates(room_type_id) WHERE room_type_id IS NOT NULL;
CREATE INDEX idx_closed_dates_range ON closed_dates USING gist(closed_range);
CREATE INDEX idx_closed_dates_hotel_range ON closed_dates USING gist(hotel_id, closed_range);
CREATE INDEX idx_closed_dates_is_active ON closed_dates(hotel_id, is_active) WHERE is_active = true;

-- Updated at trigger
CREATE TRIGGER update_closed_dates_updated_at
  BEFORE UPDATE ON closed_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure closed date belongs to same hotel as room_type
CREATE OR REPLACE FUNCTION validate_closed_date_hotel_consistency()
RETURNS TRIGGER AS $$
DECLARE
  room_type_hotel_id UUID;
BEGIN
  IF NEW.room_type_id IS NOT NULL THEN
    SELECT hotel_id INTO room_type_hotel_id
    FROM room_types
    WHERE id = NEW.room_type_id;

    IF room_type_hotel_id != NEW.hotel_id THEN
      RAISE EXCEPTION 'Closed date room type must belong to the same hotel';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_closed_date_hotel_consistency_trigger
  BEFORE INSERT OR UPDATE OF hotel_id, room_type_id ON closed_dates
  FOR EACH ROW
  EXECUTE FUNCTION validate_closed_date_hotel_consistency();

-- Comments
COMMENT ON TABLE closed_dates IS 'Dates when rooms are closed for booking (blackout dates, maintenance, etc.)';
COMMENT ON COLUMN closed_dates.closed_range IS 'Date range when rooms cannot be booked';
COMMENT ON COLUMN closed_dates.room_type_id IS 'Optional room type - if NULL, applies to all room types in the hotel';
