/**
 * Server-side Stripe configuration
 *
 * This module provides the Stripe instance for server-side operations including:
 * - SaaS billing (managing hotel subscriptions)
 * - Stripe Connect (facilitating payments to hotels from guests)
 *
 * @module lib/stripe
 */

import Stripe from 'stripe';

/**
 * Lazy-initialized Stripe instance to avoid build-time errors
 * when STRIPE_SECRET_KEY is not yet available
 */
let stripeInstance: Stripe | null = null;

/**
 * Get the Stripe instance, initializing it if needed
 * Throws an error if STRIPE_SECRET_KEY is not defined at runtime
 */
function getStripe(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      'STRIPE_SECRET_KEY is not defined. Please add it to your environment variables.'
    );
  }

  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
    appInfo: {
      name: 'Hotelius',
      version: '0.1.0',
    },
  });

  return stripeInstance;
}

/**
 * Server-side Stripe instance (lazy-initialized)
 * Configured with the latest API version and TypeScript support
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

/**
 * Helper function to create a Stripe Connect account for a hotel
 *
 * @param email - Hotel owner's email
 * @param country - Country code (e.g., 'US', 'GB')
 * @param metadata - Additional metadata to store with the account
 * @returns Stripe Connect account object
 *
 * @example
 * ```ts
 * const account = await createConnectAccount({
 *   email: 'hotel@example.com',
 *   country: 'US',
 *   metadata: { hotelId: '123' }
 * });
 * ```
 */
export async function createConnectAccount({
  email,
  country,
  metadata,
}: {
  email: string;
  country: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Account> {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'company',
      metadata,
    });

    return account;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to create Connect account: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Helper function to create an account link for Stripe Connect onboarding
 *
 * @param accountId - Stripe Connect account ID
 * @param refreshUrl - URL to redirect if the link expires
 * @param returnUrl - URL to redirect after onboarding completion
 * @returns Account link object with URL for onboarding
 *
 * @example
 * ```ts
 * const link = await createAccountLink({
 *   accountId: 'acct_123',
 *   refreshUrl: 'https://example.com/onboarding/refresh',
 *   returnUrl: 'https://example.com/onboarding/complete'
 * });
 * ```
 */
export async function createAccountLink({
  accountId,
  refreshUrl,
  returnUrl,
}: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<Stripe.AccountLink> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to create account link: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Helper function to create a subscription for SaaS billing
 *
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID for the subscription plan
 * @param metadata - Additional metadata to store with the subscription
 * @returns Subscription object
 *
 * @example
 * ```ts
 * const subscription = await createSubscription({
 *   customerId: 'cus_123',
 *   priceId: 'price_123',
 *   metadata: { hotelId: '456', plan: 'premium' }
 * });
 * ```
 */
export async function createSubscription({
  customerId,
  priceId,
  metadata,
}: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });

    return subscription;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Helper function to create a payment intent with application fee (Connect)
 * This is used for charging guests while taking a platform fee
 *
 * @param amount - Amount in smallest currency unit (e.g., cents)
 * @param currency - Three-letter ISO currency code
 * @param connectedAccountId - Hotel's Stripe Connect account ID
 * @param applicationFeeAmount - Platform fee in smallest currency unit
 * @param metadata - Additional metadata
 * @returns Payment intent object
 *
 * @example
 * ```ts
 * const paymentIntent = await createPaymentIntent({
 *   amount: 10000, // $100.00
 *   currency: 'usd',
 *   connectedAccountId: 'acct_123',
 *   applicationFeeAmount: 1000, // $10.00 platform fee
 *   metadata: { reservationId: '789' }
 * });
 * ```
 */
export async function createPaymentIntent({
  amount,
  currency,
  connectedAccountId,
  applicationFeeAmount,
  metadata,
}: {
  amount: number;
  currency: string;
  connectedAccountId: string;
  applicationFeeAmount: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: connectedAccountId,
      },
      metadata,
    });

    return paymentIntent;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Helper function to retrieve a customer by ID
 *
 * @param customerId - Stripe customer ID
 * @returns Customer object or deleted customer
 */
export async function getCustomer(
  customerId: string
): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to retrieve customer: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Helper function to construct a webhook event
 * Use this to verify and parse webhook events from Stripe
 *
 * @param payload - Raw request body as string or buffer
 * @param signature - Stripe signature header
 * @param webhookSecret - Webhook signing secret
 * @returns Verified Stripe event
 *
 * @example
 * ```ts
 * const event = constructWebhookEvent(
 *   requestBody,
 *   req.headers['stripe-signature'],
 *   process.env.STRIPE_WEBHOOK_SECRET
 * );
 * ```
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
    throw error;
  }
}
