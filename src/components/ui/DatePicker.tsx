'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, value, onChange, minDate, maxDate, id, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value || new Date());
    const inputId = id || props.name;

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days from previous month
    const startPadding = monthStart.getDay();
    const paddingDays = Array.from({ length: startPadding }, (_, i) => {
      const d = new Date(monthStart);
      d.setDate(d.getDate() - (startPadding - i));
      return d;
    });

    const isDisabled = (date: Date) => {
      if (minDate && isBefore(date, startOfDay(minDate))) return true;
      if (maxDate && isBefore(startOfDay(maxDate), date)) return true;
      return false;
    };

    const handleSelect = (date: Date) => {
      if (isDisabled(date)) return;
      onChange?.(date);
      setIsOpen(false);
    };

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="text"
            readOnly
            value={value ? format(value, 'MMM d, yyyy') : ''}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              `block w-full px-4 py-3 pr-12
              font-sans text-base text-[#2C2C2C]
              bg-white border rounded cursor-pointer
              transition-all duration-150
              placeholder:text-[#8B8B8B]
              focus:outline-none`,
              error
                ? 'border-[#C45C5C] focus:border-[#C45C5C] focus:ring-2 focus:ring-[#C45C5C]/20'
                : 'border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15',
              className
            )}
            placeholder="Select date"
            {...props}
          />
          <Calendar
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B8B8B] pointer-events-none"
          />
        </div>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div
              className={cn(
                'absolute z-50 mt-2 p-4 bg-white rounded-xl border border-[#E8E0D5]',
                'shadow-[0_16px_48px_rgba(44,44,44,0.1),0_8px_16px_rgba(44,44,44,0.06)]',
                'animate-in fade-in-0 zoom-in-95 duration-200'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setViewDate(subMonths(viewDate, 1))}
                  className="p-2 rounded-lg hover:bg-[#F0EBE3] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#4A4A4A]" />
                </button>
                <span className="font-['Cormorant_Garamond',Georgia,serif] text-lg font-medium text-[#2C2C2C]">
                  {format(viewDate, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="p-2 rounded-lg hover:bg-[#F0EBE3] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#4A4A4A]" />
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div
                    key={day}
                    className="w-10 h-8 flex items-center justify-center text-xs font-medium text-[#8B8B8B] uppercase tracking-wide"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {paddingDays.map((date, i) => (
                  <div
                    key={`pad-${i}`}
                    className="w-10 h-10 flex items-center justify-center text-sm text-[#8B8B8B]/40"
                  >
                    {date.getDate()}
                  </div>
                ))}
                {days.map((date) => {
                  const selected = value && isSameDay(date, value);
                  const today = isToday(date);
                  const disabled = isDisabled(date);

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelect(date)}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all duration-150',
                        disabled && 'text-[#8B8B8B]/30 cursor-not-allowed',
                        !disabled && !selected && 'hover:bg-[#F0EBE3] text-[#2C2C2C]',
                        today && !selected && 'font-semibold text-[#C4A484]',
                        selected && 'bg-[#C4A484] text-white font-medium shadow-sm'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
