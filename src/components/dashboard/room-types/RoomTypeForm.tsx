'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { DollarSign, Users, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { AmenitiesSelector } from './AmenitiesSelector';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { createRoomType, updateRoomType, deleteRoomType } from '@/lib/api/room-types';

// Zod schema for room type validation
const roomTypeSchema = z.object({
  nameEn: z.string().min(3, 'Room type name must be at least 3 characters'),
  nameEs: z.string().optional(),
  descriptionEn: z.string().min(10, 'Description must be at least 10 characters'),
  descriptionEs: z.string().optional(),
  basePrice: z.number()
    .min(1000, 'Price must be at least $10.00')
    .max(100000000, 'Price is too high'),
  maxOccupancyAdults: z.number()
    .min(1, 'Must allow at least 1 adult')
    .max(20, 'Maximum 20 adults'),
  maxOccupancyChildren: z.number()
    .min(0, 'Cannot be negative')
    .max(10, 'Maximum 10 children'),
  amenities: z.array(z.string()).min(1, 'Please select at least one amenity'),
  images: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']),
});

type RoomTypeFormData = z.infer<typeof roomTypeSchema>;

interface RoomTypeFormProps {
  mode: 'create' | 'edit';
  hotelId: string;
  defaultValues?: Partial<RoomTypeFormData> & { id?: string };
  onSuccess?: () => void;
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function RoomTypeForm({ mode, hotelId, defaultValues, onSuccess }: RoomTypeFormProps) {
  const t = useTranslations('dashboard.roomTypes.form');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState(
    defaultValues?.basePrice ? (defaultValues.basePrice / 100).toFixed(2) : ''
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      nameEn: defaultValues?.nameEn || '',
      nameEs: defaultValues?.nameEs || '',
      descriptionEn: defaultValues?.descriptionEn || '',
      descriptionEs: defaultValues?.descriptionEs || '',
      basePrice: defaultValues?.basePrice || 0,
      maxOccupancyAdults: defaultValues?.maxOccupancyAdults || 2,
      maxOccupancyChildren: defaultValues?.maxOccupancyChildren || 0,
      amenities: defaultValues?.amenities || [],
      images: defaultValues?.images || [],
      status: (defaultValues?.status as 'active' | 'inactive') || 'active',
    },
  });

  const amenities = watch('amenities');
  const images = watch('images') || [];

  // Handle price input (converts dollars to cents)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceDisplay(value);

    // Convert to cents for storage
    const dollars = parseFloat(value);
    if (!isNaN(dollars)) {
      setValue('basePrice', Math.round(dollars * 100));
    }
  };

  const onSubmit = async (data: RoomTypeFormData) => {
    setIsLoading(true);

    try {
      // Prepare multi-language data
      const roomTypeData = {
        name: {
          en: data.nameEn,
          ...(data.nameEs && { es: data.nameEs }),
        },
        description: {
          en: data.descriptionEn,
          ...(data.descriptionEs && { es: data.descriptionEs }),
        },
        basePrice: data.basePrice,
        maxOccupancyAdults: data.maxOccupancyAdults,
        maxOccupancyChildren: data.maxOccupancyChildren,
        amenities: data.amenities,
        images: data.images || [],
        status: data.status,
      };

      if (mode === 'create') {
        await createRoomType(hotelId, roomTypeData);
      } else if (defaultValues?.id) {
        await updateRoomType(defaultValues.id, roomTypeData);
      }

      // Redirect to list page
      router.push('/dashboard/room-types');
      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving room type:', error);
      alert('Failed to save room type. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!defaultValues?.id) return;

    setIsDeleting(true);

    try {
      await deleteRoomType(defaultValues.id);
      router.push('/dashboard/room-types');
      router.refresh();
    } catch (error) {
      console.error('Error deleting room type:', error);
      alert('Failed to delete room type. Please ensure no rooms are using this type.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Room Type Name (English)"
              placeholder="e.g., Deluxe Room"
              error={errors.nameEn?.message}
              {...register('nameEn')}
            />

            <Input
              label="Room Type Name (Spanish) - Optional"
              placeholder="e.g., Habitación Deluxe"
              error={errors.nameEs?.message}
              {...register('nameEs')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="descriptionEn"
                className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2"
              >
                Description (English)
              </label>
              <textarea
                id="descriptionEn"
                rows={3}
                placeholder="Describe the room type, its features, and what makes it special..."
                className="block w-full px-4 py-3 font-sans text-base text-[#2C2C2C] bg-white border rounded transition-all duration-150 placeholder:text-[#8B8B8B] focus:outline-none border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15"
                {...register('descriptionEn')}
              />
              {errors.descriptionEn && (
                <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
                  {errors.descriptionEn.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="descriptionEs"
                className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2"
              >
                Description (Spanish) - Optional
              </label>
              <textarea
                id="descriptionEs"
                rows={3}
                placeholder="Describe el tipo de habitación, sus características..."
                className="block w-full px-4 py-3 font-sans text-base text-[#2C2C2C] bg-white border rounded transition-all duration-150 placeholder:text-[#8B8B8B] focus:outline-none border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15"
                {...register('descriptionEs')}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Occupancy */}
        <div className="space-y-4">
          <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
            Pricing & Occupancy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
                Base Price (per night)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <DollarSign className="h-5 w-5 text-[#8B8B8B]" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  placeholder="150.00"
                  value={priceDisplay}
                  onChange={handlePriceChange}
                  className="block w-full pl-10 px-4 py-3 font-sans text-base text-[#2C2C2C] bg-white border rounded transition-all duration-150 placeholder:text-[#8B8B8B] focus:outline-none border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15"
                />
              </div>
              {errors.basePrice && (
                <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
                  {errors.basePrice.message}
                </p>
              )}
              <p className="mt-2 text-xs text-[#8B8B8B]">Starting rate before rate plans</p>
            </div>

            <Input
              type="number"
              label="Max Adults"
              min={1}
              max={20}
              error={errors.maxOccupancyAdults?.message}
              {...register('maxOccupancyAdults', { valueAsNumber: true })}
            />

            <Input
              type="number"
              label="Max Children"
              min={0}
              max={10}
              error={errors.maxOccupancyChildren?.message}
              {...register('maxOccupancyChildren', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Amenities */}
        <AmenitiesSelector
          selectedAmenities={amenities}
          onChange={(newAmenities) => setValue('amenities', newAmenities)}
          error={errors.amenities?.message}
        />

        {/* Photos */}
        <ImageUploader
          images={images}
          onChange={(newImages) => setValue('images', newImages)}
          maxImages={6}
          label="Room Photos"
          error={errors.images?.message}
        />

        {/* Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E8E0D5]">
          <div>
            {mode === 'edit' && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
                Delete Room Type
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/room-types')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              isLoading={isLoading}
            >
              {mode === 'create' ? 'Create Room Type' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Room Type"
        description="Are you sure you want to delete this room type? This action cannot be undone."
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-[#FFF3E0] border border-[#D4A574] rounded-lg p-4">
            <p className="text-sm text-[#2C2C2C]">
              <strong>Warning:</strong> Deleting this room type will affect all associated rooms and rate plans.
              Make sure no bookings are using this room type.
            </p>
          </div>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Permanently
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}
