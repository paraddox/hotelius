# Hotel Analytics & Reports Components

This directory contains all the components for the hotel analytics and reporting system, designed with a luxury boutique hotel aesthetic.

## Design System

- **Fonts**:
  - Headings: Cormorant Garamond
  - Body: DM Sans
- **Colors**:
  - Terracotta: `#C4A484`
  - Charcoal: `#2C2C2C`
  - Cream: `#FAF7F2`
  - Sage: `#A8B5A0`

## Components

### DateRangeSelector
Date range picker for filtering analytics data.

**Features:**
- Preset ranges: Today, This Week, This Month
- Custom date range picker
- Visual feedback for selected range

**Usage:**
```tsx
import { DateRangeSelector } from '@/components/dashboard/reports';

<DateRangeSelector
  value={dateRange}
  customRange={customRange}
  onChange={(range, custom) => {
    setDateRange(range);
    setCustomRange(custom);
  }}
/>
```

### MetricCard
Displays a single metric with comparison to previous period and optional sparkline.

**Features:**
- Multiple format support (currency, percentage, number)
- Percentage change indicator with up/down arrows
- SVG sparkline mini chart
- Icon support

**Usage:**
```tsx
import { MetricCard } from '@/components/dashboard/reports';
import { DollarSign } from 'lucide-react';

<MetricCard
  title="Total Revenue"
  value={50000}
  previousValue={45000}
  format="currency"
  sparklineData={[100, 120, 115, 130, 125, 140]}
  icon={<DollarSign className="w-5 h-5" />}
/>
```

### OccupancyChart
Bar chart showing occupancy rates over time.

**Features:**
- Color-coded bars (high: green, medium: terracotta, low: red)
- Responsive SVG chart
- Interactive tooltips
- Automatic date formatting
- Legend display

**Usage:**
```tsx
import { OccupancyChart } from '@/components/dashboard/reports';

<OccupancyChart
  data={occupancyData}
  title="Occupancy Rate Over Time"
/>
```

### RevenueChart
Bar chart showing revenue breakdown by room type.

**Features:**
- Color-coded bars by room type
- Percentage labels inside bars
- Value labels above bars
- Summary statistics below chart
- Automatic Y-axis scaling

**Usage:**
```tsx
import { RevenueChart } from '@/components/dashboard/reports';

<RevenueChart
  data={revenueData}
  title="Revenue by Room Type"
/>
```

### BookingSourceChart
Donut chart showing booking source distribution.

**Features:**
- SVG donut chart with center statistics
- Color-coded segments
- Interactive legend with detailed breakdown
- Percentage and count display

**Usage:**
```tsx
import { BookingSourceChart } from '@/components/dashboard/reports';

<BookingSourceChart
  data={bookingSourceData}
  title="Booking Sources"
/>
```

### TopRoomsTable
Table showing top performing rooms by revenue.

**Features:**
- Sortable by revenue
- Color-coded occupancy badges
- Summary statistics footer
- Rank indicators
- Responsive design

**Usage:**
```tsx
import { TopRoomsTable } from '@/components/dashboard/reports';

<TopRoomsTable
  data={topRooms}
  title="Top Performing Rooms"
/>
```

## API Functions

Located in `src/lib/api/reports.ts`:

### fetchDashboardMetrics
Fetches key performance metrics (occupancy, ADR, RevPAR, revenue).

```tsx
const metrics = await fetchDashboardMetrics(tenantId, 'month');
```

### fetchOccupancyData
Fetches daily occupancy data for the specified period.

```tsx
const occupancyData = await fetchOccupancyData(tenantId, 'week');
```

### fetchRevenueData
Fetches revenue breakdown by room type.

```tsx
const revenueData = await fetchRevenueData(tenantId, 'month');
```

### fetchBookingSourceData
Fetches booking source distribution.

```tsx
const sourceData = await fetchBookingSourceData(tenantId, 'month');
```

### fetchTopRooms
Fetches top performing rooms.

```tsx
const topRooms = await fetchTopRooms(tenantId, 'month', undefined, 10);
```

## Custom Hook

### useReportData
React hook for fetching and managing all report data.

**Features:**
- Automatic data fetching
- Loading states
- Error handling
- Refetch capability
- All data in one hook

**Usage:**
```tsx
import { useReportData } from '@/lib/hooks/useReportData';

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
  tenantId: 'your-tenant-id',
  range: 'month',
  customRange: undefined,
  autoFetch: true,
});
```

## Pages

### Analytics Dashboard
Main analytics page located at `/dashboard/analytics`.

**Features:**
- All metrics in one view
- Date range filtering
- Real-time refresh
- Export functionality (placeholder)
- Responsive grid layout

**Path:** `src/app/[locale]/dashboard/analytics/page.tsx`

## Data Types

### DateRange
```typescript
type DateRange = 'today' | 'week' | 'month' | 'custom';
```

### CustomDateRange
```typescript
interface CustomDateRange {
  from: Date;
  to: Date;
}
```

### DashboardMetrics
```typescript
interface DashboardMetrics {
  occupancyRate: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
  totalRevenue: number;
  previousOccupancyRate: number;
  previousAverageDailyRate: number;
  previousRevenuePerAvailableRoom: number;
  previousTotalRevenue: number;
}
```

## Chart Implementation

All charts are implemented using pure SVG without external libraries:

- **Responsive**: Charts adapt to container width
- **Accessible**: Tooltips on hover with full details
- **Performant**: Optimized SVG rendering
- **Styled**: Matches luxury boutique design aesthetic

## Future Enhancements

- [ ] Add export to PDF functionality
- [ ] Add export to Excel functionality
- [ ] Add export to CSV functionality
- [ ] Implement drill-down capabilities
- [ ] Add more chart types (line charts, area charts)
- [ ] Add comparison mode (compare two periods)
- [ ] Add forecast/prediction features
- [ ] Implement real-time updates
- [ ] Add customizable dashboards
- [ ] Add saved report templates

## Notes

- All components use the existing UI component library
- Charts are SVG-based for better performance and customization
- Error states and empty states are handled gracefully
- Loading states use the existing Spinner component
- All text uses the luxury boutique typography system
