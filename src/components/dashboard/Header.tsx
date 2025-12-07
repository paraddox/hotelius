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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[var(--color-sand)] bg-[var(--background-elevated)] px-4 shadow-[var(--shadow-subtle)] sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-[var(--foreground-muted)] lg:hidden hover:text-[var(--foreground)] transition-colors"
        onClick={onMenuClick}
      >
        <span className="sr-only">{t('openSidebar')}</span>
        <Menu className="h-6 w-6" />
      </button>

      <div className="h-6 w-px bg-[var(--color-sand)] lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <span className="sr-only">{t('viewNotifications')}</span>
            <Bell className="h-6 w-6" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-[var(--color-sand)]" aria-hidden="true" />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 hover:bg-[var(--color-cream-dark)] rounded-full transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="sr-only">{t('openUserMenu')}</span>
              <div className="h-8 w-8 rounded-full bg-[rgba(196,164,132,0.15)] flex items-center justify-center">
                <User className="h-5 w-5 text-[var(--color-terracotta)]" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-medium leading-6 text-[var(--foreground)]">
                  {userEmail || t('user')}
                </span>
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-xl bg-[var(--background-elevated)] py-2 shadow-[var(--shadow-medium)] border border-[var(--color-sand)]">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-x-3 px-4 py-2.5 text-sm text-[var(--foreground-muted)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--foreground)] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <SettingsIcon className="h-4 w-4" />
                  {t('settings')}
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-x-3 px-4 py-2.5 text-sm text-[var(--foreground-muted)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--foreground)] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t('profile')}
                </Link>
                <hr className="my-2 border-[var(--color-sand)]" />
                <button
                  className="flex w-full items-center gap-x-3 px-4 py-2.5 text-sm text-[var(--foreground-muted)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--foreground)] transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // TODO: Implement logout
                  }}
                >
                  <LogOut className="h-4 w-4" />
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
