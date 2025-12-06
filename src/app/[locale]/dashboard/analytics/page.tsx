'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign, Percent, Home } from 'lucide-react';
import { DateRange, CustomDateRange } from '@/lib/api/reports';
import { useReportData } from '@/lib/hooks/useReportData';
import { DateRangeSelector } from '@/components/dashboard/reports/DateRangeSelector';
import { MetricCard } from '@/components/dashboard/reports/MetricCard';
import { OccupancyChart } from '@/components/dashboard/reports/OccupancyChart';
import { RevenueChart } from '@/components/dashboard/reports/RevenueChart';
import { BookingSourceChart } from '@/components/dashboard/reports/BookingSourceChart';
import { TopRoomsTable } from '@/components/dashboard/reports/TopRoomsTable';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  // TODO: Replace with actual tenant ID from auth context
  const tenantId = 'your-tenant-id';

  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>();

  const {
    metrics,
    occupancyData,
    revenueData,
    bookingSourceData,
    topRooms,
    isLoading,
    error,
    refetch,
  } = useReportData({
    tenantId,
    range: dateRange,
    customRange,
    autoFetch: true,
  });

  const handleDateRangeChange = (range: DateRange, custom?: CustomDateRange) => {
    setDateRange(range);
    setCustomRange(custom);
  };

  // Generate sparkline data from occupancy data
  const occupancySparkline = occupancyData?.map(d => d.occupancy) || [];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-['Cormorant_Garamond',Georgia,serif] text-4xl font-semibold text-[#2C2C2C] mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-[#8B8B8B]">
            Track your hotel performance and key metrics
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FFEBEE] text-[#C45C5C]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="font-['Cormorant_Garamond',Georgia,serif] text-xl font-medium text-[#2C2C2C] mb-2">
              Failed to Load Analytics
            </h3>
            <p className="text-sm text-[#8B8B8B] mb-4">
              {error.message || 'An error occurred while loading analytics data.'}
            </p>
            <Button variant="accent" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-['Cormorant_Garamond',Georgia,serif] text-4xl font-semibold text-[#2C2C2C] mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-[#8B8B8B]">
            Track your hotel performance and key metrics
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector
        value={dateRange}
        customRange={customRange}
        onChange={handleDateRangeChange}
      />

      {isLoading ? (
        <PageSpinner message="Loading analytics data..." />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Occupancy Rate"
              value={metrics?.occupancyRate || 0}
              previousValue={metrics?.previousOccupancyRate}
              format="percentage"
              sparklineData={occupancySparkline.length > 0 ? occupancySparkline : undefined}
              icon={<Percent className="w-5 h-5" />}
            />
            <MetricCard
              title="Average Daily Rate"
              value={metrics?.averageDailyRate || 0}
              previousValue={metrics?.previousAverageDailyRate}
              format="currency"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <MetricCard
              title="RevPAR"
              value={metrics?.revenuePerAvailableRoom || 0}
              previousValue={metrics?.previousRevenuePerAvailableRoom}
              format="currency"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              title="Total Revenue"
              value={metrics?.totalRevenue || 0}
              previousValue={metrics?.previousTotalRevenue}
              format="currency"
              icon={<Home className="w-5 h-5" />}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Occupancy Chart */}
            <div className="lg:col-span-2">
              <OccupancyChart data={occupancyData || []} />
            </div>

            {/* Revenue Chart */}
            <RevenueChart data={revenueData || []} />

            {/* Booking Source Chart */}
            <BookingSourceChart data={bookingSourceData || []} />
          </div>

          {/* Top Rooms Table */}
          <TopRoomsTable data={topRooms || []} />

          {/* Export Section */}
          <div className="flex items-center justify-center p-8 bg-[#FAF7F2] rounded-xl border border-[#E8E0D5]">
            <div className="text-center">
              <h3 className="font-['Cormorant_Garamond',Georgia,serif] text-xl font-medium text-[#2C2C2C] mb-2">
                Need to export this data?
              </h3>
              <p className="text-sm text-[#8B8B8B] mb-4">
                Download your analytics in various formats for further analysis
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="secondary" size="sm">
                  Export as PDF
                </Button>
                <Button variant="secondary" size="sm">
                  Export as Excel
                </Button>
                <Button variant="secondary" size="sm">
                  Export as CSV
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
