'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
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
import { useEffect } from 'react';

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

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const t = useTranslations('dashboard.sidebar');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-gray-900/80 lg:hidden" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 lg:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Hotelius</h1>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close menu</span>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6">
          <ul role="list" className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon
                      className={`h-6 w-6 shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                      }`}
                    />
                    {t(item.name)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
