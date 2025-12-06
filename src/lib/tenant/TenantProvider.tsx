'use client'

import React, { createContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

export type Hotel = Tables<'hotels'>

interface TenantContextValue {
  hotel: Hotel | null
  loading: boolean
  error: string | null
  refreshHotel: () => Promise<void>
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

interface TenantProviderProps {
  children: React.ReactNode
  initialHotel?: Hotel | null
  slug?: string
}

/**
 * TenantProvider - Provides hotel (tenant) context to client components
 *
 * This provider can work in two modes:
 * 1. With initialHotel (SSR) - Hotel data is passed from server, then kept in sync
 * 2. With slug (client-only) - Fetches hotel data on mount
 *
 * @example
 * ```tsx
 * // Server Component
 * const hotel = await getTenant(slug)
 *
 * // Wrap client components
 * <TenantProvider initialHotel={hotel}>
 *   <ClientComponent />
 * </TenantProvider>
 * ```
 */
export function TenantProvider({ children, initialHotel, slug }: TenantProviderProps) {
  const [hotel, setHotel] = useState<Hotel | null>(initialHotel || null)
  const [loading, setLoading] = useState(!initialHotel && !!slug)
  const [error, setError] = useState<string | null>(null)

  const fetchHotel = async (hotelSlug: string) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('hotels')
        .select('*')
        .eq('slug', hotelSlug)
        .eq('is_active', true)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setHotel(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch hotel'
      setError(errorMessage)
      console.error('Error fetching hotel:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshHotel = async () => {
    if (slug) {
      await fetchHotel(slug)
    } else if (hotel?.slug) {
      await fetchHotel(hotel.slug)
    }
  }

  useEffect(() => {
    // Only fetch if we don't have initial data but have a slug
    if (!initialHotel && slug) {
      fetchHotel(slug)
    }
  }, [slug, initialHotel])

  // Set up real-time subscription for hotel updates
  useEffect(() => {
    if (!hotel?.id) return

    const supabase = createClient()

    const channel = supabase
      .channel(`hotel-${hotel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hotels',
          filter: `id=eq.${hotel.id}`,
        },
        (payload) => {
          setHotel(payload.new as Hotel)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hotel?.id])

  const value: TenantContextValue = {
    hotel,
    loading,
    error,
    refreshHotel,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

/**
 * useTenantContext - Internal hook to access tenant context
 * Use the exported useTenant hook instead
 */
export function useTenantContext() {
  const context = React.useContext(TenantContext)

  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider')
  }

  return context
}
