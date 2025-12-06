-- Migration: 013_storage_buckets.sql
-- Description: Create storage buckets and policies for hotel/room media
-- Dependencies: 002_hotels.sql, 004_room_types.sql

-- Create the hotel-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hotel-media',
  'hotel-media',
  true, -- Public bucket for read access
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for hotel-media bucket

-- 1. Public read access - anyone can view photos
CREATE POLICY "Public read access for hotel media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hotel-media');

-- 2. Authenticated users can upload to their hotel folders
CREATE POLICY "Authenticated users can upload hotel media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hotel-media' AND
  -- Ensure user owns the hotel (path format: {hotel_id}/hotels/* or {hotel_id}/room-types/*)
  EXISTS (
    SELECT 1 FROM hotels
    WHERE id::text = split_part(name, '/', 1)
    AND owner_id = auth.uid()
  )
);

-- 3. Authenticated users can update their own hotel media
CREATE POLICY "Authenticated users can update hotel media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hotel-media' AND
  EXISTS (
    SELECT 1 FROM hotels
    WHERE id::text = split_part(name, '/', 1)
    AND owner_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'hotel-media' AND
  EXISTS (
    SELECT 1 FROM hotels
    WHERE id::text = split_part(name, '/', 1)
    AND owner_id = auth.uid()
  )
);

-- 4. Authenticated users can delete their own hotel media
CREATE POLICY "Authenticated users can delete hotel media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'hotel-media' AND
  EXISTS (
    SELECT 1 FROM hotels
    WHERE id::text = split_part(name, '/', 1)
    AND owner_id = auth.uid()
  )
);

-- Comments
COMMENT ON POLICY "Public read access for hotel media" ON storage.objects
  IS 'Allow public read access to all hotel media files';
COMMENT ON POLICY "Authenticated users can upload hotel media" ON storage.objects
  IS 'Allow authenticated hotel owners to upload media to their hotel folders';
COMMENT ON POLICY "Authenticated users can update hotel media" ON storage.objects
  IS 'Allow authenticated hotel owners to update their hotel media';
COMMENT ON POLICY "Authenticated users can delete hotel media" ON storage.objects
  IS 'Allow authenticated hotel owners to delete their hotel media';
