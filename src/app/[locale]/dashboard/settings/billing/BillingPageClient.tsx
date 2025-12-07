'use client';

/**
 * Billing Page Client Component
 *
 * Client-side component for managing billing and subscriptions.
 * Handles user interactions for:
 * - Viewing subscription status
 * - Upgrading/downgrading plans
 * - Managing billing portal
 * - Canceling subscriptions
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SubscriptionCard } from '@/components/dashboard/billing/SubscriptionCard';
import { PricingPlans } from '@/components/dashboard/billing/PricingPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt, CreditCard, AlertCircle } from 'lucide-react';
import type { SubscriptionStatusDetails } from '@/lib/stripe/subscriptions';
import type { SubscriptionPlan } from '@/lib/stripe/plans';

interface BillingPageClientProps {
  hotelId: string;
  subscription: SubscriptionStatusDetails;
  currentPlanId?: string;
  plans: SubscriptionPlan[];
  success?: boolean;
  canceled?: boolean;
}

export function BillingPageClient({
  hotelId,
  subscription: initialSubscription,
  currentPlanId,
  plans,
  success,
  canceled,
}: BillingPageClientProps) {
  const router = useRouter();
  const [subscription, setSubscription] = useState(initialSubscription);
  const [isLoading, setIsLoading] = useState(false);

  // Show success/canceled messages
  useEffect(() => {
    if (success) {
      toast.success('Subscription created successfully!', {
        description: 'Your subscription is now active.',
      });
      // Clear query params
      router.replace('/dashboard/settings/billing');
    }
    if (canceled) {
      toast.info('Checkout canceled', {
        description: 'You can subscribe anytime.',
      });
      // Clear query params
      router.replace('/dashboard/settings/billing');
    }
  }, [success, canceled, router]);

  /**
   * Handle plan selection
   */
  const handleSelectPlan = async (
    planId: string,
    priceId: string,
    interval: 'monthly' | 'yearly'
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          hotelId,
          plan: planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      toast.error('Failed to start checkout', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
      setIsLoading(false);
    }
  };

  /**
   * Handle manage subscription (open billing portal)
   */
  const handleManageSubscription = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Failed to create portal session:', error);
      toast.error('Failed to open billing portal', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
      setIsLoading(false);
    }
  };

  /**
   * Handle cancel subscription
   */
  const handleCancelSubscription = async () => {
    // Use billing portal for cancellation
    await handleManageSubscription();
  };

  /**
   * Handle upgrade
   */
  const handleUpgrade = () => {
    // Scroll to pricing plans
    const pricingSection = document.getElementById('pricing-plans');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription, billing information, and invoices
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Plans
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Subscription Card */}
          <SubscriptionCard
            subscription={subscription}
            onManageSubscription={handleManageSubscription}
            onCancelSubscription={handleCancelSubscription}
            onUpgrade={handleUpgrade}
          />

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>View and update your billing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage your payment methods, billing address, and view past invoices in the billing
                portal.
              </p>
              <button
                onClick={handleManageSubscription}
                disabled={isLoading || !subscription.isActive}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="h-4 w-4" />
                Open Billing Portal
              </button>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Billing questions?</p>
                <p className="text-sm text-muted-foreground">
                  Contact our support team at{' '}
                  <a href="mailto:billing@hotelius.com" className="text-primary hover:underline">
                    billing@hotelius.com
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Want to upgrade?</p>
                <p className="text-sm text-muted-foreground">
                  Check out our{' '}
                  <button
                    onClick={handleUpgrade}
                    className="text-primary hover:underline focus:outline-none"
                  >
                    pricing plans
                  </button>{' '}
                  to see what features are available.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <PricingPlans
            plans={plans}
            currentPlanId={currentPlanId}
            onSelectPlan={handleSelectPlan}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
