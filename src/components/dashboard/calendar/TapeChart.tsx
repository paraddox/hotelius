'use client';

import { useState, useMemo } from 'react';
import { addDays, startOfToday } from 'date-fns';
import { CalendarControls } from './CalendarControls';
import { CalendarHeader } from './CalendarHeader';
import { RoomRow } from './RoomRow';
import { useCalendarData } from '@/lib/hooks/useCalendarData';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import type { CalendarRoom, CalendarBooking } from '@/lib/hooks/useCalendarData';

const CELL_WIDTH = 120; // pixels per day column

export function TapeChart() {
  const [startDate, setStartDate] = useState(startOfToday());
  const [viewDays, setViewDays] = useState(14);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');

  // Calculate end date
  const endDate = useMemo(() => addDays(startDate, viewDays - 1), [startDate, viewDays]);

  // Fetch calendar data
  const { rooms, bookings, roomTypes, isLoading, error } = useCalendarData({
    startDate,
    endDate,
    roomTypeFilter: selectedRoomType,
  });

  // Generate array of dates for the view
  const dates = useMemo(() => {
    return Array.from({ length: viewDays }, (_, i) => addDays(startDate, i));
  }, [startDate, viewDays]);

  // Group rooms by type
  const roomsByType = useMemo(() => {
    const grouped = new Map<string, CalendarRoom[]>();
    rooms.forEach((room) => {
      const typeName = room.roomTypeName;
      if (!grouped.has(typeName)) {
        grouped.set(typeName, []);
      }
      grouped.get(typeName)!.push(room);
    });
    return grouped;
  }, [rooms]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupiedRooms = new Set(
      bookings
        .filter(b => b.status === 'checked-in' || b.status === 'confirmed')
        .map(b => b.roomId)
    ).size;
    const availableRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate,
    };
  }, [rooms, bookings]);

  const handleBookingClick = (booking: CalendarBooking) => {
    console.log('Booking clicked:', booking);
    // In a real app, this would open a booking detail modal
    // You can implement a modal here later
  };

  const handleCellClick = (room: CalendarRoom, date: Date) => {
    console.log('Empty cell clicked:', room, date);
    // In a real app, this would open a create booking modal
    // You can implement a modal here later
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-[#C45C5C] font-serif text-xl mb-2">Error loading calendar</div>
          <div className="text-[#8B8B8B] text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-[0_4px_12px_rgba(44,44,44,0.06)] overflow-hidden">
      {/* Controls */}
      <CalendarControls
        startDate={startDate}
        viewDays={viewDays}
        onDateChange={setStartDate}
        onViewDaysChange={setViewDays}
        selectedRoomType={selectedRoomType}
        onRoomTypeChange={setSelectedRoomType}
        roomTypes={roomTypes}
      />

      {/* Statistics Bar */}
      <div className="border-b border-[#E8E0D5] bg-[#FAF7F2] px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#8B8B8B] font-medium">Total Rooms:</span>
            <Badge variant="default" size="sm">{stats.totalRooms}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#8B8B8B] font-medium">Occupied:</span>
            <Badge variant="info" size="sm">{stats.occupiedRooms}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#8B8B8B] font-medium">Available:</span>
            <Badge variant="success" size="sm">{stats.availableRooms}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#8B8B8B] font-medium">Occupancy:</span>
            <Badge
              variant={stats.occupancyRate >= 80 ? 'success' : stats.occupancyRate >= 50 ? 'warning' : 'default'}
              size="sm"
            >
              {stats.occupancyRate}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 overflow-auto relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="min-w-full inline-block">
            {/* Date Header Row */}
            <CalendarHeader dates={dates} cellWidth={CELL_WIDTH} />

            {/* Room Rows grouped by type */}
            <div className="bg-white">
              {roomsByType.size === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-[#8B8B8B] font-serif text-lg">No rooms found</div>
                    <div className="text-[#8B8B8B] text-sm mt-2">
                      {selectedRoomType !== 'all' ? 'Try selecting a different room type' : 'Add rooms to get started'}
                    </div>
                  </div>
                </div>
              ) : (
                Array.from(roomsByType.entries()).map(([roomTypeName, typeRooms]) => (
                  <div key={roomTypeName} className="animate-fade-in-up">
                    {/* Room Type Header */}
                    <div className="sticky left-0 z-10 bg-[#F0EBE3] border-b border-[#E8E0D5] px-6 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-base font-medium text-[#2C2C2C]">
                          {roomTypeName}
                        </h3>
                        <Badge variant="accent" size="sm">
                          {typeRooms.length} {typeRooms.length === 1 ? 'room' : 'rooms'}
                        </Badge>
                      </div>
                    </div>

                    {/* Rooms of this type */}
                    {typeRooms.map((room, index) => (
                      <div
                        key={room.id}
                        className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
                      >
                        <RoomRow
                          room={room}
                          dates={dates}
                          bookings={bookings}
                          cellWidth={CELL_WIDTH}
                          onBookingClick={handleBookingClick}
                          onCellClick={handleCellClick}
                        />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-[#E8E0D5] bg-[#FAF7F2] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B]">
              Status Legend:
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#87A878]/20 border-l-4 border-[#87A878] rounded"></div>
                <span className="text-xs text-[#4A4A4A]">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#5B7FA6]/20 border-l-4 border-[#5B7FA6] rounded"></div>
                <span className="text-xs text-[#4A4A4A]">Checked In</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#D4A574]/20 border-l-4 border-[#D4A574] rounded"></div>
                <span className="text-xs text-[#4A4A4A]">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#8B8B8B]/15 border-l-4 border-[#8B8B8B] rounded"></div>
                <span className="text-xs text-[#4A4A4A]">Checked Out</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#8B8B8B]">
            Click on a booking to view details • Click on an empty cell to create a booking
          </div>
        </div>
      </div>
    </div>
  );
}
