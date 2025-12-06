# Email Notification System

A comprehensive email notification system for the Hotelius hotel reservation SaaS platform. Built with [Resend](https://resend.com) and [React Email](https://react.email) for beautiful, responsive transactional emails.

## Features

- Beautiful, mobile-responsive email templates
- Luxury boutique hotel branding with warm earth tones
- TypeScript for type safety
- Graceful error handling (emails never break your booking flow)
- Support for async/queued emails
- Localization-ready
- Hotel-specific branding support

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Resend API Key (required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration (optional, with defaults)
EMAIL_FROM="Hotelius <noreply@hotelius.com>"
SUPPORT_EMAIL="support@hotelius.com"

# Application URL (for email links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Get Your Resend API Key

1. Sign up for a free account at [resend.com](https://resend.com)
2. Verify your domain (or use the test domain for development)
3. Generate an API key from the dashboard
4. Add it to your `.env.local` file

### 3. Install Dependencies

Dependencies are already installed:
- `resend` - Email sending service
- `@react-email/components` - React email components

## Email Templates

### 1. Booking Confirmation
Sent when a booking is confirmed after payment.

**Includes:**
- Booking reference number
- Guest and stay details
- Room information
- Price breakdown
- Hotel contact information
- Cancellation policy

### 2. Booking Cancellation
Sent when a booking is cancelled by guest or hotel.

**Includes:**
- Cancellation reference
- Original booking details
- Refund information and timeline
- Rebooking call-to-action
- Support contact

### 3. Payment Receipt
Sent when payment is successfully processed.

**Includes:**
- Transaction ID and payment details
- Payment method (last 4 digits)
- Booking summary
- Detailed price breakdown
- Download receipt link

### 4. Welcome Hotel
Sent when a new hotel joins the platform.

**Includes:**
- Welcome message
- Getting started checklist
- Quick links to setup pages
- Support resources
- Onboarding assistance

## Usage

### Basic Usage

```typescript
import { sendBookingConfirmation } from '@/lib/email';

// Send booking confirmation
const result = await sendBookingConfirmation(bookingId);

if (result.success) {
  console.log('Email sent successfully!');
} else {
  console.error('Email failed:', result.error);
  // App continues - email failure doesn't break the flow
}
```

### Async/Background Sending

For better performance, send emails asynchronously:

```typescript
import { sendBookingConfirmation } from '@/lib/email';

// Queue email to be sent in background
await sendBookingConfirmation(bookingId, {
  async: true,
  viewBookingUrl: `/account/bookings/${bookingId}`
});

// Function returns immediately, email sends in background
```

### All Trigger Functions

#### 1. Send Booking Confirmation

```typescript
import { sendBookingConfirmation } from '@/lib/email';

await sendBookingConfirmation(bookingId, {
  async: true,              // Send in background (optional)
  locale: 'en',             // Guest's preferred language (optional)
  viewBookingUrl: 'https://...' // Link to booking details (optional)
});
```

#### 2. Send Cancellation Email

```typescript
import { sendCancellationEmail } from '@/lib/email';

await sendCancellationEmail(bookingId, {
  async: true,
  cancelledBy: 'guest',     // 'guest' or 'hotel'
  cancellationReason: 'Change of plans',
  refundAmount: 150.00,     // Override auto-calculation
  refundPercentage: 100,
  customMessage: 'We hope to see you again soon!',
  locale: 'en'
});
```

#### 3. Send Payment Receipt

```typescript
import { sendPaymentReceipt } from '@/lib/email';

await sendPaymentReceipt(bookingId, paymentIntentId, {
  async: true,
  transactionId: 'TXN-12345',
  cardBrand: 'visa',        // 'visa', 'mastercard', 'amex', etc.
  cardLast4: '4242',
  locale: 'en'
});
```

#### 4. Send Welcome Email

```typescript
import { sendWelcomeEmail } from '@/lib/email';

await sendWelcomeEmail(hotelId, {
  async: true,
  locale: 'en'
});
```

### Direct Email Sending

For custom emails, use the `sendEmail` function:

```typescript
import { sendEmail } from '@/lib/email';
import { BookingConfirmationEmail } from '@/lib/email';

const result = await sendEmail({
  to: 'guest@example.com',
  subject: 'Your Booking Confirmation',
  react: BookingConfirmationEmail({
    // ... email props
  }),
  replyTo: 'hotel@example.com',  // Optional
  bcc: 'admin@example.com',      // Optional
  tags: [                         // Optional (for tracking)
    { name: 'category', value: 'booking' }
  ]
});
```

## Integration Points

### In Stripe Webhooks

Add to your Stripe webhook handler (`src/lib/stripe-webhooks.ts`):

```typescript
import { sendBookingConfirmation, sendPaymentReceipt } from '@/lib/email';

// When payment succeeds
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      status: 'confirmed'
    })
    .eq('payment_intent_id', paymentIntent.id);

  // Send emails asynchronously
  await sendPaymentReceipt(bookingId, paymentIntent.id, { async: true });
  await sendBookingConfirmation(bookingId, { async: true });
}
```

### In Booking API

Add to your booking creation API (`src/app/api/bookings/route.ts`):

```typescript
import { sendBookingConfirmation } from '@/lib/email';

export async function POST(request: Request) {
  // ... create booking logic

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();

  if (booking) {
    // Send confirmation email in background
    sendBookingConfirmation(booking.id, {
      async: true,
      viewBookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${booking.id}`
    });
  }

  return NextResponse.json({ booking });
}
```

### In Cancellation Flow

```typescript
import { sendCancellationEmail } from '@/lib/email';

// When user cancels a booking
const { error } = await supabase
  .from('bookings')
  .update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString()
  })
  .eq('id', bookingId);

if (!error) {
  await sendCancellationEmail(bookingId, {
    async: true,
    cancelledBy: 'guest',
    cancellationReason: reason
  });
}
```

### In Hotel Onboarding

```typescript
import { sendWelcomeEmail } from '@/lib/email';

// After hotel profile is created
const { data: hotel, error } = await supabase
  .from('hotels')
  .insert(hotelData)
  .select()
  .single();

if (hotel) {
  // Send welcome email
  await sendWelcomeEmail(hotel.id, { async: true });
}
```

## Customization

### Modify Email Templates

Templates are located in `src/lib/email/templates/`. Each template:
- Uses React components
- Is fully typed with TypeScript
- Follows the luxury boutique hotel branding
- Is mobile-responsive by default

### Update Branding

Edit `BaseTemplate.tsx` to change:
- Colors (warm earth tones by default)
- Logo and header
- Footer content
- Typography

### Add New Email Templates

1. Create new template in `templates/` folder
2. Export from `index.ts`
3. Create trigger function in `triggers.ts`

## Testing

### Development Testing

Resend provides a test mode for development:

```typescript
// Emails sent in development go to Resend's test inbox
// Check your Resend dashboard to see test emails
```

### Preview Emails

You can render email templates directly for preview:

```typescript
import { BookingConfirmationEmail } from '@/lib/email';

const emailHtml = BookingConfirmationEmail({
  bookingReference: 'TEST-123',
  guestName: 'John Doe',
  // ... other props
});

// Render in browser or send test email
```

## Error Handling

The email system is designed to fail gracefully:

```typescript
const result = await sendBookingConfirmation(bookingId);

if (!result.success) {
  // Email failed, but booking still succeeded
  console.error('Email error:', result.error);

  // Optionally: Log to error tracking service
  // Optionally: Retry later via queue
  // Optionally: Alert admin
}
```

**Important**: Email failures should never block critical operations like bookings or payments.

## Localization

The system is ready for internationalization:

```typescript
await sendBookingConfirmation(bookingId, {
  locale: guestLocale // 'en', 'es', 'fr', etc.
});
```

To add translations:
1. Create locale-specific email content
2. Use `next-intl` or similar i18n library
3. Pass translated strings to email templates

## Performance

- **Async sending**: Use `async: true` for background processing
- **Bulk emails**: Use `sendBulkEmails()` for multiple recipients
- **Queue system**: Consider adding a job queue (Bull, BullMQ) for high volume

## Best Practices

1. **Always send asynchronously** in user-facing flows
2. **Never fail operations** if email fails
3. **Include unsubscribe links** for marketing emails (not required for transactional)
4. **Test all templates** before production
5. **Monitor email delivery** via Resend dashboard
6. **Keep templates responsive** for mobile devices
7. **Use proper email tags** for analytics

## Support

For issues or questions:
- Check [Resend Documentation](https://resend.com/docs)
- Check [React Email Documentation](https://react.email/docs)
- Contact: support@hotelius.com

## License

Copyright © 2025 Hotelius. All rights reserved.
