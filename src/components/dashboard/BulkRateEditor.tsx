'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Percent, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { format } from 'date-fns';

interface RatePlan {
  id: string;
  name: string;
  roomType: string;
  pricePerNight: number;
}

interface BulkRateEditorProps {
  ratePlans: RatePlan[];
  onClose: () => void;
  onSuccess?: () => void;
}

type UpdateType = 'fixed' | 'percentage-increase' | 'percentage-decrease';

export function BulkRateEditor({ ratePlans, onClose, onSuccess }: BulkRateEditorProps) {
  const [selectedRatePlanIds, setSelectedRatePlanIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [updateType, setUpdateType] = useState<UpdateType>('fixed');
  const [updateValue, setUpdateValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Convert rate plans to multi-select options
  const ratePlanOptions: MultiSelectOption[] = ratePlans.map(plan => ({
    value: plan.id,
    label: `${plan.name} - ${plan.roomType}`,
  }));

  const selectedRatePlans = ratePlans.filter(plan =>
    selectedRatePlanIds.includes(plan.id)
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedRatePlanIds.length === 0) {
      newErrors.ratePlans = 'Please select at least one rate plan';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (startDate && endDate && startDate >= endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!updateValue || parseFloat(updateValue) <= 0) {
      newErrors.updateValue = 'Please enter a valid value';
    }

    if (updateType.startsWith('percentage') && parseFloat(updateValue) > 100) {
      newErrors.updateValue = 'Percentage cannot exceed 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNewPrice = (currentPrice: number): number => {
    const value = parseFloat(updateValue);

    switch (updateType) {
      case 'fixed':
        return Math.round(value * 100); // Convert to cents
      case 'percentage-increase':
        return Math.round(currentPrice * (1 + value / 100));
      case 'percentage-decrease':
        return Math.round(currentPrice * (1 - value / 100));
      default:
        return currentPrice;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Prepare the bulk update data
      const updates = selectedRatePlans.map(plan => ({
        ratePlanId: plan.id,
        newPrice: calculateNewPrice(plan.pricePerNight),
      }));

      const response = await fetch('/api/rates/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ratePlanIds: selectedRatePlanIds,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          updateType,
          updateValue: parseFloat(updateValue),
          updates,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update rates');
      }

      const result = await response.json();
      setSuccessMessage(`Successfully updated ${result.updatedCount} rate plan(s)`);

      // Reset form after successful update
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update rates',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Bulk Rate Update"
      description="Update multiple rate plans at once for a specific date range"
      size="xl"
    >
      <div className="space-y-6">
        {/* Rate Plan Selection */}
        <div>
          <MultiSelect
            label="Select Rate Plans"
            options={ratePlanOptions}
            value={selectedRatePlanIds}
            onChange={setSelectedRatePlanIds}
            placeholder="Choose rate plans to update"
            error={errors.ratePlans}
          />
          {selectedRatePlans.length > 0 && (
            <p className="mt-2 text-sm text-[#8B8B8B]">
              {selectedRatePlans.length} rate plan(s) selected
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            minDate={new Date()}
            error={errors.startDate}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            minDate={startDate || new Date()}
            error={errors.endDate}
          />
        </div>

        {/* Update Type */}
        <div>
          <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
            Update Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setUpdateType('fixed')}
              className={`px-4 py-3 rounded-lg border-2 transition-all duration-150 ${
                updateType === 'fixed'
                  ? 'border-[#C4A484] bg-[#C4A484]/5 text-[#2C2C2C]'
                  : 'border-[#E8E0D5] text-[#8B8B8B] hover:border-[#C4A484]/50'
              }`}
            >
              <DollarSign className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm font-medium">Fixed Price</div>
            </button>
            <button
              type="button"
              onClick={() => setUpdateType('percentage-increase')}
              className={`px-4 py-3 rounded-lg border-2 transition-all duration-150 ${
                updateType === 'percentage-increase'
                  ? 'border-[#C4A484] bg-[#C4A484]/5 text-[#2C2C2C]'
                  : 'border-[#E8E0D5] text-[#8B8B8B] hover:border-[#C4A484]/50'
              }`}
            >
              <Percent className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm font-medium">Increase by %</div>
            </button>
            <button
              type="button"
              onClick={() => setUpdateType('percentage-decrease')}
              className={`px-4 py-3 rounded-lg border-2 transition-all duration-150 ${
                updateType === 'percentage-decrease'
                  ? 'border-[#C4A484] bg-[#C4A484]/5 text-[#2C2C2C]'
                  : 'border-[#E8E0D5] text-[#8B8B8B] hover:border-[#C4A484]/50'
              }`}
            >
              <Percent className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm font-medium">Decrease by %</div>
            </button>
          </div>
        </div>

        {/* Update Value */}
        <div>
          <Input
            type="number"
            label={updateType === 'fixed' ? 'New Price ($)' : 'Percentage (%)'}
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
            placeholder={updateType === 'fixed' ? '150.00' : '10'}
            min="0"
            step={updateType === 'fixed' ? '0.01' : '1'}
            error={errors.updateValue}
          />
        </div>

        {/* Preview */}
        {selectedRatePlans.length > 0 && updateValue && parseFloat(updateValue) > 0 && (
          <div className="bg-[#F0EBE3] rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-[#C4A484] mt-0.5" />
              <div>
                <h3 className="font-medium text-[#2C2C2C] mb-1">Preview Changes</h3>
                <p className="text-sm text-[#8B8B8B]">
                  {startDate && endDate && (
                    <>
                      For dates: {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedRatePlans.map(plan => {
                const newPrice = calculateNewPrice(plan.pricePerNight);
                const currentPriceDisplay = (plan.pricePerNight / 100).toFixed(2);
                const newPriceDisplay = (newPrice / 100).toFixed(2);
                const difference = newPrice - plan.pricePerNight;
                const differenceDisplay = Math.abs(difference / 100).toFixed(2);

                return (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between py-2 border-t border-[#E8E0D5] first:border-t-0"
                  >
                    <div className="text-sm">
                      <div className="font-medium text-[#2C2C2C]">{plan.name}</div>
                      <div className="text-xs text-[#8B8B8B]">{plan.roomType}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="line-through text-[#8B8B8B]">${currentPriceDisplay}</span>
                        {' → '}
                        <span className="font-medium text-[#2C2C2C]">${newPriceDisplay}</span>
                      </div>
                      <div className={`text-xs ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {difference >= 0 ? '+' : '-'}${differenceDisplay}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Footer Actions */}
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting || !!successMessage}
          >
            Update Rates
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
