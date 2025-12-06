'use client';

import { useState, useEffect } from 'react';
import { GripVertical, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImagePreview } from './ImagePreview';
import { EmptyState } from '@/components/ui/EmptyState';

export interface Photo {
  id: string;
  url: string;
  storage_path: string;
  alt_text?: string;
  caption?: Record<string, string>;
  is_featured: boolean;
  sort_order: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onDelete?: (photoId: string) => Promise<void>;
  onUpdateAlt?: (photoId: string, altText: string) => Promise<void>;
  onToggleFeatured?: (photoId: string) => Promise<void>;
  onReorder?: (photos: Photo[]) => Promise<void>;
  className?: string;
}

const PhotoGallery = ({
  photos,
  onDelete,
  onUpdateAlt,
  onToggleFeatured,
  onReorder,
  className,
}: PhotoGalleryProps) => {
  const [sortedPhotos, setSortedPhotos] = useState<Photo[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sort photos by sort_order
  useEffect(() => {
    const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
    setSortedPhotos(sorted);
  }, [photos]);

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null || dragOverIndex === null) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder photos
    const newPhotos = [...sortedPhotos];
    const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(dragOverIndex, 0, draggedPhoto);

    // Update sort_order
    const reorderedPhotos = newPhotos.map((photo, index) => ({
      ...photo,
      sort_order: index,
    }));

    setSortedPhotos(reorderedPhotos);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Call onReorder callback
    if (onReorder) {
      await onReorder(reorderedPhotos);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!onDelete) return;
    await onDelete(photoId);
  };

  const handleUpdateAlt = async (photoId: string, altText: string) => {
    if (!onUpdateAlt) return;
    await onUpdateAlt(photoId, altText);
  };

  const handleToggleFeatured = async (photoId: string) => {
    if (!onToggleFeatured) return;
    await onToggleFeatured(photoId);
  };

  if (sortedPhotos.length === 0) {
    return (
      <EmptyState
        icon="image"
        title="No photos yet"
        description="Upload photos to create your gallery"
      />
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Featured Photo */}
      {sortedPhotos.some((p) => p.is_featured) && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#2C2C2C] flex items-center gap-2">
            <Star className="w-4 h-4 text-[#C4A484] fill-current" />
            Featured Photo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPhotos
              .filter((photo) => photo.is_featured)
              .map((photo) => (
                <ImagePreview
                  key={photo.id}
                  id={photo.id}
                  url={photo.url}
                  alt={photo.alt_text}
                  caption={photo.caption}
                  isFeatured={photo.is_featured}
                  onDelete={onDelete ? handleDelete : undefined}
                  onUpdateAlt={onUpdateAlt ? handleUpdateAlt : undefined}
                  onToggleFeatured={
                    onToggleFeatured ? handleToggleFeatured : undefined
                  }
                />
              ))}
          </div>
        </div>
      )}

      {/* All Photos Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#2C2C2C]">
            All Photos ({sortedPhotos.length})
          </h3>
          {onReorder && (
            <p className="text-xs text-[#8B8B8B]">
              Drag to reorder
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              draggable={!!onReorder}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'relative group transition-all duration-200',
                onReorder && 'cursor-move',
                draggedIndex === index && 'opacity-50',
                dragOverIndex === index &&
                  draggedIndex !== null &&
                  draggedIndex !== index &&
                  'scale-105'
              )}
            >
              {/* Drag Handle */}
              {onReorder && (
                <div
                  className={cn(
                    'absolute top-2 left-2 z-10',
                    'p-1.5 rounded-full backdrop-blur-sm',
                    'bg-white/90 text-[#8B8B8B]',
                    'opacity-0 group-hover:opacity-100',
                    'transition-opacity duration-200',
                    'cursor-move'
                  )}
                >
                  <GripVertical className="w-4 h-4" />
                </div>
              )}

              <ImagePreview
                id={photo.id}
                url={photo.url}
                alt={photo.alt_text}
                caption={photo.caption}
                isFeatured={photo.is_featured}
                onDelete={onDelete ? handleDelete : undefined}
                onUpdateAlt={onUpdateAlt ? handleUpdateAlt : undefined}
                onToggleFeatured={
                  onToggleFeatured ? handleToggleFeatured : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { PhotoGallery };
