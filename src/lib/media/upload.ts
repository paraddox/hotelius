import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'hotel-media';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadOptions {
  onProgress?: (progress: number) => void;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  fileSize: number;
  mimeType: string;
}

export interface UploadResult {
  url: string;
  storagePath: string;
  metadata: ImageMetadata;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'jpeg' | 'png' | 'webp';
}

/**
 * Validates an image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Gets image dimensions from a file
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Generates a unique filename
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = originalName
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 30);

  return `${safeName}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Builds the storage path for hotel or room type photos
 */
export function buildStoragePath(
  hotelId: string,
  fileName: string,
  type: 'hotel' | 'room-type',
  roomTypeId?: string
): string {
  if (type === 'hotel') {
    return `${hotelId}/hotels/${fileName}`;
  } else {
    if (!roomTypeId) {
      throw new Error('roomTypeId is required for room-type photos');
    }
    return `${hotelId}/room-types/${roomTypeId}/${fileName}`;
  }
}

/**
 * Uploads an image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  hotelId: string,
  type: 'hotel' | 'room-type',
  roomTypeId?: string,
  options?: UploadOptions
): Promise<UploadResult> {
  const supabase = createClient();

  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get image dimensions
  const dimensions = await getImageDimensions(file);

  // Generate unique filename
  const fileName = generateUniqueFileName(file.name);

  // Build storage path
  const storagePath = buildStoragePath(hotelId, fileName, type, roomTypeId);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return {
    url: urlData.publicUrl,
    storagePath,
    metadata: {
      width: dimensions.width,
      height: dimensions.height,
      fileSize: file.size,
      mimeType: file.type,
    },
  };
}

/**
 * Deletes an image from Supabase Storage
 */
export async function deleteImage(storagePath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Gets a public URL for an image with optional transformations
 */
export function getImageUrl(
  storagePath: string,
  options?: ImageTransformOptions
): string {
  const supabase = createClient();

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath, {
      transform: options ? {
        width: options.width,
        height: options.height,
        quality: options.quality,
        format: options.format,
      } : undefined,
    });

  return data.publicUrl;
}

/**
 * Uploads multiple images in parallel
 */
export async function uploadMultipleImages(
  files: File[],
  hotelId: string,
  type: 'hotel' | 'room-type',
  roomTypeId?: string,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  let completed = 0;

  for (const file of files) {
    try {
      const result = await uploadImage(file, hotelId, type, roomTypeId);
      results.push(result);
      completed++;
      onProgress?.(completed, files.length);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      // Continue with other files
    }
  }

  return results;
}
