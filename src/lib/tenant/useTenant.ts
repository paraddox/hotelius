'use client'

import { useTenantContext } from './TenantProvider'
import type { Hotel } from './getTenant'

/**
 * Client-side hook for accessing current hotel (tenant) context
 *
 * Must be used within a TenantProvider
 *
 * @returns Hotel context with hotel data, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * function BookingForm() {
 *   const { hotel, loading, error } = useTenant()
 *
 *   if (loading) return <div>Loading hotel...</div>
 *   if (error) return <div>Error: {error}</div>
 *   if (!hotel) return <div>Hotel not found</div>
 *
 *   return (
 *     <div>
 *       <h1>{hotel.name}</h1>
 *       <p>{hotel.description}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useTenant() {
  const context = useTenantContext()

  return {
    hotel: context.hotel,
    loading: context.loading,
    error: context.error,
    refreshHotel: context.refreshHotel,
  }
}

/**
 * Hook that throws if hotel is not available
 * Useful when you're certain the hotel should exist
 *
 * @returns Hotel data (never null)
 * @throws Error if hotel is not available
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * function RoomsList() {
 *   const hotel = useRequiredTenant()
 *   // hotel is guaranteed to be non-null here
 *
 *   return <div>Rooms for {hotel.name}</div>
 * }
 * ```
 */
export function useRequiredTenant(): Hotel {
  const { hotel, loading, error } = useTenantContext()

  if (loading) {
    throw new Error('Hotel is still loading')
  }

  if (error) {
    throw new Error(`Failed to load hotel: ${error}`)
  }

  if (!hotel) {
    throw new Error('Hotel not found')
  }

  return hotel
}

/**
 * Hook to check if current user owns the hotel
 * Returns false if hotel is not loaded or user doesn't own it
 *
 * @param userId - Current user's ID to check ownership
 * @returns true if user owns the hotel
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * function HotelSettings() {
 *   const { hotel } = useTenant()
 *   const isOwner = useIsHotelOwner(user?.id)
 *
 *   if (!isOwner) {
 *     return <div>Access denied</div>
 *   }
 *
 *   return <div>Hotel settings...</div>
 * }
 * ```
 */
export function useIsHotelOwner(userId: string | undefined): boolean {
  const { hotel } = useTenantContext()

  if (!hotel || !userId) {
    return false
  }

  return hotel.owner_id === userId
}
