# Booking Logic System

A comprehensive booking management system for the Hotelius hotel reservation SaaS application. This system implements a state machine for booking lifecycle management, soft holds for temporary reservations, dynamic pricing with rate plans, and real-time availability checking.

## Architecture Overview

The booking system is organized into five core modules:

1. **States** - Defines the booking state machine
2. **Transitions** - Handles state transitions with validation
3. **Soft Hold** - Manages temporary room reservations
4. **Pricing** - Calculates booking prices with rate plans
5. **Availability** - Checks room availability in real-time

## Booking State Machine

### States

- **pending** - Initial state when booking is created (soft hold)
- **confirmed** - Booking is confirmed after payment
- **checked_in** - Guest has checked in
- **checked_out** - Guest has checked out (terminal)
- **cancelled** - Booking was cancelled (terminal)
- **expired** - Soft hold expired without confirmation (terminal)
- **no_show** - Guest didn't show up (terminal)

### State Transitions

```
pending → confirmed    (after payment)
pending → cancelled    (guest cancels)
pending → expired      (soft hold timeout)

confirmed → checked_in (guest arrives)
confirmed → cancelled  (cancellation)
confirmed → no_show    (guest doesn't arrive)

checked_in → checked_out (guest leaves)
```

### Terminal States

Once a booking reaches a terminal state (cancelled, expired, no_show, checked_out), it cannot transition to any other state.

## Usage Examples

### Creating a Booking with Soft Hold

```typescript
import { createSoftHold } from '@/lib/booking';

// Create a 15-minute soft hold on a room
const result = await createSoftHold({
  hotelId: 'uuid',
  roomTypeId: 'uuid',
  checkInDate: '2025-06-01',
  checkOutDate: '2025-06-05',
  numAdults: 2,
  numChildren: 0,
  expiresInMinutes: 15, // Optional, defaults to 15
});

console.log(result.bookingId);
console.log(result.expiresAt); // ISO timestamp
```

### Checking Availability

```typescript
import { checkAvailability, getAvailableRooms } from '@/lib/booking';

// Check if a specific room type is available
const availability = await checkAvailability({
  hotelId: 'uuid',
  roomTypeId: 'uuid',
  checkInDate: '2025-06-01',
  checkOutDate: '2025-06-05',
});

console.log(availability.isAvailable);
console.log(availability.availableCount); // Number of available rooms

// Get all available room types
const rooms = await getAvailableRooms({
  hotelId: 'uuid',
  checkInDate: '2025-06-01',
  checkOutDate: '2025-06-05',
  numAdults: 2,
  numChildren: 1,
});
```

### Calculating Pricing

```typescript
import { calculateStayPrice, formatPrice } from '@/lib/booking';

// Calculate price for a stay
const pricing = await calculateStayPrice({
  hotelId: 'uuid',
  roomTypeId: 'uuid',
  checkInDate: '2025-06-01',
  checkOutDate: '2025-06-05',
  numAdults: 2,
});

console.log(formatPrice(pricing.totalCents)); // "$450.00"
console.log(pricing.appliedRatePlanId); // Rate plan that was applied
console.log(pricing.breakdown); // Detailed price breakdown
```

### State Transitions

```typescript
import { confirmBooking, cancelBooking, checkIn, checkOut } from '@/lib/booking';

// Confirm a pending booking
await confirmBooking('booking-uuid');

// Cancel a booking
await cancelBooking('booking-uuid', 'Customer requested cancellation');

// Check in a guest
await checkIn('booking-uuid');

// Check out a guest
await checkOut('booking-uuid');
```

### Using Server Actions

```typescript
'use client';

import { createBooking, cancelBookingAction } from '@/app/actions/booking-actions';

// Create a booking from a client component
const result = await createBooking({
  hotelId: 'uuid',
  roomTypeId: 'uuid',
  checkInDate: '2025-06-01',
  checkOutDate: '2025-06-05',
  numAdults: 2,
  numChildren: 0,
  guestInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
  },
  specialRequests: 'Late check-in',
});

if (result.success) {
  console.log(result.data.confirmationCode);
}

// Cancel a booking
await cancelBookingAction({
  bookingId: 'uuid',
  reason: 'Plans changed',
});
```

## Soft Hold System

The soft hold system allows customers to temporarily reserve a room while completing the booking process. This prevents double-bookings while giving users time to enter payment information.

### Features

- **Default 15-minute hold duration**
- **Extendable** - Can add up to 30 additional minutes
- **Auto-expiration** - Expired holds are automatically cleaned up
- **Room locking** - Held rooms are not available to other users

### Soft Hold Workflow

1. User selects dates and room type
2. System creates soft hold (pending booking)
3. User has 15 minutes to complete payment
4. Options:
   - Complete payment → Booking confirmed
   - Extend hold → Add more time
   - Abandon → Hold expires automatically
   - Cancel → Hold released immediately

### Extending a Hold

```typescript
import { extendSoftHold } from '@/lib/booking';

await extendSoftHold('booking-uuid', 10); // Add 10 more minutes
```

### Releasing a Hold

```typescript
import { releaseSoftHold } from '@/lib/booking';

await releaseSoftHold('booking-uuid'); // Delete the pending booking
```

## Pricing System

The pricing system supports dynamic pricing through rate plans with various restrictions and rules.

### Rate Plan Priority

When multiple rate plans match a booking, the system selects the one with the highest priority. Rate plans can have:

- **Validity dates** - Only apply during specific date ranges
- **Stay length restrictions** - Min/max nights
- **Advance booking restrictions** - Min/max days before check-in
- **Day of week restrictions** - Only apply on certain days
- **Refund policies** - Refundable or non-refundable

### Price Breakdown

```typescript
{
  basePriceCents: 40000,           // $400.00 base price
  ratePlanPriceCents: 36000,       // $360.00 with rate plan
  subtotalCents: 36000,            // Subtotal before taxes
  taxCents: 4320,                  // 12% taxes
  feeCents: 0,                     // No additional fees
  totalCents: 40320,               // $403.20 total
  breakdown: [
    {
      type: 'base',
      description: 'Base rate (4 nights)',
      amountCents: 40000,
      nightlyRate: 10000,
      nights: 4,
    },
    {
      type: 'rate_plan',
      description: 'Early Bird Special',
      amountCents: -4000,          // $40 discount
      nightlyRate: 9000,
      nights: 4,
    },
    {
      type: 'tax',
      description: 'Taxes and fees (12%)',
      amountCents: 4320,
    },
  ],
}
```

## Availability System

The availability system checks room availability in real-time, considering:

- Confirmed bookings
- Active soft holds (pending bookings)
- Checked-in guests
- Room maintenance status

### Availability Calendar

```typescript
import { getAvailabilityCalendar } from '@/lib/booking';

const calendar = await getAvailabilityCalendar({
  hotelId: 'uuid',
  roomTypeId: 'uuid',
  startDate: '2025-06-01',
  endDate: '2025-06-30',
});

// Returns availability for each day
// [
//   { date: '2025-06-01', available: 5, booked: 3, total: 8 },
//   { date: '2025-06-02', available: 4, booked: 4, total: 8 },
//   ...
// ]
```

## Database Schema

### Bookings Table

Key columns added by the soft hold system:

- `soft_hold_expires_at` - When the soft hold expires
- `status` - Current booking state (enum)

### Booking State Log Table

Tracks all state transitions:

- `booking_id` - Reference to booking
- `from_state` - Previous state
- `to_state` - New state
- `changed_by` - User who made the change
- `changed_at` - When the change occurred
- `reason` - Optional reason for the change

## SQL Functions

### expire_old_pending_bookings()

Automatically expires pending bookings with expired soft holds.

```sql
SELECT * FROM expire_old_pending_bookings();
-- Returns: { expired_count: 5, booking_ids: [...] }
```

This function should be called periodically (e.g., every 5 minutes) via:
- pg_cron (if available)
- Supabase Edge Function
- API cron endpoint

### get_available_rooms()

Returns available rooms for a date range, excluding booked rooms.

```sql
SELECT * FROM get_available_rooms(
  'hotel-uuid',
  'room-type-uuid',
  '2025-06-01',
  '2025-06-05'
);
```

### get_booking_state_history()

Returns the complete state transition history for a booking.

```sql
SELECT * FROM get_booking_state_history('booking-uuid');
```

## Error Handling

All booking functions use custom error types for better error handling:

```typescript
try {
  await confirmBooking(bookingId);
} catch (error) {
  if (error instanceof BookingNotFoundError) {
    console.error('Booking not found');
  } else if (error instanceof InvalidTransitionError) {
    console.error('Invalid state transition');
  } else if (error instanceof PermissionDeniedError) {
    console.error('No permission to modify booking');
  }
}
```

### Error Types

- `BookingTransitionError` - Base error for transition failures
- `BookingNotFoundError` - Booking doesn't exist
- `InvalidTransitionError` - Invalid state transition
- `PermissionDeniedError` - User lacks permission
- `SoftHoldError` - Soft hold operation failed
- `PricingError` - Pricing calculation failed
- `AvailabilityError` - Availability check failed

## Permission System

The booking system enforces role-based permissions:

### Actions and Required Permissions

| Action | Guest | Hotel Owner | Admin |
|--------|-------|-------------|-------|
| Create booking | ✓ | ✓ | ✓ |
| View own bookings | ✓ | ✓ | ✓ |
| Cancel own booking | ✓ | ✓ | ✓ |
| Confirm booking | ✗ | ✓ | ✓ |
| Check in | ✗ | ✓ | ✓ |
| Check out | ✗ | ✓ | ✓ |
| Mark no-show | ✗ | ✓ | ✓ |
| Cancel any booking | ✗ | ✓ (own hotel) | ✓ |

## Best Practices

### 1. Always validate prices before confirming

```typescript
import { validateBookingPrice } from '@/lib/booking';

const validation = await validateBookingPrice({
  hotelId,
  roomTypeId,
  checkInDate,
  checkOutDate,
  expectedTotalCents: userSubmittedPrice,
});

if (!validation.isValid) {
  throw new Error('Price mismatch detected');
}
```

### 2. Handle soft hold expiration gracefully

```typescript
import { getSoftHoldInfo } from '@/lib/booking';

const holdInfo = await getSoftHoldInfo(bookingId);

if (holdInfo.isActive && holdInfo.remainingMinutes < 5) {
  // Show warning to user
  alert(`Your reservation will expire in ${holdInfo.remainingMinutes} minutes`);
}
```

### 3. Check availability before creating soft hold

```typescript
import { checkAvailability, createSoftHold } from '@/lib/booking';

const availability = await checkAvailability({
  hotelId,
  roomTypeId,
  checkInDate,
  checkOutDate,
});

if (!availability.isAvailable) {
  throw new Error('No rooms available');
}

const hold = await createSoftHold({...});
```

### 4. Use server actions for client-side operations

Always use the provided server actions when calling from client components to ensure proper validation and security.

## Testing

### Unit Tests

Test state transitions:

```typescript
import { isValidTransition, BOOKING_STATES } from '@/lib/booking';

expect(isValidTransition('pending', 'confirmed')).toBe(true);
expect(isValidTransition('confirmed', 'pending')).toBe(false);
```

### Integration Tests

Test the complete booking flow:

1. Check availability
2. Calculate pricing
3. Create soft hold
4. Confirm booking
5. Check in
6. Check out

## Monitoring

Monitor these metrics in production:

- Soft hold expiration rate
- Average time to confirm bookings
- Most common cancellation reasons
- Rate plan usage and effectiveness
- Availability accuracy

## Future Enhancements

Potential improvements to the booking system:

1. **Overbooking protection** - Configurable overbooking limits
2. **Waitlist system** - Queue for fully booked dates
3. **Group bookings** - Multi-room reservations
4. **Dynamic soft hold duration** - Based on demand
5. **A/B testing** - For pricing and rate plans
6. **Predictive pricing** - ML-based rate optimization
7. **Partial payments** - Deposits and installments

## Support

For questions or issues with the booking system, contact the development team or refer to the main project documentation.
