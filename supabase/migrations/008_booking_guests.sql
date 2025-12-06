-- Migration: 008_booking_guests.sql
-- Description: Create booking guests table for detailed guest information
-- Dependencies: 007_bookings.sql

-- Guest type enum
CREATE TYPE guest_type AS ENUM (
  'primary',
  'additional',
  'child'
);

-- Booking guests table
CREATE TABLE booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Booking association
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Guest type
  guest_type guest_type NOT NULL DEFAULT 'primary',

  -- Personal information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Identification
  id_type TEXT, -- e.g., 'passport', 'drivers_license', 'national_id'
  id_number TEXT,
  id_country TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,

  -- Additional info
  date_of_birth DATE,
  nationality TEXT,

  -- Special needs
  special_needs TEXT,

  -- Constraints
  CONSTRAINT booking_guests_email_format CHECK (
    email IS NULL OR
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
  ),
  CONSTRAINT booking_guests_primary_has_contact CHECK (
    guest_type != 'primary' OR (email IS NOT NULL AND phone IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_booking_guests_booking_id ON booking_guests(booking_id);
CREATE INDEX idx_booking_guests_type ON booking_guests(booking_id, guest_type);
CREATE INDEX idx_booking_guests_email ON booking_guests(email) WHERE email IS NOT NULL;

-- Updated at trigger
CREATE TRIGGER update_booking_guests_updated_at
  BEFORE UPDATE ON booking_guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one primary guest per booking
CREATE UNIQUE INDEX idx_booking_guests_one_primary
  ON booking_guests(booking_id)
  WHERE guest_type = 'primary';

-- Comments
COMMENT ON TABLE booking_guests IS 'Detailed guest information for bookings';
COMMENT ON COLUMN booking_guests.guest_type IS 'Type of guest: primary (main contact), additional adult, or child';
COMMENT ON COLUMN booking_guests.id_type IS 'Type of identification document';
