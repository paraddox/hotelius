-- Migration: 004_room_types.sql
-- Description: Create room types with internationalization support
-- Dependencies: 002_hotels.sql

-- Room types table
CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Hotel association
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,

  -- Basic info (with i18n support)
  name JSONB NOT NULL DEFAULT '{
    "en": "Standard Room"
  }'::jsonb,
  description JSONB NOT NULL DEFAULT '{
    "en": ""
  }'::jsonb,

  -- Fallback non-i18n fields for queries
  name_default TEXT NOT NULL,

  -- Pricing
  base_price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Occupancy
  max_adults INTEGER NOT NULL DEFAULT 2,
  max_children INTEGER NOT NULL DEFAULT 0,
  max_occupancy INTEGER NOT NULL DEFAULT 2,

  -- Room details
  size_sqm NUMERIC(6, 2),
  bed_configuration JSONB DEFAULT '[]'::jsonb, -- e.g., [{"type": "king", "count": 1}, {"type": "single", "count": 2}]

  -- Amenities
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g., ["wifi", "tv", "minibar", "safe", "balcony"]

  -- Metadata
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Constraints
  CONSTRAINT room_types_base_price_positive CHECK (base_price_cents > 0),
  CONSTRAINT room_types_occupancy_valid CHECK (
    max_adults > 0 AND
    max_children >= 0 AND
    max_occupancy >= max_adults AND
    max_occupancy <= (max_adults + max_children)
  ),
  CONSTRAINT room_types_size_positive CHECK (size_sqm IS NULL OR size_sqm > 0),
  CONSTRAINT room_types_name_has_default CHECK (name ? 'en' OR name ? 'default')
);

-- Indexes
CREATE INDEX idx_room_types_hotel_id ON room_types(hotel_id);
CREATE INDEX idx_room_types_is_active ON room_types(hotel_id, is_active) WHERE is_active = true;
CREATE INDEX idx_room_types_sort_order ON room_types(hotel_id, sort_order);
CREATE INDEX idx_room_types_price ON room_types(hotel_id, base_price_cents);
CREATE INDEX idx_room_types_name_gin ON room_types USING gin(name jsonb_path_ops);

-- Updated at trigger
CREATE TRIGGER update_room_types_updated_at
  BEFORE UPDATE ON room_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sync name_default from JSONB
CREATE OR REPLACE FUNCTION sync_room_type_name_default()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name_default = COALESCE(
    NEW.name->>'en',
    NEW.name->>'default',
    (SELECT value FROM jsonb_each_text(NEW.name) LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_room_types_name_default
  BEFORE INSERT OR UPDATE OF name ON room_types
  FOR EACH ROW
  EXECUTE FUNCTION sync_room_type_name_default();

-- Comments
COMMENT ON TABLE room_types IS 'Room type definitions with i18n support for names and descriptions';
COMMENT ON COLUMN room_types.name IS 'Internationalized room type name (JSONB with language keys)';
COMMENT ON COLUMN room_types.description IS 'Internationalized room type description';
COMMENT ON COLUMN room_types.base_price_cents IS 'Base price in cents to avoid floating point issues';
COMMENT ON COLUMN room_types.amenities IS 'Array of amenity identifiers';
COMMENT ON COLUMN room_types.bed_configuration IS 'Bed types and counts';
