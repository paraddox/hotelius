/**
 * Stripe Webhook Utility Functions
 *
 * Provides utility functions for webhook signature verification,
 * event data extraction, and webhook event logging.
 *
 * @module lib/stripe/webhook-utils
 */

import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Verify webhook signature from Stripe
 *
 * @param payload - Raw request body as string or buffer
 * @param signature - Stripe signature from request headers
 * @param webhookSecret - Webhook signing secret from Stripe dashboard
 * @returns Verified Stripe event
 * @throws Error if signature verification fails
 *
 * @example
 * ```ts
 * const event = verifyWebhookSignature(
 *   requestBody,
 *   req.headers['stripe-signature'],
 *   process.env.STRIPE_WEBHOOK_SECRET
 * );
 * ```
 */
export function verifyWebhookSignature(
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
    if (error instanceof Error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
    throw new Error('Webhook signature verification failed');
  }
}

/**
 * Extract typed event data from Stripe event
 *
 * @param event - Stripe event
 * @returns Event data object
 *
 * @example
 * ```ts
 * const subscription = getEventData<Stripe.Subscription>(event);
 * console.log(subscription.id);
 * ```
 */
export function getEventData<T>(event: Stripe.Event): T {
  return event.data.object as T;
}

/**
 * Extract metadata from event data object
 *
 * @param event - Stripe event
 * @returns Metadata object or empty object
 *
 * @example
 * ```ts
 * const metadata = getEventMetadata<{ hotelId: string }>(event);
 * console.log(metadata.hotelId);
 * ```
 */
export function getEventMetadata<T = Record<string, string>>(
  event: Stripe.Event
): T {
  const dataObject = event.data.object;
  if ('metadata' in dataObject && dataObject.metadata) {
    return dataObject.metadata as T;
  }
  return {} as T;
}

/**
 * Get previous attributes from an update event
 * Useful for determining what changed
 *
 * @param event - Stripe event
 * @returns Previous attributes or null
 *
 * @example
 * ```ts
 * const previous = getPreviousAttributes<Stripe.Subscription>(event);
 * if (previous?.status !== undefined) {
 *   console.log('Status changed from', previous.status);
 * }
 * ```
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
 * Check if event is from a Connect account
 *
 * @param event - Stripe event
 * @returns True if event originated from a Connect account
 */
export function isConnectEvent(event: Stripe.Event): boolean {
  return event.account !== undefined && event.account !== null;
}

/**
 * Get Connect account ID from event
 *
 * @param event - Stripe event
 * @returns Connect account ID or null
 */
export function getConnectAccountId(event: Stripe.Event): string | null {
  return event.account || null;
}

/**
 * Log webhook event to database
 *
 * Stores webhook events for audit trail and debugging purposes.
 * Implements idempotency by using event ID as unique identifier.
 *
 * @param event - Stripe event
 * @param status - Processing status ('received', 'processing', 'processed', 'failed')
 * @param errorMessage - Optional error message if processing failed
 *
 * @example
 * ```ts
 * await logWebhookEvent(event, 'received');
 * try {
 *   // Process event
 *   await logWebhookEvent(event, 'processed');
 * } catch (error) {
 *   await logWebhookEvent(event, 'failed', error.message);
 * }
 * ```
 */
export async function logWebhookEvent(
  event: Stripe.Event,
  status: 'received' | 'processing' | 'processed' | 'failed',
  errorMessage?: string
): Promise<void> {
  const supabase = createServiceClient();

  try {
    // Try to insert new webhook log entry
    const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        event_data: event.data.object,
        status,
        error_message: errorMessage || null,
        received_at: new Date(event.created * 1000).toISOString(),
        processed_at: status === 'processed' || status === 'failed'
          ? new Date().toISOString()
          : null,
        connect_account_id: event.account || null,
      });

    // If insert failed due to duplicate key (idempotency), update existing record
    if (insertError?.code === '23505') {
      await supabase
        .from('webhook_events')
        .update({
          status,
          error_message: errorMessage || null,
          processed_at: status === 'processed' || status === 'failed'
            ? new Date().toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('event_id', event.id);
    } else if (insertError) {
      console.error('[Webhook Utils] Error logging webhook event:', insertError);
    }
  } catch (error) {
    // Don't throw - logging failures shouldn't break webhook processing
    console.error('[Webhook Utils] Failed to log webhook event:', error);
  }
}

/**
 * Check if webhook event has already been processed (idempotency check)
 *
 * @param eventId - Stripe event ID
 * @returns True if event has been processed
 *
 * @example
 * ```ts
 * if (await isEventProcessed(event.id)) {
 *   console.log('Event already processed, skipping');
 *   return;
 * }
 * ```
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const supabase = createServiceClient();

  try {
    const { data } = await supabase
      .from('webhook_events')
      .select('status')
      .eq('event_id', eventId)
      .eq('status', 'processed')
      .single();

    return data !== null;
  } catch (error) {
    // If table doesn't exist or query fails, assume not processed
    return false;
  }
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
 * Extract customer email from event
 *
 * @param event - Stripe event
 * @returns Customer email or null
 */
export function getCustomerEmail(event: Stripe.Event): string | null {
  const data = event.data.object as any;

  // Direct email field
  if (data.customer_email) {
    return data.customer_email;
  }

  // Email in receipt_email
  if (data.receipt_email) {
    return data.receipt_email;
  }

  return null;
}

/**
 * Format Stripe timestamp to ISO string
 *
 * @param timestamp - Unix timestamp from Stripe
 * @returns ISO 8601 formatted date string
 */
export function formatStripeTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Safely extract amount in cents from Stripe object
 *
 * @param stripeObject - Stripe object with amount fields
 * @returns Amount in cents
 */
export function extractAmount(stripeObject: any): number {
  return stripeObject.amount_received || stripeObject.amount || 0;
}

/**
 * Create idempotency key from event
 *
 * @param event - Stripe event
 * @returns Idempotency key (event ID)
 */
export function getIdempotencyKey(event: Stripe.Event): string {
  return event.id;
}

/**
 * Check if subscription is in active state
 *
 * @param status - Stripe subscription status
 * @returns True if subscription is considered active
 */
export function isSubscriptionActive(status: Stripe.Subscription.Status): boolean {
  return status === 'active' || status === 'trialing';
}

/**
 * Map Stripe subscription status to database subscription status
 *
 * @param stripeStatus - Stripe subscription status
 * @returns Database subscription status
 */
export function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended' {
  switch (stripeStatus) {
    case 'trialing':
      return 'trial';
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    case 'paused':
    case 'incomplete':
      return 'suspended';
    default:
      return 'suspended';
  }
}

/**
 * Map Stripe payment intent status to database payment status
 *
 * @param stripeStatus - Stripe payment intent status
 * @returns Database payment status
 */
export function mapPaymentStatus(
  stripeStatus: Stripe.PaymentIntent.Status
): 'pending' | 'authorized' | 'paid' | 'failed' {
  switch (stripeStatus) {
    case 'succeeded':
      return 'paid';
    case 'processing':
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      return 'pending';
    case 'requires_capture':
      return 'authorized';
    case 'canceled':
      return 'failed';
    default:
      return 'pending';
  }
}
