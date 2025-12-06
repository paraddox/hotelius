'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

export type DateRangePreset = 'last7days' | 'last30days' | 'last90days' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: boolean;
}

export function DateRangeFilter({ value, onChange, presets = true }: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('last30days');
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    const now = new Date();
    let from: Date;

    switch (preset) {
      case 'last7days':
        from = new Date(now);
        from.setDate(now.getDate() - 7);
        onChange({ from, to: now });
        setShowCustom(false);
        break;
      case 'last30days':
        from = new Date(now);
        from.setDate(now.getDate() - 30);
        onChange({ from, to: now });
        setShowCustom(false);
        break;
      case 'last90days':
        from = new Date(now);
        from.setDate(now.getDate() - 90);
        onChange({ from, to: now });
        setShowCustom(false);
        break;
      case 'custom':
        setShowCustom(true);
        break;
    }
  };

  const handleCustomDateChange = (field: 'from' | 'to', dateString: string) => {
    const date = new Date(dateString);
    if (field === 'from') {
      onChange({ from: date, to: value.to });
    } else {
      onChange({ from: value.from, to: date });
    }
  };

  return (
    <div className="space-y-4">
      {presets && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePresetChange('last7days')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPreset === 'last7days'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handlePresetChange('last30days')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPreset === 'last30days'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handlePresetChange('last90days')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPreset === 'last90days'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => handlePresetChange('custom')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPreset === 'custom'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Custom Range
          </button>
        </div>
      )}

      {(showCustom || !presets) && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <input
                type="date"
                value={format(value.from, 'yyyy-MM-dd')}
                onChange={(e) => handleCustomDateChange('from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <input
                type="date"
                value={format(value.to, 'yyyy-MM-dd')}
                onChange={(e) => handleCustomDateChange('to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
