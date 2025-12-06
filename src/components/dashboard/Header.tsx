'use client';

import { Menu, Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
  userEmail?: string;
}

export function Header({ onMenuClick, userEmail }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('dashboard.header');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">{t('openSidebar')}</span>
        <Menu className="h-6 w-6" />
      </button>

      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">{t('viewNotifications')}</span>
            <Bell className="h-6 w-6" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-full"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="sr-only">{t('openUserMenu')}</span>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                  {userEmail || t('user')}
                </span>
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <SettingsIcon className="h-4 w-4 text-gray-400" />
                  {t('settings')}
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="h-4 w-4 text-gray-400" />
                  {t('profile')}
                </Link>
                <hr className="my-2 border-gray-100" />
                <button
                  className="flex w-full items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // TODO: Implement logout
                  }}
                >
                  <LogOut className="h-4 w-4 text-gray-400" />
                  {t('signOut')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
