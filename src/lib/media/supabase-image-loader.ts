import type { ImageLoader } from 'next/image';

/**
 * Custom image loader for Next.js Image component
 * Integrates with Supabase Storage transformations
 *
 * Usage:
 * <Image
 *   src="/path/to/image.jpg"
 *   loader={supabaseImageLoader}
 *   width={800}
 *   height={600}
 *   alt="Hotel room"
 * />
 */
export const supabaseImageLoader: ImageLoader = ({ src, width, quality }) => {
  // If src is already a full URL, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketName = 'hotel-media';

  // Remove leading slash from src
  const path = src.startsWith('/') ? src.slice(1) : src;

  // Build Supabase Storage URL with transformations
  const baseUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;

  // Add transformation parameters
  const params = new URLSearchParams();

  if (width) {
    params.set('width', width.toString());
  }

  if (quality) {
    params.set('quality', quality.toString());
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Helper to get Supabase image URL with transformations
 */
export function getSupabaseImageUrl(
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'origin' | 'jpeg' | 'png' | 'webp';
  }
): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketName = 'hotel-media';

  // Remove leading slash from path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Build base URL
  const baseUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanPath}`;

  if (!options || Object.keys(options).length === 0) {
    return baseUrl;
  }

  // Add transformation parameters
  const params = new URLSearchParams();

  if (options.width) {
    params.set('width', options.width.toString());
  }

  if (options.height) {
    params.set('height', options.height.toString());
  }

  if (options.quality) {
    params.set('quality', options.quality.toString());
  }

  if (options.format) {
    params.set('format', options.format);
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
