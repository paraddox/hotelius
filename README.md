# Hotelius

A luxury multi-tenant hotel reservation SaaS platform built with modern web technologies.

## Overview

Hotelius is a comprehensive hotel management and booking platform designed for boutique hotels. It provides a complete solution for hotel owners to manage their properties and for guests to discover and book accommodations.

### Design Philosophy

The application features a luxury boutique hotel aesthetic with:
- **Typography**: Cormorant Garamond (serif headings) and DM Sans (sans-serif body)
- **Color Palette**:
  - Terracotta: `#C4A484` (primary accent)
  - Charcoal: `#2C2C2C` (primary text)
  - Cream: `#FAF7F2` (backgrounds)
  - Sage: `#A8B5A0` (secondary accent)
  - Status colors for bookings (green, blue, yellow, gray, red)

## Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Supabase Auth** - Authentication and authorization
- **Row Level Security (RLS)** - Database-level security

### Payment Processing
- **Stripe** - Payment processing
- **Stripe Connect** - Multi-tenant payouts (10% platform fee)
- **Stripe Checkout** - SaaS subscription billing

### Email & Media
- **Resend** - Transactional email service
- **React Email** - Email template components
- **Supabase Storage** - Image and media management

### Forms & Validation
- **react-hook-form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### UI & Components
- **Lucide React** - Icon library
- **Recharts** - Analytics charts
- **react-dropzone** - File upload
- **date-fns** - Date manipulation
- **clsx** + **tailwind-merge** - Conditional styling

### Internationalization
- **next-intl** - Multi-language support (EN, ES, FR, DE, IT)

### Testing
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Testing Library** - Component testing utilities

## Key Features

### Multi-Tenant Architecture
- Isolated hotel data with tenant context
- Slug-based public URLs (`/hotels/grand-plaza`)
- Owner verification and role-based access
- Real-time data synchronization

### Booking Engine
- **Public booking flow**: Hotel landing → Room search → Guest details → Payment → Confirmation
- **Smart pricing**: Seasonal rates, length-of-stay discounts, tax calculation
- **Availability checking**: Real-time room availability
- **Guest accounts**: Booking history, profile management, cancellation
- **URL-based state**: Deep linking support, shareable booking URLs

### Hotel Management Dashboard
- **Analytics & Reports**: Occupancy rates, ADR, RevPAR, revenue charts
- **Calendar/Tape Chart**: Visual room availability grid with booking management
- **Room Management**: Room types, rates, availability
- **Booking Management**: View, modify, cancel bookings
- **Settings**: Hotel profile, amenities, policies

### Authentication & Authorization
- Email/password authentication
- Password reset functionality
- Role-based access control (super_admin, hotel_owner, hotel_staff, guest)
- Protected routes with middleware
- OAuth callback support

### Payment Processing
- **SaaS Subscriptions**: Monthly plans (Basic $29, Premium $99, Enterprise $299)
- **Booking Payments**: Stripe Connect integration with 10% platform fee
- **Automatic Payouts**: Direct deposits to hotel accounts
- **Invoice Management**: Payment history and receipts

### Email Notifications
- Booking confirmations
- Pre-arrival reminders (24h before check-in)
- Cancellation confirmations
- Payment receipts
- Welcome emails for new hotels
- Beautiful responsive templates

### Media Management
- Drag-and-drop photo upload
- Image optimization with Next.js Image
- Photo gallery with reordering
- Alt text for SEO/accessibility
- Automatic folder organization

### Internationalization
- Support for 5 languages (English, Spanish, French, German, Italian)
- Automatic locale detection
- Language switcher component
- Structured translation files

## Project Structure

```
hotelius/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # Internationalized routes
│   │   │   ├── auth/                 # Authentication pages
│   │   │   ├── dashboard/            # Hotel management dashboard
│   │   │   ├── hotels/[slug]/        # Public hotel pages
│   │   │   └── account/              # Guest account pages
│   │   └── api/                      # API routes
│   │       ├── webhooks/             # Stripe webhooks
│   │       ├── stripe/               # Stripe APIs
│   │       └── bookings/             # Booking APIs
│   ├── components/
│   │   ├── auth/                     # Authentication components
│   │   ├── booking/                  # Booking flow components
│   │   ├── dashboard/                # Dashboard components
│   │   └── media/                    # Media management components
│   ├── lib/
│   │   ├── auth/                     # Auth utilities
│   │   ├── email/                    # Email system
│   │   ├── media/                    # Media utilities
│   │   ├── tenant/                   # Multi-tenant utilities
│   │   ├── supabase/                 # Supabase clients
│   │   └── hooks/                    # Custom React hooks
│   ├── types/                        # TypeScript type definitions
│   ├── i18n/                         # i18n configuration
│   └── messages/                     # Translation files
├── supabase/
│   └── migrations/                   # Database migrations
├── docs/                             # Additional documentation
└── public/                           # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)
- Resend account (for emails)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hotelius
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_FROM="Hotelius <noreply@yourdomain.com>"
SUPPORT_EMAIL="support@hotelius.com"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run database migrations:
```bash
# Using Supabase CLI
supabase migration up

# Or manually run SQL files in Supabase Dashboard
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Required Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard > Developers > API Keys |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard > Developers > API Keys |
| `RESEND_API_KEY` | Resend API key | Resend Dashboard > API Keys |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_FROM` | Sender email address | "Hotelius <noreply@hotelius.com>" |
| `SUPPORT_EMAIL` | Support contact email | "support@hotelius.com" |
| `NEXT_PUBLIC_APP_URL` | Application URL | "http://localhost:3000" |
| `STRIPE_WEBHOOK_SECRET` | Stripe SaaS webhook secret | (get from Stripe CLI or Dashboard) |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Stripe Connect webhook secret | (get from Stripe CLI or Dashboard) |

## Database Schema

The application requires the following main tables:

- **hotels** - Hotel properties with owner information
- **rooms** - Room inventory and types
- **room_types** - Room type definitions
- **bookings** - Guest bookings
- **subscriptions** - Hotel subscription records
- **connect_accounts** - Stripe Connect account details
- **payments** - Booking payment records
- **payouts** - Hotel payout records
- **hotel_photos** - Hotel photo metadata
- **room_type_photos** - Room photo metadata

See `supabase/migrations/` for complete schema definitions.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:ui` | Open Vitest UI |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run test:e2e:ui` | Open Playwright UI |
| `npm run test:e2e:headed` | Run E2E tests in headed mode |

## Key Concepts

### Multi-Tenant System

Each hotel is a separate tenant with isolated data:

```typescript
// Server-side (recommended)
import { getTenant } from '@/lib/tenant'
const hotel = await getTenant('grand-plaza')

// Client-side
import { useTenant } from '@/lib/tenant'
const { hotel, loading } = useTenant()
```

### Authentication

Server-side protection:
```typescript
import { requireAuth } from '@/lib/auth/requireAuth'
const user = await requireAuth()
```

Client-side hook:
```typescript
import { useAuth } from '@/hooks/useAuth'
const { user, signIn, signOut } = useAuth()
```

### Booking Flow

1. **Hotel Landing** - `/hotels/[slug]`
2. **Room Search** - `/hotels/[slug]/rooms?checkIn=...&checkOut=...&guests=...`
3. **Guest Details** - `/hotels/[slug]/book?roomId=...`
4. **Payment** - `/hotels/[slug]/book/payment`
5. **Confirmation** - `/hotels/[slug]/book/confirmation?bookingId=...`

### Email System

```typescript
import { sendBookingConfirmation } from '@/lib/email'
await sendBookingConfirmation(booking)
```

## Stripe Integration

### SaaS Billing
- Hotel owners subscribe to monthly plans
- Automatic invoice generation
- Customer portal for subscription management

### Stripe Connect
- Hotels receive direct payments from guests
- 10% platform fee (minimum $2)
- Automatic payouts to hotel bank accounts
- Complete onboarding flow

### Webhook Setup

For local development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe-connect
```

For production, configure webhooks in Stripe Dashboard pointing to:
- `https://yourdomain.com/api/webhooks/stripe`
- `https://yourdomain.com/api/webhooks/stripe-connect`

## Email Templates

All emails are responsive and mobile-optimized:

- **Booking Confirmation** - Sent when booking is confirmed
- **Booking Reminder** - Sent 24h before check-in
- **Cancellation Confirmation** - Sent when booking is cancelled
- **Payment Receipt** - Sent after successful payment
- **Welcome Email** - Sent to new hotel owners

Preview templates:
```bash
npx react-email dev
```

## Testing

### Unit Tests
```bash
npm run test
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
npm run test:e2e:ui
```

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Recommended Platforms
- **Vercel** - Optimal for Next.js
- **Netlify** - Alternative platform
- **Railway** - Full-stack deployment

### Pre-Deployment Checklist

- [ ] Update environment variables with production values
- [ ] Switch Stripe to live mode
- [ ] Verify domain in Resend
- [ ] Configure production webhooks
- [ ] Run database migrations
- [ ] Test all critical flows
- [ ] Enable SSL/HTTPS
- [ ] Set up error monitoring
- [ ] Configure analytics

## Documentation

Detailed documentation is available in the `docs/` folder:

- **API Reference** - `docs/api-reference.md`
- **Booking State Machine** - `docs/BOOKING_STATE_MACHINE.md`
- **Calendar System** - `docs/CALENDAR_SYSTEM.md`
- **Calendar Architecture** - `docs/CALENDAR_ARCHITECTURE.md`
- **FAQ** - `docs/faq.md`
- **Hotel Admin Guide** - `docs/hotel-admin-guide.md`

## Performance Optimizations

- Server-side rendering (SSR) for optimal initial load
- Image optimization with Next.js Image component
- Request caching with React `cache()`
- Database query optimization with indexes
- Code splitting and lazy loading
- SVG charts without external libraries

## Security

- Row Level Security (RLS) in Supabase
- Server-side authentication checks
- CSRF protection
- Webhook signature verification
- Environment variable validation
- Input sanitization with Zod
- Secure cookie handling

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This is a proprietary SaaS application. All rights reserved.

## Support

For questions or issues:
1. Check the documentation in the `docs/` folder
2. Review component README files
3. Examine TypeScript interfaces for data structures
4. Check browser console for errors

---

**Status**: Production-ready
**Version**: 1.0.0
**Last Updated**: 2025-12-07
