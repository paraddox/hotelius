'use client';

import { format, addDays, subDays, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CalendarHeaderProps {
  startDate: Date;
  viewDays: number;
  onDateChange: (date: Date) => void;
  onViewDaysChange: (days: number) => void;
}

export function CalendarHeader({
  startDate,
  viewDays,
  onDateChange,
  onViewDaysChange,
}: CalendarHeaderProps) {
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

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Date Range Display */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Options */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 mr-2">View:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => onViewDaysChange(7)}
              className={`
                px-4 py-2 text-sm font-medium rounded-l-md border
                ${
                  viewDays === 7
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              7 Days
            </button>
            <button
              onClick={() => onViewDaysChange(14)}
              className={`
                px-4 py-2 text-sm font-medium border-t border-b
                ${
                  viewDays === 14
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              14 Days
            </button>
            <button
              onClick={() => onViewDaysChange(30)}
              className={`
                px-4 py-2 text-sm font-medium rounded-r-md border
                ${
                  viewDays === 30
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
