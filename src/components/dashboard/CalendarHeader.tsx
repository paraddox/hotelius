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
    <div className="px-6 py-4" style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--color-sand)' }}>
      <div className="flex items-center justify-between">
        {/* Date Range Display */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" style={{ color: 'var(--foreground-muted)' }} />
            <h2 className="text-lg font-semibold font-serif" style={{ color: 'var(--foreground)' }}>
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-md transition-all duration-200"
              style={{ color: 'var(--foreground-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--foreground)';
                e.currentTarget.style.backgroundColor = 'var(--background-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--foreground-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
              style={{ color: 'var(--foreground-muted)', borderWidth: '1px', borderColor: 'var(--color-sand)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--foreground)';
                e.currentTarget.style.backgroundColor = 'var(--background-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--foreground-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-md transition-all duration-200"
              style={{ color: 'var(--foreground-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--foreground)';
                e.currentTarget.style.backgroundColor = 'var(--background-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--foreground-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Options */}
        <div className="flex items-center space-x-2">
          <span className="text-sm mr-2" style={{ color: 'var(--foreground-muted)' }}>View:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => onViewDaysChange(7)}
              className="px-4 py-2 text-sm font-medium rounded-l-md transition-all duration-200"
              style={{
                backgroundColor: viewDays === 7 ? 'var(--color-terracotta)' : 'var(--background)',
                color: viewDays === 7 ? 'white' : 'var(--foreground)',
                borderWidth: '1px',
                borderColor: viewDays === 7 ? 'var(--color-terracotta)' : 'var(--color-sand)'
              }}
            >
              7 Days
            </button>
            <button
              onClick={() => onViewDaysChange(14)}
              className="px-4 py-2 text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: viewDays === 14 ? 'var(--color-terracotta)' : 'var(--background)',
                color: viewDays === 14 ? 'white' : 'var(--foreground)',
                borderTopWidth: '1px',
                borderBottomWidth: '1px',
                borderLeftWidth: '0',
                borderRightWidth: '0',
                borderColor: viewDays === 14 ? 'var(--color-terracotta)' : 'var(--color-sand)'
              }}
            >
              14 Days
            </button>
            <button
              onClick={() => onViewDaysChange(30)}
              className="px-4 py-2 text-sm font-medium rounded-r-md transition-all duration-200"
              style={{
                backgroundColor: viewDays === 30 ? 'var(--color-terracotta)' : 'var(--background)',
                color: viewDays === 30 ? 'white' : 'var(--foreground)',
                borderWidth: '1px',
                borderColor: viewDays === 30 ? 'var(--color-terracotta)' : 'var(--color-sand)'
              }}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
