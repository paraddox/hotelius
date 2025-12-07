/**
 * Stripe webhook utilities
 *
 * This module provides utilities for handling Stripe webhook events
 * in your Next.js API routes
 *
 * @module lib/stripe-webhooks
 */

// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */

import type Stripe from 'stripe';
import { constructWebhookEvent } from './stripe';
import type {
  HandledWebhookEvent,
  SubscriptionWebhookEvent,
  PaymentIntentWebhookEvent,
  AccountWebhookEvent,
  InvoiceWebhookEvent,
  ChargeWebhookEvent,
} from './stripe-types';

/**
 * Webhook handler function type
 */
export type WebhookHandler<T = Stripe.Event> = (
  event: T
) => Promise<void> | void;

/**
 * Webhook handlers map
 * Maps event types to their handler functions
 */
export type WebhookHandlers = Partial<
  Record<HandledWebhookEvent, WebhookHandler>
>;

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  /**
   * Webhook signing secret from Stripe
   */
  secret: string;

  /**
   * Map of event types to handler functions
   */
  handlers: WebhookHandlers;

  /**
   * Optional error handler
   * Called when a handler throws an error
   */
  onError?: (error: Error, event: Stripe.Event) => void;

  /**
   * Optional handler for unhandled events
   * Called for events that don't have a specific handler
   */
  onUnhandledEvent?: (event: Stripe.Event) => void;
}

/**
 * Process a Stripe webhook event
 *
 * This function verifies the webhook signature and routes the event
 * to the appropriate handler based on the event type
 *
 * @param payload - Raw request body as string or buffer
 * @param signature - Stripe signature header
 * @param config - Webhook configuration
 * @returns Promise that resolves when all handlers complete
 *
 * @example
 * ```ts
 * // In your API route: app/api/webhooks/stripe/route.ts
 * export async function POST(request: Request) {
 *   const body = await request.text();
 *   const signature = request.headers.get('stripe-signature')!;
 *
 *   try {
 *     await processWebhook(body, signature, {
 *       secret: process.env.STRIPE_WEBHOOK_SECRET!,
 *       handlers: {
 *         'payment_intent.succeeded': async (event) => {
 *           const paymentIntent = event.data.object;
 *           // Update database
 *         },
 *         'customer.subscription.updated': async (event) => {
 *           const subscription = event.data.object;
 *           // Update subscription status
 *         }
 *       }
 *     });
 *
 *     return NextResponse.json({ received: true });
 *   } catch (error) {
 *     return NextResponse.json({ error: error.message }, { status: 400 });
 *   }
 * }
 * ```
 */
export async function processWebhook(
  payload: string | Buffer,
  signature: string,
  config: WebhookConfig
): Promise<void> {
  // Verify and construct the event
  const event = constructWebhookEvent(payload, signature, config.secret);

  // Get the handler for this event type
  const handler = config.handlers[event.type as HandledWebhookEvent];

  if (handler) {
    try {
      await handler(event);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (config.onError) {
        config.onError(err, event);
      } else {
        // Re-throw if no error handler is provided
        throw err;
      }
    }
  } else if (config.onUnhandledEvent) {
    config.onUnhandledEvent(event);
  }
}

/**
 * Create a typed webhook handler for subscription events
 *
 * @param handler - Handler function for subscription events
 * @returns Typed webhook handler
 *
 * @example
 * ```ts
 * const subscriptionHandler = createSubscriptionHandler(async (event) => {
 *   const subscription = event.data.object;
 *   const metadata = subscription.metadata as HotelSubscriptionMetadata;
 *
 *   await db.updateHotelSubscription({
 *     hotelId: metadata.hotelId,
 *     status: subscription.status,
 *     currentPeriodEnd: subscription.current_period_end
 *   });
 * });
 * ```
 */
export function createSubscriptionHandler(
  handler: WebhookHandler<SubscriptionWebhookEvent>
): WebhookHandler {
  return handler;
}

/**
 * Create a typed webhook handler for payment intent events
 *
 * @param handler - Handler function for payment intent events
 * @returns Typed webhook handler
 *
 * @example
 * ```ts
 * const paymentHandler = createPaymentIntentHandler(async (event) => {
 *   const paymentIntent = event.data.object;
 *   const metadata = paymentIntent.metadata as ReservationPaymentMetadata;
 *
 *   await db.updateReservation({
 *     id: metadata.reservationId,
 *     paymentStatus: 'paid',
 *     paymentIntentId: paymentIntent.id
 *   });
 * });
 * ```
 */
export function createPaymentIntentHandler(
  handler: WebhookHandler<PaymentIntentWebhookEvent>
): WebhookHandler {
  return handler;
}

/**
 * Create a typed webhook handler for account events
 *
 * @param handler - Handler function for account events
 * @returns Typed webhook handler
 *
 * @example
 * ```ts
 * const accountHandler = createAccountHandler(async (event) => {
 *   const account = event.data.object;
 *   const metadata = account.metadata as HotelConnectAccountMetadata;
 *
 *   await db.updateHotelStripeAccount({
 *     hotelId: metadata.hotelId,
 *     chargesEnabled: account.charges_enabled,
 *     payoutsEnabled: account.payouts_enabled
 *   });
 * });
 * ```
 */
export function createAccountHandler(
  handler: WebhookHandler<AccountWebhookEvent>
): WebhookHandler {
  return handler;
}

/**
 * Create a typed webhook handler for invoice events
 *
 * @param handler - Handler function for invoice events
 * @returns Typed webhook handler
 *
 * @example
 * ```ts
 * const invoiceHandler = createInvoiceHandler(async (event) => {
 *   const invoice = event.data.object;
 *
 *   if (event.type === 'invoice.payment_failed') {
 *     // Send notification to customer
 *     await sendPaymentFailedEmail(invoice.customer_email);
 *   }
 * });
 * ```
 */
export function createInvoiceHandler(
  handler: WebhookHandler<InvoiceWebhookEvent>
): WebhookHandler {
  return handler;
}

/**
 * Create a typed webhook handler for charge events
 *
 * @param handler - Handler function for charge events
 * @returns Typed webhook handler
 *
 * @example
 * ```ts
 * const chargeHandler = createChargeHandler(async (event) => {
 *   const charge = event.data.object;
 *
 *   if (event.type === 'charge.refunded') {
 *     const paymentIntent = charge.payment_intent;
 *     // Update reservation to refunded
 *   }
 * });
 * ```
 */
export function createChargeHandler(
  handler: WebhookHandler<ChargeWebhookEvent>
): WebhookHandler {
  return handler;
}

/**
 * Extract Connect account ID from an event if present
 *
 * @param event - Stripe event
 * @returns Connect account ID or null
 */
export function getConnectAccountFromEvent(
  event: Stripe.Event
): string | null {
  return event.account || null;
}

/**
 * Check if an event is from a Connect account
 *
 * @param event - Stripe event
 * @returns True if event is from a Connect account
 */
export function isConnectEvent(event: Stripe.Event): boolean {
  return event.account !== undefined && event.account !== null;
}

/**
 * Extract the previous attributes from an update event
 * Useful for determining what changed in subscription.updated, account.updated, etc.
 *
 * @param event - Stripe event
 * @returns Previous attributes or null
 */
export function getPreviousAttributes<T = unknown>(
  event: Stripe.Event
): Partial<T> | null {
  if ('previous_attributes' in event.data) {
    return event.data.previous_attributes as Partial<T>;
  }
  return null;
}

/**
 * Helper to safely extract metadata from event data object
 *
 * @param event - Stripe event
 * @returns Metadata object or empty object
 *
 * @example
 * ```ts
 * const metadata = getMetadataFromEvent<ReservationPaymentMetadata>(event);
 * console.log(metadata.reservationId);
 * ```
 */
export function getMetadataFromEvent<T = Record<string, string>>(
  event: Stripe.Event
): T {
  const dataObject = event.data.object;
  if ('metadata' in dataObject && dataObject.metadata) {
    return dataObject.metadata as T;
  }
  return {} as T;
}

/**
 * Validate webhook payload size
 * Stripe recommends keeping webhook payloads under 64KB
 *
 * @param payload - Raw webhook payload
 * @param maxSizeKB - Maximum size in kilobytes (default: 64)
 * @returns True if payload is within size limit
 */
export function validateWebhookPayloadSize(
  payload: string | Buffer,
  maxSizeKB: number = 64
): boolean {
  const sizeInBytes =
    typeof payload === 'string'
      ? Buffer.byteLength(payload, 'utf8')
      : payload.length;

  const sizeInKB = sizeInBytes / 1024;
  return sizeInKB <= maxSizeKB;
}

/**
 * Idempotency key generator for webhook processing
 * Use this to prevent duplicate processing of the same event
 *
 * @param event - Stripe event
 * @returns Idempotency key (event ID)
 */
export function getIdempotencyKey(event: Stripe.Event): string {
  return event.id;
}
