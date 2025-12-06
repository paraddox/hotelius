'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Palette, FileText, Users, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';

const settingsNavigation = [
  { name: 'general', href: '/dashboard/settings', icon: Settings, exact: true },
  { name: 'branding', href: '/dashboard/settings/branding', icon: Palette },
  { name: 'policies', href: '/dashboard/settings/policies', icon: FileText },
  { name: 'team', href: '/dashboard/settings/team', icon: Users },
  { name: 'payments', href: '/dashboard/settings/payments', icon: CreditCard },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('dashboard.settings');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-700">{t('subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <nav className="lg:w-64 flex-shrink-0">
          <ul className="space-y-1 bg-white rounded-lg shadow p-4 border border-gray-200">
            {settingsNavigation.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    {t(`nav.${item.name}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
