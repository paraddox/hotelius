import { createClient } from '@/lib/supabase/client';

/**
 * Uploads an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket (e.g., 'hotels/123/image.jpg')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  const supabase = createClient();

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Deletes an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path to the file to delete
 */
export async function deleteImage(bucket: string, path: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Gets a signed URL for private files (valid for 1 hour)
 * @param bucket - The storage bucket name
 * @param path - The path to the file
 * @returns A signed URL valid for 1 hour
 */
export async function getSignedUrl(bucket: string, path: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // 1 hour

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Resizes an image to fit within max dimensions while maintaining aspect ratio
 * @param file - The image file to resize
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @returns A Blob containing the resized image
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas size and draw image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        file.type,
        0.9 // Quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validates image file size and type
 * @param file - The file to validate
 * @param maxSize - Maximum file size in bytes
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 */
export function validateImage(
  file: File,
  maxSize: number = 5 * 1024 * 1024, // 5MB default
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Gets image dimensions from a file
 * @param file - The image file
 * @returns Width and height in pixels
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
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
 * @param originalName - The original filename
 * @returns A unique filename with timestamp and random string
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
 * Uploads multiple images with progress tracking
 * @param files - Array of files to upload
 * @param bucket - Storage bucket name
 * @param pathPrefix - Prefix for all file paths
 * @param onProgress - Callback for progress updates (completed, total)
 * @returns Array of uploaded file URLs
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string,
  pathPrefix: string,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  let completed = 0;

  for (const file of files) {
    try {
      const fileName = generateUniqueFileName(file.name);
      const path = `${pathPrefix}/${fileName}`;
      const url = await uploadImage(file, bucket, path);
      urls.push(url);
      completed++;
      onProgress?.(completed, files.length);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      // Continue with other files
    }
  }

  return urls;
}

/**
 * Creates a thumbnail from an image file
 * @param file - The image file
 * @param size - Thumbnail size (square)
 * @returns A Blob containing the thumbnail
 */
export async function createThumbnail(file: File, size: number = 200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate crop area for square thumbnail
      const minDimension = Math.min(img.width, img.height);
      const sx = (img.width - minDimension) / 2;
      const sy = (img.height - minDimension) / 2;

      // Set canvas size
      canvas.width = size;
      canvas.height = size;

      // Draw cropped and scaled image
      ctx.drawImage(
        img,
        sx,
        sy,
        minDimension,
        minDimension,
        0,
        0,
        size,
        size
      );

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}
