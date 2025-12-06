# Stripe Utilities Documentation

This directory contains the Stripe integration utilities for the Hotelius hotel reservation SaaS application.

## Files Overview

### 1. `stripe.ts` - Server-Side Stripe Instance

Server-side Stripe configuration and helper functions for:
- SaaS billing (managing hotel subscriptions)
- Stripe Connect (facilitating payments to hotels from guests)

**Key Features:**
- Singleton Stripe instance with TypeScript support
- Helper functions for common operations
- Comprehensive error handling
- Full JSDoc documentation

**Main Functions:**

#### `createConnectAccount()`
Creates a Stripe Connect Express account for a hotel.

```typescript
const account = await createConnectAccount({
  email: 'hotel@example.com',
  country: 'US',
  metadata: { hotelId: '123' }
});
```

#### `createAccountLink()`
Creates an onboarding link for Stripe Connect account setup.

```typescript
const link = await createAccountLink({
  accountId: 'acct_123',
  refreshUrl: 'https://example.com/onboarding/refresh',
  returnUrl: 'https://example.com/onboarding/complete'
});
```

#### `createSubscription()`
Creates a subscription for SaaS billing.

```typescript
const subscription = await createSubscription({
  customerId: 'cus_123',
  priceId: 'price_123',
  metadata: { hotelId: '456', plan: 'premium' }
});
```

#### `createPaymentIntent()`
Creates a payment intent with application fee for guest reservations.

```typescript
const paymentIntent = await createPaymentIntent({
  amount: 10000, // $100.00
  currency: 'usd',
  connectedAccountId: 'acct_123',
  applicationFeeAmount: 1000, // $10.00 platform fee
  metadata: { reservationId: '789' }
});
```

#### `getCustomer()`
Retrieves a Stripe customer by ID.

```typescript
const customer = await getCustomer('cus_123');
```

#### `constructWebhookEvent()`
Verifies and constructs webhook events from Stripe.

```typescript
const event = constructWebhookEvent(
  requestBody,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

### 2. `stripe-client.ts` - Client-Side Stripe Loader

Client-side Stripe.js loader for:
- Payment form rendering
- Stripe Elements integration
- Client-side payment processing

**Key Features:**
- Memoized Stripe.js loading
- Support for Stripe Connect accounts
- Currency formatting helpers
- Type-safe utilities

**Main Functions:**

#### `getStripe()`
Returns the memoized Stripe.js instance.

```typescript
const stripe = await getStripe();
if (!stripe) {
  console.error('Stripe failed to load');
  return;
}
```

#### `getStripeForConnectedAccount()`
Returns a Stripe.js instance configured for a specific connected account.

```typescript
const stripe = await getStripeForConnectedAccount('acct_123');
```

#### `isStripeLoaded()`
Type guard to check if Stripe loaded successfully.

```typescript
const stripe = await getStripe();
if (isStripeLoaded(stripe)) {
  // TypeScript knows stripe is not null
  stripe.confirmPayment({ ... });
}
```

#### `formatAmountForStripe()`
Converts decimal amount to smallest currency unit (cents).

```typescript
formatAmountForStripe(99.99) // Returns 9999
formatAmountForStripe(100) // Returns 10000
```

#### `formatAmountFromStripe()`
Converts amount from smallest currency unit to decimal.

```typescript
formatAmountFromStripe(9999) // Returns 99.99
formatAmountFromStripe(10000) // Returns 100.00
```

---

### 3. `stripe-types.ts` - TypeScript Type Definitions

Custom TypeScript types and type guards for Stripe integration.

**Key Types:**

- `SubscriptionPlan` - Enum for subscription tiers
- `SubscriptionStatus` - Extended subscription status types
- `HotelSubscriptionMetadata` - Metadata for hotel subscriptions
- `HotelConnectAccountMetadata` - Metadata for Connect accounts
- `ReservationPaymentMetadata` - Metadata for reservation payments
- `HandledWebhookEvent` - Union type of handled webhook events
- `ConnectOnboardingStatus` - Connect account onboarding state
- `PlatformFeeConfig` - Platform fee calculation configuration
- `ReservationPriceCalculation` - Price breakdown for reservations

**Type Guards:**

```typescript
import { isSubscriptionEvent, isPaymentIntentEvent } from '@/lib/stripe-types';

// In webhook handler
if (isSubscriptionEvent(event)) {
  // TypeScript knows this is a subscription event
  const subscription = event.data.object;
}
```

---

## Environment Variables

Required environment variables (already configured in `.env.example`):

```bash
# Server-side only
STRIPE_SECRET_KEY=sk_test_xxx

# Client-side (must have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Webhook secrets
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxx
```

---

## Usage Examples

### Server-Side API Route (SaaS Subscription)

```typescript
// app/api/subscriptions/create/route.ts
import { stripe, createSubscription } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { customerId, priceId, hotelId } = await request.json();

    const subscription = await createSubscription({
      customerId,
      priceId,
      metadata: { hotelId, plan: 'premium' }
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Server-Side API Route (Connect Onboarding)

```typescript
// app/api/connect/onboard/route.ts
import { createConnectAccount, createAccountLink } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, country, hotelId } = await request.json();

    // Create Connect account
    const account = await createConnectAccount({
      email,
      country,
      metadata: { hotelId }
    });

    // Create onboarding link
    const link = await createAccountLink({
      accountId: account.id,
      refreshUrl: `${process.env.NEXT_PUBLIC_APP_URL}/connect/refresh`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/connect/complete`
    });

    return NextResponse.json({ url: link.url });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Server-Side API Route (Reservation Payment)

```typescript
// app/api/payments/create-intent/route.ts
import { createPaymentIntent } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, hotelStripeAccount, reservationId } = await request.json();

    // Calculate platform fee (10%)
    const platformFee = Math.round(amount * 0.10);

    const paymentIntent = await createPaymentIntent({
      amount,
      currency: 'usd',
      connectedAccountId: hotelStripeAccount,
      applicationFeeAmount: platformFee,
      metadata: { reservationId }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Client-Side Payment Form

```typescript
// components/payment-form.tsx
'use client';

import { useState } from 'react';
import { getStripe, formatAmountForStripe } from '@/lib/stripe-client';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';

export function PaymentForm({ amount }: { amount: number }) {
  const [clientSecret, setClientSecret] = useState('');

  // Initialize payment intent
  useEffect(() => {
    fetch('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        amount: formatAmountForStripe(amount)
      })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, [amount]);

  if (!clientSecret) return <div>Loading...</div>;

  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <PaymentElement />
      {/* Submit button and form handling */}
    </Elements>
  );
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { constructWebhookEvent } from '@/lib/stripe';
import { isSubscriptionEvent, isPaymentIntentEvent } from '@/lib/stripe-types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle subscription events
    if (isSubscriptionEvent(event)) {
      const subscription = event.data.object;
      // Update database with subscription status
    }

    // Handle payment events
    if (isPaymentIntentEvent(event)) {
      const paymentIntent = event.data.object;
      // Update reservation status
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

---

## Best Practices

1. **Error Handling**: All helper functions wrap Stripe errors and provide meaningful error messages
2. **Type Safety**: Use the provided TypeScript types and type guards
3. **Metadata**: Always include relevant metadata in Stripe objects for easy reference
4. **Webhooks**: Always verify webhook signatures using `constructWebhookEvent()`
5. **Client-Side**: Use `getStripe()` to ensure Stripe.js is loaded only once
6. **Connect**: Use `getStripeForConnectedAccount()` when creating payment elements for specific hotels
7. **Currency**: Use the formatting helpers to convert between decimal and cents

---

## Testing

Use Stripe's test mode keys (starting with `sk_test_` and `pk_test_`) during development.

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

**Webhook Testing:**
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

---

## Additional Resources

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [Webhook Events](https://stripe.com/docs/webhooks)
