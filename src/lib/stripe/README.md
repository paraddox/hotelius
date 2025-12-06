# Stripe Webhook Integration

Complete Stripe webhook handlers for the Hotelius hotel reservation SaaS platform.

## Overview

This module provides comprehensive webhook handling for:

1. **SaaS Subscriptions** - Billing for hotels using the platform
2. **Connect Payments** - Guest booking payments to hotels
3. **Account Management** - Hotel onboarding and account status

## File Structure

```
src/lib/stripe/
├── README.md                 # This file
├── index.ts                  # Central export point
├── webhook-handlers.ts       # Event handler functions
└── webhook-utils.ts          # Utility functions
```

## Handled Events

### SaaS Subscription Events

| Event | Handler | Description |
|-------|---------|-------------|
| `customer.subscription.created` | `handleSubscriptionCreated` | Hotel subscribes to a plan |
| `customer.subscription.updated` | `handleSubscriptionUpdated` | Plan upgrade/downgrade or renewal |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | Subscription cancelled |
| `invoice.payment_succeeded` | `handleInvoicePaymentSucceeded` | Successful subscription payment |
| `invoice.payment_failed` | `handleInvoicePaymentFailed` | Failed subscription payment |

### Connect Payment Events

| Event | Handler | Description |
|-------|---------|-------------|
| `checkout.session.completed` | `handleCheckoutSessionCompleted` | Guest completed checkout |
| `payment_intent.succeeded` | `handlePaymentIntentSucceeded` | Booking payment successful |
| `payment_intent.payment_failed` | `handlePaymentIntentFailed` | Booking payment failed |

### Connect Account Events

| Event | Handler | Description |
|-------|---------|-------------|
| `account.updated` | `handleConnectedAccountUpdated` | Hotel Connect account status changed |

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secrets
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (for webhook logging)
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Database Tables

The webhook handlers require these database tables. Run this migration:

```sql
-- Webhook event log table (for idempotency and audit trail)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('received', 'processing', 'processed', 'failed')),
  error_message TEXT,
  connect_account_id TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);
```

### 3. Configure Stripe Dashboard

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to (or select "Select all events")
5. Copy the signing secret and add to `STRIPE_WEBHOOK_SECRET`

### 4. Test Webhooks Locally

Use the Stripe CLI to forward webhooks to your local development server:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger payment_intent.succeeded
stripe trigger account.updated
```

## Usage

### Main Webhook Route

The main webhook endpoint is already configured at:
```
POST /api/webhooks/stripe
```

This endpoint automatically:
- Verifies webhook signatures
- Routes events to handlers
- Logs all events
- Implements idempotency
- Returns appropriate status codes

### Handler Functions

Each handler is a standalone function that can be imported and used:

```typescript
import {
  handleSubscriptionCreated,
  handlePaymentIntentSucceeded,
} from '@/lib/stripe/webhook-handlers';

// Use in custom webhook routes
await handleSubscriptionCreated(event);
```

### Utility Functions

```typescript
import {
  verifyWebhookSignature,
  getEventData,
  getEventMetadata,
  logWebhookEvent,
} from '@/lib/stripe/webhook-utils';

// Verify signature
const event = verifyWebhookSignature(body, signature, secret);

// Extract data
const subscription = getEventData<Stripe.Subscription>(event);
const metadata = getEventMetadata<{ hotelId: string }>(event);

// Log event
await logWebhookEvent(event, 'processed');
```

## Metadata Requirements

### Subscription Metadata

When creating subscriptions for hotels, include:

```typescript
{
  hotelId: string;      // Required: Hotel UUID
  hotelName: string;    // Hotel name
  plan: string;         // Subscription plan tier
  maxRooms?: string;    // Plan limit
  maxStaff?: string;    // Plan limit
}
```

### Payment Intent Metadata

When creating payment intents for bookings, include:

```typescript
{
  reservationId: string;  // Required: Booking UUID
  hotelId: string;        // Hotel UUID
  guestId: string;        // Guest UUID
  checkIn: string;        // ISO date
  checkOut: string;       // ISO date
  roomCount: string;      // Number of rooms
}
```

### Connect Account Metadata

When creating Connect accounts for hotels, include:

```typescript
{
  hotelId: string;   // Required: Hotel UUID
  hotelName: string; // Hotel name
  ownerId: string;   // Owner UUID
}
```

## Error Handling

All handlers implement proper error handling:

1. **Signature Verification Errors** - Returns 400 Bad Request
2. **Processing Errors** - Returns 500 Internal Server Error (Stripe will retry)
3. **Database Errors** - Logged and thrown for retry
4. **Missing Metadata** - Logged as warning, event skipped

## Idempotency

Webhook events are idempotent:

- Events are logged to `webhook_events` table with unique `event_id`
- Before processing, checks if event was already processed
- Prevents duplicate database operations
- Safe to receive the same event multiple times

## Logging

All webhook events are logged with:

- Event ID and type
- Processing status
- Error messages if failed
- Processing timestamps
- Connect account ID if applicable

View logs in the `webhook_events` table or check application logs.

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from '@jest/globals';
import { mapSubscriptionStatus, mapPaymentStatus } from '@/lib/stripe/webhook-utils';

describe('Webhook Utils', () => {
  it('maps subscription status correctly', () => {
    expect(mapSubscriptionStatus('active')).toBe('active');
    expect(mapSubscriptionStatus('trialing')).toBe('trial');
    expect(mapSubscriptionStatus('canceled')).toBe('canceled');
  });
});
```

### Integration Tests

Use Stripe CLI to trigger real webhook events:

```bash
# Test subscription created
stripe trigger customer.subscription.created

# Test payment succeeded
stripe trigger payment_intent.succeeded

# Test payment failed
stripe trigger payment_intent.payment_failed
```

## Monitoring

### Check Webhook Status

```bash
GET /api/webhooks/stripe
```

Returns:
```json
{
  "endpoint": "/api/webhooks/stripe",
  "description": "Stripe webhook handler for Hotelius SaaS",
  "supported_events": [...],
  "configuration": {
    "webhook_secret_configured": true
  }
}
```

### View Recent Events

Query the `webhook_events` table:

```sql
SELECT
  event_type,
  status,
  error_message,
  received_at,
  processed_at
FROM webhook_events
ORDER BY received_at DESC
LIMIT 20;
```

### Failed Events

Find and retry failed events:

```sql
SELECT * FROM webhook_events
WHERE status = 'failed'
ORDER BY received_at DESC;
```

## Security

- **Signature Verification**: All webhooks must have valid Stripe signatures
- **Payload Validation**: Payloads larger than 64KB are rejected
- **Service Role Client**: Uses Supabase service role to bypass RLS
- **Environment Secrets**: All secrets stored in environment variables

## TODO

The following features are marked as TODO in the code:

### Email Notifications

- [ ] Send email on subscription created
- [ ] Send email on subscription canceled
- [ ] Send email on payment failed (with retry link)
- [ ] Send booking confirmation email to guest
- [ ] Send booking notification email to hotel
- [ ] Send Connect onboarding completion email
- [ ] Send payment failure notification to guest

### Database Tables

- [ ] Create `subscriptions` table for SaaS billing
- [ ] Create `invoices` table for payment records
- [ ] Create `payments` table for booking payments
- [ ] Create `connect_accounts` table for hotel Connect status
- [ ] Create `payouts` table for hotel payout tracking

### Features

- [ ] Implement automatic booking cancellation after N failed payment attempts
- [ ] Add grace period before suspending service on failed payment
- [ ] Archive hotel data on subscription deletion
- [ ] Implement subscription plan limits enforcement
- [ ] Add webhook retry mechanism for failed handlers

## Support

For issues or questions:
- Check Stripe Dashboard > Developers > Webhooks for event delivery status
- Review application logs for error details
- Query `webhook_events` table for event history
- Use Stripe CLI to test events locally

## Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
