# Stripe Webhook Testing Guide

Complete guide for testing Stripe webhook handlers in development and production.

## Prerequisites

1. **Stripe CLI** - Install from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. **Stripe Account** - Test mode credentials
3. **Local Development Server** - Running on `http://localhost:3000`

## Setup

### 1. Install Stripe CLI

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### 2. Login to Stripe CLI

```bash
stripe login
```

This will open a browser window to authorize the CLI.

### 3. Configure Environment Variables

Add to `.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Local Testing

### Start Webhook Forwarding

Forward Stripe webhooks to your local development server:

```bash
# Basic forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# With specific events only
stripe listen --events customer.subscription.created,payment_intent.succeeded \
  --forward-to localhost:3000/api/webhooks/stripe

# With custom port
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

The CLI will output a webhook signing secret (`whsec_...`). Add this to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Trigger Test Events

#### Subscription Events

```bash
# Create subscription
stripe trigger customer.subscription.created

# Update subscription
stripe trigger customer.subscription.updated

# Delete subscription
stripe trigger customer.subscription.deleted

# Invoice paid
stripe trigger invoice.paid

# Invoice payment failed
stripe trigger invoice.payment_failed
```

#### Payment Events

```bash
# Payment intent succeeded
stripe trigger payment_intent.succeeded

# Payment intent failed
stripe trigger payment_intent.payment_failed

# Checkout session completed
stripe trigger checkout.session.completed
```

#### Connect Events

```bash
# Account updated
stripe trigger account.updated
```

### Custom Event Data

Create events with custom metadata:

```bash
# Create a payment intent with custom metadata
stripe payment_intents create \
  --amount 10000 \
  --currency usd \
  --metadata[reservationId]=res_123 \
  --metadata[hotelId]=hotel_456 \
  --metadata[guestId]=guest_789

# Trigger the succeeded event
stripe payment_intents confirm pi_xxx
```

## Testing Workflow

### 1. Test Signature Verification

```bash
# Valid signature
stripe trigger payment_intent.succeeded

# Check logs for successful verification
# Should see: "[Stripe Webhook] Received: payment_intent.succeeded"
```

### 2. Test Event Routing

```bash
# Trigger different event types
stripe trigger customer.subscription.created
stripe trigger payment_intent.succeeded
stripe trigger account.updated

# Verify each event is routed to correct handler
```

### 3. Test Error Handling

**Missing Metadata:**
```bash
# Create payment intent without metadata
stripe payment_intents create --amount 5000 --currency usd

# Should log warning: "Payment intent missing reservationId in metadata"
```

**Invalid Signature:**
```bash
# Send request with wrong signature
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid" \
  -d '{"type":"test"}'

# Should return: 400 Bad Request
```

### 4. Test Idempotency

```bash
# Send same event twice
stripe events resend evt_xxx

# Second request should return: "already_processed"
```

## Integration Testing

### Test SaaS Subscription Flow

```bash
# 1. Create customer
CUSTOMER=$(stripe customers create --email test@hotel.com | jq -r .id)

# 2. Create subscription with metadata
SUBSCRIPTION=$(stripe subscriptions create \
  --customer $CUSTOMER \
  --items[0][price]=price_xxx \
  --metadata[hotelId]=hotel_123 \
  --metadata[plan]=premium \
  | jq -r .id)

# 3. Verify webhook was processed
# Check hotels table for updated subscription_status

# 4. Cancel subscription
stripe subscriptions cancel $SUBSCRIPTION

# 5. Verify cancellation webhook was processed
```

### Test Booking Payment Flow

```bash
# 1. Create payment intent
PAYMENT=$(stripe payment_intents create \
  --amount 50000 \
  --currency usd \
  --metadata[reservationId]=booking_123 \
  --metadata[hotelId]=hotel_456 \
  | jq -r .id)

# 2. Confirm payment
stripe payment_intents confirm $PAYMENT \
  --payment-method pm_card_visa

# 3. Verify booking status updated to "confirmed"
# Check bookings table for payment_status='paid'
```

### Test Connect Account Flow

```bash
# 1. Create Connect account
ACCOUNT=$(stripe accounts create \
  --type express \
  --country US \
  --email hotel@example.com \
  --metadata[hotelId]=hotel_789 \
  | jq -r .id)

# 2. Update account (trigger account.updated event)
stripe accounts update $ACCOUNT \
  --metadata[hotelId]=hotel_789 \
  --metadata[hotelName]="Grand Hotel"

# 3. Verify hotel stripe_account_id updated
```

## Production Testing

### Setup Production Webhook

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events or choose "Select all events"
5. Copy the signing secret
6. Add to production environment variables

### Test Production Webhooks

```bash
# Use production Stripe CLI
stripe login --api-key sk_live_...

# Trigger test event in production
stripe trigger payment_intent.succeeded --api-key sk_live_...
```

### Monitor Production Events

```bash
# List recent events
stripe events list --limit 10

# View specific event
stripe events retrieve evt_xxx

# Resend event
stripe events resend evt_xxx
```

## Debugging

### View Webhook Logs

**Application Logs:**
```bash
# Development
npm run dev

# Check console for:
# [Stripe Webhook] Received: ...
# [Stripe Webhook] Processing: ...
# [Stripe Webhook] Successfully processed: ...
```

**Database Logs:**
```sql
-- View recent webhook events
SELECT
  event_type,
  status,
  error_message,
  received_at,
  processed_at
FROM webhook_events
ORDER BY received_at DESC
LIMIT 20;

-- View failed events
SELECT * FROM webhook_events
WHERE status = 'failed'
ORDER BY received_at DESC;
```

**Stripe Dashboard:**
- Go to Developers > Webhooks
- Click on your endpoint
- View event delivery attempts and responses

### Common Issues

**Issue: Signature Verification Failed**
```
Error: Webhook signature verification failed
```
**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Use secret from `stripe listen` for local testing
- Use secret from Dashboard for production

**Issue: Event Already Processed**
```
Status: already_processed
```
**Solution:**
- This is normal - idempotency working correctly
- Event was received twice (Stripe retry)
- No action needed

**Issue: Missing Metadata**
```
Warning: Payment intent missing reservationId in metadata
```
**Solution:**
- Always include required metadata when creating Stripe objects
- See README.md for required metadata fields

**Issue: Database Error**
```
Error: relation "webhook_events" does not exist
```
**Solution:**
- Run migration: `014_stripe_webhooks.sql`
- Verify Supabase connection

### Test Event Payload

Example of a payment_intent.succeeded event:

```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "object": "payment_intent",
      "amount": 50000,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "reservationId": "booking_123",
        "hotelId": "hotel_456",
        "guestId": "guest_789",
        "checkIn": "2024-12-15",
        "checkOut": "2024-12-20",
        "roomCount": "2"
      }
    }
  }
}
```

## Automated Testing

### Unit Tests

Create `src/lib/stripe/__tests__/webhook-handlers.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import type Stripe from 'stripe';
import { handlePaymentIntentSucceeded } from '../webhook-handlers';

describe('Payment Intent Handler', () => {
  it('should update booking on payment success', async () => {
    const mockEvent: Stripe.Event = {
      id: 'evt_test',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test',
          metadata: {
            reservationId: 'booking_123',
          },
        } as Stripe.PaymentIntent,
      },
    } as Stripe.Event;

    await handlePaymentIntentSucceeded(mockEvent);

    // Verify booking was updated
    // Add assertions here
  });
});
```

### Run Tests

```bash
npm test src/lib/stripe
```

## Performance Testing

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Create test config: artillery.yml
# Run load test
artillery run artillery.yml
```

### Monitor Processing Time

```bash
# Check average processing time
SELECT
  event_type,
  AVG(EXTRACT(EPOCH FROM (processed_at - received_at))) as avg_processing_seconds,
  COUNT(*) as event_count
FROM webhook_events
WHERE status = 'processed'
GROUP BY event_type
ORDER BY avg_processing_seconds DESC;
```

## Security Testing

### Test Signature Bypass Attempt

```bash
# Should fail with 400
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"payment_intent.succeeded"}'
```

### Test Replay Attack

```bash
# Get old event
OLD_EVENT=$(stripe events retrieve evt_old)

# Try to replay (should be caught by idempotency)
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: $OLD_SIGNATURE" \
  -d "$OLD_EVENT"
```

## Checklist

Before deploying to production:

- [ ] All webhook handlers tested locally
- [ ] Database migration `014_stripe_webhooks.sql` applied
- [ ] Environment variables configured
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Signature verification working
- [ ] Idempotency tested
- [ ] Error handling verified
- [ ] Metadata requirements documented
- [ ] Monitoring and alerting configured
- [ ] Failed event retry process established

## Resources

- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Event Types Reference](https://stripe.com/docs/api/events/types)
