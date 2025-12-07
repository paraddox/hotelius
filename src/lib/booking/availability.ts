/**
 * Availability Checking
 * Check room availability considering existing bookings and soft holds
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { BOOKING_STATES } from './states';

// Validation schemas
const availabilityQuerySchema = z.object({
  hotelId: z.string().uuid(),
  checkInDate: z.string().date(),
  checkOutDate: z.string().date(),
  roomTypeId: z.string().uuid().optional(),
  numAdults: z.number().min(1).optional(),
  numChildren: z.number().min(0).optional(),
});

export class AvailabilityError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AvailabilityError';
  }
}

/**
 * Room type with availability info
 */
export interface AvailableRoomType {
  id: string;
  name: string;
  description: string;
  base_price_cents: number;
  currency: string;
  max_adults: number;
  max_children: number;
  max_occupancy: number;
  size_sqm: number;
  beds: any; // JSON data
  amenities: string[];
  images: string[];
  total_rooms: number;
  available_rooms: number;
  booked_rooms: number;
}

/**
 * Individual room with availability status
 */
export interface RoomAvailability {
  room_id: string;
  room_number: string;
  room_type_id: string;
  status: string;
  is_active: boolean;
  current_booking_id?: string;
}

/**
 * Check availability for a specific room type
 */
export async function checkAvailability(params: {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
}): Promise<{
  isAvailable: boolean;
  availableCount: number;
  totalRooms: number;
}> {
  const supabase = await createServerClient();

  // Get total rooms of this type by counting from rooms table
  const { count: totalRooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('room_type_id', params.roomTypeId)
    .eq('hotel_id', params.hotelId)
    .eq('is_active', true)
    .in('status', ['available', 'occupied', 'maintenance']);

  if (roomsError) {
    throw new AvailabilityError(
      'Failed to get room count',
      'ROOM_COUNT_FAILED'
    );
  }

  if (!totalRooms || totalRooms === 0) {
    throw new AvailabilityError(
      'No rooms found for this room type',
      'NO_ROOMS_FOUND'
    );
  }

  // Count rooms that are booked (overlapping with requested dates)
  // Include pending bookings with active soft holds and all confirmed/checked-in bookings
  const { count: bookedCount, error: bookingError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('hotel_id', params.hotelId)
    .eq('room_type_id', params.roomTypeId)
    .in('status', [
      BOOKING_STATES.PENDING,
      BOOKING_STATES.CONFIRMED,
      BOOKING_STATES.CHECKED_IN,
    ])
    .overlaps('stay_range', `[${params.checkInDate},${params.checkOutDate})`);

  if (bookingError) {
    throw new AvailabilityError(
      `Failed to check availability: ${bookingError.message}`,
      'CHECK_FAILED'
    );
  }

  const availableCount = totalRooms - (bookedCount || 0);

  return {
    isAvailable: availableCount > 0,
    availableCount: Math.max(0, availableCount),
    totalRooms,
  };
}

/**
 * Get all available room types for a hotel and date range
 */
export async function getAvailableRooms(params: {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  numAdults?: number;
  numChildren?: number;
}): Promise<AvailableRoomType[]> {
  // Validate input
  const validated = availabilityQuerySchema.parse(params);

  const supabase = await createServerClient();

  // Get all active room types for this hotel
  const { data: roomTypes, error: roomTypesError } = await supabase
    .from('room_types')
    .select('*')
    .eq('hotel_id', validated.hotelId)
    .eq('is_active', true);

  if (roomTypesError) {
    throw new AvailabilityError(
      `Failed to fetch room types: ${roomTypesError.message}`,
      'FETCH_FAILED'
    );
  }

  if (!roomTypes || roomTypes.length === 0) {
    return [];
  }

  // Filter by occupancy if specified
  const numAdults = validated.numAdults || 1;
  const numChildren = validated.numChildren || 0;
  const totalGuests = numAdults + numChildren;

  const suitableRoomTypes = roomTypes.filter(rt => {
    if (validated.numAdults && rt.max_adults < validated.numAdults) {
      return false;
    }
    if (validated.numChildren && rt.max_children < validated.numChildren) {
      return false;
    }
    if (rt.max_occupancy < totalGuests) {
      return false;
    }
    return true;
  });

  // Check availability for each room type
  const availabilityPromises = suitableRoomTypes.map(async (roomType) => {
    const availability = await checkAvailability({
      hotelId: validated.hotelId,
      roomTypeId: roomType.id,
      checkInDate: validated.checkInDate,
      checkOutDate: validated.checkOutDate,
    });

    return {
      id: roomType.id,
      name: roomType.name_default,
      description: typeof roomType.description === 'object' && roomType.description !== null && 'en' in roomType.description
        ? (roomType.description as any).en
        : roomType.name_default,
      base_price_cents: roomType.base_price_cents,
      currency: roomType.currency,
      max_adults: roomType.max_adults,
      max_children: roomType.max_children,
      max_occupancy: roomType.max_occupancy,
      size_sqm: roomType.size_sqm || 0,
      beds: roomType.bed_configuration,
      amenities: Array.isArray(roomType.amenities) ? roomType.amenities.map(a => String(a)) : [],
      images: [], // Images would need to be fetched from media table
      total_rooms: availability.totalRooms,
      available_rooms: availability.availableCount,
      booked_rooms: availability.totalRooms - availability.availableCount,
    };
  });

  const roomTypesWithAvailability = await Promise.all(availabilityPromises);

  // Only return room types with availability
  return roomTypesWithAvailability.filter(rt => rt.available_rooms > 0);
}

/**
 * Get specific available room IDs for a room type
 * This is used when creating a booking to assign a specific room
 */
export async function getAvailableRoomIds(params: {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
}): Promise<string[]> {
  const supabase = await createServerClient();

  // Get all rooms of this type
  const { data: allRooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id')
    .eq('hotel_id', params.hotelId)
    .eq('room_type_id', params.roomTypeId)
    .eq('is_available', true);

  if (roomsError) {
    throw new AvailabilityError(
      `Failed to fetch rooms: ${roomsError.message}`,
      'FETCH_FAILED'
    );
  }

  if (!allRooms || allRooms.length === 0) {
    return [];
  }

  const allRoomIds = allRooms.map(r => r.id);

  // Get booked room IDs for the date range
  const { data: bookedRooms, error: bookingError } = await supabase
    .from('bookings')
    .select('room_id')
    .eq('hotel_id', params.hotelId)
    .eq('room_type_id', params.roomTypeId)
    .in('status', [
      BOOKING_STATES.PENDING,
      BOOKING_STATES.CONFIRMED,
      BOOKING_STATES.CHECKED_IN,
    ])
    .overlaps('stay_range', `[${params.checkInDate},${params.checkOutDate})`);

  if (bookingError) {
    throw new AvailabilityError(
      `Failed to check bookings: ${bookingError.message}`,
      'CHECK_FAILED'
    );
  }

  const bookedRoomIds = new Set(
    (bookedRooms || []).map(b => b.room_id)
  );

  // Return room IDs that are not booked
  return allRoomIds.filter(id => !bookedRoomIds.has(id));
}

/**
 * Check if a specific room is available for given dates
 */
export async function isRoomAvailable(params: {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
}): Promise<boolean> {
  const supabase = await createServerClient();

  // Check if room exists and is available
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('status, hotel_id, room_type_id, is_active')
    .eq('id', params.roomId)
    .single();

  if (roomError || !room || !room.is_active || room.status === 'out_of_service') {
    return false;
  }

  // Check for overlapping bookings
  const { count, error: bookingError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', params.roomId)
    .in('status', [
      BOOKING_STATES.PENDING,
      BOOKING_STATES.CONFIRMED,
      BOOKING_STATES.CHECKED_IN,
    ])
    .overlaps('stay_range', `[${params.checkInDate},${params.checkOutDate})`);

  if (bookingError) {
    throw new AvailabilityError(
      `Failed to check room availability: ${bookingError.message}`,
      'CHECK_FAILED'
    );
  }

  return (count || 0) === 0;
}

/**
 * Get detailed availability calendar for a room type
 * Returns availability for each day in the range
 */
export async function getAvailabilityCalendar(params: {
  hotelId: string;
  roomTypeId: string;
  startDate: string;
  endDate: string;
}): Promise<{
  date: string;
  available: number;
  booked: number;
  total: number;
}[]> {
  const supabase = await createServerClient();

  // Get total rooms by counting from rooms table
  const { count: totalRooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('room_type_id', params.roomTypeId)
    .eq('hotel_id', params.hotelId)
    .eq('is_active', true)
    .in('status', ['available', 'occupied', 'maintenance']);

  if (roomsError) {
    throw new AvailabilityError(
      'Failed to get room count',
      'ROOM_COUNT_FAILED'
    );
  }

  if (!totalRooms || totalRooms === 0) {
    throw new AvailabilityError(
      'No rooms found for this room type',
      'NO_ROOMS_FOUND'
    );
  }
  const calendar: { date: string; available: number; booked: number; total: number }[] = [];

  // Generate date range
  const startDate = new Date(params.startDate);
  const endDate = new Date(params.endDate);
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const nextDateStr = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Check availability for this single day
    const { count: bookedCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('hotel_id', params.hotelId)
      .eq('room_type_id', params.roomTypeId)
      .in('status', [
        BOOKING_STATES.PENDING,
        BOOKING_STATES.CONFIRMED,
        BOOKING_STATES.CHECKED_IN,
      ])
      .overlaps('stay_range', `[${dateStr},${nextDateStr})`);

    const booked = bookedCount || 0;
    const available = totalRooms - booked;

    calendar.push({
      date: dateStr,
      available: Math.max(0, available),
      booked,
      total: totalRooms,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return calendar;
}

/**
 * Get minimum available rooms across a date range
 * Useful for determining if a multi-night stay is possible
 */
export async function getMinimumAvailability(params: {
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
}): Promise<number> {
  const calendar = await getAvailabilityCalendar({
    hotelId: params.hotelId,
    roomTypeId: params.roomTypeId,
    startDate: params.checkInDate,
    endDate: params.checkOutDate,
  });

  if (calendar.length === 0) {
    return 0;
  }

  // Return the minimum availability across all days
  return Math.min(...calendar.map(day => day.available));
}
