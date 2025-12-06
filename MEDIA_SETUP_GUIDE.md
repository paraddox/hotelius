# Media Management System - Setup Guide

This guide will help you set up and use the media management system for hotel and room type photos.

## Quick Start

### 1. Install Dependencies

The required dependency `react-dropzone` has already been installed.

### 2. Run Database Migration

Apply the storage bucket migration to create the necessary storage buckets and policies:

```bash
# Using Supabase CLI
supabase migration up 013_storage_buckets.sql

# Or apply directly in Supabase Dashboard
# Copy the contents of supabase/migrations/013_storage_buckets.sql
# and run in the SQL Editor
```

### 3. Verify Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Verify Storage Bucket

In your Supabase dashboard:
1. Go to Storage
2. Verify the `hotel-media` bucket exists
3. Check that policies are enabled (public read, authenticated write)

## File Structure

```
src/
├── components/
│   └── media/
│       ├── ImageUploader.tsx      # Drag-and-drop uploader
│       ├── PhotoGallery.tsx       # Gallery with reordering
│       ├── ImagePreview.tsx       # Single image preview
│       ├── UploadProgress.tsx     # Upload progress indicator
│       ├── index.ts               # Exports
│       ├── README.md              # Documentation
│       └── USAGE_EXAMPLE.tsx      # Usage examples
└── lib/
    └── media/
        ├── upload.ts              # Upload utilities
        ├── supabase-image-loader.ts  # Next.js image loader
        └── index.ts               # Exports

supabase/
└── migrations/
    └── 013_storage_buckets.sql    # Storage setup

next.config.ts                      # Updated with image domains
```

## Usage in Your Pages

### For Hotel Photos

```tsx
import { HotelPhotosManager } from '@/components/media/USAGE_EXAMPLE';

export default function HotelEditPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-6">
      <HotelPhotosManager hotelId={params.id} />
    </div>
  );
}
```

### For Room Type Photos

```tsx
import { RoomTypePhotosManager } from '@/components/media/USAGE_EXAMPLE';

export default function RoomTypeEditPage({
  params
}: {
  params: { hotelId: string; roomTypeId: string }
}) {
  return (
    <div className="container mx-auto p-6">
      <RoomTypePhotosManager
        hotelId={params.hotelId}
        roomTypeId={params.roomTypeId}
      />
    </div>
  );
}
```

## Custom Implementation

If you need custom behavior, use the components directly:

```tsx
'use client';

import { ImageUploader, PhotoGallery } from '@/components/media';
import { deleteImage } from '@/lib/media';
import { createClient } from '@/lib/supabase/client';

export default function CustomPhotoPage() {
  const supabase = createClient();

  const handleUploadComplete = async (results) => {
    // Your custom logic here
    console.log('Uploaded:', results);
  };

  return (
    <div>
      <ImageUploader
        hotelId="your-hotel-id"
        type="hotel"
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
```

## Features

### Drag-and-Drop Upload
- Supports multiple files
- Real-time preview
- Progress tracking
- File validation (type, size)

### Photo Gallery
- Grid layout with responsive design
- Featured photo highlighting
- Alt text editing for SEO/accessibility
- Drag-and-drop reordering
- Delete functionality
- Full-size preview modal

### Storage Management
- Automatic folder structure
- Unique file naming
- File metadata tracking
- Image dimension detection
- Supabase Storage integration

## Storage Path Structure

Photos are automatically organized:

- **Hotel Photos:** `{hotel_id}/hotels/{filename}`
- **Room Type Photos:** `{hotel_id}/room-types/{room_type_id}/{filename}`

## Database Tables

### hotel_photos
Stores hotel photo metadata with fields:
- `id`, `hotel_id`, `url`, `storage_path`
- `alt_text`, `caption` (i18n support)
- `width`, `height`, `file_size_bytes`, `mime_type`
- `sort_order`, `category`, `is_featured`, `is_active`

### room_type_photos
Similar structure for room type photos with `room_type_id` instead.

## Security

- **Storage Policies:** Automatically enforced via RLS
- **Upload Validation:** Client-side validation before upload
- **Owner Verification:** Only hotel owners can upload/delete their photos
- **Public Access:** Photos are publicly readable

## Troubleshooting

### Upload fails with "Unauthorized"
- Verify user is authenticated
- Check that user owns the hotel
- Verify storage policies are applied

### Images not displaying
- Check `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Verify bucket is public
- Check image URLs in database

### Drag-and-drop not working
- Ensure `react-dropzone` is installed
- Check browser compatibility
- Verify no conflicting CSS

## Next Steps

1. Copy `USAGE_EXAMPLE.tsx` components to your pages
2. Customize styling if needed
3. Add internationalization for alt text/captions
4. Implement image optimization (already configured)
5. Add category filtering if needed

## Advanced Features

### Image Transformations

Use the Supabase image loader for automatic optimization:

```tsx
import Image from 'next/image';
import { supabaseImageLoader } from '@/lib/media';

<Image
  src="/hotel-id/hotels/photo.jpg"
  loader={supabaseImageLoader}
  width={800}
  height={600}
  quality={85}
  alt="Hotel lobby"
/>
```

### Custom Image URL with Transforms

```tsx
import { getImageUrl } from '@/lib/media';

const thumbnailUrl = getImageUrl(photo.storage_path, {
  width: 400,
  height: 300,
  quality: 80,
  format: 'webp',
});
```

### Internationalized Captions

```tsx
// Save caption in multiple languages
const caption = {
  en: 'Luxury hotel lobby',
  es: 'Vestíbulo de hotel de lujo',
  fr: 'Hall d\'hôtel de luxe',
};

await supabase
  .from('hotel_photos')
  .update({ caption })
  .eq('id', photoId);
```

## Performance Tips

1. Use Next.js Image component for automatic optimization
2. Set appropriate image dimensions
3. Use WebP format when possible
4. Implement lazy loading for galleries
5. Limit max files per upload

## Support

For issues or questions:
1. Check the README.md in `src/components/media/`
2. Review USAGE_EXAMPLE.tsx for implementation patterns
3. Check Supabase Storage logs for upload issues
4. Verify database triggers are working

## Checklist

- [ ] Migration applied (`013_storage_buckets.sql`)
- [ ] Storage bucket `hotel-media` exists
- [ ] Environment variables set
- [ ] react-dropzone installed
- [ ] Next.js config updated (already done)
- [ ] Tested upload functionality
- [ ] Tested delete functionality
- [ ] Tested reordering
- [ ] Tested alt text editing
- [ ] Tested featured photo toggle

You're all set! Start uploading photos to your hotels and room types.
