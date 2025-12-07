/**
 * Room Types API
 *
 * This module provides functions for managing room types in the hotel reservation system.
 * Room types define the categories of rooms available (e.g., Standard, Deluxe, Suite).
 */

// TypeScript types for room types
export interface RoomType {
  id: string;
  tenantId: string;
  name: Record<string, string>; // Multi-language support: { en: "Standard Room", es: "Habitación Estándar" }
  description: Record<string, string>; // Multi-language descriptions
  basePrice: number; // in cents
  maxOccupancyAdults: number;
  maxOccupancyChildren: number;
  amenities: string[];
  images: string[]; // Array of image URLs
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomTypeData {
  name: Record<string, string>;
  description: Record<string, string>;
  basePrice: number;
  maxOccupancyAdults: number;
  maxOccupancyChildren: number;
  amenities: string[];
  images?: string[];
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

export interface UpdateRoomTypeData extends Partial<CreateRoomTypeData> {
  id: string;
}

export interface RoomTypeFilters {
  status?: 'active' | 'inactive';
  search?: string;
}

/**
 * Fetch all room types for a hotel
 * @param hotelId - The hotel/tenant ID
 * @param filters - Optional filters to apply
 * @returns Promise resolving to an array of room types
 */
export async function fetchRoomTypes(
  hotelId: string,
  filters?: RoomTypeFilters
): Promise<RoomType[]> {
  try {
    const params = new URLSearchParams();
    params.append('hotelId', hotelId);

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await fetch(`/api/room-types?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch room types: ${response.statusText}`);
    }

    const data = await response.json();
    return data.roomTypes || [];
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
}

/**
 * Fetch a single room type by ID
 * @param id - The room type ID
 * @returns Promise resolving to the room type
 */
export async function fetchRoomTypeById(id: string): Promise<RoomType> {
  try {
    const response = await fetch(`/api/room-types/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Room type not found');
      }
      throw new Error(`Failed to fetch room type: ${response.statusText}`);
    }

    const data = await response.json();
    return data.roomType;
  } catch (error) {
    console.error('Error fetching room type:', error);
    throw error;
  }
}

/**
 * Create a new room type
 * @param hotelId - The hotel/tenant ID
 * @param data - The room type data
 * @returns Promise resolving to the created room type
 */
export async function createRoomType(
  hotelId: string,
  data: CreateRoomTypeData
): Promise<RoomType> {
  try {
    const payload = {
      ...data,
      tenantId: hotelId,
      status: data.status ?? 'active',
      sortOrder: data.sortOrder ?? 0,
      images: data.images ?? [],
    };

    const response = await fetch('/api/room-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create room type: ${response.statusText}`);
    }

    const result = await response.json();
    return result.roomType;
  } catch (error) {
    console.error('Error creating room type:', error);
    throw error;
  }
}

/**
 * Update an existing room type
 * @param id - The room type ID
 * @param data - The updated room type data
 * @returns Promise resolving to the updated room type
 */
export async function updateRoomType(
  id: string,
  data: Partial<CreateRoomTypeData>
): Promise<RoomType> {
  try {
    const response = await fetch(`/api/room-types/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update room type: ${response.statusText}`);
    }

    const result = await response.json();
    return result.roomType;
  } catch (error) {
    console.error('Error updating room type:', error);
    throw error;
  }
}

/**
 * Delete a room type
 * @param id - The room type ID
 * @returns Promise resolving when the room type is deleted
 */
export async function deleteRoomType(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/room-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete room type: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting room type:', error);
    throw error;
  }
}

/**
 * Toggle room type status between active and inactive
 * @param id - The room type ID
 * @param status - The new status
 * @returns Promise resolving to the updated room type
 */
export async function toggleRoomTypeStatus(
  id: string,
  status: 'active' | 'inactive'
): Promise<RoomType> {
  return updateRoomType(id, { status });
}

/**
 * Get room count for a room type
 * @param roomTypeId - The room type ID
 * @returns Promise resolving to the room count
 */
export async function getRoomCountByType(roomTypeId: string): Promise<number> {
  try {
    const response = await fetch(`/api/room-types/${roomTypeId}/rooms/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch room count: ${response.statusText}`);
    }

    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error fetching room count:', error);
    throw error;
  }
}
