'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Trash2, Star, GripVertical, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  onDelete?: (imageId: string) => void;
  onSetPrimary?: (imageId: string) => void;
  onReorder?: (imageIds: string[]) => void;
  canEdit?: boolean;
  className?: string;
}

export function ImageGallery({
  images,
  onDelete,
  onSetPrimary,
  onReorder,
  canEdit = false,
  className,
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [orderedImages, setOrderedImages] = useState(images);

  // Update ordered images when prop changes
  useEffect(() => {
    setOrderedImages(images);
  }, [images]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % orderedImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + orderedImages.length) % orderedImages.length);
  };

  const handleDelete = (imageId: string) => {
    onDelete?.(imageId);
    setDeleteConfirmId(null);
  };

  const handleSetPrimary = (imageId: string) => {
    onSetPrimary?.(imageId);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        return;
      }

      const newImages = [...orderedImages];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, draggedImage);

      setOrderedImages(newImages);
      setDraggedIndex(null);

      // Notify parent of new order
      onReorder?.(newImages.map((img) => img.id));
    },
    [draggedIndex, orderedImages, onReorder]
  );

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') previousImage();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, currentImageIndex]);

  if (orderedImages.length === 0) {
    return (
      <div className={cn('text-center py-12 px-4', className)}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F0EBE3] flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-[#8B8B8B]" />
        </div>
        <p className="text-sm text-[#8B8B8B]">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {orderedImages.map((image, index) => (
            <div
              key={image.id}
              draggable={canEdit && onReorder !== undefined}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group relative aspect-square rounded-xl overflow-hidden',
                'bg-[#F0EBE3] border-2 transition-all duration-200',
                image.isPrimary
                  ? 'border-[#C4A484] ring-2 ring-[#C4A484]/20'
                  : 'border-[#E8E0D5] hover:border-[#C4A484]/50',
                draggedIndex === index && 'opacity-50 scale-95',
                canEdit && onReorder && 'cursor-move'
              )}
            >
              {/* Image */}
              <img
                src={image.url}
                alt={image.alt || `Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Overlay */}
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/80 via-[#2C2C2C]/20 to-transparent',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                )}
              />

              {/* Primary badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2">
                  <Badge variant="accent" size="sm" className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </Badge>
                </div>
              )}

              {/* Drag handle */}
              {canEdit && onReorder && (
                <div
                  className={cn(
                    'absolute top-2 left-2',
                    'w-8 h-8 rounded-lg bg-[#2C2C2C]/80 backdrop-blur-sm',
                    'flex items-center justify-center',
                    'text-white cursor-move',
                    'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                    image.isPrimary && 'left-auto right-2'
                  )}
                >
                  <GripVertical className="w-4 h-4" />
                </div>
              )}

              {/* Action buttons */}
              <div
                className={cn(
                  'absolute bottom-2 left-2 right-2',
                  'flex items-center gap-2',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                )}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openLightbox(index)}
                  className="flex-1 text-xs bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <ZoomIn className="w-3 h-3" />
                  View
                </Button>

                {canEdit && (
                  <>
                    {!image.isPrimary && onSetPrimary && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetPrimary(image.id)}
                        className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-[#C4A484] hover:text-white"
                        title="Set as primary"
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                    )}

                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmId(image.id)}
                        className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-[#C45C5C] hover:text-white"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-[#2C2C2C]/95 backdrop-blur-sm">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className={cn(
                'absolute top-4 right-4 z-10',
                'w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm',
                'flex items-center justify-center',
                'text-white hover:bg-white/20',
                'transition-all duration-200'
              )}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            {orderedImages.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className={cn(
                    'absolute left-4 top-1/2 -translate-y-1/2 z-10',
                    'w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm',
                    'flex items-center justify-center',
                    'text-white hover:bg-white/20',
                    'transition-all duration-200'
                  )}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextImage}
                  className={cn(
                    'absolute right-4 top-1/2 -translate-y-1/2 z-10',
                    'w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm',
                    'flex items-center justify-center',
                    'text-white hover:bg-white/20',
                    'transition-all duration-200'
                  )}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="max-w-7xl max-h-full flex flex-col items-center gap-4">
              <img
                src={orderedImages[currentImageIndex].url}
                alt={orderedImages[currentImageIndex].alt || `Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[calc(100vh-8rem)] object-contain rounded-lg"
              />

              {/* Image info */}
              <div className="text-center text-white space-y-1">
                {orderedImages[currentImageIndex].alt && (
                  <p className="text-sm">{orderedImages[currentImageIndex].alt}</p>
                )}
                <p className="text-xs text-white/60">
                  {currentImageIndex + 1} of {orderedImages.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        size="sm"
      >
        <div className="flex gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirmId(null)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
