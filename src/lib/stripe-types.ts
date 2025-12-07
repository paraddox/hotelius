/**
 * Custom TypeScript types for Stripe integration
 *
 * This module provides additional type definitions specific to the Hotelius
 * hotel reservation SaaS application
 *
 * @module lib/stripe-types
 */

import type Stripe from 'stripe';

/**
 * Subscription plan tiers for hotels
 */
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * Subscription status extended with app-specific states
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'paused';

/**
 * Hotel subscription metadata
 * Stored in Stripe subscription metadata for reference
 */
export interface HotelSubscriptionMetadata {
  hotelId: string;
  hotelName: string;
  plan: SubscriptionPlan;
  maxRooms?: string; // Stored as string in metadata
  maxStaff?: string;
}

/**
 * Hotel Stripe Connect account metadata
 * Stored in Stripe account metadata for reference
 */
export interface HotelConnectAccountMetadata {
  hotelId: string;
  hotelName: string;
  ownerId: string;
}

/**
 * Reservation payment metadata
 * Stored in payment intent metadata for reference
 */
export interface ReservationPaymentMetadata {
  reservationId: string;
  hotelId: string;
  guestId: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  roomCount: string; // Stored as string in metadata
}

/**
 * Webhook event types we handle in the application
 */
export type HandledWebhookEvent =
  // Subscription events (SaaS billing)
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  // Connect account events
  | 'account.updated'
  | 'account.application.deauthorized'
  // Payment events (guest reservations)
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'charge.refunded';

/**
 * Typed webhook event data structure
 */
export interface WebhookEventData<T = unknown> {
  type: HandledWebhookEvent;
  data: {
    object: T;
    previous_attributes?: Partial<T>;
  };
  created: number;
  id: string;
}

/**
 * Subscription event data
 */
export type SubscriptionWebhookEvent = WebhookEventData<Stripe.Subscription>;

/**
 * Payment intent event data
 */
export type PaymentIntentWebhookEvent = WebhookEventData<Stripe.PaymentIntent>;

/**
 * Account event data
 */
export type AccountWebhookEvent = WebhookEventData<Stripe.Account>;

/**
 * Invoice event data
 */
export type InvoiceWebhookEvent = WebhookEventData<Stripe.Invoice>;

/**
 * Charge event data
 */
export type ChargeWebhookEvent = WebhookEventData<Stripe.Charge>;

/**
 * Connect account onboarding status
 */
export interface ConnectOnboardingStatus {
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requiresInformation: boolean;
  currentlyDue: string[];
  eventuallyDue: string[];
  pastDue: string[];
}

/**
 * Connect account status for display
 */
export interface ConnectStatus {
  accountId: string;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  capabilities: {
    cardPayments: 'active' | 'inactive' | 'pending';
    transfers: 'active' | 'inactive' | 'pending';
  };
  requiresInformation: boolean;
  currentlyDue: string[];
  pastDue: string[];
}

/**
 * Stripe balance information
 */
export interface Balance {
  available: Array<{
    amount: number;
    currency: string;
  }>;
  pending: Array<{
    amount: number;
    currency: string;
  }>;
}

/**
 * Payout information
 */
export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'in_transit' | 'canceled' | 'failed';
  arrivalDate: number; // Unix timestamp
  created: number; // Unix timestamp
  destination?: string; // Bank account ID
  bankAccount?: {
    last4: string;
    bankName?: string;
  };
}

/**
 * Payment result from client-side confirmation
 */
export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
  requiresAction?: boolean;
}

/**
 * Subscription creation result
 */
export interface SubscriptionCreationResult {
  subscriptionId: string;
  clientSecret?: string;
  status: SubscriptionStatus;
}

/**
 * Platform fee configuration
 * Used to calculate application fees for Connect payments
 */
export interface PlatformFeeConfig {
  percentage: number; // e.g., 10 for 10%
  fixedAmount?: number; // Fixed amount in cents
  minimumFee?: number; // Minimum fee in cents
  maximumFee?: number; // Maximum fee in cents
}

/**
 * Price calculation result for reservations
 */
export interface ReservationPriceCalculation {
  subtotal: number; // Amount hotel receives (in cents)
  platformFee: number; // Fee charged by platform (in cents)
  total: number; // Total amount charged to guest (in cents)
  currency: string;
}

/**
 * Helper type to extract metadata from Stripe objects
 */
export type StripeMetadata<T> = T extends { metadata: infer M } ? M : never;

/**
 * Type guard to check if an event is a subscription event
 */
export const isSubscriptionEvent = (
  event: Stripe.Event
): boolean => {
  return event.type.startsWith('customer.subscription.');
};

/**
 * Type guard to check if an event is a payment intent event
 */
export const isPaymentIntentEvent = (
  event: Stripe.Event
): boolean => {
  return event.type.startsWith('payment_intent.');
};

/**
 * Type guard to check if an event is an account event
 */
export const isAccountEvent = (
  event: Stripe.Event
): boolean => {
  return event.type.startsWith('account.');
};

/**
 * Type guard to check if an event is an invoice event
 */
export const isInvoiceEvent = (
  event: Stripe.Event
): boolean => {
  return event.type.startsWith('invoice.');
};

/**
 * Type guard to check if an event is a charge event
 */
export const isChargeEvent = (
  event: Stripe.Event
): boolean => {
  return event.type.startsWith('charge.');
};
