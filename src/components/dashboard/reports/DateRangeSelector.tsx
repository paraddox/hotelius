'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { DateRange, CustomDateRange } from '@/lib/api/reports';

interface DateRangeSelectorProps {
  value: DateRange;
  customRange?: CustomDateRange;
  onChange: (range: DateRange, customRange?: CustomDateRange) => void;
}

const rangeOptions: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

export function DateRangeSelector({ value, customRange, onChange }: DateRangeSelectorProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(customRange?.from);
  const [customTo, setCustomTo] = useState<Date | undefined>(customRange?.to);

  const handleRangeClick = (range: DateRange) => {
    if (range === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      onChange(range);
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onChange('custom', { from: customFrom, to: customTo });
      setShowCustomPicker(false);
    }
  };

  const handleCustomCancel = () => {
    setShowCustomPicker(false);
    if (value !== 'custom') {
      setCustomFrom(undefined);
      setCustomTo(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {rangeOptions.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => handleRangeClick(option.value)}
          >
            {option.value === 'custom' && <Calendar className="w-4 h-4" />}
            {option.label}
          </Button>
        ))}
      </div>

      {showCustomPicker && (
        <div className="p-4 bg-white border border-[#E8E0D5] rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
                From Date
              </label>
              <DatePicker
                value={customFrom}
                onChange={setCustomFrom}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
                To Date
              </label>
              <DatePicker
                value={customTo}
                onChange={setCustomTo}
                placeholder="Select end date"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleCustomCancel}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleCustomApply}
              disabled={!customFrom || !customTo}
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      {value === 'custom' && customRange && !showCustomPicker && (
        <div className="text-sm text-[#8B8B8B]">
          Showing data from{' '}
          <span className="font-medium text-[#2C2C2C]">
            {customRange.from.toLocaleDateString()}
          </span>{' '}
          to{' '}
          <span className="font-medium text-[#2C2C2C]">
            {customRange.to.toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
