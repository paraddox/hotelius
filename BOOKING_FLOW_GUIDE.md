# Booking Flow - Quick Reference

## User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BOOKING FLOW DIAGRAM                             │
└─────────────────────────────────────────────────────────────────────────┘

1. HOTEL LANDING PAGE
   ├── URL: /[locale]/hotels/[slug]
   ├── User sees: Hotel photos, description, amenities, room types
   ├── User enters: Check-in, check-out dates, guest count
   └── Action: "Check Availability" button
        │
        ↓
2. ROOM SELECTION
   ├── URL: /[locale]/hotels/[slug]/rooms?checkIn=...&checkOut=...&guests=...
   ├── User sees: Available rooms with prices, amenities, photos
   ├── API calls: GET /api/hotels/[hotelId]/availability
   └── Action: "Book Now" button on selected room
        │
        ↓
3. GUEST DETAILS
   ├── URL: /[locale]/hotels/[slug]/book?roomId=...&checkIn=...&checkOut=...&guests=...
   ├── User enters: First name, last name, email, phone, special requests
   ├── Validation: react-hook-form + zod
   └── Action: "Continue to Payment" button
        │
        ↓
4. PAYMENT
   ├── URL: /[locale]/hotels/[slug]/book/payment?...&firstName=...&lastName=...&email=...
   ├── User enters: Card details (Stripe Elements)
   ├── API calls: POST /api/bookings (creates booking)
   └── Action: "Pay $XXX.XX" button
        │
        ↓
5. CONFIRMATION
   ├── URL: /[locale]/hotels/[slug]/book/confirmation?bookingId=...
   ├── User sees: Booking reference, complete details, success message
   ├── Email sent: Booking confirmation to guest
   └── Actions: Download confirmation, View in My Bookings
```

## URL Flow Examples

### Example 1: Standard Booking

```
Step 1: /en/hotels/grand-plaza

Step 2: /en/hotels/grand-plaza/rooms
        ?checkIn=2025-02-15
        &checkOut=2025-02-18
        &guests=2

Step 3: /en/hotels/grand-plaza/book
        ?roomId=1
        &checkIn=2025-02-15
        &checkOut=2025-02-18
        &guests=2

Step 4: /en/hotels/grand-plaza/book/payment
        ?roomId=1
        &checkIn=2025-02-15
        &checkOut=2025-02-18
        &guests=2
        &firstName=John
        &lastName=Doe
        &email=john@example.com
        &phone=+1234567890
        &specialRequests=Late%20check-in

Step 5: /en/hotels/grand-plaza/book/confirmation
        ?bookingId=bk_abc123
```

## Data Flow

### 1. Availability Check
```typescript
// Frontend
const response = await fetch(
  `/api/hotels/grand-plaza/availability?checkIn=2025-02-15&checkOut=2025-02-18&guests=2`
);

// Backend Response
{
  "availableRooms": [
    { "id": "1", "name": "Deluxe Room", "available": 5, "basePrice": 150 },
    { "id": "2", "name": "Executive Suite", "available": 3, "basePrice": 280 }
  ]
}
```

### 2. Pricing Calculation
```typescript
// Frontend
const response = await fetch(
  `/api/hotels/grand-plaza/pricing?roomTypeId=1&checkIn=2025-02-15&checkOut=2025-02-18&guests=2`
);

// Backend Response
{
  "pricing": {
    "baseRate": 150,
    "nights": 3,
    "subtotal": 450,
    "tax": 45,
    "serviceFee": 20,
    "total": 515
  }
}
```

### 3. Create Booking
```typescript
// Frontend
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hotelId: 'grand-plaza',
    roomId: '1',
    checkIn: '2025-02-15',
    checkOut: '2025-02-18',
    guests: 2,
    guestInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      specialRequests: 'Late check-in'
    },
    paymentIntentId: 'pi_xxx' // From Stripe
  })
});

// Backend Response
{
  "success": true,
  "booking": {
    "id": "bk_abc123",
    "reference": "BK-ABC123",
    "status": "confirmed"
  }
}
```

## State Management

### URL Parameters as State

The booking flow uses URL parameters to maintain state across pages:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `checkIn` | Date string | Yes | Check-in date (YYYY-MM-DD) |
| `checkOut` | Date string | Yes | Check-out date (YYYY-MM-DD) |
| `guests` | Number | Yes | Number of guests |
| `roomId` | String | From step 2 | Selected room ID |
| `firstName` | String | From step 3 | Guest first name |
| `lastName` | String | From step 3 | Guest last name |
| `email` | String | From step 3 | Guest email |
| `phone` | String | From step 3 | Guest phone |
| `specialRequests` | String | From step 3 | Optional special requests |

### Benefits of URL-based State
- Deep linking support
- Browser back/forward works correctly
- Shareable URLs
- No complex state management needed
- SSR-friendly

## Component Hierarchy

```
Hotel Landing Page
├── SearchWidget (client)
└── Room Type Cards

Rooms Page
├── SearchWidget (client)
└── RoomCard[] (server)
    └── Link to booking

Guest Details Page
├── GuestForm (client)
│   ├── Form validation
│   └── Submit to payment
└── BookingSummary (server)

Payment Page
├── PaymentForm (client)
│   ├── Stripe Elements
│   └── Submit payment
└── BookingSummary (server)

Confirmation Page
└── Booking details (server)
```

## Validation Rules

### Date Validation
- Check-in cannot be in the past
- Check-out must be after check-in
- Minimum stay: 1 night
- Maximum stay: No limit (can be added)

### Guest Validation
- First name: 2+ characters
- Last name: 2+ characters
- Email: Valid email format
- Phone: 10+ characters
- Special requests: Optional, max 500 characters

### Payment Validation
- Cardholder name: Required
- Card number: 16 digits
- Expiry date: MM/YY format, not expired
- CVV: 3-4 digits
- Billing ZIP: Required

## Error Handling

### API Errors
```typescript
try {
  const response = await fetch('/api/bookings', { method: 'POST', ... });
  const data = await response.json();

  if (!response.ok) {
    // Handle API error
    if (response.status === 409) {
      alert('Room is no longer available');
    } else if (response.status === 400) {
      alert('Invalid booking data');
    }
  }
} catch (error) {
  alert('Network error. Please try again.');
}
```

### Form Errors
```typescript
const { errors } = useForm({
  resolver: zodResolver(schema)
});

// Display errors inline
{errors.email && (
  <p className="text-red-600">{errors.email.message}</p>
)}
```

## Navigation Guards

### Required Parameters
Each page validates required URL parameters and redirects if missing:

```typescript
// Guest Details Page
if (!search.roomId || !search.checkIn || !search.checkOut || !search.guests) {
  redirect(`/${locale}/hotels/${slug}/rooms`);
}

// Payment Page
if (!search.firstName || !search.lastName || !search.email || !search.phone) {
  redirect(`/${locale}/hotels/${slug}/rooms`);
}
```

## Back Navigation

Each page includes a "Back" link:
- Rooms → Hotel Landing
- Guest Details → Rooms
- Payment → Guest Details
- Confirmation → View in Account (no back)

## Mobile Considerations

### Responsive Layout
- Hotel landing: Image gallery adapts to single column
- Rooms list: Cards stack vertically
- Booking summary: Moves below form on mobile
- Guest form: Single column layout

### Touch Optimization
- Large tap targets (min 44px)
- Native date pickers on mobile
- Sticky booking summary on desktop only
- Mobile-friendly navigation

## Performance Tips

### Code Splitting
- Client components loaded on demand
- Server components rendered on server
- API routes optimized for quick responses

### Caching
```typescript
// Cache availability for 5 minutes
export const revalidate = 300;

// Cache hotel data for 1 hour
export const revalidate = 3600;
```

### Image Optimization
```typescript
<Image
  src={hotel.image}
  alt={hotel.name}
  width={800}
  height={600}
  priority // For above-fold images
  loading="lazy" // For below-fold images
/>
```

## Testing Scenarios

### Happy Path
1. Search for dates → Select room → Enter details → Pay → See confirmation

### Error Scenarios
- [ ] No rooms available for dates
- [ ] Invalid guest information
- [ ] Payment declined
- [ ] Network error during booking
- [ ] Room became unavailable during checkout

### Edge Cases
- [ ] Single night stay
- [ ] Long stay (30+ nights)
- [ ] Maximum guests
- [ ] Same-day check-in (if allowed)
- [ ] International phone numbers
- [ ] Special characters in name/requests

## SEO Considerations

### Meta Tags
```typescript
export const metadata = {
  title: `${hotel.name} - Book Now`,
  description: hotel.description,
  openGraph: {
    images: [hotel.image],
  },
};
```

### Structured Data
Add JSON-LD for hotel information:
```typescript
{
  "@type": "Hotel",
  "name": hotel.name,
  "address": hotel.address,
  "priceRange": "$150-$500"
}
```

## Accessibility

- [ ] Keyboard navigation support
- [ ] Screen reader friendly labels
- [ ] ARIA labels on interactive elements
- [ ] Color contrast ratios (WCAG AA)
- [ ] Focus indicators visible
- [ ] Error messages announced
- [ ] Form field associations

## Next Steps

1. **Integrate with real database** - Replace mock data
2. **Add Stripe payment** - Complete payment processing
3. **Implement email notifications** - Send confirmations
4. **Add authentication** - Protect account pages
5. **Set up analytics** - Track conversion funnel
6. **Add cancellation flow** - Allow booking cancellations
7. **Implement reviews** - Guest review system
8. **Add multi-room booking** - Book multiple rooms at once
