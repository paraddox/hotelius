# Media Management System

A comprehensive media management system for uploading and managing hotel and room type photos in the Hotelius application.

## Features

- Drag-and-drop image upload with preview
- Multiple file upload support
- Real-time upload progress tracking
- File size and type validation (max 5MB, JPG/PNG/WEBP)
- Photo gallery with grid layout
- Drag-and-drop photo reordering
- Featured photo management
- Alt text editing with i18n support
- Image deletion
- Full-size image preview modal
- Integration with Supabase Storage
- Next.js Image optimization support

## Components

### ImageUploader (Original)

A drag-and-drop image uploader component with validation and progress tracking.

**Usage:**

```tsx
import { ImageUploader } from '@/components/media';

function HotelPhotos() {
  const handleUploadComplete = async (results) => {
    // Save photo records to database
    for (const result of results) {
      await supabase.from('hotel_photos').insert({
        hotel_id: hotelId,
        url: result.url,
        storage_path: result.storagePath,
        width: result.metadata.width,
        height: result.metadata.height,
        file_size_bytes: result.metadata.fileSize,
        mime_type: result.metadata.mimeType,
      });
    }
  };

  return (
    <ImageUploader
      hotelId={hotelId}
      type="hotel"
      onUploadComplete={handleUploadComplete}
      maxFiles={10}
    />
  );
}
```

**Props:**

- `hotelId` (string): The hotel ID
- `type` ('hotel' | 'room-type'): Type of photos being uploaded
- `roomTypeId` (string, optional): Room type ID (required when type='room-type')
- `onUploadComplete` (function, optional): Callback when upload completes
- `onUploadError` (function, optional): Callback when upload fails
- `maxFiles` (number, default: 10): Maximum number of files
- `className` (string, optional): Additional CSS classes

### PhotoGallery

A gallery component for displaying, managing, and reordering photos.

**Usage:**

```tsx
import { PhotoGallery } from '@/components/media';

function HotelGallery() {
  const photos = [
    {
      id: '1',
      url: 'https://...',
      storage_path: 'hotel-id/hotels/photo.jpg',
      alt_text: 'Hotel lobby',
      is_featured: true,
      sort_order: 0,
    },
    // ... more photos
  ];

  const handleDelete = async (photoId) => {
    // Delete from storage
    const photo = photos.find(p => p.id === photoId);
    await deleteImage(photo.storage_path);

    // Delete from database
    await supabase.from('hotel_photos').delete().eq('id', photoId);
  };

  const handleUpdateAlt = async (photoId, altText) => {
    await supabase
      .from('hotel_photos')
      .update({ alt_text: altText })
      .eq('id', photoId);
  };

  const handleToggleFeatured = async (photoId) => {
    // Unfeatured all photos first
    await supabase
      .from('hotel_photos')
      .update({ is_featured: false })
      .eq('hotel_id', hotelId);

    // Set new featured photo
    await supabase
      .from('hotel_photos')
      .update({ is_featured: true })
      .eq('id', photoId);
  };

  const handleReorder = async (reorderedPhotos) => {
    // Update sort_order in database
    for (const photo of reorderedPhotos) {
      await supabase
        .from('hotel_photos')
        .update({ sort_order: photo.sort_order })
        .eq('id', photo.id);
    }
  };

  return (
    <PhotoGallery
      photos={photos}
      onDelete={handleDelete}
      onUpdateAlt={handleUpdateAlt}
      onToggleFeatured={handleToggleFeatured}
      onReorder={handleReorder}
    />
  );
}
```

**Props:**

- `photos` (Photo[]): Array of photo objects
- `onDelete` (function, optional): Delete photo callback
- `onUpdateAlt` (function, optional): Update alt text callback
- `onToggleFeatured` (function, optional): Toggle featured status callback
- `onReorder` (function, optional): Reorder photos callback
- `className` (string, optional): Additional CSS classes

### ImagePreview

A single image preview component with actions.

**Props:**

- `id` (string): Photo ID
- `url` (string): Image URL
- `alt` (string, optional): Alt text
- `caption` (object, optional): Internationalized captions
- `isFeatured` (boolean, default: false): Featured status
- `onDelete` (function, optional): Delete callback
- `onUpdateAlt` (function, optional): Update alt text callback
- `onToggleFeatured` (function, optional): Toggle featured callback
- `className` (string, optional): Additional CSS classes

### UploadProgress

Upload progress indicator component.

**Props:**

- `files` (UploadFile[]): Array of files being uploaded
- `onCancel` (function, optional): Cancel upload callback

## Utilities

### Upload Functions

```tsx
import {
  uploadImage,
  deleteImage,
  getImageUrl,
  uploadMultipleImages
} from '@/lib/media';

// Upload single image
const result = await uploadImage(file, hotelId, 'hotel');

// Upload multiple images
const results = await uploadMultipleImages(
  files,
  hotelId,
  'hotel',
  undefined,
  (completed, total) => {
    console.log(`${completed}/${total} uploaded`);
  }
);

// Delete image
await deleteImage(storagePath);

// Get image URL with transformations
const url = getImageUrl(storagePath, {
  width: 800,
  height: 600,
  quality: 85,
  format: 'webp',
});
```

### Next.js Image Loader

```tsx
import Image from 'next/image';
import { supabaseImageLoader } from '@/lib/media';

function HotelImage() {
  return (
    <Image
      src="/hotel-id/hotels/photo.jpg"
      loader={supabaseImageLoader}
      width={800}
      height={600}
      alt="Hotel room"
    />
  );
}
```

## Storage Structure

Photos are organized in Supabase Storage with the following structure:

```
hotel-media/
├── {hotel_id}/
│   ├── hotels/
│   │   ├── photo-1.jpg
│   │   ├── photo-2.jpg
│   │   └── ...
│   └── room-types/
│       ├── {room_type_id}/
│       │   ├── photo-1.jpg
│       │   ├── photo-2.jpg
│       │   └── ...
│       └── ...
```

## Database Schema

Photos are stored in two tables:

### hotel_photos

- `id` (UUID): Primary key
- `hotel_id` (UUID): Foreign key to hotels table
- `url` (TEXT): Public URL
- `storage_path` (TEXT): Path in storage bucket
- `alt_text` (TEXT): Alt text for accessibility
- `caption` (JSONB): Internationalized captions
- `width` (INTEGER): Image width in pixels
- `height` (INTEGER): Image height in pixels
- `file_size_bytes` (INTEGER): File size
- `mime_type` (TEXT): MIME type
- `sort_order` (INTEGER): Display order
- `category` (TEXT): Photo category
- `is_featured` (BOOLEAN): Featured photo flag
- `is_active` (BOOLEAN): Active status

### room_type_photos

Similar structure as `hotel_photos` but with `room_type_id` instead of `hotel_id`.

## Validation Rules

- **File Types:** JPG, PNG, WEBP only
- **File Size:** Maximum 5MB per file
- **Max Files:** Configurable (default 10)

## Storage Policies

- **Public Read:** Anyone can view photos
- **Authenticated Write:** Hotel owners can upload to their hotel folders
- **Authenticated Update:** Hotel owners can update their photos
- **Authenticated Delete:** Hotel owners can delete their photos

## Setup

1. Install dependencies:
   ```bash
   npm install react-dropzone
   ```

2. Run migration:
   ```bash
   supabase migration up 013_storage_buckets.sql
   ```

3. Configure environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. The Next.js config is already updated to support Supabase images.

## Examples

### Complete Hotel Photo Management

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ImageUploader, PhotoGallery } from '@/components/media';
import { uploadImage, deleteImage } from '@/lib/media';
import { createClient } from '@/lib/supabase/client';

export default function HotelPhotosPage({ hotelId }: { hotelId: string }) {
  const [photos, setPhotos] = useState([]);
  const supabase = createClient();

  // Load photos
  useEffect(() => {
    loadPhotos();
  }, [hotelId]);

  const loadPhotos = async () => {
    const { data } = await supabase
      .from('hotel_photos')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('sort_order');

    setPhotos(data || []);
  };

  const handleUploadComplete = async (results) => {
    // Insert photos into database
    const photoRecords = results.map((result, index) => ({
      hotel_id: hotelId,
      url: result.url,
      storage_path: result.storagePath,
      width: result.metadata.width,
      height: result.metadata.height,
      file_size_bytes: result.metadata.fileSize,
      mime_type: result.metadata.mimeType,
      sort_order: photos.length + index,
    }));

    await supabase.from('hotel_photos').insert(photoRecords);
    await loadPhotos();
  };

  const handleDelete = async (photoId) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      await deleteImage(photo.storage_path);
      await supabase.from('hotel_photos').delete().eq('id', photoId);
      await loadPhotos();
    }
  };

  const handleUpdateAlt = async (photoId, altText) => {
    await supabase
      .from('hotel_photos')
      .update({ alt_text: altText })
      .eq('id', photoId);
    await loadPhotos();
  };

  const handleToggleFeatured = async (photoId) => {
    await supabase
      .from('hotel_photos')
      .update({ is_featured: false })
      .eq('hotel_id', hotelId);

    await supabase
      .from('hotel_photos')
      .update({ is_featured: true })
      .eq('id', photoId);

    await loadPhotos();
  };

  const handleReorder = async (reorderedPhotos) => {
    for (const photo of reorderedPhotos) {
      await supabase
        .from('hotel_photos')
        .update({ sort_order: photo.sort_order })
        .eq('id', photo.id);
    }
    await loadPhotos();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Upload Photos</h2>
        <ImageUploader
          hotelId={hotelId}
          type="hotel"
          onUploadComplete={handleUploadComplete}
        />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Photo Gallery</h2>
        <PhotoGallery
          photos={photos}
          onDelete={handleDelete}
          onUpdateAlt={handleUpdateAlt}
          onToggleFeatured={handleToggleFeatured}
          onReorder={handleReorder}
        />
      </div>
    </div>
  );
}
```

## Styling

All components use the luxury design system with:
- Color palette: `#2C2C2C` (dark), `#C4A484` (accent), `#F0EBE3` (light)
- Smooth transitions and animations
- Tailwind CSS utility classes
- Responsive design

---

## New Media Management Components

The following new components have been added to enhance the media management system:

### ImageGallery

An advanced gallery component with lightbox, drag-to-reorder, and image management features.

**Features:**
- Grid layout with responsive columns
- Click to open lightbox view
- Keyboard navigation (arrow keys, ESC)
- Set primary/featured image
- Drag and drop to reorder images
- Delete with confirmation modal
- Hover effects and smooth animations

**Usage:**

```tsx
import { ImageGallery } from '@/components/media';

function MyGallery() {
  const images = [
    {
      id: '1',
      url: 'https://...',
      alt: 'Hotel lobby',
      isPrimary: true,
      order: 0,
    },
    // ... more images
  ];

  return (
    <ImageGallery
      images={images}
      onDelete={(id) => console.log('Delete:', id)}
      onSetPrimary={(id) => console.log('Set primary:', id)}
      onReorder={(ids) => console.log('New order:', ids)}
      canEdit={true}
    />
  );
}
```

**Props:**
- `images` (GalleryImage[]): Array of images to display
- `onDelete` (function, optional): Callback when image is deleted
- `onSetPrimary` (function, optional): Callback when image is set as primary
- `onReorder` (function, optional): Callback when images are reordered
- `canEdit` (boolean, default: false): Enable edit features
- `className` (string, optional): Additional CSS classes

### ImageCropper

An image cropping component with aspect ratio control and zoom functionality.

**Features:**
- Crop to specific aspect ratios (16:9, 4:3, 1:1)
- Drag to position image
- Zoom controls with slider
- Visual crop preview
- Apply crop to generate blob

**Usage:**

```tsx
import { ImageCropper, ASPECT_RATIOS } from '@/components/media';

function MyCropper() {
  const handleCropComplete = (cropArea, croppedBlob) => {
    // Upload or use the cropped image
    const file = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
    // ... upload file
  };

  return (
    <ImageCropper
      imageUrl="https://example.com/image.jpg"
      aspectRatio={ASPECT_RATIOS.HERO.ratio}
      onCropComplete={handleCropComplete}
    />
  );
}
```

**Props:**
- `imageUrl` (string): URL of the image to crop
- `aspectRatio` (number, default: 16/9): Aspect ratio for crop area
- `onCropComplete` (function, optional): Callback with crop area and blob
- `className` (string, optional): Additional CSS classes

**Aspect Ratio Presets:**
- `ASPECT_RATIOS.HERO` - 16:9 (Hero images)
- `ASPECT_RATIOS.THUMBNAIL` - 4:3 (Thumbnails)
- `ASPECT_RATIOS.SQUARE` - 1:1 (Square images)

## New Storage Utilities

### Upload Functions (H:\dev\hotelius\src\lib\storage\upload.ts)

Comprehensive utilities for image upload and manipulation:

```tsx
import {
  uploadImage,
  deleteImage,
  getSignedUrl,
  resizeImage,
  validateImage,
  getImageDimensions,
  generateUniqueFileName,
  uploadMultipleImages,
  createThumbnail,
} from '@/lib/storage';

// Upload single image
const url = await uploadImage(file, 'hotel-images', 'hotels/123/image.jpg');

// Delete image
await deleteImage('hotel-images', 'hotels/123/image.jpg');

// Get signed URL for private files
const signedUrl = await getSignedUrl('hotel-images', 'hotels/123/image.jpg');

// Resize image
const resizedBlob = await resizeImage(file, 1920, 1080);

// Validate image
const { valid, error } = validateImage(file, 5 * 1024 * 1024);

// Get image dimensions
const { width, height } = await getImageDimensions(file);

// Upload multiple images with progress
const urls = await uploadMultipleImages(
  files,
  'hotel-images',
  'hotels/123',
  (completed, total) => console.log(`${completed}/${total}`)
);

// Create thumbnail
const thumbnailBlob = await createThumbnail(file, 200);
```

### Bucket Configuration (H:\dev\hotelius\src\lib\storage\buckets.ts)

Centralized bucket configuration and URL generation:

```tsx
import {
  BUCKETS,
  getImageUrl,
  getThumbnailUrl,
  getHeroImageUrl,
  buildHotelImagePath,
  buildRoomImagePath,
  buildAvatarPath,
} from '@/lib/storage';

// Bucket names
const bucket = BUCKETS.HOTEL_IMAGES; // 'hotel-images'
const bucket2 = BUCKETS.ROOM_IMAGES; // 'room-images'
const bucket3 = BUCKETS.AVATARS; // 'avatars'

// Get image URL with transformations
const url = getImageUrl('hotel-images', 'path/to/image.jpg', {
  width: 800,
  height: 600,
  quality: 85,
  format: 'webp',
  resize: 'cover',
});

// Get thumbnail URL (small, medium, large)
const thumbUrl = getThumbnailUrl('hotel-images', 'path/to/image.jpg', 'medium');

// Get hero image URL (optimized for 1920x1080)
const heroUrl = getHeroImageUrl('hotel-images', 'path/to/image.jpg');

// Build storage paths
const hotelPath = buildHotelImagePath('hotel-123', 'photo.jpg');
// => 'hotel-123/hotels/photo.jpg'

const roomPath = buildRoomImagePath('hotel-123', 'room-456', 'photo.jpg');
// => 'hotel-123/room-types/room-456/photo.jpg'

const avatarPath = buildAvatarPath('user-789', 'avatar.jpg');
// => 'user-789/avatar.jpg'
```

## Hooks

### useImageUpload

A comprehensive hook for managing image uploads with progress tracking, error handling, and retry logic.

**Features:**
- Upload single or multiple files
- Real-time progress tracking
- Error handling with detailed messages
- Retry failed uploads
- Cancel ongoing uploads
- Auto-resize images
- Delete uploaded images

**Usage:**

```tsx
import { useImageUpload } from '@/hooks/useImageUpload';
import { BUCKETS } from '@/lib/storage/buckets';

function MyComponent() {
  const {
    upload,
    isUploading,
    progress,
    errors,
    uploadedUrls,
    retry,
    cancel,
    deleteUploadedImage,
    validateFile,
  } = useImageUpload({
    bucket: BUCKETS.HOTEL_IMAGES,
    path: 'hotels/123',
    autoResize: true,
    maxWidth: 1920,
    maxHeight: 1080,
    onSuccess: (url) => console.log('Uploaded:', url),
    onError: (error) => console.error('Error:', error),
    onProgress: (fileId, progress) => console.log(`${fileId}: ${progress}%`),
  });

  const handleUpload = async (files: File[]) => {
    const urls = await upload(files);
    console.log('All uploaded:', urls);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => handleUpload(Array.from(e.target.files || []))}
      />
      {isUploading && <p>Uploading...</p>}
      {Object.entries(progress).map(([id, prog]) => (
        <div key={id}>File {id}: {prog}%</div>
      ))}
    </div>
  );
}
```

### useSingleImageUpload

A simplified hook for uploading a single image.

**Usage:**

```tsx
import { useSingleImageUpload } from '@/hooks/useImageUpload';
import { BUCKETS } from '@/lib/storage/buckets';

function AvatarUpload() {
  const { url, error, isUploading, progress, upload, remove } = useSingleImageUpload({
    bucket: BUCKETS.AVATARS,
    path: 'user-123',
  });

  return (
    <div>
      {url ? (
        <div>
          <img src={url} alt="Avatar" />
          <button onClick={remove}>Remove</button>
        </div>
      ) : (
        <input
          type="file"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      )}
      {isUploading && <p>Uploading: {progress}%</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## Complete Example

See `MediaManagementExample.tsx` for a complete working example that demonstrates:
- Uploading images with ImageUploader
- Displaying images in ImageGallery
- Cropping images with ImageCropper
- Using the useImageUpload hook
- Managing image state and operations

```tsx
import { MediaManagementExample } from '@/components/media/MediaManagementExample';

// For hotel images
<MediaManagementExample hotelId="hotel-123" />

// For room type images
<MediaManagementExample hotelId="hotel-123" roomTypeId="room-456" />
```
