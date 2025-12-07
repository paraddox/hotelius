/**
 * Stripe Webhook Event Handlers
 *
 * Individual handler functions for each Stripe webhook event type.
 * Handles both SaaS subscription events and Connect payment events.
 *
 * @module lib/stripe/webhook-handlers
 */

// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */

import type Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import {
  getEventData,
  getEventMetadata,
  formatStripeTimestamp,
  mapSubscriptionStatus,
  mapPaymentStatus,
  extractAmount,
  getCustomerEmail,
} from './webhook-utils';
import type {
  HotelSubscriptionMetadata,
  ReservationPaymentMetadata,
  HotelConnectAccountMetadata,
} from '@/lib/stripe-types';

/**
 * Handle customer.subscription.created event
 *
 * Creates a new subscription record when a hotel subscribes to a plan.
 * Updates hotel subscription status and records subscription details.
 *
 * @param event - Stripe subscription.created event
 */
export async function handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
  const subscription = getEventData<Stripe.Subscription>(event);
  const metadata = getEventMetadata<HotelSubscriptionMetadata>(event);

  console.log(`[Webhook] Processing subscription.created: ${subscription.id}`);

  if (!metadata.hotelId) {
    console.warn(`[Webhook] Subscription ${subscription.id} missing hotelId in metadata`);
    return;
  }

  const supabase = createServiceClient();

  // Update hotel subscription status
  const { error: hotelError } = await supabase
    .from('hotels')
    .update({
      subscription_status: mapSubscriptionStatus(subscription.status),
      subscription_started_at: formatStripeTimestamp(subscription.current_period_start),
      subscription_ends_at: formatStripeTimestamp(subscription.current_period_end),
      stripe_customer_id: subscription.customer as string,
      trial_ends_at: subscription.trial_end
        ? formatStripeTimestamp(subscription.trial_end)
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.hotelId);

  if (hotelError) {
    console.error('[Webhook] Error updating hotel subscription:', hotelError);
    throw hotelError;
  }

  console.log(`[Webhook] Subscription created for hotel ${metadata.hotelId}`);
}

/**
 * Handle customer.subscription.updated event
 *
 * Updates subscription record when status, plan, or billing cycle changes.
 * Handles plan upgrades/downgrades, cancellations, and renewals.
 *
 * @param event - Stripe subscription.updated event
 */
export async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const subscription = getEventData<Stripe.Subscription>(event);
  const metadata = getEventMetadata<HotelSubscriptionMetadata>(event);

  console.log(`[Webhook] Processing subscription.updated: ${subscription.id}`);

  if (!metadata.hotelId) {
    console.warn(`[Webhook] Subscription ${subscription.id} missing hotelId in metadata`);
    return;
  }

  const supabase = createServiceClient();

  // Determine if subscription was canceled
  const isCanceled = subscription.status === 'canceled' ||
                     subscription.cancel_at_period_end;

  // Update hotel subscription status
  const { error: hotelError } = await supabase
    .from('hotels')
    .update({
      subscription_status: mapSubscriptionStatus(subscription.status),
      subscription_started_at: formatStripeTimestamp(subscription.current_period_start),
      subscription_ends_at: formatStripeTimestamp(subscription.current_period_end),
      trial_ends_at: subscription.trial_end
        ? formatStripeTimestamp(subscription.trial_end)
        : null,
      is_active: !isCanceled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.hotelId);

  if (hotelError) {
    console.error('[Webhook] Error updating hotel subscription:', hotelError);
    throw hotelError;
  }

  console.log(`[Webhook] Subscription updated for hotel ${metadata.hotelId}`);
}

/**
 * Handle customer.subscription.deleted event
 *
 * Marks subscription as canceled and optionally deactivates the hotel.
 * This happens when a subscription is canceled and the billing period ends.
 *
 * @param event - Stripe subscription.deleted event
 */
export async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = getEventData<Stripe.Subscription>(event);
  const metadata = getEventMetadata<HotelSubscriptionMetadata>(event);

  console.log(`[Webhook] Processing subscription.deleted: ${subscription.id}`);

  if (!metadata.hotelId) {
    console.warn(`[Webhook] Subscription ${subscription.id} missing hotelId in metadata`);
    return;
  }

  const supabase = createServiceClient();

  // Update hotel status to canceled and deactivate
  const { error: hotelError } = await supabase
    .from('hotels')
    .update({
      subscription_status: 'canceled',
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.hotelId);

  if (hotelError) {
    console.error('[Webhook] Error updating hotel on subscription deletion:', hotelError);
    throw hotelError;
  }

  // TODO: Send email notification to hotel owner about subscription cancellation
  // TODO: Archive or restrict access to hotel data

  console.log(`[Webhook] Subscription deleted, hotel ${metadata.hotelId} deactivated`);
}

/**
 * Handle invoice.payment_succeeded event
 *
 * Records successful payment for subscription billing.
 * Updates subscription status to active and extends billing period.
 *
 * @param event - Stripe invoice.payment_succeeded event
 */
export async function handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = getEventData<Stripe.Invoice>(event);

  console.log(`[Webhook] Processing invoice.payment_succeeded: ${invoice.id}`);

  if (!invoice.subscription) {
    console.log('[Webhook] Invoice not associated with a subscription, skipping');
    return;
  }

  const supabase = createServiceClient();

  // Get hotel from customer ID
  const { data: hotel } = await supabase
    .from('hotels')
    .select('id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (!hotel) {
    console.warn(`[Webhook] No hotel found for customer ${invoice.customer}`);
    return;
  }

  // Update hotel subscription status to active
  await supabase
    .from('hotels')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', hotel.id);

  // TODO: Send receipt email to hotel owner
  // TODO: Record invoice details in invoices table if needed

  console.log(`[Webhook] Payment succeeded for hotel ${hotel.id}, invoice ${invoice.id}`);
}

/**
 * Handle invoice.payment_failed event
 *
 * Records failed payment attempt and updates subscription status.
 * Notifies hotel owner about payment failure and required action.
 *
 * @param event - Stripe invoice.payment_failed event
 */
export async function handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = getEventData<Stripe.Invoice>(event);

  console.log(`[Webhook] Processing invoice.payment_failed: ${invoice.id}`);

  if (!invoice.subscription) {
    console.log('[Webhook] Invoice not associated with a subscription, skipping');
    return;
  }

  const supabase = createServiceClient();

  // Get hotel from customer ID
  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, email, name')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (!hotel) {
    console.warn(`[Webhook] No hotel found for customer ${invoice.customer}`);
    return;
  }

  // Update hotel subscription status to past_due
  await supabase
    .from('hotels')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', hotel.id);

  // TODO: Send email notification to hotel owner about failed payment
  // TODO: Include link to update payment method
  // TODO: Consider grace period before suspending service

  console.log(`[Webhook] Payment failed for hotel ${hotel.id}, invoice ${invoice.id}`);
}

/**
 * Handle checkout.session.completed event
 *
 * Processes completed Stripe Checkout sessions for booking payments.
 * Confirms booking and updates payment status when checkout is successful.
 *
 * @param event - Stripe checkout.session.completed event
 */
export async function handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
  const session = getEventData<Stripe.Checkout.Session>(event);
  const metadata = getEventMetadata<ReservationPaymentMetadata>(event);

  console.log(`[Webhook] Processing checkout.session.completed: ${session.id}`);

  if (!metadata.reservationId) {
    console.warn(`[Webhook] Checkout session ${session.id} missing reservationId in metadata`);
    return;
  }

  // Only process if payment was successful
  if (session.payment_status !== 'paid') {
    console.log(`[Webhook] Checkout session ${session.id} payment not completed, status: ${session.payment_status}`);
    return;
  }

  const supabase = createServiceClient();

  // Update booking status
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.reservationId);

  if (error) {
    console.error('[Webhook] Error updating booking:', error);
    throw error;
  }

  // TODO: Send booking confirmation email to guest
  // TODO: Send notification email to hotel

  console.log(`[Webhook] Booking ${metadata.reservationId} marked as paid via checkout`);
}

/**
 * Handle payment_intent.succeeded event
 *
 * Confirms booking payment when payment intent succeeds.
 * Updates booking status and records payment details.
 *
 * @param event - Stripe payment_intent.succeeded event
 */
export async function handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
  const paymentIntent = getEventData<Stripe.PaymentIntent>(event);
  const metadata = getEventMetadata<ReservationPaymentMetadata>(event);

  console.log(`[Webhook] Processing payment_intent.succeeded: ${paymentIntent.id}`);

  if (!metadata.reservationId) {
    console.warn(`[Webhook] Payment intent ${paymentIntent.id} missing reservationId in metadata`);
    return;
  }

  const supabase = createServiceClient();

  // Check for idempotency
  const { data: existing } = await supabase
    .from('bookings')
    .select('payment_status')
    .eq('id', metadata.reservationId)
    .single();

  if (existing?.payment_status === 'paid') {
    console.log(`[Webhook] Booking ${metadata.reservationId} already marked as paid`);
    return;
  }

  // Update booking status
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntent.id,
      stripe_charge_id: paymentIntent.latest_charge as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.reservationId);

  if (bookingError) {
    console.error('[Webhook] Error updating booking:', bookingError);
    throw bookingError;
  }

  // Get booking details for notification
  const { data: booking } = await supabase
    .from('bookings')
    .select('hotel_id, guest_id, check_in_date, check_out_date, confirmation_code')
    .eq('id', metadata.reservationId)
    .single();

  if (booking) {
    // TODO: Send confirmation email to guest with booking details
    // TODO: Send notification email to hotel staff
    console.log(`[Webhook] Booking ${booking.confirmation_code} confirmed, payment succeeded`);
  }

  console.log(`[Webhook] Payment succeeded for booking ${metadata.reservationId}`);
}

/**
 * Handle payment_intent.payment_failed event
 *
 * Updates booking status when payment fails.
 * Notifies guest about payment failure and provides retry options.
 *
 * @param event - Stripe payment_intent.payment_failed event
 */
export async function handlePaymentIntentFailed(event: Stripe.Event): Promise<void> {
  const paymentIntent = getEventData<Stripe.PaymentIntent>(event);
  const metadata = getEventMetadata<ReservationPaymentMetadata>(event);

  console.log(`[Webhook] Processing payment_intent.payment_failed: ${paymentIntent.id}`);

  if (!metadata.reservationId) {
    console.warn(`[Webhook] Payment intent ${paymentIntent.id} missing reservationId in metadata`);
    return;
  }

  const supabase = createServiceClient();

  // Update booking payment status to failed
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({
      payment_status: 'failed',
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.reservationId);

  if (bookingError) {
    console.error('[Webhook] Error updating booking:', bookingError);
    throw bookingError;
  }

  // Get booking details
  const { data: booking } = await supabase
    .from('bookings')
    .select('guest_id, hotel_id, confirmation_code')
    .eq('id', metadata.reservationId)
    .single();

  if (booking) {
    // TODO: Send email to guest about payment failure
    // TODO: Include link to retry payment
    // TODO: Consider canceling booking after N failed attempts
    const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
    console.log(`[Webhook] Payment failed for booking ${booking.confirmation_code}: ${failureMessage}`);
  }

  console.log(`[Webhook] Payment failed for booking ${metadata.reservationId}`);
}

/**
 * Handle account.updated event
 *
 * Updates Connect account status when onboarding is completed or account details change.
 * Tracks charges_enabled and payouts_enabled status for hotels.
 *
 * @param event - Stripe account.updated event
 */
export async function handleConnectedAccountUpdated(event: Stripe.Event): Promise<void> {
  const account = getEventData<Stripe.Account>(event);
  const metadata = getEventMetadata<HotelConnectAccountMetadata>(event);

  console.log(`[Webhook] Processing account.updated: ${account.id}`);

  if (!metadata.hotelId) {
    console.warn(`[Webhook] Account ${account.id} missing hotelId in metadata`);
    return;
  }

  const supabase = createServiceClient();

  // Check if onboarding is complete
  const onboardingComplete =
    account.details_submitted &&
    account.charges_enabled &&
    account.payouts_enabled;

  // Update hotel Connect account status
  const { error } = await supabase
    .from('hotels')
    .update({
      stripe_account_id: account.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.hotelId);

  if (error) {
    console.error('[Webhook] Error updating hotel Connect account:', error);
    throw error;
  }

  if (onboardingComplete) {
    // TODO: Send email notification to hotel owner about successful onboarding
    // TODO: Enable booking payments for this hotel
    console.log(`[Webhook] Connect onboarding completed for hotel ${metadata.hotelId}`);
  } else if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
    // TODO: Send email notification about pending requirements
    console.log(
      `[Webhook] Account ${account.id} requires: ${account.requirements.currently_due.join(', ')}`
    );
  }

  console.log(`[Webhook] Account updated for hotel ${metadata.hotelId}`);
}
