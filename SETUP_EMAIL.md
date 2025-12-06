# Email Notification System Setup Guide

Complete guide to setting up and using the Resend email notification system for Hotelius.

## System Overview

The email notification system provides:
- **Booking Confirmation** - Sent when a booking is confirmed
- **Booking Reminder** - Sent 24 hours before check-in
- **Booking Cancellation** - Sent when a booking is cancelled
- **Payment Receipt** - Sent when payment is processed
- **Welcome Email** - Sent when a new hotel signs up

All emails use React Email components with beautiful, responsive designs and inline CSS for maximum compatibility.

## File Structure

```
src/lib/email/
├── client.ts                           # Resend client setup
├── send.ts                             # Generic email sending functions
├── booking-emails.ts                   # Booking-specific email functions
├── index.ts                            # Main exports
├── examples.ts                         # Usage examples
├── README.md                           # Documentation
└── templates/
    ├── base-layout.tsx                 # Shared email layout
    ├── BaseTemplate.tsx                # Legacy base template
    ├── booking-confirmation.tsx        # Booking confirmation email
    ├── booking-reminder.tsx            # Pre-arrival reminder email
    ├── booking-cancelled.tsx           # Cancellation confirmation email
    ├── payment-receipt.tsx             # Payment receipt/invoice email
    └── welcome-hotel.tsx               # Welcome email for new hotels
```

## Setup Steps

### 1. Install Dependencies

The required packages are already installed:
- `resend` - Email sending service
- `@react-email/components` - Email template components
- `date-fns` - Date formatting

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Email Settings
EMAIL_FROM="Hotelius <noreply@yourdomain.com>"
SUPPORT_EMAIL="support@hotelius.com"

# Application URLs
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

**Get your Resend API Key:**
1. Sign up at https://resend.com
2. Go to API Keys section
3. Create a new API key
4. Copy the key to your `.env.local`

### 3. Verify Your Domain

To send emails from your domain:

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records provided by Resend:
   - SPF record (TXT)
   - DKIM record (TXT)
   - DMARC record (TXT)
5. Wait for verification (usually 5-15 minutes)

**Using a subdomain (recommended):**
Use `mail.yourdomain.com` or `emails.yourdomain.com` to keep your main domain reputation separate.

### 4. Update Email From Address

In your `.env.local`, set:

```bash
EMAIL_FROM="Hotelius <noreply@mail.yourdomain.com>"
```

Make sure this matches your verified domain!

## Usage Examples

### Send Booking Confirmation

```typescript
import { sendBookingConfirmation } from '@/lib/email';

// In your booking creation API route
export async function POST(request: Request) {
  // ... create booking in database

  const booking = await getBookingWithRelations(bookingId);

  // Send confirmation email
  const emailResult = await sendBookingConfirmation(booking);

  if (!emailResult.success) {
    console.error('Failed to send confirmation:', emailResult.error);
    // Continue anyway - don't fail the booking
  }

  return Response.json({ booking });
}
```

### Schedule Reminder Emails

Create a cron job or scheduled task (e.g., Vercel Cron):

**File**: `src/app/api/cron/send-reminders/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { sendBookingReminder } from '@/lib/email';
import { supabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get bookings checking in tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, room:rooms(*), hotel:hotels(*), guest:profiles(*)')
    .eq('status', 'confirmed')
    .gte('check_in_date', tomorrow.toISOString().split('T')[0])
    .lt('check_in_date', new Date(tomorrow.getTime() + 86400000).toISOString().split('T')[0]);

  let sent = 0;
  let failed = 0;

  for (const booking of bookings || []) {
    const result = await sendBookingReminder(booking);
    if (result.success) sent++;
    else failed++;
  }

  return NextResponse.json({ sent, failed });
}
```

**Set up Vercel Cron** in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Send Cancellation Email

```typescript
import { sendCancellationEmail } from '@/lib/email';

export async function cancelBooking(bookingId: string, reason: string) {
  const booking = await getBookingWithRelations(bookingId);

  // Calculate refund based on policy
  const hoursUntilCheckIn =
    (new Date(booking.check_in_date).getTime() - Date.now()) / (1000 * 60 * 60);

  let refundPercentage = 0;
  if (hoursUntilCheckIn > 48) refundPercentage = 100;
  else if (hoursUntilCheckIn > 24) refundPercentage = 50;

  // Send cancellation email
  await sendCancellationEmail(booking, reason, refundPercentage);

  // Update booking status
  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);
}
```

### Send Payment Receipt

```typescript
import { sendPaymentReceipt } from '@/lib/email';

// In your Stripe webhook handler
export async function handlePaymentSuccess(paymentIntent: any) {
  const bookingId = paymentIntent.metadata.booking_id;
  const booking = await getBookingWithRelations(bookingId);

  await sendPaymentReceipt(booking, {
    transactionId: paymentIntent.id,
    paymentMethod: 'card',
    cardBrand: paymentIntent.charges.data[0]?.payment_method_details?.card?.brand,
    cardLast4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
  });
}
```

### Send Welcome Email

```typescript
import { sendWelcomeTenantEmail } from '@/lib/email';

// After creating a new hotel
export async function createHotel(hotelData: any, userId: string) {
  const hotel = await supabase
    .from('hotels')
    .insert(hotelData)
    .select()
    .single();

  const user = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Send welcome email
  await sendWelcomeTenantEmail(
    { id: hotel.data.id, name: hotel.data.name },
    { email: user.data.email, full_name: user.data.full_name }
  );
}
```

## Testing

### Preview Templates Locally

```bash
# Start the React Email dev server
npx react-email dev
```

This opens http://localhost:3000 where you can preview and test all email templates.

### Send Test Email

```typescript
import { sendEmail } from '@/lib/email';
import { BookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation';

const testData = {
  bookingReference: 'TEST-12345',
  guestName: 'Test User',
  // ... other required props
};

await sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  react: BookingConfirmationEmail(testData),
});
```

## Customization

### Change Brand Colors

Edit the styles in each template file:

```typescript
// In src/lib/email/templates/base-layout.tsx
const styles = {
  header: {
    backgroundColor: '#your-brand-color',
  },
  // ...
};
```

### Customize Email Content

All templates support customization through props. See the TypeScript interfaces in each template file.

### Add New Email Types

1. Create a new template in `src/lib/email/templates/your-template.tsx`
2. Add a sending function in `src/lib/email/booking-emails.ts`
3. Export from `src/lib/email/index.ts`

## Monitoring & Analytics

### Resend Dashboard

View email analytics at https://resend.com/emails:
- Delivery status
- Open rates (if tracking enabled)
- Click rates
- Bounces and spam complaints

### Email Tags

All emails are tagged for tracking:

```typescript
tags: [
  { name: 'type', value: 'booking-confirmation' },
  { name: 'booking_id', value: booking.id },
]
```

Use these tags to filter and analyze emails in the Resend dashboard.

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Domain Verification**: Ensure your domain is verified in Resend
3. **From Address**: Make sure `EMAIL_FROM` uses your verified domain
4. **Logs**: Check server logs for error messages

### Emails Going to Spam

1. **Verify DNS Records**: Ensure SPF, DKIM, DMARC are configured
2. **Use Verified Domain**: Don't use Gmail, Outlook, etc.
3. **Content Quality**: Avoid spam trigger words
4. **Sender Reputation**: Monitor your domain reputation

### Template Not Rendering

1. **Missing Props**: Check all required props are provided
2. **Import Errors**: Verify all React Email components are imported
3. **Preview First**: Use `npx react-email dev` to preview
4. **TypeScript Errors**: Run `npm run build` to check for type errors

## Best Practices

1. **Error Handling**: Always handle email errors gracefully
2. **Async Sending**: Don't block user actions waiting for emails
3. **Queue Failed Emails**: Implement retry logic for failed sends
4. **Test Thoroughly**: Preview and test before deploying
5. **Monitor Deliverability**: Check Resend dashboard regularly
6. **Respect Unsubscribes**: Honor opt-out requests
7. **Keep Fresh**: Only send with current, accurate data

## Security

- **Never expose API keys**: Keep `RESEND_API_KEY` secret
- **Validate recipients**: Ensure email addresses are valid
- **Sanitize content**: Escape user-provided content
- **Rate limiting**: Implement rate limits to prevent abuse
- **Cron authentication**: Secure cron endpoints with secrets

## Support

For issues with:
- **Resend**: https://resend.com/support
- **React Email**: https://react.email/docs
- **This implementation**: Check logs and examples in `/src/lib/email/`

## Next Steps

1. Set up your Resend account and verify domain
2. Configure environment variables
3. Test email sending in development
4. Set up cron job for reminder emails
5. Monitor deliverability in production
6. Customize templates to match your brand

Your email notification system is now ready to use!
