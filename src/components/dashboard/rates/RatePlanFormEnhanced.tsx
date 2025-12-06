'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { SeasonalPricing, SeasonalRate } from './SeasonalPricing';

// Zod schema for enhanced rate plan validation
const ratePlanSchema = z.object({
  name: z.string().min(3, 'Rate plan name must be at least 3 characters'),
  description: z.string().optional(),
  roomTypeIds: z.array(z.string()).min(1, 'Please select at least one room type'),
  basePrice: z.number()
    .min(1000, 'Price must be at least $10.00')
    .max(100000000, 'Price is too high'),
  validFrom: z.date({
    required_error: 'Start date is required',
  }),
  validTo: z.date({
    required_error: 'End date is required',
  }),
  priority: z.number()
    .min(1, 'Priority must be at least 1')
    .max(100, 'Priority must be at most 100'),
  minimumStay: z.number()
    .min(1, 'Minimum stay must be at least 1 night')
    .max(365, 'Minimum stay is too long'),
  maximumStay: z.number()
    .min(1, 'Maximum stay must be at least 1 night')
    .max(365, 'Maximum stay is too long')
    .optional(),
  dayOfWeekRestrictions: z.array(z.number()).optional().nullable(),
  cancellationPolicyId: z.string().optional(),
  status: z.enum(['active', 'inactive']),
}).refine((data) => data.validTo > data.validFrom, {
  message: 'End date must be after start date',
  path: ['validTo'],
}).refine((data) => !data.maximumStay || data.maximumStay >= data.minimumStay, {
  message: 'Maximum stay must be greater than or equal to minimum stay',
  path: ['maximumStay'],
});

type RatePlanFormData = z.infer<typeof ratePlanSchema>;

interface RatePlanFormEnhancedProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<RatePlanFormData> & {
    id?: string;
    seasonalRates?: SeasonalRate[];
  };
}

const roomTypeOptions = [
  { value: 'standard', label: 'Standard Room' },
  { value: 'deluxe', label: 'Deluxe Room' },
  { value: 'suite', label: 'Suite' },
  { value: 'executive', label: 'Executive Suite' },
  { value: 'presidential', label: 'Presidential Suite' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const cancellationPolicyOptions = [
  { value: '', label: 'No specific policy (use default)' },
  { value: 'flexible', label: 'Flexible - Free cancellation up to 24h before' },
  { value: 'moderate', label: 'Moderate - Free cancellation up to 5 days before' },
  { value: 'strict', label: 'Strict - Free cancellation up to 14 days before' },
  { value: 'non-refundable', label: 'Non-refundable - No cancellation allowed' },
];

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function RatePlanFormEnhanced({ mode, defaultValues }: RatePlanFormEnhancedProps) {
  const t = useTranslations('dashboard.rates.form');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlapWarning, setShowOverlapWarning] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState(
    defaultValues?.basePrice ? (defaultValues.basePrice / 100).toFixed(2) : ''
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    defaultValues?.dayOfWeekRestrictions || []
  );
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>(
    defaultValues?.seasonalRates || []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RatePlanFormData>({
    resolver: zodResolver(ratePlanSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      roomTypeIds: defaultValues?.roomTypeIds || [],
      basePrice: defaultValues?.basePrice || 0,
      validFrom: defaultValues?.validFrom ? new Date(defaultValues.validFrom) : undefined,
      validTo: defaultValues?.validTo ? new Date(defaultValues.validTo) : undefined,
      priority: defaultValues?.priority || 1,
      minimumStay: defaultValues?.minimumStay || 1,
      maximumStay: defaultValues?.maximumStay,
      dayOfWeekRestrictions: defaultValues?.dayOfWeekRestrictions || null,
      cancellationPolicyId: defaultValues?.cancellationPolicyId || '',
      status: (defaultValues?.status as 'active' | 'inactive') || 'active',
    },
  });

  const validFrom = watch('validFrom');
  const validTo = watch('validTo');
  const roomTypeIds = watch('roomTypeIds');
  const basePrice = watch('basePrice');

  // Handle price input (converts dollars to cents)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceDisplay(value);

    // Convert to cents for storage
    const dollars = parseFloat(value);
    if (!isNaN(dollars)) {
      setValue('basePrice', Math.round(dollars * 100));
    }
  };

  // Handle day of week toggle
  const toggleDay = (day: number) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort();

    setSelectedDays(newSelectedDays);
    setValue('dayOfWeekRestrictions', newSelectedDays.length > 0 ? newSelectedDays : null);
  };

  // Check for overlapping rate plans (mock implementation)
  const checkForOverlaps = () => {
    // In a real implementation, this would check against existing rate plans
    if (validFrom && validTo) {
      const diffTime = Math.abs(validTo.getTime() - validFrom.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setShowOverlapWarning(diffDays > 180);
    }
  };

  const onSubmit = async (data: RatePlanFormData) => {
    setIsLoading(true);

    try {
      // Prepare submission data including seasonal rates
      const submissionData = {
        ...data,
        seasonalRates,
      };

      // Mock API call - in production this would save to database
      console.log('Saving rate plan:', submissionData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to list page
      router.push('/dashboard/rates');
      router.refresh();
    } catch (error) {
      console.error('Error saving rate plan:', error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Overlap Warning */}
      {showOverlapWarning && (
        <div className="flex items-start gap-3 p-4 bg-[#FFF3E0] border border-[#D4A574] rounded-lg">
          <AlertTriangle className="h-5 w-5 text-[#D4A574] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-[#2C2C2C]">Potential Date Range Overlap</h4>
            <p className="mt-1 text-sm text-[#8B8B8B]">
              This rate plan covers a long period. Please ensure it doesn't conflict with existing rate plans.
            </p>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Rate Plan Name"
            placeholder="e.g., Summer Special, Weekend Rate"
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Brief description of this rate plan..."
              rows={3}
              className="block w-full px-4 py-3 font-sans text-base text-[#2C2C2C] bg-white border rounded transition-all duration-150 placeholder:text-[#8B8B8B] focus:outline-none border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15 resize-none"
              {...register('description')}
            />
          </div>

          <MultiSelect
            label="Room Types"
            options={roomTypeOptions}
            value={roomTypeIds || []}
            onChange={(values) => setValue('roomTypeIds', values)}
            placeholder="Select room types for this rate plan"
            error={errors.roomTypeIds?.message}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          Base Pricing
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
              Base Price per Night
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="h-5 w-5 text-[#8B8B8B]" />
              </div>
              <input
                type="number"
                step="0.01"
                min="10"
                placeholder="150.00"
                value={priceDisplay}
                onChange={handlePriceChange}
                className="block w-full pl-10 px-4 py-3 font-sans text-base text-[#2C2C2C] bg-white border rounded transition-all duration-150 placeholder:text-[#8B8B8B] focus:outline-none border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15"
              />
            </div>
            {errors.basePrice && (
              <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
                {errors.basePrice.message}
              </p>
            )}
            <p className="mt-2 text-xs text-[#8B8B8B]">Base rate before seasonal adjustments</p>
          </div>

          <Input
            type="number"
            label="Priority"
            hint="Higher priority rates are applied first (1-100)"
            min={1}
            max={100}
            error={errors.priority?.message}
            {...register('priority', { valueAsNumber: true })}
          />

          <Select
            label="Cancellation Policy"
            options={cancellationPolicyOptions}
            error={errors.cancellationPolicyId?.message}
            {...register('cancellationPolicyId')}
          />
        </div>
      </div>

      {/* Seasonal Pricing */}
      <SeasonalPricing
        basePrice={basePrice || 0}
        seasonalRates={seasonalRates}
        onChange={setSeasonalRates}
      />

      {/* Validity Period */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          Validity Period
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker
            label="Valid From"
            value={validFrom}
            onChange={(date) => {
              setValue('validFrom', date as Date);
              checkForOverlaps();
            }}
            error={errors.validFrom?.message}
          />

          <DatePicker
            label="Valid To"
            value={validTo}
            onChange={(date) => {
              setValue('validTo', date as Date);
              checkForOverlaps();
            }}
            minDate={validFrom}
            error={errors.validTo?.message}
          />
        </div>
      </div>

      {/* Stay Restrictions */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          Stay Requirements
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="number"
            label="Minimum Stay"
            hint="Minimum number of nights required"
            min={1}
            max={365}
            error={errors.minimumStay?.message}
            {...register('minimumStay', { valueAsNumber: true })}
          />

          <Input
            type="number"
            label="Maximum Stay (Optional)"
            hint="Maximum number of nights allowed"
            min={1}
            max={365}
            error={errors.maximumStay?.message}
            {...register('maximumStay', {
              valueAsNumber: true,
              setValueAs: (v) => v === '' ? undefined : parseInt(v)
            })}
          />
        </div>
      </div>

      {/* Day of Week Restrictions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
            Day of Week Restrictions
          </h3>
          <p className="mt-1 text-sm text-[#8B8B8B]">
            Select specific days when this rate applies. Leave all unselected for any day.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedDays.includes(day.value)
                  ? 'bg-[#C4A484] text-white shadow-sm'
                  : 'bg-[#F0EBE3] text-[#4A4A4A] hover:bg-[#E8E0D5]'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        {selectedDays.length > 0 && (
          <p className="text-sm text-[#8B8B8B]">
            This rate applies only on: {selectedDays.map(d => daysOfWeek[d].label).join(', ')}
          </p>
        )}
        {selectedDays.length === 0 && (
          <p className="text-sm text-[#8B8B8B]">
            This rate applies on all days of the week
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          Status
        </h3>

        <Select
          label="Rate Plan Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E8E0D5]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/dashboard/rates')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="accent"
          isLoading={isLoading}
        >
          {mode === 'create' ? 'Create Rate Plan' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
