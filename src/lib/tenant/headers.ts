import { headers } from 'next/headers';

/**
 * Server-side utility to get the tenant slug from request headers
 * This is set by the middleware based on subdomain or path
 *
 * @returns The tenant slug or null if not found
 *
 * @example
 * ```tsx
 * // In a Server Component or API Route
 * import { getTenantSlugFromHeaders } from '@/lib/tenant/headers'
 *
 * export default async function Page() {
 *   const tenantSlug = await getTenantSlugFromHeaders()
 *   if (!tenantSlug) {
 *     return <div>No tenant found</div>
 *   }
 *   return <div>Tenant: {tenantSlug}</div>
 * }
 * ```
 */
export async function getTenantSlugFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-tenant-slug');
}
