'use client';

import { useState } from 'react';
import { Plus, X, Calendar, DollarSign, Percent } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

export interface SeasonalRate {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  adjustmentType: 'fixed' | 'percentage';
  adjustmentValue: number;
}

interface SeasonalPricingProps {
  basePrice: number;
  seasonalRates: SeasonalRate[];
  onChange: (rates: SeasonalRate[]) => void;
}

export function SeasonalPricing({ basePrice, seasonalRates, onChange }: SeasonalPricingProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState<Partial<SeasonalRate>>({
    name: '',
    adjustmentType: 'percentage',
    adjustmentValue: 0,
  });

  const handleAddRate = () => {
    if (
      newRate.name &&
      newRate.startDate &&
      newRate.endDate &&
      newRate.adjustmentValue !== undefined
    ) {
      const rate: SeasonalRate = {
        id: Date.now().toString(),
        name: newRate.name,
        startDate: newRate.startDate,
        endDate: newRate.endDate,
        adjustmentType: newRate.adjustmentType || 'percentage',
        adjustmentValue: newRate.adjustmentValue,
      };

      onChange([...seasonalRates, rate]);
      setNewRate({
        name: '',
        adjustmentType: 'percentage',
        adjustmentValue: 0,
      });
      setIsAdding(false);
    }
  };

  const handleRemoveRate = (id: string) => {
    onChange(seasonalRates.filter((rate) => rate.id !== id));
  };

  const calculateAdjustedPrice = (rate: SeasonalRate): number => {
    if (rate.adjustmentType === 'percentage') {
      return basePrice + (basePrice * rate.adjustmentValue) / 100;
    }
    return basePrice + rate.adjustmentValue;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C]">
            Seasonal Pricing
          </h3>
          <p className="mt-1 text-sm text-[#8B8B8B]">
            Add seasonal variations to adjust pricing for specific date ranges
          </p>
        </div>
        {!isAdding && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
            Add Season
          </Button>
        )}
      </div>

      {/* Existing Seasonal Rates */}
      {seasonalRates.length > 0 && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {seasonalRates.map((rate) => {
            const adjustedPrice = calculateAdjustedPrice(rate);
            const priceChange = adjustedPrice - basePrice;
            const priceChangePercent = ((priceChange / basePrice) * 100).toFixed(0);

            return (
              <Card key={rate.id} variant="default" className="relative">
                <button
                  type="button"
                  onClick={() => handleRemoveRate(rate.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-[#8B8B8B] hover:text-[#C45C5C] hover:bg-[#FFEBEE] transition-colors"
                  title="Remove seasonal rate"
                >
                  <X className="h-4 w-4" />
                </button>

                <CardHeader className="pb-3">
                  <CardTitle className="text-base pr-8">{rate.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#8B8B8B]" />
                    <span className="text-[#2C2C2C]">
                      {format(rate.startDate, 'MMM d')} - {format(rate.endDate, 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <DollarSign className="h-5 w-5 text-[#C4A484]" />
                    <span className="text-xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C]">
                      ${(adjustedPrice / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-[#8B8B8B]">per night</span>
                  </div>

                  <div className="pt-3 border-t border-[#E8E0D5]">
                    <Badge
                      variant={priceChange >= 0 ? 'success' : 'warning'}
                      size="sm"
                    >
                      {priceChange >= 0 ? '+' : ''}
                      {rate.adjustmentType === 'percentage'
                        ? `${rate.adjustmentValue}%`
                        : `$${(rate.adjustmentValue / 100).toFixed(2)}`}
                      {' '}
                      ({priceChange >= 0 ? '+' : ''}${(priceChange / 100).toFixed(2)})
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add New Seasonal Rate Form */}
      {isAdding && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">New Seasonal Rate</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              label="Season Name"
              placeholder="e.g., Summer Peak, Holiday Season"
              value={newRate.name || ''}
              onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DatePicker
                label="Start Date"
                value={newRate.startDate || null}
                onChange={(date) => setNewRate({ ...newRate, startDate: date || undefined })}
              />

              <DatePicker
                label="End Date"
                value={newRate.endDate || null}
                onChange={(date) => setNewRate({ ...newRate, endDate: date || undefined })}
                minDate={newRate.startDate}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B]">
                Price Adjustment
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewRate({ ...newRate, adjustmentType: 'percentage' })}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    newRate.adjustmentType === 'percentage'
                      ? 'bg-[#C4A484] text-white'
                      : 'bg-[#F0EBE3] text-[#4A4A4A] hover:bg-[#E8E0D5]'
                  }`}
                >
                  <Percent className="h-4 w-4 inline-block mr-1" />
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setNewRate({ ...newRate, adjustmentType: 'fixed' })}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    newRate.adjustmentType === 'fixed'
                      ? 'bg-[#C4A484] text-white'
                      : 'bg-[#F0EBE3] text-[#4A4A4A] hover:bg-[#E8E0D5]'
                  }`}
                >
                  <DollarSign className="h-4 w-4 inline-block mr-1" />
                  Fixed Amount
                </button>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  {newRate.adjustmentType === 'percentage' ? (
                    <Percent className="h-5 w-5 text-[#8B8B8B]" />
                  ) : (
                    <DollarSign className="h-5 w-5 text-[#8B8B8B]" />
                  )}
                </div>
                <input
                  type="number"
                  step={newRate.adjustmentType === 'percentage' ? '1' : '0.01'}
                  placeholder={newRate.adjustmentType === 'percentage' ? '10' : '25.00'}
                  value={
                    newRate.adjustmentType === 'percentage'
                      ? newRate.adjustmentValue || ''
                      : newRate.adjustmentValue
                      ? (newRate.adjustmentValue / 100).toFixed(2)
                      : ''
                  }
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      setNewRate({
                        ...newRate,
                        adjustmentValue:
                          newRate.adjustmentType === 'percentage'
                            ? value
                            : Math.round(value * 100),
                      });
                    } else {
                      setNewRate({ ...newRate, adjustmentValue: 0 });
                    }
                  }}
                  className="block w-full pl-10 px-4 py-3 font-sans text-base text-[#2C2C2C] bg-white border rounded transition-all duration-150 placeholder:text-[#8B8B8B] focus:outline-none border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15"
                />
              </div>

              <p className="text-xs text-[#8B8B8B]">
                {newRate.adjustmentType === 'percentage'
                  ? 'Enter percentage increase or decrease (use negative for discount)'
                  : 'Enter dollar amount to add or subtract (use negative for discount)'}
              </p>

              {basePrice > 0 && newRate.adjustmentValue !== undefined && (
                <div className="p-3 bg-[#F0EBE3] rounded-lg">
                  <div className="text-sm text-[#4A4A4A]">
                    <span className="font-medium">Adjusted Price:</span>{' '}
                    <span className="font-['Cormorant_Garamond',Georgia,serif] text-lg font-bold text-[#2C2C2C]">
                      $
                      {(
                        (basePrice +
                          (newRate.adjustmentType === 'percentage'
                            ? (basePrice * newRate.adjustmentValue) / 100
                            : newRate.adjustmentValue)) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E0D5]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewRate({
                    name: '',
                    adjustmentType: 'percentage',
                    adjustmentValue: 0,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={handleAddRate}
                disabled={
                  !newRate.name ||
                  !newRate.startDate ||
                  !newRate.endDate ||
                  newRate.adjustmentValue === undefined
                }
              >
                Add Season
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {seasonalRates.length === 0 && !isAdding && (
        <div className="text-center py-8 px-4 bg-[#FAF7F2] rounded-lg border border-[#E8E0D5]">
          <Calendar className="h-8 w-8 text-[#C4A484] mx-auto mb-3" />
          <p className="text-sm text-[#8B8B8B]">
            No seasonal pricing configured. Add seasonal rates to adjust pricing for specific periods.
          </p>
        </div>
      )}
    </div>
  );
}
