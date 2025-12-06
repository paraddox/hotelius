'use client';

import { format } from 'date-fns';
import { User, Clock } from 'lucide-react';

export interface BookingData {
  id: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'pending' | 'cancelled';
  roomNumber: string;
  nights?: number;
  adults?: number;
  children?: number;
}

interface BookingBarProps {
  booking: BookingData;
  onClick?: (booking: BookingData) => void;
  isCompact?: boolean;
}

const statusStyles = {
  confirmed: {
    bg: 'bg-[#87A878]/20',
    border: 'border-l-[#87A878]',
    text: 'text-[#2D4739]',
    hover: 'hover:bg-[#87A878]/30',
    label: 'Confirmed',
  },
  'checked-in': {
    bg: 'bg-[#5B7FA6]/20',
    border: 'border-l-[#5B7FA6]',
    text: 'text-[#2C2C2C]',
    hover: 'hover:bg-[#5B7FA6]/30',
    label: 'Checked In',
  },
  'checked-out': {
    bg: 'bg-[#8B8B8B]/15',
    border: 'border-l-[#8B8B8B]',
    text: 'text-[#4A4A4A]',
    hover: 'hover:bg-[#8B8B8B]/25',
    label: 'Checked Out',
  },
  pending: {
    bg: 'bg-[#D4A574]/20',
    border: 'border-l-[#D4A574]',
    text: 'text-[#A67B5B]',
    hover: 'hover:bg-[#D4A574]/30',
    label: 'Pending',
  },
  cancelled: {
    bg: 'bg-[#C45C5C]/15',
    border: 'border-l-[#C45C5C]',
    text: 'text-[#C45C5C]',
    hover: 'hover:bg-[#C45C5C]/25',
    label: 'Cancelled',
  },
};

export function BookingBar({ booking, onClick, isCompact = false }: BookingBarProps) {
  const style = statusStyles[booking.status];

  const handleClick = () => {
    if (onClick) {
      onClick(booking);
    }
  };

  return (
    <div
      className={`
        relative h-10 rounded-md border-l-4 cursor-pointer
        transition-all duration-250 group
        ${style.bg} ${style.border} ${style.hover}
        hover:shadow-[0_4px_12px_rgba(44,44,44,0.1)]
        hover:scale-[1.02] hover:z-20
      `}
      onClick={handleClick}
      title={`${booking.guestName} - ${style.label}`}
    >
      <div className="h-full flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <User className={`h-3.5 w-3.5 flex-shrink-0 ${style.text}`} />
          <span className={`text-sm font-medium truncate ${style.text}`}>
            {booking.guestName}
          </span>
        </div>

        {!isCompact && (
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Clock className={`h-3 w-3 ${style.text} opacity-60`} />
            <span className={`text-xs ${style.text} opacity-75`}>
              {booking.nights || 0}N
            </span>
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-30 pointer-events-none">
        <div className="bg-[#2C2C2C] text-white rounded-lg shadow-[0_8px_24px_rgba(44,44,44,0.2)] overflow-hidden">
          <div className="px-4 py-3 space-y-2">
            {/* Guest Name */}
            <div className="font-serif text-base font-medium border-b border-white/10 pb-2">
              {booking.guestName}
            </div>

            {/* Booking Details */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/60">Room:</span>
                <span className="font-medium">{booking.roomNumber}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-white/60">Check-in:</span>
                <span className="font-medium">
                  {format(booking.checkIn, 'MMM dd, HH:mm')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-white/60">Check-out:</span>
                <span className="font-medium">
                  {format(booking.checkOut, 'MMM dd, HH:mm')}
                </span>
              </div>

              {(booking.adults || booking.children) && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/60">Guests:</span>
                  <span className="font-medium">
                    {booking.adults || 0} {(booking.adults || 0) === 1 ? 'Adult' : 'Adults'}
                    {booking.children ? `, ${booking.children} ${booking.children === 1 ? 'Child' : 'Children'}` : ''}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/60">Status:</span>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-white/10">
                    {style.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tooltip Arrow */}
          <div className="absolute top-full left-6 -mt-1.5">
            <div className="w-3 h-3 bg-[#2C2C2C] transform rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
