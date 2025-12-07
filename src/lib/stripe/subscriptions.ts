/**
 * Stripe Subscription Management Utilities
 *
 * Provides helper functions for managing SaaS subscriptions including:
 * - Creating checkout sessions
 * - Managing customer portal sessions
 * - Checking subscription status
 * - Canceling subscriptions
 * - Retrieving subscription plans
 *
 * @module lib/stripe/subscriptions
 */

// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/service';
import type { SubscriptionStatus } from '@/lib/stripe-types';

/**
 * Subscription status details
 */
export interface SubscriptionStatusDetails {
  status: SubscriptionStatus;
  isActive: boolean;
  currentPeriodEnd: Date | null;
  currentPeriodStart: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  planId: string | null;
  planName: string | null;
  amount: number | null;
  currency: string | null;
}

/**
 * Subscription plan details
 */
export interface Plan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxRooms?: number;
  maxStaff?: number;
  popular?: boolean;
}

/**
 * Create a Stripe Checkout session for subscription
 *
 * @param hotelId - Hotel ID
 * @param priceId - Stripe price ID
 * @param plan - Plan name/tier
 * @param customerId - Optional existing Stripe customer ID
 * @returns Checkout session URL
 *
 * @example
 * ```ts
 * const url = await createCheckoutSession('hotel_123', 'price_xxx', 'premium');
 * // Redirect user to this URL
 * window.location.href = url;
 * ```
 */
export async function createCheckoutSession(
  hotelId: string,
  priceId: string,
  plan: string,
  customerId?: string
): Promise<string> {
  try {
    const supabase = createServiceClient();

    // Get hotel details
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, name, stripe_customer_id')
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      throw new Error('Hotel not found');
    }

    // Use existing customer ID or the provided one
    const stripeCustomerId = customerId || hotel.stripe_customer_id;

    if (!stripeCustomerId) {
      throw new Error('Stripe customer ID not found');
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
      subscription_data: {
        metadata: {
          hotelId: hotel.id,
          hotelName: hotel.name,
          plan,
        },
        trial_period_days: 14, // 14-day free trial
      },
      metadata: {
        hotelId: hotel.id,
        hotelName: hotel.name,
        plan,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return session.url;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Create a Stripe Customer Portal session
 *
 * Allows customers to:
 * - Update payment methods
 * - Cancel subscriptions
 * - View invoices
 * - Update billing information
 *
 * @param hotelId - Hotel ID
 * @returns Customer portal URL
 *
 * @example
 * ```ts
 * const url = await createPortalSession('hotel_123');
 * window.location.href = url;
 * ```
 */
export async function createPortalSession(hotelId: string): Promise<string> {
  try {
    const supabase = createServiceClient();

    // Get hotel with customer ID
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('stripe_customer_id')
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      throw new Error('Hotel not found');
    }

    if (!hotel.stripe_customer_id) {
      throw new Error('No active subscription found');
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: hotel.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
    });

    return session.url;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to create portal session: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get subscription status for a hotel
 *
 * @param hotelId - Hotel ID
 * @returns Subscription status details
 *
 * @example
 * ```ts
 * const status = await getSubscriptionStatus('hotel_123');
 * console.log(`Status: ${status.status}, Active: ${status.isActive}`);
 * ```
 */
export async function getSubscriptionStatus(
  hotelId: string
): Promise<SubscriptionStatusDetails> {
  try {
    const supabase = createServiceClient();

    // Get hotel subscription data from database
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select(
        `
        subscription_status,
        subscription_started_at,
        subscription_ends_at,
        trial_ends_at,
        stripe_customer_id,
        is_active
      `
      )
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      throw new Error('Hotel not found');
    }

    // Default status if no subscription
    if (!hotel.stripe_customer_id) {
      return {
        status: 'canceled' as SubscriptionStatus,
        isActive: false,
        currentPeriodEnd: null,
        currentPeriodStart: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        planId: null,
        planName: null,
        amount: null,
        currency: null,
      };
    }

    // Fetch subscription details from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: hotel.stripe_customer_id,
      status: 'all',
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
      return {
        status: 'canceled' as SubscriptionStatus,
        isActive: false,
        currentPeriodEnd: null,
        currentPeriodStart: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        planId: null,
        planName: null,
        amount: null,
        currency: null,
      };
    }

    const price = subscription.items.data[0]?.price;

    return {
      status: subscription.status as SubscriptionStatus,
      isActive: subscription.status === 'active' || subscription.status === 'trialing',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      planId: price?.id || null,
      planName: price?.nickname || null,
      amount: price?.unit_amount || null,
      currency: price?.currency || null,
    };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to get subscription status: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Cancel a subscription at the end of the billing period
 *
 * @param hotelId - Hotel ID
 * @returns void
 *
 * @example
 * ```ts
 * await cancelSubscription('hotel_123');
 * console.log('Subscription will cancel at period end');
 * ```
 */
export async function cancelSubscription(hotelId: string): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Get hotel with customer ID
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('stripe_customer_id')
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      throw new Error('Hotel not found');
    }

    if (!hotel.stripe_customer_id) {
      throw new Error('No active subscription found');
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: hotel.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
      throw new Error('No active subscription to cancel');
    }

    // Cancel at period end (don't cancel immediately)
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Update hotel status in database
    await supabase
      .from('hotels')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', hotelId);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Resume a subscription that was set to cancel at period end
 *
 * @param hotelId - Hotel ID
 * @returns void
 *
 * @example
 * ```ts
 * await resumeSubscription('hotel_123');
 * console.log('Subscription will continue');
 * ```
 */
export async function resumeSubscription(hotelId: string): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Get hotel with customer ID
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('stripe_customer_id')
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      throw new Error('Hotel not found');
    }

    if (!hotel.stripe_customer_id) {
      throw new Error('No subscription found');
    }

    // Get subscriptions set to cancel
    const subscriptions = await stripe.subscriptions.list({
      customer: hotel.stripe_customer_id,
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
      throw new Error('No subscription to resume');
    }

    if (!subscription.cancel_at_period_end) {
      throw new Error('Subscription is not set to cancel');
    }

    // Resume subscription
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });

    // Update hotel status in database
    await supabase
      .from('hotels')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', hotelId);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to resume subscription: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get available subscription plans
 *
 * @returns Array of subscription plans
 *
 * @example
 * ```ts
 * const plans = await getSubscriptionPlans();
 * plans.forEach(plan => {
 *   console.log(`${plan.name}: ${plan.amount / 100} ${plan.currency}`);
 * });
 * ```
 */
export async function getSubscriptionPlans(): Promise<Plan[]> {
  try {
    // Fetch all active prices for subscription products
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      expand: ['data.product'],
    });

    const plans: Plan[] = prices.data
      .filter((price) => {
        const product = price.product as Stripe.Product;
        return product.active && price.unit_amount;
      })
      .map((price) => {
        const product = price.product as Stripe.Product;
        const metadata = product.metadata || {};

        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          priceId: price.id,
          amount: price.unit_amount || 0,
          currency: price.currency,
          interval: (price.recurring?.interval as 'month' | 'year') || 'month',
          features: metadata.features ? JSON.parse(metadata.features) : [],
          maxRooms: metadata.maxRooms ? parseInt(metadata.maxRooms, 10) : undefined,
          maxStaff: metadata.maxStaff ? parseInt(metadata.maxStaff, 10) : undefined,
          popular: metadata.popular === 'true',
        };
      })
      .sort((a, b) => a.amount - b.amount);

    return plans;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to get subscription plans: ${error.message}`);
    }
    throw error;
  }
}
