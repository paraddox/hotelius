'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, ExternalLink, Loader2, CreditCard, ArrowRightLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import type { ConnectStatus as ConnectStatusType } from '@/lib/stripe-types';

interface ConnectStatusProps {
  hotelId: string;
  stripeAccountId: string;
}

export default function ConnectStatus({ hotelId, stripeAccountId }: ConnectStatusProps) {
  const [status, setStatus] = useState<ConnectStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    fetchAccountStatus();
  }, [hotelId]);

  const fetchAccountStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stripe/connect/account-status?hotelId=${hotelId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch account status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setDashboardLoading(true);
    try {
      const response = await fetch('/api/stripe/connect/dashboard-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create dashboard link');
      }

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDashboardLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#C4A484]" />
            <p className="text-sm text-[#8B8B8B]">Loading account status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-start gap-3 rounded-xl bg-[rgba(196,92,92,0.1)] border border-[var(--color-error)] p-4">
            <AlertCircle className="h-5 w-5 text-[var(--color-error)] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--color-error)]">Failed to load account status</p>
              <p className="text-sm text-[var(--color-error)] opacity-80 mt-1">{error || 'Unknown error'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = ({ enabled }: { enabled: boolean }) => {
    if (enabled) return <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />;
    return <XCircle className="h-5 w-5 text-[var(--color-error)]" />;
  };

  const CapabilityBadge = ({ status: capStatus }: { status: 'active' | 'inactive' | 'pending' }) => {
    const colors = {
      active: 'bg-[rgba(74,124,89,0.1)] border-[var(--color-success)] text-[var(--color-success)]',
      pending: 'bg-[rgba(196,164,132,0.15)] border-[var(--color-terracotta)] text-[var(--color-terracotta)]',
      inactive: 'bg-[var(--color-cream)] border-[var(--color-sand)] text-[var(--foreground-muted)]',
    };

    const labels = {
      active: 'Active',
      pending: 'Pending',
      inactive: 'Inactive',
    };

    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[capStatus]}`}>
        {labels[capStatus]}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
              status.chargesEnabled && status.payoutsEnabled
                ? 'bg-[rgba(74,124,89,0.1)] border-[var(--color-success)]'
                : 'bg-[rgba(196,164,132,0.15)] border-[var(--color-terracotta)]'
            }`}>
              <CheckCircle className={`h-6 w-6 ${
                status.chargesEnabled && status.payoutsEnabled
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-terracotta)]'
              }`} />
            </div>
            <div>
              <CardTitle>Payment Account Status</CardTitle>
              <CardDescription>Your Stripe Connect account details</CardDescription>
            </div>
          </div>

          <button
            onClick={handleOpenDashboard}
            disabled={dashboardLoading || !status.detailsSubmitted}
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#E8E0D5] px-4 py-2 text-sm font-medium text-[#2C2C2C] hover:bg-[#F8F6F3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {dashboardLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                <span>Open Dashboard</span>
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {status.requiresInformation && (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Action Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  {status.pastDue.length > 0
                    ? 'Your account has overdue requirements. Please update your information to continue accepting payments.'
                    : 'Additional information is needed to complete your account setup.'}
                </p>
                {status.currentlyDue.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-amber-800">Required information:</p>
                    <ul className="mt-1 text-xs text-amber-700 list-disc list-inside">
                      {status.currentlyDue.slice(0, 5).map((item, index) => (
                        <li key={index}>{item.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Account ID */}
          <div>
            <h4 className="text-sm font-medium text-[#2C2C2C] mb-2">Account ID</h4>
            <code className="text-sm text-[#5C5C5C] bg-[#F8F6F3] border border-[#E8E0D5] px-3 py-1.5 rounded-lg font-mono">
              {stripeAccountId}
            </code>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-sm font-medium text-[#2C2C2C] mb-3">Account Capabilities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#E8E0D5] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#C4A484]" />
                    <span className="text-sm font-medium text-[#2C2C2C]">Card Payments</span>
                  </div>
                  <CapabilityBadge status={status.capabilities.cardPayments} />
                </div>
                <p className="text-xs text-[#8B8B8B]">
                  Accept credit and debit card payments from guests
                </p>
              </div>

              <div className="rounded-lg border border-[#E8E0D5] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-[#C4A484]" />
                    <span className="text-sm font-medium text-[#2C2C2C]">Transfers</span>
                  </div>
                  <CapabilityBadge status={status.capabilities.transfers} />
                </div>
                <p className="text-xs text-[#8B8B8B]">
                  Receive payouts to your bank account
                </p>
              </div>
            </div>
          </div>

          {/* Status Checklist */}
          <div>
            <h4 className="text-sm font-medium text-[#2C2C2C] mb-3">Setup Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 py-2">
                <StatusIcon enabled={status.detailsSubmitted} />
                <span className="text-sm text-[#5C5C5C]">
                  Account details submitted
                </span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <StatusIcon enabled={status.chargesEnabled} />
                <span className="text-sm text-[#5C5C5C]">
                  Charges enabled
                </span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <StatusIcon enabled={status.payoutsEnabled} />
                <span className="text-sm text-[#5C5C5C]">
                  Payouts enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
