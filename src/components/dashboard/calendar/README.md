# Calendar Components - Quick Reference

## Component Overview

The calendar system consists of 5 main components and 1 data hook:

```
calendar/
├── TapeChart.tsx           # Main orchestrator (225 lines)
├── CalendarControls.tsx    # Navigation & filters (165 lines)
├── CalendarHeader.tsx      # Date column headers (103 lines)
├── RoomRow.tsx            # Individual room row (184 lines)
├── BookingBar.tsx         # Booking visualization (160 lines)
└── index.ts               # Exports

hooks/
└── useCalendarData.ts     # Data management (314 lines)
```

## Quick Start

### Basic Usage

```tsx
import { TapeChart } from '@/components/dashboard/calendar';

export default function CalendarPage() {
  return (
    <div className="h-screen">
      <TapeChart />
    </div>
  );
}
```

### With Custom Hook

```tsx
import { useCalendarData } from '@/lib/hooks/useCalendarData';
import { RoomRow, CalendarHeader } from '@/components/dashboard/calendar';

export function CustomCalendar() {
  const { rooms, bookings, isLoading } = useCalendarData({
    startDate: new Date(),
    endDate: addDays(new Date(), 14),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <CalendarHeader dates={dates} cellWidth={120} />
      {rooms.map(room => (
        <RoomRow
          key={room.id}
          room={room}
          dates={dates}
          bookings={bookings}
          cellWidth={120}
        />
      ))}
    </div>
  );
}
```

## Component Details

### TapeChart

**Self-contained calendar** with all features built-in.

```tsx
<TapeChart />
```

**Internal State:**
- `startDate`: Current view start date
- `viewDays`: Number of days to display (7, 14, or 30)
- `selectedRoomType`: Active room type filter

**Callbacks:**
- `handleBookingClick(booking)`: Opens booking details
- `handleCellClick(room, date)`: Creates new booking

### CalendarControls

**Navigation and filtering UI**.

```tsx
<CalendarControls
  startDate={new Date()}
  viewDays={14}
  onDateChange={setStartDate}
  onViewDaysChange={setViewDays}
  selectedRoomType="deluxe"
  onRoomTypeChange={setRoomType}
  roomTypes={[
    { value: 'deluxe', label: 'Deluxe Room' },
    { value: 'suite', label: 'Suite' }
  ]}
/>
```

### CalendarHeader

**Date column headers**.

```tsx
<CalendarHeader
  dates={[new Date(), addDays(new Date(), 1), ...]}
  cellWidth={120}
/>
```

### RoomRow

**Individual room with bookings**.

```tsx
<RoomRow
  room={{
    id: '1',
    roomNumber: '101',
    name: 'Deluxe 101',
    roomTypeId: 'deluxe',
    roomTypeName: 'Deluxe Room',
    status: 'available'
  }}
  dates={dates}
  bookings={bookings}
  cellWidth={120}
  onBookingClick={(booking) => console.log(booking)}
  onCellClick={(room, date) => console.log(room, date)}
/>
```

### BookingBar

**Visual booking representation**.

```tsx
<BookingBar
  booking={{
    id: 'b1',
    guestName: 'John Doe',
    checkIn: new Date(),
    checkOut: addDays(new Date(), 3),
    status: 'confirmed',
    roomNumber: '101',
    nights: 3,
    adults: 2,
    children: 0
  }}
  onClick={(booking) => console.log(booking)}
/>
```

**Status Colors:**
- `confirmed`: Green (#87A878)
- `checked-in`: Blue (#5B7FA6)
- `pending`: Orange (#D4A574)
- `checked-out`: Gray (#8B8B8B)
- `cancelled`: Red (#C45C5C)

## Data Hook

### useCalendarData

```tsx
const {
  rooms,      // CalendarRoom[]
  bookings,   // CalendarBooking[]
  roomTypes,  // { value, label }[]
  isLoading,  // boolean
  error       // string | null
} = useCalendarData({
  hotelId: 'hotel-123',      // optional
  startDate: new Date(),     // required
  endDate: addDays(new Date(), 14),  // required
  roomTypeFilter: 'deluxe'   // optional
});
```

**Return Types:**

```typescript
interface CalendarRoom {
  id: string;
  roomNumber?: string;
  name: string;
  roomTypeId: string;
  roomTypeName: string;
  status: 'available' | 'occupied' | 'maintenance' | 'blocked';
}

interface CalendarBooking {
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
```

## Styling

All components use the Hotelius design system:

### Colors
```css
--color-cream: #FAF7F2;       /* Background */
--color-terracotta: #C4A484;  /* Primary */
--color-charcoal: #2C2C2C;    /* Text */
--color-sage: #87A878;        /* Success */
```

### Fonts
```css
font-family: 'Cormorant Garamond', serif;  /* Headings */
font-family: 'DM Sans', sans-serif;        /* Body */
```

### Custom Classes
```tsx
className="font-serif"      // Cormorant Garamond
className="font-sans"       // DM Sans
className="text-label"      // Uppercase, tracked
```

## Event Handlers

### Booking Click
```tsx
const handleBookingClick = (booking: CalendarBooking) => {
  // Open modal, navigate, etc.
  router.push(`/dashboard/bookings/${booking.id}`);
};
```

### Cell Click (Create Booking)
```tsx
const handleCellClick = (room: CalendarRoom, date: Date) => {
  // Open create booking modal
  setCreateModal({
    isOpen: true,
    room,
    checkIn: date,
  });
};
```

## Responsive Design

### Mobile (< 640px)
- Horizontal scroll enabled
- Touch-friendly targets
- Simplified tooltips

### Tablet (640px - 1024px)
- 7-day default view
- Compact controls

### Desktop (> 1024px)
- 14-day default view
- Full features

## Performance Tips

1. **Limit date range** for better performance
   ```tsx
   // Good: 7-14 days
   viewDays={14}

   // Avoid: > 30 days without virtualization
   viewDays={90} // May be slow
   ```

2. **Filter rooms** when possible
   ```tsx
   roomTypeFilter="deluxe"  // Better than 'all'
   ```

3. **Memoize callbacks**
   ```tsx
   const handleClick = useCallback((booking) => {
     // ...
   }, []);
   ```

## Common Patterns

### Modal Integration
```tsx
const [selectedBooking, setSelectedBooking] = useState(null);

<TapeChart />
{selectedBooking && (
  <BookingModal
    booking={selectedBooking}
    onClose={() => setSelectedBooking(null)}
  />
)}
```

### Loading States
```tsx
const { isLoading } = useCalendarData({ ... });

{isLoading ? <Spinner /> : <TapeChart />}
```

### Error Handling
```tsx
const { error } = useCalendarData({ ... });

{error && <Alert variant="error">{error}</Alert>}
```

## Testing

### Unit Test Example
```typescript
import { render, screen } from '@testing-library/react';
import { BookingBar } from './BookingBar';

test('renders guest name', () => {
  render(
    <BookingBar
      booking={{
        guestName: 'John Doe',
        status: 'confirmed',
        // ...
      }}
    />
  );
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

## Troubleshooting

### Bookings Not Showing
1. Check date range overlap
2. Verify `roomId` matches
3. Check `status` filter

### Layout Issues
1. Ensure parent has height: `h-screen` or `h-[600px]`
2. Check cell width: 120px minimum
3. Verify CSS Grid support

### Performance
1. Reduce `viewDays`
2. Add pagination
3. Implement virtual scrolling

## Support

For questions or issues:
1. Check the [full documentation](../../../docs/CALENDAR_SYSTEM.md)
2. Review component source code
3. Contact the dev team
