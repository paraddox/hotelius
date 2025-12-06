import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function Home() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Hotelius
          </h1>
          <LocaleSwitcher />
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
              {t('dashboard.navigation.overview')}
            </h2>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400 mb-6">
              {t('auth.login.subtitle')}
            </p>
          </div>

          <div className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              {t('dashboard.metrics.totalBookings')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t('dashboard.metrics.availableRooms')}
                </p>
                <p className="text-2xl font-semibold text-black dark:text-zinc-50">24</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t('dashboard.metrics.occupancyRate')}
                </p>
                <p className="text-2xl font-semibold text-black dark:text-zinc-50">78%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full">
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-auto">
            {t('dashboard.actions.newBooking')}
          </button>
          <button className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-auto">
            {t('dashboard.actions.viewAll')}
          </button>
        </div>
      </main>
    </div>
  );
}
