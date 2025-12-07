'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Calendar, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';

// Zod schema for rate plan validation
const ratePlanSchema = z.object({
  name: z.string().min(3, 'Rate plan name must be at least 3 characters'),
  roomTypeId: z.string().min(1, 'Please select a room type'),
  pricePerNight: z.number()
    .min(1000, 'Price must be at least $10.00')
    .max(100000000, 'Price is too high'),
  validFrom: z.date({ message: 'Start date is required' }),
  validTo: z.date({ message: 'End date is required' }),
  priority: z.number()
    .min(1, 'Priority must be at least 1')
    .max(100, 'Priority must be at most 100'),
  minimumStay: z.number()
    .min(1, 'Minimum stay must be at least 1 night')
    .max(365, 'Minimum stay is too long'),
  dayOfWeekRestrictions: z.array(z.number()).optional().nullable(),
  status: z.enum(['active', 'inactive']),
}).refine((data) => data.validTo > data.validFrom, {
  message: 'End date must be after start date',
  path: ['validTo'],
});

type RatePlanFormData = z.infer<typeof ratePlanSchema>;

interface RatePlanFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<RatePlanFormData> & { id?: string };
}

const roomTypeOptions = [
  { value: '', label: 'Select room type' },
  { value: 'standard', label: 'Standard Room' },
  { value: 'deluxe', label: 'Deluxe Room' },
  { value: 'suite', label: 'Suite' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
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

export function RatePlanForm({ mode, defaultValues }: RatePlanFormProps) {
  const t = useTranslations('dashboard.rates.form');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlapWarning, setShowOverlapWarning] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState(
    defaultValues?.pricePerNight ? (defaultValues.pricePerNight / 100).toFixed(2) : ''
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    defaultValues?.dayOfWeekRestrictions || []
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
      roomTypeId: defaultValues?.roomTypeId || '',
      pricePerNight: defaultValues?.pricePerNight || 0,
      validFrom: defaultValues?.validFrom ? new Date(defaultValues.validFrom) : undefined,
      validTo: defaultValues?.validTo ? new Date(defaultValues.validTo) : undefined,
      priority: defaultValues?.priority || 1,
      minimumStay: defaultValues?.minimumStay || 1,
      dayOfWeekRestrictions: defaultValues?.dayOfWeekRestrictions || null,
      status: (defaultValues?.status as 'active' | 'inactive') || 'active',
    },
  });

  const validFrom = watch('validFrom');
  const validTo = watch('validTo');
  const roomTypeId = watch('roomTypeId');

  // Handle price input (converts dollars to cents)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceDisplay(value);

    // Convert to cents for storage
    const dollars = parseFloat(value);
    if (!isNaN(dollars)) {
      setValue('pricePerNight', Math.round(dollars * 100));
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
    // For now, we'll show a warning if the date range is longer than 6 months
    if (validFrom && validTo) {
      const diffTime = Math.abs(validTo.getTime() - validFrom.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setShowOverlapWarning(diffDays > 180);
    }
  };

  const onSubmit = async (data: RatePlanFormData) => {
    setIsLoading(true);

    try {
      // Mock API call - in production this would save to database
      console.log('Saving rate plan:', data);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Overlap Warning */}
      {showOverlapWarning && (
        <div className="flex items-start gap-3 p-4 bg-[#FFF3E0] border border-[#D4A574] rounded-lg">
          <AlertTriangle className="h-5 w-5 text-[#D4A574] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-[#2C2C2C]">{t('warnings.overlap.title')}</h4>
            <p className="mt-1 text-sm text-[#8B8B8B]">{t('warnings.overlap.message')}</p>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          {t('sections.basic')}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t('fields.name.label')}
            placeholder={t('fields.name.placeholder')}
            error={errors.name?.message}
            {...register('name')}
          />

          <Select
            label={t('fields.roomType.label')}
            options={roomTypeOptions}
            error={errors.roomTypeId?.message}
            {...register('roomTypeId')}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          {t('sections.pricing')}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
              {t('fields.price.label')}
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
            {errors.pricePerNight && (
              <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
                {errors.pricePerNight.message}
              </p>
            )}
            <p className="mt-2 text-xs text-[#8B8B8B]">{t('fields.price.hint')}</p>
          </div>

          <Input
            type="number"
            label={t('fields.priority.label')}
            hint={t('fields.priority.hint')}
            min={1}
            max={100}
            error={errors.priority?.message}
            {...register('priority', { valueAsNumber: true })}
          />

          <Input
            type="number"
            label={t('fields.minimumStay.label')}
            hint={t('fields.minimumStay.hint')}
            min={1}
            max={365}
            error={errors.minimumStay?.message}
            {...register('minimumStay', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Validity Period */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
          {t('sections.validity')}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker
            label={t('fields.validFrom.label')}
            value={validFrom}
            onChange={(date) => {
              setValue('validFrom', date as Date);
              checkForOverlaps();
            }}
            error={errors.validFrom?.message}
          />

          <DatePicker
            label={t('fields.validTo.label')}
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

      {/* Day of Week Restrictions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
            {t('sections.restrictions')}
          </h3>
          <p className="mt-1 text-sm text-[#8B8B8B]">{t('sections.restrictionsHint')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedDays.includes(day.value)
                  ? 'bg-[#C4A484] text-white'
                  : 'bg-[#F0EBE3] text-[#4A4A4A] hover:bg-[#E8E0D5]'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        {selectedDays.length > 0 && (
          <p className="text-sm text-[#8B8B8B]">
            {t('fields.restrictions.selected')}: {selectedDays.map(d => daysOfWeek[d].label).join(', ')}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-4">
        <Select
          label={t('fields.status.label')}
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
          {t('actions.cancel')}
        </Button>
        <Button
          type="submit"
          variant="accent"
          isLoading={isLoading}
        >
          {mode === 'create' ? t('actions.create') : t('actions.save')}
        </Button>
      </div>
    </form>
  );
}
