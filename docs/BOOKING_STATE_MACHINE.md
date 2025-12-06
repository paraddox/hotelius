# Booking State Machine Documentation

## Overview

The Hotelius booking system implements a robust state machine with soft hold functionality for managing hotel reservations. The system ensures data integrity, prevents double bookings, and provides a clear audit trail of all booking state changes.

## Architecture

### Core Components

1. **State Machine** (`src/lib/booking/state-machine.ts`)
   - Event-driven state transitions
   - Validation and guards
   - Terminal state management

2. **Actions** (`src/lib/booking/actions.ts`)
   - High-level booking operations
   - Database interactions
   - State transition execution

3. **Soft Holds** (`src/lib/booking/soft-hold.ts`)
   - Temporary room reservations during checkout
   - Automatic expiration handling
   - Soft hold extension

4. **Availability** (`src/lib/booking/availability.ts`)
   - Room availability checking
   - Occupancy calculations
   - Conflict detection

5. **Cron Cleanup** (`src/app/api/cron/cleanup-holds/route.ts`)
   - Automated cleanup of expired soft holds
   - Scheduled via Vercel Cron

## State Flow

```
┌─────────────────┐
│     pending     │ ◄── Initial state with optional soft hold
└────────┬────────┘
         │
         ├── PAYMENT_RECEIVED ──► confirmed
         ├── PAYMENT_FAILED ────► cancelled
         ├── PAYMENT_TIMEOUT ───► expired
         ├── CANCEL ────────────► cancelled
         └── EXPIRE ────────────► expired

┌─────────────────┐
│    confirmed    │
└────────┬────────┘
         │
         ├── CHECK_IN ──────────► checked_in
         ├── CANCEL ────────────► cancelled
         └── MARK_NO_SHOW ──────► no_show

┌─────────────────┐
│   checked_in    │
└────────┬────────┘
         │
         └── CHECK_OUT ─────────► checked_out

┌─────────────────┐
│  checked_out    │ ◄── Terminal state
└─────────────────┘

┌─────────────────┐
│    cancelled    │ ◄── Terminal state
└─────────────────┘

┌─────────────────┐
│    no_show      │ ◄── Terminal state
└─────────────────┘

┌─────────────────┐
│    expired      │ ◄── Terminal state
└─────────────────┘
```

## Booking States

| State | Description | Active | Can Transition To |
|-------|-------------|--------|-------------------|
| `pending` | Awaiting payment, may have soft hold | Yes | confirmed, cancelled, expired |
| `confirmed` | Payment received, booking confirmed | Yes | checked_in, cancelled, no_show |
| `checked_in` | Guest has checked in | Yes | checked_out |
| `checked_out` | Guest has checked out | No | *terminal* |
| `cancelled` | Booking was cancelled | No | *terminal* |
| `no_show` | Guest did not arrive | No | *terminal* |
| `expired` | Soft hold expired | No | *terminal* |

## Events

| Event | Description | Required Fields | Automated |
|-------|-------------|-----------------|-----------|
| `PAYMENT_RECEIVED` | Payment successfully processed | paymentIntentId | No |
| `PAYMENT_FAILED` | Payment failed | reason | No |
| `PAYMENT_TIMEOUT` | Payment window expired | - | Yes |
| `CANCEL` | Cancel booking | reason | No |
| `CHECK_IN` | Guest checks in | - | No |
| `CHECK_OUT` | Guest checks out | - | No |
| `MARK_NO_SHOW` | Mark as no-show | - | No |
| `EXPIRE` | Soft hold expired | - | Yes |

## Soft Hold System

### How Soft Holds Work

1. **Creation**: When a user starts checkout, a soft hold is created
   - Creates a `pending` booking with `soft_hold_expires_at` timestamp
   - Default duration: 15 minutes (configurable)
   - Reserves a specific room for the user

2. **Expiration**: Soft holds automatically expire
   - Cron job runs every 5 minutes
   - Expired holds transition to `expired` state
   - Room becomes available for other bookings

3. **Extension**: Users can extend their soft hold
   - Max extension: 30 additional minutes
   - Only works if hold hasn't expired yet

4. **Conversion**: Soft hold becomes confirmed booking
   - Payment received → state changes to `confirmed`
   - Soft hold expiration is no longer relevant

### API Functions

```typescript
// Create a soft hold
const { bookingId, expiresAt } = await createSoftHold({
  hotelId: 'uuid',
  roomTypeId: 'uuid',
  checkInDate: '2025-12-10',
  checkOutDate: '2025-12-15',
  numAdults: 2,
  expiresInMinutes: 15, // optional, defaults to 15
});

// Extend a soft hold
await extendSoftHold(bookingId, 10); // extend by 10 minutes

// Release a soft hold
await releaseSoftHold(bookingId); // deletes the pending booking

// Check soft hold status
const { isActive, expiresAt, remainingMinutes } = await getSoftHoldInfo(bookingId);
```

## Database Schema

### Bookings Table

Key columns added for state machine:

```sql
-- Soft hold expiration
soft_hold_expires_at TIMESTAMPTZ

-- Status (enum extended with 'expired')
status booking_status NOT NULL
  -- pending, confirmed, checked_in, checked_out, cancelled, no_show, expired
```

### Booking State Log Table

Audit trail for all state changes:

```sql
CREATE TABLE booking_state_log (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  from_state booking_status NOT NULL,
  to_state booking_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  metadata JSONB
);
```

## Usage Examples

### Creating a Booking with Soft Hold

```typescript
import { createBooking } from '@/lib/booking';

// Create a pending booking with 15-minute soft hold
const booking = await createBooking({
  hotel_id: hotelId,
  room_type_id: roomTypeId,
  check_in_date: '2025-12-10',
  check_out_date: '2025-12-15',
  num_adults: 2,
  num_children: 1,
  total_price_cents: 50000, // $500.00
  currency: 'USD',
  soft_hold_minutes: 15,
});
```

### Confirming After Payment

```typescript
import { confirmBookingAction } from '@/lib/booking';

// After payment succeeds
const confirmedBooking = await confirmBookingAction(
  bookingId,
  paymentIntentId,
  chargeId
);
```

### Checking In a Guest

```typescript
import { checkInGuest } from '@/lib/booking';

const checkedInBooking = await checkInGuest(bookingId);
```

### Checking Availability

```typescript
import { getAvailableRooms, checkAvailability } from '@/lib/booking';

// Get all available rooms for dates
const rooms = await getAvailableRooms({
  hotelId,
  checkInDate: '2025-12-10',
  checkOutDate: '2025-12-15',
  numAdults: 2,
  numChildren: 0,
});

// Check specific room type availability
const availability = await checkAvailability({
  hotelId,
  roomTypeId,
  checkInDate: '2025-12-10',
  checkOutDate: '2025-12-15',
});

console.log(`${availability.availableCount} rooms available`);
```

### Viewing Booking History

```typescript
import { getBookingHistory } from '@/lib/booking';

const history = await getBookingHistory(bookingId);

// Returns array of state changes:
// [
//   {
//     from_state: 'pending',
//     to_state: 'confirmed',
//     changed_by: 'user-uuid',
//     changed_at: '2025-12-06T10:30:00Z',
//     reason: null
//   },
//   {
//     from_state: 'confirmed',
//     to_state: 'checked_in',
//     changed_by: 'hotel-staff-uuid',
//     changed_at: '2025-12-10T15:00:00Z',
//     reason: null
//   }
// ]
```

## Cron Setup

### Vercel Configuration

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/cleanup-holds",
    "schedule": "*/5 * * * *"
  }]
}
```

### Environment Variables

```bash
# Required for cron authentication
CRON_SECRET=your-secret-key-here
```

### Testing Locally

```bash
# Call the endpoint directly
curl http://localhost:3000/api/cron/cleanup-holds \
  -H "Authorization: Bearer your-secret-key-here"

# Or in development (no auth required)
curl http://localhost:3000/api/cron/cleanup-holds
```

## Database Functions

The migration creates several PostgreSQL functions:

### get_available_rooms()

Returns available rooms for a room type and date range.

```sql
SELECT * FROM get_available_rooms(
  'hotel-uuid',
  'room-type-uuid',
  '2025-12-10',
  '2025-12-15'
);
```

### count_available_rooms()

Returns count of available rooms.

```sql
SELECT count_available_rooms(
  'hotel-uuid',
  'room-type-uuid',
  '2025-12-10',
  '2025-12-15'
);
```

### is_room_available()

Checks if a specific room is available.

```sql
SELECT is_room_available(
  'room-uuid',
  '2025-12-10',
  '2025-12-15'
);
```

### get_occupancy_stats()

Returns daily occupancy statistics.

```sql
SELECT * FROM get_occupancy_stats(
  'hotel-uuid',
  '2025-12-01',
  '2025-12-31'
);
```

## Error Handling

All functions throw typed errors:

```typescript
import {
  BookingActionError,
  SoftHoldError,
  AvailabilityError,
} from '@/lib/booking';

try {
  await createBooking(data);
} catch (error) {
  if (error instanceof BookingActionError) {
    console.error(`Booking error: ${error.code}`, error.message);
  } else if (error instanceof SoftHoldError) {
    console.error(`Soft hold error: ${error.code}`, error.message);
  } else if (error instanceof AvailabilityError) {
    console.error(`Availability error: ${error.code}`, error.message);
  }
}
```

### Common Error Codes

- `NO_AVAILABILITY` - No rooms available for requested dates
- `INVALID_TRANSITION` - State transition not allowed
- `BOOKING_NOT_FOUND` - Booking doesn't exist
- `HOLD_EXPIRED` - Soft hold has expired
- `PERMISSION_DENIED` - User lacks permission
- `CREATE_FAILED` - Database insert failed
- `UPDATE_FAILED` - Database update failed

## Best Practices

1. **Always use actions.ts functions** for state changes
   - Don't update booking status directly in the database
   - Use `updateBookingStatus()` or specific action functions
   - Ensures proper state machine validation and audit logging

2. **Check availability before creating bookings**
   - Prevents race conditions
   - Use database functions for accurate results

3. **Set appropriate soft hold durations**
   - 15 minutes is good for most checkout flows
   - Consider longer for complex bookings
   - Max 60 minutes to prevent resource hogging

4. **Monitor cron execution**
   - Check logs for cleanup job failures
   - Ensure CRON_SECRET is set in production
   - Verify soft holds are expiring properly

5. **Use typed errors for better UX**
   - Catch specific error types
   - Provide user-friendly messages
   - Log detailed errors for debugging

## Migration

To apply the database changes:

```bash
# Using Supabase CLI
supabase db push

# Or manually apply the migration
psql -f supabase/migrations/014_soft_holds_and_state_log.sql
```

## Testing

Example test cases:

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  createBooking,
  updateBookingStatus,
  getBookingHistory,
} from '@/lib/booking';

describe('Booking State Machine', () => {
  it('should create pending booking with soft hold', async () => {
    const booking = await createBooking({
      hotel_id: hotelId,
      room_type_id: roomTypeId,
      check_in_date: '2025-12-10',
      check_out_date: '2025-12-15',
      num_adults: 2,
      total_price_cents: 50000,
      soft_hold_minutes: 15,
    });

    expect(booking.status).toBe('pending');
    expect(booking.soft_hold_expires_at).toBeDefined();
  });

  it('should transition from pending to confirmed', async () => {
    const booking = await updateBookingStatus(
      bookingId,
      'PAYMENT_RECEIVED',
      { paymentIntentId: 'pi_test' }
    );

    expect(booking.status).toBe('confirmed');
    expect(booking.payment_status).toBe('paid');
  });

  it('should log state changes', async () => {
    const history = await getBookingHistory(bookingId);

    expect(history).toHaveLength(2);
    expect(history[0].to_state).toBe('confirmed');
  });
});
```

## Support

For issues or questions, please refer to:
- Database schema: `supabase/migrations/007_bookings.sql`, `014_soft_holds_and_state_log.sql`
- Source code: `src/lib/booking/`
- State machine diagram: This document
