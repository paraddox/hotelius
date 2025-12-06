# Calendar/Tape Chart Implementation

## Overview

The calendar/tape chart view provides a visual representation of room availability and bookings across a date range. This implementation follows the hotel industry standard "tape chart" design where rooms are displayed as rows and dates as columns, with bookings shown as colored blocks spanning their duration.

## Files Created

### Page Component
- **H:\dev\hotelius\src\app\[locale]\dashboard\calendar\page.tsx**
  - Main calendar page with authentication protection via `requireAuth()`
  - Integrates TapeChart component
  - Uses internationalization for title and subtitle

### Calendar Components

1. **H:\dev\hotelius\src\components\dashboard\TapeChart.tsx**
   - Main container component managing state and data
   - Handles date range management (7, 14, or 30 days view)
   - Groups rooms by type for better organization
   - Includes mock data for rooms and bookings
   - Features:
     - Horizontally scrollable date grid
     - Sticky room information column on the left
     - Sticky date header row at the top
     - Today indicator line
     - Color-coded status legend
     - Responsive layout

2. **H:\dev\hotelius\src\components\dashboard\CalendarHeader.tsx**
   - Date navigation controls
   - Features:
     - Previous/Next navigation buttons (moves by current view range)
     - "Today" button to jump to current date
     - Date range display showing start and end dates
     - View options: 7 days, 14 days, 30 days
     - Active state styling for selected view

3. **H:\dev\hotelius\src\components\dashboard\RoomRow.tsx**
   - Renders a single room's row in the tape chart
   - Features:
     - Displays room number and type
     - Shows room status icons (maintenance, out-of-service)
     - Renders date cells with appropriate styling
     - Positions booking blocks absolutely for precise placement
     - Calculates booking position and width based on dates
     - Handles room availability indicators with striped pattern

4. **H:\dev\hotelius\src\components\dashboard\BookingBlock.tsx**
   - Individual booking visualization
   - Features:
     - Color-coded by status (confirmed, checked-in, pending, checked-out)
     - Displays guest name and check-in/out times
     - Hover tooltip with detailed booking information
     - Click handler for opening booking details
     - Smooth hover animations and shadow effects

## Data Structures

### Room Interface
```typescript
interface Room {
  id: string;
  number: string;
  type: string;
  status: 'available' | 'maintenance' | 'out-of-service';
}
```

### Booking Interface
```typescript
interface Booking {
  id: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'checked-in' | 'pending' | 'checked-out';
  roomNumber: string;
}
```

## Mock Data

The implementation includes realistic mock data:
- **12 rooms** across 3 room types:
  - Deluxe Room (4 rooms: 101-104)
  - Suite (3 rooms: 201-203)
  - Standard Room (5 rooms: 301-305)
- **10 sample bookings** with varying:
  - Check-in/check-out dates (relative to today)
  - Booking statuses
  - Guest names

## Styling

### Color Coding
- **Green** (bg-green-100, border-green-300): Confirmed bookings
- **Blue** (bg-blue-100, border-blue-300): Checked-in guests
- **Yellow** (bg-yellow-100, border-yellow-300): Pending bookings
- **Gray** (bg-gray-100, border-gray-300): Checked-out

### Layout Constants
- **CELL_WIDTH**: 120px per day column
- **Room column width**: 192px (w-48)
- **Row height**: 64px (h-16)

### Special Styling
- Today's column highlighted with blue background (bg-blue-50)
- Today indicator line (vertical blue line)
- Striped pattern for maintenance/out-of-service rooms (pattern-dots class)
- Sticky positioning for room names and date headers
- Hover effects on booking blocks with tooltips

## CSS Additions

Added to **H:\dev\hotelius\src\app\globals.css**:
```css
.pattern-dots {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.03) 10px,
    rgba(0, 0, 0, 0.03) 20px
  );
}
```

## Internationalization

Added to **H:\dev\hotelius\src\messages\en.json**:
```json
"calendar": {
  "title": "Calendar",
  "subtitle": "View and manage room availability and bookings",
  "header": {
    "today": "Today",
    "previous": "Previous",
    "next": "Next",
    "view": "View"
  },
  "viewOptions": {
    "7days": "7 Days",
    "14days": "14 Days",
    "30days": "30 Days"
  },
  "legend": {
    "confirmed": "Confirmed",
    "checkedIn": "Checked In",
    "pending": "Pending",
    "checkedOut": "Checked Out",
    "maintenance": "Maintenance",
    "outOfService": "Out of Service"
  },
  "room": "Room",
  "type": "Type"
}
```

## Features

### Current Features (Read-Only)
- ✅ Visual tape chart with room × date grid
- ✅ Horizontally scrollable for extended date ranges
- ✅ Sticky room information column
- ✅ Sticky date header row
- ✅ Color-coded booking statuses
- ✅ Room status indicators (maintenance, out-of-service)
- ✅ Hover tooltips with booking details
- ✅ Today indicator
- ✅ Date range navigation (previous/next/today)
- ✅ Multiple view options (7/14/30 days)
- ✅ Rooms grouped by type
- ✅ Responsive design

### Future Enhancements (Not Implemented)
- Drag-and-drop booking modification
- Click to create new booking
- Right-click context menus
- Booking detail modal/drawer
- Real-time updates via WebSocket
- Print/export functionality
- Filter by room type or status
- Search for specific bookings or guests
- Multi-room booking visualization
- Booking conflicts detection

## Usage

Navigate to `/dashboard/calendar` in the application. The page is protected by authentication and will redirect to login if the user is not authenticated.

### Navigation
1. Use **Previous/Next** buttons to move backward/forward by the current view range
2. Click **Today** to jump to the current date
3. Select **7 Days**, **14 Days**, or **30 Days** to change the visible date range

### Viewing Bookings
- Hover over any booking block to see detailed information
- Click on a booking block (currently logs to console, can be extended to open detail modal)
- Check the legend at the bottom to understand status color coding

## Dependencies

All required dependencies are already in package.json:
- `date-fns` (^4.1.0): Date calculations and formatting
- `lucide-react` (^0.556.0): Icons for navigation and room status
- `next-intl` (^4.5.8): Internationalization
- Tailwind CSS (^4): Styling

## Technical Notes

### Date Calculations
- Uses `date-fns` for reliable date operations
- All dates are normalized to start of day for consistent comparisons
- Booking positions calculated using `differenceInDays`
- Date ranges generated using `Array.from` with `addDays`

### Performance Considerations
- `useMemo` used for expensive calculations (dates array, room grouping)
- Absolute positioning for bookings prevents layout thrashing
- Only bookings overlapping visible date range are rendered
- CSS Grid provides efficient layout

### State Management
- Local component state using `useState`
- Start date and view days stored separately for flexibility
- Mock data generated once using `useMemo`

## Accessibility

- Semantic HTML structure
- ARIA labels for navigation buttons (via `title` attributes)
- Keyboard navigable with Tailwind's focus styles
- Color coding supplemented with text labels in tooltips
- High contrast color combinations for readability
