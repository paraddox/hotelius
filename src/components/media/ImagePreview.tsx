'use client';

import { useState } from 'react';
import { Trash2, Edit3, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslations } from 'next-intl';

export interface ImagePreviewProps {
  id: string;
  url: string;
  alt?: string;
  caption?: Record<string, string>;
  isFeatured?: boolean;
  onDelete?: (id: string) => void;
  onUpdateAlt?: (id: string, alt: string) => void;
  onToggleFeatured?: (id: string) => void;
  className?: string;
}

const ImagePreview = ({
  id,
  url,
  alt,
  caption,
  isFeatured = false,
  onDelete,
  onUpdateAlt,
  onToggleFeatured,
  className,
}: ImagePreviewProps) => {
  const [showFullSize, setShowFullSize] = useState(false);
  const [showEditAlt, setShowEditAlt] = useState(false);
  const [editedAlt, setEditedAlt] = useState(alt || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveAlt = () => {
    onUpdateAlt?.(id, editedAlt);
    setShowEditAlt(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Thumbnail */}
      <div className={cn('group relative', className)}>
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#C4A484] text-white text-xs font-medium shadow-md">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          </div>
        )}

        {/* Image */}
        <div
          onClick={() => setShowFullSize(true)}
          className={cn(
            'relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer',
            'border border-[#E8E0D5]',
            'transition-all duration-300',
            'group-hover:shadow-[0_8px_16px_rgba(44,44,44,0.1)]',
            'group-hover:scale-[1.02]'
          )}
        >
          <img
            src={url}
            alt={alt || 'Hotel image'}
            className="w-full h-full object-cover"
          />

          {/* Overlay on Hover */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/80 via-[#2C2C2C]/20 to-transparent',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-300'
            )}
          />
        </div>

        {/* Action Buttons */}
        <div
          className={cn(
            'absolute bottom-3 right-3 flex items-center gap-2',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-300'
          )}
        >
          {/* Toggle Featured */}
          {onToggleFeatured && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFeatured(id);
              }}
              className={cn(
                'p-2 rounded-full backdrop-blur-sm',
                'transition-all duration-150',
                isFeatured
                  ? 'bg-[#C4A484] text-white'
                  : 'bg-white/90 text-[#8B8B8B] hover:text-[#C4A484]'
              )}
              title={isFeatured ? 'Remove from featured' : 'Set as featured'}
            >
              <Star className={cn('w-4 h-4', isFeatured && 'fill-current')} />
            </button>
          )}

          {/* Edit Alt Text */}
          {onUpdateAlt && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditAlt(true);
              }}
              className={cn(
                'p-2 rounded-full backdrop-blur-sm',
                'bg-white/90 text-[#8B8B8B]',
                'hover:text-[#2C2C2C]',
                'transition-all duration-150'
              )}
              title="Edit alt text"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Delete */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className={cn(
                'p-2 rounded-full backdrop-blur-sm',
                'bg-white/90 text-[#8B8B8B]',
                'hover:text-[#C45C5C] hover:bg-red-50',
                'transition-all duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              title="Delete image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Alt Text (if exists) */}
        {alt && (
          <p className="mt-2 text-xs text-[#8B8B8B] line-clamp-2">{alt}</p>
        )}
      </div>

      {/* Full Size Modal */}
      <Modal
        isOpen={showFullSize}
        onClose={() => setShowFullSize(false)}
        size="full"
      >
        <div className="relative">
          <img
            src={url}
            alt={alt || 'Hotel image'}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
          {alt && (
            <p className="mt-4 text-sm text-[#8B8B8B] text-center">{alt}</p>
          )}
        </div>
      </Modal>

      {/* Edit Alt Text Modal */}
      <Modal
        isOpen={showEditAlt}
        onClose={() => setShowEditAlt(false)}
        title="Edit Alt Text"
        description="Provide a descriptive alt text for accessibility and SEO"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Alt Text
            </label>
            <Input
              value={editedAlt}
              onChange={(e) => setEditedAlt(e.target.value)}
              placeholder="e.g., Luxury hotel room with ocean view"
              className="w-full"
            />
            <p className="mt-1.5 text-xs text-[#8B8B8B]">
              Describe what's in the image. Keep it concise and descriptive.
            </p>
          </div>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowEditAlt(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAlt}>
              Save Alt Text
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
};

export { ImagePreview };
