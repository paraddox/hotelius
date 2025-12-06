'use client';

import { CheckCircle2, Loader2, XCircle, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  url?: string;
}

interface UploadProgressProps {
  files: UploadFile[];
  onCancel?: (index: number) => void;
}

const UploadProgress = ({ files, onCancel }: UploadProgressProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      {files.map((uploadFile, index) => (
        <UploadProgressItem
          key={`${uploadFile.file.name}-${index}`}
          uploadFile={uploadFile}
          onCancel={() => onCancel?.(index)}
        />
      ))}
    </div>
  );
};

interface UploadProgressItemProps {
  uploadFile: UploadFile;
  onCancel?: () => void;
}

const UploadProgressItem = ({ uploadFile, onCancel }: UploadProgressItemProps) => {
  const { file, status, progress, error } = uploadFile;

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-[#C4A484] animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-[#C45C5C]" />;
      default:
        return <Upload className="w-5 h-5 text-[#8B8B8B]" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${progress}%`;
      case 'success':
        return 'Upload complete';
      case 'error':
        return error || 'Upload failed';
      default:
        return 'Waiting...';
    }
  };

  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border p-4',
        'transition-all duration-200',
        status === 'error' ? 'border-[#C45C5C] bg-red-50/50' : 'border-[#E8E0D5]'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0">{getStatusIcon()}</div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#2C2C2C] truncate">
            {file.name}
          </p>
          <p
            className={cn(
              'text-xs mt-0.5',
              status === 'error' ? 'text-[#C45C5C]' : 'text-[#8B8B8B]'
            )}
          >
            {getStatusText()}
          </p>
        </div>

        {/* File Size */}
        <div className="flex-shrink-0 text-xs text-[#8B8B8B]">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </div>

        {/* Cancel Button */}
        {status === 'pending' && onCancel && (
          <button
            onClick={onCancel}
            className={cn(
              'flex-shrink-0 p-1.5 rounded-full',
              'text-[#8B8B8B] hover:text-[#2C2C2C]',
              'hover:bg-[#F0EBE3]',
              'transition-all duration-150'
            )}
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {status === 'uploading' && (
        <div className="mt-3">
          <div className="h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full bg-gradient-to-r from-[#C4A484] to-[#A67B5B]',
                'transition-all duration-300 ease-out'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { UploadProgress };
