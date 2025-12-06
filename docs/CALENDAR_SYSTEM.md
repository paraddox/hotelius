# Calendar/Tape Chart System

A comprehensive room availability and booking visualization system for the Hotelius hotel reservation dashboard.

## Overview

The calendar system provides a tape chart view (also known as a Gantt chart) for visualizing room availability and bookings across time. It features the luxury boutique hotel design aesthetic with terracotta, charcoal, cream, and sage colors.

## Components

### 1. TapeChart (`src/components/dashboard/calendar/TapeChart.tsx`)

The main calendar component that orchestrates all sub-components.

**Features:**
- Displays rooms grouped by room type
- Shows bookings as horizontal bars across dates
- Interactive booking bars with tooltips
- Statistics bar showing occupancy metrics
- Date range navigation
- Room type filtering
- Responsive design with horizontal scrolling

**Props:** None (self-contained)

**Usage:**
```tsx
import { TapeChart } from '@/components/dashboard/calendar/TapeChart';

<TapeChart />
```

### 2. CalendarControls (`src/components/dashboard/calendar/CalendarControls.tsx`)

Navigation and filter controls for the calendar.

**Features:**
- Date range display
- Previous/Next period navigation
- "Today" quick navigation
- "This Month" quick navigation
- View period toggle (Week/2 Weeks/Month)
- Room type filter dropdown

**Props:**
```typescript
interface CalendarControlsProps {
  startDate: Date;
  viewDays: number;
  onDateChange: (date: Date) => void;
  onViewDaysChange: (days: number) => void;
  selectedRoomType?: string;
  onRoomTypeChange?: (roomType: string) => void;
  roomTypes?: Array<{ value: string; label: string }>;
}
```

### 3. CalendarHeader (`src/components/dashboard/calendar/CalendarHeader.tsx`)

Date column headers showing day of week, date, and month.

**Features:**
- Highlights today's date
- Different styling for weekends
- Responsive column widths
- Sticky positioning

**Props:**
```typescript
interface CalendarHeaderProps {
  dates: Date[];
  cellWidth: number;
}
```

### 4. RoomRow (`src/components/dashboard/calendar/RoomRow.tsx`)

Individual room row showing room info and bookings.

**Features:**
- Sticky room info column
- Room status indicators (maintenance, blocked)
- Clickable cells for creating bookings
- Diagonal pattern for unavailable rooms
- Today indicator line
- Booking bar positioning

**Props:**
```typescript
interface RoomRowProps {
  room: CalendarRoom;
  dates: Date[];
  bookings: CalendarBooking[];
  cellWidth: number;
  onBookingClick?: (booking: CalendarBooking) => void;
  onCellClick?: (room: CalendarRoom, date: Date) => void;
}
```

### 5. BookingBar (`src/components/dashboard/calendar/BookingBar.tsx`)

Horizontal bar representing a booking.

**Features:**
- Color-coded by booking status:
  - **Confirmed**: Green (sage)
  - **Checked-in**: Blue
  - **Pending**: Orange (terracotta)
  - **Checked-out**: Gray
  - **Cancelled**: Red
- Guest name display
- Number of nights indicator
- Rich tooltip with booking details
- Hover effects and animations
- Click to view booking details

**Props:**
```typescript
interface BookingBarProps {
  booking: BookingData;
  onClick?: (booking: BookingData) => void;
  isCompact?: boolean;
}
```

## Data Hook

### useCalendarData (`src/lib/hooks/useCalendarData.ts`)

Custom hook for fetching and managing calendar data.

**Features:**
- Fetches rooms and bookings for date range
- Filters by room type
- Transforms data for calendar display
- Loading and error states
- Mock data implementation (ready for API integration)

**Usage:**
```typescript
const { rooms, bookings, roomTypes, isLoading, error } = useCalendarData({
  hotelId: 'hotel-123',
  startDate: new Date(),
  endDate: addDays(new Date(), 14),
  roomTypeFilter: 'deluxe',
});
```

**Return Type:**
```typescript
interface CalendarData {
  rooms: CalendarRoom[];
  bookings: CalendarBooking[];
  roomTypes: Array<{ value: string; label: string }>;
  isLoading: boolean;
  error: string | null;
}
```

## Design System

### Colors

The calendar uses the Hotelius luxury boutique hotel color palette:

- **Cream** (`#FAF7F2`): Background
- **Terracotta** (`#C4A484`): Primary accent, pending bookings
- **Charcoal** (`#2C2C2C`): Text, tooltips
- **Sage** (`#87A878`): Confirmed bookings
- **Blue** (`#5B7FA6`): Checked-in bookings, today indicator
- **Gray** (`#8B8B8B`): Checked-out bookings, muted text

### Typography

- **Headings**: Cormorant Garamond (serif)
- **Body Text**: DM Sans (sans-serif)

### Spacing

- Cell width: 120px per day
- Row height: 80px (5rem)
- Booking bar height: 40px

## Interactive Features

### Click Handlers

1. **Booking Click**: Opens booking details modal (to be implemented)
   ```typescript
   const handleBookingClick = (booking: CalendarBooking) => {
     // Open booking detail modal
   };
   ```

2. **Empty Cell Click**: Creates new booking (to be implemented)
   ```typescript
   const handleCellClick = (room: CalendarRoom, date: Date) => {
     // Open create booking modal
   };
   ```

### Navigation

- **Previous/Next**: Navigate by current view period
- **Today**: Jump to current date
- **This Month**: View entire current month
- **View Toggle**: Switch between 7, 14, or 30 day views

### Filtering

- **Room Type Filter**: Show only specific room types
- Maintains filter across date navigation

## API Integration

To integrate with a real API, update `useCalendarData.ts`:

```typescript
// Replace mock data with API calls
const fetchRooms = async () => {
  const response = await fetch(`/api/hotels/${hotelId}/rooms`);
  return response.json();
};

const fetchBookings = async () => {
  const response = await fetch(
    `/api/hotels/${hotelId}/bookings?start=${startDate}&end=${endDate}`
  );
  return response.json();
};
```

## Performance Optimizations

1. **Memoization**: Uses `useMemo` for expensive calculations
2. **Virtualization**: Ready for virtual scrolling for large datasets
3. **Lazy Loading**: Only renders visible bookings
4. **Debouncing**: Date navigation is optimized

## Future Enhancements

### Planned Features

1. **Booking Management Modals**
   - View booking details
   - Edit bookings
   - Create new bookings
   - Drag-and-drop to reschedule

2. **Advanced Filtering**
   - Filter by booking status
   - Search by guest name
   - Filter by floor/building

3. **Export Features**
   - Export to PDF
   - Print view
   - Export to Excel

4. **Real-time Updates**
   - WebSocket integration for live updates
   - Optimistic UI updates

5. **Drag and Drop**
   - Resize booking bars to change dates
   - Drag bookings to different rooms

6. **Multi-select**
   - Batch operations on bookings
   - Bulk status updates

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- High contrast mode support
- Responsive touch targets

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

### Unit Tests
```bash
npm test src/components/dashboard/calendar
```

### Integration Tests
```bash
npm run test:e2e -- calendar
```

## Troubleshooting

### Common Issues

1. **Bookings not displaying**
   - Check date range overlap
   - Verify room ID matches
   - Check booking status filter

2. **Performance issues**
   - Reduce view days
   - Enable virtual scrolling
   - Optimize booking data

3. **Layout issues**
   - Check cell width calculation
   - Verify CSS Grid support
   - Clear browser cache

## Contributing

When adding features:
1. Maintain design system consistency
2. Add TypeScript types
3. Include accessibility features
4. Update documentation
5. Add unit tests

## License

Copyright © 2024 Hotelius. All rights reserved.
