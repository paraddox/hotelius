# Stripe Webhooks - Quick Start Guide

Get your Stripe webhooks up and running in 5 minutes.

## Step 1: Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

## Step 2: Setup Environment Variables

Add to `.env.local`:
```bash
# From Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Will get this from Stripe CLI in next step
STRIPE_WEBHOOK_SECRET=whsec_...

# Your existing Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Step 3: Apply Database Migration

```bash
# Navigate to your project
cd /path/to/hotelius

# Apply the webhook events table migration
supabase migration up

# Or manually run the SQL file
# supabase/migrations/014_stripe_webhooks.sql
```

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Forward Webhooks Locally

Open a new terminal:
```bash
# Login to Stripe CLI
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret that appears (starts with `whsec_`) and add it to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 6: Test Your First Webhook

Open another terminal:
```bash
# Test payment intent success
stripe trigger payment_intent.succeeded
```

You should see:
1. **Stripe CLI terminal:** Event sent
2. **Dev server terminal:** Event received and processed
3. **Browser console (if you have webhook logging):** Event logged

## Step 7: Verify It Works

Check your webhook was processed:

**Option A: Check application logs**
```
[Stripe Webhook] Received: payment_intent.succeeded (evt_...)
[Stripe Webhook] Successfully processed payment_intent.succeeded (evt_...) in 45ms
```

**Option B: Query database**
```sql
SELECT event_type, status, created_at
FROM webhook_events
ORDER BY created_at DESC
LIMIT 5;
```

**Option C: Hit the info endpoint**
```bash
curl http://localhost:3000/api/webhooks/stripe
```

## Common Test Events

```bash
# Subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Payment events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed

# Invoice events
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# Checkout events
stripe trigger checkout.session.completed
```

## Troubleshooting

### "Webhook signature verification failed"
- Restart your dev server after adding `STRIPE_WEBHOOK_SECRET`
- Make sure you're using the secret from `stripe listen` command

### "Missing STRIPE_WEBHOOK_SECRET"
- Copy the secret from the `stripe listen` output
- Add it to `.env.local`
- Restart dev server

### "relation 'webhook_events' does not exist"
- Run the database migration: `supabase migration up`
- Or apply `014_stripe_webhooks.sql` manually

### No events received
- Make sure dev server is running
- Make sure `stripe listen` is running
- Check you're forwarding to correct port (3000)

## Next Steps

1. **Read the full documentation**: `src/lib/stripe/README.md`
2. **Review code examples**: `src/lib/stripe/webhook-examples.ts`
3. **Test all event types**: `src/lib/stripe/TESTING.md`
4. **Understand the architecture**: `src/lib/stripe/ARCHITECTURE.md`

## Production Deployment

When ready for production:

1. Deploy your application
2. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
3. Click "Add endpoint"
4. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
5. Select events (or "Select all events")
6. Copy the signing secret
7. Add to production environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_prod_...
   ```
8. Test with production events

## Quick Reference

### File Locations
- Main endpoint: `src/app/api/webhooks/stripe/route.ts`
- Handlers: `src/lib/stripe/webhook-handlers.ts`
- Utils: `src/lib/stripe/webhook-utils.ts`
- Migration: `supabase/migrations/014_stripe_webhooks.sql`

### Handled Events
✅ Subscriptions: created, updated, deleted
✅ Invoices: payment_succeeded, payment_failed
✅ Payments: payment_intent.succeeded, payment_intent.payment_failed
✅ Checkout: checkout.session.completed
✅ Accounts: account.updated

### Environment Variables
```bash
STRIPE_SECRET_KEY              # Required
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Required
STRIPE_WEBHOOK_SECRET          # Required
NEXT_PUBLIC_SUPABASE_URL       # Required
SUPABASE_SERVICE_ROLE_KEY      # Required
```

## Support

Having issues? Check:
- Stripe CLI logs for delivery status
- Application logs for processing errors
- Database `webhook_events` table for event history
- Full documentation in `README.md`

---

That's it! Your Stripe webhooks are now configured and ready to process events.
