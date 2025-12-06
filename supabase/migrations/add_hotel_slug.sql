-- Migration: Add slug column to hotels table for multi-tenant routing
-- Description: Adds a unique slug field to enable URL-based hotel identification
-- Author: System
-- Date: 2025-12-06

-- Add slug column to hotels table
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index for faster lookups and ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug);

-- Optionally generate slugs for existing hotels (if any)
-- This creates a simple slug from the hotel name
-- You may want to customize this logic based on your needs
DO $$
DECLARE
  hotel_record RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER;
BEGIN
  FOR hotel_record IN SELECT id, name FROM hotels WHERE slug IS NULL LOOP
    -- Generate base slug from name
    base_slug := LOWER(REGEXP_REPLACE(hotel_record.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);

    -- Ensure slug is unique by appending counter if needed
    final_slug := base_slug;
    counter := 1;

    WHILE EXISTS (SELECT 1 FROM hotels WHERE slug = final_slug AND id != hotel_record.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;

    -- Update the hotel with the generated slug
    UPDATE hotels SET slug = final_slug WHERE id = hotel_record.id;
  END LOOP;
END $$;

-- Make slug NOT NULL after generating values for existing records
ALTER TABLE hotels ALTER COLUMN slug SET NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN hotels.slug IS 'URL-friendly unique identifier for the hotel, used in public booking engine routes';

-- Create trigger to automatically generate slug from name on insert
-- This ensures new hotels always have a slug
CREATE OR REPLACE FUNCTION generate_hotel_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER;
BEGIN
  -- Only generate if slug is not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Generate base slug from name
    base_slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);

    -- Ensure slug is unique
    final_slug := base_slug;
    counter := 1;

    WHILE EXISTS (SELECT 1 FROM hotels WHERE slug = final_slug AND id != NEW.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;

    NEW.slug := final_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS hotel_slug_trigger ON hotels;
CREATE TRIGGER hotel_slug_trigger
  BEFORE INSERT OR UPDATE OF name ON hotels
  FOR EACH ROW
  EXECUTE FUNCTION generate_hotel_slug();
