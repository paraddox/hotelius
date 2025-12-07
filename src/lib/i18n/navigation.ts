import { createNavigation } from 'next-intl/navigation';
import { locales } from '@/i18n/config';

/**
 * Shared pathnames navigation utilities for next-intl
 *
 * This provides locale-aware navigation components and hooks:
 * - Link: Drop-in replacement for next/link that automatically handles locales
 * - redirect: Server-side redirect with locale prefix
 * - usePathname: Get the current pathname without the locale prefix
 * - useRouter: Router with locale-aware push/replace methods
 */
export const { Link, redirect, usePathname, useRouter } = createNavigation({ locales });
