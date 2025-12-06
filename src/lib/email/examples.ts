/**
 * Email Integration Examples
 *
 * This file contains example code showing how to integrate
 * the email notification system into various parts of the application.
 *
 * Copy and adapt these examples for your use cases.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  sendBookingConfirmation,
  sendCancellationEmail,
  sendPaymentReceipt,
  sendWelcomeEmail,
} from './index';

// ============================================================================
// Example 1: Stripe Webhook - Payment Success
// ============================================================================
// File: src/app/api/webhooks/stripe/route.ts

async function handleStripePaymentSuccess(paymentIntent: any) {
  const bookingId = paymentIntent.metadata.booking_id;
  const cardBrand = paymentIntent.charges.data[0]?.payment_method_details?.card?.brand;
  const cardLast4 = paymentIntent.charges.data[0]?.payment_method_details?.card?.last4;

  // Update booking in database
  // await updateBooking(bookingId, { status: 'confirmed', payment_status: 'paid' });

  // Send payment receipt
  await sendPaymentReceipt(bookingId, paymentIntent.id, {
    async: true, // Don't block webhook response
    transactionId: `TXN-${Date.now()}`,
    cardBrand,
    cardLast4,
  });

  // Send booking confirmation
  await sendBookingConfirmation(bookingId, {
    async: true,
    viewBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${bookingId}`,
  });
}

// ============================================================================
// Example 2: Booking API - Create New Booking
// ============================================================================
// File: src/app/api/bookings/route.ts

async function createBooking(bookingData: any) {
  // Create booking in database
  // const { data: booking } = await supabase.from('bookings').insert(bookingData).select().single();

  const booking = { id: 'booking-123' }; // Example

  // If booking was created successfully but payment is pending
  if (booking && bookingData.payment_status === 'pending') {
    // Don't send confirmation yet - wait for payment webhook
    console.log('Booking created, awaiting payment confirmation');
  }

  // If booking is confirmed immediately (e.g., pay at hotel)
  if (booking && bookingData.payment_status === 'paid') {
    await sendBookingConfirmation(booking.id, {
      async: true,
      viewBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${booking.id}`,
    });
  }

  return booking;
}

// ============================================================================
// Example 3: Cancellation Flow
// ============================================================================
// File: src/app/api/bookings/[id]/cancel/route.ts

async function cancelBooking(
  bookingId: string,
  reason: string,
  cancelledBy: 'guest' | 'hotel'
) {
  // Update booking status
  // await supabase.from('bookings').update({
  //   status: 'cancelled',
  //   cancellation_reason: reason,
  //   cancelled_at: new Date().toISOString()
  // }).eq('id', bookingId);

  // Calculate refund based on cancellation policy
  // const refundInfo = await calculateRefund(bookingId);

  // Send cancellation email
  await sendCancellationEmail(bookingId, {
    async: true,
    cancelledBy,
    cancellationReason: reason,
    // refundAmount: refundInfo.amount,
    // refundPercentage: refundInfo.percentage,
    customMessage:
      cancelledBy === 'hotel'
        ? 'We sincerely apologize for this inconvenience. Our team will reach out to assist with rebooking.'
        : undefined,
  });

  // If there's a refund, process it
  // if (refundInfo.amount > 0) {
  //   await processRefund(bookingId, refundInfo.amount);
  // }
}

// ============================================================================
// Example 4: Hotel Onboarding
// ============================================================================
// File: src/app/api/hotels/route.ts

async function createHotel(hotelData: any, ownerId: string) {
  // Create hotel in database
  // const { data: hotel } = await supabase.from('hotels').insert({
  //   ...hotelData,
  //   owner_id: ownerId,
  //   is_active: false // Pending setup
  // }).select().single();

  const hotel = { id: 'hotel-123' }; // Example

  // Send welcome email to hotel owner
  if (hotel) {
    await sendWelcomeEmail(hotel.id, {
      async: true,
      locale: 'en',
    });
  }

  return hotel;
}

// ============================================================================
// Example 5: Server Action - Booking Confirmation
// ============================================================================
// File: src/app/actions/bookings.ts

async function confirmBookingAction(bookingId: string) {
  'use server';

  // Verify booking exists and is in correct state
  // const booking = await getBooking(bookingId);
  // if (!booking || booking.status !== 'pending') {
  //   return { error: 'Invalid booking' };
  // }

  // Update booking status
  // await updateBooking(bookingId, { status: 'confirmed' });

  // Send confirmation email (async to not block UI)
  sendBookingConfirmation(bookingId, {
    async: true,
    viewBookingUrl: `/account/bookings/${bookingId}`,
  }).catch((error) => {
    console.error('Failed to send confirmation email:', error);
    // Continue - don't fail the action if email fails
  });

  return { success: true };
}

// ============================================================================
// Example 6: Cron Job - Send Reminder Emails
// ============================================================================
// File: src/app/api/cron/check-in-reminders/route.ts

async function sendCheckInReminders() {
  // Find bookings with check-in tomorrow
  // const tomorrow = new Date();
  // tomorrow.setDate(tomorrow.getDate() + 1);

  // const upcomingBookings = await supabase
  //   .from('bookings')
  //   .select('*')
  //   .eq('status', 'confirmed')
  //   .gte('check_in_date', tomorrow.toISOString().split('T')[0])
  //   .lt('check_in_date', new Date(tomorrow.getTime() + 86400000).toISOString().split('T')[0]);

  const upcomingBookings = []; // Example

  // Send reminder emails
  for (const booking of upcomingBookings) {
    // You might create a custom "check-in reminder" email template
    // For now, we could reuse the confirmation email
    await sendBookingConfirmation(booking.id, {
      async: true,
      // Could add custom subject/content for reminders
    });
  }
}

// ============================================================================
// Example 7: Test Email in Development
// ============================================================================
// File: src/app/api/test-email/route.ts

export async function GET() {
  // Only in development
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not available in production', { status: 403 });
  }

  // Send test email
  const result = await sendBookingConfirmation('test-booking-id', {
    async: false, // Wait for result
    viewBookingUrl: 'http://localhost:3000/account/bookings/test',
  });

  return Response.json({
    success: result.success,
    messageId: result.messageId,
    error: result.error,
  });
}

// ============================================================================
// Example 8: Bulk Email Sending
// ============================================================================

async function sendMonthlyNewsletterToHotels() {
  // Get all active hotels
  // const hotels = await supabase
  //   .from('hotels')
  //   .select('*, owner:profiles(*)')
  //   .eq('is_active', true);

  const hotels = []; // Example

  // Send welcome/newsletter to each hotel
  // In production, use a proper job queue for this
  for (const hotel of hotels) {
    await sendWelcomeEmail(hotel.id, {
      async: true,
    });

    // Rate limiting - wait 100ms between emails
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// ============================================================================
// Example 9: Error Handling Best Practices
// ============================================================================

async function robustEmailSending(bookingId: string) {
  try {
    const result = await sendBookingConfirmation(bookingId, {
      async: false, // Wait for result to check success
    });

    if (!result.success) {
      // Email failed - log but don't throw
      console.error('Email failed:', result.error);

      // Optionally: Queue for retry
      // await emailQueue.add('retry-confirmation', { bookingId });

      // Optionally: Alert admin
      // await alertAdmin('Email system failure', result.error);

      // Optionally: Store in failed_emails table for manual review
      // await supabase.from('failed_emails').insert({
      //   booking_id: bookingId,
      //   email_type: 'confirmation',
      //   error: result.error,
      //   attempted_at: new Date().toISOString()
      // });
    }

    return result;
  } catch (error) {
    // Unexpected error - still don't throw, just log
    console.error('Unexpected email error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

// ============================================================================
// Example 10: Custom Email with Template
// ============================================================================

import { sendEmail, BookingConfirmationEmail } from './index';

async function sendCustomBookingEmail(bookingId: string) {
  // Fetch booking data manually
  // const booking = await getBookingWithDetails(bookingId);

  // Create custom email content
  const result = await sendEmail({
    to: 'guest@example.com',
    subject: 'Your Special Booking at Luxury Hotel',
    react: BookingConfirmationEmail({
      bookingReference: bookingId,
      guestName: 'John Doe',
      checkInDate: 'Monday, January 15, 2024',
      checkOutDate: 'Wednesday, January 17, 2024',
      numberOfNights: 2,
      numberOfGuests: 2,
      roomType: 'Deluxe Suite',
      hotelName: 'The Grand Hotelius',
      hotelAddress: '123 Luxury Lane',
      hotelCity: 'New York',
      hotelCountry: 'USA',
      subtotal: 400,
      tax: 60,
      total: 460,
      currency: 'USD',
    }),
    replyTo: 'hotel@example.com',
    tags: [
      { name: 'category', value: 'booking' },
      { name: 'priority', value: 'high' },
    ],
  });

  return result;
}
