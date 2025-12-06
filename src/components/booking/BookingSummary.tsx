import Image from 'next/image';
import { Calendar, Users, MapPin } from 'lucide-react';

interface BookingSummaryProps {
  hotelName: string;
  room: {
    name: string;
    image: string;
  };
  checkIn: Date;
  checkOut: Date;
  guests: number;
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
}

export default function BookingSummary({
  hotelName,
  room,
  checkIn,
  checkOut,
  guests,
  nights,
  subtotal,
  tax,
  total,
}: BookingSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
      <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

      {/* Hotel & Room */}
      <div className="mb-6">
        <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-gray-200">
          <Image
            src={room.image}
            alt={room.name}
            fill
            className="object-cover"
          />
        </div>
        <h4 className="font-semibold text-lg text-gray-900">{hotelName}</h4>
        <p className="text-gray-600">{room.name}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Booking Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Check-in</p>
            <p className="font-medium">
              {checkIn.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Check-out</p>
            <p className="font-medium">
              {checkOut.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Guests</p>
            <p className="font-medium">
              {guests} {guests === 1 ? 'guest' : 'guests'}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            ${(subtotal / nights).toFixed(2)} x {nights}{' '}
            {nights === 1 ? 'night' : 'nights'}
          </span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Taxes & Fees</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Total */}
      <div className="flex justify-between items-baseline mb-6">
        <span className="text-lg font-semibold">Total</span>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            ${total.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">USD</div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Free cancellation</span> up to 48 hours before
          check-in
        </p>
      </div>
    </div>
  );
}
