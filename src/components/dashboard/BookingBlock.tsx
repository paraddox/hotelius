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

const statusColors = {
  confirmed: 'bg-green-100 border-green-300 text-green-800',
  'checked-in': 'bg-blue-100 border-blue-300 text-blue-800',
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  'checked-out': 'bg-gray-100 border-gray-300 text-gray-800',
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

  return (
    <div
      className={`
        absolute h-8 px-2 py-1 rounded border-l-4 cursor-pointer transition-all
        hover:shadow-md hover:z-10 group
        ${statusColors[booking.status]}
      `}
      onClick={handleClick}
      title={`${booking.guestName} - ${statusLabels[booking.status]}`}
    >
      <div className="flex items-center justify-between h-full">
        <span className="text-xs font-medium truncate">{booking.guestName}</span>
        <span className="ml-2 text-xs opacity-75">
          {format(booking.checkIn, 'HH:mm')} - {format(booking.checkOut, 'HH:mm')}
        </span>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20">
        <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg">
          <div className="font-semibold">{booking.guestName}</div>
          <div className="mt-1">Room: {booking.roomNumber}</div>
          <div>Check-in: {format(booking.checkIn, 'MMM dd, HH:mm')}</div>
          <div>Check-out: {format(booking.checkOut, 'MMM dd, HH:mm')}</div>
          <div className="mt-1">
            <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColors[booking.status]}`}>
              {statusLabels[booking.status]}
            </span>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-4 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
