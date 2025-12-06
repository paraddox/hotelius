'use client';

/**
 * This is an example file demonstrating how to use the media management components
 * together for uploading and managing hotel/room images.
 *
 * Usage:
 * 1. ImageUploader - For drag-and-drop file uploads
 * 2. ImageGallery - For displaying, reordering, and managing uploaded images
 * 3. ImageCropper - For cropping images to specific aspect ratios
 * 4. useImageUpload - For programmatic upload control
 */

import { useState } from 'react';
import {
  ImageUploader,
  ImageGallery,
  ImageCropper,
  ASPECT_RATIOS,
  type FileWithPreview,
  type GalleryImage,
  type CropArea,
} from '@/components/media';
import { useImageUpload } from '@/hooks/useImageUpload';
import { BUCKETS } from '@/lib/storage/buckets';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface MediaManagementExampleProps {
  hotelId: string;
  roomTypeId?: string;
  initialImages?: GalleryImage[];
}

export function MediaManagementExample({
  hotelId,
  roomTypeId,
  initialImages = [],
}: MediaManagementExampleProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string | null>(null);

  // Determine bucket and path based on type
  const bucket = roomTypeId ? BUCKETS.ROOM_IMAGES : BUCKETS.HOTEL_IMAGES;
  const path = roomTypeId
    ? `${hotelId}/room-types/${roomTypeId}`
    : `${hotelId}/hotels`;

  // Use the image upload hook
  const {
    upload,
    isUploading,
    progress,
    errors,
    uploadedUrls,
    deleteUploadedImage,
  } = useImageUpload({
    bucket,
    path,
    autoResize: true,
    maxWidth: 1920,
    maxHeight: 1080,
    onSuccess: (url) => {
      console.log('Image uploaded:', url);
    },
    onError: (error) => {
      console.error('Upload error:', error);
    },
  });

  // Handle file selection from ImageUploader
  const handleFilesSelected = async (files: FileWithPreview[]) => {
    setSelectedFiles(files);

    // Convert FileWithPreview to File array and upload
    const fileArray = files.map((f) => f as File);
    const urls = await upload(fileArray);

    // Add uploaded images to gallery
    const newImages: GalleryImage[] = urls.map((url, index) => ({
      id: `${Date.now()}-${index}`,
      url,
      alt: files[index].name,
      isPrimary: images.length === 0 && index === 0, // First image is primary if no images exist
      order: images.length + index,
    }));

    setImages((prev) => [...prev, ...newImages]);
    setSelectedFiles([]);
  };

  // Handle image deletion from gallery
  const handleDeleteImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    try {
      await deleteUploadedImage(image.url);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  // Handle setting primary image
  const handleSetPrimary = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }))
    );
  };

  // Handle image reordering
  const handleReorder = (imageIds: string[]) => {
    const reorderedImages = imageIds
      .map((id) => images.find((img) => img.id === id))
      .filter(Boolean) as GalleryImage[];

    setImages(
      reorderedImages.map((img, index) => ({
        ...img,
        order: index,
      }))
    );
  };

  // Handle opening cropper
  const handleOpenCropper = (imageUrl: string) => {
    setSelectedImageForCrop(imageUrl);
    setCropperOpen(true);
  };

  // Handle crop completion
  const handleCropComplete = async (cropArea: CropArea, croppedBlob: Blob) => {
    // Convert blob to file
    const file = new File([croppedBlob], 'cropped-image.jpg', {
      type: 'image/jpeg',
    });

    // Upload cropped image
    const urls = await upload([file]);

    if (urls.length > 0) {
      const newImage: GalleryImage = {
        id: `${Date.now()}`,
        url: urls[0],
        alt: 'Cropped image',
        isPrimary: false,
        order: images.length,
      };

      setImages((prev) => [...prev, newImage]);
    }

    setCropperOpen(false);
    setSelectedImageForCrop(null);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-['Cormorant_Garamond',Georgia,serif] text-3xl font-medium text-[#2C2C2C] mb-2">
          Media Management
        </h1>
        <p className="text-sm text-[#8B8B8B]">
          Upload, crop, and manage images for your {roomTypeId ? 'room type' : 'hotel'}
        </p>
      </div>

      {/* Image Uploader */}
      <div>
        <h2 className="font-['Cormorant_Garamond',Georgia,serif] text-xl font-medium text-[#2C2C2C] mb-4">
          Upload Images
        </h2>
        <ImageUploader
          onFilesSelected={handleFilesSelected}
          maxFiles={10}
          uploadProgress={progress}
          uploadedFiles={new Set(uploadedUrls)}
        />
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div>
          <h2 className="font-['Cormorant_Garamond',Georgia,serif] text-xl font-medium text-[#2C2C2C] mb-4">
            Image Gallery ({images.length})
          </h2>
          <ImageGallery
            images={images}
            onDelete={handleDeleteImage}
            onSetPrimary={handleSetPrimary}
            onReorder={handleReorder}
            canEdit={true}
          />
        </div>
      )}

      {/* Additional Actions */}
      {images.length > 0 && (
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => images[0] && handleOpenCropper(images[0].url)}
            disabled={images.length === 0}
          >
            Crop First Image
          </Button>
        </div>
      )}

      {/* Image Cropper Modal */}
      <Modal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        title="Crop Image"
        description="Adjust the crop area to your desired composition"
        size="xl"
      >
        {selectedImageForCrop && (
          <ImageCropper
            imageUrl={selectedImageForCrop}
            aspectRatio={ASPECT_RATIOS.HERO.ratio}
            onCropComplete={handleCropComplete}
          />
        )}
      </Modal>

      {/* Upload Progress Info */}
      {isUploading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-[#E8E0D5]">
          <p className="text-sm font-medium text-[#2C2C2C] mb-2">
            Uploading images...
          </p>
          <div className="space-y-1">
            {Object.entries(progress).map(([fileId, prog]) => (
              <div key={fileId} className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#E8E0D5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C4A484] transition-all duration-300"
                    style={{ width: `${prog}%` }}
                  />
                </div>
                <span className="text-xs text-[#8B8B8B]">{prog}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-[#FFEBEE] border border-[#C45C5C]/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-[#C45C5C] mb-2">
            Upload Errors
          </h3>
          <ul className="space-y-1">
            {Object.entries(errors).map(([fileId, error]) => (
              <li key={fileId} className="text-xs text-[#C45C5C]">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Simple usage example for hotel images
 */
export function HotelMediaManagement({ hotelId }: { hotelId: string }) {
  return <MediaManagementExample hotelId={hotelId} />;
}

/**
 * Simple usage example for room type images
 */
export function RoomTypeMediaManagement({
  hotelId,
  roomTypeId,
}: {
  hotelId: string;
  roomTypeId: string;
}) {
  return <MediaManagementExample hotelId={hotelId} roomTypeId={roomTypeId} />;
}
