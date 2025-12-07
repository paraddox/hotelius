/**
 * Booking Confirmation Email Handler
 *
 * This module handles fetching booking data and sending confirmation emails
 * when a payment is successful. Integrates with the Stripe webhook handler.
 */

import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail, SendEmailResult } from './send';
import { BookingConfirmationEmail } from './templates/booking-confirmation';
import { format } from 'date-fns';

/**
 * Fetch complete booking data with all related information
 * needed for the confirmation email
 */
async function fetchBookingWithDetails(bookingId: string) {
  const supabase = createServiceClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id,
      confirmation_code,
      check_in_date,
      check_out_date,
      num_adults,
      num_children,
      total_price_cents,
      tax_cents,
      currency,
      special_requests,
      payment_intent_id,
      guest_id,
      hotel_id,
      room_type_id,
      hotels (
        id,
        name,
        address,
        city,
        country,
        phone,
        email,
        image_url
      ),
      room_types (
        id,
        name_default,
        description
      ),
      profiles (
        id,
        email,
        full_name
      )
    `)
    .eq('id', bookingId)
    .single();

  if (error) {
    console.error('[Booking Confirmation] Error fetching booking:', error);
    throw error;
  }

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  return booking;
}

/**
 * Send booking confirmation email after successful payment
 *
 * This function is called from the Stripe webhook handler when a
 * payment_intent.succeeded event is received. It fetches all necessary
 * booking details and sends a comprehensive confirmation email to the guest.
 *
 * @param bookingId - The UUID of the booking to send confirmation for
 * @returns Result object with success status and optional error message
 */
export async function sendBookingConfirmationEmail(
  bookingId: string
): Promise<SendEmailResult> {
  try {
    console.log(`[Booking Confirmation] Fetching booking details for ${bookingId}`);

    // Fetch complete booking data
    const booking = await fetchBookingWithDetails(bookingId);

    // Extract related data
    const hotel = Array.isArray(booking.hotels) ? booking.hotels[0] : booking.hotels;
    const roomType = Array.isArray(booking.room_types) ? booking.room_types[0] : booking.room_types;
    const guest = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;

    if (!hotel) {
      throw new Error('Hotel information not found for booking');
    }

    if (!roomType) {
      throw new Error('Room type information not found for booking');
    }

    if (!guest) {
      throw new Error('Guest information not found for booking');
    }

    // Calculate dates and pricing
    const checkInDate = new Date(booking.check_in_date);
    const checkOutDate = new Date(booking.check_out_date);
    const numberOfNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Convert cents to dollars for display
    const totalPrice = booking.total_price_cents / 100;
    const tax = booking.tax_cents / 100;
    const subtotal = totalPrice - tax;

    const numberOfGuests = booking.num_adults + booking.num_children;

    // Get room type description (handle JSONB or string)
    let roomDescription: string | undefined;
    if (typeof roomType.description === 'object' && roomType.description !== null) {
      roomDescription = (roomType.description as any).en || undefined;
    } else if (typeof roomType.description === 'string') {
      roomDescription = roomType.description;
    }

    // Generate URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hotelius.com';
    const viewBookingUrl = `${appUrl}/account/bookings/${booking.id}`;
    const manageBookingUrl = `${appUrl}/account/bookings/${booking.id}`;

    console.log(`[Booking Confirmation] Sending email to ${guest.email}`);

    // Send the confirmation email
    const result = await sendEmail({
      to: guest.email,
      subject: `Booking Confirmed - ${hotel.name} - ${booking.confirmation_code}`,
      react: BookingConfirmationEmail({
        bookingReference: booking.confirmation_code,
        guestName: guest.full_name || 'Guest',
        guestEmail: guest.email,
        checkInDate: format(checkInDate, 'EEEE, MMMM d, yyyy'),
        checkOutDate: format(checkOutDate, 'EEEE, MMMM d, yyyy'),
        numberOfNights,
        numberOfGuests,
        roomType: roomType.name_default,
        roomDescription,
        hotelName: hotel.name,
        hotelAddress: hotel.address,
        hotelCity: hotel.city,
        hotelCountry: hotel.country,
        hotelPhone: hotel.phone || undefined,
        hotelEmail: hotel.email || undefined,
        hotelImage: hotel.image_url || undefined,
        checkInTime: '3:00 PM',
        checkOutTime: '11:00 AM',
        subtotal,
        tax,
        total: totalPrice,
        currency: booking.currency.toUpperCase(),
        specialRequests: booking.special_requests || undefined,
        viewBookingUrl,
        manageBookingUrl,
      }),
      tags: [
        { name: 'type', value: 'booking-confirmation' },
        { name: 'booking_id', value: booking.id },
        { name: 'hotel_id', value: hotel.id },
      ],
    });

    if (result.success) {
      console.log(`[Booking Confirmation] Email sent successfully to ${guest.email}`);
      console.log(`[Booking Confirmation] Message ID: ${result.messageId}`);
    } else {
      console.error(`[Booking Confirmation] Failed to send email: ${result.error}`);
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error('[Booking Confirmation] Error sending confirmation email:', {
      error: errorMessage,
      bookingId,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}
