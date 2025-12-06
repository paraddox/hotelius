# Multi-Tenant System Setup Guide

This guide walks you through setting up and using the multi-tenant system for the Hotelius hotel reservation SaaS application.

## Quick Start

The tenant system is now installed and ready to use. Follow these steps to get started:

### 1. Database Migration

Run the SQL migration to add the `slug` column to your hotels table:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy and run: supabase/migrations/add_hotel_slug.sql
```

### 2. Update Database Types (Optional)

If you want to regenerate your database types from Supabase:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Note: The types have already been updated with the `slug` field, so this step is optional.

### 3. Test the System

Create a test hotel page:

```tsx
// app/hotels/[slug]/page.tsx
import { getTenant } from '@/lib/tenant'
import { notFound } from 'next/navigation'

export default async function HotelPage({
  params,
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
    </div>
  )
}
```

## Files Created

### Core Tenant System

```
src/lib/tenant/
├── getTenant.ts          # Server-side utilities for fetching hotel data
├── TenantProvider.tsx    # Client-side React context provider
├── useTenant.ts          # Client-side hooks for accessing tenant context
├── index.ts              # Public exports
├── README.md             # Comprehensive documentation
└── EXAMPLES.md           # Usage examples and patterns
```

### Database

```
supabase/migrations/
└── add_hotel_slug.sql    # SQL migration to add slug column
```

### Types

```
src/types/
└── database.ts           # Updated with slug field in hotels table
```

## API Overview

### Server-Side Functions

```tsx
import { getTenant, getTenantById, verifyTenantOwnership } from '@/lib/tenant'

// Fetch hotel by slug (recommended for public pages)
const hotel = await getTenant('grand-plaza-hotel')

// Fetch hotel by ID (for authenticated/admin pages)
const hotel = await getTenantById('uuid-here')

// Verify user owns hotel
const isOwner = await verifyTenantOwnership(hotelId, userId)
```

### Client-Side Components & Hooks

```tsx
import { TenantProvider, useTenant, useRequiredTenant, useIsHotelOwner } from '@/lib/tenant'

// Wrap your app/page with the provider
<TenantProvider initialHotel={hotel}>
  <YourComponents />
</TenantProvider>

// Access hotel data in client components
const { hotel, loading, error, refreshHotel } = useTenant()

// Get hotel (throws if not available)
const hotel = useRequiredTenant()

// Check if user owns hotel
const isOwner = useIsHotelOwner(user?.id)
```

## Key Features

### 1. Server-Side Rendering (SSR)

Hotel data is fetched on the server for optimal performance:

```tsx
// ✅ Good: Server-side fetch
const hotel = await getTenant(params.slug)

// ❌ Avoid: Client-side fetch in initial render
```

### 2. Request Caching

Server functions use React `cache()` to deduplicate requests within a single render:

```tsx
// These will only make ONE database query
const hotel1 = await getTenant('my-hotel')
const hotel2 = await getTenant('my-hotel')
const hotel3 = await getTenant('my-hotel')
```

### 3. Real-Time Updates

The TenantProvider automatically subscribes to hotel updates via Supabase Realtime:

```tsx
// Updates automatically when hotel data changes in database
<TenantProvider initialHotel={hotel}>
  <HotelInfo /> {/* Will update automatically */}
</TenantProvider>
```

### 4. Type Safety

All utilities are fully typed using your Supabase database schema:

```tsx
import type { Hotel } from '@/lib/tenant'

// Hotel type includes: id, name, slug, description, etc.
```

## Common Use Cases

### Use Case 1: Public Booking Engine

```
URL: /hotels/grand-plaza-hotel
Flow: URL slug → getTenant() → Hotel data → TenantProvider → Client components
```

```tsx
// app/hotels/[slug]/layout.tsx
export default async function HotelLayout({ params, children }) {
  const hotel = await getTenant(params.slug)

  return (
    <TenantProvider initialHotel={hotel}>
      {children}
    </TenantProvider>
  )
}
```

### Use Case 2: Hotel Owner Dashboard

```
URL: /dashboard/hotels/uuid-123/settings
Flow: Hotel ID → verifyTenantOwnership() → Access granted → Hotel settings
```

```tsx
// app/dashboard/hotels/[id]/settings/page.tsx
export default async function SettingsPage({ params }) {
  const { user } = await getUser()
  const isOwner = await verifyTenantOwnership(params.id, user.id)

  if (!isOwner) redirect('/unauthorized')

  const hotel = await getTenantById(params.id)
  // Render settings form...
}
```

### Use Case 3: API Routes

```
URL: /api/hotels/grand-plaza-hotel/rooms
Flow: URL slug → getTenant() → Query rooms → Return data
```

```tsx
// app/api/hotels/[slug]/rooms/route.ts
export async function GET(req, { params }) {
  const hotel = await getTenant(params.slug)

  if (!hotel) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch and return rooms...
}
```

## Migration Checklist

- [x] Created tenant utilities (getTenant, TenantProvider, useTenant)
- [x] Updated database types with slug field
- [x] Created SQL migration file
- [x] Added comprehensive documentation
- [x] Created usage examples

### Next Steps (Your Action Required):

- [ ] Run the database migration to add slug column
- [ ] Test the tenant system with a sample hotel
- [ ] Update your hotel pages to use the tenant utilities
- [ ] Configure Supabase Realtime for the hotels table (if needed)
- [ ] Generate slugs for existing hotels in the database

## Database Schema Requirements

The tenant system expects the following structure in your `hotels` table:

```sql
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,              -- ✅ Required for tenant system
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  image_url TEXT,
  amenities JSONB,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

CREATE UNIQUE INDEX idx_hotels_slug ON hotels(slug);
```

## Troubleshooting

### Issue: "Hotel not found"

**Solutions:**
1. Verify hotel exists in database with correct slug
2. Check that `is_active = true`
3. Ensure slug column has been added via migration
4. Verify Supabase environment variables are set

### Issue: Real-time updates not working

**Solutions:**
1. Enable Realtime for hotels table in Supabase dashboard
2. Check browser console for subscription errors
3. Verify Supabase URL and anon key are correct

### Issue: Type errors with Hotel type

**Solutions:**
1. Regenerate database types: `npx supabase gen types typescript`
2. Ensure `slug` field is in database.ts
3. Restart TypeScript server in your IDE

### Issue: Ownership verification failing

**Solutions:**
1. Verify `owner_id` matches user's ID
2. Check user is authenticated before calling `verifyTenantOwnership`
3. Ensure foreign key relationship exists in database

## Performance Considerations

### Server Components (Recommended)

- Fetch hotel data on the server when possible
- Use `getTenant()` in Server Components for best performance
- Server-side fetching is cached per request automatically

### Client Components

- Pass `initialHotel` to TenantProvider for SSR
- Avoid fetching on client mount if possible
- Use `refreshHotel()` only when needed (not on every render)

### Caching Strategy

- Server: React `cache()` deduplicates within single request
- Client: State managed by TenantProvider with Realtime updates
- No additional caching layer needed for most use cases

## Security Considerations

### Always verify ownership for protected routes:

```tsx
const isOwner = await verifyTenantOwnership(hotelId, userId)
if (!isOwner) redirect('/unauthorized')
```

### Never trust client-side ownership checks alone:

```tsx
// ❌ Bad: Client-side only
const isOwner = useIsHotelOwner(user?.id)
// User can modify this!

// ✅ Good: Server-side verification
const isOwner = await verifyTenantOwnership(hotelId, userId)
```

### Use Row Level Security (RLS) in Supabase:

```sql
-- Example RLS policy for hotels table
CREATE POLICY "Hotel owners can update their hotels"
ON hotels FOR UPDATE
USING (auth.uid() = owner_id);
```

## Support

For more information, see:

- `src/lib/tenant/README.md` - Full API documentation
- `src/lib/tenant/EXAMPLES.md` - Code examples and patterns
- `supabase/migrations/add_hotel_slug.sql` - Database migration

## Next Steps

1. Run the database migration
2. Create your first hotel page using the examples
3. Test with a sample hotel
4. Implement your booking flow using the tenant context

The tenant system is production-ready and follows Next.js App Router best practices. Happy coding!
