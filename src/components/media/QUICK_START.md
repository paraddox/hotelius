# Media Management - Quick Start Guide

Quick reference for using the new media management components in Hotelius.

## Installation

All dependencies are already installed (`react-dropzone` is in package.json).

## Import Paths

```tsx
// Components
import { ImageGallery, ImageCropper, ASPECT_RATIOS } from '@/components/media';

// Storage utilities
import { uploadImage, deleteImage, BUCKETS, getImageUrl } from '@/lib/storage';

// Hooks
import { useImageUpload, useSingleImageUpload } from '@/hooks/useImageUpload';
```

## Common Use Cases

### 1. Display Images in a Gallery

```tsx
import { ImageGallery } from '@/components/media';

const images = [
  { id: '1', url: 'https://...', alt: 'Hotel lobby', isPrimary: true },
  { id: '2', url: 'https://...', alt: 'Pool area' },
];

<ImageGallery
  images={images}
  onDelete={(id) => handleDelete(id)}
  onSetPrimary={(id) => handleSetPrimary(id)}
  canEdit={true}
/>
```

### 2. Upload Images with Progress

```tsx
import { useImageUpload } from '@/hooks/useImageUpload';
import { BUCKETS } from '@/lib/storage';

const { upload, isUploading, progress } = useImageUpload({
  bucket: BUCKETS.HOTEL_IMAGES,
  path: `hotels/${hotelId}`,
  autoResize: true,
  onSuccess: (url) => console.log('Uploaded:', url),
});

// In your component
<input
  type="file"
  multiple
  onChange={(e) => upload(Array.from(e.target.files || []))}
/>
```

### 3. Crop an Image

```tsx
import { ImageCropper, ASPECT_RATIOS } from '@/components/media';

const [showCropper, setShowCropper] = useState(false);

const handleCrop = async (cropArea, blob) => {
  const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
  // Upload the cropped file
  await upload([file]);
  setShowCropper(false);
};

<ImageCropper
  imageUrl={selectedImage}
  aspectRatio={ASPECT_RATIOS.HERO.ratio}
  onCropComplete={handleCrop}
/>
```

### 4. Get Image URLs with Transformations

```tsx
import { getImageUrl, getThumbnailUrl } from '@/lib/storage';

// Standard URL
const url = getImageUrl('hotel-images', 'path/to/image.jpg');

// With transformations
const resizedUrl = getImageUrl('hotel-images', 'path/to/image.jpg', {
  width: 800,
  height: 600,
  quality: 85,
  format: 'webp',
});

// Thumbnail (automatic sizing)
const thumbUrl = getThumbnailUrl('hotel-images', 'path/to/image.jpg', 'medium');
```

### 5. Complete Upload Flow

```tsx
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImageGallery } from '@/components/media';
import { BUCKETS } from '@/lib/storage';

function HotelImages({ hotelId }) {
  const [images, setImages] = useState([]);

  const { upload, deleteUploadedImage } = useImageUpload({
    bucket: BUCKETS.HOTEL_IMAGES,
    path: `hotels/${hotelId}`,
    onSuccess: (url) => {
      setImages(prev => [...prev, {
        id: Date.now().toString(),
        url,
        alt: 'New image',
      }]);
    },
  });

  const handleDelete = async (imageId) => {
    const image = images.find(img => img.id === imageId);
    await deleteUploadedImage(image.url);
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => upload(Array.from(e.target.files || []))}
      />
      <ImageGallery
        images={images}
        onDelete={handleDelete}
        canEdit={true}
      />
    </div>
  );
}
```

## Bucket Configuration

Three buckets are available:

```tsx
import { BUCKETS } from '@/lib/storage';

BUCKETS.HOTEL_IMAGES  // 'hotel-images' - Hotel photos
BUCKETS.ROOM_IMAGES   // 'room-images' - Room type photos
BUCKETS.AVATARS       // 'avatars' - User avatars
```

## Path Structure

### Hotel Images
```
hotels/{hotelId}/image.jpg
```

Use helper:
```tsx
import { buildHotelImagePath } from '@/lib/storage';
const path = buildHotelImagePath(hotelId, 'image.jpg');
```

### Room Images
```
hotels/{hotelId}/room-types/{roomTypeId}/image.jpg
```

Use helper:
```tsx
import { buildRoomImagePath } from '@/lib/storage';
const path = buildRoomImagePath(hotelId, roomTypeId, 'image.jpg');
```

## Validation Rules

- **File Types:** JPG, PNG, WEBP only
- **File Size:** Maximum 5MB per file (configurable)
- **Dimensions:** Automatically validated, can auto-resize

## Aspect Ratios

```tsx
import { ASPECT_RATIOS } from '@/components/media';

ASPECT_RATIOS.HERO.ratio      // 16:9 (1.778) - Hero/banner images
ASPECT_RATIOS.THUMBNAIL.ratio // 4:3 (1.333) - Thumbnail images
ASPECT_RATIOS.SQUARE.ratio    // 1:1 (1.0) - Square images
```

## Component Props Quick Reference

### ImageGallery
```tsx
{
  images: GalleryImage[];          // Required
  onDelete?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onReorder?: (ids: string[]) => void;
  canEdit?: boolean;               // Default: false
  className?: string;
}
```

### ImageCropper
```tsx
{
  imageUrl: string;                // Required
  aspectRatio?: number;            // Default: 16/9
  onCropComplete?: (area, blob) => void;
  className?: string;
}
```

### useImageUpload Options
```tsx
{
  bucket: BucketName;              // Required
  path: string;                    // Required
  maxSize?: number;                // Default: 5MB
  allowedTypes?: string[];         // Default: jpg, png, webp
  autoResize?: boolean;            // Default: false
  maxWidth?: number;               // Default: 1920
  maxHeight?: number;              // Default: 1080
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (fileId, progress) => void;
}
```

## Styling

All components use the luxury boutique hotel design system:

- **Primary:** `#2C2C2C` (dark charcoal)
- **Accent:** `#C4A484` (warm gold)
- **Background:** `#F0EBE3` (soft cream)
- **Border:** `#E8E0D5` (light beige)

Typography:
- **Headings:** `Cormorant Garamond` (serif)
- **Body:** System fonts

## TypeScript Types

All components and utilities are fully typed. Import types as needed:

```tsx
import type {
  GalleryImage,
  CropArea,
  ImageGalleryProps,
  ImageCropperProps,
} from '@/components/media';

import type {
  BucketName,
  ImageTransformOptions,
} from '@/lib/storage';
```

## See Also

- **Full Documentation:** `src/components/media/README.md`
- **Complete Example:** `src/components/media/MediaManagementExample.tsx`
- **Storage Utils:** `src/lib/storage/upload.ts`, `src/lib/storage/buckets.ts`
- **Upload Hook:** `src/hooks/useImageUpload.ts`
