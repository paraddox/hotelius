'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Loader2, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface ConnectOnboardingProps {
  hotelId: string;
  stripeAccountId?: string | null;
  onboardingComplete?: boolean;
  onAccountCreated?: () => void;
}

export default function ConnectOnboarding({
  hotelId,
  stripeAccountId,
  onboardingComplete = false,
  onAccountCreated,
}: ConnectOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Check for return from Stripe onboarding
  useEffect(() => {
    const onboardingSuccess = searchParams.get('success');
    const onboardingRefresh = searchParams.get('refresh');

    if (onboardingSuccess === 'true') {
      setSuccess('Your payment account has been successfully set up!');
      onAccountCreated?.();
    } else if (onboardingRefresh === 'true') {
      setError('The onboarding link has expired. Please try again.');
    }
  }, [searchParams, onAccountCreated]);

  const handleCreateAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create Stripe Connect account
      const createResponse = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          country: 'US', // TODO: Make this configurable based on hotel location
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const { accountId } = await createResponse.json();

      // Create account link for onboarding
      const linkResponse = await fetch('/api/stripe/connect/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId }),
      });

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json();
        throw new Error(errorData.error || 'Failed to create onboarding link');
      }

      const { url } = await linkResponse.json();

      // Redirect to Stripe onboarding
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleContinueOnboarding = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/connect/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create onboarding link');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  // If onboarding is complete, don't show this component
  if (onboardingComplete && stripeAccountId) {
    return null;
  }

  // If account exists but onboarding not complete
  if (stripeAccountId && !onboardingComplete) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle>Complete Payment Setup</CardTitle>
              <CardDescription>Finish setting up your payment account to start accepting bookings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-sm text-[#5C5C5C] leading-relaxed">
              Your payment account has been created, but you need to complete the onboarding process
              with Stripe to start receiving payments.
            </p>

            <button
              onClick={handleContinueOnboarding}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2C2C2C] px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Continue Setup</span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No account exists yet
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-blue-200">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Set Up Payments</CardTitle>
            <CardDescription>Connect your payment account to start accepting bookings</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-[#5C5C5C] leading-relaxed">
            To accept guest bookings and receive payments, you need to set up a payment account with Stripe.
            This secure process takes just a few minutes.
          </p>

          <div className="rounded-lg bg-[#F8F6F3] border border-[#E8E0D5] p-4">
            <h4 className="font-['Cormorant_Garamond',Georgia,serif] text-base font-medium text-[#2C2C2C] mb-3">
              What you'll need:
            </h4>
            <ul className="space-y-2 text-sm text-[#5C5C5C]">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#C4A484] mt-0.5 flex-shrink-0" />
                <span>Business or personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#C4A484] mt-0.5 flex-shrink-0" />
                <span>Bank account details for payouts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-[#C4A484] mt-0.5 flex-shrink-0" />
                <span>Tax identification information</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2C2C2C] px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Set Up Payments</span>
              </>
            )}
          </button>

          <p className="text-xs text-[#8B8B8B]">
            By clicking "Set Up Payments", you'll be redirected to Stripe to complete the secure onboarding process.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
