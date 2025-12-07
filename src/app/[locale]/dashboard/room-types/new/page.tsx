'use client';

import { ArrowLeft, BedDouble } from 'lucide-react';
import Link from 'next/link';
import { RoomTypeForm } from '@/components/dashboard/room-types/RoomTypeForm';

// In a real app, get this from auth context or session
const DEMO_HOTEL_ID = 'demo-hotel-id';

export default function NewRoomTypePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
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
              Create Room Type
            </h1>
            <p className="text-sm text-[#8B8B8B]">
              Define a new room category for your hotel
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-6">
        <RoomTypeForm
          mode="create"
          hotelId={DEMO_HOTEL_ID}
        />
      </div>
    </div>
  );
}
