'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { DollarSign, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { MultiLanguageInput } from '@/components/ui/MultiLanguageInput';
import { AmenitiesSelector } from './AmenitiesSelector';
import { PhotoUploader } from './PhotoUploader';
import { OccupancySettingsComponent, occupancySchema } from './OccupancySettings';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { createRoomType, updateRoomType, deleteRoomType } from '@/lib/api/room-types';

// Zod schema for room type validation
const roomTypeSchema = z.object({
  name: z.record(z.string(), z.string().min(1)).refine(
    (data) => data.en && data.en.length >= 3,
    { message: 'English name must be at least 3 characters' }
  ),
  description: z.record(z.string(), z.string().min(1)).refine(
    (data) => data.en && data.en.length >= 10,
    { message: 'English description must be at least 10 characters' }
  ),
  basePrice: z.number()
    .min(1000, 'Price must be at least $10.00')
    .max(100000000, 'Price is too high'),
  maxOccupancyAdults: z.number()
    .min(1, 'Must allow at least 1 adult')
    .max(20, 'Maximum 20 adults'),
  maxOccupancyChildren: z.number()
    .min(0, 'Cannot be negative')
    .max(10, 'Maximum 10 children'),
  baseOccupancy: z.number().min(1).max(20).optional(),
  extraGuestCharge: z.number().min(0).max(100000).optional(),
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
    control,
    formState: { errors },
  } = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      name: defaultValues?.name || { en: '', es: '' },
      description: defaultValues?.description || { en: '', es: '' },
      basePrice: defaultValues?.basePrice || 0,
      maxOccupancyAdults: defaultValues?.maxOccupancyAdults || 2,
      maxOccupancyChildren: defaultValues?.maxOccupancyChildren || 0,
      baseOccupancy: defaultValues?.baseOccupancy || 2,
      extraGuestCharge: defaultValues?.extraGuestCharge || 0,
      amenities: defaultValues?.amenities || [],
      images: defaultValues?.images || [],
      status: (defaultValues?.status as 'active' | 'inactive') || 'active',
    },
  });

  const amenities = watch('amenities');
  const images = watch('images') || [];
  const name = watch('name');
  const description = watch('description');

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
      // Prepare room type data
      const roomTypeData = {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        maxOccupancyAdults: data.maxOccupancyAdults,
        maxOccupancyChildren: data.maxOccupancyChildren,
        baseOccupancy: data.baseOccupancy,
        extraGuestCharge: data.extraGuestCharge,
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

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <MultiLanguageInput
                label="Room Type Name"
                value={field.value}
                onChange={field.onChange}
                error={errors.name?.message as string | undefined}
                required
                placeholder={{
                  en: 'e.g., Deluxe Room',
                  es: 'e.g., Habitación Deluxe',
                }}
                hint="Enter the room type name in multiple languages for international guests"
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <MultiLanguageInput
                label="Description"
                type="textarea"
                value={field.value}
                onChange={field.onChange}
                error={errors.description?.message as string | undefined}
                required
                rows={4}
                maxLength={500}
                placeholder={{
                  en: 'Describe the room type, its features, and what makes it special...',
                  es: 'Describe el tipo de habitación, sus características...',
                }}
                hint="Provide a detailed description highlighting unique features and amenities"
              />
            )}
          />
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
            Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Occupancy Settings */}
        <Controller
          name="maxOccupancyAdults"
          control={control}
          render={({ field }) => (
            <OccupancySettingsComponent
              value={{
                maxOccupancyAdults: watch('maxOccupancyAdults'),
                maxOccupancyChildren: watch('maxOccupancyChildren'),
                baseOccupancy: watch('baseOccupancy'),
                extraGuestCharge: watch('extraGuestCharge'),
              }}
              onChange={(occupancy) => {
                setValue('maxOccupancyAdults', occupancy.maxOccupancyAdults);
                setValue('maxOccupancyChildren', occupancy.maxOccupancyChildren);
                setValue('baseOccupancy', occupancy.baseOccupancy);
                setValue('extraGuestCharge', occupancy.extraGuestCharge);
              }}
              errors={{
                maxOccupancyAdults: errors.maxOccupancyAdults?.message,
                maxOccupancyChildren: errors.maxOccupancyChildren?.message,
                baseOccupancy: errors.baseOccupancy?.message,
                extraGuestCharge: errors.extraGuestCharge?.message,
              }}
              showAdvanced={true}
            />
          )}
        />

        {/* Amenities */}
        <AmenitiesSelector
          selectedAmenities={amenities}
          onChange={(newAmenities) => setValue('amenities', newAmenities)}
          error={errors.amenities?.message}
        />

        {/* Photos */}
        <PhotoUploader
          images={images}
          onChange={(newImages) => setValue('images', newImages)}
          maxImages={6}
          label="Room Photos"
          error={errors.images?.message}
          bucket="room-images"
          pathPrefix={`room-types/${hotelId}`}
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
