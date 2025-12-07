'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Building2, Hash, Layers, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { RoomStatusBadge, RoomStatus } from './RoomStatusBadge';
import { fetchRoomTypes } from '@/lib/api/rooms';

// Zod schema for room validation
const roomSchema = z.object({
  roomNumber: z.string()
    .min(1, 'Room number is required')
    .max(10, 'Room number must be at most 10 characters')
    .regex(/^[A-Za-z0-9-]+$/, 'Room number can only contain letters, numbers, and hyphens'),
  floor: z.number()
    .min(0, 'Floor must be at least 0')
    .max(100, 'Floor must be at most 100'),
  roomTypeId: z.string().min(1, 'Please select a room type'),
  status: z.enum(['available', 'occupied', 'maintenance', 'out_of_service'] as const),
  notes: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomFormProps {
  mode: 'create' | 'edit';
  hotelId: string;
  defaultValues?: Partial<RoomFormData> & { id?: string };
  onSubmit: (data: RoomFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'out_of_service', label: 'Out of Service' },
];

export function RoomForm({ mode, hotelId, defaultValues, onSubmit, onDelete }: RoomFormProps) {
  const t = useTranslations('dashboard.rooms.form');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roomTypeOptions, setRoomTypeOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: defaultValues?.roomNumber || '',
      floor: defaultValues?.floor || 1,
      roomTypeId: defaultValues?.roomTypeId || '',
      status: defaultValues?.status || 'available',
      notes: defaultValues?.notes || '',
    },
  });

  const selectedStatus = watch('status') as RoomStatus;

  // Load room types
  useEffect(() => {
    async function loadRoomTypes() {
      try {
        setIsLoadingRoomTypes(true);
        const types = await fetchRoomTypes(hotelId);
        setRoomTypeOptions([
          { value: '', label: 'Select room type' },
          ...types,
        ]);
      } catch (error) {
        console.error('Error loading room types:', error);
        // Fallback to default options
        setRoomTypeOptions([
          { value: '', label: 'Select room type' },
          { value: 'Standard Room', label: 'Standard Room' },
          { value: 'Deluxe Room', label: 'Deluxe Room' },
          { value: 'Suite', label: 'Suite' },
          { value: 'Executive Suite', label: 'Executive Suite' },
        ]);
      } finally {
        setIsLoadingRoomTypes(false);
      }
    }

    loadRoomTypes();
  }, [hotelId]);

  const handleFormSubmit = async (data: RoomFormData) => {
    setIsLoading(true);

    try {
      await onSubmit(data);
      router.push('/dashboard/rooms');
      router.refresh();
    } catch (error) {
      console.error('Error saving room:', error);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this room? This action cannot be undone.'
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await onDelete();
      router.push('/dashboard/rooms');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting room:', error);
      alert(error.message || 'Failed to delete room');
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
              Room Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Hash className="h-5 w-5 text-[#8B8B8B]" />
              </div>
              <input
                type="text"
                placeholder="101"
                {...register('roomNumber')}
                className="block w-full pl-10 px-4 py-3 font-sans text-base text-[#2C2C2C] bg-white border rounded transition-all duration-150 placeholder:text-[#8B8B8B] focus:outline-none border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15"
              />
            </div>
            {errors.roomNumber && (
              <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
                {errors.roomNumber.message}
              </p>
            )}
            <p className="mt-2 text-xs text-[#8B8B8B]">Unique identifier for the room</p>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
              Floor Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Layers className="h-5 w-5 text-[#8B8B8B]" />
              </div>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="1"
                {...register('floor', { valueAsNumber: true })}
                className="block w-full pl-10 px-4 py-3 font-sans text-base text-[#2C2C2C] bg-white border rounded transition-all duration-150 placeholder:text-[#8B8B8B] focus:outline-none border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15"
              />
            </div>
            {errors.floor && (
              <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
                {errors.floor.message}
              </p>
            )}
          </div>
        </div>

        <Select
          label="Room Type"
          options={roomTypeOptions}
          error={errors.roomTypeId?.message}
          disabled={isLoadingRoomTypes}
          {...register('roomTypeId')}
        />
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          Status
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Select
              label="Current Status"
              options={statusOptions}
              error={errors.status?.message}
              {...register('status')}
            />
            <div className="mt-6">
              <RoomStatusBadge status={selectedStatus} />
            </div>
          </div>

          {selectedStatus === 'maintenance' && (
            <div className="flex items-start gap-3 p-4 bg-[#FFF3E0] border border-[#D4A574] rounded-lg">
              <AlertCircle className="h-5 w-5 text-[#D4A574] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#2C2C2C]">Maintenance Mode</h4>
                <p className="mt-1 text-sm text-[#8B8B8B]">
                  This room will not be available for new bookings until status is changed.
                </p>
              </div>
            </div>
          )}

          {selectedStatus === 'out_of_service' && (
            <div className="flex items-start gap-3 p-4 bg-[#F0EBE3] border border-[#C4A484] rounded-lg">
              <AlertCircle className="h-5 w-5 text-[#C4A484] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#2C2C2C]">Out of Service</h4>
                <p className="mt-1 text-sm text-[#8B8B8B]">
                  This room will be hidden from availability and cannot be booked.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          Additional Information
        </h3>

        <div>
          <label
            htmlFor="notes"
            className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2"
          >
            Notes / Description
          </label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Add any special notes about this room..."
            {...register('notes')}
            className="block w-full px-4 py-3 font-sans text-base text-[#2C2C2C] bg-white border rounded transition-all duration-150 placeholder:text-[#8B8B8B] focus:outline-none border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15 resize-none"
          />
          <p className="mt-2 text-xs text-[#8B8B8B]">
            Optional internal notes (not visible to guests)
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E8E0D5]">
        <div>
          {mode === 'edit' && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              isLoading={isDeleting}
            >
              Delete Room
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/dashboard/rooms')}
            disabled={isLoading || isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            isLoading={isLoading}
            disabled={isDeleting}
          >
            {mode === 'create' ? 'Create Room' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}
