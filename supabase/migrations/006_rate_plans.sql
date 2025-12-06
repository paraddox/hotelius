-- Migration: 006_rate_plans.sql
-- Description: Create rate plans for dynamic pricing
-- Dependencies: 004_room_types.sql

-- Rate plans table
CREATE TABLE rate_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Hotel & room type association
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,

  -- Validity period
  validity_range DATERANGE NOT NULL,

  -- Pricing
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Priority (higher priority rate plans override lower ones)
  priority INTEGER NOT NULL DEFAULT 0,

  -- Restrictions
  min_stay_nights INTEGER DEFAULT 1,
  max_stay_nights INTEGER,
  min_advance_booking_days INTEGER DEFAULT 0,
  max_advance_booking_days INTEGER,

  -- Days of week applicability (0 = Sunday, 6 = Saturday)
  applicable_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],

  -- Refund & cancellation
  is_refundable BOOLEAN NOT NULL DEFAULT true,
  cancellation_deadline_hours INTEGER DEFAULT 24,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Constraints
  CONSTRAINT rate_plans_unique_code_per_hotel UNIQUE (hotel_id, code),
  CONSTRAINT rate_plans_price_positive CHECK (price_cents > 0),
  CONSTRAINT rate_plans_stay_valid CHECK (
    min_stay_nights >= 1 AND
    (max_stay_nights IS NULL OR max_stay_nights >= min_stay_nights)
  ),
  CONSTRAINT rate_plans_advance_booking_valid CHECK (
    min_advance_booking_days >= 0 AND
    (max_advance_booking_days IS NULL OR max_advance_booking_days >= min_advance_booking_days)
  ),
  CONSTRAINT rate_plans_applicable_days_valid CHECK (
    applicable_days <@ ARRAY[0,1,2,3,4,5,6] AND
    array_length(applicable_days, 1) > 0
  ),
  CONSTRAINT rate_plans_cancellation_valid CHECK (
    (is_refundable = false AND cancellation_deadline_hours IS NULL) OR
    (is_refundable = true AND cancellation_deadline_hours >= 0)
  )
);

-- Indexes
CREATE INDEX idx_rate_plans_hotel_id ON rate_plans(hotel_id);
CREATE INDEX idx_rate_plans_room_type_id ON rate_plans(room_type_id);
CREATE INDEX idx_rate_plans_validity_range ON rate_plans USING gist(validity_range);
CREATE INDEX idx_rate_plans_is_active ON rate_plans(hotel_id, is_active) WHERE is_active = true;
CREATE INDEX idx_rate_plans_priority ON rate_plans(hotel_id, priority DESC);
CREATE INDEX idx_rate_plans_code ON rate_plans(hotel_id, code);

-- Updated at trigger
CREATE TRIGGER update_rate_plans_updated_at
  BEFORE UPDATE ON rate_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure rate plan belongs to same hotel as room_type
CREATE OR REPLACE FUNCTION validate_rate_plan_hotel_consistency()
RETURNS TRIGGER AS $$
DECLARE
  room_type_hotel_id UUID;
BEGIN
  SELECT hotel_id INTO room_type_hotel_id
  FROM room_types
  WHERE id = NEW.room_type_id;

  IF room_type_hotel_id != NEW.hotel_id THEN
    RAISE EXCEPTION 'Rate plan room type must belong to the same hotel';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_rate_plan_hotel_consistency_trigger
  BEFORE INSERT OR UPDATE OF hotel_id, room_type_id ON rate_plans
  FOR EACH ROW
  EXECUTE FUNCTION validate_rate_plan_hotel_consistency();

-- Comments
COMMENT ON TABLE rate_plans IS 'Dynamic pricing rules for room types';
COMMENT ON COLUMN rate_plans.validity_range IS 'Date range when this rate plan is valid';
COMMENT ON COLUMN rate_plans.priority IS 'Higher priority plans override lower ones when multiple match';
COMMENT ON COLUMN rate_plans.applicable_days IS 'Days of week when rate applies (0=Sunday, 6=Saturday)';
COMMENT ON COLUMN rate_plans.min_advance_booking_days IS 'Minimum days before check-in to book';
COMMENT ON COLUMN rate_plans.max_advance_booking_days IS 'Maximum days before check-in to book';
