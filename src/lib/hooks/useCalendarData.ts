'use client';

import { useState, useEffect, useMemo } from 'react';
import { startOfDay, endOfDay, isWithinInterval, differenceInDays } from 'date-fns';
import type { Room, Booking } from '@/types/booking';

export interface CalendarRoom {
  id: string;
  roomNumber?: string;
  name: string;
  roomTypeId: string;
  roomTypeName: string;
  status: 'available' | 'occupied' | 'maintenance' | 'blocked';
}

export interface CalendarBooking {
  id: string;
  roomId: string;
  roomNumber: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'pending' | 'cancelled';
  nights: number;
  adults: number;
  children: number;
}

export interface CalendarData {
  rooms: CalendarRoom[];
  bookings: CalendarBooking[];
  roomTypes: Array<{ value: string; label: string }>;
  isLoading: boolean;
  error: string | null;
}

interface UseCalendarDataOptions {
  hotelId?: string;
  startDate: Date;
  endDate: Date;
  roomTypeFilter?: string;
}

/**
 * Hook for fetching and managing calendar data
 * Transforms room and booking data for tape chart display
 */
export function useCalendarData({
  hotelId,
  startDate,
  endDate,
  roomTypeFilter,
}: UseCalendarDataOptions): CalendarData {
  const [rooms, setRooms] = useState<CalendarRoom[]>([]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [roomTypes, setRoomTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms and bookings
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, this would be API calls
        // For now, using mock data

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock room types
        const mockRoomTypes = [
          { value: 'deluxe', label: 'Deluxe Room' },
          { value: 'suite', label: 'Suite' },
          { value: 'standard', label: 'Standard Room' },
          { value: 'penthouse', label: 'Penthouse' },
        ];

        // Mock rooms
        const mockRooms: CalendarRoom[] = [
          // Deluxe Rooms
          { id: '1', roomNumber: '101', name: 'Deluxe 101', roomTypeId: 'deluxe', roomTypeName: 'Deluxe Room', status: 'available' },
          { id: '2', roomNumber: '102', name: 'Deluxe 102', roomTypeId: 'deluxe', roomTypeName: 'Deluxe Room', status: 'available' },
          { id: '3', roomNumber: '103', name: 'Deluxe 103', roomTypeId: 'deluxe', roomTypeName: 'Deluxe Room', status: 'available' },
          { id: '4', roomNumber: '104', name: 'Deluxe 104', roomTypeId: 'deluxe', roomTypeName: 'Deluxe Room', status: 'maintenance' },
          { id: '5', roomNumber: '105', name: 'Deluxe 105', roomTypeId: 'deluxe', roomTypeName: 'Deluxe Room', status: 'available' },

          // Suites
          { id: '6', roomNumber: '201', name: 'Suite 201', roomTypeId: 'suite', roomTypeName: 'Suite', status: 'available' },
          { id: '7', roomNumber: '202', name: 'Suite 202', roomTypeId: 'suite', roomTypeName: 'Suite', status: 'available' },
          { id: '8', roomNumber: '203', name: 'Suite 203', roomTypeId: 'suite', roomTypeName: 'Suite', status: 'available' },

          // Standard Rooms
          { id: '9', roomNumber: '301', name: 'Standard 301', roomTypeId: 'standard', roomTypeName: 'Standard Room', status: 'available' },
          { id: '10', roomNumber: '302', name: 'Standard 302', roomTypeId: 'standard', roomTypeName: 'Standard Room', status: 'available' },
          { id: '11', roomNumber: '303', name: 'Standard 303', roomTypeId: 'standard', roomTypeName: 'Standard Room', status: 'blocked' },
          { id: '12', roomNumber: '304', name: 'Standard 304', roomTypeId: 'standard', roomTypeName: 'Standard Room', status: 'available' },
          { id: '13', roomNumber: '305', name: 'Standard 305', roomTypeId: 'standard', roomTypeName: 'Standard Room', status: 'available' },
          { id: '14', roomNumber: '306', name: 'Standard 306', roomTypeId: 'standard', roomTypeName: 'Standard Room', status: 'available' },

          // Penthouse
          { id: '15', roomNumber: 'PH1', name: 'Penthouse 1', roomTypeId: 'penthouse', roomTypeName: 'Penthouse', status: 'available' },
        ];

        // Mock bookings - generate realistic data
        const today = startOfDay(new Date());
        const mockBookings: CalendarBooking[] = [
          {
            id: 'b1',
            roomId: '1',
            roomNumber: '101',
            guestName: 'Alexander Mitchell',
            checkIn: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            status: 'checked-in',
            nights: 4,
            adults: 2,
            children: 0,
          },
          {
            id: 'b2',
            roomId: '2',
            roomNumber: '102',
            guestName: 'Sophia Anderson',
            checkIn: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
            status: 'confirmed',
            nights: 4,
            adults: 1,
            children: 0,
          },
          {
            id: 'b3',
            roomId: '3',
            roomNumber: '103',
            guestName: 'Marcus Thompson',
            checkIn: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
            status: 'pending',
            nights: 4,
            adults: 2,
            children: 1,
          },
          {
            id: 'b4',
            roomId: '5',
            roomNumber: '105',
            guestName: 'Isabella Rodriguez',
            checkIn: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
            status: 'confirmed',
            nights: 4,
            adults: 2,
            children: 2,
          },
          {
            id: 'b5',
            roomId: '6',
            roomNumber: '201',
            guestName: 'Victoria Chen',
            checkIn: today,
            checkOut: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
            status: 'confirmed',
            nights: 3,
            adults: 2,
            children: 0,
          },
          {
            id: 'b6',
            roomId: '7',
            roomNumber: '202',
            guestName: 'Sebastian Blake',
            checkIn: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
            status: 'checked-in',
            nights: 5,
            adults: 1,
            children: 0,
          },
          {
            id: 'b7',
            roomId: '8',
            roomNumber: '203',
            guestName: 'Olivia Martinez',
            checkIn: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000),
            status: 'confirmed',
            nights: 4,
            adults: 2,
            children: 0,
          },
          {
            id: 'b8',
            roomId: '9',
            roomNumber: '301',
            guestName: 'Ethan Williams',
            checkIn: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
            status: 'pending',
            nights: 2,
            adults: 1,
            children: 0,
          },
          {
            id: 'b9',
            roomId: '10',
            roomNumber: '302',
            guestName: 'Ava Johnson',
            checkIn: today,
            checkOut: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
            status: 'confirmed',
            nights: 6,
            adults: 2,
            children: 1,
          },
          {
            id: 'b10',
            roomId: '12',
            roomNumber: '304',
            guestName: 'Benjamin Davis',
            checkIn: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
            status: 'checked-in',
            nights: 4,
            adults: 1,
            children: 0,
          },
          {
            id: 'b11',
            roomId: '13',
            roomNumber: '305',
            guestName: 'Charlotte Taylor',
            checkIn: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),
            status: 'confirmed',
            nights: 4,
            adults: 2,
            children: 0,
          },
          {
            id: 'b12',
            roomId: '14',
            roomNumber: '306',
            guestName: 'James Wilson',
            checkIn: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
            status: 'confirmed',
            nights: 2,
            adults: 1,
            children: 0,
          },
          {
            id: 'b13',
            roomId: '15',
            roomNumber: 'PH1',
            guestName: 'Eleanor Ashford',
            checkIn: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            checkOut: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000),
            status: 'confirmed',
            nights: 7,
            adults: 2,
            children: 0,
          },
        ];

        setRoomTypes(mockRoomTypes);
        setRooms(mockRooms);
        setBookings(mockBookings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch calendar data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hotelId, startDate, endDate]);

  // Filter rooms by room type
  const filteredRooms = useMemo(() => {
    if (!roomTypeFilter || roomTypeFilter === 'all') {
      return rooms;
    }
    return rooms.filter(room => room.roomTypeId === roomTypeFilter);
  }, [rooms, roomTypeFilter]);

  // Filter bookings to only include those within the date range
  const filteredBookings = useMemo(() => {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    return bookings.filter(booking => {
      const bookingStart = startOfDay(booking.checkIn);
      const bookingEnd = endOfDay(booking.checkOut);

      // Check if booking overlaps with the date range
      return (
        (bookingStart <= end && bookingEnd >= start) ||
        isWithinInterval(bookingStart, { start, end }) ||
        isWithinInterval(bookingEnd, { start, end })
      );
    });
  }, [bookings, startDate, endDate]);

  return {
    rooms: filteredRooms,
    bookings: filteredBookings,
    roomTypes,
    isLoading,
    error,
  };
}
