/**
 * Multi-tenant utilities for hotel reservation system
 *
 * This module provides server and client-side utilities for managing
 * hotel (tenant) context throughout the application.
 *
 * ## Server-side usage:
 * ```tsx
 * import { getTenant } from '@/lib/tenant'
 *
 * export default async function HotelPage({ params }) {
 *   const hotel = await getTenant(params.slug)
 *   if (!hotel) notFound()
 *
 *   return <div>{hotel.name}</div>
 * }
 * ```
 *
 * ## Client-side usage:
 * ```tsx
 * import { TenantProvider, useTenant } from '@/lib/tenant'
 *
 * // Wrap your components
 * <TenantProvider initialHotel={hotel}>
 *   <ClientComponent />
 * </TenantProvider>
 *
 * // Access in client components
 * function ClientComponent() {
 *   const { hotel } = useTenant()
 *   return <div>{hotel?.name}</div>
 * }
 * ```
 */

// Server-side exports
export { getTenant, getTenantById, verifyTenantOwnership } from './getTenant'
export type { Hotel } from './getTenant'

// Multi-tenant SaaS exports (tenants table)
export { getTenantBySlug, getTenantById as getTenantByIdSaaS, getUserTenants } from './get-tenant'
export { TenantProvider as SaaSTenantProvider, useTenant as useSaaSTenant } from './context'
export type { Tenant } from './context'
export { getTenantSlugFromHeaders } from './headers'

// Client-side exports (hotels table)
export { TenantProvider } from './TenantProvider'
export { useTenant, useRequiredTenant, useIsHotelOwner } from './useTenant'
