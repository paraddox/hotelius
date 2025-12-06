# Quick Start Guide - Booking Engine

## Overview
Your hotel booking engine is now complete with all public-facing pages, booking flow, guest accounts, and API routes.

## What's Included

### 1. Public Pages
- Hotel landing page with search
- Room selection and availability
- Guest details form
- Payment page
- Booking confirmation

### 2. Guest Account
- Profile management
- Booking history
- Booking details with cancellation

### 3. API Routes
- `/api/hotels/[hotelId]/availability` - Check room availability
- `/api/hotels/[hotelId]/pricing` - Calculate pricing
- `/api/bookings` - Create and retrieve bookings

### 4. Reusable Components
- SearchWidget - Date picker and guest selector
- RoomCard - Room display with booking
- BookingSummary - Price breakdown sidebar
- GuestForm - Guest information with validation
- PaymentForm - Payment processing placeholder

## File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── hotels/[slug]/
│   │   │   ├── page.tsx                    ✓ Hotel landing
│   │   │   ├── rooms/page.tsx              ✓ Room search
│   │   │   └── book/
│   │   │       ├── page.tsx                ✓ Guest details
│   │   │       ├── payment/page.tsx        ✓ Payment
│   │   │       └── confirmation/page.tsx   ✓ Confirmation
│   │   └── account/
│   │       ├── layout.tsx                  ✓ Account layout
│   │       ├── page.tsx                    ✓ Profile
│   │       └── bookings/
│   │           ├── page.tsx                ✓ Bookings list
│   │           └── [id]/page.tsx           ✓ Booking details
│   └── api/
│       ├── hotels/[hotelId]/
│       │   ├── availability/route.ts       ✓ Availability API
│       │   └── pricing/route.ts            ✓ Pricing API
│       └── bookings/route.ts               ✓ Bookings API
├── components/booking/
│   ├── SearchWidget.tsx                    ✓ Search component
│   ├── RoomCard.tsx                        ✓ Room card
│   ├── BookingSummary.tsx                  ✓ Price summary
│   ├── GuestForm.tsx                       ✓ Guest form
│   └── PaymentForm.tsx                     ✓ Payment form
└── types/
    └── booking.ts                          ✓ Type definitions
```

## Quick Test

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Visit the Hotel Page
```
http://localhost:3000/en/hotels/grand-plaza
```

### 3. Test the Booking Flow
1. Enter dates and guests
2. Click "Check Availability"
3. Select a room
4. Enter guest details
5. Proceed to payment
6. Complete booking
7. View confirmation

### 4. Test Guest Account
```
http://localhost:3000/en/account
http://localhost:3000/en/account/bookings
```

### 5. Test API Routes
```bash
# Check availability
curl "http://localhost:3000/api/hotels/grand-plaza/availability?checkIn=2025-02-15&checkOut=2025-02-18&guests=2"

# Get pricing
curl "http://localhost:3000/api/hotels/grand-plaza/pricing?roomTypeId=1&checkIn=2025-02-15&checkOut=2025-02-18&guests=2"

# Create booking (POST)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "grand-plaza",
    "roomId": "1",
    "checkIn": "2025-02-15",
    "checkOut": "2025-02-18",
    "guests": 2,
    "guestInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }'
```

## Booking Flow URLs

```
Step 1: /en/hotels/[slug]
        → Hotel landing page

Step 2: /en/hotels/[slug]/rooms?checkIn=...&checkOut=...&guests=...
        → Room selection

Step 3: /en/hotels/[slug]/book?roomId=...&checkIn=...&checkOut=...&guests=...
        → Guest details

Step 4: /en/hotels/[slug]/book/payment?...&firstName=...&lastName=...&email=...
        → Payment

Step 5: /en/hotels/[slug]/book/confirmation?bookingId=...
        → Confirmation
```

## Key Features

### ✅ Implemented
- Multi-step booking flow
- Form validation (react-hook-form + zod)
- Responsive design (Tailwind CSS)
- Server-side rendering
- Type-safe APIs
- Guest account management
- Price calculations
- Date validation
- URL-based state
- Navigation guards

### 🔄 TODO (Production)
- Database integration (Supabase)
- Stripe payment processing
- Email notifications
- User authentication
- Image storage
- Real hotel/room data

## Next Steps

### 1. Connect Database
Replace mock data in API routes with real database queries:

```typescript
// In availability/route.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const { data: rooms } = await supabase
  .from('rooms')
  .select('*')
  .eq('hotel_id', hotelId)
  .lte('max_guests', guests);
```

### 2. Integrate Stripe
Set up payment processing:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```typescript
// In PaymentForm.tsx
import { Elements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

### 3. Set Up Email Notifications
Configure email service:

```bash
npm install resend
```

```typescript
// In bookings/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'bookings@yourdomain.com',
  to: guestInfo.email,
  subject: `Booking Confirmation - ${reference}`,
  html: confirmationEmailTemplate(booking),
});
```

### 4. Add Authentication
Protect account pages:

```bash
npm install next-auth
```

```typescript
// In account/layout.tsx
import { getServerSession } from 'next-auth';

const session = await getServerSession();
if (!session) redirect('/login');
```

## Environment Variables

Create `.env.local`:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email
RESEND_API_KEY=re_...

# Auth (if using NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

## Documentation

### Comprehensive Guides
1. **BOOKING_ENGINE_README.md** - Complete implementation guide
2. **BOOKING_FLOW_GUIDE.md** - User journey and data flow
3. **FILES_CREATED.md** - All files created summary
4. **src/types/booking.ts** - TypeScript type definitions

### Read These First
1. Start with **BOOKING_ENGINE_README.md** for overview
2. Check **BOOKING_FLOW_GUIDE.md** for flow details
3. Review **src/types/booking.ts** for data structures

## Common Customizations

### Change Colors
Edit Tailwind classes:
- Primary: `bg-blue-600` → `bg-purple-600`
- Success: `text-green-600` → `text-emerald-600`

### Add New Fields to Guest Form
1. Update schema in `GuestForm.tsx`
2. Add input field
3. Pass data to payment page

### Modify Pricing Logic
Edit `pricing/route.ts`:
- Adjust seasonal multipliers
- Change discount percentages
- Add new fee types

### Customize Email Templates
Create email templates in `src/emails/`:
```typescript
export const confirmationEmail = (booking: Booking) => {
  return `<html>...</html>`;
};
```

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Type Errors
```bash
# Regenerate types
npx tsc --noEmit
```

### Styling Issues
```bash
# Rebuild Tailwind
npm run dev
```

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- react-hook-form: https://react-hook-form.com
- Zod: https://zod.dev
- Stripe: https://stripe.com/docs
- Supabase: https://supabase.com/docs

### Example Hotels
The code includes mock data for "Grand Plaza Hotel". Replace with your actual hotel data.

## Production Checklist

Before deploying to production:

- [ ] Replace all mock data with database queries
- [ ] Integrate Stripe payment processing
- [ ] Set up email notifications
- [ ] Add authentication and user sessions
- [ ] Configure environment variables
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Add analytics (Google Analytics, Plausible)
- [ ] Test all booking flows
- [ ] Verify responsive design
- [ ] Check accessibility
- [ ] Set up SSL certificate
- [ ] Configure CDN for images
- [ ] Add rate limiting to API routes
- [ ] Implement proper error handling
- [ ] Set up monitoring and alerts

## Contact

For questions or issues with the booking engine implementation, refer to the documentation files in this repository.

---

**Status:** ✅ Ready for Development
**Next Step:** Connect to your database and add real hotel data
**Estimated Setup Time:** 2-4 hours for basic integration
