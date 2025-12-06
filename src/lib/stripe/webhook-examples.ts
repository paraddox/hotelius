/**
 * Stripe Webhook Usage Examples
 *
 * Example code demonstrating how to use the Stripe webhook handlers
 * and utilities in various scenarios.
 *
 * @module lib/stripe/webhook-examples
 */

import type Stripe from 'stripe';
import {
  verifyWebhookSignature,
  getEventData,
  getEventMetadata,
  logWebhookEvent,
  mapSubscriptionStatus,
  formatStripeTimestamp,
} from './webhook-utils';
import {
  handleSubscriptionCreated,
  handlePaymentIntentSucceeded,
} from './webhook-handlers';
import type {
  HotelSubscriptionMetadata,
  ReservationPaymentMetadata,
} from '@/lib/stripe-types';

/**
 * Example 1: Basic webhook signature verification
 */
export async function exampleBasicWebhookVerification(
  requestBody: string,
  signature: string,
  webhookSecret: string
): Promise<void> {
  try {
    // Verify the webhook signature
    const event = verifyWebhookSignature(requestBody, signature, webhookSecret);

    console.log('Verified event:', event.type);
    console.log('Event ID:', event.id);
  } catch (error) {
    console.error('Signature verification failed:', error);
    throw error;
  }
}

/**
 * Example 2: Processing subscription events with metadata
 */
export async function exampleSubscriptionEvent(event: Stripe.Event): Promise<void> {
  // Extract subscription data
  const subscription = getEventData<Stripe.Subscription>(event);

  // Extract typed metadata
  const metadata = getEventMetadata<HotelSubscriptionMetadata>(event);

  console.log('Processing subscription for hotel:', metadata.hotelId);
  console.log('Plan:', metadata.plan);
  console.log('Status:', subscription.status);

  // Map Stripe status to database status
  const dbStatus = mapSubscriptionStatus(subscription.status);
  console.log('Database status:', dbStatus);

  // Call the handler
  await handleSubscriptionCreated(event);
}

/**
 * Example 3: Processing payment intent events
 */
export async function examplePaymentIntentEvent(event: Stripe.Event): Promise<void> {
  // Extract payment intent data
  const paymentIntent = getEventData<Stripe.PaymentIntent>(event);

  // Extract booking metadata
  const metadata = getEventMetadata<ReservationPaymentMetadata>(event);

  console.log('Payment for booking:', metadata.reservationId);
  console.log('Amount:', paymentIntent.amount / 100, paymentIntent.currency);
  console.log('Status:', paymentIntent.status);

  // Handle the payment
  await handlePaymentIntentSucceeded(event);
}

/**
 * Example 4: Complete webhook endpoint implementation
 */
export async function exampleWebhookEndpoint(
  requestBody: string,
  signature: string
): Promise<{ status: number; body: any }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    // 1. Verify signature
    const event = verifyWebhookSignature(requestBody, signature, webhookSecret);

    // 2. Log event received
    await logWebhookEvent(event, 'received');

    // 3. Route to appropriate handler based on event type
    switch (event.type) {
      case 'customer.subscription.created':
        await logWebhookEvent(event, 'processing');
        await handleSubscriptionCreated(event);
        await logWebhookEvent(event, 'processed');
        break;

      case 'payment_intent.succeeded':
        await logWebhookEvent(event, 'processing');
        await handlePaymentIntentSucceeded(event);
        await logWebhookEvent(event, 'processed');
        break;

      default:
        console.log('Unhandled event type:', event.type);
        await logWebhookEvent(event, 'processed');
    }

    // 4. Return success
    return {
      status: 200,
      body: { received: true },
    };
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return {
      status: 500,
      body: { error: 'Webhook processing failed' },
    };
  }
}

/**
 * Example 5: Extracting and using event data
 */
export function exampleExtractEventData(event: Stripe.Event): void {
  // Get the main data object
  const subscription = getEventData<Stripe.Subscription>(event);

  // Extract metadata
  const metadata = getEventMetadata<HotelSubscriptionMetadata>(event);

  // Format timestamps
  const periodStart = formatStripeTimestamp(subscription.current_period_start);
  const periodEnd = formatStripeTimestamp(subscription.current_period_end);

  console.log('Subscription period:', periodStart, 'to', periodEnd);
  console.log('Hotel ID:', metadata.hotelId);
  console.log('Plan:', metadata.plan);
}

/**
 * Example 6: Testing webhook handlers locally
 */
export async function exampleTestWebhookLocally(): Promise<void> {
  // Mock Stripe event
  const mockEvent: Stripe.Event = {
    id: 'evt_test_123',
    object: 'event',
    api_version: '2024-11-20.acacia',
    created: Math.floor(Date.now() / 1000),
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test_123',
        object: 'subscription',
        customer: 'cus_test_123',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 2592000, // +30 days
        cancel_at_period_end: false,
        metadata: {
          hotelId: 'hotel_123',
          hotelName: 'Test Hotel',
          plan: 'premium',
        },
      } as Stripe.Subscription,
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: null,
      idempotency_key: null,
    },
  };

  // Test the handler
  try {
    await handleSubscriptionCreated(mockEvent);
    console.log('Test webhook processed successfully');
  } catch (error) {
    console.error('Test webhook failed:', error);
  }
}

/**
 * Example 7: Creating subscription with proper metadata
 */
export async function exampleCreateSubscriptionWithMetadata(
  stripe: Stripe,
  customerId: string,
  priceId: string,
  hotelId: string
): Promise<Stripe.Subscription> {
  // Create subscription with required metadata
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata: {
      hotelId,
      hotelName: 'Grand Hotel',
      plan: 'premium',
      maxRooms: '100',
      maxStaff: '50',
    } satisfies HotelSubscriptionMetadata,
  });

  return subscription;
}

/**
 * Example 8: Creating payment intent with booking metadata
 */
export async function exampleCreatePaymentIntentWithMetadata(
  stripe: Stripe,
  amount: number,
  connectedAccountId: string,
  bookingId: string,
  hotelId: string,
  guestId: string
): Promise<Stripe.PaymentIntent> {
  // Create payment intent with required metadata
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    application_fee_amount: Math.floor(amount * 0.1), // 10% platform fee
    transfer_data: {
      destination: connectedAccountId,
    },
    metadata: {
      reservationId: bookingId,
      hotelId,
      guestId,
      checkIn: '2024-12-15',
      checkOut: '2024-12-20',
      roomCount: '2',
    } satisfies ReservationPaymentMetadata,
  });

  return paymentIntent;
}

/**
 * Example 9: Handling webhook retries from Stripe
 */
export async function exampleIdempotentWebhookProcessing(
  event: Stripe.Event
): Promise<boolean> {
  // Check if event was already processed
  const { isEventProcessed } = await import('./webhook-utils');

  if (await isEventProcessed(event.id)) {
    console.log('Event already processed, skipping');
    return false; // Event was already processed
  }

  // Process the event
  await logWebhookEvent(event, 'processing');

  try {
    // Handle event...
    await logWebhookEvent(event, 'processed');
    return true; // Event processed successfully
  } catch (error) {
    await logWebhookEvent(event, 'failed', (error as Error).message);
    throw error; // Rethrow so Stripe will retry
  }
}

/**
 * Example 10: Custom event handler with error handling
 */
export async function exampleCustomEventHandler(event: Stripe.Event): Promise<void> {
  const metadata = getEventMetadata<HotelSubscriptionMetadata>(event);

  if (!metadata.hotelId) {
    console.warn('Event missing required hotelId in metadata');
    return; // Skip event
  }

  try {
    // Process event
    console.log('Processing event for hotel:', metadata.hotelId);

    // Your custom logic here...

  } catch (error) {
    console.error('Error processing event:', error);
    // Log error but don't throw - event will be marked as processed
    // Only throw if you want Stripe to retry
  }
}
