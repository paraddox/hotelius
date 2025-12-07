'use client';

/**
 * Pricing Plans Component
 *
 * Displays available subscription plans with features and pricing.
 * Allows users to select and subscribe to a plan.
 *
 * Features:
 * - Monthly/Yearly billing toggle
 * - Feature comparison
 * - Current plan highlighting
 * - Upgrade/Downgrade actions
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan } from '@/lib/stripe/plans';
import { formatPrice, calculateYearlySavings } from '@/lib/stripe/plans';

interface PricingPlansProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string;
  billingInterval?: 'monthly' | 'yearly';
  onSelectPlan?: (planId: string, priceId: string, interval: 'monthly' | 'yearly') => void;
  isLoading?: boolean;
}

export function PricingPlans({
  plans,
  currentPlanId,
  billingInterval = 'monthly',
  onSelectPlan,
  isLoading = false,
}: PricingPlansProps) {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>(billingInterval);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!onSelectPlan) return;

    const priceId = interval === 'yearly' ? plan.priceIdYearly || plan.priceId : plan.priceId;
    onSelectPlan(plan.id, priceId, interval);
  };

  const isCurrentPlan = (planId: string) => planId === currentPlanId;

  return (
    <div className="space-y-8">
      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border bg-muted p-1">
          <button
            onClick={() => setInterval('monthly')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              interval === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              interval === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Yearly
            {plans[0]?.yearlyPrice && (
              <span className="ml-1 text-xs text-green-600 dark:text-green-400">
                Save{' '}
                {Math.round(
                  (calculateYearlySavings(plans[0].monthlyPrice, plans[0].yearlyPrice) /
                    (plans[0].monthlyPrice * 12)) *
                    100
                )}
                %
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          const pricePerMonth =
            interval === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice / 12 : plan.monthlyPrice;
          const isCurrent = isCurrentPlan(plan.id);
          const savings =
            interval === 'yearly' && plan.yearlyPrice
              ? calculateYearlySavings(plan.monthlyPrice, plan.yearlyPrice)
              : 0;

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden transition-shadow hover:shadow-lg',
                plan.popular && 'border-primary',
                isCurrent && 'ring-2 ring-primary'
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute right-4 top-4">
                  <Badge className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Popular
                  </Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrent && (
                <div className="absolute left-4 top-4">
                  <Badge variant="secondary">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[3rem]">{plan.description}</CardDescription>

                <div className="pt-4">
                  {price !== undefined && (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">
                          {formatPrice(pricePerMonth, plan.currency)}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>

                      {interval === 'yearly' && plan.yearlyPrice && (
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Billed {formatPrice(plan.yearlyPrice, plan.currency)} yearly
                          </p>
                          {savings > 0 && (
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                              Save {formatPrice(savings, plan.currency)} per year
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Action Button */}
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isLoading || isCurrent}
                  className="w-full"
                  variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                >
                  {isLoading
                    ? 'Loading...'
                    : isCurrent
                      ? 'Current Plan'
                      : `Get ${plan.name}`}
                </Button>

                {/* Features */}
                <div className="space-y-3 border-t pt-4">
                  <p className="text-sm font-medium">What's included:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits */}
                {(plan.maxRooms || plan.maxStaff || plan.maxBookings) && (
                  <div className="space-y-2 border-t pt-4">
                    <p className="text-sm font-medium">Plan limits:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {plan.maxRooms && (
                        <li>
                          {plan.maxRooms === Infinity ? 'Unlimited' : `Up to ${plan.maxRooms}`}{' '}
                          rooms
                        </li>
                      )}
                      {plan.maxStaff && (
                        <li>
                          {plan.maxStaff === Infinity ? 'Unlimited' : `Up to ${plan.maxStaff}`}{' '}
                          staff
                        </li>
                      )}
                      {plan.maxBookings && (
                        <li>
                          {plan.maxBookings === Infinity
                            ? 'Unlimited'
                            : `Up to ${plan.maxBookings}`}{' '}
                          bookings/month
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Support Level */}
                <div className="border-t pt-4">
                  <p className="text-sm">
                    <span className="font-medium">Support: </span>
                    <span className="text-muted-foreground">
                      {plan.supportLevel === 'dedicated'
                        ? 'Dedicated account manager'
                        : plan.supportLevel === 'priority'
                          ? 'Priority support'
                          : plan.supportLevel === 'email'
                            ? 'Email support'
                            : 'Community support'}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="rounded-lg border bg-muted/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include a <span className="font-medium text-foreground">14-day free trial</span>
          . No credit card required to start. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
