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
    <div className="bg-[var(--background-elevated)] rounded-xl border border-[var(--color-sand)] shadow-[var(--shadow-medium)] p-6">
      <h3 className="font-serif text-xl font-medium text-[var(--foreground)] mb-4">Check Availability</h3>

      <div className="space-y-4">
        {/* Check-in Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-terracotta)]" />
              Check-in
            </div>
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-2.5 border border-[var(--color-sand)] rounded-lg bg-[var(--background-elevated)] text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-terracotta)]" />
              Check-out
            </div>
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn}
            className="w-full px-4 py-2.5 border border-[var(--color-sand)] rounded-lg bg-[var(--background-elevated)] text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150"
          />
        </div>

        {/* Guests */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-terracotta)]" />
              Guests
            </div>
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full px-4 py-2.5 border border-[var(--color-sand)] rounded-lg bg-[var(--background-elevated)] text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150"
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
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-charcoal)] text-[var(--color-pearl)] rounded-lg hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-200 font-medium"
        >
          <Search className="w-5 h-5" />
          Check Availability
        </button>
      </div>

      {/* Price Info */}
      <div className="mt-6 pt-6 border-t border-[var(--color-sand)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--foreground-muted)]">Starting from</span>
          <div>
            <span className="font-serif text-2xl font-medium text-[var(--color-terracotta)]">$150</span>
            <span className="text-[var(--foreground-muted)]"> / night</span>
          </div>
        </div>
        <p className="text-xs text-[var(--foreground-muted)] mt-2">
          Prices may vary based on dates and availability
        </p>
      </div>
    </div>
  );
}
