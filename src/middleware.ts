import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix for all routes
  localePrefix: 'always',

  // Locale detection from Accept-Language header and cookies
  localeDetection: true,
});

export default async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Extract tenant slug from subdomain or path
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Extract tenant slug from subdomain (e.g., hotel-name.example.com)
  let tenantSlug: string | null = null;

  // Check for subdomain-based tenant routing
  const subdomain = hostname.split('.')[0];
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  // On production, extract tenant from subdomain (skip www and base domain)
  if (!isLocalhost && subdomain && subdomain !== 'www' && subdomain !== hostname.split('.').slice(-2).join('.')) {
    tenantSlug = subdomain;
  }

  // Alternatively, check for path-based tenant routing (e.g., /tenant/hotel-name/...)
  const pathMatch = pathname.match(/^\/tenant\/([^\/]+)/);
  if (pathMatch) {
    tenantSlug = pathMatch[1];
  }

  // Add tenant slug to headers for use in server components and API routes
  const requestHeaders = new Headers(request.headers);
  if (tenantSlug) {
    requestHeaders.set('x-tenant-slug', tenantSlug);
  }

  // Call the next-intl middleware
  const response = intlMiddleware(request);

  // If we have a tenant slug, add it to the response headers
  if (tenantSlug && response) {
    response.headers.set('x-tenant-slug', tenantSlug);
  }

  return response;
}

export const config = {
  // Match all pathnames except for:
  // - api routes
  // - _next (Next.js internals)
  // - _static (inside /public)
  // - all files inside /public (e.g. /favicon.ico)
  matcher: ['/((?!api|_next|_static|.*\\..*).*)'],
};
