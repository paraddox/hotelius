'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  uploadMultipleImages,
  validateImage,
  resizeImage,
} from '@/lib/storage/upload';

interface PhotoUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  error?: string;
  bucket?: string;
  pathPrefix?: string;
}

interface UploadProgress {
  completed: number;
  total: number;
  uploading: boolean;
  errors: string[];
}

export function PhotoUploader({
  images,
  onChange,
  maxImages = 6,
  label = 'Room Photos',
  error,
  bucket = 'room-images',
  pathPrefix = 'room-types',
}: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    completed: 0,
    total: 0,
    uploading: false,
    errors: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const resetProgress = () => {
    setProgress({
      completed: 0,
      total: 0,
      uploading: false,
      errors: [],
    });
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        setProgress({
          ...progress,
          errors: [`Maximum ${maxImages} images allowed`],
        });
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      const errors: string[] = [];
      const validFiles: File[] = [];

      // Validate all files first
      for (const file of filesToUpload) {
        const validation = validateImage(file);
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) {
        setProgress({ ...progress, errors });
        return;
      }

      setProgress({
        completed: 0,
        total: validFiles.length,
        uploading: true,
        errors,
      });

      try {
        // Resize images before upload for better performance
        const resizedFiles = await Promise.all(
          validFiles.map(async (file) => {
            try {
              const resizedBlob = await resizeImage(file, 1920, 1080);
              return new File([resizedBlob], file.name, { type: file.type });
            } catch (error) {
              console.error('Failed to resize image:', error);
              return file; // Use original if resize fails
            }
          })
        );

        // Upload to Supabase Storage
        const uploadedUrls = await uploadMultipleImages(
          resizedFiles,
          bucket,
          pathPrefix,
          (completed, total) => {
            setProgress((prev) => ({
              ...prev,
              completed,
              total,
            }));
          }
        );

        // Update parent component with new images
        onChange([...images, ...uploadedUrls]);

        // Reset progress after a short delay
        setTimeout(resetProgress, 2000);
      } catch (error) {
        console.error('Error uploading images:', error);
        setProgress((prev) => ({
          ...prev,
          uploading: false,
          errors: [...prev.errors, 'Upload failed. Please try again.'],
        }));
      }
    },
    [images, maxImages, onChange, bucket, pathPrefix, progress]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  const canAddMore = images.length < maxImages && !progress.uploading;

  return (
    <div className="space-y-4">
      {/* Label */}
      {label && (
        <div>
          <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-1">
            {label}
          </label>
          <p className="text-sm text-[#8B8B8B]">
            Upload high-quality images that showcase the room type. First image will be the primary photo.
          </p>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
            isDragging
              ? 'border-[#C4A484] bg-[#C4A484]/5 scale-[1.02]'
              : 'border-[#E8E0D5] hover:border-[#C4A484]/50 hover:bg-[#F0EBE3]',
            error && 'border-[#C45C5C]'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={progress.uploading}
          />

          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'p-3 rounded-full transition-all',
                isDragging ? 'bg-[#C4A484] scale-110' : 'bg-[#F0EBE3]'
              )}
            >
              <Upload
                className={cn(
                  'w-6 h-6 transition-colors',
                  isDragging ? 'text-white' : 'text-[#C4A484]'
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2C2C2C] mb-1">
                {isDragging ? (
                  <span className="text-[#C4A484]">Drop images here</span>
                ) : (
                  <>
                    Drag and drop images or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#C4A484] hover:text-[#A67B5B] underline"
                      disabled={progress.uploading}
                    >
                      browse
                    </button>
                  </>
                )}
              </p>
              <p className="text-xs text-[#8B8B8B]">
                JPEG, PNG, WebP up to 5MB ({images.length}/{maxImages})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {progress.uploading && (
        <div className="bg-[#F0EBE3] border border-[#E8E0D5] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#C4A484] animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#2C2C2C] mb-1">
                Uploading images...
              </p>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#C4A484] h-full transition-all duration-300"
                  style={{
                    width: `${(progress.completed / progress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[#8B8B8B] mt-1">
                {progress.completed} of {progress.total} completed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Errors */}
      {progress.errors.length > 0 && (
        <div className="bg-[#FFF3F3] border border-[#C45C5C] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#C45C5C] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#C45C5C] mb-2">
                Upload errors:
              </p>
              <ul className="text-sm text-[#2C2C2C] space-y-1">
                {progress.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C] mt-2 flex-shrink-0" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={resetProgress}
              className="text-[#8B8B8B] hover:text-[#C45C5C] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg overflow-hidden bg-[#F0EBE3] group"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                reorderImages(fromIndex, index);
              }}
            >
              <img
                src={image}
                alt={`Room photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#C45C5C] text-white hover:bg-[#A84848] transition-colors"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#2C2C2C]/80 text-white text-xs font-medium">
                  Primary Photo
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !canAddMore && (
        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-[#E8E0D5] rounded-lg">
          <ImageIcon className="w-12 h-12 text-[#8B8B8B] mb-2" />
          <p className="text-sm text-[#8B8B8B]">No images uploaded</p>
        </div>
      )}

      {/* Info Message */}
      {images.length > 0 && (
        <div className="bg-[#F0EBE3] border border-[#E8E0D5] rounded-lg p-3">
          <p className="text-xs text-[#2C2C2C]">
            <strong>Tip:</strong> Drag images to reorder them. The first image will be used as the primary photo in listings.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-[#C45C5C] flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
          {error}
        </p>
      )}
    </div>
  );
}
