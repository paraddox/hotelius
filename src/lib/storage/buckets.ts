import { createClient } from '@/lib/supabase/client';

/**
 * Storage bucket names
 */
export const BUCKETS = {
  HOTEL_IMAGES: 'hotel-images',
  ROOM_IMAGES: 'room-images',
  AVATARS: 'avatars',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

/**
 * Image transformation options for Supabase Storage
 */
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'jpeg' | 'png' | 'webp';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Gets a public URL for an image in a storage bucket
 * @param bucket - The storage bucket name
 * @param path - The path to the image within the bucket
 * @param transform - Optional transformation options
 * @returns The public URL for the image
 */
export function getImageUrl(
  bucket: BucketName,
  path: string,
  transform?: ImageTransformOptions
): string {
  const supabase = createClient();

  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: transform && transform.format !== 'origin'
      ? {
          width: transform.width,
          height: transform.height,
          quality: transform.quality,
        }
      : undefined,
  });

  return data.publicUrl;
}

/**
 * Gets a thumbnail URL with standard dimensions
 * @param bucket - The storage bucket name
 * @param path - The path to the image
 * @param size - Thumbnail size preset
 * @returns URL for the thumbnail
 */
export function getThumbnailUrl(
  bucket: BucketName,
  path: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  const sizes = {
    small: { width: 200, height: 200 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 },
  };

  return getImageUrl(bucket, path, {
    ...sizes[size],
    resize: 'cover',
    format: 'webp',
    quality: 80,
  });
}

/**
 * Gets a hero image URL optimized for large displays
 * @param bucket - The storage bucket name
 * @param path - The path to the image
 * @returns URL for the hero image
 */
export function getHeroImageUrl(bucket: BucketName, path: string): string {
  return getImageUrl(bucket, path, {
    width: 1920,
    height: 1080,
    resize: 'cover',
    format: 'webp',
    quality: 85,
  });
}

/**
 * Builds the storage path for hotel images
 * @param hotelId - The hotel ID
 * @param fileName - The image filename
 * @returns The full storage path
 */
export function buildHotelImagePath(hotelId: string, fileName: string): string {
  return `${hotelId}/hotels/${fileName}`;
}

/**
 * Builds the storage path for room type images
 * @param hotelId - The hotel ID
 * @param roomTypeId - The room type ID
 * @param fileName - The image filename
 * @returns The full storage path
 */
export function buildRoomImagePath(
  hotelId: string,
  roomTypeId: string,
  fileName: string
): string {
  return `${hotelId}/room-types/${roomTypeId}/${fileName}`;
}

/**
 * Builds the storage path for user avatars
 * @param userId - The user ID
 * @param fileName - The image filename
 * @returns The full storage path
 */
export function buildAvatarPath(userId: string, fileName: string): string {
  return `${userId}/${fileName}`;
}

/**
 * Extracts the filename from a storage path
 * @param path - The full storage path
 * @returns The filename
 */
export function getFileNameFromPath(path: string): string {
  return path.split('/').pop() || '';
}

/**
 * Checks if a bucket exists and is accessible
 * @param bucket - The bucket name to check
 * @returns True if the bucket exists and is accessible
 */
export async function checkBucketAccess(bucket: BucketName): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(bucket).list('', {
      limit: 1,
    });

    return !error;
  } catch {
    return false;
  }
}

/**
 * Lists all files in a bucket path
 * @param bucket - The bucket name
 * @param path - The path within the bucket
 * @param limit - Maximum number of files to return
 * @returns Array of file metadata
 */
export async function listImages(
  bucket: BucketName,
  path: string,
  limit: number = 100
) {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).list(path, {
    limit,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    throw new Error(`Failed to list images: ${error.message}`);
  }

  return data;
}

/**
 * Gets the size of a file in the bucket
 * @param bucket - The bucket name
 * @param path - The path to the file
 * @returns The file size in bytes, or null if not found
 */
export async function getFileSize(
  bucket: BucketName,
  path: string
): Promise<number | null> {
  try {
    const supabase = createClient();
    const pathParts = path.split('/');
    const fileName = pathParts.pop();
    const folder = pathParts.join('/');

    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      search: fileName,
    });

    if (error || !data || data.length === 0) {
      return null;
    }

    const file = data.find((f) => f.name === fileName);
    return file?.metadata?.size || null;
  } catch {
    return null;
  }
}

/**
 * Copies an image from one path to another within the same bucket
 * @param bucket - The bucket name
 * @param fromPath - Source path
 * @param toPath - Destination path
 */
export async function copyImage(
  bucket: BucketName,
  fromPath: string,
  toPath: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath);

  if (error) {
    throw new Error(`Failed to copy image: ${error.message}`);
  }
}

/**
 * Moves an image from one path to another within the same bucket
 * @param bucket - The bucket name
 * @param fromPath - Source path
 * @param toPath - Destination path
 */
export async function moveImage(
  bucket: BucketName,
  fromPath: string,
  toPath: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath);

  if (error) {
    throw new Error(`Failed to move image: ${error.message}`);
  }
}
