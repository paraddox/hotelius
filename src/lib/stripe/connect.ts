/**
 * Stripe Connect utility functions
 *
 * This module provides helper functions for working with Stripe Connect accounts,
 * including retrieving account status, balances, payouts, and dashboard links.
 *
 * @module lib/stripe/connect
 */

// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { stripe } from '@/lib/stripe';
import type { ConnectStatus, Balance, Payout } from '@/lib/stripe-types';
import Stripe from 'stripe';

/**
 * Get the Connect account status for a hotel
 *
 * @param stripeAccountId - Stripe Connect account ID
 * @returns Connect account status information
 *
 * @example
 * ```ts
 * const status = await getConnectAccountStatus('acct_123');
 * console.log(status.chargesEnabled); // true
 * ```
 */
export async function getConnectAccountStatus(
  stripeAccountId: string
): Promise<ConnectStatus> {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // Map capability status
    const mapCapability = (
      capability: Stripe.Account.Capabilities.CardPayments |
                  Stripe.Account.Capabilities.Transfers |
                  undefined
    ): 'active' | 'inactive' | 'pending' => {
      if (capability === 'active') return 'active';
      if (capability === 'pending' || capability === 'inactive') return capability;
      return 'inactive';
    };

    return {
      accountId: account.id,
      detailsSubmitted: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      capabilities: {
        cardPayments: mapCapability(account.capabilities?.card_payments),
        transfers: mapCapability(account.capabilities?.transfers),
      },
      requiresInformation: (account.requirements?.currently_due?.length || 0) > 0 ||
                          (account.requirements?.past_due?.length || 0) > 0,
      currentlyDue: account.requirements?.currently_due || [],
      pastDue: account.requirements?.past_due || [],
    };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to retrieve account status: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get the balance for a Connect account
 *
 * @param stripeAccountId - Stripe Connect account ID
 * @returns Balance information including available and pending amounts
 *
 * @example
 * ```ts
 * const balance = await getAccountBalance('acct_123');
 * console.log(balance.available[0].amount); // 5000 (in cents)
 * ```
 */
export async function getAccountBalance(
  stripeAccountId: string
): Promise<Balance> {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeAccountId,
    });

    return {
      available: balance.available.map(item => ({
        amount: item.amount,
        currency: item.currency,
      })),
      pending: balance.pending.map(item => ({
        amount: item.amount,
        currency: item.currency,
      })),
    };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to retrieve account balance: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get recent payouts for a Connect account
 *
 * @param stripeAccountId - Stripe Connect account ID
 * @param limit - Maximum number of payouts to retrieve (default: 10)
 * @returns List of recent payouts
 *
 * @example
 * ```ts
 * const payouts = await getPayouts('acct_123', 5);
 * payouts.forEach(payout => console.log(payout.amount, payout.status));
 * ```
 */
export async function getPayouts(
  stripeAccountId: string,
  limit: number = 10
): Promise<Payout[]> {
  try {
    const payouts = await stripe.payouts.list(
      {
        limit,
      },
      {
        stripeAccount: stripeAccountId,
      }
    );

    // Fetch bank account details for each payout if available
    const payoutsWithBankInfo = await Promise.all(
      payouts.data.map(async (payout) => {
        let bankAccount;

        if (payout.destination && typeof payout.destination === 'string') {
          try {
            const bankAccountData = await stripe.accounts.retrieveExternalAccount(
              stripeAccountId,
              payout.destination
            );

            if (bankAccountData.object === 'bank_account') {
              bankAccount = {
                last4: bankAccountData.last4,
                bankName: bankAccountData.bank_name || undefined,
              };
            }
          } catch (error) {
            // If we can't retrieve bank account, just continue without it
            console.warn(`Could not retrieve bank account for payout ${payout.id}`);
          }
        }

        return {
          id: payout.id,
          amount: payout.amount,
          currency: payout.currency,
          status: payout.status,
          arrivalDate: payout.arrival_date,
          created: payout.created,
          destination: typeof payout.destination === 'string'
            ? payout.destination
            : undefined,
          bankAccount,
        };
      })
    );

    return payoutsWithBankInfo;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to retrieve payouts: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get a login link to the Stripe Express Dashboard
 *
 * @param stripeAccountId - Stripe Connect account ID
 * @returns URL to the Express Dashboard
 *
 * @example
 * ```ts
 * const dashboardUrl = await getExpressDashboardLink('acct_123');
 * // Redirect user to dashboardUrl
 * ```
 */
export async function getExpressDashboardLink(
  stripeAccountId: string
): Promise<string> {
  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return loginLink.url;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to create dashboard link: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check if a Connect account has completed onboarding
 *
 * @param stripeAccountId - Stripe Connect account ID
 * @returns True if onboarding is complete and account can accept charges
 *
 * @example
 * ```ts
 * const isReady = await isAccountReady('acct_123');
 * if (isReady) {
 *   // Account can accept payments
 * }
 * ```
 */
export async function isAccountReady(
  stripeAccountId: string
): Promise<boolean> {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return (
      account.details_submitted === true &&
      account.charges_enabled === true &&
      account.payouts_enabled === true
    );
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Failed to check account readiness: ${error.message}`);
    }
    throw error;
  }
}
