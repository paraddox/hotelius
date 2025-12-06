/**
 * Pricing Calculation Utilities
 * Calculate booking prices with rate plans, taxes, and fees
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema
const pricingQuerySchema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkInDate: z.string().date(),
  checkOutDate: z.string().date(),
  numAdults: z.number().min(1).optional(),
  numChildren: z.number().min(0).optional(),
});

export class PricingError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'PricingError';
  }
}

/**
 * Price breakdown item
 */
export interface PriceBreakdownItem {
  type: 'base' | 'rate_plan' | 'tax' | 'fee' | 'discount';
  description: string;
  amountCents: number;
  nightlyRate?: number; // For per-night items
  nights?: number;
}

/**
 * Complete pricing result
 */
export interface PricingResult {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  basePriceCents: number;
  appliedRatePlanId?: string;
  ratePlanPriceCents?: number;
  subtotalCents: number;
  taxCents: number;
  feeCents: number;
  totalCents: number;
  currency: string;
  breakdown: PriceBreakdownItem[];
}

/**
 * Calculate the number of nights between two dates
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    throw new PricingError(
      'Check-out date must be after check-in date',
      'INVALID_DATES'
    );
  }

  return nights;
}

/**
 * Get the day of week for a date (0 = Sunday, 6 = Saturday)
 */
function getDayOfWeek(date: string): number {
  return new Date(date).getDay();
}

/**
 * Calculate days in advance for booking
 */
function calculateDaysInAdvance(checkIn: string): number {
  const checkInDate = new Date(checkIn);
  const today = new Date();
  const diffTime = checkInDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Find applicable rate plan for a booking
 * Rate plans are selected by priority (highest first)
 */
async function findApplicableRatePlan(params: {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
}): Promise<{
  id: string;
  name: string;
  price_cents: number;
  is_refundable: boolean;
  cancellation_deadline_hours: number | null;
} | null> {
  const supabase = await createServerClient();

  // Get all active rate plans for this room type
  const { data: ratePlans, error } = await supabase
    .from('rate_plans')
    .select('*')
    .eq('hotel_id', params.hotelId)
    .eq('room_type_id', params.roomTypeId)
    .eq('is_active', true)
    .order('priority', { ascending: false }); // Highest priority first

  if (error || !ratePlans || ratePlans.length === 0) {
    return null;
  }

  const daysInAdvance = calculateDaysInAdvance(params.checkInDate);
  const checkInDay = getDayOfWeek(params.checkInDate);

  // Find the first matching rate plan
  for (const plan of ratePlans) {
    // Check if dates are within validity range
    const validFrom = new Date(plan.validity_range.split(',')[0].replace('[', '').replace('(', ''));
    const validTo = new Date(plan.validity_range.split(',')[1].replace(']', '').replace(')', ''));
    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);

    if (checkIn < validFrom || checkOut > validTo) {
      continue;
    }

    // Check stay length restrictions
    if (plan.min_stay_nights && params.nights < plan.min_stay_nights) {
      continue;
    }
    if (plan.max_stay_nights && params.nights > plan.max_stay_nights) {
      continue;
    }

    // Check advance booking restrictions
    if (plan.min_advance_booking_days && daysInAdvance < plan.min_advance_booking_days) {
      continue;
    }
    if (plan.max_advance_booking_days && daysInAdvance > plan.max_advance_booking_days) {
      continue;
    }

    // Check day of week
    if (plan.applicable_days && !plan.applicable_days.includes(checkInDay)) {
      continue;
    }

    // This rate plan matches all criteria
    return {
      id: plan.id,
      name: plan.name,
      price_cents: plan.price_cents,
      is_refundable: plan.is_refundable,
      cancellation_deadline_hours: plan.cancellation_deadline_hours,
    };
  }

  return null;
}

/**
 * Calculate stay price for a booking
 */
export async function calculateStayPrice(params: {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  numAdults?: number;
  numChildren?: number;
}): Promise<PricingResult> {
  // Validate input
  const validated = pricingQuerySchema.parse(params);

  const supabase = await createServerClient();

  // Get room type base price
  const { data: roomType, error: roomTypeError } = await supabase
    .from('room_types')
    .select('base_price_cents, currency')
    .eq('id', validated.roomTypeId)
    .eq('hotel_id', validated.hotelId)
    .single();

  if (roomTypeError || !roomType) {
    throw new PricingError(
      'Room type not found',
      'ROOM_TYPE_NOT_FOUND'
    );
  }

  // Calculate number of nights
  const nights = calculateNights(validated.checkInDate, validated.checkOutDate);

  // Find applicable rate plan (if any)
  const ratePlan = await findApplicableRatePlan({
    hotelId: validated.hotelId,
    roomTypeId: validated.roomTypeId,
    checkInDate: validated.checkInDate,
    checkOutDate: validated.checkOutDate,
    nights,
  });

  // Determine which price to use
  const nightlyRateCents = ratePlan ? ratePlan.price_cents : roomType.base_price_cents;
  const basePriceCents = roomType.base_price_cents * nights;
  const ratePlanPriceCents = ratePlan ? ratePlan.price_cents * nights : undefined;

  // Subtotal (before taxes and fees)
  const subtotalCents = nightlyRateCents * nights;

  // Calculate taxes (example: 10% hotel tax + 2% city tax = 12%)
  // In production, these should come from hotel settings or location-based tax rules
  const taxRate = 0.12; // 12%
  const taxCents = Math.round(subtotalCents * taxRate);

  // Calculate fees (example: fixed cleaning fee)
  // In production, these should come from hotel settings
  const feeCents = 0; // No additional fees for now

  // Calculate total
  const totalCents = subtotalCents + taxCents + feeCents;

  // Build price breakdown
  const breakdown: PriceBreakdownItem[] = [];

  if (ratePlan) {
    // Show base price for reference
    breakdown.push({
      type: 'base',
      description: `Base rate (${nights} ${nights === 1 ? 'night' : 'nights'})`,
      amountCents: basePriceCents,
      nightlyRate: roomType.base_price_cents,
      nights,
    });

    // Show rate plan discount/adjustment
    const ratePlanDiscount = basePriceCents - (ratePlan.price_cents * nights);
    if (ratePlanDiscount !== 0) {
      breakdown.push({
        type: 'rate_plan',
        description: `${ratePlan.name} rate`,
        amountCents: -ratePlanDiscount,
        nightlyRate: ratePlan.price_cents,
        nights,
      });
    }
  } else {
    // Just show base price
    breakdown.push({
      type: 'base',
      description: `Room rate (${nights} ${nights === 1 ? 'night' : 'nights'})`,
      amountCents: subtotalCents,
      nightlyRate: roomType.base_price_cents,
      nights,
    });
  }

  // Add taxes
  if (taxCents > 0) {
    breakdown.push({
      type: 'tax',
      description: 'Taxes and fees (12%)',
      amountCents: taxCents,
    });
  }

  // Add other fees if any
  if (feeCents > 0) {
    breakdown.push({
      type: 'fee',
      description: 'Service fees',
      amountCents: feeCents,
    });
  }

  return {
    hotelId: validated.hotelId,
    roomTypeId: validated.roomTypeId,
    checkInDate: validated.checkInDate,
    checkOutDate: validated.checkOutDate,
    nights,
    basePriceCents,
    appliedRatePlanId: ratePlan?.id,
    ratePlanPriceCents,
    subtotalCents,
    taxCents,
    feeCents,
    totalCents,
    currency: roomType.currency,
    breakdown,
  };
}

/**
 * Format price in cents to display format
 */
export function formatPrice(amountCents: number, currency: string = 'USD'): string {
  const amount = amountCents / 100;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get price breakdown as formatted text
 */
export function formatPriceBreakdown(breakdown: PriceBreakdownItem[], currency: string = 'USD'): string[] {
  return breakdown.map(item => {
    const formattedAmount = formatPrice(item.amountCents, currency);

    if (item.nightlyRate && item.nights) {
      const nightlyFormatted = formatPrice(item.nightlyRate, currency);
      return `${item.description}: ${nightlyFormatted} x ${item.nights} = ${formattedAmount}`;
    }

    return `${item.description}: ${formattedAmount}`;
  });
}

/**
 * Validate that a booking price matches the calculated price
 * Used to prevent price manipulation
 */
export async function validateBookingPrice(params: {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  expectedTotalCents: number;
  numAdults?: number;
  numChildren?: number;
}): Promise<{
  isValid: boolean;
  calculatedTotalCents: number;
  difference: number;
}> {
  const pricing = await calculateStayPrice({
    hotelId: params.hotelId,
    roomTypeId: params.roomTypeId,
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    numAdults: params.numAdults,
    numChildren: params.numChildren,
  });

  const difference = Math.abs(pricing.totalCents - params.expectedTotalCents);

  // Allow for small rounding differences (up to 1 cent per night)
  const maxAllowedDifference = pricing.nights;
  const isValid = difference <= maxAllowedDifference;

  return {
    isValid,
    calculatedTotalCents: pricing.totalCents,
    difference,
  };
}
