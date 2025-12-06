/**
 * Stripe Integration Module
 *
 * Central export point for all Stripe-related functionality including:
 * - Core Stripe client configuration
 * - Webhook event handlers
 * - Webhook utilities
 * - Type definitions
 *
 * @module lib/stripe
 */

// Core Stripe configuration and helpers
export {
  stripe,
  createConnectAccount,
  createAccountLink,
  createSubscription,
  createPaymentIntent,
  getCustomer,
  constructWebhookEvent,
} from '../stripe';

// Webhook handlers
export {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleCheckoutSessionCompleted,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleConnectedAccountUpdated,
} from './webhook-handlers';

// Webhook utilities
export {
  verifyWebhookSignature,
  getEventData,
  getEventMetadata,
  getPreviousAttributes,
  isConnectEvent,
  getConnectAccountId,
  logWebhookEvent,
  isEventProcessed,
  validateWebhookPayloadSize,
  getCustomerEmail,
  formatStripeTimestamp,
  extractAmount,
  getIdempotencyKey,
  isSubscriptionActive,
  mapSubscriptionStatus,
  mapPaymentStatus,
} from './webhook-utils';

// Type definitions
export type {
  SubscriptionPlan,
  SubscriptionStatus,
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
} from '../stripe-types';

export {
  isSubscriptionEvent,
  isPaymentIntentEvent,
  isAccountEvent,
  isInvoiceEvent,
  isChargeEvent,
} from '../stripe-types';
