'use client';

import { useState, useMemo } from 'react';
import { format, addDays, startOfToday, isSameDay, isToday } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { RoomRow, Room } from './RoomRow';
import { Booking } from './BookingBlock';

// Mock data for rooms
const mockRooms: Room[] = [
  // Deluxe Rooms
  { id: '1', number: '101', type: 'Deluxe Room', status: 'available' },
  { id: '2', number: '102', type: 'Deluxe Room', status: 'available' },
  { id: '3', number: '103', type: 'Deluxe Room', status: 'available' },
  { id: '4', number: '104', type: 'Deluxe Room', status: 'maintenance' },
  // Suites
  { id: '5', number: '201', type: 'Suite', status: 'available' },
  { id: '6', number: '202', type: 'Suite', status: 'available' },
  { id: '7', number: '203', type: 'Suite', status: 'available' },
  // Standard Rooms
  { id: '8', number: '301', type: 'Standard Room', status: 'available' },
  { id: '9', number: '302', type: 'Standard Room', status: 'available' },
  { id: '10', number: '303', type: 'Standard Room', status: 'out-of-service' },
  { id: '11', number: '304', type: 'Standard Room', status: 'available' },
  { id: '12', number: '305', type: 'Standard Room', status: 'available' },
];

// Mock data for bookings
const generateMockBookings = (): Booking[] => {
  const today = startOfToday();

  return [
    {
      id: 'b1',
      guestName: 'John Smith',
      checkIn: addDays(today, -2),
      checkOut: addDays(today, 2),
      status: 'checked-in',
      roomNumber: '101',
    },
    {
      id: 'b2',
      guestName: 'Sarah Johnson',
      checkIn: addDays(today, 1),
      checkOut: addDays(today, 5),
      status: 'confirmed',
      roomNumber: '102',
    },
    {
      id: 'b3',
      guestName: 'Michael Brown',
      checkIn: addDays(today, 3),
      checkOut: addDays(today, 7),
      status: 'pending',
      roomNumber: '103',
    },
    {
      id: 'b4',
      guestName: 'Emily Davis',
      checkIn: today,
      checkOut: addDays(today, 3),
      status: 'confirmed',
      roomNumber: '201',
    },
    {
      id: 'b5',
      guestName: 'David Wilson',
      checkIn: addDays(today, -1),
      checkOut: addDays(today, 4),
      status: 'checked-in',
      roomNumber: '202',
    },
    {
      id: 'b6',
      guestName: 'Lisa Anderson',
      checkIn: addDays(today, 5),
      checkOut: addDays(today, 9),
      status: 'confirmed',
      roomNumber: '203',
    },
    {
      id: 'b7',
      guestName: 'James Taylor',
      checkIn: addDays(today, 2),
      checkOut: addDays(today, 4),
      status: 'pending',
      roomNumber: '301',
    },
    {
      id: 'b8',
      guestName: 'Maria Garcia',
      checkIn: today,
      checkOut: addDays(today, 6),
      status: 'confirmed',
      roomNumber: '302',
    },
    {
      id: 'b9',
      guestName: 'Robert Martinez',
      checkIn: addDays(today, -3),
      checkOut: addDays(today, 1),
      status: 'checked-in',
      roomNumber: '304',
    },
    {
      id: 'b10',
      guestName: 'Jennifer Lee',
      checkIn: addDays(today, 4),
      checkOut: addDays(today, 8),
      status: 'confirmed',
      roomNumber: '305',
    },
  ];
};

const CELL_WIDTH = 120; // pixels per day column

export function TapeChart() {
  const [startDate, setStartDate] = useState(startOfToday());
  const [viewDays, setViewDays] = useState(14);
  const mockBookings = useMemo(() => generateMockBookings(), []);

  // Generate array of dates for the view
  const dates = useMemo(() => {
    return Array.from({ length: viewDays }, (_, i) => addDays(startDate, i));
  }, [startDate, viewDays]);

  // Group rooms by type
  const roomsByType = useMemo(() => {
    const grouped = new Map<string, Room[]>();
    mockRooms.forEach((room) => {
      if (!grouped.has(room.type)) {
        grouped.set(room.type, []);
      }
      grouped.get(room.type)!.push(room);
    });
    return grouped;
  }, []);

  const handleBookingClick = (booking: Booking) => {
    console.log('Booking clicked:', booking);
    // In a real app, this would open a booking detail modal or navigate to detail page
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CalendarHeader
        startDate={startDate}
        viewDays={viewDays}
        onDateChange={setStartDate}
        onViewDaysChange={setViewDays}
      />

      {/* Calendar Grid Container */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full inline-block">
          {/* Date Header Row */}
          <div className="sticky top-0 z-20 shadow-sm" style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--color-sand)' }}>
            <div className="flex">
              {/* Empty cell for room info column */}
              <div className="sticky left-0 z-30 flex-shrink-0 w-48" style={{ backgroundColor: 'var(--background)', borderRight: '1px solid var(--color-sand)' }}>
                <div className="px-4 py-3 h-16 flex items-center">
                  <span className="text-sm font-semibold font-serif" style={{ color: 'var(--foreground)' }}>Room</span>
                </div>
              </div>

              {/* Date columns */}
              <div className="flex">
                {dates.map((date) => {
                  const isCurrentDay = isToday(date);
                  return (
                    <div
                      key={date.toISOString()}
                      className="flex flex-col items-center justify-center py-2"
                      style={{
                        minWidth: `${CELL_WIDTH}px`,
                        width: `${CELL_WIDTH}px`,
                        borderRight: '1px solid var(--color-sand)',
                        backgroundColor: isCurrentDay ? 'var(--background-elevated)' : 'var(--background-elevated)'
                      }}
                    >
                      <div className="text-xs font-medium" style={{ color: isCurrentDay ? 'var(--color-terracotta)' : 'var(--foreground-muted)' }}>
                        {format(date, 'EEE')}
                      </div>
                      <div className="text-lg font-semibold" style={{ color: isCurrentDay ? 'var(--color-terracotta)' : 'var(--foreground)' }}>
                        {format(date, 'd')}
                      </div>
                      <div className="text-xs" style={{ color: isCurrentDay ? 'var(--color-terracotta)' : 'var(--foreground-muted)' }}>
                        {format(date, 'MMM')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Room Rows grouped by type */}
          <div style={{ backgroundColor: 'var(--background)' }}>
            {Array.from(roomsByType.entries()).map(([roomType, rooms]) => (
              <div key={roomType}>
                {/* Room Type Header */}
                <div className="sticky left-0 z-10 px-4 py-2" style={{ backgroundColor: 'var(--background-elevated)', borderBottom: '1px solid var(--color-sand)' }}>
                  <h3 className="text-sm font-semibold font-serif" style={{ color: 'var(--foreground)' }}>{roomType}</h3>
                </div>

                {/* Rooms of this type */}
                {rooms.map((room) => (
                  <RoomRow
                    key={room.id}
                    room={room}
                    dates={dates}
                    bookings={mockBookings}
                    onBookingClick={handleBookingClick}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Today Indicator Line */}
        {dates.some(date => isToday(date)) && (
          <div
            className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-10"
            style={{
              left: `${48 * 4 + dates.findIndex(date => isToday(date)) * CELL_WIDTH + CELL_WIDTH / 2}px`,
              backgroundColor: 'var(--color-terracotta)'
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="px-6 py-4" style={{ borderTop: '1px solid var(--color-sand)', backgroundColor: 'var(--background-elevated)' }}>
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--color-success) / 0.15)', borderLeft: '4px solid var(--color-success)' }}></div>
            <span style={{ color: 'var(--foreground-muted)' }}>Confirmed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--color-terracotta) / 0.15)', borderLeft: '4px solid var(--color-terracotta)' }}></div>
            <span style={{ color: 'var(--foreground-muted)' }}>Checked In</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--color-warning) / 0.15)', borderLeft: '4px solid var(--color-warning)' }}></div>
            <span style={{ color: 'var(--foreground-muted)' }}>Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--background-elevated)', borderLeft: '4px solid var(--color-sand)' }}></div>
            <span style={{ color: 'var(--foreground-muted)' }}>Checked Out</span>
          </div>
        </div>
      </div>
    </div>
  );
}
