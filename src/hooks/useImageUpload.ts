'use client';

import { useState, useCallback, useRef } from 'react';
import {
  uploadImage,
  deleteImage,
  validateImage,
  resizeImage,
} from '@/lib/storage/upload';
import type { BucketName } from '@/lib/storage/buckets';

export interface UploadState {
  isUploading: boolean;
  progress: { [fileId: string]: number };
  errors: { [fileId: string]: string };
  uploadedUrls: string[];
}

export interface UseImageUploadOptions {
  bucket: BucketName;
  path: string;
  maxSize?: number;
  allowedTypes?: string[];
  autoResize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (fileId: string, progress: number) => void;
}

export interface UploadItem {
  file: File;
  id: string;
  controller: AbortController;
}

/**
 * Hook for managing image uploads with progress tracking, error handling, and retry logic
 */
export function useImageUpload(options: UseImageUploadOptions) {
  const {
    bucket,
    path,
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    autoResize = false,
    maxWidth = 1920,
    maxHeight = 1080,
    onSuccess,
    onError,
    onProgress,
  } = options;

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: {},
    errors: {},
    uploadedUrls: [],
  });

  const uploadsRef = useRef<Map<string, UploadItem>>(new Map());

  /**
   * Validates a file before upload
   */
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      return validateImage(file, maxSize, allowedTypes);
    },
    [maxSize, allowedTypes]
  );

  /**
   * Uploads a single file
   */
  const uploadFile = useCallback(
    async (file: File, fileId: string): Promise<string> => {
      try {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Auto-resize if enabled
        let fileToUpload: File | Blob = file;
        if (autoResize) {
          setState((prev) => ({
            ...prev,
            progress: { ...prev.progress, [fileId]: 10 },
          }));
          onProgress?.(fileId, 10);

          fileToUpload = await resizeImage(file, maxWidth, maxHeight);
        }

        // Simulate progress updates (Supabase doesn't provide real progress)
        const progressInterval = setInterval(() => {
          setState((prev) => {
            const currentProgress = prev.progress[fileId] || 0;
            if (currentProgress < 90) {
              const newProgress = Math.min(currentProgress + 10, 90);
              onProgress?.(fileId, newProgress);
              return {
                ...prev,
                progress: { ...prev.progress, [fileId]: newProgress },
              };
            }
            return prev;
          });
        }, 200);

        // Upload file
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const fullPath = `${path}/${fileName}`;
        const url = await uploadImage(fileToUpload as File, bucket, fullPath);

        clearInterval(progressInterval);

        // Update progress to 100%
        setState((prev) => ({
          ...prev,
          progress: { ...prev.progress, [fileId]: 100 },
        }));
        onProgress?.(fileId, 100);

        return url;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        setState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [fileId]: errorMessage },
        }));
        throw error;
      }
    },
    [
      bucket,
      path,
      validateFile,
      autoResize,
      maxWidth,
      maxHeight,
      onProgress,
    ]
  );

  /**
   * Uploads multiple files
   */
  const upload = useCallback(
    async (files: File[]): Promise<string[]> => {
      setState({
        isUploading: true,
        progress: {},
        errors: {},
        uploadedUrls: [],
      });

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const controller = new AbortController();

        uploadsRef.current.set(fileId, {
          file,
          id: fileId,
          controller,
        });

        try {
          const url = await uploadFile(file, fileId);
          uploadedUrls.push(url);
          onSuccess?.(url);
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Upload failed');
          onError?.(err);
        } finally {
          uploadsRef.current.delete(fileId);
        }
      }

      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadedUrls,
      }));

      return uploadedUrls;
    },
    [uploadFile, onSuccess, onError]
  );

  /**
   * Retries a failed upload
   */
  const retry = useCallback(
    async (fileId: string): Promise<string | null> => {
      const upload = uploadsRef.current.get(fileId);
      if (!upload) {
        return null;
      }

      // Clear previous error
      setState((prev) => {
        const newErrors = { ...prev.errors };
        delete newErrors[fileId];
        return { ...prev, errors: newErrors };
      });

      try {
        const url = await uploadFile(upload.file, fileId);
        onSuccess?.(url);
        return url;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Retry failed');
        onError?.(err);
        return null;
      }
    },
    [uploadFile, onSuccess, onError]
  );

  /**
   * Cancels an ongoing upload
   */
  const cancel = useCallback((fileId: string) => {
    const upload = uploadsRef.current.get(fileId);
    if (upload) {
      upload.controller.abort();
      uploadsRef.current.delete(fileId);

      setState((prev) => {
        const newProgress = { ...prev.progress };
        const newErrors = { ...prev.errors };
        delete newProgress[fileId];
        delete newErrors[fileId];

        return {
          ...prev,
          progress: newProgress,
          errors: newErrors,
        };
      });
    }
  }, []);

  /**
   * Cancels all ongoing uploads
   */
  const cancelAll = useCallback(() => {
    uploadsRef.current.forEach((upload) => {
      upload.controller.abort();
    });
    uploadsRef.current.clear();

    setState({
      isUploading: false,
      progress: {},
      errors: {},
      uploadedUrls: [],
    });
  }, []);

  /**
   * Deletes an uploaded image
   */
  const deleteUploadedImage = useCallback(
    async (url: string): Promise<void> => {
      try {
        // Extract path from URL
        const urlObj = new URL(url);
        const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
        if (!pathMatch) {
          throw new Error('Invalid URL format');
        }

        const imagePath = pathMatch[1];
        await deleteImage(bucket, imagePath);

        setState((prev) => ({
          ...prev,
          uploadedUrls: prev.uploadedUrls.filter((u) => u !== url),
        }));
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('Delete failed');
        onError?.(err);
        throw err;
      }
    },
    [bucket, onError]
  );

  /**
   * Resets the upload state
   */
  const reset = useCallback(() => {
    cancelAll();
  }, [cancelAll]);

  return {
    // State
    isUploading: state.isUploading,
    progress: state.progress,
    errors: state.errors,
    uploadedUrls: state.uploadedUrls,

    // Methods
    upload,
    retry,
    cancel,
    cancelAll,
    deleteUploadedImage,
    reset,
    validateFile,
  };
}

/**
 * Hook for uploading a single image
 */
export function useSingleImageUpload(options: UseImageUploadOptions) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadHook = useImageUpload({
    ...options,
    onSuccess: (url) => {
      setCurrentUrl(url);
      setError(null);
      options.onSuccess?.(url);
    },
    onError: (err) => {
      setError(err.message);
      options.onError?.(err);
    },
  });

  const uploadSingle = useCallback(
    async (file: File): Promise<string | null> => {
      const urls = await uploadHook.upload([file]);
      return urls[0] || null;
    },
    [uploadHook]
  );

  const remove = useCallback(async () => {
    if (currentUrl) {
      await uploadHook.deleteUploadedImage(currentUrl);
      setCurrentUrl(null);
      setError(null);
    }
  }, [currentUrl, uploadHook]);

  return {
    url: currentUrl,
    error,
    isUploading: uploadHook.isUploading,
    progress: Object.values(uploadHook.progress)[0] || 0,
    upload: uploadSingle,
    remove,
    reset: () => {
      setCurrentUrl(null);
      setError(null);
      uploadHook.reset();
    },
  };
}
