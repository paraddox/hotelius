/**
 * Stripe Webhook Endpoint
 *
 * Main webhook handler for Stripe events including:
 * - SaaS subscription lifecycle (billing for hotel management platform)
 * - Connect account events (hotel onboarding)
 * - Payment events (guest booking payments)
 *
 * This endpoint handles ALL Stripe webhooks - both platform and Connect events.
 * Configure this URL in your Stripe Dashboard webhook settings.
 *
 * @route POST /api/webhooks/stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type Stripe from 'stripe';
import {
  verifyWebhookSignature,
  logWebhookEvent,
  isEventProcessed,
  validateWebhookPayloadSize,
  isConnectEvent,
} from '@/lib/stripe/webhook-utils';
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleCheckoutSessionCompleted,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleConnectedAccountUpdated,
} from '@/lib/stripe/webhook-handlers';

/**
 * Webhook event handler configuration
 * Maps event types to their handler functions
 */
const EVENT_HANDLERS: Record<string, (event: Stripe.Event) => Promise<void>> = {
  // SaaS Subscription Events (Platform Billing)
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'invoice.payment_succeeded': handleInvoicePaymentSucceeded,
  'invoice.payment_failed': handleInvoicePaymentFailed,

  // Checkout Events (Guest Booking Payments)
  'checkout.session.completed': handleCheckoutSessionCompleted,

  // Payment Intent Events (Guest Booking Payments)
  'payment_intent.succeeded': handlePaymentIntentSucceeded,
  'payment_intent.payment_failed': handlePaymentIntentFailed,

  // Connect Account Events (Hotel Onboarding)
  'account.updated': handleConnectedAccountUpdated,
};

/**
 * POST /api/webhooks/stripe
 *
 * Main webhook handler that:
 * 1. Verifies webhook signature
 * 2. Validates payload
 * 3. Checks for idempotency
 * 4. Routes events to appropriate handlers
 * 5. Logs all events for audit trail
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Get raw request body for signature verification
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  // Validate signature header exists
  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  // Validate payload size (Stripe recommends < 64KB)
  if (!validateWebhookPayloadSize(body)) {
    console.error('[Stripe Webhook] Payload too large');
    return NextResponse.json(
      { error: 'Payload too large' },
      { status: 413 }
    );
  }

  // Get webhook secret from environment
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    );
  }

  // Verify webhook signature and construct event
  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(body, signature, webhookSecret);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Signature verification failed';
    console.error('[Stripe Webhook] Signature verification failed:', errorMessage);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Log event received
  console.log(`[Stripe Webhook] Received: ${event.type} (${event.id})`);
  const isConnect = isConnectEvent(event);
  if (isConnect) {
    console.log(`[Stripe Webhook] Connect event from account: ${event.account}`);
  }

  // Log webhook event to database
  await logWebhookEvent(event, 'received');

  // Check for idempotency - prevent duplicate processing
  if (await isEventProcessed(event.id)) {
    console.log(`[Stripe Webhook] Event ${event.id} already processed, returning success`);
    return NextResponse.json({ received: true, status: 'already_processed' });
  }

  // Get handler for this event type
  const handler = EVENT_HANDLERS[event.type];

  if (!handler) {
    console.log(`[Stripe Webhook] No handler for event type: ${event.type}`);
    await logWebhookEvent(event, 'processed');
    return NextResponse.json({
      received: true,
      status: 'unhandled_event_type',
      event_type: event.type,
    });
  }

  // Process the event
  try {
    await logWebhookEvent(event, 'processing');
    await handler(event);
    await logWebhookEvent(event, 'processed');

    const processingTime = Date.now() - startTime;
    console.log(
      `[Stripe Webhook] Successfully processed ${event.type} (${event.id}) in ${processingTime}ms`
    );

    return NextResponse.json({
      received: true,
      status: 'processed',
      event_type: event.type,
      event_id: event.id,
      processing_time_ms: processingTime,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Stripe Webhook] Error processing ${event.type} (${event.id}):`, error);

    await logWebhookEvent(event, 'failed', errorMessage);

    // Return 500 so Stripe will retry the webhook
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        event_type: event.type,
        event_id: event.id,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/stripe
 *
 * Returns webhook endpoint information
 * Useful for debugging and verification
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhooks/stripe',
    description: 'Stripe webhook handler for Hotelius SaaS',
    supported_events: Object.keys(EVENT_HANDLERS),
    configuration: {
      webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
    },
  });
}
