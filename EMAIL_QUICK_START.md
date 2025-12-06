# Email System - Quick Start Guide

Get up and running with email notifications in 5 minutes.

## Step 1: Get Resend API Key (2 min)

1. Go to https://resend.com and sign up
2. Navigate to "API Keys" in dashboard
3. Click "Create API Key"
4. Copy the key (starts with `re_`)

## Step 2: Configure Environment (1 min)

Add to `.env.local`:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM="Hotelius <noreply@yourdomain.com>"
SUPPORT_EMAIL="support@hotelius.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 3: Verify Setup (1 min)

```bash
npx tsx src/lib/email/verify-setup.ts
```

You should see all green checkmarks. If not, check your API key.

## Step 4: Preview Templates (1 min)

```bash
npx react-email dev
```

Opens http://localhost:3000 with template previews.

## Step 5: Send Your First Email (1 min)

```typescript
import { sendBookingConfirmation } from '@/lib/email';

// Example booking data
const booking = {
  id: 'test-123',
  check_in_date: '2025-12-20',
  check_out_date: '2025-12-25',
  number_of_guests: 2,
  total_price: 599,
  currency: 'USD',
  room: {
    id: 'room-1',
    room_type: 'Deluxe Suite',
    description: 'Beautiful ocean view suite',
  },
  hotel: {
    id: 'hotel-1',
    name: 'Test Hotel',
    address: '123 Main St',
    city: 'Miami',
    country: 'USA',
    phone: '+1-555-0123',
    email: 'info@hotel.com',
  },
  guest: {
    email: 'your-email@example.com', // Change this!
    full_name: 'Test Guest',
  },
};

const result = await sendBookingConfirmation(booking);
console.log(result); // { success: true, messageId: '...' }
```

## Common Usage

### After Booking Creation
```typescript
await sendBookingConfirmation(booking);
```

### After Payment
```typescript
await sendPaymentReceipt(booking, {
  transactionId: 'txn_123',
  paymentMethod: 'card',
  cardLast4: '4242',
});
```

### When Cancelling
```typescript
await sendCancellationEmail(booking, 'Guest requested', 100);
```

### Welcome New Hotel
```typescript
await sendWelcomeTenantEmail(
  { id: hotel.id, name: hotel.name },
  { email: user.email, full_name: user.full_name }
);
```

## Production Setup

Before going live:

1. **Verify Domain in Resend**
   - Add your domain in Resend dashboard
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification

2. **Update EMAIL_FROM**
   ```bash
   EMAIL_FROM="Hotelius <noreply@mail.yourdomain.com>"
   ```

3. **Set Production URL**
   ```bash
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   ```

4. **Set up Cron for Reminders**
   See `SETUP_EMAIL.md` for cron job setup

## Troubleshooting

### Emails not sending?
- Check `RESEND_API_KEY` is correct
- Verify `EMAIL_FROM` uses verified domain
- Check logs for errors

### Emails in spam?
- Verify domain DNS records
- Don't use free email domains
- Check sender reputation

### Template not rendering?
- Preview with `npx react-email dev`
- Check all required props are provided
- Verify imports are correct

## Next Steps

- Read full setup guide: `SETUP_EMAIL.md`
- See usage examples: `src/lib/email/examples.ts`
- API reference: `src/lib/email/README.md`

## Available Templates

1. **Booking Confirmation** - After booking created
2. **Booking Reminder** - 24h before check-in
3. **Booking Cancelled** - When booking cancelled
4. **Payment Receipt** - After payment processed
5. **Welcome Hotel** - New hotel signup

All templates are responsive, beautiful, and production-ready!

---

**Need help?** Check `SETUP_EMAIL.md` or `EMAIL_SYSTEM_SUMMARY.md` for detailed documentation.
