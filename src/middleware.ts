import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix for all routes
  localePrefix: 'always',

  // Locale detection from Accept-Language header and cookies
  localeDetection: true,
});

export const config = {
  // Match all pathnames except for:
  // - api routes
  // - _next (Next.js internals)
  // - _static (inside /public)
  // - all files inside /public (e.g. /favicon.ico)
  matcher: ['/((?!api|_next|_static|.*\\..*).*)'],
};
