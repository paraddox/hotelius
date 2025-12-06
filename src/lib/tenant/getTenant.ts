import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import type { Tables } from '@/types/database'

export type Hotel = Tables<'hotels'>

/**
 * Server-side utility to fetch hotel (tenant) data by slug
 * Cached per request to avoid redundant database queries
 *
 * @param slug - The hotel's unique slug from the URL
 * @returns Hotel data or null if not found
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const hotel = await getTenant('grand-plaza-hotel')
 * if (!hotel) {
 *   notFound()
 * }
 * ```
 */
export const getTenant = cache(async (slug: string): Promise<Hotel | null> => {
  const supabase = await createClient()

  const { data: hotel, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching tenant:', error)
    return null
  }

  return hotel
})

/**
 * Server-side utility to fetch hotel by ID
 * Useful for authenticated routes where hotel ID is known
 *
 * @param hotelId - The hotel's UUID
 * @returns Hotel data or null if not found
 */
export const getTenantById = cache(async (hotelId: string): Promise<Hotel | null> => {
  const supabase = await createClient()

  const { data: hotel, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('id', hotelId)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching tenant by ID:', error)
    return null
  }

  return hotel
})

/**
 * Verify that a user owns a specific hotel
 *
 * @param hotelId - The hotel's UUID
 * @param userId - The user's UUID
 * @returns true if user owns the hotel, false otherwise
 */
export const verifyTenantOwnership = cache(
  async (hotelId: string, userId: string): Promise<boolean> => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('hotels')
      .select('id')
      .eq('id', hotelId)
      .eq('owner_id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return true
  }
)
