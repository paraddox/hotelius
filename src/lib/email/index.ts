/**
 * Email Module
 *
 * This module provides email functionality for the Hotelius platform.
 * It includes templates for various transactional emails and trigger
 * functions to send them at the appropriate times.
 *
 * @example
 * ```typescript
 * import { sendBookingConfirmation } from '@/lib/email';
 *
 * // Send booking confirmation email
 * await sendBookingConfirmation(bookingId, {
 *   async: true, // Send in background
 *   locale: 'en',
 *   viewBookingUrl: `${baseUrl}/account/bookings/${bookingId}`
 * });
 * ```
 */

// Export client
export { resend, DEFAULT_FROM_EMAIL, SUPPORT_EMAIL } from './client';

// Export send functions
export { sendEmail, sendBulkEmails, queueEmail } from './send';
export type { SendEmailOptions, SendEmailResult } from './send';

// Export booking email functions
export {
  sendBookingConfirmation,
  sendBookingReminder,
  sendCancellationEmail,
  sendPaymentReceipt,
  sendWelcomeTenantEmail,
  sendBookingModificationEmail,
  scheduleBookingReminder,
} from './booking-emails';
// Export booking confirmation handler for webhook integrationexport { sendBookingConfirmationEmail } from './booking-confirmation-handler';

// Export email templates (for testing or custom usage)
export { BookingConfirmationEmail } from './templates/booking-confirmation';
export type { BookingConfirmationEmailProps } from './templates/booking-confirmation';

export { BookingReminderEmail } from './templates/booking-reminder';
export type { BookingReminderEmailProps } from './templates/booking-reminder';

export { BookingCancelledEmail } from './templates/booking-cancelled';
export type { BookingCancelledEmailProps } from './templates/booking-cancelled';

export { PaymentReceiptEmail } from './templates/payment-receipt';
export type { PaymentReceiptEmailProps } from './templates/payment-receipt';

export { WelcomeHotelEmail } from './templates/welcome-hotel';
export type { WelcomeHotelEmailProps } from './templates/welcome-hotel';

export { BaseTemplate } from './templates/BaseTemplate';
export { BaseLayout } from './templates/base-layout';
