import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateStayPrice,
  formatPrice,
  formatPriceBreakdown,
  validateBookingPrice,
  PricingError,
} from '../pricing';
import { createMockSupabaseClient, mockData } from '@/test/mocks/supabase';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Pricing Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateStayPrice', () => {
    it('should calculate base price for a stay without rate plans', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: 'room-type-1',
              base_price_cents: 10000, // $100/night
              currency: 'USD',
            },
          ],
          rate_plans: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await calculateStayPrice({
        hotelId: 'hotel-1',
        roomTypeId: 'room-type-1',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17', // 2 nights
      });

      expect(result.nights).toBe(2);
      expect(result.basePriceCents).toBe(20000); // $200 for 2 nights
      expect(result.subtotalCents).toBe(20000);
      expect(result.appliedRatePlanId).toBeUndefined();
      // Tax is 12% of subtotal
      expect(result.taxCents).toBe(2400);
      expect(result.totalCents).toBe(22400); // $224
    });

    it('should apply rate plan when eligible', async () => {
      const today = new Date();
      const checkInDate = new Date(today);
      checkInDate.setDate(checkInDate.getDate() + 35); // 35 days from now
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 2); // 2 nights

      const validFrom = today.toISOString().split('T')[0];
      const validTo = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
        .toISOString()
        .split('T')[0];

      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: 'room-type-1',
              base_price_cents: 10000,
              currency: 'USD',
            },
          ],
          rate_plans: [
            {
              id: 'rate-plan-1',
              name: 'Early Bird Special',
              price_cents: 8000, // $80/night (20% off)
              validity_range: `[${validFrom},${validTo})`,
              min_stay_nights: 2,
              min_advance_booking_days: 30,
              is_active: true,
              priority: 100,
              is_refundable: true,
              cancellation_deadline_hours: 24,
              applicable_days: null,
              max_stay_nights: null,
              max_advance_booking_days: null,
            },
          ],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await calculateStayPrice({
        hotelId: 'hotel-1',
        roomTypeId: 'room-type-1',
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
      });

      expect(result.nights).toBe(2);
      expect(result.basePriceCents).toBe(20000);
      expect(result.appliedRatePlanId).toBe('rate-plan-1');
      expect(result.ratePlanPriceCents).toBe(16000); // $80 * 2 nights
      expect(result.subtotalCents).toBe(16000);
      // Tax on discounted price
      expect(result.taxCents).toBe(1920);
      expect(result.totalCents).toBe(17920);
    });

    it('should not apply rate plan when minimum stay not met', async () => {
      const today = new Date();
      const checkInDate = new Date(today);
      checkInDate.setDate(checkInDate.getDate() + 35);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1); // Only 1 night

      const validFrom = today.toISOString().split('T')[0];
      const validTo = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
        .toISOString()
        .split('T')[0];

      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: 'room-type-1',
              base_price_cents: 10000,
              currency: 'USD',
            },
          ],
          rate_plans: [
            {
              id: 'rate-plan-1',
              name: 'Early Bird Special',
              price_cents: 8000,
              validity_range: `[${validFrom},${validTo})`,
              min_stay_nights: 2, // Requires 2 nights minimum
              min_advance_booking_days: 30,
              is_active: true,
              priority: 100,
              is_refundable: true,
              cancellation_deadline_hours: 24,
              applicable_days: null,
              max_stay_nights: null,
              max_advance_booking_days: null,
            },
          ],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await calculateStayPrice({
        hotelId: 'hotel-1',
        roomTypeId: 'room-type-1',
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
      });

      // Should use base price, not rate plan
      expect(result.appliedRatePlanId).toBeUndefined();
      expect(result.subtotalCents).toBe(10000); // Base price for 1 night
    });

    it('should select highest priority rate plan when multiple match', async () => {
      const today = new Date();
      const checkInDate = new Date(today);
      checkInDate.setDate(checkInDate.getDate() + 35);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 2);

      const validFrom = today.toISOString().split('T')[0];
      const validTo = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
        .toISOString()
        .split('T')[0];

      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: 'room-type-1',
              base_price_cents: 10000,
              currency: 'USD',
            },
          ],
          rate_plans: [
            {
              id: 'rate-plan-1',
              name: 'Standard Discount',
              price_cents: 9000,
              validity_range: `[${validFrom},${validTo})`,
              min_stay_nights: 2,
              min_advance_booking_days: 30,
              is_active: true,
              priority: 50, // Lower priority
              is_refundable: true,
              cancellation_deadline_hours: 24,
              applicable_days: null,
              max_stay_nights: null,
              max_advance_booking_days: null,
            },
            {
              id: 'rate-plan-2',
              name: 'Premium Discount',
              price_cents: 8000,
              validity_range: `[${validFrom},${validTo})`,
              min_stay_nights: 2,
              min_advance_booking_days: 30,
              is_active: true,
              priority: 100, // Higher priority (selected first)
              is_refundable: true,
              cancellation_deadline_hours: 24,
              applicable_days: null,
              max_stay_nights: null,
              max_advance_booking_days: null,
            },
          ],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await calculateStayPrice({
        hotelId: 'hotel-1',
        roomTypeId: 'room-type-1',
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
      });

      // Should select the higher priority plan
      expect(result.appliedRatePlanId).toBe('rate-plan-2');
      expect(result.subtotalCents).toBe(16000); // $80 * 2
    });

    it('should throw error for invalid dates', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [{ id: 'room-type-1', base_price_cents: 10000, currency: 'USD' }],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      await expect(
        calculateStayPrice({
          hotelId: 'hotel-1',
          roomTypeId: 'room-type-1',
          checkInDate: '2025-12-17',
          checkOutDate: '2025-12-15', // Check-out before check-in
        })
      ).rejects.toThrow(PricingError);
    });

    it('should throw error when room type not found', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      await expect(
        calculateStayPrice({
          hotelId: 'hotel-1',
          roomTypeId: 'non-existent',
          checkInDate: '2025-12-15',
          checkOutDate: '2025-12-17',
        })
      ).rejects.toThrow('Room type not found');
    });

    it('should include proper breakdown items', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: 'room-type-1',
              base_price_cents: 10000,
              currency: 'USD',
            },
          ],
          rate_plans: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await calculateStayPrice({
        hotelId: 'hotel-1',
        roomTypeId: 'room-type-1',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result.breakdown).toHaveLength(2); // Base + Tax
      expect(result.breakdown[0].type).toBe('base');
      expect(result.breakdown[0].nightlyRate).toBe(10000);
      expect(result.breakdown[0].nights).toBe(2);
      expect(result.breakdown[1].type).toBe('tax');
    });
  });

  describe('formatPrice', () => {
    it('should format cents to USD correctly', () => {
      expect(formatPrice(10000, 'USD')).toBe('$100.00');
      expect(formatPrice(12345, 'USD')).toBe('$123.45');
      expect(formatPrice(99, 'USD')).toBe('$0.99');
    });

    it('should handle zero and negative values', () => {
      expect(formatPrice(0, 'USD')).toBe('$0.00');
      expect(formatPrice(-5000, 'USD')).toBe('-$50.00');
    });

    it('should format different currencies', () => {
      expect(formatPrice(10000, 'EUR')).toContain('10');
      expect(formatPrice(10000, 'GBP')).toContain('10');
    });
  });

  describe('formatPriceBreakdown', () => {
    it('should format breakdown items correctly', () => {
      const breakdown = [
        {
          type: 'base' as const,
          description: 'Room rate',
          amountCents: 20000,
          nightlyRate: 10000,
          nights: 2,
        },
        {
          type: 'tax' as const,
          description: 'Taxes',
          amountCents: 2400,
        },
      ];

      const formatted = formatPriceBreakdown(breakdown, 'USD');
      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toContain('$100.00 x 2');
      expect(formatted[0]).toContain('$200.00');
      expect(formatted[1]).toContain('Taxes');
      expect(formatted[1]).toContain('$24.00');
    });
  });

  describe('validateBookingPrice', () => {
    it('should validate correct price', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: 'room-type-1',
              base_price_cents: 10000,
              currency: 'USD',
            },
          ],
          rate_plans: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await validateBookingPrice({
        hotelId: 'hotel-1',
        roomTypeId: 'room-type-1',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
        expectedTotalCents: 22400, // Correct total with taxes
      });

      expect(result.isValid).toBe(true);
      expect(result.difference).toBe(0);
      expect(result.calculatedTotalCents).toBe(22400);
    });

    it('should detect price manipulation', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: 'room-type-1',
              base_price_cents: 10000,
              currency: 'USD',
            },
          ],
          rate_plans: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await validateBookingPrice({
        hotelId: 'hotel-1',
        roomTypeId: 'room-type-1',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
        expectedTotalCents: 10000, // Trying to pay much less
      });

      expect(result.isValid).toBe(false);
      expect(result.difference).toBeGreaterThan(0);
      expect(result.calculatedTotalCents).toBe(22400);
    });

    it('should allow small rounding differences', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: 'room-type-1',
              base_price_cents: 10000,
              currency: 'USD',
            },
          ],
          rate_plans: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await validateBookingPrice({
        hotelId: 'hotel-1',
        roomTypeId: 'room-type-1',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
        expectedTotalCents: 22401, // 1 cent difference (within tolerance)
      });

      expect(result.isValid).toBe(true);
      expect(result.difference).toBe(1);
    });
  });
});
