'use client';

import { Users, Baby, Plus, Minus, BedDouble, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

export const occupancySchema = z.object({
  maxOccupancyAdults: z
    .number()
    .min(1, 'Must allow at least 1 adult')
    .max(20, 'Maximum 20 adults'),
  maxOccupancyChildren: z
    .number()
    .min(0, 'Cannot be negative')
    .max(10, 'Maximum 10 children'),
  maxTotalOccupancy: z
    .number()
    .min(1, 'Total occupancy must be at least 1')
    .max(30, 'Total occupancy cannot exceed 30')
    .optional(),
  baseOccupancy: z
    .number()
    .min(1, 'Base occupancy must be at least 1')
    .max(20, 'Base occupancy cannot exceed 20')
    .optional(),
  extraGuestCharge: z
    .number()
    .min(0, 'Extra guest charge cannot be negative')
    .max(100000, 'Extra guest charge is too high')
    .optional(),
});

export type OccupancySettings = z.infer<typeof occupancySchema>;

interface OccupancySettingsProps {
  value: OccupancySettings;
  onChange: (value: OccupancySettings) => void;
  errors?: Partial<Record<keyof OccupancySettings, string>>;
  showAdvanced?: boolean;
}

export function OccupancySettingsComponent({
  value,
  onChange,
  errors = {},
  showAdvanced = false,
}: OccupancySettingsProps) {
  const handleChange = (field: keyof OccupancySettings, newValue: number) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const increment = (field: keyof OccupancySettings, max: number) => {
    const currentValue = value[field] || 0;
    if (currentValue < max) {
      handleChange(field, currentValue + 1);
    }
  };

  const decrement = (field: keyof OccupancySettings, min: number) => {
    const currentValue = value[field] || 0;
    if (currentValue > min) {
      handleChange(field, currentValue - 1);
    }
  };

  const totalOccupancy =
    value.maxOccupancyAdults + value.maxOccupancyChildren;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C] mb-2">
          Occupancy Settings
        </h3>
        <p className="text-sm text-[#8B8B8B]">
          Define the maximum number of guests allowed in this room type
        </p>
      </div>

      {/* Main Occupancy Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Max Adults */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B]">
            <Users className="w-4 h-4" />
            Maximum Adults
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => decrement('maxOccupancyAdults', 1)}
              disabled={value.maxOccupancyAdults <= 1}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all',
                value.maxOccupancyAdults <= 1
                  ? 'border-[#E8E0D5] text-[#8B8B8B] cursor-not-allowed opacity-50'
                  : 'border-[#C4A484] text-[#C4A484] hover:bg-[#C4A484] hover:text-white'
              )}
              aria-label="Decrease max adults"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-3xl font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
                {value.maxOccupancyAdults}
              </span>
              <span className="text-xs text-[#8B8B8B]">
                {value.maxOccupancyAdults === 1 ? 'adult' : 'adults'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => increment('maxOccupancyAdults', 20)}
              disabled={value.maxOccupancyAdults >= 20}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all',
                value.maxOccupancyAdults >= 20
                  ? 'border-[#E8E0D5] text-[#8B8B8B] cursor-not-allowed opacity-50'
                  : 'border-[#C4A484] text-[#C4A484] hover:bg-[#C4A484] hover:text-white'
              )}
              aria-label="Increase max adults"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {errors.maxOccupancyAdults && (
            <p className="text-sm text-[#C45C5C] flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
              {errors.maxOccupancyAdults}
            </p>
          )}
        </div>

        {/* Max Children */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B]">
            <Baby className="w-4 h-4" />
            Maximum Children
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => decrement('maxOccupancyChildren', 0)}
              disabled={value.maxOccupancyChildren <= 0}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all',
                value.maxOccupancyChildren <= 0
                  ? 'border-[#E8E0D5] text-[#8B8B8B] cursor-not-allowed opacity-50'
                  : 'border-[#A8B5A0] text-[#A8B5A0] hover:bg-[#A8B5A0] hover:text-white'
              )}
              aria-label="Decrease max children"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-3xl font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
                {value.maxOccupancyChildren}
              </span>
              <span className="text-xs text-[#8B8B8B]">
                {value.maxOccupancyChildren === 1 ? 'child' : 'children'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => increment('maxOccupancyChildren', 10)}
              disabled={value.maxOccupancyChildren >= 10}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all',
                value.maxOccupancyChildren >= 10
                  ? 'border-[#E8E0D5] text-[#8B8B8B] cursor-not-allowed opacity-50'
                  : 'border-[#A8B5A0] text-[#A8B5A0] hover:bg-[#A8B5A0] hover:text-white'
              )}
              aria-label="Increase max children"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {errors.maxOccupancyChildren && (
            <p className="text-sm text-[#C45C5C] flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
              {errors.maxOccupancyChildren}
            </p>
          )}
        </div>
      </div>

      {/* Total Occupancy Summary */}
      <div className="bg-[#F0EBE3] border border-[#E8E0D5] rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white">
            <BedDouble className="w-5 h-5 text-[#C4A484]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#2C2C2C]">
              Total Maximum Occupancy
            </p>
            <p className="text-xs text-[#8B8B8B]">
              Combined adults and children capacity
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#C4A484]">
              {totalOccupancy}
            </p>
            <p className="text-xs text-[#8B8B8B]">
              {totalOccupancy === 1 ? 'guest' : 'guests'}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-[#E8E0D5]">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-[#8B8B8B]" />
            <h4 className="text-sm font-semibold text-[#2C2C2C]">
              Advanced Occupancy Settings
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base Occupancy */}
            <div>
              <label
                htmlFor="baseOccupancy"
                className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2"
              >
                Base Occupancy
              </label>
              <input
                type="number"
                id="baseOccupancy"
                min={1}
                max={20}
                value={value.baseOccupancy || 2}
                onChange={(e) =>
                  handleChange('baseOccupancy', parseInt(e.target.value) || 2)
                }
                className={cn(
                  `block w-full px-4 py-3
                  font-sans text-base text-[#2C2C2C]
                  bg-white border rounded
                  transition-all duration-150
                  placeholder:text-[#8B8B8B]
                  focus:outline-none`,
                  errors.baseOccupancy
                    ? 'border-[#C45C5C] focus:border-[#C45C5C] focus:ring-2 focus:ring-[#C45C5C]/20'
                    : 'border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15'
                )}
              />
              <p className="mt-2 text-xs text-[#8B8B8B]">
                Number of guests included in base price
              </p>
              {errors.baseOccupancy && (
                <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
                  {errors.baseOccupancy}
                </p>
              )}
            </div>

            {/* Extra Guest Charge */}
            <div>
              <label
                htmlFor="extraGuestCharge"
                className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2"
              >
                Extra Guest Charge (cents)
              </label>
              <input
                type="number"
                id="extraGuestCharge"
                min={0}
                max={100000}
                step={100}
                value={value.extraGuestCharge || 0}
                onChange={(e) =>
                  handleChange(
                    'extraGuestCharge',
                    parseInt(e.target.value) || 0
                  )
                }
                className={cn(
                  `block w-full px-4 py-3
                  font-sans text-base text-[#2C2C2C]
                  bg-white border rounded
                  transition-all duration-150
                  placeholder:text-[#8B8B8B]
                  focus:outline-none`,
                  errors.extraGuestCharge
                    ? 'border-[#C45C5C] focus:border-[#C45C5C] focus:ring-2 focus:ring-[#C45C5C]/20'
                    : 'border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15'
                )}
              />
              <p className="mt-2 text-xs text-[#8B8B8B]">
                Additional charge per guest beyond base occupancy (
                {value.extraGuestCharge
                  ? `$${(value.extraGuestCharge / 100).toFixed(2)}`
                  : '$0.00'}
                )
              </p>
              {errors.extraGuestCharge && (
                <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
                  {errors.extraGuestCharge}
                </p>
              )}
            </div>
          </div>

          {/* Occupancy Example */}
          {value.baseOccupancy && value.extraGuestCharge ? (
            <div className="bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg p-4">
              <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
                Pricing Example
              </p>
              <p className="text-sm text-[#2C2C2C]">
                With {value.baseOccupancy}{' '}
                {value.baseOccupancy === 1 ? 'guest' : 'guests'} included in
                the base price, each additional guest up to {totalOccupancy}{' '}
                total will incur an extra charge of $
                {(value.extraGuestCharge / 100).toFixed(2)} per night.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
