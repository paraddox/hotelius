'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Bed,
  DoorOpen,
  DollarSign,
  FileText,
  Settings,
  BookOpen,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const navigationItems = [
  { name: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'bookings', href: '/dashboard/bookings', icon: BookOpen },
  { name: 'calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'roomTypes', href: '/dashboard/room-types', icon: Bed },
  { name: 'rooms', href: '/dashboard/rooms', icon: DoorOpen },
  { name: 'rates', href: '/dashboard/rates', icon: DollarSign },
  { name: 'reports', href: '/dashboard/reports', icon: FileText },
  { name: 'settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('dashboard.sidebar');

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-[var(--color-sand)] bg-[var(--background-elevated)] px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="font-serif text-2xl font-medium italic text-[var(--color-terracotta)]">Hotelius</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 transition-all duration-200
                          ${
                            isActive
                              ? 'bg-[rgba(196,164,132,0.1)] text-[var(--color-terracotta)]'
                              : 'text-[var(--foreground-muted)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--foreground)]'
                          }
                        `}
                      >
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                            isActive ? 'text-[var(--color-terracotta)]' : 'text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]'
                          }`}
                        />
                        {t(item.name)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
