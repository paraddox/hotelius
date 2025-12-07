import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Guest Information Schema (from GuestForm.tsx)
 */
const guestSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  specialRequests: z.string().optional(),
});

/**
 * Create Booking Schema (from actions.ts)
 */
const createBookingSchema = z.object({
  hotel_id: z.string().uuid(),
  room_type_id: z.string().uuid(),
  guest_id: z.string().uuid().optional(),
  check_in_date: z.string().date(),
  check_out_date: z.string().date(),
  num_adults: z.number().int().min(1),
  num_children: z.number().int().min(0).optional(),
  total_price_cents: z.number().int().min(0),
  currency: z.string().length(3).optional(),
  tax_cents: z.number().int().min(0).optional(),
  rate_plan_id: z.string().uuid().optional(),
  special_requests: z.string().max(1000).optional(),
  internal_notes: z.string().max(1000).optional(),
  booking_source: z.string().max(50).optional(),
  soft_hold_minutes: z.number().int().min(1).max(60).optional(),
});

/**
 * Update Booking Status Schema (from actions.ts)
 */
const updateStatusSchema = z.object({
  bookingId: z.string().uuid(),
  event: z.enum([
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'PAYMENT_TIMEOUT',
    'CANCEL',
    'CHECK_IN',
    'CHECK_OUT',
    'MARK_NO_SHOW',
    'EXPIRE',
  ]),
  reason: z.string().max(500).optional(),
  paymentIntentId: z.string().optional(),
  chargeId: z.string().optional(),
});

/**
 * Pricing Query Schema (from pricing.ts)
 */
const pricingQuerySchema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkInDate: z.string().date(),
  checkOutDate: z.string().date(),
  numAdults: z.number().min(1).optional(),
  numChildren: z.number().min(0).optional(),
});

/**
 * Availability Query Schema (from availability.ts)
 */
const availabilityQuerySchema = z.object({
  hotelId: z.string().uuid(),
  checkInDate: z.string().date(),
  checkOutDate: z.string().date(),
  roomTypeId: z.string().uuid().optional(),
  numAdults: z.number().min(1).optional(),
  numChildren: z.number().min(0).optional(),
});

describe('Form Validation Schemas', () => {
  describe('Guest Information Schema', () => {
    it('should validate valid guest data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        specialRequests: 'Late check-in please',
      };

      const result = guestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate guest data without special requests', () => {
      const validData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '1234567890',
      };

      const result = guestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject first name shorter than 2 characters', () => {
      const invalidData = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };

      const result = guestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject last name shorter than 2 characters', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john@example.com',
        phone: '1234567890',
      };

      const result = guestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = ['invalid', 'test@', '@example.com', 'test @example.com'];

      invalidEmails.forEach((email) => {
        const result = guestSchema.safeParse({
          firstName: 'John',
          lastName: 'Doe',
          email,
          phone: '1234567890',
        });
        expect(result.success).toBe(false);
      });
    });

    it('should reject phone number shorter than 10 characters', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123456',
      };

      const result = guestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid phone number');
      }
    });

    it('should accept various phone number formats', () => {
      const validPhones = ['+1234567890', '1234567890', '+1 (123) 456-7890', '123-456-7890'];

      validPhones.forEach((phone) => {
        const result = guestSchema.safeParse({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject missing required fields', () => {
      const incompleteData = {
        firstName: 'John',
        email: 'john@example.com',
      };

      const result = guestSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('Create Booking Schema', () => {
    it('should validate valid booking data', () => {
      const validData = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 2,
        num_children: 1,
        total_price_cents: 30000,
        currency: 'USD',
      };

      const result = createBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate minimal booking data', () => {
      const minimalData = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 1,
        total_price_cents: 20000,
      };

      const result = createBookingSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID formats', () => {
      const invalidData = {
        hotel_id: 'not-a-uuid',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 2,
        total_price_cents: 30000,
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date formats', () => {
      const invalidData = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '12/15/2025', // Wrong format
        check_out_date: '2025-12-17',
        num_adults: 2,
        total_price_cents: 30000,
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero or negative number of adults', () => {
      const invalidData = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 0,
        total_price_cents: 30000,
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative number of children', () => {
      const invalidData = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 2,
        num_children: -1,
        total_price_cents: 30000,
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const invalidData = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 2,
        total_price_cents: -1000,
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject currency codes not exactly 3 characters', () => {
      const invalidData = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 2,
        total_price_cents: 30000,
        currency: 'US', // Too short
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject special requests longer than 1000 characters', () => {
      const invalidData = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 2,
        total_price_cents: 30000,
        special_requests: 'a'.repeat(1001),
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject soft hold minutes outside valid range', () => {
      const tooSmall = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 2,
        total_price_cents: 30000,
        soft_hold_minutes: 0,
      };

      const tooLarge = {
        ...tooSmall,
        soft_hold_minutes: 61,
      };

      expect(createBookingSchema.safeParse(tooSmall).success).toBe(false);
      expect(createBookingSchema.safeParse(tooLarge).success).toBe(false);
    });

    it('should accept soft hold minutes within valid range', () => {
      const validData = {
        hotel_id: '550e8400-e29b-41d4-a716-446655440000',
        room_type_id: '550e8400-e29b-41d4-a716-446655440001',
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-17',
        num_adults: 2,
        total_price_cents: 30000,
        soft_hold_minutes: 15,
      };

      const result = createBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Update Booking Status Schema', () => {
    it('should validate valid status update', () => {
      const validData = {
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
        event: 'PAYMENT_RECEIVED' as const,
        paymentIntentId: 'pi_123456',
      };

      const result = updateStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate cancellation with reason', () => {
      const validData = {
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
        event: 'CANCEL' as const,
        reason: 'Guest requested cancellation',
      };

      const result = updateStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate all valid event types', () => {
      const events = [
        'PAYMENT_RECEIVED',
        'PAYMENT_FAILED',
        'PAYMENT_TIMEOUT',
        'CANCEL',
        'CHECK_IN',
        'CHECK_OUT',
        'MARK_NO_SHOW',
        'EXPIRE',
      ] as const;

      events.forEach((event) => {
        const result = updateStatusSchema.safeParse({
          bookingId: '550e8400-e29b-41d4-a716-446655440000',
          event,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid event type', () => {
      const invalidData = {
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
        event: 'INVALID_EVENT',
      };

      const result = updateStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject reason longer than 500 characters', () => {
      const invalidData = {
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
        event: 'CANCEL' as const,
        reason: 'a'.repeat(501),
      };

      const result = updateStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid booking ID format', () => {
      const invalidData = {
        bookingId: 'not-a-uuid',
        event: 'CHECK_IN' as const,
      };

      const result = updateStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Pricing Query Schema', () => {
    it('should validate valid pricing query', () => {
      const validData = {
        hotelId: '550e8400-e29b-41d4-a716-446655440000',
        roomTypeId: '550e8400-e29b-41d4-a716-446655440001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
        numAdults: 2,
        numChildren: 1,
      };

      const result = pricingQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate minimal pricing query', () => {
      const minimalData = {
        hotelId: '550e8400-e29b-41d4-a716-446655440000',
        roomTypeId: '550e8400-e29b-41d4-a716-446655440001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      };

      const result = pricingQuerySchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject zero adults', () => {
      const invalidData = {
        hotelId: '550e8400-e29b-41d4-a716-446655440000',
        roomTypeId: '550e8400-e29b-41d4-a716-446655440001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
        numAdults: 0,
      };

      const result = pricingQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative children', () => {
      const invalidData = {
        hotelId: '550e8400-e29b-41d4-a716-446655440000',
        roomTypeId: '550e8400-e29b-41d4-a716-446655440001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
        numChildren: -1,
      };

      const result = pricingQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Availability Query Schema', () => {
    it('should validate valid availability query', () => {
      const validData = {
        hotelId: '550e8400-e29b-41d4-a716-446655440000',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
        roomTypeId: '550e8400-e29b-41d4-a716-446655440001',
        numAdults: 2,
        numChildren: 0,
      };

      const result = availabilityQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate minimal availability query', () => {
      const minimalData = {
        hotelId: '550e8400-e29b-41d4-a716-446655440000',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      };

      const result = availabilityQuerySchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should validate query without room type filter', () => {
      const validData = {
        hotelId: '550e8400-e29b-41d4-a716-446655440000',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
        numAdults: 3,
        numChildren: 2,
      };

      const result = availabilityQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid hotel ID', () => {
      const invalidData = {
        hotelId: 'invalid-uuid',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      };

      const result = availabilityQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        hotelId: '550e8400-e29b-41d4-a716-446655440000',
        checkInDate: '12/15/2025',
        checkOutDate: '2025-12-17',
      };

      const result = availabilityQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
