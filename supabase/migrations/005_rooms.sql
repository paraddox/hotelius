-- Migration: 005_rooms.sql
-- Description: Create physical rooms table
-- Dependencies: 004_room_types.sql

-- Room status enum
CREATE TYPE room_status AS ENUM (
  'available',
  'occupied',
  'maintenance',
  'out_of_service'
);

-- Rooms table (physical room instances)
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Hotel & room type association
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,

  -- Room identification
  room_number TEXT NOT NULL,
  floor INTEGER,
  building TEXT,

  -- Status
  status room_status NOT NULL DEFAULT 'available',

  -- Notes (for maintenance, special features, etc.)
  notes TEXT,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Constraints
  CONSTRAINT rooms_unique_number_per_hotel UNIQUE (hotel_id, room_number),
  CONSTRAINT rooms_floor_valid CHECK (floor IS NULL OR floor >= 0)
);

-- Indexes
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_room_type_id ON rooms(room_type_id);
CREATE INDEX idx_rooms_status ON rooms(hotel_id, status);
CREATE INDEX idx_rooms_is_active ON rooms(hotel_id, is_active) WHERE is_active = true;
CREATE INDEX idx_rooms_available ON rooms(hotel_id, room_type_id)
  WHERE status = 'available' AND is_active = true;

-- Updated at trigger
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure room belongs to same hotel as room_type
CREATE OR REPLACE FUNCTION validate_room_hotel_consistency()
RETURNS TRIGGER AS $$
DECLARE
  room_type_hotel_id UUID;
BEGIN
  SELECT hotel_id INTO room_type_hotel_id
  FROM room_types
  WHERE id = NEW.room_type_id;

  IF room_type_hotel_id != NEW.hotel_id THEN
    RAISE EXCEPTION 'Room type must belong to the same hotel as the room';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_room_hotel_consistency_trigger
  BEFORE INSERT OR UPDATE OF hotel_id, room_type_id ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION validate_room_hotel_consistency();

-- Comments
COMMENT ON TABLE rooms IS 'Physical room instances linked to room types';
COMMENT ON COLUMN rooms.room_number IS 'Unique room number within hotel (e.g., "101", "A-201")';
COMMENT ON COLUMN rooms.status IS 'Current operational status of the room';
