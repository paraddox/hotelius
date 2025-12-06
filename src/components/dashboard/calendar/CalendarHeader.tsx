'use client';

import { format, isToday, isWeekend } from 'date-fns';

interface CalendarHeaderProps {
  dates: Date[];
  cellWidth: number;
}

export function CalendarHeader({ dates, cellWidth }: CalendarHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-[#E8E0D5] shadow-[0_2px_8px_rgba(44,44,44,0.04)]">
      <div className="flex">
        {/* Empty cell for room info column */}
        <div className="sticky left-0 z-30 bg-white border-r border-[#E8E0D5] flex-shrink-0 w-56">
          <div className="px-4 py-4 h-20 flex items-center">
            <div>
              <span className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B]">
                Room
              </span>
              <div className="text-sm text-[#4A4A4A] mt-1">
                {dates.length} days
              </div>
            </div>
          </div>
        </div>

        {/* Date columns */}
        <div className="flex overflow-x-auto">
          {dates.map((date) => {
            const isTodayDate = isToday(date);
            const isWeekendDate = isWeekend(date);

            return (
              <div
                key={date.toISOString()}
                className={`
                  border-r border-[#F0EBE3] flex flex-col items-center justify-center py-3
                  transition-colors duration-150
                  ${isTodayDate
                    ? 'bg-[#5B7FA6]/10 border-[#5B7FA6]/20'
                    : isWeekendDate
                    ? 'bg-[#FAF7F2]'
                    : 'bg-white'
                  }
                `}
                style={{ minWidth: `${cellWidth}px`, width: `${cellWidth}px` }}
              >
                {/* Day of week */}
                <div
                  className={`
                    text-[10px] font-semibold tracking-[0.1em] uppercase
                    ${isTodayDate
                      ? 'text-[#5B7FA6]'
                      : isWeekendDate
                      ? 'text-[#8B8B8B]'
                      : 'text-[#4A4A4A]'
                    }
                  `}
                >
                  {format(date, 'EEE')}
                </div>

                {/* Day number */}
                <div
                  className={`
                    font-serif text-2xl font-medium mt-1
                    ${isTodayDate
                      ? 'text-[#5B7FA6]'
                      : 'text-[#2C2C2C]'
                    }
                  `}
                >
                  {format(date, 'd')}
                </div>

                {/* Month (only show if first day of month or first date in view) */}
                <div
                  className={`
                    text-[10px] mt-1 tracking-wider uppercase
                    ${isTodayDate
                      ? 'text-[#5B7FA6]'
                      : 'text-[#8B8B8B]'
                    }
                  `}
                >
                  {format(date, 'MMM')}
                </div>

                {/* Today indicator */}
                {isTodayDate && (
                  <div className="mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FA6]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
