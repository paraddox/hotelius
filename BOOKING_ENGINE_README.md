# Hotel Booking Engine - Implementation Guide

## Overview

A complete public-facing booking engine for your hotel reservation SaaS application. This implementation includes:

- Hotel landing pages with room displays
- Multi-step booking flow (Search → Select → Guest Details → Payment → Confirmation)
- Guest account management with booking history
- RESTful API routes for availability, pricing, and bookings
- Modern, responsive UI built with Tailwind CSS
- Form validation with react-hook-form and Zod
- Stripe payment integration placeholder

## Directory Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── hotels/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx                    # Hotel landing page
│   │   │       ├── rooms/
│   │   │       │   └── page.tsx                # Room search results
│   │   │       └── book/
│   │   │           ├── page.tsx                # Guest details form
│   │   │           ├── payment/
│   │   │           │   └── page.tsx            # Payment page
│   │   │           └── confirmation/
│   │   │               └── page.tsx            # Booking confirmation
│   │   └── account/
│   │       ├── layout.tsx                      # Account layout with sidebar
│   │       ├── page.tsx                        # Guest profile page
│   │       └── bookings/
│   │           ├── page.tsx                    # Bookings list
│   │           └── [id]/
│   │               └── page.tsx                # Booking details
│   └── api/
│       ├── hotels/
│       │   └── [hotelId]/
│       │       ├── availability/
│       │       │   └── route.ts                # Check room availability
│       │       └── pricing/
│       │           └── route.ts                # Calculate pricing
│       └── bookings/
│           └── route.ts                        # Create/retrieve bookings
└── components/
    └── booking/
        ├── SearchWidget.tsx                    # Date picker & guest selector
        ├── RoomCard.tsx                        # Room display card
        ├── BookingSummary.tsx                  # Price breakdown sidebar
        ├── GuestForm.tsx                       # Guest information form
        └── PaymentForm.tsx                     # Payment form placeholder
```

## Booking Flow

### 1. Hotel Landing Page
**Route:** `/[locale]/hotels/[slug]`

Features:
- Hotel photo gallery
- Hotel description and amenities
- Available room types with prices
- Search widget for availability checking
- Contact information

### 2. Room Selection
**Route:** `/[locale]/hotels/[slug]/rooms`

Features:
- Displays available rooms for selected dates
- Room cards with photos, amenities, and pricing
- Real-time availability status
- Price calculation for stay duration
- Filters by guest count

Query Parameters:
- `checkIn` - Check-in date (YYYY-MM-DD)
- `checkOut` - Check-out date (YYYY-MM-DD)
- `guests` - Number of guests
- `roomType` - (Optional) Pre-selected room type

### 3. Guest Details
**Route:** `/[locale]/hotels/[slug]/book`

Features:
- Guest information form with validation
- Fields: First name, last name, email, phone
- Special requests textarea
- Booking summary sidebar
- Form validation with Zod schema

### 4. Payment
**Route:** `/[locale]/hotels/[slug]/book/payment`

Features:
- Stripe Elements integration placeholder
- Card payment form
- Payment security badges
- Guest information review
- Price breakdown display

**Note:** This is a placeholder. In production, integrate with Stripe Elements:
```tsx
import { Elements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
```

### 5. Confirmation
**Route:** `/[locale]/hotels/[slug]/book/confirmation`

Features:
- Booking confirmation with reference number
- Complete booking details
- Hotel and guest information
- Check-in/check-out details
- Download confirmation option
- Important information and policies

## Guest Account Pages

### Profile Page
**Route:** `/[locale]/account`

Features:
- Personal information display
- Booking statistics
- Account status
- Address information
- Edit profile functionality

### Bookings List
**Route:** `/[locale]/account/bookings`

Features:
- All user bookings grouped by status
- Upcoming trips section
- Past and cancelled bookings
- Quick view of booking details
- Booking reference numbers

### Booking Details
**Route:** `/[locale]/account/bookings/[id]`

Features:
- Complete booking information
- Hotel and room details
- Guest information
- Price breakdown
- Cancellation option (if applicable)
- Download confirmation
- Important booking policies

## API Routes

### 1. Availability Check
**Endpoint:** `GET /api/hotels/[hotelId]/availability`

Query Parameters:
- `checkIn` - Check-in date (required)
- `checkOut` - Check-out date (required)
- `guests` - Number of guests (optional, default: 1)

Response:
```json
{
  "hotelId": "grand-plaza",
  "checkIn": "2025-02-15T00:00:00.000Z",
  "checkOut": "2025-02-18T00:00:00.000Z",
  "guests": 2,
  "nights": 3,
  "availableRooms": [
    {
      "id": "1",
      "roomTypeId": "deluxe",
      "name": "Deluxe Room",
      "maxGuests": 2,
      "available": 5,
      "basePrice": 150
    }
  ]
}
```

### 2. Pricing Calculation
**Endpoint:** `GET /api/hotels/[hotelId]/pricing`

Query Parameters:
- `roomTypeId` - Room type ID (required)
- `checkIn` - Check-in date (required)
- `checkOut` - Check-out date (required)
- `guests` - Number of guests (optional, default: 1)

Response:
```json
{
  "hotelId": "grand-plaza",
  "roomTypeId": "1",
  "pricing": {
    "baseRate": 150,
    "adjustedRate": 150,
    "nights": 3,
    "subtotal": 450,
    "discounts": {
      "lengthOfStay": 0
    },
    "tax": 45,
    "serviceFee": 20,
    "total": 515,
    "breakdown": [...]
  }
}
```

Pricing features:
- Seasonal pricing adjustments
- Length of stay discounts (5% for 3+ nights, 15% for 7+ nights)
- Tax calculation (10%)
- Service fees
- Detailed price breakdown

### 3. Create Booking
**Endpoint:** `POST /api/bookings`

Request Body:
```json
{
  "hotelId": "grand-plaza",
  "roomId": "1",
  "checkIn": "2025-02-15",
  "checkOut": "2025-02-18",
  "guests": 2,
  "guestInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "specialRequests": "Late check-in"
  },
  "paymentIntentId": "pi_xxx"
}
```

Response:
```json
{
  "success": true,
  "booking": {
    "id": "bk_abc123",
    "reference": "BK-ABC123",
    "status": "confirmed",
    "createdAt": "2025-01-15T10:00:00.000Z",
    ...
  }
}
```

### 4. Get Bookings
**Endpoint:** `GET /api/bookings`

Query Parameters:
- `guestEmail` - Guest email (for listing all bookings)
- `bookingId` - Specific booking ID

## Components

### SearchWidget
Reusable date picker and guest selector component.

Props:
- `hotelId` - Hotel identifier
- `defaultCheckIn` - Default check-in date
- `defaultCheckOut` - Default check-out date
- `defaultGuests` - Default guest count

### RoomCard
Displays room information with booking option.

Props:
- `room` - Room object with details
- `nights` - Number of nights
- `checkIn` - Check-in date
- `checkOut` - Check-out date
- `guests` - Guest count
- `locale` - Current locale
- `hotelSlug` - Hotel slug for routing

### BookingSummary
Sidebar showing booking details and price breakdown.

Props:
- `hotelName` - Hotel name
- `room` - Room details
- `checkIn` - Check-in date
- `checkOut` - Check-out date
- `guests` - Guest count
- `nights` - Number of nights
- `subtotal` - Subtotal amount
- `tax` - Tax amount
- `total` - Total amount

### GuestForm
Form for collecting guest information with validation.

Props:
- `hotelSlug` - Hotel slug
- `roomId` - Room ID
- `checkIn` - Check-in date
- `checkOut` - Check-out date
- `guests` - Guest count
- `locale` - Current locale

Validation:
- First name: minimum 2 characters
- Last name: minimum 2 characters
- Email: valid email format
- Phone: minimum 10 characters
- Special requests: optional

### PaymentForm
Payment form with Stripe Elements placeholder.

Props:
- `hotelSlug` - Hotel slug
- `roomId` - Room ID
- `checkIn` - Check-in date
- `checkOut` - Check-out date
- `guests` - Guest count
- `guestInfo` - Guest information object
- `total` - Total amount
- `locale` - Current locale

## Styling

All components use Tailwind CSS with a consistent design system:

- **Primary Color:** Blue 600 (#2563EB)
- **Success Color:** Green 600
- **Error Color:** Red 600
- **Text:** Gray scale (900, 700, 600, 500)
- **Backgrounds:** White and Gray 50
- **Borders:** Gray 200-300
- **Rounded Corners:** lg (0.5rem)
- **Shadows:** sm and md

Responsive breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Form Validation

Using `react-hook-form` with `zod` for type-safe validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});
```

## Internationalization

Using `next-intl` for multi-language support:

All routes include `[locale]` parameter for language detection.
Currently configured for English (`en`), but easily extensible.

To add translations:
1. Create translation files in `messages/[locale].json`
2. Use `useTranslations()` hook in components
3. Wrap text in `t()` function

## TODO: Production Integration

### Database Integration
Replace mock data with actual database queries:

```typescript
// Example with Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// In API routes
const { data, error } = await supabase
  .from('bookings')
  .insert({...})
  .select();
```

### Stripe Integration

1. Install dependencies:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

2. Configure environment variables:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

3. Update PaymentForm component:
```tsx
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

4. Create PaymentIntent in API:
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(total * 100),
  currency: 'usd',
  metadata: { bookingId: booking.id },
});
```

### Email Notifications

Integrate with email service (e.g., Resend, SendGrid):

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'bookings@yourdomain.com',
  to: booking.guestInfo.email,
  subject: `Booking Confirmation - ${booking.reference}`,
  html: bookingConfirmationTemplate(booking),
});
```

### Authentication

Add authentication to account pages:

```typescript
import { getServerSession } from 'next-auth';

export default async function AccountLayout() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  // ...
}
```

### Image Handling

Replace placeholder images with actual hotel/room photos:
1. Store images in cloud storage (S3, Cloudinary)
2. Update image URLs in database
3. Use Next.js Image optimization

## Testing

### Manual Testing Checklist

- [ ] Navigate through complete booking flow
- [ ] Test form validation on all forms
- [ ] Verify date picker constraints (no past dates)
- [ ] Test responsive design on mobile/tablet
- [ ] Check guest account navigation
- [ ] Verify API routes return correct data
- [ ] Test error handling (invalid dates, missing fields)

### Unit Tests
Add tests for:
- Form validation schemas
- API route handlers
- Pricing calculation logic
- Date manipulation functions

## Performance Optimization

- Images are optimized with Next.js Image component
- Server components used where possible
- Client components only where interactivity needed
- API routes can be cached with appropriate headers

## Security Considerations

- [ ] Add CSRF protection
- [ ] Implement rate limiting on API routes
- [ ] Sanitize user inputs
- [ ] Validate all dates server-side
- [ ] Use environment variables for sensitive data
- [ ] Implement proper authentication
- [ ] Add SQL injection protection (if using SQL)

## Browser Support

Tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Internal use only - Part of Hotelius SaaS application
