/**
 * Email Trigger Functions
 *
 * These functions are responsible for fetching the necessary data
 * and sending emails when specific events occur in the application.
 *
 * Key design principles:
 * - Fail gracefully: Email failures should not break the main flow
 * - Async/background: Emails are sent asynchronously to avoid blocking
 * - Data-driven: Fetch all required data before sending
 * - Localization-ready: Support for multiple languages
 */

import { createClient } from '@/lib/supabase/server';
import { sendEmail, queueEmail } from './send';
import { BookingConfirmationEmail } from './templates/booking-confirmation';
import { BookingCancellationEmail } from './templates/booking-cancellation';
import { PaymentReceiptEmail } from './templates/payment-receipt';
import { WelcomeHotelEmail } from './templates/welcome-hotel';
import { format } from 'date-fns';

/**
 * Send booking confirmation email
 *
 * Called when a booking is confirmed (usually after payment succeeds).
 * Fetches booking, room, hotel, and guest data, then sends a confirmation email.
 *
 * @param bookingId - The ID of the confirmed booking
 * @param options - Additional options (async, locale)
 * @returns Promise with success status
 */
export async function sendBookingConfirmation(
  bookingId: string,
  options: {
    async?: boolean;
    locale?: string;
    viewBookingUrl?: string;
  } = {}
) {
  try {
    const supabase = await createClient();

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        `
        *,
        room:rooms(*),
        hotel:hotels(*),
        guest:profiles(*)
      `
      )
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Failed to fetch booking for confirmation email:', bookingError);
      return { success: false, error: 'Booking not found' };
    }

    // Prepare email data
    const emailProps = {
      bookingReference: booking.id,
      guestName: booking.guest.full_name || 'Guest',
      guestEmail: booking.guest.email,
      checkInDate: format(new Date(booking.check_in_date), 'EEEE, MMMM d, yyyy'),
      checkOutDate: format(new Date(booking.check_out_date), 'EEEE, MMMM d, yyyy'),
      numberOfNights: calculateNights(booking.check_in_date, booking.check_out_date),
      numberOfGuests: booking.number_of_guests,
      roomType: booking.room.room_type,
      roomDescription: booking.room.description,
      hotelName: booking.hotel.name,
      hotelAddress: booking.hotel.address,
      hotelCity: booking.hotel.city,
      hotelCountry: booking.hotel.country,
      hotelPhone: booking.hotel.phone,
      hotelEmail: booking.hotel.email,
      hotelLogo: booking.hotel.image_url,
      subtotal: booking.total_price - (booking.total_price * 0.15), // Simplified tax calculation
      tax: booking.total_price * 0.15,
      total: booking.total_price,
      currency: booking.currency || 'USD',
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in. Cancellations made within 48 hours are subject to a one-night charge.',
      specialRequests: booking.special_requests,
      viewBookingUrl: options.viewBookingUrl,
      locale: options.locale || 'en',
    };

    const emailOptions = {
      to: booking.guest.email,
      subject: `Booking Confirmed - ${booking.hotel.name}`,
      react: BookingConfirmationEmail(emailProps),
      tags: [
        { name: 'type', value: 'booking-confirmation' },
        { name: 'booking_id', value: bookingId },
      ],
    };

    // Send email (async or sync based on options)
    if (options.async) {
      queueEmail(emailOptions);
      return { success: true, queued: true };
    } else {
      return await sendEmail(emailOptions);
    }
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send booking cancellation email
 *
 * Called when a booking is cancelled by either the guest or hotel.
 * Includes refund information based on cancellation policy.
 *
 * @param bookingId - The ID of the cancelled booking
 * @param options - Additional options (cancelledBy, reason, refund details)
 * @returns Promise with success status
 */
export async function sendCancellationEmail(
  bookingId: string,
  options: {
    async?: boolean;
    cancelledBy?: 'guest' | 'hotel';
    cancellationReason?: string;
    refundAmount?: number;
    refundPercentage?: number;
    customMessage?: string;
    locale?: string;
  } = {}
) {
  try {
    const supabase = await createClient();

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        `
        *,
        room:rooms(*),
        hotel:hotels(*),
        guest:profiles(*)
      `
      )
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Failed to fetch booking for cancellation email:', bookingError);
      return { success: false, error: 'Booking not found' };
    }

    // Calculate refund based on cancellation policy
    const daysUntilCheckIn = Math.floor(
      (new Date(booking.check_in_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let refundAmount = options.refundAmount;
    let refundPercentage = options.refundPercentage;

    // Default refund calculation if not provided
    if (refundAmount === undefined) {
      if (daysUntilCheckIn >= 2) {
        refundAmount = booking.total_price;
        refundPercentage = 100;
      } else if (daysUntilCheckIn >= 1) {
        refundAmount = booking.total_price * 0.5;
        refundPercentage = 50;
      } else {
        refundAmount = 0;
        refundPercentage = 0;
      }
    }

    const emailProps = {
      bookingReference: booking.id,
      guestName: booking.guest.full_name || 'Guest',
      checkInDate: format(new Date(booking.check_in_date), 'EEEE, MMMM d, yyyy'),
      checkOutDate: format(new Date(booking.check_out_date), 'EEEE, MMMM d, yyyy'),
      roomType: booking.room.room_type,
      hotelName: booking.hotel.name,
      hotelLogo: booking.hotel.image_url,
      cancellationDate: format(new Date(), 'EEEE, MMMM d, yyyy'),
      cancelledBy: options.cancelledBy || 'guest',
      cancellationReason: options.cancellationReason,
      originalAmount: booking.total_price,
      refundAmount,
      refundPercentage,
      currency: booking.currency || 'USD',
      customMessage: options.customMessage,
      rebookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/hotels`,
      contactSupportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/contact`,
    };

    const emailOptions = {
      to: booking.guest.email,
      subject: `Booking Cancelled - ${booking.hotel.name}`,
      react: BookingCancellationEmail(emailProps),
      tags: [
        { name: 'type', value: 'booking-cancellation' },
        { name: 'booking_id', value: bookingId },
      ],
    };

    // Send email
    if (options.async) {
      queueEmail(emailOptions);
      return { success: true, queued: true };
    } else {
      return await sendEmail(emailOptions);
    }
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send payment receipt email
 *
 * Called when a payment is successfully processed.
 * Includes transaction details and booking information.
 *
 * @param bookingId - The ID of the booking
 * @param paymentIntentId - Stripe payment intent ID
 * @param options - Additional options
 * @returns Promise with success status
 */
export async function sendPaymentReceipt(
  bookingId: string,
  paymentIntentId: string,
  options: {
    async?: boolean;
    transactionId?: string;
    cardBrand?: string;
    cardLast4?: string;
    locale?: string;
  } = {}
) {
  try {
    const supabase = await createClient();

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        `
        *,
        room:rooms(*),
        hotel:hotels(*),
        guest:profiles(*)
      `
      )
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Failed to fetch booking for payment receipt:', bookingError);
      return { success: false, error: 'Booking not found' };
    }

    const emailProps = {
      transactionId: options.transactionId || `TXN-${Date.now()}`,
      paymentIntentId,
      transactionDate: format(new Date(), 'MMMM d, yyyy h:mm a'),
      guestName: booking.guest.full_name || 'Guest',
      guestEmail: booking.guest.email,
      amount: booking.total_price,
      currency: booking.currency || 'USD',
      paymentMethod: 'card' as const,
      cardBrand: options.cardBrand,
      cardLast4: options.cardLast4,
      paymentStatus: 'succeeded' as const,
      bookingReference: booking.id,
      hotelName: booking.hotel.name,
      hotelLogo: booking.hotel.image_url,
      checkInDate: format(new Date(booking.check_in_date), 'MMMM d, yyyy'),
      checkOutDate: format(new Date(booking.check_out_date), 'MMMM d, yyyy'),
      roomType: booking.room.room_type,
      subtotal: booking.total_price - (booking.total_price * 0.15),
      tax: booking.total_price * 0.15,
      total: booking.total_price,
      viewBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${bookingId}`,
    };

    const emailOptions = {
      to: booking.guest.email,
      subject: `Payment Receipt - ${booking.hotel.name}`,
      react: PaymentReceiptEmail(emailProps),
      tags: [
        { name: 'type', value: 'payment-receipt' },
        { name: 'booking_id', value: bookingId },
        { name: 'payment_intent_id', value: paymentIntentId },
      ],
    };

    // Send email
    if (options.async) {
      queueEmail(emailOptions);
      return { success: true, queued: true };
    } else {
      return await sendEmail(emailOptions);
    }
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email to new hotel
 *
 * Called when a hotel owner creates a new hotel on the platform.
 * Includes getting started information and setup links.
 *
 * @param hotelId - The ID of the newly created hotel
 * @param options - Additional options
 * @returns Promise with success status
 */
export async function sendWelcomeEmail(
  hotelId: string,
  options: {
    async?: boolean;
    locale?: string;
  } = {}
) {
  try {
    const supabase = await createClient();

    // Fetch hotel with owner data
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select(
        `
        *,
        owner:profiles(*)
      `
      )
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      console.error('Failed to fetch hotel for welcome email:', hotelError);
      return { success: false, error: 'Hotel not found' };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const emailProps = {
      hotelName: hotel.name,
      hotelId: hotel.id,
      ownerName: hotel.owner.full_name || 'Hotel Owner',
      ownerEmail: hotel.owner.email,
      setupCompleted: false,
      accountStatus: 'pending' as const,
      dashboardUrl: `${baseUrl}/dashboard`,
      setupGuideUrl: `${baseUrl}/dashboard/settings`,
      brandingSettingsUrl: `${baseUrl}/dashboard/settings/branding`,
      roomSetupUrl: `${baseUrl}/dashboard/rooms`,
      pricingSetupUrl: `${baseUrl}/dashboard/settings/payments`,
      helpCenterUrl: `${baseUrl}/help`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@hotelius.com',
    };

    const emailOptions = {
      to: hotel.owner.email,
      subject: `Welcome to Hotelius, ${hotel.name}!`,
      react: WelcomeHotelEmail(emailProps),
      tags: [
        { name: 'type', value: 'welcome-hotel' },
        { name: 'hotel_id', value: hotelId },
      ],
    };

    // Send email
    if (options.async) {
      queueEmail(emailOptions);
      return { success: true, queued: true };
    } else {
      return await sendEmail(emailOptions);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper function to calculate number of nights between two dates
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
