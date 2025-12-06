'use server';

/**
 * Server Actions for Booking Operations
 * These actions can be called from client components to perform booking operations
 */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { BOOKING_STATES } from '@/lib/booking/states';
import {
  confirmBooking as confirmBookingTransition,
  cancelBooking as cancelBookingTransition,
  checkIn as checkInTransition,
  checkOut as checkOutTransition,
  markNoShow as markNoShowTransition,
  BookingTransitionError,
} from '@/lib/booking/transitions';
import {
  createSoftHold,
  releaseSoftHold,
  extendSoftHold,
  SoftHoldError,
} from '@/lib/booking/soft-hold';
import {
  calculateStayPrice,
  validateBookingPrice,
  PricingError,
} from '@/lib/booking/pricing';
import {
  getAvailableRoomIds,
  AvailabilityError,
} from '@/lib/booking/availability';

// Validation schemas
const createBookingSchema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkInDate: z.string().date(),
  checkOutDate: z.string().date(),
  numAdults: z.number().min(1).max(10),
  numChildren: z.number().min(0).max(10),
  guestInfo: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).max(50).optional(),
  }).optional(),
  specialRequests: z.string().max(1000).optional(),
  paymentIntentId: z.string().optional(),
  ratePlanId: z.string().uuid().optional(),
});

const updateBookingStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum([
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
    'no_show',
    'expired',
  ]),
  reason: z.string().optional(),
});

const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

/**
 * Action result type
 */
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    field?: string;
  };
}

/**
 * Create a new booking with soft hold
 */
export async function createBooking(
  formData: z.infer<typeof createBookingSchema>
): Promise<ActionResult<{ bookingId: string; confirmationCode: string }>> {
  try {
    // Validate input
    const validated = createBookingSchema.parse(formData);

    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Calculate pricing
    const pricing = await calculateStayPrice({
      hotelId: validated.hotelId,
      roomTypeId: validated.roomTypeId,
      checkInDate: validated.checkInDate,
      checkOutDate: validated.checkOutDate,
      numAdults: validated.numAdults,
      numChildren: validated.numChildren,
    });

    // Get an available room
    const availableRoomIds = await getAvailableRoomIds({
      hotelId: validated.hotelId,
      roomTypeId: validated.roomTypeId,
      checkInDate: validated.checkInDate,
      checkOutDate: validated.checkOutDate,
    });

    if (availableRoomIds.length === 0) {
      return {
        success: false,
        error: {
          message: 'No rooms available for the selected dates',
          code: 'NO_AVAILABILITY',
        },
      };
    }

    // Take the first available room
    const roomId = availableRoomIds[0];

    // Calculate soft hold expiration (15 minutes from now)
    const softHoldExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        hotel_id: validated.hotelId,
        room_id: roomId,
        room_type_id: validated.roomTypeId,
        guest_id: user?.id,
        check_in_date: validated.checkInDate,
        check_out_date: validated.checkOutDate,
        num_adults: validated.numAdults,
        num_children: validated.numChildren,
        status: BOOKING_STATES.PENDING,
        total_price_cents: pricing.totalCents,
        tax_cents: pricing.taxCents,
        currency: pricing.currency,
        rate_plan_id: pricing.appliedRatePlanId,
        special_requests: validated.specialRequests,
        stripe_payment_intent_id: validated.paymentIntentId,
        soft_hold_expires_at: softHoldExpiresAt.toISOString(),
      })
      .select('id, confirmation_code')
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return {
        success: false,
        error: {
          message: 'Failed to create booking',
          code: 'CREATE_FAILED',
        },
      };
    }

    // Revalidate relevant paths
    revalidatePath(`/hotels/${validated.hotelId}`);
    revalidatePath('/bookings');

    return {
      success: true,
      data: {
        bookingId: booking.id,
        confirmationCode: booking.confirmation_code,
      },
    };
  } catch (error) {
    console.error('Create booking error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: 'Invalid input data',
          code: 'VALIDATION_ERROR',
          field: error.errors[0]?.path.join('.'),
        },
      };
    }

    if (error instanceof PricingError || error instanceof AvailabilityError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Update booking status using state transitions
 */
export async function updateBookingStatus(
  params: z.infer<typeof updateBookingStatusSchema>
): Promise<ActionResult<{ bookingId: string; newStatus: string }>> {
  try {
    // Validate input
    const validated = updateBookingStatusSchema.parse(params);

    let result;

    // Call appropriate transition function based on target status
    switch (validated.status) {
      case 'confirmed':
        result = await confirmBookingTransition(validated.bookingId);
        break;

      case 'cancelled':
        if (!validated.reason) {
          return {
            success: false,
            error: {
              message: 'Cancellation reason is required',
              code: 'REASON_REQUIRED',
            },
          };
        }
        result = await cancelBookingTransition(validated.bookingId, validated.reason);
        break;

      case 'checked_in':
        result = await checkInTransition(validated.bookingId);
        break;

      case 'checked_out':
        result = await checkOutTransition(validated.bookingId);
        break;

      case 'no_show':
        result = await markNoShowTransition(validated.bookingId);
        break;

      default:
        return {
          success: false,
          error: {
            message: 'Invalid status transition',
            code: 'INVALID_STATUS',
          },
        };
    }

    // Revalidate paths
    revalidatePath('/bookings');
    revalidatePath(`/bookings/${validated.bookingId}`);

    return {
      success: true,
      data: {
        bookingId: result.bookingId,
        newStatus: result.newState,
      },
    };
  } catch (error) {
    console.error('Update booking status error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: 'Invalid input data',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (error instanceof BookingTransitionError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Failed to update booking status',
        code: 'UPDATE_FAILED',
      },
    };
  }
}

/**
 * Cancel a booking
 */
export async function cancelBookingAction(
  params: z.infer<typeof cancelBookingSchema>
): Promise<ActionResult<{ bookingId: string }>> {
  try {
    // Validate input
    const validated = cancelBookingSchema.parse(params);

    // Cancel the booking
    const result = await cancelBookingTransition(validated.bookingId, validated.reason);

    // Revalidate paths
    revalidatePath('/bookings');
    revalidatePath(`/bookings/${validated.bookingId}`);

    return {
      success: true,
      data: {
        bookingId: result.bookingId,
      },
    };
  } catch (error) {
    console.error('Cancel booking error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: 'Invalid input data',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (error instanceof BookingTransitionError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Failed to cancel booking',
        code: 'CANCEL_FAILED',
      },
    };
  }
}

/**
 * Extend a soft hold
 */
export async function extendSoftHoldAction(
  bookingId: string,
  additionalMinutes: number = 10
): Promise<ActionResult<{ expiresAt: string }>> {
  try {
    const result = await extendSoftHold(bookingId, additionalMinutes);

    if (!result.expiresAt) {
      return {
        success: false,
        error: {
          message: 'Failed to extend soft hold',
          code: 'EXTEND_FAILED',
        },
      };
    }

    return {
      success: true,
      data: {
        expiresAt: result.expiresAt,
      },
    };
  } catch (error) {
    console.error('Extend soft hold error:', error);

    if (error instanceof SoftHoldError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Failed to extend soft hold',
        code: 'EXTEND_FAILED',
      },
    };
  }
}

/**
 * Release a soft hold
 */
export async function releaseSoftHoldAction(
  bookingId: string
): Promise<ActionResult> {
  try {
    await releaseSoftHold(bookingId);

    // Revalidate paths
    revalidatePath('/bookings');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Release soft hold error:', error);

    if (error instanceof SoftHoldError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Failed to release soft hold',
        code: 'RELEASE_FAILED',
      },
    };
  }
}

/**
 * Get booking details
 */
export async function getBookingDetails(
  bookingId: string
): Promise<ActionResult<any>> {
  try {
    const supabase = await createServerClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotel:hotels(*),
        room:rooms(*),
        room_type:room_types(*),
        guest:profiles(*)
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return {
        success: false,
        error: {
          message: 'Booking not found',
          code: 'NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error('Get booking details error:', error);

    return {
      success: false,
      error: {
        message: 'Failed to fetch booking details',
        code: 'FETCH_FAILED',
      },
    };
  }
}

/**
 * Get user's bookings
 */
export async function getUserBookings(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      };
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotel:hotels(name, city, country),
        room_type:room_types(name)
      `)
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user bookings error:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch bookings',
          code: 'FETCH_FAILED',
        },
      };
    }

    return {
      success: true,
      data: bookings || [],
    };
  } catch (error) {
    console.error('Get user bookings error:', error);

    return {
      success: false,
      error: {
        message: 'Failed to fetch bookings',
        code: 'FETCH_FAILED',
      },
    };
  }
}
