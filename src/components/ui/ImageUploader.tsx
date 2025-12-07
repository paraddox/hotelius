'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  error?: string;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 6,
  label = 'Photos',
  error
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);

    try {
      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      const newImageUrls: string[] = [];

      // In a real implementation, you would upload to Supabase Storage here
      // For now, we'll create local object URLs
      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error('Invalid file type:', file.type);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.error('File too large:', file.name);
          continue;
        }

        // TODO: Upload to Supabase Storage
        // const { data, error } = await supabase.storage
        //   .from('room-images')
        //   .upload(`${Date.now()}-${file.name}`, file);

        // For now, create object URL (in production, use Supabase URL)
        const objectUrl = URL.createObjectURL(file);
        newImageUrls.push(objectUrl);
      }

      onChange([...images, ...newImageUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B]">
          {label}
        </label>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-all',
            isDragging
              ? 'border-[#C4A484] bg-[#C4A484]/5'
              : 'border-[#E8E0D5] hover:border-[#C4A484]/50 hover:bg-[#F0EBE3]',
            error && 'border-[#C45C5C]'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-[#F0EBE3]">
              <Upload className="w-6 h-6 text-[#C4A484]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2C2C2C] mb-1">
                Drop images here or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#C4A484] hover:text-[#A67B5B] underline"
                  disabled={isUploading}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-[#8B8B8B]">
                PNG, JPG up to 5MB ({images.length}/{maxImages})
              </p>
            </div>
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
            >
              <img
                src={image}
                alt={`Room image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#C45C5C] text-white hover:bg-[#A84848] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#2C2C2C]/80 text-white text-xs font-medium">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !canAddMore && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ImageIcon className="w-12 h-12 text-[#8B8B8B] mb-2" />
          <p className="text-sm text-[#8B8B8B]">No images uploaded</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-[#C45C5C] flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
          {error}
        </p>
      )}

      {/* Loading State */}
      {isUploading && (
        <div className="text-sm text-[#8B8B8B] text-center">
          Uploading images...
        </div>
      )}
    </div>
  );
}
