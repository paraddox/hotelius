/**
 * Booking Email Functions
 *
 * This module provides functions to send booking-related emails
 * including confirmations, reminders, cancellations, and receipts.
 */

import { sendEmail, SendEmailResult } from './send';
import { BookingConfirmationEmail } from './templates/booking-confirmation';
import { BookingReminderEmail } from './templates/booking-reminder';
import { BookingCancelledEmail } from './templates/booking-cancelled';
import { PaymentReceiptEmail } from './templates/payment-receipt';
import { WelcomeHotelEmail } from './templates/welcome-hotel';
import { format } from 'date-fns';

// Types based on the database schema
interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone?: string | null;
  email?: string | null;
  image_url?: string | null;
}

interface Room {
  id: string;
  room_type: string;
  description?: string | null;
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_price: number;
  currency: string;
  special_requests?: string | null;
  payment_intent_id?: string | null;
}

interface Guest {
  email: string;
  full_name?: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

interface User {
  email: string;
  full_name?: string | null;
}

/**
 * Send booking confirmation email
 *
 * Sent immediately after a booking is confirmed. Includes all
 * booking details, hotel information, and next steps.
 */
export async function sendBookingConfirmation(
  booking: Booking & { room: Room; hotel: Hotel; guest: Guest }
): Promise<SendEmailResult> {
  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate tax (assumed to be 10% for this example, should come from pricing)
  const subtotal = booking.total_price / 1.1;
  const tax = booking.total_price - subtotal;

  const bookingReference = `BK-${booking.id.slice(0, 8).toUpperCase()}`;

  return await sendEmail({
    to: booking.guest.email,
    subject: `Booking Confirmed - ${booking.hotel.name} - ${bookingReference}`,
    react: BookingConfirmationEmail({
      bookingReference,
      guestName: booking.guest.full_name || 'Guest',
      guestEmail: booking.guest.email,
      checkInDate: format(checkInDate, 'EEEE, MMMM d, yyyy'),
      checkOutDate: format(checkOutDate, 'EEEE, MMMM d, yyyy'),
      numberOfNights: nights,
      numberOfGuests: booking.number_of_guests,
      roomType: booking.room.room_type,
      roomDescription: booking.room.description || undefined,
      hotelName: booking.hotel.name,
      hotelAddress: booking.hotel.address,
      hotelCity: booking.hotel.city,
      hotelCountry: booking.hotel.country,
      hotelPhone: booking.hotel.phone || undefined,
      hotelEmail: booking.hotel.email || undefined,
      hotelImage: booking.hotel.image_url || undefined,
      subtotal,
      tax,
      total: booking.total_price,
      currency: booking.currency,
      specialRequests: booking.special_requests || undefined,
      viewBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${booking.id}`,
      manageBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${booking.id}`,
    }),
    tags: [
      { name: 'type', value: 'booking-confirmation' },
      { name: 'booking_id', value: booking.id },
    ],
  });
}

/**
 * Send booking reminder email
 *
 * Sent 1 day before check-in to remind guests about their
 * upcoming stay and provide arrival information.
 */
export async function sendBookingReminder(
  booking: Booking & { room: Room; hotel: Hotel; guest: Guest }
): Promise<SendEmailResult> {
  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const bookingReference = `BK-${booking.id.slice(0, 8).toUpperCase()}`;

  // Generate Google Maps URL for directions
  const mapsQuery = encodeURIComponent(
    `${booking.hotel.address}, ${booking.hotel.city}, ${booking.hotel.country}`
  );
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return await sendEmail({
    to: booking.guest.email,
    subject: `Reminder: Check-in Tomorrow at ${booking.hotel.name}`,
    react: BookingReminderEmail({
      bookingReference,
      guestName: booking.guest.full_name || 'Guest',
      checkInDate: format(checkInDate, 'EEEE, MMMM d, yyyy'),
      checkOutDate: format(checkOutDate, 'EEEE, MMMM d, yyyy'),
      numberOfNights: nights,
      numberOfGuests: booking.number_of_guests,
      roomType: booking.room.room_type,
      hotelName: booking.hotel.name,
      hotelAddress: booking.hotel.address,
      hotelCity: booking.hotel.city,
      hotelCountry: booking.hotel.country,
      hotelPhone: booking.hotel.phone || undefined,
      hotelEmail: booking.hotel.email || undefined,
      hotelImage: booking.hotel.image_url || undefined,
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      checkInInstructions:
        'Please proceed to the front desk with a valid photo ID and the credit card used for booking. Early check-in is subject to availability.',
      directionsUrl,
      specialRequests: booking.special_requests || undefined,
      viewBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${booking.id}`,
    }),
    tags: [
      { name: 'type', value: 'booking-reminder' },
      { name: 'booking_id', value: booking.id },
    ],
  });
}

/**
 * Send cancellation email
 *
 * Sent when a booking is cancelled. Includes cancellation
 * details and refund information if applicable.
 */
export async function sendCancellationEmail(
  booking: Booking & { room: Room; hotel: Hotel; guest: Guest },
  cancellationReason?: string,
  refundPercentage: number = 100
): Promise<SendEmailResult> {
  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);

  const bookingReference = `BK-${booking.id.slice(0, 8).toUpperCase()}`;
  const refundAmount = (booking.total_price * refundPercentage) / 100;

  return await sendEmail({
    to: booking.guest.email,
    subject: `Booking Cancelled - ${booking.hotel.name} - ${bookingReference}`,
    react: BookingCancelledEmail({
      bookingReference,
      guestName: booking.guest.full_name || 'Guest',
      checkInDate: format(checkInDate, 'EEEE, MMMM d, yyyy'),
      checkOutDate: format(checkOutDate, 'EEEE, MMMM d, yyyy'),
      roomType: booking.room.room_type,
      hotelName: booking.hotel.name,
      cancellationDate: format(new Date(), 'MMMM d, yyyy'),
      cancellationReason,
      cancelledBy: 'guest',
      totalAmount: booking.total_price,
      refundAmount,
      refundPercentage,
      currency: booking.currency,
      hotelEmail: booking.hotel.email || undefined,
      hotelPhone: booking.hotel.phone || undefined,
      rebookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/hotels`,
      viewPolicyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/policies/cancellation`,
    }),
    tags: [
      { name: 'type', value: 'booking-cancellation' },
      { name: 'booking_id', value: booking.id },
    ],
  });
}

/**
 * Send payment receipt email
 *
 * Sent when a payment is successfully processed. Serves as
 * both a receipt and confirmation of payment.
 */
export async function sendPaymentReceipt(
  booking: Booking & { room: Room; hotel: Hotel; guest: Guest },
  paymentDetails: {
    transactionId: string;
    paymentMethod: 'card' | 'bank' | 'other';
    cardBrand?: string;
    cardLast4?: string;
  }
): Promise<SendEmailResult> {
  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);

  const bookingReference = `BK-${booking.id.slice(0, 8).toUpperCase()}`;

  // Calculate tax (assumed to be 10% for this example)
  const subtotal = booking.total_price / 1.1;
  const tax = booking.total_price - subtotal;

  return await sendEmail({
    to: booking.guest.email,
    subject: `Payment Receipt - ${booking.hotel.name} - ${bookingReference}`,
    react: PaymentReceiptEmail({
      transactionId: paymentDetails.transactionId,
      paymentIntentId: booking.payment_intent_id || '',
      transactionDate: format(new Date(), 'MMMM d, yyyy'),
      guestName: booking.guest.full_name || 'Guest',
      guestEmail: booking.guest.email,
      amount: booking.total_price,
      currency: booking.currency,
      paymentMethod: paymentDetails.paymentMethod,
      cardBrand: paymentDetails.cardBrand,
      cardLast4: paymentDetails.cardLast4,
      paymentStatus: 'succeeded',
      bookingReference,
      hotelName: booking.hotel.name,
      hotelLogo: booking.hotel.image_url || undefined,
      checkInDate: format(checkInDate, 'MMMM d, yyyy'),
      checkOutDate: format(checkOutDate, 'MMMM d, yyyy'),
      roomType: booking.room.room_type,
      subtotal,
      tax,
      total: booking.total_price,
      viewBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${booking.id}`,
    }),
    tags: [
      { name: 'type', value: 'payment-receipt' },
      { name: 'booking_id', value: booking.id },
    ],
  });
}

/**
 * Send welcome email to new hotel/tenant
 *
 * Sent when a new hotel signs up on the platform. Includes
 * getting started information and links to important resources.
 */
export async function sendWelcomeTenantEmail(
  tenant: Tenant,
  user: User
): Promise<SendEmailResult> {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  return await sendEmail({
    to: user.email,
    subject: `Welcome to Hotelius - ${tenant.name}`,
    react: WelcomeHotelEmail({
      hotelName: tenant.name,
      hotelId: tenant.id,
      ownerName: user.full_name || 'Hotel Owner',
      ownerEmail: user.email,
      accountStatus: 'pending',
      dashboardUrl,
      setupGuideUrl: `${process.env.NEXT_PUBLIC_APP_URL}/docs/getting-started`,
      brandingSettingsUrl: `${dashboardUrl}/settings/branding`,
      roomSetupUrl: `${dashboardUrl}/room-types`,
      pricingSetupUrl: `${dashboardUrl}/rates`,
      helpCenterUrl: `${process.env.NEXT_PUBLIC_APP_URL}/help`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@hotelius.com',
    }),
    tags: [
      { name: 'type', value: 'welcome-tenant' },
      { name: 'tenant_id', value: tenant.id },
    ],
  });
}

/**
 * Send booking modification email
 *
 * Sent when a booking is modified (dates changed, room upgraded, etc.)
 */
export async function sendBookingModificationEmail(
  booking: Booking & { room: Room; hotel: Hotel; guest: Guest },
  modifications: {
    field: string;
    oldValue: string;
    newValue: string;
  }[]
): Promise<SendEmailResult> {
  const bookingReference = `BK-${booking.id.slice(0, 8).toUpperCase()}`;

  // For now, we'll reuse the confirmation email with a different subject
  // In a full implementation, you'd create a separate modification template
  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const subtotal = booking.total_price / 1.1;
  const tax = booking.total_price - subtotal;

  return await sendEmail({
    to: booking.guest.email,
    subject: `Booking Modified - ${booking.hotel.name} - ${bookingReference}`,
    react: BookingConfirmationEmail({
      bookingReference,
      guestName: booking.guest.full_name || 'Guest',
      guestEmail: booking.guest.email,
      checkInDate: format(checkInDate, 'EEEE, MMMM d, yyyy'),
      checkOutDate: format(checkOutDate, 'EEEE, MMMM d, yyyy'),
      numberOfNights: nights,
      numberOfGuests: booking.number_of_guests,
      roomType: booking.room.room_type,
      roomDescription: booking.room.description || undefined,
      hotelName: booking.hotel.name,
      hotelAddress: booking.hotel.address,
      hotelCity: booking.hotel.city,
      hotelCountry: booking.hotel.country,
      hotelPhone: booking.hotel.phone || undefined,
      hotelEmail: booking.hotel.email || undefined,
      hotelImage: booking.hotel.image_url || undefined,
      subtotal,
      tax,
      total: booking.total_price,
      currency: booking.currency,
      specialRequests: booking.special_requests || undefined,
      viewBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${booking.id}`,
      manageBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${booking.id}`,
    }),
    tags: [
      { name: 'type', value: 'booking-modification' },
      { name: 'booking_id', value: booking.id },
    ],
  });
}

/**
 * Schedule a booking reminder
 *
 * This function would integrate with a job queue or cron system
 * to send reminders 24 hours before check-in. For now, it's a
 * placeholder that shows how it would be implemented.
 */
export async function scheduleBookingReminder(
  bookingId: string
): Promise<void> {
  // TODO: Integrate with a job queue like Bull, Inngest, or similar
  // Example implementation:
  // await jobQueue.add('send-booking-reminder', {
  //   bookingId,
  //   sendAt: new Date(booking.check_in_date).getTime() - 24 * 60 * 60 * 1000,
  // });

  console.log(`Booking reminder scheduled for booking ${bookingId}`);
}
