'use client';

import { ArrowLeft, DoorOpen } from 'lucide-react';
import Link from 'next/link';
import { RoomForm } from '@/components/dashboard/rooms/RoomForm';
import { createRoom } from '@/lib/api/rooms';

// In a real app, get this from auth context or session
const DEMO_HOTEL_ID = 'demo-hotel-id';

export default function NewRoomPage() {
  const handleSubmit = async (data: {
    roomNumber: string;
    floor: number;
    roomTypeId: string;
    status: 'available' | 'maintenance' | 'inactive';
    notes?: string;
  }) => {
    await createRoom({
      hotelId: DEMO_HOTEL_ID,
      roomNumber: data.roomNumber,
      floor: data.floor,
      roomTypeId: data.roomTypeId,
      status: data.status,
      notes: data.notes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/rooms"
          className="p-2 rounded-lg hover:bg-[#F0EBE3] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#8B8B8B]" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#C4A484]/10 rounded-lg">
            <DoorOpen className="h-6 w-6 text-[#C4A484]" />
          </div>
          <div>
            <h1 className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold text-[#2C2C2C]">
              Add New Room
            </h1>
            <p className="text-sm text-[#8B8B8B]">
              Create a new room in your hotel
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-6">
        <RoomForm
          mode="create"
          hotelId={DEMO_HOTEL_ID}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
