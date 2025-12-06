# Calendar Component Structure

## Component Hierarchy

```
page.tsx (Calendar Page)
│
└── TapeChart.tsx (Main Container)
    │
    ├── CalendarHeader.tsx
    │   ├── Date Range Display
    │   ├── Navigation Buttons (Previous/Today/Next)
    │   └── View Options (7/14/30 days)
    │
    ├── Date Header Row (Sticky)
    │   └── Date Columns
    │
    ├── Room Type Groups
    │   ├── Room Type Header (e.g., "Deluxe Room")
    │   └── RoomRow.tsx (one per room)
    │       ├── Room Info (Sticky Left Column)
    │       │   ├── Room Number
    │       │   ├── Room Type
    │       │   └── Status Icons
    │       │
    │       ├── Date Cells
    │       │
    │       └── BookingBlock.tsx (one per booking)
    │           ├── Guest Name
    │           ├── Check-in/out Times
    │           ├── Status Badge
    │           └── Hover Tooltip
    │
    └── Legend (Status Colors)
```

## Data Flow

```
TapeChart (State Management)
│
├── State: startDate, viewDays
├── Computed: dates array, roomsByType
├── Mock Data: mockRooms, mockBookings
│
├─> CalendarHeader
│   ├─ Props: startDate, viewDays
│   └─ Callbacks: onDateChange, onViewDaysChange
│
└─> RoomRow (for each room)
    ├─ Props: room, dates, bookings
    └─> BookingBlock (for each booking in room)
        ├─ Props: booking, startDate
        └─ Callback: onClick
```

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    CalendarHeader                                │
│  [< Previous] [Today] [Next >]     [7 Days][14 Days][30 Days]   │
└─────────────────────────────────────────────────────────────────┘
┌──────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│   Room   │  Mon 4 │  Tue 5 │  Wed 6 │  Thu 7 │  Fri 8 │  Sat 9 │ ← Sticky Header
├──────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ Deluxe Room                                                      │ ← Room Type
├──────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 101      │ [════ John Smith ═══════════]                       │
│ Deluxe   │        Confirmed                                    │
├──────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 102      │        │ [═══ Sarah Johnson ════════]               │
│ Deluxe   │        │   Pending                                  │
├──────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ Suite                                                            │ ← Room Type
├──────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 201      │[══════ Emily Davis ══════]                          │
│ Suite    │    Checked In                                       │
└──────────┴────────┴────────┴────────┴────────┴────────┴────────┘
   Sticky    │←─────────── Horizontally Scrollable ─────────────→│
   Column
```

## Key Implementation Details

### Sticky Positioning
- **Left Column (Room Info)**: `sticky left-0 z-10`
- **Top Row (Date Headers)**: `sticky top-0 z-20`
- **Top-Left Corner**: `sticky left-0 z-30` (highest z-index)

### Grid Dimensions
- **Cell Width**: 120px per day
- **Row Height**: 64px (h-16)
- **Room Column**: 192px (w-48)

### Booking Block Positioning
Bookings use absolute positioning within the row:
```typescript
const daysFromStart = differenceInDays(checkInDate, startDate);
const duration = differenceInDays(checkOutDate, checkInDate);
const left = daysFromStart * CELL_WIDTH;
const width = duration * CELL_WIDTH - 4; // -4 for spacing
```

### Color Scheme
| Status | Background | Border | Text |
|--------|-----------|--------|------|
| Confirmed | bg-green-100 | border-green-300 | text-green-800 |
| Checked In | bg-blue-100 | border-blue-300 | text-blue-800 |
| Pending | bg-yellow-100 | border-yellow-300 | text-yellow-800 |
| Checked Out | bg-gray-100 | border-gray-300 | text-gray-800 |

## Responsive Behavior

- Container is horizontally scrollable for many dates
- Vertical scrolling for many rooms
- Room info column and date headers remain visible during scroll
- Mobile optimization can be added in future updates

## Performance Optimizations

1. **useMemo** for expensive calculations:
   - Dates array generation
   - Rooms grouped by type
   - Mock data generation

2. **Conditional Rendering**:
   - Only render bookings that overlap visible date range
   - Skip rendering booking blocks outside viewport

3. **CSS-based Layout**:
   - Flexbox and Grid for efficient rendering
   - Absolute positioning for bookings prevents reflow

## Future Extensions

### Planned Features
1. **Interactive Bookings**
   - Click to view/edit booking details
   - Drag to resize (change dates)
   - Drag to move (change room)

2. **Booking Creation**
   - Click empty cell to create booking
   - Multi-day selection

3. **Filtering**
   - Filter by room type
   - Filter by booking status
   - Search by guest name

4. **Real-time Updates**
   - WebSocket integration
   - Optimistic UI updates

5. **Export/Print**
   - PDF generation
   - Image export
   - Print-friendly view

### Extension Points

**TapeChart.tsx**:
```typescript
// Add these callbacks for interactivity
onBookingClick?: (booking: Booking) => void;
onBookingDragStart?: (booking: Booking) => void;
onBookingDragEnd?: (booking: Booking, newDates: DateRange) => void;
onCellClick?: (room: Room, date: Date) => void;
```

**BookingBlock.tsx**:
```typescript
// Add drag handlers
draggable?: boolean;
onDragStart?: (e: DragEvent) => void;
onDragEnd?: (e: DragEvent) => void;
```

## Testing Considerations

1. **Date Calculations**: Verify booking positioning across month boundaries
2. **Time Zones**: Ensure consistent date handling
3. **Edge Cases**:
   - Bookings longer than view range
   - Bookings starting before view range
   - Overlapping bookings in same room
4. **Performance**: Test with 100+ rooms and 1000+ bookings
5. **Accessibility**: Keyboard navigation, screen reader compatibility
