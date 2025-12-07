'use client';

import { format, isSameDay, isWithinInterval, differenceInDays, startOfDay } from 'date-fns';
import { BookingBlock, Booking } from './BookingBlock';
import { Wrench, AlertCircle } from 'lucide-react';

export interface Room {
  id: string;
  number: string;
  type: string;
  status: 'available' | 'maintenance' | 'out-of-service';
}

interface RoomRowProps {
  room: Room;
  dates: Date[];
  bookings: Booking[];
  onBookingClick?: (booking: Booking) => void;
}

const CELL_WIDTH = 120; // pixels per day column

export function RoomRow({ room, dates, bookings, onBookingClick }: RoomRowProps) {
  // Calculate position and width for each booking
  const getBookingStyle = (booking: Booking) => {
    const startDate = startOfDay(dates[0]);
    const checkInDate = startOfDay(booking.checkIn);
    const checkOutDate = startOfDay(booking.checkOut);

    // Calculate days from start
    const daysFromStart = differenceInDays(checkInDate, startDate);
    const duration = differenceInDays(checkOutDate, checkInDate);

    // Position and width
    const left = daysFromStart * CELL_WIDTH;
    const width = duration * CELL_WIDTH - 4; // -4 for spacing

    return {
      left: `${left}px`,
      width: `${width}px`,
    };
  };

  // Get bookings for this room
  const roomBookings = bookings.filter(b => b.roomNumber === room.number);

  return (
    <div className="flex transition-all duration-200" style={{ borderBottom: '1px solid var(--color-sand)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-elevated)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
      {/* Room Info - Sticky Left Column */}
      <div className="sticky left-0 z-10 flex-shrink-0 w-48" style={{ backgroundColor: 'var(--background)', borderRight: '1px solid var(--color-sand)' }}>
        <div className="px-4 py-3 h-16 flex items-center justify-between">
          <div>
            <div className="font-semibold" style={{ color: 'var(--foreground)' }}>{room.number}</div>
            <div className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{room.type}</div>
          </div>
          {room.status === 'maintenance' && (
            <span title="Maintenance">
              <Wrench className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
            </span>
          )}
          {room.status === 'out-of-service' && (
            <span title="Out of Service">
              <AlertCircle className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
            </span>
          )}
        </div>
      </div>

      {/* Date Cells */}
      <div className="flex-1 relative">
        <div className="flex h-16">
          {dates.map((date) => {
            const hasBooking = roomBookings.some(booking =>
              isWithinInterval(date, {
                start: startOfDay(booking.checkIn),
                end: startOfDay(booking.checkOut),
              })
            );

            const isUnavailable = room.status !== 'available';

            return (
              <div
                key={date.toISOString()}
                className={`
                  flex items-center justify-center
                  ${isUnavailable ? 'pattern-dots' : ''}
                `}
                style={{
                  minWidth: `${CELL_WIDTH}px`,
                  width: `${CELL_WIDTH}px`,
                  borderRight: '1px solid var(--color-sand)',
                  backgroundColor: isUnavailable ? 'var(--background-elevated)' : 'transparent'
                }}
              >
                {/* Date cells are just containers - bookings are positioned absolutely */}
              </div>
            );
          })}
        </div>

        {/* Booking Blocks - Absolutely Positioned */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative h-full flex items-center px-2 pointer-events-auto">
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

              return (
                <div
                  key={booking.id}
                  style={getBookingStyle(booking)}
                  className="absolute"
                >
                  <BookingBlock
                    booking={booking}
                    startDate={dates[0]}
                    onClick={onBookingClick}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
