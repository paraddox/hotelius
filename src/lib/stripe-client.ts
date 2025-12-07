/**
 * Client-side Stripe configuration
 *
 * This module provides the Stripe.js loader for client-side operations including:
 * - Payment form rendering
 * - Stripe Elements integration
 * - Client-side payment processing
 *
 * @module lib/stripe-client
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * Cached Stripe promise to ensure we only instantiate Stripe.js once
 * This improves performance by reusing the same instance across the application
 */
let stripePromise: Promise<Stripe | null>;

/**
 * Get the Stripe.js instance
 * Returns a memoized promise that resolves to the Stripe object
 *
 * @returns Promise that resolves to Stripe instance or null if loading fails
 *
 * @example
 * ```tsx
 * import { getStripe } from '@/lib/stripe-client';
 *
 * const MyComponent = () => {
 *   const handlePayment = async () => {
 *     const stripe = await getStripe();
 *     if (!stripe) {
 *       console.error('Stripe failed to load');
 *       return;
 *     }
 *     // Use stripe instance...
 *   };
 * };
 * ```
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

/**
 * Get the Stripe.js instance for a connected account
 * Use this when you need to create payment elements on behalf of a connected account
 *
 * @param connectedAccountId - The Stripe Connect account ID
 * @returns Promise that resolves to Stripe instance configured for the connected account
 *
 * @example
 * ```tsx
 * import { getStripeForConnectedAccount } from '@/lib/stripe-client';
 *
 * const HotelPaymentForm = ({ hotelStripeAccountId }) => {
 *   const stripe = await getStripeForConnectedAccount(hotelStripeAccountId);
 *   // Use stripe instance for this specific hotel...
 * };
 * ```
 */
export const getStripeForConnectedAccount = (
  connectedAccountId: string
): Promise<Stripe | null> => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
    return Promise.resolve(null);
  }
  return loadStripe(publishableKey, {
    stripeAccount: connectedAccountId,
  });
};

/**
 * Type guard to check if Stripe loaded successfully
 *
 * @param stripe - Stripe instance or null
 * @returns True if stripe is loaded, false otherwise
 *
 * @example
 * ```ts
 * const stripe = await getStripe();
 * if (isStripeLoaded(stripe)) {
 *   // TypeScript now knows stripe is not null
 *   stripe.confirmPayment({ ... });
 * }
 * ```
 */
export const isStripeLoaded = (stripe: Stripe | null): stripe is Stripe => {
  return stripe !== null;
};

/**
 * Helper function to format amount for Stripe
 * Converts a decimal amount to the smallest currency unit (e.g., dollars to cents)
 *
 * @param amount - Amount in decimal form (e.g., 99.99)
 * @param currency - Three-letter ISO currency code (default: 'usd')
 * @returns Amount in smallest currency unit
 *
 * @example
 * ```ts
 * formatAmountForStripe(99.99) // Returns 9999
 * formatAmountForStripe(100) // Returns 10000
 * ```
 */
export const formatAmountForStripe = (
  amount: number,
  currency: string = 'usd'
): number => {
  // Zero decimal currencies (e.g., JPY, KRW)
  const zeroDecimalCurrencies = [
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw',
    'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf',
    'xof', 'xpf'
  ];

  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
};

/**
 * Helper function to format amount from Stripe
 * Converts amount from smallest currency unit to decimal (e.g., cents to dollars)
 *
 * @param amount - Amount in smallest currency unit
 * @param currency - Three-letter ISO currency code (default: 'usd')
 * @returns Amount in decimal form
 *
 * @example
 * ```ts
 * formatAmountFromStripe(9999) // Returns 99.99
 * formatAmountFromStripe(10000) // Returns 100.00
 * ```
 */
export const formatAmountFromStripe = (
  amount: number,
  currency: string = 'usd'
): number => {
  // Zero decimal currencies (e.g., JPY, KRW)
  const zeroDecimalCurrencies = [
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw',
    'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf',
    'xof', 'xpf'
  ];

  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount;
  }

  return amount / 100;
};
