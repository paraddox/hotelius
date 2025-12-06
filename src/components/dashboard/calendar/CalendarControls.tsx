'use client';

import { useState } from 'react';
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface CalendarControlsProps {
  startDate: Date;
  viewDays: number;
  onDateChange: (date: Date) => void;
  onViewDaysChange: (days: number) => void;
  selectedRoomType?: string;
  onRoomTypeChange?: (roomType: string) => void;
  roomTypes?: Array<{ value: string; label: string }>;
}

export function CalendarControls({
  startDate,
  viewDays,
  onDateChange,
  onViewDaysChange,
  selectedRoomType,
  onRoomTypeChange,
  roomTypes = [],
}: CalendarControlsProps) {
  const endDate = addDays(startDate, viewDays - 1);

  const handlePrevious = () => {
    onDateChange(subDays(startDate, viewDays));
  };

  const handleNext = () => {
    onDateChange(addDays(startDate, viewDays));
  };

  const handleToday = () => {
    onDateChange(startOfToday());
  };

  const handleThisMonth = () => {
    const today = startOfToday();
    onDateChange(startOfMonth(today));
    const daysInMonth = endOfMonth(today).getDate();
    onViewDaysChange(daysInMonth);
  };

  return (
    <div className="bg-white border-b border-[#E8E0D5] px-6 py-4 shadow-[0_1px_3px_rgba(44,44,44,0.04)]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Date Range Display & Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#C4A484]" />
            <h2 className="font-serif text-xl font-medium text-[#2C2C2C]">
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 text-[#4A4A4A] hover:text-[#2C2C2C] hover:bg-[#F0EBE3] rounded-md transition-all duration-150"
              title="Previous period"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToday}
              className="min-w-[70px]"
            >
              Today
            </Button>
            <button
              onClick={handleNext}
              className="p-2 text-[#4A4A4A] hover:text-[#2C2C2C] hover:bg-[#F0EBE3] rounded-md transition-all duration-150"
              title="Next period"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Options & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Room Type Filter */}
          {roomTypes.length > 0 && onRoomTypeChange && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#8B8B8B]" />
              <Select
                options={[
                  { value: 'all', label: 'All Room Types' },
                  ...roomTypes,
                ]}
                value={selectedRoomType || 'all'}
                onChange={(e) => onRoomTypeChange(e.target.value)}
                className="w-48 text-sm"
              />
            </div>
          )}

          {/* View Period Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#8B8B8B] font-medium">View:</span>
            <div className="inline-flex rounded-md shadow-[0_1px_3px_rgba(44,44,44,0.04)] border border-[#E8E0D5]">
              <button
                onClick={() => onViewDaysChange(7)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-l-md transition-all duration-150
                  ${
                    viewDays === 7
                      ? 'bg-[#C4A484] text-white'
                      : 'bg-white text-[#4A4A4A] hover:bg-[#F0EBE3]'
                  }
                `}
              >
                Week
              </button>
              <button
                onClick={() => onViewDaysChange(14)}
                className={`
                  px-4 py-2 text-sm font-medium border-l border-[#E8E0D5] transition-all duration-150
                  ${
                    viewDays === 14
                      ? 'bg-[#C4A484] text-white'
                      : 'bg-white text-[#4A4A4A] hover:bg-[#F0EBE3]'
                  }
                `}
              >
                2 Weeks
              </button>
              <button
                onClick={() => onViewDaysChange(30)}
                className={`
                  px-4 py-2 text-sm font-medium border-l border-[#E8E0D5] rounded-r-md transition-all duration-150
                  ${
                    viewDays === 30
                      ? 'bg-[#C4A484] text-white'
                      : 'bg-white text-[#4A4A4A] hover:bg-[#F0EBE3]'
                  }
                `}
              >
                Month
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleThisMonth}
            className="text-[#C4A484] hover:text-[#A67B5B]"
          >
            This Month
          </Button>
        </div>
      </div>
    </div>
  );
}
