# Stripe Webhook Architecture

Visual guide to the webhook processing architecture in Hotelius.

## System Overview

```
┌─────────────────┐
│     Stripe      │
│   (Platform)    │
└────────┬────────┘
         │ HTTPS POST
         │ + signature
         ▼
┌─────────────────────────────────────────────┐
│  Next.js API Route                          │
│  /api/webhooks/stripe/route.ts              │
│                                             │
│  1. Verify Signature ✓                      │
│  2. Validate Payload ✓                      │
│  3. Check Idempotency ✓                     │
│  4. Route to Handler ✓                      │
│  5. Log Event ✓                             │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Event Router (EVENT_HANDLERS)              │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ SaaS Subscriptions                   │  │
│  │ • subscription.created               │  │
│  │ • subscription.updated               │  │
│  │ • subscription.deleted               │  │
│  │ • invoice.payment_succeeded          │  │
│  │ • invoice.payment_failed             │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Connect Payments                      │  │
│  │ • checkout.session.completed          │  │
│  │ • payment_intent.succeeded            │  │
│  │ • payment_intent.payment_failed       │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Connect Accounts                      │  │
│  │ • account.updated                     │  │
│  └──────────────────────────────────────┘  │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Handler Functions                          │
│  (webhook-handlers.ts)                      │
│                                             │
│  • Extract event data                       │
│  • Validate metadata                        │
│  • Update database                          │
│  • Log processing                           │
│  • Return result                            │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Supabase Database                          │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   hotels     │  │  bookings    │        │
│  │              │  │              │        │
│  │ • sub_status │  │ • status     │        │
│  │ • stripe_id  │  │ • payment    │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
│  ┌──────────────────────────────┐          │
│  │   webhook_events             │          │
│  │   (audit trail + idempotency)│          │
│  └──────────────────────────────┘          │
└─────────────────────────────────────────────┘
```

## Data Flow

### 1. Subscription Created (SaaS Billing)

```
Hotel subscribes to plan
    ↓
Stripe creates subscription
    ↓
Stripe sends webhook: customer.subscription.created
    ↓
Route receives & verifies signature
    ↓
handleSubscriptionCreated()
    ↓
Extract metadata: { hotelId, plan }
    ↓
Update hotels table:
  - subscription_status = 'active'
  - subscription_started_at = now
  - stripe_customer_id = 'cus_xxx'
    ↓
Log to webhook_events
    ↓
Return 200 OK to Stripe
```

### 2. Booking Payment (Connect Payment)

```
Guest completes payment
    ↓
Stripe processes payment via Connect
    ↓
Stripe sends webhook: payment_intent.succeeded
    ↓
Route receives & verifies signature
    ↓
handlePaymentIntentSucceeded()
    ↓
Extract metadata: { reservationId, hotelId }
    ↓
Update bookings table:
  - status = 'confirmed'
  - payment_status = 'paid'
  - stripe_payment_intent_id = 'pi_xxx'
    ↓
Log to webhook_events
    ↓
Return 200 OK to Stripe
```

### 3. Connect Account Onboarding

```
Hotel completes Connect onboarding
    ↓
Stripe updates account status
    ↓
Stripe sends webhook: account.updated
    ↓
Route receives & verifies signature
    ↓
handleConnectedAccountUpdated()
    ↓
Extract metadata: { hotelId }
    ↓
Update hotels table:
  - stripe_account_id = 'acct_xxx'
    ↓
Log to webhook_events
    ↓
Return 200 OK to Stripe
```

## File Structure

```
src/
├── app/
│   └── api/
│       └── webhooks/
│           └── stripe/
│               └── route.ts          # Main webhook endpoint
│
└── lib/
    └── stripe/
        ├── index.ts                  # Exports
        ├── webhook-handlers.ts       # Handler functions
        ├── webhook-utils.ts          # Utility functions
        ├── webhook-examples.ts       # Code examples
        ├── README.md                 # Documentation
        ├── TESTING.md                # Testing guide
        └── ARCHITECTURE.md           # This file

supabase/
└── migrations/
    └── 014_stripe_webhooks.sql      # Database schema
```

## Component Responsibilities

### Route Handler (`route.ts`)
**Responsibilities:**
- Accept incoming webhook requests
- Verify Stripe signatures
- Validate payload size
- Check idempotency
- Route events to handlers
- Handle errors and retries
- Return appropriate HTTP responses

**Does NOT:**
- Process business logic
- Update database directly
- Send emails
- Transform data

### Handler Functions (`webhook-handlers.ts`)
**Responsibilities:**
- Extract event data and metadata
- Validate required fields
- Update database records
- Log processing steps
- Handle edge cases

**Does NOT:**
- Verify signatures (done by route)
- Log events to webhook_events (done by route)
- Handle HTTP responses (done by route)

### Utility Functions (`webhook-utils.ts`)
**Responsibilities:**
- Signature verification
- Data extraction and transformation
- Event logging
- Status mapping
- Type safety helpers

**Does NOT:**
- Update database (except logging)
- Handle business logic
- Make external API calls

## Security Layers

```
┌─────────────────────────────────────┐
│ Layer 1: HTTPS                      │
│ All webhook traffic encrypted       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ Layer 2: Signature Verification     │
│ Stripe-Signature header validated   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ Layer 3: Payload Validation         │
│ Size and format checks              │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ Layer 4: Idempotency                │
│ Duplicate event detection           │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ Layer 5: Service Role Client        │
│ Secure database access              │
└─────────────────────────────────────┘
```

## Error Handling Flow

```
Error occurs in handler
    ↓
    ├─ Missing metadata?
    │   ↓
    │   Log warning
    │   Skip processing
    │   Return 200 (event ignored)
    │
    ├─ Database error?
    │   ↓
    │   Log error to webhook_events
    │   Log to console
    │   Return 500 (Stripe retries)
    │
    └─ Signature verification failed?
        ↓
        Log error
        Return 400 (don't retry)
```

## Idempotency Implementation

```
Event arrives
    ↓
Check webhook_events table
    ↓
    ├─ Event ID exists?
    │   ↓
    │   Return 200 "already_processed"
    │
    └─ Event ID new?
        ↓
        Insert to webhook_events (status='received')
        ↓
        Process event
        ↓
        Update webhook_events (status='processed')
        ↓
        Return 200 "processed"
```

## Database Schema

### webhook_events Table

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,      -- Stripe event ID
  event_type TEXT NOT NULL,            -- e.g., 'payment_intent.succeeded'
  event_data JSONB NOT NULL,           -- Full event object
  status webhook_event_status,         -- received/processing/processed/failed
  error_message TEXT,                  -- Error details if failed
  connect_account_id TEXT,             -- If Connect event
  received_at TIMESTAMPTZ NOT NULL,    -- When Stripe created event
  processed_at TIMESTAMPTZ,            -- When we finished processing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `event_id` - Fast lookup for idempotency
- `event_type` - Filter by event type
- `status` - Find failed events
- `created_at DESC` - Recent events first
- `connect_account_id` - Connect events

## Performance Considerations

### Database Queries
- Use indexes for all lookups
- Single UPDATE per event (no multiple queries)
- Use `single()` for expected single-row results
- Avoid N+1 queries

### Webhook Processing
- Process events asynchronously where possible
- Return 200 quickly (under 5 seconds)
- Log extensively for debugging
- Use idempotency to handle retries

### Monitoring
```sql
-- Average processing time
SELECT
  event_type,
  AVG(EXTRACT(EPOCH FROM (processed_at - received_at))) as avg_seconds
FROM webhook_events
WHERE status = 'processed'
GROUP BY event_type;

-- Failed events
SELECT * FROM webhook_events
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;

-- Events by status
SELECT status, COUNT(*) as count
FROM webhook_events
GROUP BY status;
```

## Scalability

### Current Implementation
- Handles ~100 events/second
- Synchronous processing
- Single region deployment
- Supabase connection pooling

### Future Enhancements
- Queue-based processing (Bull, SQS)
- Background job workers
- Multi-region deployment
- Event streaming
- Caching layer

## Testing Strategy

### Unit Tests
```
webhook-utils.test.ts
  ✓ verifyWebhookSignature()
  ✓ getEventData()
  ✓ mapSubscriptionStatus()

webhook-handlers.test.ts
  ✓ handlePaymentIntentSucceeded()
  ✓ handleSubscriptionCreated()
```

### Integration Tests
```
webhook-integration.test.ts
  ✓ Full webhook flow
  ✓ Database updates
  ✓ Idempotency
  ✓ Error handling
```

### E2E Tests
```
Use Stripe CLI:
  stripe trigger payment_intent.succeeded
  stripe trigger customer.subscription.created
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migration applied
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Test events verified locally
- [ ] Production webhook secret configured
- [ ] Monitoring and alerting set up
- [ ] Error logging configured
- [ ] Backup and recovery tested

## Monitoring Dashboard

### Key Metrics
1. **Event Volume** - Events/hour by type
2. **Processing Time** - Average time per event type
3. **Success Rate** - Processed vs failed events
4. **Retry Rate** - Events requiring retry
5. **Error Types** - Common failure reasons

### Alerts
- Failed events > 5% in 1 hour
- Average processing time > 5 seconds
- No events received in 24 hours (if expected)
- Database connection errors
- Signature verification failures > 10/hour

## References

- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Service Role](https://supabase.com/docs/guides/auth/row-level-security)
