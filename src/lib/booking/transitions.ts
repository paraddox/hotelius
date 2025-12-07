/**
 * Booking State Transitions
 * Functions to handle state transitions with validation, logging, and database updates
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  BOOKING_STATES,
  BookingState,
  isValidTransition,
  isTerminalState,
  getTransitionMetadata
} from './states';

// Custom error types
export class BookingTransitionError extends Error {
  constructor(
    message: string,
    public code: string,
    public bookingId?: string,
    public currentState?: BookingState
  ) {
    super(message);
    this.name = 'BookingTransitionError';
  }
}

export class BookingNotFoundError extends BookingTransitionError {
  constructor(bookingId: string) {
    super(
      `Booking ${bookingId} not found`,
      'BOOKING_NOT_FOUND',
      bookingId
    );
    this.name = 'BookingNotFoundError';
  }
}

export class InvalidTransitionError extends BookingTransitionError {
  constructor(bookingId: string, fromState: BookingState, toState: BookingState) {
    super(
      `Invalid transition from ${fromState} to ${toState} for booking ${bookingId}`,
      'INVALID_TRANSITION',
      bookingId,
      fromState
    );
    this.name = 'InvalidTransitionError';
  }
}

export class PermissionDeniedError extends BookingTransitionError {
  constructor(bookingId: string, action: string) {
    super(
      `Permission denied to ${action} booking ${bookingId}`,
      'PERMISSION_DENIED',
      bookingId
    );
    this.name = 'PermissionDeniedError';
  }
}

// Validation schemas
const bookingIdSchema = z.string().uuid();
const cancelReasonSchema = z.string().min(1).max(500);

/**
 * Base interface for transition results
 */
interface TransitionResult {
  success: boolean;
  bookingId: string;
  previousState: BookingState;
  newState: BookingState;
  timestamp: string;
  error?: string;
}

/**
 * Log a state change to the database
 */
async function logStateChange(
  bookingId: string,
  fromState: BookingState,
  toState: BookingState,
  userId?: string,
  reason?: string
) {
  const supabase = await createServerClient();

  // Insert into booking_state_log table (we'll create this in migration)
  const { error } = await supabase
    .from('booking_state_log')
    .insert({
      booking_id: bookingId,
      from_state: fromState,
      to_state: toState,
      changed_by: userId,
      reason: reason,
      changed_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to log state change:', error);
    // Don't throw - logging failure shouldn't block the transition
  }
}

/**
 * Validate user has permission to modify booking
 */
async function validatePermission(
  bookingId: string,
  action: 'confirm' | 'cancel' | 'check_in' | 'check_out' | 'mark_no_show'
): Promise<{ userId?: string; hotelId: string }> {
  const supabase = await createServerClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new PermissionDeniedError(bookingId, action);
  }

  // Get booking and hotel info
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('hotel_id, guest_id')
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    throw new BookingNotFoundError(bookingId);
  }

  // Get user's role and hotel ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Check if user is admin, hotel owner, or the guest
  const { data: hotel } = await supabase
    .from('hotels')
    .select('owner_id')
    .eq('id', booking.hotel_id)
    .single();

  const isSuperAdmin = profile?.role === 'super_admin';
  const isHotelOwner = hotel?.owner_id === user.id || profile?.role === 'hotel_owner';
  const isHotelStaff = profile?.role === 'hotel_staff';
  const isGuest = booking.guest_id === user.id;

  // Different actions have different permission requirements
  const hasPermission = (() => {
    switch (action) {
      case 'confirm':
      case 'check_in':
      case 'check_out':
      case 'mark_no_show':
        return isSuperAdmin || isHotelOwner || isHotelStaff;
      case 'cancel':
        return isSuperAdmin || isHotelOwner || isHotelStaff || isGuest;
      default:
        return false;
    }
  })();

  if (!hasPermission) {
    throw new PermissionDeniedError(bookingId, action);
  }

  return { userId: user.id, hotelId: booking.hotel_id };
}

/**
 * Confirm a pending booking
 * Transition: pending -> confirmed
 */
export async function confirmBooking(
  bookingId: string
): Promise<TransitionResult> {
  const validatedId = bookingIdSchema.parse(bookingId);
  const { userId, hotelId } = await validatePermission(validatedId, 'confirm');

  const supabase = await createServerClient();

  // Get current booking state
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', validatedId)
    .single();

  if (fetchError || !booking) {
    throw new BookingNotFoundError(validatedId);
  }

  const currentState = booking.status as BookingState;

  // Validate transition
  if (!isValidTransition(currentState, BOOKING_STATES.CONFIRMED)) {
    throw new InvalidTransitionError(validatedId, currentState, BOOKING_STATES.CONFIRMED);
  }

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: BOOKING_STATES.CONFIRMED,
      updated_at: new Date().toISOString(),
    })
    .eq('id', validatedId);

  if (updateError) {
    throw new BookingTransitionError(
      `Failed to confirm booking: ${updateError.message}`,
      'UPDATE_FAILED',
      validatedId,
      currentState
    );
  }

  // Log the state change
  await logStateChange(validatedId, currentState, BOOKING_STATES.CONFIRMED, userId);

  return {
    success: true,
    bookingId: validatedId,
    previousState: currentState,
    newState: BOOKING_STATES.CONFIRMED,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Cancel a booking
 * Transitions: pending -> cancelled OR confirmed -> cancelled
 */
export async function cancelBooking(
  bookingId: string,
  reason: string
): Promise<TransitionResult> {
  const validatedId = bookingIdSchema.parse(bookingId);
  const validatedReason = cancelReasonSchema.parse(reason);
  const { userId } = await validatePermission(validatedId, 'cancel');

  const supabase = await createServerClient();

  // Get current booking state
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', validatedId)
    .single();

  if (fetchError || !booking) {
    throw new BookingNotFoundError(validatedId);
  }

  const currentState = booking.status as BookingState;

  // Validate transition
  if (!isValidTransition(currentState, BOOKING_STATES.CANCELLED)) {
    throw new InvalidTransitionError(validatedId, currentState, BOOKING_STATES.CANCELLED);
  }

  const now = new Date().toISOString();

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: BOOKING_STATES.CANCELLED,
      cancelled_at: now,
      cancellation_reason: validatedReason,
      updated_at: now,
    })
    .eq('id', validatedId);

  if (updateError) {
    throw new BookingTransitionError(
      `Failed to cancel booking: ${updateError.message}`,
      'UPDATE_FAILED',
      validatedId,
      currentState
    );
  }

  // Log the state change
  await logStateChange(validatedId, currentState, BOOKING_STATES.CANCELLED, userId, validatedReason);

  return {
    success: true,
    bookingId: validatedId,
    previousState: currentState,
    newState: BOOKING_STATES.CANCELLED,
    timestamp: now,
  };
}

/**
 * Check in a guest
 * Transition: confirmed -> checked_in
 */
export async function checkIn(
  bookingId: string
): Promise<TransitionResult> {
  const validatedId = bookingIdSchema.parse(bookingId);
  const { userId } = await validatePermission(validatedId, 'check_in');

  const supabase = await createServerClient();

  // Get current booking state
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', validatedId)
    .single();

  if (fetchError || !booking) {
    throw new BookingNotFoundError(validatedId);
  }

  const currentState = booking.status as BookingState;

  // Validate transition
  if (!isValidTransition(currentState, BOOKING_STATES.CHECKED_IN)) {
    throw new InvalidTransitionError(validatedId, currentState, BOOKING_STATES.CHECKED_IN);
  }

  const now = new Date().toISOString();

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: BOOKING_STATES.CHECKED_IN,
      actual_check_in_at: now,
      updated_at: now,
    })
    .eq('id', validatedId);

  if (updateError) {
    throw new BookingTransitionError(
      `Failed to check in: ${updateError.message}`,
      'UPDATE_FAILED',
      validatedId,
      currentState
    );
  }

  // Log the state change
  await logStateChange(validatedId, currentState, BOOKING_STATES.CHECKED_IN, userId);

  return {
    success: true,
    bookingId: validatedId,
    previousState: currentState,
    newState: BOOKING_STATES.CHECKED_IN,
    timestamp: now,
  };
}

/**
 * Check out a guest
 * Transition: checked_in -> checked_out
 */
export async function checkOut(
  bookingId: string
): Promise<TransitionResult> {
  const validatedId = bookingIdSchema.parse(bookingId);
  const { userId } = await validatePermission(validatedId, 'check_out');

  const supabase = await createServerClient();

  // Get current booking state
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', validatedId)
    .single();

  if (fetchError || !booking) {
    throw new BookingNotFoundError(validatedId);
  }

  const currentState = booking.status as BookingState;

  // Validate transition
  if (!isValidTransition(currentState, BOOKING_STATES.CHECKED_OUT)) {
    throw new InvalidTransitionError(validatedId, currentState, BOOKING_STATES.CHECKED_OUT);
  }

  const now = new Date().toISOString();

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: BOOKING_STATES.CHECKED_OUT,
      actual_check_out_at: now,
      updated_at: now,
    })
    .eq('id', validatedId);

  if (updateError) {
    throw new BookingTransitionError(
      `Failed to check out: ${updateError.message}`,
      'UPDATE_FAILED',
      validatedId,
      currentState
    );
  }

  // Log the state change
  await logStateChange(validatedId, currentState, BOOKING_STATES.CHECKED_OUT, userId);

  return {
    success: true,
    bookingId: validatedId,
    previousState: currentState,
    newState: BOOKING_STATES.CHECKED_OUT,
    timestamp: now,
  };
}

/**
 * Mark booking as no-show
 * Transition: confirmed -> no_show
 */
export async function markNoShow(
  bookingId: string
): Promise<TransitionResult> {
  const validatedId = bookingIdSchema.parse(bookingId);
  const { userId } = await validatePermission(validatedId, 'mark_no_show');

  const supabase = await createServerClient();

  // Get current booking state
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', validatedId)
    .single();

  if (fetchError || !booking) {
    throw new BookingNotFoundError(validatedId);
  }

  const currentState = booking.status as BookingState;

  // Validate transition
  if (!isValidTransition(currentState, BOOKING_STATES.NO_SHOW)) {
    throw new InvalidTransitionError(validatedId, currentState, BOOKING_STATES.NO_SHOW);
  }

  const now = new Date().toISOString();

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: BOOKING_STATES.NO_SHOW,
      updated_at: now,
    })
    .eq('id', validatedId);

  if (updateError) {
    throw new BookingTransitionError(
      `Failed to mark as no-show: ${updateError.message}`,
      'UPDATE_FAILED',
      validatedId,
      currentState
    );
  }

  // Log the state change
  await logStateChange(validatedId, currentState, BOOKING_STATES.NO_SHOW, userId);

  return {
    success: true,
    bookingId: validatedId,
    previousState: currentState,
    newState: BOOKING_STATES.NO_SHOW,
    timestamp: now,
  };
}

/**
 * Expire a pending booking (automated process, no permission check)
 * Transition: pending -> expired
 */
export async function expireBooking(
  bookingId: string
): Promise<TransitionResult> {
  const validatedId = bookingIdSchema.parse(bookingId);

  const supabase = await createServerClient();

  // Get current booking state
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', validatedId)
    .single();

  if (fetchError || !booking) {
    throw new BookingNotFoundError(validatedId);
  }

  const currentState = booking.status as BookingState;

  // Validate transition
  if (!isValidTransition(currentState, BOOKING_STATES.EXPIRED)) {
    throw new InvalidTransitionError(validatedId, currentState, BOOKING_STATES.EXPIRED);
  }

  const now = new Date().toISOString();

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: BOOKING_STATES.EXPIRED,
      updated_at: now,
    })
    .eq('id', validatedId);

  if (updateError) {
    throw new BookingTransitionError(
      `Failed to expire booking: ${updateError.message}`,
      'UPDATE_FAILED',
      validatedId,
      currentState
    );
  }

  // Log the state change (no user since it's automated)
  await logStateChange(validatedId, currentState, BOOKING_STATES.EXPIRED, undefined, 'Automated expiration');

  return {
    success: true,
    bookingId: validatedId,
    previousState: currentState,
    newState: BOOKING_STATES.EXPIRED,
    timestamp: now,
  };
}
