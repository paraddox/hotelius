/**
 * Subscription Plan Configuration
 *
 * Defines the available subscription plans for hotels.
 * Update price IDs from your Stripe dashboard.
 *
 * @module lib/stripe/plans
 */

/**
 * Subscription plan configuration
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  priceIdYearly?: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  currency: string;
  features: string[];
  maxRooms?: number;
  maxStaff?: number;
  maxBookings?: number;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  popular?: boolean;
  stripePriceIdMonthly?: string; // Deprecated: use priceId
  stripePriceIdYearly?: string; // Deprecated: use priceIdYearly
}

/**
 * Available subscription plans
 *
 * IMPORTANT: Update these price IDs with your actual Stripe price IDs
 * from your Stripe Dashboard > Products
 *
 * To create these in Stripe:
 * 1. Go to Stripe Dashboard > Products
 * 2. Create a product for each plan
 * 3. Add pricing (monthly and yearly)
 * 4. Copy the price IDs and update below
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small hotels and B&Bs getting started',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
    monthlyPrice: 2900, // $29.00
    yearlyPrice: 29000, // $290.00 (save $58/year)
    currency: 'usd',
    features: [
      'Up to 10 rooms',
      'Up to 3 staff members',
      'Unlimited bookings',
      'Basic calendar view',
      'Email notifications',
      'Mobile responsive',
      'Community support',
      'Basic reporting',
    ],
    maxRooms: 10,
    maxStaff: 3,
    supportLevel: 'community',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing hotels with advanced needs',
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL_MONTHLY || 'price_professional_monthly',
    priceIdYearly:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL_YEARLY || 'price_professional_yearly',
    monthlyPrice: 7900, // $79.00
    yearlyPrice: 79000, // $790.00 (save $158/year)
    currency: 'usd',
    features: [
      'Up to 50 rooms',
      'Up to 10 staff members',
      'Unlimited bookings',
      'Advanced calendar view',
      'Tape chart visualization',
      'Email & SMS notifications',
      'Channel manager integration',
      'Advanced reporting & analytics',
      'Rate plan management',
      'Seasonal pricing',
      'Email support',
      'Custom branding',
    ],
    maxRooms: 50,
    maxStaff: 10,
    supportLevel: 'email',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large hotels and hotel chains',
    priceId:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    priceIdYearly:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
    monthlyPrice: 19900, // $199.00
    yearlyPrice: 199000, // $1,990.00 (save $398/year)
    currency: 'usd',
    features: [
      'Unlimited rooms',
      'Unlimited staff members',
      'Unlimited bookings',
      'All Professional features',
      'Multi-property management',
      'API access',
      'Custom integrations',
      'Advanced analytics & forecasting',
      'Revenue management tools',
      'Priority support',
      'Dedicated account manager',
      'Custom training',
      'SLA guarantee',
    ],
    supportLevel: 'dedicated',
    popular: false,
  },
];

/**
 * Free plan (no subscription required)
 */
export const FREE_PLAN: Omit<SubscriptionPlan, 'priceId' | 'priceIdYearly'> = {
  id: 'free',
  name: 'Free',
  description: 'Try out Hotelius with basic features',
  monthlyPrice: 0,
  currency: 'usd',
  features: [
    'Up to 3 rooms',
    'Up to 1 staff member',
    'Up to 10 bookings per month',
    'Basic calendar view',
    'Email notifications',
    'Community support',
  ],
  maxRooms: 3,
  maxStaff: 1,
  maxBookings: 10,
  supportLevel: 'community',
};

/**
 * Get plan by ID
 *
 * @param planId - Plan identifier
 * @returns Subscription plan or undefined
 */
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

/**
 * Get plan by Stripe price ID
 *
 * @param priceId - Stripe price ID
 * @returns Subscription plan or undefined
 */
export function getPlanByPriceId(priceId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(
    (plan) => plan.priceId === priceId || plan.priceIdYearly === priceId
  );
}

/**
 * Format price for display
 *
 * @param amount - Amount in cents
 * @param currency - Currency code
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

/**
 * Calculate yearly savings
 *
 * @param monthlyPrice - Monthly price in cents
 * @param yearlyPrice - Yearly price in cents
 * @returns Savings amount in cents
 */
export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  return monthlyPrice * 12 - yearlyPrice;
}

/**
 * Get plan limits
 *
 * @param planId - Plan identifier
 * @returns Plan limits object
 */
export function getPlanLimits(planId: string): {
  maxRooms?: number;
  maxStaff?: number;
  maxBookings?: number;
} {
  const plan = getPlanById(planId);
  if (!plan) {
    return FREE_PLAN;
  }

  return {
    maxRooms: plan.maxRooms,
    maxStaff: plan.maxStaff,
    maxBookings: plan.maxBookings,
  };
}

/**
 * Check if plan has feature
 *
 * @param planId - Plan identifier
 * @param feature - Feature name
 * @returns True if plan includes the feature
 */
export function planHasFeature(planId: string, feature: string): boolean {
  const plan = getPlanById(planId);
  if (!plan) {
    return FREE_PLAN.features.includes(feature);
  }
  return plan.features.includes(feature);
}

/**
 * Compare plans
 *
 * @param planId1 - First plan ID
 * @param planId2 - Second plan ID
 * @returns Negative if plan1 < plan2, positive if plan1 > plan2, 0 if equal
 */
export function comparePlans(planId1: string, planId2: string): number {
  const plan1 = getPlanById(planId1);
  const plan2 = getPlanById(planId2);

  if (!plan1 || !plan2) return 0;

  return plan1.monthlyPrice - plan2.monthlyPrice;
}

/**
 * Get plan tier index (0 = free, 1 = starter, 2 = professional, 3 = enterprise)
 *
 * @param planId - Plan identifier
 * @returns Tier index
 */
export function getPlanTier(planId: string): number {
  const tiers = ['free', 'starter', 'professional', 'enterprise'];
  return tiers.indexOf(planId);
}

/**
 * Check if upgrade is available
 *
 * @param currentPlanId - Current plan ID
 * @param targetPlanId - Target plan ID
 * @returns True if target plan is an upgrade
 */
export function isUpgrade(currentPlanId: string, targetPlanId: string): boolean {
  return getPlanTier(targetPlanId) > getPlanTier(currentPlanId);
}

/**
 * Check if downgrade
 *
 * @param currentPlanId - Current plan ID
 * @param targetPlanId - Target plan ID
 * @returns True if target plan is a downgrade
 */
export function isDowngrade(currentPlanId: string, targetPlanId: string): boolean {
  return getPlanTier(targetPlanId) < getPlanTier(currentPlanId);
}
