# Calendar System Architecture

## Component Hierarchy

```
CalendarPage
└── TapeChart
    ├── CalendarControls
    │   ├── Date Range Display
    │   ├── Navigation Buttons (Previous/Next/Today/This Month)
    │   ├── View Period Toggle (7/14/30 days)
    │   └── Room Type Filter
    │
    ├── Statistics Bar
    │   ├── Total Rooms Badge
    │   ├── Occupied Rooms Badge
    │   ├── Available Rooms Badge
    │   └── Occupancy Rate Badge
    │
    ├── Calendar Grid
    │   ├── CalendarHeader
    │   │   ├── Room Column Header
    │   │   └── Date Columns (n days)
    │   │       ├── Day of Week
    │   │       ├── Date Number
    │   │       └── Month
    │   │
    │   └── Room Groups (by type)
    │       ├── Room Type Header
    │       └── RoomRow (per room)
    │           ├── Room Info Column (sticky)
    │           │   ├── Room Number/Name
    │           │   ├── Room Type
    │           │   └── Status Icon
    │           │
    │           └── Date Cells Grid
    │               └── BookingBar (per booking)
    │                   ├── Guest Name
    │                   ├── Nights Indicator
    │                   └── Tooltip
    │                       ├── Guest Details
    │                       ├── Check-in/out Times
    │                       ├── Guest Count
    │                       └── Status Badge
    │
    └── Legend
        ├── Status Colors
        └── Usage Hints
```

## Data Flow

```
useCalendarData Hook
    │
    ├─→ Fetches Rooms
    ├─→ Fetches Bookings
    ├─→ Fetches Room Types
    │
    ├─→ Filters by Room Type
    ├─→ Filters by Date Range
    │
    └─→ Returns CalendarData
         │
         └─→ TapeChart
              │
              ├─→ CalendarControls (controls state)
              ├─→ Statistics (calculates from data)
              ├─→ CalendarHeader (displays dates)
              └─→ RoomRow (for each room)
                   └─→ BookingBar (for each booking)
```

## State Management

```typescript
TapeChart Component State:
├── startDate: Date           // View start date
├── viewDays: number          // 7, 14, or 30
└── selectedRoomType: string  // 'all' or room type ID

useCalendarData Hook State:
├── rooms: CalendarRoom[]
├── bookings: CalendarBooking[]
├── roomTypes: { value, label }[]
├── isLoading: boolean
└── error: string | null

Derived State (useMemo):
├── endDate: Date
├── dates: Date[]
├── roomsByType: Map<string, Room[]>
└── stats: { totalRooms, occupiedRooms, availableRooms, occupancyRate }
```

## Event Flow

```
User Interaction
    │
    ├─→ Navigate Date
    │    └─→ onDateChange(newDate)
    │         └─→ Updates startDate
    │              └─→ Re-fetches data
    │
    ├─→ Change View Period
    │    └─→ onViewDaysChange(days)
    │         └─→ Updates viewDays
    │              └─→ Re-calculates dates
    │
    ├─→ Filter Room Type
    │    └─→ onRoomTypeChange(type)
    │         └─→ Updates selectedRoomType
    │              └─→ Filters rooms
    │
    ├─→ Click Booking
    │    └─→ onBookingClick(booking)
    │         └─→ Opens booking detail modal
    │
    └─→ Click Empty Cell
         └─→ onCellClick(room, date)
              └─→ Opens create booking modal
```

## Styling Architecture

```
Design System (globals.css)
    │
    ├─→ CSS Variables
    │    ├── Colors (terracotta, charcoal, cream, sage)
    │    ├── Fonts (Cormorant Garamond, DM Sans)
    │    ├── Spacing Scale
    │    ├── Border Radius
    │    ├── Shadows
    │    └── Transitions
    │
    ├─→ Utility Classes
    │    ├── .font-serif
    │    ├── .font-sans
    │    ├── .text-label
    │    └── Animation classes
    │
    └─→ Component Styles
         ├── Tailwind Utilities
         ├── Inline Styles (dynamic positioning)
         └── CSS Grid/Flexbox
```

## Layout System

```
Grid Layout (TapeChart):

┌─────────────────────────────────────────────────────┐
│ CalendarControls (border-b)                         │
├─────────────────────────────────────────────────────┤
│ Statistics Bar (border-b)                           │
├──────────┬──────────────────────────────────────────┤
│ Room Col │ Date Columns (horizontal scroll)         │
│ (sticky) │                                           │
│          ├───────┬───────┬───────┬───────┬          │
│ Room 101 │ Day 1 │ Day 2 │ Day 3 │ Day 4 │ ...      │
│          │       │ ████████████  │       │          │
│          ├───────┼───────┼───────┼───────┼          │
│ Room 102 │       │       │ ██████████████████       │
│          ├───────┼───────┼───────┼───────┼          │
│   ...    │  ...  │  ...  │  ...  │  ...  │          │
├──────────┴───────┴───────┴───────┴───────┴──────────┤
│ Legend (border-t)                                    │
└─────────────────────────────────────────────────────┘

Legend:
████ = BookingBar
```

## Positioning System

```typescript
BookingBar Positioning:

Cell Width = 120px per day

Booking:
  checkIn: Day 2
  checkOut: Day 5
  duration: 3 days

Calculation:
  left = (checkIn - startDate) * cellWidth
       = (2 - 0) * 120px
       = 240px

  width = (duration * cellWidth) - 8px
        = (3 * 120) - 8
        = 352px

Result:
  position: absolute
  left: 240px
  width: 352px
```

## Color System

```
Booking Status Colors:

Confirmed:
  background: #87A878/20 (sage, 20% opacity)
  border-left: #87A878 (sage, 4px)
  text: #2D4739 (forest)

Checked-in:
  background: #5B7FA6/20 (blue, 20% opacity)
  border-left: #5B7FA6 (blue, 4px)
  text: #2C2C2C (charcoal)

Pending:
  background: #D4A574/20 (terracotta-light, 20% opacity)
  border-left: #D4A574 (terracotta-light, 4px)
  text: #A67B5B (terracotta-dark)

Checked-out:
  background: #8B8B8B/15 (gray, 15% opacity)
  border-left: #8B8B8B (gray, 4px)
  text: #4A4A4A (slate)

Cancelled:
  background: #C45C5C/15 (error, 15% opacity)
  border-left: #C45C5C (error, 4px)
  text: #C45C5C (error)
```

## Performance Optimizations

```
Optimization Strategy:

1. Memoization
   ├── dates = useMemo(() => generateDates())
   ├── roomsByType = useMemo(() => groupRooms())
   └── stats = useMemo(() => calculateStats())

2. Conditional Rendering
   ├── Only render visible bookings
   ├── Skip rendering if booking outside date range
   └── Lazy load room types

3. Event Handling
   ├── Debounce date navigation
   ├── Throttle scroll events
   └── Batch state updates

4. Data Fetching
   ├── Fetch only required date range
   ├── Cache previous results
   └── Implement pagination for large datasets
```

## Responsive Breakpoints

```
Mobile (< 640px):
  - viewDays: 7
  - cellWidth: 100px
  - Simplified tooltips
  - Touch-friendly targets

Tablet (640px - 1024px):
  - viewDays: 7
  - cellWidth: 120px
  - Compact controls
  - Horizontal scroll

Desktop (> 1024px):
  - viewDays: 14
  - cellWidth: 120px
  - Full features
  - Optimal layout
```

## API Integration Points

```typescript
// Current: Mock Data
const mockRooms = [...];

// Future: API Integration
async function fetchCalendarData(startDate, endDate) {
  const [rooms, bookings, roomTypes] = await Promise.all([
    fetch(`/api/rooms?start=${startDate}&end=${endDate}`),
    fetch(`/api/bookings?start=${startDate}&end=${endDate}`),
    fetch(`/api/room-types`),
  ]);

  return {
    rooms: await rooms.json(),
    bookings: await bookings.json(),
    roomTypes: await roomTypes.json(),
  };
}
```

## Extension Points

```
Future Features:

1. Drag & Drop
   - onDragStart(booking)
   - onDragOver(room, date)
   - onDrop(booking, newRoom, newDate)

2. Multi-select
   - selectedBookings: Set<string>
   - onSelectBooking(id)
   - onBulkAction(action, bookings)

3. Real-time Updates
   - useWebSocket('/api/calendar/updates')
   - onBookingCreated(booking)
   - onBookingUpdated(booking)
   - onBookingDeleted(id)

4. Advanced Filters
   - statusFilter: BookingStatus[]
   - guestSearch: string
   - dateRangePicker: [Date, Date]
```

## Testing Strategy

```
Unit Tests:
├── BookingBar.test.tsx
│   ├── Renders guest name
│   ├── Shows correct status color
│   └── Displays tooltip on hover
│
├── RoomRow.test.tsx
│   ├── Positions bookings correctly
│   ├── Handles empty cells
│   └── Shows room status icons
│
└── useCalendarData.test.ts
    ├── Fetches data correctly
    ├── Filters by room type
    └── Handles errors

Integration Tests:
├── Calendar navigation
├── Filter interactions
└── Booking click handlers

E2E Tests:
├── Full user workflow
├── Date range navigation
└── Booking creation flow
```

## Security Considerations

```
1. Data Access
   - Authenticate API requests
   - Validate user permissions
   - Sanitize user inputs

2. XSS Prevention
   - Escape guest names
   - Validate booking data
   - Use React's built-in XSS protection

3. CSRF Protection
   - Include CSRF tokens
   - Validate origin headers
   - Use secure cookies
```

## Accessibility Features

```
1. Keyboard Navigation
   - Tab through bookings
   - Arrow keys for date navigation
   - Enter to select/activate

2. Screen Readers
   - ARIA labels for dates
   - ARIA descriptions for bookings
   - Live regions for updates

3. Visual Accessibility
   - High contrast mode
   - Color blindness support
   - Keyboard focus indicators
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Error tracking enabled
- [ ] Performance monitoring
- [ ] Browser compatibility tested
- [ ] Accessibility audit passed
- [ ] Mobile responsive verified
- [ ] Documentation updated
- [ ] Unit tests passing
- [ ] E2E tests passing
