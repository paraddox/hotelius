'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  isSameDay
} from 'date-fns';
import { cn } from '@/lib/utils';

interface RatePlan {
  id: string;
  name: string;
  roomType: string;
  pricePerNight: number;
  validFrom: string;
  validTo: string;
  priority: number;
  status: 'active' | 'inactive';
}

interface RateCalendarProps {
  ratePlans: RatePlan[];
  roomType?: string;
}

interface DayRate {
  date: Date;
  rate: RatePlan | null;
  price: number | null;
}

export function RateCalendar({ ratePlans, roomType }: RateCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter rate plans by room type if specified
  const filteredRatePlans = roomType
    ? ratePlans.filter(rp => rp.roomType === roomType)
    : ratePlans;

  // Calculate rate for a specific date
  const getRateForDate = (date: Date): DayRate => {
    const applicableRates = filteredRatePlans
      .filter(rp => {
        const validFrom = new Date(rp.validFrom);
        const validTo = new Date(rp.validTo);
        return rp.status === 'active' && date >= validFrom && date <= validTo;
      })
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    const topRate = applicableRates[0] || null;

    return {
      date,
      rate: topRate,
      price: topRate?.pricePerNight || null,
    };
  };

  // Add padding days from previous month
  const startPadding = monthStart.getDay();
  const paddingDays = Array.from({ length: startPadding }, (_, i) => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (startPadding - i));
    return d;
  });

  // Get rate for selected date
  const selectedDateRate = selectedDate ? getRateForDate(selectedDate) : null;

  // Calculate average rate for the month
  const monthlyRates = days.map(getRateForDate).filter(dr => dr.price !== null);
  const avgMonthlyRate = monthlyRates.length > 0
    ? monthlyRates.reduce((sum, dr) => sum + (dr.price || 0), 0) / monthlyRates.length
    : 0;

  // Get price range for color coding
  const allPrices = monthlyRates.map(dr => dr.price || 0).filter(p => p > 0);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  // Get color based on price
  const getPriceColor = (price: number | null) => {
    if (!price || minPrice === maxPrice) return 'bg-[#F0EBE3]';

    const ratio = (price - minPrice) / (maxPrice - minPrice);

    if (ratio < 0.33) return 'bg-[#E8F5E9] text-[#4A7C59]';
    if (ratio < 0.67) return 'bg-[#F0EBE3] text-[#4A4A4A]';
    return 'bg-[#C4A484]/20 text-[#A67B5B]';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-[#E8E0D5]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#E8E0D5]">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="p-2 rounded-lg hover:bg-[#F0EBE3] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#4A4A4A]" />
          </button>
          <h3 className="font-['Cormorant_Garamond',Georgia,serif] text-xl font-medium text-[#2C2C2C]">
            {format(viewDate, 'MMMM yyyy')}
          </h3>
          <button
            type="button"
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="p-2 rounded-lg hover:bg-[#F0EBE3] transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#4A4A4A]" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#8B8B8B]" />
            <span className="text-[#8B8B8B]">Avg Rate:</span>
            <span className="font-semibold text-[#2C2C2C]">
              ${(avgMonthlyRate / 100).toFixed(2)}
            </span>
          </div>
          {roomType && (
            <div className="text-[#8B8B8B]">
              Room Type: <span className="text-[#2C2C2C] font-medium">{roomType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-[#8B8B8B] uppercase tracking-wide py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {paddingDays.map((date, i) => {
            const dayRate = getRateForDate(date);
            return (
              <div
                key={`pad-${i}`}
                className="aspect-square flex flex-col items-center justify-center text-xs text-[#8B8B8B]/40 border border-transparent"
              >
                <div>{date.getDate()}</div>
              </div>
            );
          })}
          {days.map((date) => {
            const dayRate = getRateForDate(date);
            const today = isToday(date);
            const selected = selectedDate && isSameDay(date, selectedDate);
            const hasRate = dayRate.price !== null;

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'aspect-square flex flex-col items-center justify-center text-xs rounded-lg border transition-all duration-150',
                  today && 'ring-2 ring-[#C4A484] ring-offset-1',
                  selected && 'border-[#C4A484] bg-[#C4A484]/5',
                  !selected && hasRate && 'border-[#E8E0D5] hover:border-[#C4A484]',
                  !selected && !hasRate && 'border-transparent hover:bg-[#F0EBE3]',
                  hasRate && getPriceColor(dayRate.price)
                )}
              >
                <div className={cn('font-medium', today && 'text-[#C4A484]')}>
                  {date.getDate()}
                </div>
                {hasRate && (
                  <div className="text-[10px] font-semibold mt-0.5">
                    ${(dayRate.price! / 100).toFixed(0)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDateRate && (
        <div className="px-4 py-4 border-t border-[#E8E0D5]">
          <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h4>
          {selectedDateRate.rate ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B8B8B]">Rate Plan:</span>
                <span className="text-sm font-medium text-[#2C2C2C]">
                  {selectedDateRate.rate.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B8B8B]">Price per Night:</span>
                <span className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C]">
                  ${(selectedDateRate.price! / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B8B8B]">Priority:</span>
                <span className="text-sm font-medium text-[#2C2C2C]">
                  {selectedDateRate.rate.priority}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#8B8B8B]">No rate plan available for this date.</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-3 border-t border-[#E8E0D5] bg-[#F9F8F6]">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#8B8B8B] font-medium">Price Range:</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#E8F5E9] border border-[#4A7C59]/20"></div>
              <span className="text-[#8B8B8B]">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#F0EBE3] border border-[#E8E0D5]"></div>
              <span className="text-[#8B8B8B]">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#C4A484]/20 border border-[#C4A484]/30"></div>
              <span className="text-[#8B8B8B]">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
