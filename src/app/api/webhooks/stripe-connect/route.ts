import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, constructWebhookEvent } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import type {
  AccountWebhookEvent,
  PaymentIntentWebhookEvent,
  HotelConnectAccountMetadata,
  ReservationPaymentMetadata,
} from '@/lib/stripe-types'

/**
 * Stripe Connect Webhook Handler
 * Handles Connect account and payment events for guest bookings
 *
 * Events handled:
 * - account.updated (onboarding status changes)
 * - payment_intent.succeeded (booking payment confirmed)
 * - payment_intent.payment_failed (booking payment failed)
 * - payout.paid (hotel payout completed)
 * - payout.failed (hotel payout failed)
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('[Connect Webhook] Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Connect Webhook] Missing STRIPE_CONNECT_WEBHOOK_SECRET')
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('[Connect Webhook] Signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.log(`[Connect Webhook] Received event: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event as AccountWebhookEvent)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event as PaymentIntentWebhookEvent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event as PaymentIntentWebhookEvent)
        break

      case 'payout.paid':
        await handlePayoutPaid(event)
        break

      case 'payout.failed':
        await handlePayoutFailed(event)
        break

      default:
        console.log(`[Connect Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`[Connect Webhook] Error processing event ${event.id}:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle account.updated event
 * Updates Connect account status when onboarding is completed or account details change
 */
async function handleAccountUpdated(event: AccountWebhookEvent) {
  const account = event.data.object
  const metadata = account.metadata as Partial<HotelConnectAccountMetadata>

  console.log(`[Connect Webhook] Account updated: ${account.id}`)

  if (!metadata.hotelId) {
    console.warn('[Connect Webhook] Account missing hotelId in metadata')
    return
  }

  const supabase = createServiceClient()

  // Check if onboarding is complete
  const onboardingComplete = account.details_submitted &&
                             account.charges_enabled &&
                             account.payouts_enabled

  // Update hotel's Connect account status
  const { error } = await supabase
    .from('hotels')
    .update({
      stripe_account_id: account.id,
      stripe_onboarding_complete: onboardingComplete,
      stripe_charges_enabled: account.charges_enabled,
      stripe_payouts_enabled: account.payouts_enabled,
      stripe_details_submitted: account.details_submitted,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.hotelId)

  if (error) {
    console.error('[Connect Webhook] Error updating hotel account status:', error)
    throw error
  }

  // Record account update in connect_accounts table
  await supabase.from('connect_accounts').upsert({
    hotel_id: metadata.hotelId,
    stripe_account_id: account.id,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
    requirements_currently_due: account.requirements?.currently_due || [],
    requirements_eventually_due: account.requirements?.eventually_due || [],
    requirements_past_due: account.requirements?.past_due || [],
    country: account.country || '',
    default_currency: account.default_currency || 'usd',
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'stripe_account_id',
  })

  if (onboardingComplete) {
    console.log(`[Connect Webhook] Onboarding completed for hotel ${metadata.hotelId}`)
    // TODO: Send email notification to hotel owner
  } else if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
    console.log(`[Connect Webhook] Account ${account.id} requires information: ${account.requirements.currently_due.join(', ')}`)
  }

  console.log(`[Connect Webhook] Account status updated for hotel ${metadata.hotelId}`)
}

/**
 * Handle payment_intent.succeeded event
 * Confirms booking when guest payment succeeds
 */
async function handlePaymentIntentSucceeded(event: PaymentIntentWebhookEvent) {
  const paymentIntent = event.data.object
  const metadata = paymentIntent.metadata as Partial<ReservationPaymentMetadata>

  console.log(`[Connect Webhook] Payment succeeded: ${paymentIntent.id}`)

  if (!metadata.reservationId) {
    console.warn('[Connect Webhook] Payment intent missing reservationId in metadata')
    return
  }

  const supabase = createServiceClient()

  // Check for idempotency
  const { data: existing } = await supabase
    .from('bookings')
    .select('payment_status')
    .eq('id', metadata.reservationId)
    .single()

  if (existing?.payment_status === 'paid') {
    console.log(`[Connect Webhook] Booking ${metadata.reservationId} already marked as paid, skipping`)
    return
  }

  // Update booking status
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.reservationId)

  if (error) {
    console.error('[Connect Webhook] Error updating booking:', error)
    throw error
  }

  // Record payment in payments table
  const amountReceived = paymentIntent.amount_received || paymentIntent.amount
  const applicationFee = paymentIntent.application_fee_amount || 0

  await supabase.from('payments').insert({
    booking_id: metadata.reservationId,
    stripe_payment_intent_id: paymentIntent.id,
    amount: amountReceived,
    currency: paymentIntent.currency,
    application_fee_amount: applicationFee,
    status: 'succeeded',
    payment_method: paymentIntent.payment_method as string,
    created_at: new Date().toISOString(),
  })

  // Get booking details for notification
  const { data: booking } = await supabase
    .from('bookings')
    .select('guest_id, hotel_id, check_in_date, check_out_date')
    .eq('id', metadata.reservationId)
    .single()

  if (booking) {
    // TODO: Send confirmation email to guest
    // TODO: Send notification email to hotel
    console.log(`[Connect Webhook] Booking ${metadata.reservationId} confirmed for hotel ${booking.hotel_id}`)
  }

  console.log(`[Connect Webhook] Payment processed successfully for booking ${metadata.reservationId}`)
}

/**
 * Handle payment_intent.payment_failed event
 * Updates booking status when payment fails
 */
async function handlePaymentIntentFailed(event: PaymentIntentWebhookEvent) {
  const paymentIntent = event.data.object
  const metadata = paymentIntent.metadata as Partial<ReservationPaymentMetadata>

  console.log(`[Connect Webhook] Payment failed: ${paymentIntent.id}`)

  if (!metadata.reservationId) {
    console.warn('[Connect Webhook] Payment intent missing reservationId in metadata')
    return
  }

  const supabase = createServiceClient()

  // Update booking status
  const { error } = await supabase
    .from('bookings')
    .update({
      payment_status: 'pending',
      payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', metadata.reservationId)

  if (error) {
    console.error('[Connect Webhook] Error updating booking:', error)
    throw error
  }

  // Record failed payment attempt
  await supabase.from('payments').insert({
    booking_id: metadata.reservationId,
    stripe_payment_intent_id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    application_fee_amount: paymentIntent.application_fee_amount || 0,
    status: 'failed',
    payment_method: paymentIntent.payment_method as string || null,
    failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
    created_at: new Date().toISOString(),
  })

  // Get booking details for notification
  const { data: booking } = await supabase
    .from('bookings')
    .select('guest_id, hotel_id')
    .eq('id', metadata.reservationId)
    .single()

  if (booking) {
    // TODO: Send email notification to guest about failed payment
    console.log(`[Connect Webhook] Payment failed for booking ${metadata.reservationId}`)
  }

  console.log(`[Connect Webhook] Failed payment recorded for booking ${metadata.reservationId}`)
}

/**
 * Handle payout.paid event
 * Records successful payout to hotel
 */
async function handlePayoutPaid(event: Stripe.Event) {
  const payout = event.data.object as Stripe.Payout

  console.log(`[Connect Webhook] Payout paid: ${payout.id}`)

  // Get the Connect account ID from the event account field
  const accountId = event.account as string

  if (!accountId) {
    console.warn('[Connect Webhook] Payout event missing account ID')
    return
  }

  const supabase = createServiceClient()

  // Find hotel by Connect account ID
  const { data: hotel } = await supabase
    .from('hotels')
    .select('id')
    .eq('stripe_account_id', accountId)
    .single()

  if (!hotel) {
    console.warn(`[Connect Webhook] No hotel found for account ${accountId}`)
    return
  }

  // Record payout
  const { error } = await supabase.from('payouts').insert({
    hotel_id: hotel.id,
    stripe_payout_id: payout.id,
    stripe_account_id: accountId,
    amount: payout.amount,
    currency: payout.currency,
    status: 'paid',
    arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
    description: payout.description || null,
    created_at: new Date(payout.created * 1000).toISOString(),
  })

  if (error && error.code !== '23505') {
    console.error('[Connect Webhook] Error recording payout:', error)
    throw error
  }

  console.log(`[Connect Webhook] Payout ${payout.id} recorded for hotel ${hotel.id}`)
}

/**
 * Handle payout.failed event
 * Records failed payout to hotel
 */
async function handlePayoutFailed(event: Stripe.Event) {
  const payout = event.data.object as Stripe.Payout

  console.log(`[Connect Webhook] Payout failed: ${payout.id}`)

  // Get the Connect account ID from the event account field
  const accountId = event.account as string

  if (!accountId) {
    console.warn('[Connect Webhook] Payout event missing account ID')
    return
  }

  const supabase = createServiceClient()

  // Find hotel by Connect account ID
  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, owner_id')
    .eq('stripe_account_id', accountId)
    .single()

  if (!hotel) {
    console.warn(`[Connect Webhook] No hotel found for account ${accountId}`)
    return
  }

  // Record failed payout
  const { error } = await supabase.from('payouts').insert({
    hotel_id: hotel.id,
    stripe_payout_id: payout.id,
    stripe_account_id: accountId,
    amount: payout.amount,
    currency: payout.currency,
    status: 'failed',
    failure_reason: payout.failure_message || 'Payout failed',
    arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
    description: payout.description || null,
    created_at: new Date(payout.created * 1000).toISOString(),
  })

  if (error && error.code !== '23505') {
    console.error('[Connect Webhook] Error recording failed payout:', error)
    throw error
  }

  // TODO: Send notification email to hotel owner
  console.log(`[Connect Webhook] Failed payout ${payout.id} recorded for hotel ${hotel.id}`)
}
