import { requireAuth } from '@/lib/auth/requireAuth';
import { createClient } from '@/lib/supabase/server';
import { BillingPageClient } from './BillingPageClient';
import { getSubscriptionStatus } from '@/lib/stripe/subscriptions';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/plans';
import { redirect } from 'next/navigation';

/**
 * Billing Settings Page
 *
 * Displays subscription status, plan details, and billing management options.
 * Server component that fetches subscription data and passes to client component.
 */
export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string };
}) {
  // Require authentication
  const user = await requireAuth();

  // Get Supabase client
  const supabase = await createClient();

  // Get user's hotel
  const { data: hotel, error: hotelError } = await supabase
    .from('hotels')
    .select('id, name, owner_id, subscription_status, stripe_customer_id')
    .eq('owner_id', user.id)
    .single();

  if (hotelError || !hotel) {
    redirect('/dashboard');
  }

  // Get subscription status
  let subscriptionStatus;
  try {
    subscriptionStatus = await getSubscriptionStatus(hotel.id);
  } catch (error) {
    console.error('Failed to fetch subscription status:', error);
    subscriptionStatus = {
      status: 'canceled' as const,
      isActive: false,
      currentPeriodEnd: null,
      currentPeriodStart: null,
      cancelAtPeriodEnd: false,
      trialEnd: null,
      planId: null,
      planName: null,
      amount: null,
      currency: null,
    };
  }

  // Determine current plan
  const currentPlan = SUBSCRIPTION_PLANS.find(
    (plan) => plan.priceId === subscriptionStatus.planId
  );

  return (
    <BillingPageClient
      hotelId={hotel.id}
      subscription={subscriptionStatus}
      currentPlanId={currentPlan?.id}
      plans={SUBSCRIPTION_PLANS}
      success={searchParams.success === 'true'}
      canceled={searchParams.canceled === 'true'}
    />
  );
}
