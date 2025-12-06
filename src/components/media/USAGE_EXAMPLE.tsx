/**
 * USAGE EXAMPLE: Hotel Photo Management
 *
 * This file demonstrates how to integrate the media management system
 * into your hotel or room type pages.
 *
 * Copy this code and adapt it to your needs.
 */

'use client';

import { useState, useEffect } from 'react';
import { ImageUploader, PhotoGallery } from '@/components/media';
import type { Photo } from '@/components/media';
import { deleteImage } from '@/lib/media';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface HotelPhotosManagerProps {
  hotelId: string;
}

export function HotelPhotosManager({ hotelId }: HotelPhotosManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const t = useTranslations('HotelPhotos');
  const supabase = createClient();

  // Load photos from database
  useEffect(() => {
    loadPhotos();
  }, [hotelId]);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('hotel_photos')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upload complete
  const handleUploadComplete = async (results: any[]) => {
    try {
      // Prepare photo records
      const photoRecords = results.map((result, index) => ({
        hotel_id: hotelId,
        url: result.url,
        storage_path: result.storagePath,
        width: result.metadata.width,
        height: result.metadata.height,
        file_size_bytes: result.metadata.fileSize,
        mime_type: result.metadata.mimeType,
        sort_order: photos.length + index,
        is_active: true,
        is_featured: photos.length === 0 && index === 0, // First photo is featured if no photos exist
      }));

      // Insert into database
      const { error } = await supabase
        .from('hotel_photos')
        .insert(photoRecords);

      if (error) throw error;

      // Reload photos
      await loadPhotos();
      setShowUploader(false);
    } catch (error) {
      console.error('Error saving photos:', error);
    }
  };

  // Handle photo deletion
  const handleDelete = async (photoId: string) => {
    try {
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) return;

      // Delete from storage
      await deleteImage(photo.storage_path);

      // Delete from database (soft delete)
      const { error } = await supabase
        .from('hotel_photos')
        .update({ is_active: false })
        .eq('id', photoId);

      if (error) throw error;

      // Reload photos
      await loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  // Handle alt text update
  const handleUpdateAlt = async (photoId: string, altText: string) => {
    try {
      const { error } = await supabase
        .from('hotel_photos')
        .update({ alt_text: altText })
        .eq('id', photoId);

      if (error) throw error;

      // Reload photos
      await loadPhotos();
    } catch (error) {
      console.error('Error updating alt text:', error);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (photoId: string) => {
    try {
      // First, unfeatured all photos
      await supabase
        .from('hotel_photos')
        .update({ is_featured: false })
        .eq('hotel_id', hotelId);

      // Then, set the selected photo as featured
      const { error } = await supabase
        .from('hotel_photos')
        .update({ is_featured: true })
        .eq('id', photoId);

      if (error) throw error;

      // Reload photos
      await loadPhotos();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  // Handle photo reordering
  const handleReorder = async (reorderedPhotos: Photo[]) => {
    try {
      // Update sort_order for all photos
      const updates = reorderedPhotos.map((photo) =>
        supabase
          .from('hotel_photos')
          .update({ sort_order: photo.sort_order })
          .eq('id', photo.id)
      );

      await Promise.all(updates);

      // Reload photos
      await loadPhotos();
    } catch (error) {
      console.error('Error reordering photos:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-medium text-[#2C2C2C]">
            Photo Gallery
          </h2>
          <p className="text-sm text-[#8B8B8B] mt-1">
            Manage your hotel photos. Drag to reorder, click to edit.
          </p>
        </div>
        <Button
          variant="accent"
          onClick={() => setShowUploader(!showUploader)}
        >
          {showUploader ? 'Hide Uploader' : 'Upload Photos'}
        </Button>
      </div>

      {/* Uploader */}
      {showUploader && (
        <Card>
          <ImageUploader
            hotelId={hotelId}
            type="hotel"
            onUploadComplete={handleUploadComplete}
            maxFiles={10}
          />
        </Card>
      )}

      {/* Gallery */}
      <Card>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#8B8B8B]">Loading photos...</p>
          </div>
        ) : (
          <PhotoGallery
            photos={photos}
            onDelete={handleDelete}
            onUpdateAlt={handleUpdateAlt}
            onToggleFeatured={handleToggleFeatured}
            onReorder={handleReorder}
          />
        )}
      </Card>
    </div>
  );
}

/**
 * ROOM TYPE PHOTOS EXAMPLE
 */

interface RoomTypePhotosManagerProps {
  hotelId: string;
  roomTypeId: string;
}

export function RoomTypePhotosManager({
  hotelId,
  roomTypeId,
}: RoomTypePhotosManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadPhotos();
  }, [roomTypeId]);

  const loadPhotos = async () => {
    const { data } = await supabase
      .from('room_type_photos')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .eq('is_active', true)
      .order('sort_order');

    setPhotos(data || []);
  };

  const handleUploadComplete = async (results: any[]) => {
    const photoRecords = results.map((result, index) => ({
      room_type_id: roomTypeId,
      url: result.url,
      storage_path: result.storagePath,
      width: result.metadata.width,
      height: result.metadata.height,
      file_size_bytes: result.metadata.fileSize,
      mime_type: result.metadata.mimeType,
      sort_order: photos.length + index,
      is_active: true,
      is_featured: photos.length === 0 && index === 0,
    }));

    await supabase.from('room_type_photos').insert(photoRecords);
    await loadPhotos();
  };

  const handleDelete = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (photo) {
      await deleteImage(photo.storage_path);
      await supabase
        .from('room_type_photos')
        .update({ is_active: false })
        .eq('id', photoId);
      await loadPhotos();
    }
  };

  const handleUpdateAlt = async (photoId: string, altText: string) => {
    await supabase
      .from('room_type_photos')
      .update({ alt_text: altText })
      .eq('id', photoId);
    await loadPhotos();
  };

  const handleToggleFeatured = async (photoId: string) => {
    await supabase
      .from('room_type_photos')
      .update({ is_featured: false })
      .eq('room_type_id', roomTypeId);

    await supabase
      .from('room_type_photos')
      .update({ is_featured: true })
      .eq('id', photoId);

    await loadPhotos();
  };

  const handleReorder = async (reorderedPhotos: Photo[]) => {
    const updates = reorderedPhotos.map((photo) =>
      supabase
        .from('room_type_photos')
        .update({ sort_order: photo.sort_order })
        .eq('id', photo.id)
    );

    await Promise.all(updates);
    await loadPhotos();
  };

  return (
    <div className="space-y-6">
      <Card>
        <ImageUploader
          hotelId={hotelId}
          type="room-type"
          roomTypeId={roomTypeId}
          onUploadComplete={handleUploadComplete}
          maxFiles={8}
        />
      </Card>

      <Card>
        <PhotoGallery
          photos={photos}
          onDelete={handleDelete}
          onUpdateAlt={handleUpdateAlt}
          onToggleFeatured={handleToggleFeatured}
          onReorder={handleReorder}
        />
      </Card>
    </div>
  );
}
