/**
 * Booking Actions
 * High-level functions for booking operations using the state machine
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { z } from 'zod';
import {
  type BookingStatus,
  type BookingEvent,
  getNextState,
  validateTransition,
  requiresReason,
  requiresPaymentInfo,
} from './state-machine';
import { getAvailableRoomIds } from './availability';

/**
 * Booking data returned from database
 */
export interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  hotel_id: string;
  room_id: string;
  room_type_id: string;
  guest_id: string | null;
  check_in_date: string;
  check_out_date: string;
  actual_check_in_at: string | null;
  actual_check_out_at: string | null;
  num_adults: number;
  num_children: number;
  status: BookingStatus;
  payment_status: 'pending' | 'authorized' | 'paid' | 'partially_refunded' | 'refunded' | 'failed';
  total_price_cents: number;
  currency: string;
  tax_cents: number;
  rate_plan_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  special_requests: string | null;
  internal_notes: string | null;
  booking_source: string;
  confirmation_code: string;
  soft_hold_expires_at: string | null;
}

/**
 * Data required to create a new booking
 */
export interface CreateBookingData {
  hotel_id: string;
  room_type_id: string;
  guest_id?: string;
  check_in_date: string;
  check_out_date: string;
  num_adults: number;
  num_children?: number;
  total_price_cents: number;
  currency?: string;
  tax_cents?: number;
  rate_plan_id?: string;
  special_requests?: string;
  internal_notes?: string;
  booking_source?: string;
  soft_hold_minutes?: number;
}

/**
 * Custom error types
 */
export class BookingActionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BookingActionError';
  }
}

// Validation schemas
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
 * Log a state change to the audit table
 */
async function logStateChange(
  bookingId: string,
  fromState: BookingStatus,
  toState: BookingStatus,
  reason?: string,
  userId?: string
): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('booking_state_log')
    .insert({
      booking_id: bookingId,
      from_state: fromState,
      to_state: toState,
      changed_by: userId || null,
      reason: reason || null,
      changed_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to log state change:', error);
    // Don't throw - logging failure shouldn't block the operation
  }
}

/**
 * Get current user ID if authenticated
 */
async function getCurrentUserId(): Promise<string | undefined> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  } catch {
    return undefined;
  }
}

/**
 * Create a new booking
 * @param data - Booking data
 * @returns The created booking
 */
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  // Validate input
  const validated = createBookingSchema.parse(data);

  const supabase = await createServerClient();

  // Find an available room for the requested type
  const availableRoomIds = await getAvailableRoomIds({
    hotelId: validated.hotel_id,
    roomTypeId: validated.room_type_id,
    checkInDate: validated.check_in_date,
    checkOutDate: validated.check_out_date,
  });

  if (availableRoomIds.length === 0) {
    throw new BookingActionError(
      'No rooms available for the selected dates',
      'NO_AVAILABILITY'
    );
  }

  // Take the first available room
  const roomId = availableRoomIds[0];

  // Get current user if authenticated
  const userId = await getCurrentUserId();
  const guestId = validated.guest_id || userId;

  // Calculate soft hold expiration if requested
  let softHoldExpiresAt: string | null = null;
  if (validated.soft_hold_minutes) {
    const expiresAt = new Date(Date.now() + validated.soft_hold_minutes * 60 * 1000);
    softHoldExpiresAt = expiresAt.toISOString();
  }

  // Create the booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      hotel_id: validated.hotel_id,
      room_id: roomId,
      room_type_id: validated.room_type_id,
      guest_id: guestId,
      check_in_date: validated.check_in_date,
      check_out_date: validated.check_out_date,
      num_adults: validated.num_adults,
      num_children: validated.num_children || 0,
      status: 'pending' as BookingStatus,
      payment_status: 'pending',
      total_price_cents: validated.total_price_cents,
      currency: validated.currency || 'USD',
      tax_cents: validated.tax_cents || 0,
      rate_plan_id: validated.rate_plan_id,
      special_requests: validated.special_requests,
      internal_notes: validated.internal_notes,
      booking_source: validated.booking_source || 'direct',
      soft_hold_expires_at: softHoldExpiresAt,
    })
    .select()
    .single();

  if (error) {
    throw new BookingActionError(
      `Failed to create booking: ${error.message}`,
      'CREATE_FAILED',
      error
    );
  }

  // Log the creation
  await logStateChange(booking.id, 'pending', 'pending', 'Booking created', userId);

  return booking as Booking;
}

/**
 * Update booking status based on an event
 * @param bookingId - ID of the booking to update
 * @param event - Event triggering the state change
 * @param options - Additional options (reason, payment info, etc.)
 * @returns The updated booking
 */
export async function updateBookingStatus(
  bookingId: string,
  event: BookingEvent,
  options?: {
    reason?: string;
    paymentIntentId?: string;
    chargeId?: string;
  }
): Promise<Booking> {
  // Validate input
  const validated = updateStatusSchema.parse({
    bookingId,
    event,
    ...options,
  });

  const supabase = await createServerClient();
  const userId = await getCurrentUserId();

  // Get current booking
  const { data: currentBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', validated.bookingId)
    .single();

  if (fetchError || !currentBooking) {
    throw new BookingActionError(
      'Booking not found',
      'BOOKING_NOT_FOUND'
    );
  }

  const currentState = currentBooking.status as BookingStatus;

  // Validate the transition
  const validation = validateTransition(currentState, validated.event);
  if (!validation.valid) {
    throw new BookingActionError(
      validation.error || 'Invalid state transition',
      'INVALID_TRANSITION',
      { currentState, event: validated.event }
    );
  }

  const nextState = validation.nextState!;

  // Check if reason is required
  if (requiresReason(validated.event) && !validated.reason) {
    throw new BookingActionError(
      `Event '${validated.event}' requires a reason`,
      'REASON_REQUIRED'
    );
  }

  // Prepare update data
  const now = new Date().toISOString();
  const updateData: any = {
    status: nextState,
    updated_at: now,
  };

  // Handle specific events
  switch (validated.event) {
    case 'PAYMENT_RECEIVED':
      updateData.payment_status = 'paid';
      if (validated.paymentIntentId) {
        updateData.stripe_payment_intent_id = validated.paymentIntentId;
      }
      if (validated.chargeId) {
        updateData.stripe_charge_id = validated.chargeId;
      }
      break;

    case 'PAYMENT_FAILED':
      updateData.payment_status = 'failed';
      break;

    case 'CANCEL':
      updateData.cancelled_at = now;
      updateData.cancellation_reason = validated.reason;
      break;

    case 'CHECK_IN':
      updateData.actual_check_in_at = now;
      break;

    case 'CHECK_OUT':
      updateData.actual_check_out_at = now;
      break;
  }

  // Update the booking
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', validated.bookingId)
    .select()
    .single();

  if (updateError) {
    throw new BookingActionError(
      `Failed to update booking: ${updateError.message}`,
      'UPDATE_FAILED',
      updateError
    );
  }

  // Log the state change
  await logStateChange(
    validated.bookingId,
    currentState,
    nextState,
    validated.reason,
    userId
  );

  return updatedBooking as Booking;
}

/**
 * Cancel a booking
 * @param bookingId - ID of the booking to cancel
 * @param reason - Reason for cancellation
 * @returns The cancelled booking
 */
export async function cancelBooking(
  bookingId: string,
  reason: string
): Promise<Booking> {
  return updateBookingStatus(bookingId, 'CANCEL', { reason });
}

/**
 * Check in a guest
 * @param bookingId - ID of the booking
 * @returns The updated booking
 */
export async function checkInGuest(bookingId: string): Promise<Booking> {
  return updateBookingStatus(bookingId, 'CHECK_IN');
}

/**
 * Check out a guest
 * @param bookingId - ID of the booking
 * @returns The updated booking
 */
export async function checkOutGuest(bookingId: string): Promise<Booking> {
  return updateBookingStatus(bookingId, 'CHECK_OUT');
}

/**
 * Mark booking as no-show
 * @param bookingId - ID of the booking
 * @returns The updated booking
 */
export async function markNoShow(bookingId: string): Promise<Booking> {
  return updateBookingStatus(bookingId, 'MARK_NO_SHOW');
}

/**
 * Confirm a booking after payment
 * @param bookingId - ID of the booking
 * @param paymentIntentId - Stripe payment intent ID
 * @param chargeId - Stripe charge ID (optional)
 * @returns The confirmed booking
 */
export async function confirmBooking(
  bookingId: string,
  paymentIntentId: string,
  chargeId?: string
): Promise<Booking> {
  return updateBookingStatus(bookingId, 'PAYMENT_RECEIVED', {
    paymentIntentId,
    chargeId,
  });
}

/**
 * Mark a booking as expired (for soft holds)
 * This is typically called by automated cleanup processes
 * @param bookingId - ID of the booking to expire
 * @returns The expired booking
 */
export async function expireBooking(bookingId: string): Promise<Booking> {
  return updateBookingStatus(bookingId, 'EXPIRE', {
    reason: 'Soft hold expired',
  });
}

/**
 * Get booking by ID
 * @param bookingId - ID of the booking
 * @returns The booking
 */
export async function getBooking(bookingId: string): Promise<Booking> {
  const validated = z.string().uuid().parse(bookingId);
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', validated)
    .single();

  if (error || !data) {
    throw new BookingActionError(
      'Booking not found',
      'BOOKING_NOT_FOUND'
    );
  }

  return data as Booking;
}

/**
 * Get booking by confirmation code
 * @param confirmationCode - Booking confirmation code
 * @returns The booking
 */
export async function getBookingByConfirmation(
  confirmationCode: string
): Promise<Booking> {
  const validated = z.string().min(1).max(10).parse(confirmationCode);
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('confirmation_code', validated.toUpperCase())
    .single();

  if (error || !data) {
    throw new BookingActionError(
      'Booking not found',
      'BOOKING_NOT_FOUND'
    );
  }

  return data as Booking;
}

/**
 * Get all bookings for a hotel
 * @param hotelId - Hotel ID
 * @param filters - Optional filters
 * @returns Array of bookings
 */
export async function getHotelBookings(
  hotelId: string,
  filters?: {
    status?: BookingStatus | BookingStatus[];
    fromDate?: string;
    toDate?: string;
    guestId?: string;
  }
): Promise<Booking[]> {
  const validated = z.string().uuid().parse(hotelId);
  const supabase = await createServerClient();

  let query = supabase
    .from('bookings')
    .select('*')
    .eq('hotel_id', validated);

  // Apply filters
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status);
    } else {
      query = query.eq('status', filters.status);
    }
  }

  if (filters?.fromDate) {
    query = query.gte('check_in_date', filters.fromDate);
  }

  if (filters?.toDate) {
    query = query.lte('check_out_date', filters.toDate);
  }

  if (filters?.guestId) {
    query = query.eq('guest_id', filters.guestId);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new BookingActionError(
      `Failed to fetch bookings: ${error.message}`,
      'FETCH_FAILED',
      error
    );
  }

  return (data || []) as Booking[];
}

/**
 * Get booking state change history
 * @param bookingId - Booking ID
 * @returns Array of state changes
 */
export async function getBookingHistory(
  bookingId: string
): Promise<Array<{
  id: string;
  from_state: BookingStatus;
  to_state: BookingStatus;
  changed_by: string | null;
  changed_at: string;
  reason: string | null;
}>> {
  const validated = z.string().uuid().parse(bookingId);
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('booking_state_log')
    .select('*')
    .eq('booking_id', validated)
    .order('changed_at', { ascending: false });

  if (error) {
    throw new BookingActionError(
      `Failed to fetch booking history: ${error.message}`,
      'FETCH_FAILED',
      error
    );
  }

  return data || [];
}
