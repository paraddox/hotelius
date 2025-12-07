/**
 * Rooms API
 *
 * This module provides functions for managing physical rooms in the hotel.
 * Rooms are the actual physical units that can be booked, each associated with a room type.
 */

import { createClient } from '@/lib/supabase/client';
import type { RoomStatus } from '@/components/dashboard/rooms/RoomStatusBadge';

// TypeScript types for rooms
export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  status: RoomStatus;
  notes?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  roomType?: {
    id: string;
    name: string;
  };
}

export interface CreateRoomData {
  hotelId: string;
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  status?: RoomStatus;
  notes?: string;
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  id: string;
}

export interface RoomFilters {
  roomTypeId?: string;
  status?: RoomStatus;
  floor?: number;
  search?: string;
}

export interface RoomWithBookings extends Room {
  currentBooking?: {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
  };
  recentBookings?: Array<{
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }>;
}

/**
 * Fetch all rooms for a hotel
 * @param hotelId - The hotel ID
 * @param filters - Optional filters to apply
 * @returns Promise resolving to an array of rooms
 */
export async function fetchRooms(
  hotelId: string,
  filters?: RoomFilters
): Promise<Room[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from('rooms')
      .select(`
        id,
        hotel_id,
        room_number,
        floor,
        room_type_id,
        notes,
        status,
        is_active,
        created_at,
        updated_at
      `)
      .eq('hotel_id', hotelId)
      .eq('is_active', true)
      .order('floor', { ascending: true })
      .order('room_number', { ascending: true });

    if (filters?.floor !== undefined) {
      query = query.eq('floor', filters.floor);
    }

    if (filters?.search) {
      query = query.ilike('room_number', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      throw new Error(`Failed to fetch rooms: ${error.message}`);
    }

    // Map database fields to our Room interface
    return (data || []).map(room => ({
      id: room.id,
      hotelId: room.hotel_id,
      roomNumber: room.room_number,
      floor: room.floor || 1,
      roomTypeId: room.room_type_id,
      status: room.status as Room['status'],
      notes: room.notes || undefined,
      isAvailable: room.status === 'available',
      createdAt: room.created_at,
      updatedAt: room.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
}

/**
 * Fetch a single room by ID with booking history
 * @param id - The room ID
 * @returns Promise resolving to the room with bookings
 */
export async function fetchRoomById(id: string): Promise<RoomWithBookings> {
  try {
    const supabase = createClient();

    // Fetch room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select(`
        id,
        hotel_id,
        room_number,
        floor,
        room_type_id,
        notes,
        status,
        is_active,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (roomError) {
      console.error('Error fetching room:', roomError);
      throw new Error(`Failed to fetch room: ${roomError.message}`);
    }

    if (!room) {
      throw new Error('Room not found');
    }

    // Fetch current and recent bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        check_in_date,
        check_out_date,
        status,
        guest_id,
        profiles:guest_id (
          full_name
        )
      `)
      .eq('room_id', id)
      .order('check_in_date', { ascending: false })
      .limit(10);

    const today = new Date().toISOString().split('T')[0];

    let currentBooking;
    const recentBookings = [];

    if (bookings && !bookingsError) {
      for (const booking of bookings) {
        const bookingData = {
          id: booking.id,
          guestName: (booking.profiles as any)?.full_name || 'Unknown Guest',
          checkIn: booking.check_in_date,
          checkOut: booking.check_out_date,
          status: booking.status,
        };

        // Check if this is the current booking (check-in <= today < check-out)
        if (
          booking.check_in_date <= today &&
          booking.check_out_date > today &&
          booking.status === 'confirmed'
        ) {
          currentBooking = bookingData;
        } else {
          recentBookings.push(bookingData);
        }
      }
    }

    return {
      id: room.id,
      hotelId: room.hotel_id,
      roomNumber: room.room_number,
      floor: room.floor || 1,
      roomTypeId: room.room_type_id,
      status: room.status as Room['status'],
      notes: room.notes || undefined,
      isAvailable: room.status === 'available',
      createdAt: room.created_at,
      updatedAt: room.updated_at,
      currentBooking,
      recentBookings: recentBookings.slice(0, 5),
    };
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    throw error;
  }
}

/**
 * Create a new room
 * @param data - The room data
 * @returns Promise resolving to the created room
 */
export async function createRoom(data: CreateRoomData): Promise<Room> {
  try {
    const supabase = createClient();

    const { data: room, error } = await supabase
      .from('rooms')
      .insert({
        hotel_id: data.hotelId,
        room_number: data.roomNumber,
        floor: data.floor,
        room_type_id: data.roomTypeId,
        notes: data.notes || null,
        status: data.status || 'available',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }

    return {
      id: room.id,
      hotelId: room.hotel_id,
      roomNumber: room.room_number,
      floor: room.floor || 1,
      roomTypeId: room.room_type_id,
      status: room.status as Room['status'],
      notes: room.notes || undefined,
      isAvailable: room.status === 'available',
      createdAt: room.created_at,
      updatedAt: room.updated_at,
    };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

/**
 * Update an existing room
 * @param id - The room ID
 * @param data - The updated room data
 * @returns Promise resolving to the updated room
 */
export async function updateRoom(
  id: string,
  data: Partial<CreateRoomData>
): Promise<Room> {
  try {
    const supabase = createClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.roomNumber !== undefined) updateData.room_number = data.roomNumber;
    if (data.floor !== undefined) updateData.floor = data.floor;
    if (data.roomTypeId !== undefined) updateData.room_type_id = data.roomTypeId;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.status !== undefined) updateData.status = data.status;

    const { data: room, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating room:', error);
      throw new Error(`Failed to update room: ${error.message}`);
    }

    return {
      id: room.id,
      hotelId: room.hotel_id,
      roomNumber: room.room_number,
      floor: room.floor || 1,
      roomTypeId: room.room_type_id,
      status: room.status as Room['status'],
      notes: room.notes || undefined,
      isAvailable: room.status === 'available',
      createdAt: room.created_at,
      updatedAt: room.updated_at,
    };
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
}

/**
 * Delete a room
 * @param id - The room ID
 * @returns Promise resolving when the room is deleted
 */
export async function deleteRoom(id: string): Promise<void> {
  try {
    const supabase = createClient();

    // Check if room has any bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', id)
      .limit(1);

    if (bookingsError) {
      throw new Error(`Failed to check room bookings: ${bookingsError.message}`);
    }

    if (bookings && bookings.length > 0) {
      throw new Error('Cannot delete room with existing bookings. Please set it to inactive instead.');
    }

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting room:', error);
      throw new Error(`Failed to delete room: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
}

/**
 * Update room status
 * @param id - The room ID
 * @param status - The new status
 * @returns Promise resolving to the updated room
 */
export async function updateRoomStatus(
  id: string,
  status: RoomStatus
): Promise<Room> {
  return updateRoom(id, { status });
}

/**
 * Fetch room types for a hotel (for dropdown)
 * @param hotelId - The hotel ID
 * @returns Promise resolving to room type options
 */
export async function fetchRoomTypes(hotelId: string): Promise<Array<{ value: string; label: string }>> {
  try {
    const supabase = createClient();

    // Get room types from room_types table
    const { data, error } = await supabase
      .from('room_types')
      .select('id, name_default')
      .eq('hotel_id', hotelId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching room types:', error);
      throw new Error(`Failed to fetch room types: ${error.message}`);
    }

    return (data || []).map(type => ({
      value: type.id,
      label: type.name_default,
    }));
  } catch (error) {
    console.error('Error fetching room types:', error);
    // Return default room types as fallback
    return [
      { value: 'Standard Room', label: 'Standard Room' },
      { value: 'Deluxe Room', label: 'Deluxe Room' },
      { value: 'Suite', label: 'Suite' },
      { value: 'Executive Suite', label: 'Executive Suite' },
    ];
  }
}

/**
 * Helper function to determine room status
 */
function determineRoomStatus(isAvailable: boolean, currentBooking?: any): RoomStatus {
  if (!isAvailable) return 'out_of_service';
  if (currentBooking) return 'occupied';
  return 'available';
}
