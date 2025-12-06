# Tenant System Usage Examples

This document provides complete, copy-paste ready examples for using the multi-tenant system.

## Example 1: Basic Hotel Page with Server Components

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{hotel.name}</h1>

        {hotel.star_rating && (
          <div className="flex items-center mb-4">
            {'⭐'.repeat(hotel.star_rating)}
          </div>
        )}

        {hotel.image_url && (
          <img
            src={hotel.image_url}
            alt={hotel.name}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
        )}

        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-4">{hotel.description}</p>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p>{hotel.address}</p>
              <p>{hotel.city}, {hotel.country} {hotel.postal_code}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              {hotel.phone && <p>Phone: {hotel.phone}</p>}
              {hotel.email && <p>Email: {hotel.email}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Example 2: Hotel Layout with Tenant Provider

```tsx
// app/hotels/[slug]/layout.tsx
import { getTenant } from '@/lib/tenant'
import { TenantProvider } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import HotelHeader from './components/HotelHeader'
import HotelFooter from './components/HotelFooter'

export default async function HotelLayout({
  params,
  children,
}: {
  params: { slug: string }
  children: React.ReactNode
}) {
  const hotel = await getTenant(params.slug)

  if (!hotel) {
    notFound()
  }

  return (
    <TenantProvider initialHotel={hotel}>
      <div className="min-h-screen flex flex-col">
        <HotelHeader />
        <main className="flex-grow">{children}</main>
        <HotelFooter />
      </div>
    </TenantProvider>
  )
}
```

## Example 3: Client Component Using Tenant Context

```tsx
// app/hotels/[slug]/components/HotelHeader.tsx
'use client'

import { useTenant } from '@/lib/tenant'
import Link from 'next/link'

export default function HotelHeader() {
  const { hotel, loading } = useTenant()

  if (loading) {
    return <HeaderSkeleton />
  }

  if (!hotel) {
    return null
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {hotel.image_url && (
              <img
                src={hotel.image_url}
                alt={hotel.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{hotel.name}</h1>
              <p className="text-sm text-gray-600">
                {hotel.city}, {hotel.country}
              </p>
            </div>
          </div>

          <nav className="flex space-x-4">
            <Link
              href={`/hotels/${hotel.slug}`}
              className="text-gray-700 hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              href={`/hotels/${hotel.slug}/rooms`}
              className="text-gray-700 hover:text-gray-900"
            >
              Rooms
            </Link>
            <Link
              href={`/hotels/${hotel.slug}/booking`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Book Now
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

function HeaderSkeleton() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
```

## Example 4: Booking Form with Tenant Context

```tsx
// app/hotels/[slug]/booking/BookingForm.tsx
'use client'

import { useRequiredTenant } from '@/lib/tenant'
import { useState } from 'react'

export default function BookingForm() {
  const hotel = useRequiredTenant() // Guaranteed to be non-null
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotelId: hotel.id,
        ...formData,
      }),
    })

    if (response.ok) {
      // Handle success
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Book Your Stay at {hotel.name}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Check-in Date
          </label>
          <input
            type="date"
            value={formData.checkIn}
            onChange={(e) =>
              setFormData({ ...formData, checkIn: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Check-out Date
          </label>
          <input
            type="date"
            value={formData.checkOut}
            onChange={(e) =>
              setFormData({ ...formData, checkOut: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Number of Guests
        </label>
        <input
          type="number"
          min="1"
          value={formData.guests}
          onChange={(e) =>
            setFormData({ ...formData, guests: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
      >
        Check Availability
      </button>
    </form>
  )
}
```

## Example 5: Server Action with Hotel Verification

```tsx
// app/hotels/[slug]/actions.ts
'use server'

import { getTenant } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const slug = formData.get('hotelSlug') as string
  const hotel = await getTenant(slug)

  if (!hotel) {
    throw new Error('Hotel not found')
  }

  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to book')
  }

  // Create booking
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      hotel_id: hotel.id,
      guest_id: user.id,
      check_in_date: formData.get('checkIn') as string,
      check_out_date: formData.get('checkOut') as string,
      number_of_guests: parseInt(formData.get('guests') as string),
      status: 'pending',
      payment_status: 'pending',
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create booking')
  }

  revalidatePath(`/hotels/${slug}/bookings`)

  return { success: true, bookingId: data.id }
}
```

## Example 6: Protected Hotel Owner Route

```tsx
// app/dashboard/hotels/[id]/settings/page.tsx
import { getTenantById, verifyTenantOwnership } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HotelSettingsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify ownership
  const isOwner = await verifyTenantOwnership(params.id, user.id)

  if (!isOwner) {
    redirect('/unauthorized')
  }

  const hotel = await getTenantById(params.id)

  if (!hotel) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Settings for {hotel.name}
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Hotel Information</h2>
        {/* Settings form */}
      </div>
    </div>
  )
}
```

## Example 7: Client Component with Ownership Check

```tsx
// app/hotels/[slug]/components/OwnerControls.tsx
'use client'

import { useTenant, useIsHotelOwner } from '@/lib/tenant'
import { useUser } from '@/lib/auth/hooks' // Your auth hook
import Link from 'next/link'

export default function OwnerControls() {
  const { hotel } = useTenant()
  const { user } = useUser()
  const isOwner = useIsHotelOwner(user?.id)

  // Only show to hotel owners
  if (!isOwner || !hotel) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4">
      <p className="text-sm font-medium mb-2">Hotel Owner Controls</p>
      <div className="flex flex-col space-y-2">
        <Link
          href={`/dashboard/hotels/${hotel.id}/settings`}
          className="text-sm hover:underline"
        >
          Edit Settings
        </Link>
        <Link
          href={`/dashboard/hotels/${hotel.id}/rooms`}
          className="text-sm hover:underline"
        >
          Manage Rooms
        </Link>
        <Link
          href={`/dashboard/hotels/${hotel.id}/bookings`}
          className="text-sm hover:underline"
        >
          View Bookings
        </Link>
      </div>
    </div>
  )
}
```

## Example 8: API Route with Tenant Verification

```tsx
// app/api/hotels/[slug]/rooms/route.ts
import { getTenant } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const hotel = await getTenant(params.slug)

  if (!hotel) {
    return NextResponse.json(
      { error: 'Hotel not found' },
      { status: 404 }
    )
  }

  const supabase = await createClient()

  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('hotel_id', hotel.id)
    .eq('is_available', true)
    .order('price_per_night', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    hotel: {
      id: hotel.id,
      name: hotel.name,
      slug: hotel.slug,
    },
    rooms,
  })
}
```

## Example 9: Real-time Updates with Refresh

```tsx
// app/hotels/[slug]/components/HotelInfo.tsx
'use client'

import { useTenant } from '@/lib/tenant'
import { useEffect } from 'react'

export default function HotelInfo() {
  const { hotel, loading, error, refreshHotel } = useTenant()

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshHotel()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [refreshHotel])

  if (loading) {
    return <div>Loading hotel information...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={refreshHotel}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!hotel) {
    return <div>Hotel not found</div>
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2">{hotel.name}</h2>
      <p className="text-gray-600">{hotel.description}</p>

      <button
        onClick={refreshHotel}
        className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
      >
        Refresh
      </button>
    </div>
  )
}
```

## Example 10: Metadata Generation with Hotel Data

```tsx
// app/hotels/[slug]/layout.tsx
import { getTenant } from '@/lib/tenant'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const hotel = await getTenant(params.slug)

  if (!hotel) {
    return {
      title: 'Hotel Not Found',
    }
  }

  return {
    title: `${hotel.name} - Book Your Stay`,
    description: hotel.description || `Book a room at ${hotel.name}`,
    openGraph: {
      title: hotel.name,
      description: hotel.description || undefined,
      images: hotel.image_url ? [hotel.image_url] : [],
    },
  }
}

// ... rest of layout
```

## Common Patterns

### Pattern 1: Loading States

Always handle loading states in client components:

```tsx
const { hotel, loading, error } = useTenant()

if (loading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!hotel) return <NotFound />

// Use hotel data safely here
```

### Pattern 2: Server + Client Hybrid

Best practice for performance:

```tsx
// Server: Fetch data
const hotel = await getTenant(slug)

// Server: Pass to client via provider
<TenantProvider initialHotel={hotel}>
  {/* Client components can access via useTenant() */}
</TenantProvider>
```

### Pattern 3: Ownership Protection

Always verify ownership for sensitive operations:

```tsx
// Server
const isOwner = await verifyTenantOwnership(hotelId, userId)
if (!isOwner) redirect('/unauthorized')

// Client
const isOwner = useIsHotelOwner(user?.id)
if (!isOwner) return <AccessDenied />
```
