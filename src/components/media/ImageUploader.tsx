'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateImageFile, uploadImage, type UploadResult } from '@/lib/media/upload';
import { UploadProgress, type UploadFile } from './UploadProgress';

interface ImageUploaderProps {
  hotelId: string;
  type: 'hotel' | 'room-type';
  roomTypeId?: string;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  className?: string;
}

const ImageUploader = ({
  hotelId,
  type,
  roomTypeId,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  className,
}: ImageUploaderProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      // Validate max files
      if (acceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Initialize upload files
      const newUploadFiles: UploadFile[] = acceptedFiles.map((file) => ({
        file,
        status: 'pending',
        progress: 0,
      }));

      setUploadFiles(newUploadFiles);

      // Validate all files
      const validationErrors: string[] = [];
      for (let i = 0; i < acceptedFiles.length; i++) {
        const validation = validateImageFile(acceptedFiles[i]);
        if (!validation.valid) {
          validationErrors.push(`${acceptedFiles[i].name}: ${validation.error}`);
          newUploadFiles[i].status = 'error';
          newUploadFiles[i].error = validation.error;
        }
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join('; '));
        setUploadFiles([...newUploadFiles]);
        return;
      }

      // Start uploading
      setIsUploading(true);
      const results: UploadResult[] = [];

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];

        try {
          // Update status to uploading
          newUploadFiles[i].status = 'uploading';
          setUploadFiles([...newUploadFiles]);

          // Simulate progress (Supabase doesn't provide upload progress)
          const progressInterval = setInterval(() => {
            newUploadFiles[i].progress = Math.min(
              newUploadFiles[i].progress + 10,
              90
            );
            setUploadFiles([...newUploadFiles]);
          }, 200);

          // Upload file
          const result = await uploadImage(file, hotelId, type, roomTypeId);
          clearInterval(progressInterval);

          // Update status to success
          newUploadFiles[i].status = 'success';
          newUploadFiles[i].progress = 100;
          newUploadFiles[i].url = result.url;
          results.push(result);
        } catch (error) {
          // Update status to error
          newUploadFiles[i].status = 'error';
          newUploadFiles[i].error =
            error instanceof Error ? error.message : 'Upload failed';

          if (onUploadError) {
            onUploadError(error instanceof Error ? error : new Error('Upload failed'));
          }
        }

        setUploadFiles([...newUploadFiles]);
      }

      setIsUploading(false);

      // Call success callback with all successful uploads
      if (results.length > 0 && onUploadComplete) {
        onUploadComplete(results);
      }

      // Clear uploads after 3 seconds
      setTimeout(() => {
        setUploadFiles([]);
      }, 3000);
    },
    [hotelId, type, roomTypeId, maxFiles, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles,
    disabled: isUploading,
  });

  const handleCancelFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8',
          'transition-all duration-300 cursor-pointer',
          'bg-gradient-to-br from-[#F0EBE3]/30 to-white',
          isDragActive
            ? 'border-[#C4A484] bg-[#C4A484]/5 scale-[1.02]'
            : 'border-[#E8E0D5] hover:border-[#C4A484] hover:bg-[#F0EBE3]/50',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div
            className={cn(
              'mb-4 p-4 rounded-full',
              'bg-gradient-to-br from-[#C4A484]/10 to-[#C4A484]/5',
              'border border-[#C4A484]/20',
              'transition-transform duration-300',
              isDragActive && 'scale-110'
            )}
          >
            {isDragActive ? (
              <Upload className="w-8 h-8 text-[#C4A484] animate-bounce" />
            ) : (
              <ImageIcon className="w-8 h-8 text-[#C4A484]" />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <p className="text-base font-medium text-[#2C2C2C]">
              {isDragActive ? (
                'Drop your images here'
              ) : (
                <>
                  <span className="text-[#C4A484]">Click to upload</span> or
                  drag and drop
                </>
              )}
            </p>
            <p className="text-sm text-[#8B8B8B]">
              JPG, PNG or WEBP (max. {maxFiles} files, 5MB each)
            </p>
          </div>
        </div>

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
            <div className="text-center">
              <div className="inline-block p-3 rounded-full bg-[#C4A484]/10 mb-2">
                <Upload className="w-6 h-6 text-[#C4A484] animate-pulse" />
              </div>
              <p className="text-sm font-medium text-[#2C2C2C]">
                Uploading images...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg',
            'bg-red-50 border border-red-200'
          )}
        >
          <AlertCircle className="w-5 h-5 text-[#C45C5C] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#C45C5C]">Upload Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#2C2C2C]">
            Upload Progress
          </h3>
          <UploadProgress
            files={uploadFiles}
            onCancel={!isUploading ? handleCancelFile : undefined}
          />
        </div>
      )}
    </div>
  );
};

export { ImageUploader };
