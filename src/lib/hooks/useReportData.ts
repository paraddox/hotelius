'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboardMetrics,
  fetchOccupancyData,
  fetchRevenueData,
  fetchBookingSourceData,
  fetchTopRooms,
  DateRange,
  CustomDateRange,
  DashboardMetrics,
  OccupancyDataPoint,
  RevenueByRoomType,
  BookingSource,
  TopRoom,
} from '@/lib/api/reports';

interface UseReportDataOptions {
  tenantId: string;
  range: DateRange;
  customRange?: CustomDateRange;
  autoFetch?: boolean;
}

interface UseReportDataReturn {
  metrics: DashboardMetrics | null;
  occupancyData: OccupancyDataPoint[] | null;
  revenueData: RevenueByRoomType[] | null;
  bookingSourceData: BookingSource[] | null;
  topRooms: TopRoom[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useReportData({
  tenantId,
  range,
  customRange,
  autoFetch = true,
}: UseReportDataOptions): UseReportDataReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [occupancyData, setOccupancyData] = useState<OccupancyDataPoint[] | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueByRoomType[] | null>(null);
  const [bookingSourceData, setBookingSourceData] = useState<BookingSource[] | null>(null);
  const [topRooms, setTopRooms] = useState<TopRoom[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [metricsData, occupancyDataResult, revenueDataResult, sourceDataResult, topRoomsData] =
        await Promise.all([
          fetchDashboardMetrics(tenantId, range, customRange),
          fetchOccupancyData(tenantId, range, customRange),
          fetchRevenueData(tenantId, range, customRange),
          fetchBookingSourceData(tenantId, range, customRange),
          fetchTopRooms(tenantId, range, customRange, 10),
        ]);

      setMetrics(metricsData);
      setOccupancyData(occupancyDataResult);
      setRevenueData(revenueDataResult);
      setBookingSourceData(sourceDataResult);
      setTopRooms(topRoomsData);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch report data'));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, range, customRange]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    metrics,
    occupancyData,
    revenueData,
    bookingSourceData,
    topRooms,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Hook for fetching individual metric types
export function useDashboardMetrics(
  tenantId: string,
  range: DateRange,
  customRange?: CustomDateRange
) {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchDashboardMetrics(tenantId, range, customRange);
      setData(result);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, range, customRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useOccupancyData(
  tenantId: string,
  range: DateRange,
  customRange?: CustomDateRange
) {
  const [data, setData] = useState<OccupancyDataPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchOccupancyData(tenantId, range, customRange);
      setData(result);
    } catch (err) {
      console.error('Error fetching occupancy data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch occupancy data'));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, range, customRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
