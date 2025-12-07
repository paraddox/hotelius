'use client';

/**
 * Subscription Card Component
 *
 * Displays current subscription status, plan details, and billing information.
 * Shows:
 * - Current plan name and price
 * - Status badge (active, trialing, past_due, canceled)
 * - Next billing date or trial end date
 * - Actions (manage, cancel, upgrade)
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { CreditCard, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { SubscriptionStatusDetails } from '@/lib/stripe/subscriptions';
import { formatPrice } from '@/lib/stripe/plans';

interface SubscriptionCardProps {
  subscription: SubscriptionStatusDetails;
  onManageSubscription?: () => void;
  onCancelSubscription?: () => void;
  onUpgrade?: () => void;
}

/**
 * Get status badge variant and icon
 */
function getStatusInfo(status: string): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ReactNode;
  label: string;
} {
  switch (status) {
    case 'active':
      return {
        variant: 'default',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Active',
      };
    case 'trialing':
      return {
        variant: 'secondary',
        icon: <Clock className="h-3 w-3" />,
        label: 'Trial',
      };
    case 'past_due':
      return {
        variant: 'destructive',
        icon: <AlertCircle className="h-3 w-3" />,
        label: 'Past Due',
      };
    case 'canceled':
      return {
        variant: 'outline',
        icon: <XCircle className="h-3 w-3" />,
        label: 'Canceled',
      };
    default:
      return {
        variant: 'outline',
        icon: <AlertCircle className="h-3 w-3" />,
        label: status,
      };
  }
}

/**
 * Format date for display
 */
function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function SubscriptionCard({
  subscription,
  onManageSubscription,
  onCancelSubscription,
  onUpgrade,
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const statusInfo = getStatusInfo(subscription.status);

  const handleManageSubscription = async () => {
    if (!onManageSubscription) return;
    setIsLoading(true);
    try {
      await onManageSubscription();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!onCancelSubscription) return;
    setIsLoading(true);
    try {
      await onCancelSubscription();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!onUpgrade) return;
    setIsLoading(true);
    try {
      await onUpgrade();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {subscription.planName || 'Current Plan'}
              </CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </div>
          </div>
          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price */}
        {subscription.amount && (
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-2xl font-bold">
              {formatPrice(subscription.amount, subscription.currency || 'usd')}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </div>
        )}

        {/* Billing Information */}
        <div className="space-y-3 border-t pt-4">
          {/* Trial End Date */}
          {subscription.trialEnd && subscription.status === 'trialing' && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Trial ends</span>
              <span className="text-sm font-medium">{formatDate(subscription.trialEnd)}</span>
            </div>
          )}

          {/* Next Billing Date */}
          {subscription.isActive && subscription.currentPeriodEnd && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? 'Cancels on' : 'Next billing date'}
              </span>
              <span className="text-sm font-medium">
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>
          )}

          {/* Current Period */}
          {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current period</span>
              <span className="text-sm font-medium">
                {formatDate(subscription.currentPeriodStart)} -{' '}
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>
          )}
        </div>

        {/* Warning Messages */}
        {subscription.status === 'past_due' && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Payment Failed</p>
                <p className="text-sm text-muted-foreground">
                  Your last payment failed. Please update your payment method to avoid service
                  interruption.
                </p>
              </div>
            </div>
          </div>
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Subscription Ending
                </p>
                <p className="text-sm text-muted-foreground">
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. You
                  can reactivate it at any time before then.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t pt-4">
          {subscription.isActive && onManageSubscription && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="flex-1"
            >
              Manage Subscription
            </Button>
          )}

          {subscription.isActive && !subscription.cancelAtPeriodEnd && onCancelSubscription && (
            <Button
              variant="ghost"
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel Plan
            </Button>
          )}

          {onUpgrade && (
            <Button onClick={handleUpgrade} disabled={isLoading} className="flex-1">
              {subscription.isActive ? 'Upgrade Plan' : 'Choose Plan'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
