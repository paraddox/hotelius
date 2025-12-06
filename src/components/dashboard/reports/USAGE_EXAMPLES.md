# Analytics Components - Usage Examples

This file contains practical examples of how to use each component in the analytics system.

## Complete Page Example

```tsx
'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign, Percent, Home } from 'lucide-react';
import { DateRange, CustomDateRange } from '@/lib/api/reports';
import { useReportData } from '@/lib/hooks/useReportData';
import {
  DateRangeSelector,
  MetricCard,
  OccupancyChart,
  RevenueChart,
  BookingSourceChart,
  TopRoomsTable,
} from '@/components/dashboard/reports';

export default function AnalyticsPage() {
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
  } = useReportData({
    tenantId: 'tenant-123',
    range: dateRange,
    customRange,
  });

  return (
    <div className="space-y-6">
      <h1>Analytics Dashboard</h1>

      <DateRangeSelector
        value={dateRange}
        customRange={customRange}
        onChange={(range, custom) => {
          setDateRange(range);
          setCustomRange(custom);
        }}
      />

      {!isLoading && (
        <>
          <div className="grid grid-cols-4 gap-6">
            <MetricCard
              title="Occupancy Rate"
              value={metrics?.occupancyRate || 0}
              previousValue={metrics?.previousOccupancyRate}
              format="percentage"
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

          <OccupancyChart data={occupancyData || []} />

          <div className="grid grid-cols-2 gap-6">
            <RevenueChart data={revenueData || []} />
            <BookingSourceChart data={bookingSourceData || []} />
          </div>

          <TopRoomsTable data={topRooms || []} />
        </>
      )}
    </div>
  );
}
```

## Individual Component Examples

### DateRangeSelector

**Basic Usage**
```tsx
import { useState } from 'react';
import { DateRangeSelector } from '@/components/dashboard/reports';

function MyComponent() {
  const [range, setRange] = useState('month');

  return (
    <DateRangeSelector
      value={range}
      onChange={setRange}
    />
  );
}
```

**With Custom Range**
```tsx
import { useState } from 'react';
import { DateRangeSelector } from '@/components/dashboard/reports';
import { DateRange, CustomDateRange } from '@/lib/api/reports';

function MyComponent() {
  const [range, setRange] = useState<DateRange>('month');
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>();

  return (
    <DateRangeSelector
      value={range}
      customRange={customRange}
      onChange={(newRange, newCustom) => {
        setRange(newRange);
        setCustomRange(newCustom);
      }}
    />
  );
}
```

### MetricCard

**Currency Format**
```tsx
import { MetricCard } from '@/components/dashboard/reports';
import { DollarSign } from 'lucide-react';

<MetricCard
  title="Total Revenue"
  value={50000}
  previousValue={45000}
  format="currency"
  icon={<DollarSign className="w-5 h-5" />}
/>
```

**Percentage Format**
```tsx
import { MetricCard } from '@/components/dashboard/reports';
import { Percent } from 'lucide-react';

<MetricCard
  title="Occupancy Rate"
  value={75.5}
  previousValue={70.2}
  format="percentage"
  icon={<Percent className="w-5 h-5" />}
/>
```

**With Sparkline**
```tsx
import { MetricCard } from '@/components/dashboard/reports';
import { TrendingUp } from 'lucide-react';

const sparklineData = [100, 120, 115, 130, 125, 140, 135];

<MetricCard
  title="RevPAR"
  value={140}
  previousValue={130}
  format="currency"
  sparklineData={sparklineData}
  icon={<TrendingUp className="w-5 h-5" />}
/>
```

**Number Format**
```tsx
import { MetricCard } from '@/components/dashboard/reports';
import { Users } from 'lucide-react';

<MetricCard
  title="Total Guests"
  value={1234}
  previousValue={1100}
  format="number"
  icon={<Users className="w-5 h-5" />}
/>
```

### OccupancyChart

**Basic Usage**
```tsx
import { OccupancyChart } from '@/components/dashboard/reports';

const occupancyData = [
  { date: '2024-12-01', occupancy: 75, available: 100, booked: 75 },
  { date: '2024-12-02', occupancy: 80, available: 100, booked: 80 },
  { date: '2024-12-03', occupancy: 65, available: 100, booked: 65 },
];

<OccupancyChart data={occupancyData} />
```

**Custom Title**
```tsx
<OccupancyChart
  data={occupancyData}
  title="Weekly Occupancy Trends"
/>
```

### RevenueChart

**Basic Usage**
```tsx
import { RevenueChart } from '@/components/dashboard/reports';

const revenueData = [
  { roomType: 'Deluxe Suite', revenue: 15000, percentage: 40, color: '#C4A484' },
  { roomType: 'Standard Room', revenue: 12000, percentage: 32, color: '#A8B5A0' },
  { roomType: 'Premium Suite', revenue: 10500, percentage: 28, color: '#8B9DC3' },
];

<RevenueChart data={revenueData} />
```

**Custom Title**
```tsx
<RevenueChart
  data={revenueData}
  title="Monthly Revenue Breakdown"
/>
```

### BookingSourceChart

**Basic Usage**
```tsx
import { BookingSourceChart } from '@/components/dashboard/reports';

const bookingSourceData = [
  { source: 'Direct', count: 45, percentage: 45, color: '#C4A484' },
  { source: 'Booking.com', count: 30, percentage: 30, color: '#A8B5A0' },
  { source: 'Expedia', count: 15, percentage: 15, color: '#8B9DC3' },
  { source: 'Airbnb', count: 10, percentage: 10, color: '#C48B84' },
];

<BookingSourceChart data={bookingSourceData} />
```

**Custom Title**
```tsx
<BookingSourceChart
  data={bookingSourceData}
  title="Booking Channel Distribution"
/>
```

### TopRoomsTable

**Basic Usage**
```tsx
import { TopRoomsTable } from '@/components/dashboard/reports';

const topRooms = [
  {
    roomNumber: '101',
    roomType: 'Deluxe Suite',
    bookings: 25,
    revenue: 15000,
    occupancyRate: 85.5,
  },
  {
    roomNumber: '202',
    roomType: 'Premium Suite',
    bookings: 22,
    revenue: 14500,
    occupancyRate: 78.2,
  },
  {
    roomNumber: '305',
    roomType: 'Standard Room',
    bookings: 20,
    revenue: 12000,
    occupancyRate: 72.1,
  },
];

<TopRoomsTable data={topRooms} />
```

**Custom Title**
```tsx
<TopRoomsTable
  data={topRooms}
  title="Best Performing Rooms This Month"
/>
```

## Hook Examples

### useReportData

**Fetch All Data**
```tsx
import { useReportData } from '@/lib/hooks/useReportData';

function MyComponent() {
  const { metrics, occupancyData, revenueData, isLoading, error } = useReportData({
    tenantId: 'tenant-123',
    range: 'month',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Occupancy: {metrics?.occupancyRate}%</p>
      {/* Use other data */}
    </div>
  );
}
```

**Manual Refetch**
```tsx
import { useReportData } from '@/lib/hooks/useReportData';
import { Button } from '@/components/ui/Button';

function MyComponent() {
  const { metrics, isLoading, refetch } = useReportData({
    tenantId: 'tenant-123',
    range: 'week',
  });

  return (
    <div>
      <p>Revenue: ${metrics?.totalRevenue}</p>
      <Button onClick={refetch}>Refresh Data</Button>
    </div>
  );
}
```

**Disable Auto-fetch**
```tsx
import { useReportData } from '@/lib/hooks/useReportData';
import { useEffect } from 'react';

function MyComponent() {
  const { metrics, refetch } = useReportData({
    tenantId: 'tenant-123',
    range: 'month',
    autoFetch: false, // Don't fetch on mount
  });

  useEffect(() => {
    // Fetch only when certain condition is met
    if (someCondition) {
      refetch();
    }
  }, [someCondition, refetch]);

  return <div>{/* Component content */}</div>;
}
```

### useDashboardMetrics

**Fetch Only Metrics**
```tsx
import { useDashboardMetrics } from '@/lib/hooks/useReportData';

function MetricsOnlyComponent() {
  const { data, isLoading } = useDashboardMetrics('tenant-123', 'month');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Occupancy: {data?.occupancyRate}%</p>
      <p>ADR: ${data?.averageDailyRate}</p>
      <p>RevPAR: ${data?.revenuePerAvailableRoom}</p>
      <p>Revenue: ${data?.totalRevenue}</p>
    </div>
  );
}
```

## API Function Examples

### fetchDashboardMetrics

```tsx
import { fetchDashboardMetrics } from '@/lib/api/reports';

// This week
const metrics = await fetchDashboardMetrics('tenant-123', 'week');
console.log(metrics.occupancyRate); // 75.5

// Custom range
const customMetrics = await fetchDashboardMetrics(
  'tenant-123',
  'custom',
  {
    from: new Date('2024-12-01'),
    to: new Date('2024-12-31'),
  }
);
```

### fetchOccupancyData

```tsx
import { fetchOccupancyData } from '@/lib/api/reports';

const occupancyData = await fetchOccupancyData('tenant-123', 'month');
occupancyData.forEach(point => {
  console.log(`${point.date}: ${point.occupancy}%`);
});
```

### fetchRevenueData

```tsx
import { fetchRevenueData } from '@/lib/api/reports';

const revenueData = await fetchRevenueData('tenant-123', 'month');
revenueData.forEach(item => {
  console.log(`${item.roomType}: $${item.revenue} (${item.percentage}%)`);
});
```

### fetchBookingSourceData

```tsx
import { fetchBookingSourceData } from '@/lib/api/reports';

const sourceData = await fetchBookingSourceData('tenant-123', 'month');
sourceData.forEach(source => {
  console.log(`${source.source}: ${source.count} bookings (${source.percentage}%)`);
});
```

### fetchTopRooms

```tsx
import { fetchTopRooms } from '@/lib/api/reports';

// Top 10 rooms (default)
const topRooms = await fetchTopRooms('tenant-123', 'month');

// Top 5 rooms
const top5 = await fetchTopRooms('tenant-123', 'month', undefined, 5);

top5.forEach((room, index) => {
  console.log(`#${index + 1}: Room ${room.roomNumber} - $${room.revenue}`);
});
```

## Layout Examples

### Full-Width Dashboard
```tsx
<div className="space-y-6">
  <DateRangeSelector {...props} />

  <div className="grid grid-cols-4 gap-6">
    <MetricCard {...metric1} />
    <MetricCard {...metric2} />
    <MetricCard {...metric3} />
    <MetricCard {...metric4} />
  </div>

  <OccupancyChart {...props} />

  <div className="grid grid-cols-2 gap-6">
    <RevenueChart {...props} />
    <BookingSourceChart {...props} />
  </div>

  <TopRoomsTable {...props} />
</div>
```

### Sidebar Layout
```tsx
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2 space-y-6">
    <OccupancyChart {...props} />
    <RevenueChart {...props} />
  </div>

  <div className="space-y-6">
    <MetricCard {...metric1} />
    <MetricCard {...metric2} />
    <BookingSourceChart {...props} />
  </div>
</div>
```

### Mobile-Responsive
```tsx
<div className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <MetricCard {...metric1} />
    <MetricCard {...metric2} />
    <MetricCard {...metric3} />
    <MetricCard {...metric4} />
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <OccupancyChart {...props} />
    <RevenueChart {...props} />
  </div>
</div>
```

## Error Handling

```tsx
import { useReportData } from '@/lib/hooks/useReportData';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function MyComponent() {
  const { data, isLoading, error, refetch } = useReportData({
    tenantId: 'tenant-123',
    range: 'month',
  });

  if (error) {
    return (
      <div className="text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="mt-2">Failed to load data</p>
        <p className="text-sm text-gray-500">{error.message}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Rest of component
}
```

## Loading States

```tsx
import { useReportData } from '@/lib/hooks/useReportData';
import { PageSpinner } from '@/components/ui/Spinner';

function MyComponent() {
  const { data, isLoading } = useReportData({
    tenantId: 'tenant-123',
    range: 'month',
  });

  if (isLoading) {
    return <PageSpinner message="Loading analytics..." />;
  }

  // Rest of component
}
```

## TypeScript Types

```tsx
import type {
  DateRange,
  CustomDateRange,
  DashboardMetrics,
  OccupancyDataPoint,
  RevenueByRoomType,
  BookingSource,
  TopRoom,
} from '@/lib/api/reports';

// Use in your components
interface MyComponentProps {
  metrics: DashboardMetrics;
  occupancyData: OccupancyDataPoint[];
  dateRange: DateRange;
}
```
