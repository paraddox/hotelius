# Email Notification System - Setup Guide

This guide will help you set up and configure the email notification system for your Hotelius hotel reservation platform.

## Overview

The email notification system provides:
- Booking confirmation emails
- Booking cancellation emails
- Payment receipts
- Welcome emails for new hotels
- Beautiful, mobile-responsive templates
- Graceful error handling
- Async/background email sending

## Quick Start

### 1. Install Dependencies

Dependencies have already been installed:
```bash
npm install resend @react-email/components
```

### 2. Get Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Verify your domain (or use `onboarding@resend.dev` for testing)
3. Navigate to API Keys in your dashboard
4. Click "Create API Key"
5. Copy the API key (it starts with `re_`)

### 3. Configure Environment Variables

Add to your `.env.local` file:

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional (defaults shown)
EMAIL_FROM="Hotelius <noreply@hotelius.com>"
SUPPORT_EMAIL="support@hotelius.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Verify Domain (Production Only)

For production:
1. Add your domain in Resend dashboard
2. Add DNS records provided by Resend
3. Wait for verification (usually takes a few minutes)
4. Update `EMAIL_FROM` to use your verified domain

For development, you can skip this step and use the test domain.

## File Structure

```
src/lib/email/
├── README.md                    # Detailed documentation
├── examples.ts                  # Integration examples
├── client.ts                    # Resend client setup
├── send.ts                      # Generic send functions
├── triggers.ts                  # Email trigger functions
├── index.ts                     # Main exports
└── templates/
    ├── BaseTemplate.tsx         # Shared email wrapper
    ├── booking-confirmation.tsx # Booking confirmation
    ├── booking-cancellation.tsx # Cancellation notice
    ├── payment-receipt.tsx      # Payment receipt
    └── welcome-hotel.tsx        # Hotel welcome email
```

## Usage Examples

### Send Booking Confirmation

```typescript
import { sendBookingConfirmation } from '@/lib/email';

// After payment succeeds
await sendBookingConfirmation(bookingId, {
  async: true, // Send in background
  viewBookingUrl: `/account/bookings/${bookingId}`
});
```

### Send Cancellation Email

```typescript
import { sendCancellationEmail } from '@/lib/email';

// When booking is cancelled
await sendCancellationEmail(bookingId, {
  async: true,
  cancelledBy: 'guest',
  cancellationReason: 'Change of plans'
});
```

### Send Payment Receipt

```typescript
import { sendPaymentReceipt } from '@/lib/email';

// After payment processing
await sendPaymentReceipt(bookingId, paymentIntentId, {
  async: true,
  cardBrand: 'visa',
  cardLast4: '4242'
});
```

### Send Welcome Email

```typescript
import { sendWelcomeEmail } from '@/lib/email';

// After hotel registration
await sendWelcomeEmail(hotelId, {
  async: true
});
```

## Integration Points

### 1. Stripe Webhook Handler

Add to `src/app/api/webhooks/stripe/route.ts` or your webhook handler:

```typescript
import { sendBookingConfirmation, sendPaymentReceipt } from '@/lib/email';

// In your webhook handler
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;
  const bookingId = paymentIntent.metadata.booking_id;

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: 'paid'
    })
    .eq('payment_intent_id', paymentIntent.id);

  // Send emails asynchronously (don't block webhook)
  sendPaymentReceipt(bookingId, paymentIntent.id, { async: true });
  sendBookingConfirmation(bookingId, { async: true });
}
```

### 2. Booking Creation

Add to your booking creation logic:

```typescript
import { sendBookingConfirmation } from '@/lib/email';

// After creating booking
const { data: booking } = await supabase
  .from('bookings')
  .insert(bookingData)
  .select()
  .single();

// Only send if immediately confirmed (e.g., pay at hotel)
if (booking && booking.status === 'confirmed') {
  sendBookingConfirmation(booking.id, { async: true });
}
```

### 3. Cancellation Flow

Add to your cancellation handler:

```typescript
import { sendCancellationEmail } from '@/lib/email';

// After cancelling booking
const { error } = await supabase
  .from('bookings')
  .update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString()
  })
  .eq('id', bookingId);

if (!error) {
  sendCancellationEmail(bookingId, {
    async: true,
    cancelledBy: 'guest'
  });
}
```

### 4. Hotel Onboarding

Add to your hotel creation logic:

```typescript
import { sendWelcomeEmail } from '@/lib/email';

// After creating hotel
const { data: hotel } = await supabase
  .from('hotels')
  .insert(hotelData)
  .select()
  .single();

if (hotel) {
  sendWelcomeEmail(hotel.id, { async: true });
}
```

## Testing

### Test in Development

Create a test endpoint:

```typescript
// src/app/api/test-email/route.ts
import { sendBookingConfirmation } from '@/lib/email';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }

  const result = await sendBookingConfirmation('test-booking-123', {
    async: false // Wait for result
  });

  return Response.json(result);
}
```

Visit `http://localhost:3000/api/test-email` to send a test email.

### Check Sent Emails

1. Go to [Resend Dashboard](https://resend.com/emails)
2. View all sent emails
3. Click on any email to see:
   - Rendered HTML
   - Delivery status
   - Recipient info
   - Error messages (if any)

## Important Notes

### Error Handling

Emails are designed to fail gracefully:

```typescript
const result = await sendBookingConfirmation(bookingId);

// Booking succeeds even if email fails
if (!result.success) {
  console.error('Email failed:', result.error);
  // App continues normally
}
```

**Never** throw errors or break the booking flow if email fails.

### Async vs Sync

- Use `async: true` for background sending (recommended)
- Use `async: false` only when you need to check the result
- Async emails don't block your API responses

```typescript
// Recommended: Don't wait for email
sendBookingConfirmation(id, { async: true });

// Only if you need the result
const result = await sendBookingConfirmation(id, { async: false });
```

### Rate Limits

Resend free tier includes:
- 100 emails/day
- 3,000 emails/month

For production, upgrade to a paid plan.

### Email Deliverability

To improve deliverability:
1. Verify your domain in Resend
2. Set up SPF, DKIM, and DMARC records
3. Use a consistent FROM email address
4. Keep email content professional
5. Include an unsubscribe link for marketing emails

## Customization

### Change Email Branding

Edit `src/lib/email/templates/BaseTemplate.tsx`:

```typescript
const styles = {
  header: {
    backgroundColor: '#8b6f47', // Change this color
  },
  // ... other styles
};
```

### Add New Email Template

1. Create template in `templates/` folder
2. Export from `index.ts`
3. Create trigger function in `triggers.ts`
4. Use in your application

Example:
```typescript
// templates/booking-reminder.tsx
export function BookingReminderEmail(props) {
  return (
    <BaseTemplate>
      {/* Your email content */}
    </BaseTemplate>
  );
}
```

## Troubleshooting

### Email Not Sending

1. Check RESEND_API_KEY is set correctly
2. Check Resend dashboard for errors
3. Verify domain is verified (production)
4. Check console logs for error messages

### Email Going to Spam

1. Verify your domain in Resend
2. Set up proper DNS records (SPF, DKIM)
3. Use a professional FROM address
4. Avoid spam trigger words

### TypeScript Errors

1. Ensure all types are imported
2. Check database types match email props
3. Run `npm run build` to check for errors

## Production Checklist

Before going live:

- [ ] RESEND_API_KEY is set in production environment
- [ ] Domain is verified in Resend
- [ ] DNS records are configured (SPF, DKIM, DMARC)
- [ ] EMAIL_FROM uses verified domain
- [ ] NEXT_PUBLIC_APP_URL points to production domain
- [ ] All email templates tested
- [ ] Error handling is in place
- [ ] Emails are sent asynchronously
- [ ] Monitoring/logging is set up
- [ ] Upgraded to appropriate Resend plan

## Support

- **Email Documentation**: [src/lib/email/README.md](src/lib/email/README.md)
- **Code Examples**: [src/lib/email/examples.ts](src/lib/email/examples.ts)
- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **React Email Docs**: [react.email/docs](https://react.email/docs)

## Next Steps

1. Set up your Resend account and API key
2. Test email sending with the test endpoint
3. Integrate emails into your booking flow
4. Customize templates to match your branding
5. Set up monitoring and error tracking
6. Plan for production deployment

Happy emailing!
