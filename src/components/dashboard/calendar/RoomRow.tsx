'use client';

import { useMemo } from 'react';
import { isWithinInterval, differenceInDays, startOfDay, isToday } from 'date-fns';
import { BookingBar, BookingData } from './BookingBar';
import { Wrench, Ban, AlertCircle } from 'lucide-react';
import type { CalendarRoom, CalendarBooking } from '@/lib/hooks/useCalendarData';

interface RoomRowProps {
  room: CalendarRoom;
  dates: Date[];
  bookings: CalendarBooking[];
  cellWidth: number;
  onBookingClick?: (booking: CalendarBooking) => void;
  onCellClick?: (room: CalendarRoom, date: Date) => void;
}

export function RoomRow({
  room,
  dates,
  bookings,
  cellWidth,
  onBookingClick,
  onCellClick,
}: RoomRowProps) {
  // Get bookings for this room
  const roomBookings = useMemo(() => {
    return bookings.filter(b => b.roomId === room.id);
  }, [bookings, room.id]);

  // Calculate position and width for each booking bar
  const getBookingStyle = (booking: CalendarBooking) => {
    const startDate = startOfDay(dates[0]);
    const checkInDate = startOfDay(booking.checkIn);
    const checkOutDate = startOfDay(booking.checkOut);

    // Calculate days from start
    const daysFromStart = differenceInDays(checkInDate, startDate);
    const duration = differenceInDays(checkOutDate, checkInDate);

    // Position and width
    const left = Math.max(0, daysFromStart) * cellWidth;
    const width = duration * cellWidth - 8; // -8 for spacing between bookings

    return {
      left: `${left}px`,
      width: `${Math.max(width, cellWidth - 8)}px`,
    };
  };

  // Check if room is unavailable
  const isUnavailable = room.status === 'maintenance' || room.status === 'blocked';

  const handleCellClick = (date: Date) => {
    if (onCellClick && room.status === 'available') {
      onCellClick(room, date);
    }
  };

  return (
    <div className="flex border-b border-[#E8E0D5] hover:bg-[#FAF7F2] transition-colors duration-150 group">
      {/* Room Info - Sticky Left Column */}
      <div className="sticky left-0 z-10 bg-white group-hover:bg-[#FAF7F2] border-r border-[#E8E0D5] flex-shrink-0 w-56 transition-colors duration-150">
        <div className="px-4 py-4 h-20 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="font-serif text-base font-medium text-[#2C2C2C]">
              {room.roomNumber || room.name}
            </div>
            <div className="text-xs text-[#8B8B8B] mt-0.5 uppercase tracking-wider font-medium">
              {room.roomTypeName}
            </div>
          </div>

          {/* Status Icons */}
          <div className="flex-shrink-0 ml-2">
            {room.status === 'maintenance' && (
              <div className="flex items-center gap-1.5 text-[#D4A574] bg-[#D4A574]/10 px-2 py-1 rounded">
                <Wrench className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Maintenance</span>
              </div>
            )}
            {room.status === 'blocked' && (
              <div className="flex items-center gap-1.5 text-[#C45C5C] bg-[#C45C5C]/10 px-2 py-1 rounded">
                <Ban className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Blocked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Cells & Booking Bars */}
      <div className="flex-1 relative min-h-[5rem]">
        {/* Date Cell Grid */}
        <div className="absolute inset-0 flex">
          {dates.map((date, index) => {
            const isTodayCell = isToday(date);
            const hasBooking = roomBookings.some(booking =>
              isWithinInterval(date, {
                start: startOfDay(booking.checkIn),
                end: startOfDay(booking.checkOut),
              })
            );

            return (
              <div
                key={date.toISOString()}
                onClick={() => handleCellClick(date)}
                className={`
                  border-r border-[#F0EBE3] h-20 relative
                  ${!hasBooking && room.status === 'available' ? 'cursor-pointer hover:bg-[#C4A484]/5' : ''}
                  ${isTodayCell ? 'bg-[#5B7FA6]/5' : ''}
                  ${isUnavailable ? 'bg-[#E8E0D5] opacity-40' : ''}
                  transition-colors duration-150
                `}
                style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
              >
                {/* Diagonal pattern for unavailable rooms */}
                {isUnavailable && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #8B8B8B 10px, #8B8B8B 11px)',
                    }}
                  />
                )}

                {/* Today indicator */}
                {isTodayCell && !isUnavailable && (
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#5B7FA6] opacity-30" />
                )}
              </div>
            );
          })}
        </div>

        {/* Booking Bars - Absolutely Positioned */}
        {!isUnavailable && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative h-full flex items-center px-1 py-5 pointer-events-auto">
              {roomBookings.map((booking) => {
                // Only render if booking overlaps with visible date range
                const startDate = startOfDay(dates[0]);
                const endDate = startOfDay(dates[dates.length - 1]);

                if (
                  booking.checkOut < startDate ||
                  booking.checkIn > endDate
                ) {
                  return null;
                }

                const bookingData: BookingData = {
                  id: booking.id,
                  guestName: booking.guestName,
                  checkIn: booking.checkIn,
                  checkOut: booking.checkOut,
                  status: booking.status,
                  roomNumber: booking.roomNumber,
                  nights: booking.nights,
                  adults: booking.adults,
                  children: booking.children,
                };

                return (
                  <div
                    key={booking.id}
                    style={getBookingStyle(booking)}
                    className="absolute"
                  >
                    <BookingBar
                      booking={bookingData}
                      onClick={() => onBookingClick?.(booking)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
