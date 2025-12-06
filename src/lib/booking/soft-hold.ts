/**
 * Soft Hold System
 * Allows temporary reservation of rooms during the booking process
 * Holds expire after a set time period (default 15 minutes)
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { BOOKING_STATES } from './states';

// Default hold duration in milliseconds (15 minutes)
const DEFAULT_HOLD_DURATION_MS = 15 * 60 * 1000;

// Validation schemas
const softHoldSchema = z.object({
  roomTypeId: z.string().uuid(),
  hotelId: z.string().uuid(),
  checkInDate: z.string().date(),
  checkOutDate: z.string().date(),
  expiresInMinutes: z.number().min(1).max(60).optional(),
});

const extendHoldSchema = z.object({
  bookingId: z.string().uuid(),
  additionalMinutes: z.number().min(1).max(30),
});

export class SoftHoldError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'SoftHoldError';
  }
}

/**
 * Interface for soft hold result
 */
export interface SoftHoldResult {
  success: boolean;
  bookingId?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Create a soft hold on a room
 * This creates a pending booking that will expire after the specified time
 */
export async function createSoftHold(params: {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  numAdults?: number;
  numChildren?: number;
  expiresInMinutes?: number;
  guestId?: string;
}): Promise<SoftHoldResult> {
  // Validate input
  const validated = softHoldSchema.parse({
    roomTypeId: params.roomTypeId,
    hotelId: params.hotelId,
    checkInDate: params.checkInDate,
    checkOutDate: params.checkInDate,
    expiresInMinutes: params.expiresInMinutes,
  });

  const supabase = await createServerClient();

  // Calculate expiration time
  const expiresInMs = (params.expiresInMinutes || 15) * 60 * 1000;
  const expiresAt = new Date(Date.now() + expiresInMs);

  // Find an available room of the requested type
  const { data: availableRooms, error: roomError } = await supabase
    .rpc('get_available_rooms', {
      p_hotel_id: params.hotelId,
      p_room_type_id: params.roomTypeId,
      p_check_in_date: params.checkInDate,
      p_check_out_date: params.checkOutDate,
    });

  if (roomError || !availableRooms || availableRooms.length === 0) {
    throw new SoftHoldError(
      'No available rooms for the selected dates',
      'NO_AVAILABILITY'
    );
  }

  // Take the first available room
  const roomId = availableRooms[0].room_id;

  // Get current user (if logged in)
  const { data: { user } } = await supabase.auth.getUser();
  const guestId = params.guestId || user?.id;

  // Create a pending booking with soft hold
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      hotel_id: params.hotelId,
      room_id: roomId,
      room_type_id: params.roomTypeId,
      guest_id: guestId,
      check_in_date: params.checkInDate,
      check_out_date: params.checkOutDate,
      num_adults: params.numAdults || 1,
      num_children: params.numChildren || 0,
      status: BOOKING_STATES.PENDING,
      total_price_cents: 0, // Will be calculated separately
      currency: 'USD',
      soft_hold_expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single();

  if (bookingError) {
    throw new SoftHoldError(
      `Failed to create soft hold: ${bookingError.message}`,
      'CREATE_FAILED'
    );
  }

  return {
    success: true,
    bookingId: booking.id,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Extend the soft hold duration
 * Can only be called on pending bookings with active holds
 */
export async function extendSoftHold(
  bookingId: string,
  additionalMinutes: number = 10
): Promise<SoftHoldResult> {
  // Validate input
  const validated = extendHoldSchema.parse({
    bookingId,
    additionalMinutes,
  });

  const supabase = await createServerClient();

  // Get current booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status, soft_hold_expires_at')
    .eq('id', validated.bookingId)
    .single();

  if (fetchError || !booking) {
    throw new SoftHoldError(
      'Booking not found',
      'BOOKING_NOT_FOUND'
    );
  }

  // Check if booking is still pending
  if (booking.status !== BOOKING_STATES.PENDING) {
    throw new SoftHoldError(
      'Can only extend soft holds on pending bookings',
      'INVALID_STATUS'
    );
  }

  // Check if hold has already expired
  const currentExpiry = new Date(booking.soft_hold_expires_at);
  const now = new Date();

  if (currentExpiry < now) {
    throw new SoftHoldError(
      'Soft hold has already expired',
      'HOLD_EXPIRED'
    );
  }

  // Calculate new expiration time
  const additionalMs = validated.additionalMinutes * 60 * 1000;
  const newExpiresAt = new Date(currentExpiry.getTime() + additionalMs);

  // Update the booking
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      soft_hold_expires_at: newExpiresAt.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', validated.bookingId);

  if (updateError) {
    throw new SoftHoldError(
      `Failed to extend soft hold: ${updateError.message}`,
      'UPDATE_FAILED'
    );
  }

  return {
    success: true,
    bookingId: validated.bookingId,
    expiresAt: newExpiresAt.toISOString(),
  };
}

/**
 * Release a soft hold (delete the pending booking)
 * This frees up the room for others to book
 */
export async function releaseSoftHold(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const validatedId = z.string().uuid().parse(bookingId);

  const supabase = await createServerClient();

  // Get current booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', validatedId)
    .single();

  if (fetchError || !booking) {
    throw new SoftHoldError(
      'Booking not found',
      'BOOKING_NOT_FOUND'
    );
  }

  // Can only release pending bookings
  if (booking.status !== BOOKING_STATES.PENDING) {
    throw new SoftHoldError(
      'Can only release pending bookings',
      'INVALID_STATUS'
    );
  }

  // Delete the booking
  const { error: deleteError } = await supabase
    .from('bookings')
    .delete()
    .eq('id', validatedId);

  if (deleteError) {
    throw new SoftHoldError(
      `Failed to release soft hold: ${deleteError.message}`,
      'DELETE_FAILED'
    );
  }

  return {
    success: true,
  };
}

/**
 * Check if a soft hold is expired
 */
export async function isSoftHoldExpired(
  bookingId: string
): Promise<boolean> {
  const validatedId = z.string().uuid().parse(bookingId);

  const supabase = await createServerClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('status, soft_hold_expires_at')
    .eq('id', validatedId)
    .single();

  if (error || !booking) {
    throw new SoftHoldError(
      'Booking not found',
      'BOOKING_NOT_FOUND'
    );
  }

  // Only pending bookings have soft holds
  if (booking.status !== BOOKING_STATES.PENDING) {
    return false;
  }

  const expiresAt = new Date(booking.soft_hold_expires_at);
  const now = new Date();

  return expiresAt < now;
}

/**
 * Get soft hold information for a booking
 */
export async function getSoftHoldInfo(bookingId: string): Promise<{
  isActive: boolean;
  expiresAt?: string;
  remainingMinutes?: number;
}> {
  const validatedId = z.string().uuid().parse(bookingId);

  const supabase = await createServerClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('status, soft_hold_expires_at')
    .eq('id', validatedId)
    .single();

  if (error || !booking) {
    throw new SoftHoldError(
      'Booking not found',
      'BOOKING_NOT_FOUND'
    );
  }

  // Only pending bookings have soft holds
  if (booking.status !== BOOKING_STATES.PENDING || !booking.soft_hold_expires_at) {
    return { isActive: false };
  }

  const expiresAt = new Date(booking.soft_hold_expires_at);
  const now = new Date();
  const isExpired = expiresAt < now;

  if (isExpired) {
    return {
      isActive: false,
      expiresAt: booking.soft_hold_expires_at,
    };
  }

  const remainingMs = expiresAt.getTime() - now.getTime();
  const remainingMinutes = Math.ceil(remainingMs / 60000);

  return {
    isActive: true,
    expiresAt: booking.soft_hold_expires_at,
    remainingMinutes,
  };
}

/**
 * Clean up expired soft holds
 * This should be called periodically (e.g., via cron job)
 * Returns the number of expired holds that were cleaned up
 *
 * Note: This function is kept for backward compatibility but is now
 * handled by the cron endpoint which uses the expireBooking action
 * from actions.ts for proper state machine transitions
 */
export async function cleanupExpiredSoftHolds(useServiceClient = false): Promise<{
  success: boolean;
  expiredCount: number;
}> {
  const supabase = useServiceClient
    ? (await import('@/lib/supabase/service')).createServiceClient()
    : await createServerClient();

  // Find all expired pending bookings
  const now = new Date().toISOString();

  const { data: expiredBookings, error: fetchError } = await supabase
    .from('bookings')
    .select('id')
    .eq('status', BOOKING_STATES.PENDING)
    .not('soft_hold_expires_at', 'is', null)
    .lt('soft_hold_expires_at', now);

  if (fetchError) {
    throw new SoftHoldError(
      `Failed to fetch expired holds: ${fetchError.message}`,
      'FETCH_FAILED'
    );
  }

  if (!expiredBookings || expiredBookings.length === 0) {
    return {
      success: true,
      expiredCount: 0,
    };
  }

  // Update status to expired
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: BOOKING_STATES.EXPIRED,
      updated_at: now,
    })
    .eq('status', BOOKING_STATES.PENDING)
    .not('soft_hold_expires_at', 'is', null)
    .lt('soft_hold_expires_at', now);

  if (updateError) {
    throw new SoftHoldError(
      `Failed to expire bookings: ${updateError.message}`,
      'UPDATE_FAILED'
    );
  }

  return {
    success: true,
    expiredCount: expiredBookings.length,
  };
}
