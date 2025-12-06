# Hotel Analytics & Reports Implementation

This document provides an overview of the analytics and reporting system implementation for the Hotelius hotel reservation dashboard.

## Overview

A comprehensive analytics and reporting system has been implemented with a luxury boutique hotel design aesthetic. The system includes interactive charts, key performance metrics, and detailed reports.

## Design System

- **Typography**:
  - Headings: Cormorant Garamond (serif)
  - Body text: DM Sans (sans-serif)

- **Color Palette**:
  - Terracotta: `#C4A484` (primary accent)
  - Charcoal: `#2C2C2C` (primary text)
  - Cream: `#FAF7F2` (backgrounds)
  - Sage: `#A8B5A0` (secondary accent)
  - Success: `#5AAF5A`
  - Error: `#C45C5C`

## Files Created

### 1. API Functions (`src/lib/api/reports.ts`)

Provides data fetching functions for all analytics:

- `fetchDashboardMetrics()` - Key performance indicators
- `fetchOccupancyData()` - Occupancy rates over time
- `fetchRevenueData()` - Revenue by room type
- `fetchBookingSourceData()` - Booking source distribution
- `fetchTopRooms()` - Top performing rooms

**Features**:
- Date range support (today, week, month, custom)
- Automatic comparison to previous period
- Proper error handling
- TypeScript interfaces for all data types

### 2. Custom React Hook (`src/lib/hooks/useReportData.ts`)

Simplifies data fetching with a single hook:

```tsx
const {
  metrics,
  occupancyData,
  revenueData,
  bookingSourceData,
  topRooms,
  isLoading,
  error,
  refetch,
} = useReportData({ tenantId, range, customRange });
```

**Features**:
- Automatic data fetching
- Loading and error states
- Manual refetch capability
- Fetches all data in parallel for performance

### 3. Components (`src/components/dashboard/reports/`)

#### DateRangeSelector
Interactive date range picker with preset options.

**Props**:
- `value`: Current date range
- `customRange`: Custom date range (optional)
- `onChange`: Callback for range changes

#### MetricCard
Card displaying a single metric with trend indicator.

**Props**:
- `title`: Metric name
- `value`: Current value
- `previousValue`: Previous period value (optional)
- `format`: Display format (currency, percentage, number)
- `sparklineData`: Array of values for mini chart (optional)
- `icon`: React icon component (optional)

**Features**:
- Automatic percentage change calculation
- Up/down/neutral indicators
- SVG sparkline chart
- Color-coded trends

#### OccupancyChart
Bar chart showing occupancy rates over time.

**Features**:
- Color-coded bars (high ≥80%, medium 50-79%, low <50%)
- Responsive SVG implementation
- Interactive tooltips
- Legend display
- Automatic date label formatting

#### RevenueChart
Bar chart showing revenue breakdown by room type.

**Features**:
- Color-coded bars per room type
- Percentage labels inside bars
- Value labels above bars
- Summary statistics
- Auto-scaling Y-axis

#### BookingSourceChart
Donut chart showing booking source distribution.

**Features**:
- SVG donut chart
- Center statistics display
- Interactive legend
- Hover effects
- Color-coded segments

#### TopRoomsTable
Table of top performing rooms.

**Features**:
- Ranked by revenue
- Color-coded occupancy badges
- Summary statistics footer
- Responsive design
- Empty state handling

### 4. Analytics Page (`src/app/[locale]/dashboard/analytics/page.tsx`)

Main analytics dashboard combining all components.

**Features**:
- Date range filtering
- 4 key metric cards (Occupancy, ADR, RevPAR, Revenue)
- Occupancy chart (full width)
- Revenue and booking source charts (side-by-side)
- Top rooms table
- Export section (placeholder for future functionality)
- Loading states
- Error handling with retry
- Refresh button

## Key Metrics Explained

### Occupancy Rate
Percentage of available rooms that are booked.
```
Occupancy Rate = (Booked Rooms / Available Rooms) × 100
```

### Average Daily Rate (ADR)
Average revenue earned per occupied room.
```
ADR = Total Revenue / Number of Booked Rooms
```

### Revenue Per Available Room (RevPAR)
Revenue generated per available room.
```
RevPAR = Total Revenue / Total Available Rooms
or
RevPAR = ADR × Occupancy Rate
```

### Total Revenue
Sum of all booking revenue for the period.

## Chart Implementation Details

All charts are implemented using pure SVG without external libraries:

### Advantages
- **No dependencies**: Reduces bundle size
- **Full control**: Complete customization
- **Performance**: Optimized rendering
- **Responsive**: Scales to container
- **Accessible**: Tooltips and proper semantics

### SVG Components Used
- `<svg>`: Main container
- `<rect>`: Bars in bar charts
- `<path>`: Donut chart segments
- `<polyline>`: Sparkline charts
- `<line>`: Axes and grid lines
- `<text>`: Labels and values
- `<circle>`: Data point indicators

## Data Flow

```
User selects date range
    ↓
DateRangeSelector updates state
    ↓
useReportData hook fetches new data
    ↓
API functions query Supabase
    ↓
Data processed and formatted
    ↓
Components receive data and render
```

## Database Schema Requirements

The analytics system expects these Supabase tables:

### bookings
- `id`: UUID
- `tenant_id`: UUID
- `room_id`: UUID
- `check_in`: timestamp
- `check_out`: timestamp
- `total_price`: numeric
- `status`: text (confirmed, checked_in, checked_out)
- `booking_source`: text

### rooms
- `id`: UUID
- `tenant_id`: UUID
- `room_number`: text
- `room_type`: text
- `is_active`: boolean

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import { useReportData } from '@/lib/hooks/useReportData';
import { DateRangeSelector, MetricCard, OccupancyChart } from '@/components/dashboard/reports';

export default function MyAnalyticsPage() {
  const [dateRange, setDateRange] = useState('month');
  const { metrics, occupancyData, isLoading } = useReportData({
    tenantId: 'your-tenant-id',
    range: dateRange,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <DateRangeSelector
        value={dateRange}
        onChange={setDateRange}
      />
      <MetricCard
        title="Occupancy Rate"
        value={metrics?.occupancyRate || 0}
        previousValue={metrics?.previousOccupancyRate}
        format="percentage"
      />
      <OccupancyChart data={occupancyData || []} />
    </div>
  );
}
```

## Integration Steps

1. **Update Tenant Context**: Replace `'your-tenant-id'` with actual tenant ID from auth context
2. **Add to Navigation**: Add link to `/dashboard/analytics` in sidebar
3. **Configure i18n**: Add translations if needed
4. **Set up Auth**: Ensure page is protected with `requireAuth()`
5. **Test Data**: Verify database has booking and room data

## Future Enhancements

- [ ] Export to PDF, Excel, CSV
- [ ] Drill-down capabilities (click chart to see details)
- [ ] Additional chart types (line, area, scatter)
- [ ] Period comparison mode
- [ ] Forecast and predictions
- [ ] Real-time updates via Supabase subscriptions
- [ ] Customizable dashboards
- [ ] Saved report templates
- [ ] Email scheduled reports
- [ ] Advanced filtering options
- [ ] Guest demographics analysis
- [ ] Seasonal trends analysis

## Performance Considerations

- **Parallel Data Fetching**: All API calls run concurrently
- **Optimized Queries**: SQL queries use proper indexes
- **Client-side Caching**: React Query can be added for caching
- **Lazy Loading**: Charts render only when data available
- **Responsive Charts**: SVG scales efficiently
- **Memoization**: Can add React.memo for large datasets

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast color ratios
- Tooltips for context

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

Uses existing project dependencies:
- React
- Next.js
- Supabase client
- Lucide React (icons)
- Existing UI components

## Testing Recommendations

1. **Unit Tests**: Test API functions with mock data
2. **Component Tests**: Test each chart component
3. **Integration Tests**: Test full analytics page
4. **Visual Regression**: Capture chart screenshots
5. **Performance Tests**: Test with large datasets
6. **Accessibility Tests**: Run a11y audits

## Troubleshooting

### No data showing
- Verify tenant ID is correct
- Check database has bookings and rooms
- Verify booking status is 'confirmed', 'checked_in', or 'checked_out'
- Check date range includes booking dates

### Charts not rendering
- Check browser console for errors
- Verify data format matches TypeScript interfaces
- Ensure SVG viewBox is correct
- Check for CSS conflicts

### Slow performance
- Add indexes to database tables
- Implement pagination for large datasets
- Add React Query for caching
- Consider server-side rendering for initial data

## Support

For questions or issues:
1. Check component README files
2. Review TypeScript interfaces
3. Examine example usage in analytics page
4. Check browser console for errors

## License

Part of the Hotelius project.
