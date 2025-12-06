# Multi-Tenant Context System

A comprehensive multi-tenant system for the Hotelius hotel reservation SaaS application. This module provides utilities for managing both hotel (tenant) context and SaaS multi-tenancy across server and client components.

## Overview

The tenant system supports two use cases:

1. **Hotel Booking System**: Public booking engine at `/hotels/[slug]/` to load hotel data (uses `hotels` table)
2. **SaaS Multi-Tenancy**: Subdomain or path-based tenant routing for the SaaS platform (uses `tenants` table)

Each tenant/hotel is identified by a unique slug in the URL, subdomain, or path.

## Features

- Server-side hotel data fetching with React cache
- Client-side context provider with real-time updates
- TypeScript type safety with Supabase types
- Automatic session management via Supabase
- Hotel ownership verification utilities
- Error handling and loading states
- **NEW**: Subdomain and path-based multi-tenant routing
- **NEW**: Tenant slug extraction from middleware
- **NEW**: Support for `tenants` table with subscription management

## File Structure

```
src/lib/tenant/
├── getTenant.ts         # Server-side utilities (hotels table)
├── TenantProvider.tsx   # Client-side context provider (hotels table)
├── useTenant.ts         # Client-side hooks (hotels table)
├── context.tsx          # NEW: SaaS tenant context (tenants table)
├── get-tenant.ts        # NEW: SaaS tenant server utilities (tenants table)
├── headers.ts           # NEW: Tenant slug extraction from headers
├── index.ts            # Public exports
└── README.md           # This file
```

## Database Setup

Before using the tenant utilities, you need to add the `slug` column to your `hotels` table:

### SQL Migration

```sql
-- Add slug column to hotels table
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug);

-- Add constraint to ensure slug is not null
ALTER TABLE hotels ALTER COLUMN slug SET NOT NULL;

-- Optional: Generate slugs for existing hotels
-- UPDATE hotels SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
```

Run this migration in your Supabase SQL editor or via a migration file.

### SaaS Multi-Tenancy Setup

For SaaS multi-tenant routing, create the `tenants` table:

```sql
-- Create tenants table for SaaS multi-tenancy
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial',
  subscription_tier TEXT NOT NULL DEFAULT 'starter',
  owner_id UUID REFERENCES auth.users(id)
);

-- Create tenant_users junction table for multi-user tenants
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
```

## Usage

### Multi-Tenant Routing (SaaS)

The middleware automatically extracts tenant slugs from:
- **Subdomain**: `tenant-name.yourdomain.com` → tenant slug: `tenant-name`
- **Path**: `/tenant/tenant-name/...` → tenant slug: `tenant-name`

The tenant slug is added to request headers as `x-tenant-slug` and can be accessed in server components and API routes.

#### Using Tenant Routing in Server Components

```tsx
import { getTenantSlugFromHeaders, getTenantBySlug, SaaSTenantProvider } from '@/lib/tenant'
import { notFound } from 'next/navigation'

export default async function TenantPage() {
  // Get tenant slug from middleware headers
  const tenantSlug = await getTenantSlugFromHeaders()

  if (!tenantSlug) {
    return <div>No tenant found</div>
  }

  // Fetch tenant data
  const tenant = await getTenantBySlug(tenantSlug)

  if (!tenant) {
    notFound()
  }

  return (
    <SaaSTenantProvider tenant={tenant}>
      <div>
        <h1>{tenant.name}</h1>
        <p>Subscription: {tenant.subscription_tier}</p>
      </div>
    </SaaSTenantProvider>
  )
}
```

#### Using Tenant Context in Client Components

```tsx
'use client'

import { useSaaSTenant } from '@/lib/tenant'

export default function DashboardHeader() {
  const { tenant, isLoading } = useSaaSTenant()

  if (isLoading) return <div>Loading...</div>
  if (!tenant) return null

  return (
    <header style={{ backgroundColor: tenant.primary_color }}>
      {tenant.logo_url && <img src={tenant.logo_url} alt={tenant.name} />}
      <h1>{tenant.name}</h1>
    </header>
  )
}
```

#### Getting User's Tenants

```tsx
import { getUserTenants } from '@/lib/tenant'

export default async function TenantsPage() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userTenants = await getUserTenants(user.id)

  return (
    <div>
      <h1>Your Organizations</h1>
      {userTenants.map(({ tenant, role }) => (
        <div key={tenant.id}>
          <h2>{tenant.name}</h2>
          <p>Role: {role}</p>
          <a href={`https://${tenant.slug}.yourdomain.com`}>Visit</a>
        </div>
      ))}
    </div>
  )
}
```

## Usage (Hotels)

### Server Components

Use `getTenant` to fetch hotel data in Server Components, Server Actions, or Route Handlers:

```tsx
import { getTenant } from '@/lib/tenant'
import { notFound } from 'next/navigation'

export default async function HotelPage({
  params
}: {
  params: { slug: string }
}) {
  const hotel = await getTenant(params.slug)

  if (!hotel) {
    notFound()
  }

  return (
    <div>
      <h1>{hotel.name}</h1>
      <p>{hotel.description}</p>
      <p>{hotel.city}, {hotel.country}</p>
    </div>
  )
}
```

### Client Components

Wrap your client components with `TenantProvider` and use the `useTenant` hook:

```tsx
// In a Server Component or Layout
import { getTenant } from '@/lib/tenant'
import { TenantProvider } from '@/lib/tenant'
import ClientComponent from './ClientComponent'

export default async function HotelLayout({
  params,
  children
}: {
  params: { slug: string }
  children: React.ReactNode
}) {
  const hotel = await getTenant(params.slug)

  return (
    <TenantProvider initialHotel={hotel}>
      <ClientComponent />
      {children}
    </TenantProvider>
  )
}
```

```tsx
// In a Client Component
'use client'

import { useTenant } from '@/lib/tenant'

export default function ClientComponent() {
  const { hotel, loading, error } = useTenant()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!hotel) return <div>Hotel not found</div>

  return <div>Welcome to {hotel.name}</div>
}
```

## API Reference

### Server-side Functions

#### `getTenant(slug: string)`

Fetches hotel data by slug. Cached per request using React cache.

**Parameters:**
- `slug` - The hotel's unique slug from the URL

**Returns:** `Promise<Hotel | null>`

**Example:**
```tsx
const hotel = await getTenant('grand-plaza-hotel')
```

#### `getTenantById(hotelId: string)`

Fetches hotel data by ID. Useful for authenticated routes.

**Parameters:**
- `hotelId` - The hotel's UUID

**Returns:** `Promise<Hotel | null>`

#### `verifyTenantOwnership(hotelId: string, userId: string)`

Verifies that a user owns a specific hotel.

**Parameters:**
- `hotelId` - The hotel's UUID
- `userId` - The user's UUID

**Returns:** `Promise<boolean>`

**Example:**
```tsx
const isOwner = await verifyTenantOwnership(hotelId, user.id)
if (!isOwner) {
  redirect('/unauthorized')
}
```

### Client-side Components & Hooks

#### `<TenantProvider>`

React context provider for hotel data.

**Props:**
- `children` - React children
- `initialHotel?` - Hotel data from server (recommended for SSR)
- `slug?` - Hotel slug for client-side fetching

**Example:**
```tsx
<TenantProvider initialHotel={hotel}>
  <YourComponents />
</TenantProvider>
```

#### `useTenant()`

Hook to access hotel context in client components.

**Returns:**
```tsx
{
  hotel: Hotel | null
  loading: boolean
  error: string | null
  refreshHotel: () => Promise<void>
}
```

**Example:**
```tsx
const { hotel, loading, error, refreshHotel } = useTenant()
```

#### `useRequiredTenant()`

Hook that throws if hotel is not available. Useful for components that require hotel data.

**Returns:** `Hotel` (never null)

**Throws:** Error if hotel is loading, has error, or not found

**Example:**
```tsx
const hotel = useRequiredTenant() // Guaranteed to be non-null
```

#### `useIsHotelOwner(userId: string | undefined)`

Hook to check if current user owns the hotel.

**Parameters:**
- `userId` - Current user's ID

**Returns:** `boolean`

**Example:**
```tsx
const isOwner = useIsHotelOwner(user?.id)
if (!isOwner) {
  return <div>Access denied</div>
}
```

## Real-time Updates

The `TenantProvider` automatically subscribes to hotel updates via Supabase Realtime. When hotel data changes in the database, the context updates automatically.

## Caching Strategy

- **Server-side**: Uses React `cache()` to deduplicate requests within a single render
- **Client-side**: Maintains state and subscribes to real-time updates
- Hotel data is cached per request on the server to avoid redundant database queries

## Error Handling

All functions include error handling:

- Server functions return `null` on error and log to console
- Client hooks provide `error` state for UI handling
- TypeScript ensures type safety throughout

## Type Safety

All utilities are fully typed using the Database types from `@/types/database.ts`:

```tsx
import type { Tables } from '@/types/database'

type Hotel = Tables<'hotels'>
```

## Best Practices

1. **Always use SSR when possible**: Pass `initialHotel` to `TenantProvider` for better performance
2. **Handle loading and error states**: Check for loading/error before rendering hotel data
3. **Use `useRequiredTenant` carefully**: Only in components where hotel is guaranteed to exist
4. **Verify ownership**: Use `verifyTenantOwnership` before allowing modifications
5. **Leverage caching**: Server-side fetches are automatically cached per request

## Example: Complete Page Flow

```tsx
// app/hotels/[slug]/page.tsx (Server Component)
import { getTenant } from '@/lib/tenant'
import { TenantProvider } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import BookingForm from './BookingForm'

export default async function HotelBookingPage({
  params
}: {
  params: { slug: string }
}) {
  const hotel = await getTenant(params.slug)

  if (!hotel || !hotel.is_active) {
    notFound()
  }

  return (
    <TenantProvider initialHotel={hotel}>
      <div>
        <h1>{hotel.name}</h1>
        <p>{hotel.description}</p>
        <BookingForm />
      </div>
    </TenantProvider>
  )
}
```

```tsx
// BookingForm.tsx (Client Component)
'use client'

import { useTenant } from '@/lib/tenant'

export default function BookingForm() {
  const { hotel, loading } = useTenant()

  if (loading || !hotel) return null

  return (
    <form>
      <h2>Book at {hotel.name}</h2>
      {/* Form fields */}
    </form>
  )
}
```

## Troubleshooting

### "Hotel not found" error
- Verify the slug exists in the database
- Check that `is_active` is `true` for the hotel
- Ensure the slug column has been added to your database

### Real-time updates not working
- Verify Supabase Realtime is enabled for the `hotels` table
- Check your Supabase project settings for Realtime configuration

### Type errors
- Ensure you've regenerated database types if schema changed
- Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID`

## Middleware Configuration

The middleware in `src/middleware.ts` handles:

1. **Locale detection** using next-intl
2. **Tenant slug extraction** from subdomain or path
3. **Header propagation** to make tenant slug available in server components

### How it works:

```typescript
// Extracts tenant slug from:
// 1. Subdomain: hotel-abc.yourdomain.com → "hotel-abc"
// 2. Path: /tenant/hotel-abc/dashboard → "hotel-abc"
// 3. Localhost: Skipped (for development)

// Sets header: x-tenant-slug
// Access in server components: await getTenantSlugFromHeaders()
```

### Local Development

For local development with subdomains:
1. Update your `/etc/hosts` file:
   ```
   127.0.0.1 tenant1.localhost
   127.0.0.1 tenant2.localhost
   ```
2. Access via: `http://tenant1.localhost:3000`

Alternatively, use path-based routing: `http://localhost:3000/tenant/tenant-name`

## API Reference (SaaS Multi-Tenancy)

### Server-side Functions

#### `getTenantSlugFromHeaders()`

Extracts the tenant slug from request headers set by middleware.

**Returns:** `Promise<string | null>`

**Example:**
```tsx
const tenantSlug = await getTenantSlugFromHeaders()
```

#### `getTenantBySlug(slug: string)`

Fetches tenant data by slug from the `tenants` table.

**Parameters:**
- `slug` - The tenant's unique slug

**Returns:** `Promise<Tenant | null>`

**Example:**
```tsx
const tenant = await getTenantBySlug('acme-corp')
```

#### `getTenantByIdSaaS(id: string)`

Fetches tenant data by ID from the `tenants` table.

**Parameters:**
- `id` - The tenant's UUID

**Returns:** `Promise<Tenant | null>`

#### `getUserTenants(userId: string)`

Fetches all tenants a user has access to.

**Parameters:**
- `userId` - The user's UUID

**Returns:** `Promise<Array<{ role: string, tenant: Tenant }>>`

**Example:**
```tsx
const userTenants = await getUserTenants(user.id)
```

### Client-side Components & Hooks

#### `<SaaSTenantProvider>`

React context provider for SaaS tenant data.

**Props:**
- `children` - React children
- `tenant` - Tenant data from server

**Example:**
```tsx
<SaaSTenantProvider tenant={tenant}>
  <YourComponents />
</SaaSTenantProvider>
```

#### `useSaaSTenant()`

Hook to access tenant context in client components.

**Returns:**
```tsx
{
  tenant: Tenant | null
  isLoading: boolean
}
```

**Example:**
```tsx
const { tenant, isLoading } = useSaaSTenant()
```

## Migration Checklist

### Hotels Table (Booking System)
- [ ] Add `slug` column to hotels table
- [ ] Create unique index on `slug` column
- [ ] Generate slugs for existing hotels
- [ ] Update database types if using Supabase CLI
- [ ] Test server-side fetching with `getTenant`
- [ ] Test client-side context with `TenantProvider`
- [ ] Verify real-time updates are working

### Tenants Table (SaaS Multi-Tenancy)
- [ ] Create `tenants` table with schema above
- [ ] Create `tenant_users` junction table
- [ ] Create indexes on slug and foreign keys
- [ ] Enable RLS on both tables
- [ ] Configure DNS for subdomain routing (production)
- [ ] Test subdomain routing locally with /etc/hosts
- [ ] Test path-based routing with `/tenant/:slug`
- [ ] Verify middleware sets `x-tenant-slug` header
- [ ] Test `getTenantSlugFromHeaders()` in server components

## License

Part of the Hotelius project.
