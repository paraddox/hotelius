/**
 * Stripe Integration Examples
 *
 * This file contains practical examples of using the Stripe utilities
 * in the Hotelius hotel reservation SaaS application.
 *
 * These are reference examples - not meant to be imported directly.
 *
 * @module lib/stripe-examples
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { NextRequest, NextResponse } from 'next/server';
import {
  stripe,
  createConnectAccount,
  createAccountLink,
  createSubscription,
  createPaymentIntent,
  getCustomer,
} from './stripe';
import {
  getStripe,
  getStripeForConnectedAccount,
  formatAmountForStripe,
  formatAmountFromStripe,
  isStripeLoaded,
} from './stripe-client';
import {
  processWebhook,
  createSubscriptionHandler,
  createPaymentIntentHandler,
  createAccountHandler,
  getMetadataFromEvent,
} from './stripe-webhooks';
import type {
  HotelSubscriptionMetadata,
  HotelConnectAccountMetadata,
  ReservationPaymentMetadata,
  PlatformFeeConfig,
  ReservationPriceCalculation,
} from './stripe-types';

// ============================================================================
// EXAMPLE 1: Hotel Onboarding to Stripe Connect
// ============================================================================

/**
 * API Route: POST /api/hotels/[hotelId]/connect/create
 *
 * Creates a Stripe Connect account for a hotel and returns the onboarding link
 */
export async function createHotelConnectAccount(request: NextRequest) {
  try {
    const { hotelId, email, country, hotelName, ownerId } = await request.json();

    // Step 1: Create the Connect account
    const account = await createConnectAccount({
      email,
      country,
      metadata: {
        hotelId,
        hotelName,
        ownerId,
      } as HotelConnectAccountMetadata,
    });

    // Step 2: Save the account ID to your database
    // await db.hotels.update(hotelId, { stripeAccountId: account.id });

    // Step 3: Create the onboarding link
    const accountLink = await createAccountLink({
      accountId: account.id,
      refreshUrl: `${process.env.NEXT_PUBLIC_APP_URL}/hotels/${hotelId}/connect/refresh`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/hotels/${hotelId}/connect/complete`,
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    return NextResponse.json(
      { error: 'Failed to create Connect account' },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXAMPLE 2: Hotel SaaS Subscription Management
// ============================================================================

/**
 * API Route: POST /api/subscriptions/create
 *
 * Creates a subscription for a hotel when they upgrade their plan
 */
export async function createHotelSubscription(request: NextRequest) {
  try {
    const { hotelId, plan, paymentMethodId } = await request.json();

    // Step 1: Get or create Stripe customer
    // const hotel = await db.hotels.findById(hotelId);
    const customerId = 'cus_existing'; // hotel.stripeCustomerId

    // If no customer exists, create one
    // if (!customerId) {
    //   const customer = await stripe.customers.create({
    //     email: hotel.email,
    //     name: hotel.name,
    //     payment_method: paymentMethodId,
    //     invoice_settings: {
    //       default_payment_method: paymentMethodId,
    //     },
    //   });
    //   customerId = customer.id;
    //   await db.hotels.update(hotelId, { stripeCustomerId: customer.id });
    // }

    // Step 2: Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Step 3: Map plan to price ID
    const planPriceMap = {
      basic: process.env.STRIPE_PRICE_BASIC,
      premium: process.env.STRIPE_PRICE_PREMIUM,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
    };

    const priceId = planPriceMap[plan as keyof typeof planPriceMap];

    if (!priceId) {
      throw new Error('Invalid plan selected');
    }

    // Step 4: Create the subscription
    const subscription = await createSubscription({
      customerId,
      priceId,
      metadata: {
        hotelId,
        hotelName: 'Example Hotel',
        plan,
        maxRooms: plan === 'premium' ? '100' : '50',
        maxStaff: plan === 'premium' ? '20' : '10',
      } as HotelSubscriptionMetadata,
    });

    // Step 5: Save subscription to database
    // await db.subscriptions.create({
    //   hotelId,
    //   stripeSubscriptionId: subscription.id,
    //   status: subscription.status,
    //   currentPeriodEnd: subscription.current_period_end,
    //   plan,
    // });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXAMPLE 3: Guest Reservation Payment (with Connect)
// ============================================================================

/**
 * Calculate platform fee for a reservation
 */
function calculatePlatformFee(
  subtotal: number,
  config: PlatformFeeConfig
): number {
  let fee = Math.round((subtotal * config.percentage) / 100);

  if (config.fixedAmount) {
    fee += config.fixedAmount;
  }

  if (config.minimumFee && fee < config.minimumFee) {
    fee = config.minimumFee;
  }

  if (config.maximumFee && fee > config.maximumFee) {
    fee = config.maximumFee;
  }

  return fee;
}

/**
 * API Route: POST /api/reservations/create-payment
 *
 * Creates a payment intent for a guest reservation
 * The hotel receives the payment minus the platform fee
 */
export async function createReservationPayment(request: NextRequest) {
  try {
    const {
      reservationId,
      hotelId,
      guestId,
      amount, // Amount in dollars (e.g., 299.99)
      checkIn,
      checkOut,
      roomCount,
    } = await request.json();

    // Step 1: Get hotel's Stripe Connect account
    // const hotel = await db.hotels.findById(hotelId);
    const hotelStripeAccount = 'acct_example'; // hotel.stripeAccountId

    if (!hotelStripeAccount) {
      throw new Error('Hotel has not completed Stripe onboarding');
    }

    // Step 2: Convert amount to cents
    const amountInCents = formatAmountForStripe(amount);

    // Step 3: Calculate platform fee (10% + $2 fixed)
    const feeConfig: PlatformFeeConfig = {
      percentage: 10,
      fixedAmount: 200, // $2.00 in cents
      minimumFee: 300, // Minimum $3.00
      maximumFee: 5000, // Maximum $50.00
    };

    const platformFee = calculatePlatformFee(amountInCents, feeConfig);

    // Step 4: Create payment calculation
    const priceCalculation: ReservationPriceCalculation = {
      subtotal: amountInCents - platformFee,
      platformFee,
      total: amountInCents,
      currency: 'usd',
    };

    // Step 5: Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: amountInCents,
      currency: 'usd',
      connectedAccountId: hotelStripeAccount,
      applicationFeeAmount: platformFee,
      metadata: {
        reservationId,
        hotelId,
        guestId,
        checkIn,
        checkOut,
        roomCount: String(roomCount),
      } as ReservationPaymentMetadata,
    });

    // Step 6: Save payment intent to database
    // await db.reservations.update(reservationId, {
    //   paymentIntentId: paymentIntent.id,
    //   paymentStatus: 'pending',
    //   amount: amountInCents,
    //   platformFee,
    // });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      priceCalculation,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXAMPLE 4: Client-Side Payment Form (React Component)
// ============================================================================

/**
 * Example React component for collecting payment
 * File: components/reservation-payment-form.tsx
 */
export function ReservationPaymentFormExample() {
  // This is pseudo-code to show the structure
  const exampleCode = `
'use client';

import { useState, useEffect } from 'react';
import { getStripe, isStripeLoaded } from '@/lib/stripe-client';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

function CheckoutForm({ reservationId }: { reservationId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: \`\${window.location.origin}/reservations/\${reservationId}/success\`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export function ReservationPaymentForm({
  reservationId,
  amount
}: {
  reservationId: string;
  amount: number;
}) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent
    fetch('/api/reservations/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, amount }),
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, [reservationId, amount]);

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' }
      }}
    >
      <CheckoutForm reservationId={reservationId} />
    </Elements>
  );
}
  `;

  return exampleCode;
}

// ============================================================================
// EXAMPLE 5: Webhook Handler
// ============================================================================

/**
 * API Route: POST /api/webhooks/stripe
 *
 * Handles all Stripe webhook events
 */
export async function handleStripeWebhook(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    await processWebhook(body, signature, {
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
      handlers: {
        // Handle subscription events (SaaS billing)
        'customer.subscription.created': createSubscriptionHandler(async (event) => {
          const subscription = event.data.object;
          const metadata = subscription.metadata as HotelSubscriptionMetadata;

          console.log(`New subscription created for hotel ${metadata.hotelId}`);

          // Update database
          // await db.subscriptions.create({
          //   hotelId: metadata.hotelId,
          //   stripeSubscriptionId: subscription.id,
          //   status: subscription.status,
          //   plan: metadata.plan,
          //   currentPeriodEnd: subscription.current_period_end,
          // });
        }),

        'customer.subscription.updated': createSubscriptionHandler(async (event) => {
          const subscription = event.data.object;
          const metadata = subscription.metadata as HotelSubscriptionMetadata;

          console.log(`Subscription updated for hotel ${metadata.hotelId}`);

          // Update database
          // await db.subscriptions.update(
          //   { stripeSubscriptionId: subscription.id },
          //   { status: subscription.status }
          // );
        }),

        'customer.subscription.deleted': createSubscriptionHandler(async (event) => {
          const subscription = event.data.object;
          const metadata = subscription.metadata as HotelSubscriptionMetadata;

          console.log(`Subscription cancelled for hotel ${metadata.hotelId}`);

          // Update database and downgrade hotel
          // await db.subscriptions.update(
          //   { stripeSubscriptionId: subscription.id },
          //   { status: 'canceled', canceledAt: new Date() }
          // );
        }),

        // Handle payment events (guest reservations)
        'payment_intent.succeeded': createPaymentIntentHandler(async (event) => {
          const paymentIntent = event.data.object;
          const metadata = getMetadataFromEvent<ReservationPaymentMetadata>(event);

          console.log(`Payment succeeded for reservation ${metadata.reservationId}`);

          // Update reservation status
          // await db.reservations.update(metadata.reservationId, {
          //   paymentStatus: 'paid',
          //   paidAt: new Date(),
          // });

          // Send confirmation email to guest
          // await sendReservationConfirmationEmail(metadata.guestId, metadata.reservationId);
        }),

        'payment_intent.payment_failed': createPaymentIntentHandler(async (event) => {
          const paymentIntent = event.data.object;
          const metadata = getMetadataFromEvent<ReservationPaymentMetadata>(event);

          console.log(`Payment failed for reservation ${metadata.reservationId}`);

          // Update reservation status
          // await db.reservations.update(metadata.reservationId, {
          //   paymentStatus: 'failed',
          // });

          // Notify guest of payment failure
          // await sendPaymentFailedEmail(metadata.guestId);
        }),

        // Handle Connect account events
        'account.updated': createAccountHandler(async (event) => {
          const account = event.data.object;
          const metadata = account.metadata as HotelConnectAccountMetadata;

          console.log(`Connect account updated for hotel ${metadata.hotelId}`);

          // Update hotel's Connect status
          // await db.hotels.update(metadata.hotelId, {
          //   stripeChargesEnabled: account.charges_enabled,
          //   stripePayoutsEnabled: account.payouts_enabled,
          //   stripeDetailsSubmitted: account.details_submitted,
          // });
        }),

        // Handle invoice events (SaaS billing)
        'invoice.payment_failed': async (event) => {
          const invoice = event.data.object as any;
          const customerId = invoice.customer;

          console.log(`Invoice payment failed for customer ${customerId}`);

          // Find hotel by customer ID and notify them
          // const hotel = await db.hotels.findOne({ stripeCustomerId: customerId });
          // await sendPaymentFailedNotification(hotel.email);
        },

        // Handle refunds
        'charge.refunded': async (event) => {
          const charge = event.data.object as any;
          const paymentIntentId = charge.payment_intent;

          console.log(`Refund issued for payment intent ${paymentIntentId}`);

          // Update reservation status
          // const reservation = await db.reservations.findOne({ paymentIntentId });
          // await db.reservations.update(reservation.id, {
          //   paymentStatus: 'refunded',
          //   refundedAt: new Date(),
          // });
        },
      },
      onError: (error, event) => {
        console.error(`Error processing webhook ${event.type}:`, error);
        // Log to error tracking service (e.g., Sentry)
      },
      onUnhandledEvent: (event) => {
        console.log(`Unhandled webhook event: ${event.type}`);
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

// ============================================================================
// EXAMPLE 6: Retrieving Customer Portal Session (for subscription management)
// ============================================================================

/**
 * API Route: POST /api/subscriptions/portal
 *
 * Creates a billing portal session for hotels to manage their subscriptions
 */
export async function createBillingPortalSession(request: NextRequest) {
  try {
    const { customerId, hotelId } = await request.json();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/hotels/${hotelId}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
