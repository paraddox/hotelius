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
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: selectedPreset === 'last7days' ? 'var(--color-terracotta)' : 'var(--background)',
              color: selectedPreset === 'last7days' ? 'white' : 'var(--foreground)',
              borderWidth: selectedPreset === 'last7days' ? '0' : '1px',
              borderColor: 'var(--color-sand)'
            }}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handlePresetChange('last30days')}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: selectedPreset === 'last30days' ? 'var(--color-terracotta)' : 'var(--background)',
              color: selectedPreset === 'last30days' ? 'white' : 'var(--foreground)',
              borderWidth: selectedPreset === 'last30days' ? '0' : '1px',
              borderColor: 'var(--color-sand)'
            }}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handlePresetChange('last90days')}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: selectedPreset === 'last90days' ? 'var(--color-terracotta)' : 'var(--background)',
              color: selectedPreset === 'last90days' ? 'white' : 'var(--foreground)',
              borderWidth: selectedPreset === 'last90days' ? '0' : '1px',
              borderColor: 'var(--color-sand)'
            }}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => handlePresetChange('custom')}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: selectedPreset === 'custom' ? 'var(--color-terracotta)' : 'var(--background)',
              color: selectedPreset === 'custom' ? 'white' : 'var(--foreground)',
              borderWidth: selectedPreset === 'custom' ? '0' : '1px',
              borderColor: 'var(--color-sand)'
            }}
          >
            Custom Range
          </button>
        </div>
      )}

      {(showCustom || !presets) && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--background)', borderWidth: '1px', borderColor: 'var(--color-sand)' }}>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              From
            </label>
            <div className="relative">
              <input
                type="date"
                value={format(value.from, 'yyyy-MM-dd')}
                onChange={(e) => handleCustomDateChange('from', e.target.value)}
                className="w-full px-3 py-2 rounded-md shadow-sm transition-all duration-200"
                style={{
                  borderWidth: '1px',
                  borderColor: 'var(--color-sand)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)'
                }}
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 pointer-events-none" style={{ color: 'var(--foreground-muted)' }} />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              To
            </label>
            <div className="relative">
              <input
                type="date"
                value={format(value.to, 'yyyy-MM-dd')}
                onChange={(e) => handleCustomDateChange('to', e.target.value)}
                className="w-full px-3 py-2 rounded-md shadow-sm transition-all duration-200"
                style={{
                  borderWidth: '1px',
                  borderColor: 'var(--color-sand)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)'
                }}
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 pointer-events-none" style={{ color: 'var(--foreground-muted)' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
