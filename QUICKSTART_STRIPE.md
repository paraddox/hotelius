# Stripe Integration Quick Start Guide

This guide will help you get the Stripe integration up and running quickly.

## Prerequisites

- Stripe account (test mode)
- Supabase project
- Node.js 18+
- Next.js 14+

## Step 1: Install Dependencies

Dependencies are already installed in your package.json:
- `stripe` (v20.0.0)
- `@stripe/stripe-js` (v8.5.3)

## Step 2: Set Environment Variables

Copy your `.env.local.example` to `.env.local` and fill in:

```bash
# Get from Stripe Dashboard > Developers > API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Get from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Important for webhooks!

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** We'll get webhook secrets in Step 4.

## Step 3: Run Database Migration

Execute the SQL migration to create Stripe-related tables:

### Option A: Using Supabase CLI
```bash
cd supabase
supabase db push
```

### Option B: Manual SQL Execution
1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `supabase/migrations/001_add_stripe_tables.sql`
3. Run the SQL

This creates:
- `subscriptions` table
- `invoices` table
- `connect_accounts` table
- `payments` table
- `payouts` table
- Adds Stripe columns to `hotels` table

## Step 4: Configure Stripe Webhooks (Local Testing)

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
```

### Login to Stripe
```bash
stripe login
```

### Start Webhook Forwarding
```bash
# Terminal 1: Forward SaaS billing webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 2: Forward Connect webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe-connect
```

### Get Webhook Secrets
The Stripe CLI will output webhook signing secrets like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

Add these to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx          # From Terminal 1
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxxxx  # From Terminal 2
```

## Step 5: Create Products & Prices in Stripe

### Via Stripe Dashboard
1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click "Add product"
3. Create these plans:

**Basic Plan**
- Name: Basic
- Price: $29/month
- Billing: Recurring monthly
- Copy the Price ID (starts with `price_`)

**Premium Plan**
- Name: Premium
- Price: $99/month
- Billing: Recurring monthly
- Copy the Price ID

**Enterprise Plan**
- Name: Enterprise
- Price: $299/month
- Billing: Recurring monthly
- Copy the Price ID

### Via Stripe CLI (faster)
```bash
# Basic Plan
stripe products create --name="Basic" --description="Basic hotel management features"
stripe prices create --product=prod_xxxxx --unit-amount=2900 --currency=usd --recurring[interval]=month

# Premium Plan
stripe products create --name="Premium" --description="Premium hotel management features"
stripe prices create --product=prod_xxxxx --unit-amount=9900 --currency=usd --recurring[interval]=month

# Enterprise Plan
stripe products create --name="Enterprise" --description="Enterprise hotel management features"
stripe prices create --product=prod_xxxxx --unit-amount=29900 --currency=usd --recurring[interval]=month
```

## Step 6: Start Your App

```bash
npm run dev
```

Your app should now be running on `http://localhost:3000`

## Step 7: Test the Integration

### Test 1: Create a Subscription (SaaS Billing)

```bash
# Test subscription creation webhook
stripe trigger customer.subscription.created
```

Or use the API:
```javascript
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_xxxxx',  // Your Basic plan price ID
    hotelId: 'hotel-uuid',
    plan: 'basic'
  })
});

const { url } = await response.json();
window.location.href = url;  // Redirects to Stripe Checkout
```

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### Test 2: Connect Account Onboarding

```bash
# Create Connect account
curl -X POST http://localhost:3000/api/stripe/connect/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "hotel-uuid",
    "country": "US"
  }'

# Get onboarding link
curl -X POST http://localhost:3000/api/stripe/connect/account-link \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "hotel-uuid"
  }'
```

### Test 3: Booking Payment

```bash
# Create payment intent
curl -X POST http://localhost:3000/api/bookings/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-uuid"
  }'

# Trigger payment success webhook
stripe trigger payment_intent.succeeded
```

### Test 4: Webhooks

```bash
# Test subscription webhooks
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.paid
stripe trigger invoice.payment_failed

# Test Connect webhooks
stripe trigger account.updated
stripe trigger payment_intent.succeeded
stripe trigger payout.paid
```

## Step 8: Verify Webhook Processing

Check your terminal logs for webhook events:
```
[Stripe Webhook] Received: customer.subscription.created (evt_xxxxx)
[Webhook] Subscription created: sub_xxxxx
[Webhook] Subscription created successfully for hotel xxxxx
```

Check Supabase to verify data was created:
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5;
SELECT * FROM connect_accounts ORDER BY created_at DESC LIMIT 5;
```

## Common Issues & Solutions

### Issue: "Missing stripe-signature header"
**Solution:** Make sure Stripe CLI is forwarding webhooks to the correct endpoint.

### Issue: "Webhook signature verification failed"
**Solution:** Check that `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe CLI output.

### Issue: "SUPABASE_SERVICE_ROLE_KEY is not defined"
**Solution:** Add the service role key from Supabase Dashboard > Settings > API.

### Issue: Database query fails in webhook
**Solution:** Verify the migration ran successfully and tables exist.

### Issue: "No Connect account found"
**Solution:** Create a Connect account first using `/api/stripe/connect/create-account`.

## Production Deployment

### 1. Update Environment Variables
Replace test keys with live keys:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
```

### 2. Configure Production Webhooks
In Stripe Dashboard > Webhooks:

**Endpoint 1: SaaS Billing**
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.paid
  - invoice.payment_failed
- Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

**Endpoint 2: Connect**
- URL: `https://yourdomain.com/api/webhooks/stripe-connect`
- Events:
  - account.updated
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - payout.paid
  - payout.failed
- Copy webhook signing secret to `STRIPE_CONNECT_WEBHOOK_SECRET`

### 3. Enable Connect in Production
1. Complete Stripe Connect application
2. Activate your Connect account
3. Configure payout settings

### 4. Deploy
```bash
vercel --prod
# or
npm run build && npm start
```

## Monitoring

### Stripe Dashboard
- [Payments](https://dashboard.stripe.com/payments)
- [Subscriptions](https://dashboard.stripe.com/subscriptions)
- [Connect](https://dashboard.stripe.com/connect/accounts)
- [Webhooks](https://dashboard.stripe.com/webhooks)
- [Logs](https://dashboard.stripe.com/logs)

### Application Logs
Monitor webhook processing:
```bash
# Development
npm run dev

# Production (with logging service)
tail -f /var/log/app.log | grep "Webhook"
```

## Next Steps

1. **Build UI Components**
   - Subscription selection page
   - Connect onboarding flow
   - Payment form with Stripe Elements
   - Subscription management page

2. **Add Email Notifications**
   - Welcome email on subscription
   - Payment receipt emails
   - Failed payment alerts
   - Payout notifications

3. **Implement Analytics**
   - Revenue tracking
   - Subscription metrics
   - Payment success rates
   - Connect account status

4. **Security Hardening**
   - Rate limiting on API routes
   - Enhanced error logging
   - Fraud detection
   - PCI compliance review

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md) - Detailed integration guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Implementation details

## Support

For issues:
1. Check Stripe Dashboard logs
2. Review webhook delivery attempts
3. Test with Stripe CLI
4. Check [Stripe Status](https://status.stripe.com)
5. Contact [Stripe Support](https://support.stripe.com)

---

**You're all set! Start testing the integration and building your UI components.**
