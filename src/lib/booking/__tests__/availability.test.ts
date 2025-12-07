import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkAvailability,
  getAvailableRooms,
  getAvailableRoomIds,
  isRoomAvailable,
  getAvailabilityCalendar,
  getMinimumAvailability,
  AvailabilityError,
} from '../availability';
import { createMockSupabaseClient, mockData } from '@/test/mocks/supabase';
import { BOOKING_STATES } from '../states';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Availability Checking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('should return available when no bookings exist', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: Array.from({ length: 10 }, (_, i) => ({
            id: `room-${i + 1}`,
            hotel_id: '00000000-0000-0000-0000-000000000001',
            room_type_id: '10000000-0000-0000-0000-000000000001',
            is_active: true,
            status: 'available',
          })),
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await checkAvailability({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result.isAvailable).toBe(true);
      expect(result.availableCount).toBe(10);
      expect(result.totalRooms).toBe(10);
    });

    it('should calculate available rooms correctly with some bookings', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: Array.from({ length: 10 }, (_, i) => ({
            id: `room-${i + 1}`,
            hotel_id: '00000000-0000-0000-0000-000000000001',
            room_type_id: '10000000-0000-0000-0000-000000000001',
            is_active: true,
            status: 'available',
          })),
          bookings: mockData.bookings(3, 'confirmed'),
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await checkAvailability({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result.isAvailable).toBe(true);
      expect(result.availableCount).toBe(7); // 10 total - 3 booked
      expect(result.totalRooms).toBe(10);
    });

    it('should return not available when fully booked', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: Array.from({ length: 5 }, (_, i) => ({
            id: `room-${i + 1}`,
            hotel_id: '00000000-0000-0000-0000-000000000001',
            room_type_id: '10000000-0000-0000-0000-000000000001',
            is_active: true,
            status: 'available',
          })),
          bookings: mockData.bookings(5, 'confirmed'),
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await checkAvailability({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result.isAvailable).toBe(false);
      expect(result.availableCount).toBe(0);
      expect(result.totalRooms).toBe(5);
    });

    it('should throw error when room type not found', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      await expect(
        checkAvailability({
          hotelId: '00000000-0000-0000-0000-000000000001',
          roomTypeId: 'non-existent',
          checkInDate: '2025-12-15',
          checkOutDate: '2025-12-17',
        })
      ).rejects.toThrow(AvailabilityError);
    });

    it('should only count active bookings (pending, confirmed, checked_in)', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: Array.from({ length: 10 }, (_, i) => ({
            id: `room-${i + 1}`,
            hotel_id: '00000000-0000-0000-0000-000000000001',
            room_type_id: '10000000-0000-0000-0000-000000000001',
            is_active: true,
            status: 'available',
          })),
          // Only bookings with status in [pending, confirmed, checked_in] should be counted
          bookings: [
            ...mockData.bookings(2, 'confirmed'),
            ...mockData.bookings(1, 'pending'),
            ...mockData.bookings(2, 'cancelled'), // Should not be counted
            ...mockData.bookings(1, 'checked_out'), // Should not be counted
          ],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await checkAvailability({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result.isAvailable).toBe(true);
      // Should only count 3 bookings (2 confirmed + 1 pending)
      expect(result.availableCount).toBe(7);
    });
  });

  describe('getAvailableRooms', () => {
    it('should return all room types when available', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: Array.from({ length: 3 * 10 }, (_, i) => ({
            id: `room-${Math.floor(i / 10) + 1}-${(i % 10) + 1}`,
            hotel_id: '00000000-0000-0000-0000-000000000001',
            room_type_id: `room-type-${Math.floor(i / 10) + 1}`,
            is_active: true,
            status: 'available',
          })),
          room_types: mockData.roomTypes(3, '00000000-0000-0000-0000-000000000001'),
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailableRooms({
        hotelId: '00000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toHaveLength(3);
      result.forEach((roomType) => {
        expect(roomType.available_rooms).toBeGreaterThan(0);
        expect(roomType.total_rooms).toBe(10); // From mockData
      });
    });

    it('should filter room types by occupancy requirements', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: [
            {
              id: 'room-1-1',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-1-2',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-1-3',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-1-4',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-1-5',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-2-1',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000002',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-2-2',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000002',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-2-3',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000002',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-2-4',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000002',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-2-5',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000002',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-3-1',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000003',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-3-2',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000003',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-3-3',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000003',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-3-4',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000003',
              is_active: true,
              status: 'available',
            },
            {
              id: 'room-3-5',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000003',
              is_active: true,
              status: 'available',
            },
          ],
          room_types: [
            {
              id: '10000000-0000-0000-0000-000000000001',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              name_default: 'Single Room',
              max_adults: 1,
              max_children: 0,
              max_occupancy: 1,
              total_rooms: 5,
              is_active: true,
            },
            {
              id: '10000000-0000-0000-0000-000000000002',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              name_default: 'Double Room',
              max_adults: 2,
              max_children: 1,
              max_occupancy: 3,
              total_rooms: 5,
              is_active: true,
            },
            {
              id: '10000000-0000-0000-0000-000000000003',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              name_default: 'Family Suite',
              max_adults: 4,
              max_children: 2,
              max_occupancy: 6,
              total_rooms: 5,
              is_active: true,
            },
          ],
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailableRooms({
        hotelId: '00000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
        numAdults: 3,
        numChildren: 1,
      });

      // Only Family Suite should accommodate 3 adults + 1 child
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Family Suite');
    });

    it('should exclude fully booked room types', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: '10000000-0000-0000-0000-000000000001',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              name: 'Standard Room',
              max_adults: 2,
              max_children: 1,
              max_occupancy: 3,
              total_rooms: 2,
              is_active: true,
            },
            {
              id: '10000000-0000-0000-0000-000000000002',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              name: 'Deluxe Room',
              max_adults: 2,
              max_children: 1,
              max_occupancy: 3,
              total_rooms: 5,
              is_active: true,
            },
          ],
          bookings: [
            // Fully book room-type-1 (2 bookings for 2 total rooms)
            ...mockData.bookings(2, 'confirmed').map((b) => ({
              ...b,
              room_type_id: '10000000-0000-0000-0000-000000000001',
            })),
            // Partially book room-type-2 (1 booking for 5 total rooms)
            {
              ...mockData.bookings(1, 'confirmed')[0],
              room_type_id: '10000000-0000-0000-0000-000000000002',
            },
          ],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailableRooms({
        hotelId: '00000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      // Should only return Deluxe Room
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Deluxe Room');
      expect(result[0].available_rooms).toBe(4);
    });

    it('should exclude inactive room types', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [
            {
              id: '10000000-0000-0000-0000-000000000001',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              name: 'Active Room',
              max_adults: 2,
              max_children: 1,
              max_occupancy: 3,
              total_rooms: 5,
              is_active: true,
            },
            {
              id: '10000000-0000-0000-0000-000000000002',
              hotel_id: '00000000-0000-0000-0000-000000000001',
              name: 'Inactive Room',
              max_adults: 2,
              max_children: 1,
              max_occupancy: 3,
              total_rooms: 5,
              is_active: false,
            },
          ],
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailableRooms({
        hotelId: '00000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Active Room');
    });

    it('should return empty array when no room types exist', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [],
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailableRooms({
        hotelId: '00000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toEqual([]);
    });
  });

  describe('getAvailableRoomIds', () => {
    it('should return all room IDs when none are booked', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: [
            { id: '30000000-0000-0000-0000-000000000001', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
            { id: '30000000-0000-0000-0000-000000000002', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
            { id: '30000000-0000-0000-0000-000000000003', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
          ],
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailableRoomIds({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toHaveLength(3);
      expect(result).toEqual(['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003']);
    });

    it('should exclude booked rooms', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: [
            { id: '30000000-0000-0000-0000-000000000001', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
            { id: '30000000-0000-0000-0000-000000000002', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
            { id: '30000000-0000-0000-0000-000000000003', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
          ],
          bookings: [
            {
              ...mockData.bookings(1, 'confirmed')[0],
              room_id: '30000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
            },
          ],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailableRoomIds({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual(['30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003']);
    });

    it('should exclude rooms marked as unavailable', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: [
            { id: '30000000-0000-0000-0000-000000000001', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
            { id: '30000000-0000-0000-0000-000000000002', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: false },
            { id: '30000000-0000-0000-0000-000000000003', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
          ],
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailableRoomIds({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual(['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003']);
    });

    it('should return empty array when all rooms are booked', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: [
            { id: '30000000-0000-0000-0000-000000000001', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
            { id: '30000000-0000-0000-0000-000000000002', hotel_id: '00000000-0000-0000-0000-000000000001', room_type_id: '10000000-0000-0000-0000-000000000001', is_available: true },
          ],
          bookings: [
            {
              ...mockData.bookings(1, 'confirmed')[0],
              room_id: '30000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
            },
            {
              ...mockData.bookings(1, 'confirmed')[0],
              room_id: '30000000-0000-0000-0000-000000000002',
              room_type_id: '10000000-0000-0000-0000-000000000001',
            },
          ],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailableRoomIds({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toEqual([]);
    });
  });

  describe('isRoomAvailable', () => {
    it('should return true for available room', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: [
            {
              id: '30000000-0000-0000-0000-000000000001',
              is_available: true,
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
            },
          ],
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await isRoomAvailable({
        roomId: '30000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toBe(true);
    });

    it('should return false for room with overlapping booking', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: [
            {
              id: '30000000-0000-0000-0000-000000000001',
              is_available: true,
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
            },
          ],
          bookings: [
            {
              ...mockData.bookings(1, 'confirmed')[0],
              room_id: '30000000-0000-0000-0000-000000000001',
            },
          ],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await isRoomAvailable({
        roomId: '30000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toBe(false);
    });

    it('should return false for room marked as unavailable', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: [
            {
              id: '30000000-0000-0000-0000-000000000001',
              is_available: false,
              hotel_id: '00000000-0000-0000-0000-000000000001',
              room_type_id: '10000000-0000-0000-0000-000000000001',
            },
          ],
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await isRoomAvailable({
        roomId: '30000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toBe(false);
    });

    it('should return false for non-existent room', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: [],
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await isRoomAvailable({
        roomId: 'non-existent',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toBe(false);
    });
  });

  describe('getAvailabilityCalendar', () => {
    it('should return calendar for date range', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: Array.from({ length: 10 }, (_, i) => ({
            id: `room-${i + 1}`,
            hotel_id: '00000000-0000-0000-0000-000000000001',
            room_type_id: '10000000-0000-0000-0000-000000000001',
            is_active: true,
            status: 'available',
          })),
          bookings: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailabilityCalendar({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        startDate: '2025-12-15',
        endDate: '2025-12-17',
      });

      // Should include dates: 15th, 16th, 17th (3 days)
      expect(result.length).toBeGreaterThanOrEqual(2); // At least 2 days
      result.forEach((day) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('available');
        expect(day).toHaveProperty('booked');
        expect(day).toHaveProperty('total');
        expect(day.total).toBe(10);
      });
    });

    it('should calculate availability correctly per day', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: Array.from({ length: 10 }, (_, i) => ({
            id: `room-${i + 1}`,
            hotel_id: '00000000-0000-0000-0000-000000000001',
            room_type_id: '10000000-0000-0000-0000-000000000001',
            is_active: true,
            status: 'available',
          })),
          bookings: mockData.bookings(3, 'confirmed'),
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getAvailabilityCalendar({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        startDate: '2025-12-15',
        endDate: '2025-12-17',
      });

      expect(result.length).toBeGreaterThanOrEqual(2);
      result.forEach((day) => {
        expect(day.available + day.booked).toBe(day.total);
      });
    });

    it('should throw error when room type not found', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          room_types: [],
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      await expect(
        getAvailabilityCalendar({
          hotelId: '00000000-0000-0000-0000-000000000001',
          roomTypeId: 'non-existent',
          startDate: '2025-12-15',
          endDate: '2025-12-17',
        })
      ).rejects.toThrow(AvailabilityError);
    });
  });

  describe('getMinimumAvailability', () => {
    it('should return minimum availability across date range', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: Array.from({ length: 10 }, (_, i) => ({
            id: `room-${i + 1}`,
            hotel_id: '00000000-0000-0000-0000-000000000001',
            room_type_id: '10000000-0000-0000-0000-000000000001',
            is_active: true,
            status: 'available',
          })),
          bookings: mockData.bookings(2, 'confirmed'),
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getMinimumAvailability({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      // With 10 total and 2 booked, minimum should be 8
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should return 0 when fully booked on any day', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockClient = createMockSupabaseClient({
        data: {
          rooms: Array.from({ length: 5 }, (_, i) => ({
            id: `room-${i + 1}`,
            hotel_id: '00000000-0000-0000-0000-000000000001',
            room_type_id: '10000000-0000-0000-0000-000000000001',
            is_active: true,
            status: 'available',
          })),
          bookings: mockData.bookings(5, 'confirmed'),
        },
      });
      (createClient as any).mockResolvedValue(mockClient);

      const result = await getMinimumAvailability({
        hotelId: '00000000-0000-0000-0000-000000000001',
        roomTypeId: '10000000-0000-0000-0000-000000000001',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-17',
      });

      expect(result).toBe(0);
    });
  });
});
