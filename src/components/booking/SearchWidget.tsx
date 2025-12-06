'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Search } from 'lucide-react';
import { format } from 'date-fns';

interface SearchWidgetProps {
  hotelId: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: string;
}

export default function SearchWidget({
  hotelId,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
}: SearchWidgetProps) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState(
    defaultCheckIn || format(new Date(), 'yyyy-MM-dd')
  );
  const [checkOut, setCheckOut] = useState(
    defaultCheckOut || format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')
  );
  const [guests, setGuests] = useState(defaultGuests || '2');

  const handleSearch = () => {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests,
    });

    router.push(`/en/hotels/${hotelId}/rooms?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Check Availability</h3>

      <div className="space-y-4">
        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Check-in
            </div>
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Check-out
            </div>
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Guests
            </div>
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Search className="w-5 h-5" />
          Check Availability
        </button>
      </div>

      {/* Price Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Starting from</span>
          <div>
            <span className="text-2xl font-bold text-gray-900">$150</span>
            <span className="text-gray-600"> / night</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Prices may vary based on dates and availability
        </p>
      </div>
    </div>
  );
}
