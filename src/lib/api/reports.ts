import { createClient } from '@/lib/supabase/client';

export type DateRange = 'today' | 'week' | 'month' | 'custom';

export interface CustomDateRange {
  from: Date;
  to: Date;
}

export interface DashboardMetrics {
  occupancyRate: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
  totalRevenue: number;
  previousOccupancyRate: number;
  previousAverageDailyRate: number;
  previousRevenuePerAvailableRoom: number;
  previousTotalRevenue: number;
}

export interface OccupancyDataPoint {
  date: string;
  occupancy: number;
  available: number;
  booked: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  roomType: string;
}

export interface RevenueByRoomType {
  roomType: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface BookingSource {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopRoom {
  roomNumber: string;
  roomType: string;
  bookings: number;
  revenue: number;
  occupancyRate: number;
}

function getDateRangeDates(
  range: DateRange,
  customRange?: CustomDateRange
): { from: Date; to: Date; previousFrom: Date; previousTo: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let from: Date;
  let to: Date;

  switch (range) {
    case 'today':
      from = today;
      to = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
      break;
    case 'week': {
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      from = new Date(today.getTime() - diff * 24 * 60 * 60 * 1000);
      to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      break;
    }
    case 'month':
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'custom':
      if (!customRange) {
        throw new Error('Custom range requires from and to dates');
      }
      from = customRange.from;
      to = customRange.to;
      break;
    default:
      from = today;
      to = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
  }

  const duration = to.getTime() - from.getTime();
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - duration);

  return { from, to, previousFrom, previousTo };
}

export async function fetchDashboardMetrics(
  tenantId: string,
  range: DateRange,
  customRange?: CustomDateRange
): Promise<DashboardMetrics> {
  const supabase = createClient();
  const { from, to, previousFrom, previousTo } = getDateRangeDates(range, customRange);

  // Fetch current period bookings
  const { data: currentBookings, error: currentError } = await supabase
    .from('bookings')
    .select('total_price_cents, room_id, check_in_date, check_out_date')
    .eq('hotel_id', tenantId)
    .gte('check_in_date', from.toISOString().split('T')[0])
    .lte('check_in_date', to.toISOString().split('T')[0])
    .in('status', ['confirmed', 'checked_in', 'checked_out']);

  if (currentError) {
    console.error('Error fetching current bookings:', currentError);
    throw currentError;
  }

  // Fetch previous period bookings
  const { data: previousBookings, error: previousError } = await supabase
    .from('bookings')
    .select('total_price_cents, room_id, check_in_date, check_out_date')
    .eq('hotel_id', tenantId)
    .gte('check_in_date', previousFrom.toISOString().split('T')[0])
    .lte('check_in_date', previousTo.toISOString().split('T')[0])
    .in('status', ['confirmed', 'checked_in', 'checked_out']);

  if (previousError) {
    console.error('Error fetching previous bookings:', previousError);
    throw previousError;
  }

  // Fetch total rooms
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id')
    .eq('hotel_id', tenantId)
    .eq('is_active', true);

  if (roomsError) {
    console.error('Error fetching rooms:', roomsError);
    throw roomsError;
  }

  const totalRooms = rooms?.length || 0;
  const daysInPeriod = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  const availableRoomNights = totalRooms * daysInPeriod;

  // Calculate current period metrics (convert cents to dollars)
  const currentTotalRevenue = (currentBookings?.reduce((sum, b) => sum + (b.total_price_cents || 0), 0) || 0) / 100;
  const currentBookedRoomNights = currentBookings?.length || 0;
  const currentOccupancyRate = availableRoomNights > 0 ? (currentBookedRoomNights / availableRoomNights) * 100 : 0;
  const currentADR = currentBookedRoomNights > 0 ? currentTotalRevenue / currentBookedRoomNights : 0;
  const currentRevPAR = availableRoomNights > 0 ? currentTotalRevenue / availableRoomNights : 0;

  // Calculate previous period metrics (convert cents to dollars)
  const previousTotalRevenue = (previousBookings?.reduce((sum, b) => sum + (b.total_price_cents || 0), 0) || 0) / 100;
  const previousBookedRoomNights = previousBookings?.length || 0;
  const previousOccupancyRate = availableRoomNights > 0 ? (previousBookedRoomNights / availableRoomNights) * 100 : 0;
  const previousADR = previousBookedRoomNights > 0 ? previousTotalRevenue / previousBookedRoomNights : 0;
  const previousRevPAR = availableRoomNights > 0 ? previousTotalRevenue / availableRoomNights : 0;

  return {
    occupancyRate: currentOccupancyRate,
    averageDailyRate: currentADR,
    revenuePerAvailableRoom: currentRevPAR,
    totalRevenue: currentTotalRevenue,
    previousOccupancyRate,
    previousAverageDailyRate: previousADR,
    previousRevenuePerAvailableRoom: previousRevPAR,
    previousTotalRevenue,
  };
}

export async function fetchOccupancyData(
  tenantId: string,
  range: DateRange,
  customRange?: CustomDateRange
): Promise<OccupancyDataPoint[]> {
  const supabase = createClient();
  const { from, to } = getDateRangeDates(range, customRange);

  // Fetch total rooms
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id')
    .eq('hotel_id', tenantId)
    .eq('is_active', true);

  if (roomsError) {
    console.error('Error fetching rooms:', roomsError);
    throw roomsError;
  }

  const totalRooms = rooms?.length || 0;

  // Fetch bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('check_in_date, check_out_date')
    .eq('hotel_id', tenantId)
    .gte('check_in_date', from.toISOString().split('T')[0])
    .lte('check_in_date', to.toISOString().split('T')[0])
    .in('status', ['confirmed', 'checked_in', 'checked_out']);

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
    throw bookingsError;
  }

  // Group bookings by date
  const dataPoints: OccupancyDataPoint[] = [];
  const currentDate = new Date(from);

  while (currentDate <= to) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const bookedCount = bookings?.filter(b => {
      return b.check_in_date === dateStr;
    }).length || 0;

    const occupancy = totalRooms > 0 ? (bookedCount / totalRooms) * 100 : 0;

    dataPoints.push({
      date: dateStr,
      occupancy,
      available: totalRooms,
      booked: bookedCount,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dataPoints;
}

export async function fetchRevenueData(
  tenantId: string,
  range: DateRange,
  customRange?: CustomDateRange
): Promise<RevenueByRoomType[]> {
  const supabase = createClient();
  const { from, to } = getDateRangeDates(range, customRange);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      total_price_cents,
      room_type_id,
      room_types!inner(name_default)
    `)
    .eq('hotel_id', tenantId)
    .gte('check_in_date', from.toISOString().split('T')[0])
    .lte('check_in_date', to.toISOString().split('T')[0])
    .in('status', ['confirmed', 'checked_in', 'checked_out']);

  if (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }

  // Group by room type
  const revenueByType = new Map<string, number>();
  let totalRevenue = 0;

  bookings?.forEach(booking => {
    const roomType = (booking.room_types as any)?.name_default || 'Unknown';
    const revenue = (booking.total_price_cents || 0) / 100;
    revenueByType.set(roomType, (revenueByType.get(roomType) || 0) + revenue);
    totalRevenue += revenue;
  });

  // Define colors for room types
  const colors = ['#C4A484', '#A8B5A0', '#8B9DC3', '#C48B84', '#A4A484'];

  // Convert to array and calculate percentages
  const result: RevenueByRoomType[] = Array.from(revenueByType.entries())
    .map(([roomType, revenue], index) => ({
      roomType,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return result;
}

export async function fetchBookingSourceData(
  tenantId: string,
  range: DateRange,
  customRange?: CustomDateRange
): Promise<BookingSource[]> {
  const supabase = createClient();
  const { from, to } = getDateRangeDates(range, customRange);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('booking_source')
    .eq('hotel_id', tenantId)
    .gte('check_in', from.toISOString())
    .lte('check_in', to.toISOString())
    .in('status', ['confirmed', 'checked_in', 'checked_out']);

  if (error) {
    console.error('Error fetching booking sources:', error);
    throw error;
  }

  // Group by source
  const sourceCount = new Map<string, number>();
  let totalBookings = 0;

  bookings?.forEach(booking => {
    const source = booking.booking_source || 'Direct';
    sourceCount.set(source, (sourceCount.get(source) || 0) + 1);
    totalBookings += 1;
  });

  // Define colors for sources
  const colors = ['#C4A484', '#A8B5A0', '#8B9DC3', '#C48B84', '#A4A484'];

  // Convert to array and calculate percentages
  const result: BookingSource[] = Array.from(sourceCount.entries())
    .map(([source, count], index) => ({
      source,
      count,
      percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.count - a.count);

  return result;
}

export async function fetchTopRooms(
  tenantId: string,
  range: DateRange,
  customRange?: CustomDateRange,
  limit: number = 10
): Promise<TopRoom[]> {
  const supabase = createClient();
  const { from, to } = getDateRangeDates(range, customRange);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      total_price_cents,
      room_id,
      rooms!inner(id, room_number),
      room_types!inner(name_default)
    `)
    .eq('hotel_id', tenantId)
    .gte('check_in_date', from.toISOString().split('T')[0])
    .lte('check_in_date', to.toISOString().split('T')[0])
    .in('status', ['confirmed', 'checked_in', 'checked_out']);

  if (error) {
    console.error('Error fetching top rooms:', error);
    throw error;
  }

  // Group by room
  const roomStats = new Map<string, {
    roomNumber: string;
    roomType: string;
    bookings: number;
    revenue: number;
  }>();

  bookings?.forEach(booking => {
    const room = booking.rooms as any;
    const roomType = (booking.room_types as any)?.name_default || 'Unknown';
    const roomId = room?.id;
    const roomNumber = room?.room_number || 'Unknown';
    const revenue = (booking.total_price_cents || 0) / 100;

    if (roomId) {
      const existing = roomStats.get(roomId);
      if (existing) {
        existing.bookings += 1;
        existing.revenue += revenue;
      } else {
        roomStats.set(roomId, {
          roomNumber,
          roomType,
          bookings: 1,
          revenue,
        });
      }
    }
  });

  // Calculate days in period
  const daysInPeriod = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

  // Convert to array and calculate occupancy rate
  const result: TopRoom[] = Array.from(roomStats.values())
    .map(stats => ({
      ...stats,
      occupancyRate: daysInPeriod > 0 ? (stats.bookings / daysInPeriod) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return result;
}
