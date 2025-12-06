/**
 * Stripe Integration Index
 *
 * Convenient re-exports of all Stripe utilities
 * Import from this file for cleaner imports
 *
 * @example
 * ```ts
 * // Instead of:
 * import { stripe } from '@/lib/stripe';
 * import { getStripe } from '@/lib/stripe-client';
 * import { processWebhook } from '@/lib/stripe-webhooks';
 *
 * // You can do:
 * import { stripe, getStripe, processWebhook } from '@/lib/stripe-index';
 * ```
 */

// Server-side exports
export {
  stripe,
  createConnectAccount,
  createAccountLink,
  createSubscription,
  createPaymentIntent,
  getCustomer,
  constructWebhookEvent,
} from './stripe';

// Client-side exports
export {
  getStripe,
  getStripeForConnectedAccount,
  isStripeLoaded,
  formatAmountForStripe,
  formatAmountFromStripe,
} from './stripe-client';

// Webhook utilities
export {
  processWebhook,
  createSubscriptionHandler,
  createPaymentIntentHandler,
  createAccountHandler,
  createInvoiceHandler,
  createChargeHandler,
  getConnectAccountFromEvent,
  isConnectEvent,
  getPreviousAttributes,
  getMetadataFromEvent,
  validateWebhookPayloadSize,
  getIdempotencyKey,
} from './stripe-webhooks';

// Type exports
export type {
  HotelSubscriptionMetadata,
  HotelConnectAccountMetadata,
  ReservationPaymentMetadata,
  HandledWebhookEvent,
  WebhookEventData,
  SubscriptionWebhookEvent,
  PaymentIntentWebhookEvent,
  AccountWebhookEvent,
  InvoiceWebhookEvent,
  ChargeWebhookEvent,
  ConnectOnboardingStatus,
  PaymentResult,
  SubscriptionCreationResult,
  PlatformFeeConfig,
  ReservationPriceCalculation,
  SubscriptionStatus,
} from './stripe-types';

export {
  SubscriptionPlan,
  isSubscriptionEvent,
  isPaymentIntentEvent,
  isAccountEvent,
  isInvoiceEvent,
  isChargeEvent,
} from './stripe-types';

// Re-export Stripe namespace for typing
export type { Stripe } from 'stripe';
