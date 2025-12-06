# Email System - Quick Reference

## Installation Status
✅ Resend installed
✅ React Email components installed
✅ Email templates created
✅ Trigger functions ready

## Environment Setup

```bash
# Add to .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Hotelius <noreply@hotelius.com>"
SUPPORT_EMAIL="support@hotelius.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Common Usage Patterns

### 1. Booking Confirmed (after payment)
```typescript
import { sendBookingConfirmation } from '@/lib/email';

sendBookingConfirmation(bookingId, { async: true });
```

### 2. Booking Cancelled
```typescript
import { sendCancellationEmail } from '@/lib/email';

sendCancellationEmail(bookingId, {
  async: true,
  cancelledBy: 'guest'
});
```

### 3. Payment Receipt
```typescript
import { sendPaymentReceipt } from '@/lib/email';

sendPaymentReceipt(bookingId, paymentIntentId, {
  async: true,
  cardBrand: 'visa',
  cardLast4: '4242'
});
```

### 4. New Hotel Welcome
```typescript
import { sendWelcomeEmail } from '@/lib/email';

sendWelcomeEmail(hotelId, { async: true });
```

## Integration Checklist

### Stripe Webhook
- [x] Import email functions
- [ ] Add to payment_intent.succeeded handler
- [ ] Send payment receipt
- [ ] Send booking confirmation

### Booking Creation
- [x] Import email functions
- [ ] Add after booking insert
- [ ] Send only if immediately confirmed

### Cancellation Handler
- [x] Import email functions
- [ ] Add after status update
- [ ] Include cancellation reason

### Hotel Registration
- [x] Import email functions
- [ ] Add after hotel insert
- [ ] Send welcome email

## File Locations

| Purpose | File Path |
|---------|-----------|
| Main exports | `src/lib/email/index.ts` |
| Trigger functions | `src/lib/email/triggers.ts` |
| Send utilities | `src/lib/email/send.ts` |
| Email client | `src/lib/email/client.ts` |
| Templates | `src/lib/email/templates/*.tsx` |
| Examples | `src/lib/email/examples.ts` |
| Full docs | `src/lib/email/README.md` |

## Email Types

| Email | Function | When to Send |
|-------|----------|--------------|
| Booking Confirmation | `sendBookingConfirmation()` | After payment succeeds |
| Payment Receipt | `sendPaymentReceipt()` | After payment processing |
| Cancellation | `sendCancellationEmail()` | When booking cancelled |
| Welcome Hotel | `sendWelcomeEmail()` | New hotel registration |

## Best Practices

✅ **DO**
- Always use `async: true` in user-facing flows
- Handle email failures gracefully
- Log errors for debugging
- Test in development before production
- Use environment variables for API keys

❌ **DON'T**
- Don't block operations waiting for emails
- Don't throw errors if email fails
- Don't send emails synchronously in webhooks
- Don't hardcode email addresses
- Don't forget to verify domain for production

## Testing

### Send Test Email
```bash
curl http://localhost:3000/api/test-email
```

### Check Results
1. Go to https://resend.com/emails
2. View sent emails
3. Check delivery status

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check RESEND_API_KEY in .env.local |
| Going to spam | Verify domain in Resend dashboard |
| TypeScript errors | Check imports and types |
| Missing data | Verify booking/hotel exists in DB |

## Quick Links

- [Full Documentation](./README.md)
- [Code Examples](./examples.ts)
- [Setup Guide](../../EMAIL_SETUP_GUIDE.md)
- [Resend Dashboard](https://resend.com/emails)
- [Resend Docs](https://resend.com/docs)

## Support

Questions? Check:
1. `src/lib/email/README.md` - Detailed documentation
2. `src/lib/email/examples.ts` - Integration examples
3. `EMAIL_SETUP_GUIDE.md` - Setup instructions
