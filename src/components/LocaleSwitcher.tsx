'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { locales, localeNames, type Locale } from '@/i18n/config';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentLocale = (params?.locale as Locale) || 'en';

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    // Get the current path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');

    // Build the new path with the new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    startTransition(() => {
      router.push(newPath);
      router.refresh();
    });
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        disabled={isPending}
        className="appearance-none bg-[var(--background-elevated)] border border-[var(--color-sand)] rounded-lg px-4 py-2 pr-10 text-sm font-medium text-[var(--foreground)] hover:border-[var(--color-terracotta)] focus:outline-none focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Select language"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--foreground-muted)]">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/50 rounded-lg">
          <div className="animate-spin h-4 w-4 border-2 border-[var(--color-terracotta)] border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
