'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, BedDouble, Loader2, DoorOpen } from 'lucide-react';
import Link from 'next/link';
import { RoomTypeForm } from '@/components/dashboard/room-types/RoomTypeForm';
import { fetchRoomTypeById, getRoomCountByType, RoomType } from '@/lib/api/room-types';

// In a real app, get this from auth context or session
const DEMO_HOTEL_ID = 'demo-hotel-id';

export default function EditRoomTypePage() {
  const params = useParams();
  const roomTypeId = params.id as string;

  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [roomCount, setRoomCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoomType() {
      try {
        setIsLoading(true);
        const [data, count] = await Promise.all([
          fetchRoomTypeById(roomTypeId),
          getRoomCountByType(roomTypeId),
        ]);
        setRoomType(data);
        setRoomCount(count);
      } catch (err) {
        console.error('Error loading room type:', err);
        setError('Failed to load room type. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (roomTypeId) {
      loadRoomType();
    }
  }, [roomTypeId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C4A484]" />
          <p className="text-sm text-[#8B8B8B]">Loading room type...</p>
        </div>
      </div>
    );
  }

  if (error || !roomType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="p-4 bg-[#C45C5C]/10 rounded-full">
          <BedDouble className="h-8 w-8 text-[#C45C5C]" />
        </div>
        <h2 className="text-lg font-medium text-[#2C2C2C]">Room Type Not Found</h2>
        <p className="text-sm text-[#8B8B8B]">
          {error || 'The room type you are looking for does not exist.'}
        </p>
        <Link
          href="/dashboard/room-types"
          className="text-sm text-[#C4A484] hover:underline"
        >
          Back to Room Types
        </Link>
      </div>
    );
  }

  // Convert API data to form format
  const defaultValues = {
    id: roomType.id,
    nameEn: roomType.name?.en || roomType.name?.['en'] || '',
    nameEs: roomType.name?.es || roomType.name?.['es'] || '',
    descriptionEn: roomType.description?.en || roomType.description?.['en'] || '',
    descriptionEs: roomType.description?.es || roomType.description?.['es'] || '',
    basePrice: roomType.basePrice,
    maxOccupancyAdults: roomType.maxOccupancyAdults,
    maxOccupancyChildren: roomType.maxOccupancyChildren,
    amenities: roomType.amenities || [],
    images: roomType.images || [],
    status: roomType.status as 'active' | 'inactive',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/room-types"
            className="p-2 rounded-lg hover:bg-[#F0EBE3] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[#8B8B8B]" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C4A484]/10 rounded-lg">
              <BedDouble className="h-6 w-6 text-[#C4A484]" />
            </div>
            <div>
              <h1 className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold text-[#2C2C2C]">
                Edit Room Type
              </h1>
              <p className="text-sm text-[#8B8B8B]">
                {roomType.name?.en || 'Room Type'}
              </p>
            </div>
          </div>
        </div>

        {/* Room Count Badge */}
        {roomCount > 0 && (
          <Link
            href={`/dashboard/rooms?roomTypeId=${roomTypeId}`}
            className="flex items-center gap-2 px-3 py-2 bg-[#F0EBE3] rounded-lg hover:bg-[#E8E0D5] transition-colors"
          >
            <DoorOpen className="h-4 w-4 text-[#C4A484]" />
            <span className="text-sm text-[#2C2C2C]">
              {roomCount} {roomCount === 1 ? 'Room' : 'Rooms'}
            </span>
          </Link>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-6">
        <RoomTypeForm
          mode="edit"
          hotelId={DEMO_HOTEL_ID}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  );
}
