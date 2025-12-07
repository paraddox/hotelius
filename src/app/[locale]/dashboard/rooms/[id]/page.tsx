'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, DoorOpen, Loader2, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { RoomForm } from '@/components/dashboard/rooms/RoomForm';
import { RoomStatusBadge } from '@/components/dashboard/rooms/RoomStatusBadge';
import { fetchRoomById, updateRoom, deleteRoom, RoomWithBookings } from '@/lib/api/rooms';

// In a real app, get this from auth context or session
const DEMO_HOTEL_ID = 'demo-hotel-id';

export default function EditRoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<RoomWithBookings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoom() {
      try {
        setIsLoading(true);
        const data = await fetchRoomById(roomId);
        setRoom(data);
      } catch (err) {
        console.error('Error loading room:', err);
        setError('Failed to load room. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

  const handleSubmit = async (data: {
    roomNumber: string;
    floor: number;
    roomTypeId: string;
    status: 'available' | 'occupied' | 'maintenance' | 'out_of_service';
    notes?: string;
  }) => {
    await updateRoom(roomId, {
      roomNumber: data.roomNumber,
      floor: data.floor,
      roomTypeId: data.roomTypeId,
      status: data.status,
      notes: data.notes,
    });
  };

  const handleDelete = async () => {
    await deleteRoom(roomId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C4A484]" />
          <p className="text-sm text-[#8B8B8B]">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="p-4 bg-[#C45C5C]/10 rounded-full">
          <DoorOpen className="h-8 w-8 text-[#C45C5C]" />
        </div>
        <h2 className="text-lg font-medium text-[#2C2C2C]">Room Not Found</h2>
        <p className="text-sm text-[#8B8B8B]">
          {error || 'The room you are looking for does not exist.'}
        </p>
        <Link
          href="/dashboard/rooms"
          className="text-sm text-[#C4A484] hover:underline"
        >
          Back to Rooms
        </Link>
      </div>
    );
  }

  // Convert API data to form format
  const defaultValues = {
    id: room.id,
    roomNumber: room.roomNumber,
    floor: room.floor,
    roomTypeId: room.roomTypeId,
    status: room.status,
    notes: room.notes || '',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
                Edit Room
              </h1>
              <p className="text-sm text-[#8B8B8B]">
                Room {room.roomNumber} · Floor {room.floor}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <RoomStatusBadge status={room.status} />
      </div>

      {/* Current Booking Alert */}
      {room.currentBooking && (
        <div className="bg-[#FFF3E0] border border-[#D4A574] rounded-xl p-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-[#D4A574] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#2C2C2C]">Currently Occupied</h3>
              <p className="mt-1 text-sm text-[#8B8B8B]">
                Guest: {room.currentBooking.guestName}
              </p>
              <p className="text-sm text-[#8B8B8B]">
                {room.currentBooking.checkIn} → {room.currentBooking.checkOut}
              </p>
            </div>
            <Link
              href={`/dashboard/bookings/${room.currentBooking.id}`}
              className="text-sm text-[#C4A484] hover:underline"
            >
              View Booking
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-6">
          <RoomForm
            mode="edit"
            hotelId={DEMO_HOTEL_ID}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </div>

        {/* Recent Bookings Sidebar */}
        <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-6">
          <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C] mb-4">
            Recent Bookings
          </h3>

          {room.recentBookings && room.recentBookings.length > 0 ? (
            <div className="space-y-3">
              {room.recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings/${booking.id}`}
                  className="block p-3 rounded-lg border border-[#E8E0D5] hover:border-[#C4A484] hover:bg-[#FAF7F2] transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C]">
                    <User className="h-4 w-4 text-[#8B8B8B]" />
                    {booking.guestName}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#8B8B8B]">
                    <Calendar className="h-3 w-3" />
                    {booking.checkIn} → {booking.checkOut}
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-[#A8B5A0]/20 text-[#5C6B56]'
                      : booking.status === 'cancelled'
                      ? 'bg-[#C45C5C]/10 text-[#C45C5C]'
                      : 'bg-[#F0EBE3] text-[#8B8B8B]'
                  }`}>
                    {booking.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-[#E8E0D5] mx-auto mb-2" />
              <p className="text-sm text-[#8B8B8B]">No recent bookings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
