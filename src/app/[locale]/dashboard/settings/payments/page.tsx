import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { CreditCard, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

// Mock data
const mockStripeData = {
  isConnected: true,
  accountStatus: 'active',
  chargesEnabled: true,
  payoutsEnabled: true,
  accountId: 'acct_1234567890',
  lastPayout: {
    amount: 1250.00,
    date: '2025-11-28',
    status: 'paid',
  },
  nextPayout: {
    amount: 850.00,
    date: '2025-12-05',
  },
};

export default async function SettingsPaymentsPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.settings.payments');

  return (
    <div className="space-y-6">
      {/* Stripe Connection Status */}
      <div className="bg-[var(--background-elevated)] shadow rounded-xl border border-[var(--color-sand)] transition-all duration-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-medium text-[var(--foreground)]">{t('stripe.title')}</h2>
            {mockStripeData.isConnected ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-success)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-success)]">
                <CheckCircle className="h-4 w-4" />
                {t('stripe.connected')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-warning)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-warning)]">
                <AlertCircle className="h-4 w-4" />
                {t('stripe.notConnected')}
              </span>
            )}
          </div>

          {mockStripeData.isConnected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border border-[var(--color-sand)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-[var(--foreground-muted)]" />
                    <h3 className="text-sm font-medium text-[var(--foreground)]">{t('stripe.accountStatus')}</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[var(--foreground)] capitalize">
                    {mockStripeData.accountStatus}
                  </p>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {mockStripeData.chargesEnabled ? (
                        <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-[var(--color-error)]" />
                      )}
                      <span className="text-[var(--foreground-muted)]">{t('stripe.chargesEnabled')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {mockStripeData.payoutsEnabled ? (
                        <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-[var(--color-error)]" />
                      )}
                      <span className="text-[var(--foreground-muted)]">{t('stripe.payoutsEnabled')}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-[var(--color-sand)] rounded-lg p-4">
                  <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">{t('stripe.accountId')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)] font-mono break-all">
                    {mockStripeData.accountId}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-sand)]">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-elevated)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--color-sand)] hover:bg-[var(--color-sand)]/30 transition-all duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('stripe.viewDashboard')}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-elevated)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--color-sand)] hover:bg-[var(--color-sand)]/30 transition-all duration-200"
                >
                  {t('stripe.updateAccount')}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
              <h3 className="mt-2 text-sm font-semibold text-[var(--foreground)]">{t('stripe.notConnectedTitle')}</h3>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">{t('stripe.notConnectedDescription')}</p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-charcoal)] px-4 py-2 text-sm font-semibold text-[var(--color-pearl)] shadow-sm hover:bg-[var(--color-slate)] transition-all duration-200"
              >
                {t('stripe.connectStripe')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payout Information */}
      {mockStripeData.isConnected && (
        <div className="bg-[var(--background-elevated)] shadow rounded-xl border border-[var(--color-sand)] transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-serif font-medium text-[var(--foreground)] mb-4">{t('payouts.title')}</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Last Payout */}
              <div className="border border-[var(--color-sand)] rounded-lg p-4">
                <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-2">{t('payouts.last')}</h3>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  ${mockStripeData.lastPayout.amount.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <span>{mockStripeData.lastPayout.date}</span>
                  <span className="inline-flex items-center rounded-full bg-[var(--color-success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-success)]">
                    {mockStripeData.lastPayout.status}
                  </span>
                </div>
              </div>

              {/* Next Payout */}
              <div className="border border-[var(--color-sand)] rounded-lg p-4">
                <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-2">{t('payouts.next')}</h3>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  ${mockStripeData.nextPayout.amount.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  {t('payouts.scheduledFor')} {mockStripeData.nextPayout.date}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-sand)]">
              <button
                type="button"
                className="text-sm font-medium text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] transition-all duration-200"
              >
                {t('payouts.viewHistory')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {mockStripeData.isConnected && (
        <div className="bg-[var(--background-elevated)] shadow rounded-xl border border-[var(--color-sand)] transition-all duration-200">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-serif font-medium text-[var(--foreground)] mb-4">{t('settings.title')}</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--color-sand)]">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">{t('settings.applicationFee')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">{t('settings.applicationFeeDesc')}</p>
                </div>
                <span className="text-sm font-semibold text-[var(--foreground)]">5%</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[var(--color-sand)]">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">{t('settings.paymentMethods')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">{t('settings.paymentMethodsDesc')}</p>
                </div>
                <span className="text-sm text-[var(--foreground-muted)]">Card, Bank</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">{t('settings.currency')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">{t('settings.currencyDesc')}</p>
                </div>
                <span className="text-sm text-[var(--foreground-muted)]">USD</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
