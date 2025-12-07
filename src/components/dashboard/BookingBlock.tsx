'use client';

import { format } from 'date-fns';

export interface Booking {
  id: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'checked-in' | 'pending' | 'checked-out';
  roomNumber: string;
}

interface BookingBlockProps {
  booking: Booking;
  startDate: Date;
  onClick?: (booking: Booking) => void;
}

const statusStyles = {
  confirmed: {
    backgroundColor: 'hsl(var(--color-success) / 0.15)',
    borderLeftColor: 'var(--color-success)',
    color: 'var(--color-success)'
  },
  'checked-in': {
    backgroundColor: 'hsl(var(--color-terracotta) / 0.15)',
    borderLeftColor: 'var(--color-terracotta)',
    color: 'var(--color-terracotta-dark)'
  },
  pending: {
    backgroundColor: 'hsl(var(--color-warning) / 0.15)',
    borderLeftColor: 'var(--color-warning)',
    color: 'var(--color-warning)'
  },
  'checked-out': {
    backgroundColor: 'var(--background-elevated)',
    borderLeftColor: 'var(--color-sand)',
    color: 'var(--foreground-muted)'
  },
};

const statusLabels = {
  confirmed: 'Confirmed',
  'checked-in': 'Checked In',
  pending: 'Pending',
  'checked-out': 'Checked Out',
};

export function BookingBlock({ booking, startDate, onClick }: BookingBlockProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(booking);
    }
  };

  const style = statusStyles[booking.status];

  return (
    <div
      className="absolute h-8 px-2 py-1 rounded border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:z-10 group"
      onClick={handleClick}
      title={`${booking.guestName} - ${statusLabels[booking.status]}`}
      style={style}
    >
      <div className="flex items-center justify-between h-full">
        <span className="text-xs font-medium truncate">{booking.guestName}</span>
        <span className="ml-2 text-xs opacity-75">
          {format(booking.checkIn, 'HH:mm')} - {format(booking.checkOut, 'HH:mm')}
        </span>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20">
        <div className="text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg" style={{ backgroundColor: 'var(--color-charcoal)', color: 'white' }}>
          <div className="font-semibold">{booking.guestName}</div>
          <div className="mt-1">Room: {booking.roomNumber}</div>
          <div>Check-in: {format(booking.checkIn, 'MMM dd, HH:mm')}</div>
          <div>Check-out: {format(booking.checkOut, 'MMM dd, HH:mm')}</div>
          <div className="mt-1">
            <span className="inline-block px-2 py-0.5 rounded text-xs" style={style}>
              {statusLabels[booking.status]}
            </span>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-4 -mt-1">
            <div className="border-4 border-transparent" style={{ borderTopColor: 'var(--color-charcoal)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
