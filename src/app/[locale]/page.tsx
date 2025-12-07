import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function Home() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-[var(--background-elevated)] sm:items-start">
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl font-medium text-[var(--foreground)] italic">
            Hotelius
          </h1>
          <LocaleSwitcher />
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <div className="w-full">
            <h2 className="font-serif text-2xl font-medium mb-4 text-[var(--foreground)]">
              {t('dashboard.navigation.overview')}
            </h2>
            <p className="text-lg leading-8 text-[var(--foreground-muted)] mb-6">
              {t('auth.login.subtitle')}
            </p>
          </div>

          <div className="w-full border-t border-[var(--color-sand)] pt-6">
            <h3 className="font-serif text-xl font-medium mb-4 text-[var(--foreground)]">
              {t('dashboard.metrics.totalBookings')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--color-cream)] rounded-xl">
                <p className="text-sm text-[var(--foreground-muted)]">
                  {t('dashboard.metrics.availableRooms')}
                </p>
                <p className="text-2xl font-semibold text-[var(--color-terracotta)]">24</p>
              </div>
              <div className="p-4 bg-[var(--color-cream)] rounded-xl">
                <p className="text-sm text-[var(--foreground-muted)]">
                  {t('dashboard.metrics.occupancyRate')}
                </p>
                <p className="text-2xl font-semibold text-[var(--color-terracotta)]">78%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full">
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-charcoal)] px-5 text-[var(--color-pearl)] transition-all duration-200 hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] md:w-auto">
            {t('dashboard.actions.newBooking')}
          </button>
          <button className="flex h-12 w-full items-center justify-center rounded-lg border border-[var(--color-sand)] px-5 text-[var(--foreground)] transition-colors hover:bg-[var(--color-cream)] md:w-auto">
            {t('dashboard.actions.viewAll')}
          </button>
        </div>
      </main>
    </div>
  );
}
