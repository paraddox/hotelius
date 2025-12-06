-- Migration: 009_media.sql
-- Description: Create media tables for hotel and room type photos
-- Dependencies: 002_hotels.sql, 004_room_types.sql

-- Hotel photos table
CREATE TABLE hotel_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Hotel association
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,

  -- Photo details
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  title TEXT,
  alt_text TEXT,
  caption JSONB, -- Internationalized captions

  -- Metadata
  width INTEGER,
  height INTEGER,
  file_size_bytes INTEGER,
  mime_type TEXT,

  -- Ordering & categorization
  sort_order INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'general', -- e.g., 'exterior', 'lobby', 'amenities', 'dining', 'general'

  -- Status
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Constraints
  CONSTRAINT hotel_photos_url_format CHECK (url ~* '^https?://'),
  CONSTRAINT hotel_photos_dimensions_valid CHECK (
    (width IS NULL AND height IS NULL) OR
    (width > 0 AND height > 0)
  ),
  CONSTRAINT hotel_photos_file_size_positive CHECK (file_size_bytes IS NULL OR file_size_bytes > 0)
);

-- Room type photos table
CREATE TABLE room_type_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Room type association
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,

  -- Photo details
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  title TEXT,
  alt_text TEXT,
  caption JSONB, -- Internationalized captions

  -- Metadata
  width INTEGER,
  height INTEGER,
  file_size_bytes INTEGER,
  mime_type TEXT,

  -- Ordering & categorization
  sort_order INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'general', -- e.g., 'room', 'bathroom', 'view', 'amenities', 'general'

  -- Status
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Constraints
  CONSTRAINT room_type_photos_url_format CHECK (url ~* '^https?://'),
  CONSTRAINT room_type_photos_dimensions_valid CHECK (
    (width IS NULL AND height IS NULL) OR
    (width > 0 AND height > 0)
  ),
  CONSTRAINT room_type_photos_file_size_positive CHECK (file_size_bytes IS NULL OR file_size_bytes > 0)
);

-- Indexes for hotel_photos
CREATE INDEX idx_hotel_photos_hotel_id ON hotel_photos(hotel_id);
CREATE INDEX idx_hotel_photos_sort_order ON hotel_photos(hotel_id, sort_order);
CREATE INDEX idx_hotel_photos_category ON hotel_photos(hotel_id, category);
CREATE INDEX idx_hotel_photos_is_featured ON hotel_photos(hotel_id, is_featured) WHERE is_featured = true;
CREATE INDEX idx_hotel_photos_is_active ON hotel_photos(hotel_id, is_active) WHERE is_active = true;

-- Indexes for room_type_photos
CREATE INDEX idx_room_type_photos_room_type_id ON room_type_photos(room_type_id);
CREATE INDEX idx_room_type_photos_sort_order ON room_type_photos(room_type_id, sort_order);
CREATE INDEX idx_room_type_photos_category ON room_type_photos(room_type_id, category);
CREATE INDEX idx_room_type_photos_is_featured ON room_type_photos(room_type_id, is_featured) WHERE is_featured = true;
CREATE INDEX idx_room_type_photos_is_active ON room_type_photos(room_type_id, is_active) WHERE is_active = true;

-- Updated at triggers
CREATE TRIGGER update_hotel_photos_updated_at
  BEFORE UPDATE ON hotel_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_type_photos_updated_at
  BEFORE UPDATE ON room_type_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE hotel_photos IS 'Photo gallery for hotels';
COMMENT ON TABLE room_type_photos IS 'Photo gallery for room types';
COMMENT ON COLUMN hotel_photos.caption IS 'Internationalized photo caption';
COMMENT ON COLUMN room_type_photos.caption IS 'Internationalized photo caption';
COMMENT ON COLUMN hotel_photos.storage_path IS 'Path in storage bucket (e.g., Supabase Storage)';
COMMENT ON COLUMN room_type_photos.storage_path IS 'Path in storage bucket (e.g., Supabase Storage)';
