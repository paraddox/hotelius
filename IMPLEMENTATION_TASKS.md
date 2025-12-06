# Hotel Reservation SaaS - Implementation Tasks

This document provides a detailed, actionable task breakdown for implementing the multi-tenant hotel reservation platform.

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Next.js Project
- [ ] Create Next.js 14+ project with App Router (`npx create-next-app@latest --typescript`)
- [ ] Configure TypeScript strict mode in `tsconfig.json`
- [ ] Set up path aliases (`@/components`, `@/lib`, `@/types`, etc.)
- [ ] Install and configure ESLint with recommended rules
- [ ] Install and configure Prettier
- [ ] Create `.env.local` and `.env.example` files with required variables
- [ ] Set up `.gitignore` for environment files and build artifacts

### 1.2 Set Up Supabase Project
- [ ] Create new Supabase project in dashboard
- [ ] Note down project URL and anon/service role keys
- [ ] Install Supabase packages (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Create Supabase client utilities:
  - [ ] `lib/supabase/client.ts` - Browser client
  - [ ] `lib/supabase/server.ts` - Server component client
  - [ ] `lib/supabase/middleware.ts` - Middleware client
- [ ] Enable required Postgres extensions in Supabase SQL editor:
  - [ ] `btree_gist` (for exclusion constraints)
  - [ ] `pg_cron` (for scheduled jobs)

### 1.3 Set Up Stripe Account
- [ ] Create Stripe account (or use test mode)
- [ ] Enable Stripe Connect in dashboard
- [ ] Create test API keys and add to environment variables
- [ ] Install Stripe packages (`stripe`, `@stripe/stripe-js`)
- [ ] Create Stripe utility (`lib/stripe.ts`)

### 1.4 Install Core Dependencies
- [ ] `next-intl` - Internationalization
- [ ] `react-hook-form` - Form handling
- [ ] `zod` - Schema validation
- [ ] `@hookform/resolvers` - Zod integration with react-hook-form
- [ ] `date-fns` or `dayjs` - Date manipulation
- [ ] `tailwindcss` - Styling (if not included in Next.js setup)
- [ ] `lucide-react` or `@heroicons/react` - Icons

---

## Phase 2: Database Schema Implementation

### 2.1 Create Core Tables Migration
- [ ] Create `hotels` table:
  ```sql
  - id (UUID, PK)
  - slug (TEXT, UNIQUE, indexed)
  - name (TEXT)
  - description (JSONB for i18n)
  - settings (JSONB - check_in_time, check_out_time, etc.)
  - currency (TEXT, default 'USD')
  - timezone (TEXT, default 'UTC')
  - subscription_status (TEXT)
  - stripe_account_id (TEXT)
  - created_at, updated_at (TIMESTAMPTZ)
  ```

- [ ] Create `room_types` table:
  ```sql
  - id (UUID, PK)
  - hotel_id (UUID, FK to hotels, CASCADE)
  - name (JSONB for i18n)
  - description (JSONB for i18n)
  - base_price_cents (INTEGER)
  - occupancy_adults (INT, default 2)
  - occupancy_children (INT, default 0)
  - amenities (JSONB array)
  - created_at (TIMESTAMPTZ)
  ```

- [ ] Create `rooms` table:
  ```sql
  - id (UUID, PK)
  - hotel_id (UUID, FK, indexed)
  - room_type_id (UUID, FK, CASCADE)
  - room_number (TEXT)
  - floor (INTEGER)
  - status (TEXT with CHECK constraint: active/maintenance/inactive)
  - UNIQUE constraint on (hotel_id, room_number)
  ```

### 2.2 Create Booking Tables Migration
- [ ] Create `bookings` table with exclusion constraint:
  ```sql
  - id (UUID, PK)
  - hotel_id (UUID, FK)
  - room_id (UUID, FK, nullable)
  - room_type_id (UUID, FK)
  - user_id (UUID, FK to auth.users)
  - stay_range (DATERANGE)
  - status (TEXT with CHECK: pending/confirmed/checked_in/checked_out/cancelled)
  - payment_status (TEXT)
  - total_price_cents (INTEGER)
  - created_at (TIMESTAMPTZ)
  - EXCLUDE constraint using GiST for no overlapping bookings
  ```

- [ ] Create `booking_guests` table (guest details per booking):
  ```sql
  - id (UUID, PK)
  - booking_id (UUID, FK)
  - full_name (TEXT)
  - email (TEXT)
  - phone (TEXT)
  - is_primary (BOOLEAN)
  ```

### 2.3 Create Pricing Tables Migration
- [ ] Create `rate_plans` table:
  ```sql
  - id (UUID, PK)
  - hotel_id (UUID, FK)
  - room_type_id (UUID, FK)
  - name (TEXT)
  - validity_range (DATERANGE)
  - price_cents (INTEGER)
  - priority (INTEGER, default 0)
  - min_stay_days (INTEGER, default 1)
  - CHECK constraint for valid date range
  - GiST index on (hotel_id, room_type_id, validity_range)
  ```

### 2.4 Create User & Auth Tables Migration
- [ ] Create `user_role` enum type: `platform_admin`, `hotel_owner`, `hotel_staff`, `guest`
- [ ] Create `profiles` table:
  ```sql
  - id (UUID, PK, FK to auth.users)
  - hotel_id (UUID, FK, nullable)
  - role (user_role, default 'guest')
  - full_name (TEXT)
  - created_at (TIMESTAMPTZ)
  ```
- [ ] Create trigger to auto-create profile on auth.users insert

### 2.5 Create Media Tables Migration
- [ ] Create `hotel_photos` table:
  ```sql
  - id (UUID, PK)
  - hotel_id (UUID, FK)
  - storage_path (TEXT)
  - alt_text (JSONB for i18n)
  - display_order (INTEGER)
  - is_cover (BOOLEAN)
  ```
- [ ] Create `room_type_photos` table with same structure

### 2.6 Set Up Database Indexes
- [ ] Index on `hotels.slug`
- [ ] Index on `bookings.hotel_id`
- [ ] Index on `bookings.user_id`
- [ ] Index on `bookings.stay_range` (GiST)
- [ ] Index on `rate_plans` (hotel_id, room_type_id, validity_range) using GiST
- [ ] Composite index on `rooms(hotel_id, room_type_id)`

---

## Phase 3: Row Level Security (RLS)

### 3.1 Create Custom Claims Hook
- [ ] Create `public.custom_access_token_hook` function to inject hotel_id and role into JWT
- [ ] Register the hook in Supabase Auth settings
- [ ] Test that claims appear in JWT after login

### 3.2 Implement RLS Policies - Hotels Table
- [ ] Enable RLS on `hotels`
- [ ] Policy: Platform admins can view all hotels
- [ ] Policy: Hotel owners/staff can view their own hotel
- [ ] Policy: Public can view hotels with active subscription (for booking engine)
- [ ] Policy: Only platform admins can insert/update hotels (or via service role)

### 3.3 Implement RLS Policies - Room Types & Rooms
- [ ] Enable RLS on `room_types`
- [ ] Policy: Hotel staff can CRUD room types for their hotel
- [ ] Policy: Public can view room types for active hotels
- [ ] Enable RLS on `rooms`
- [ ] Policy: Hotel staff can CRUD rooms for their hotel
- [ ] Policy: Public cannot view individual rooms (only availability)

### 3.4 Implement RLS Policies - Bookings
- [ ] Enable RLS on `bookings`
- [ ] Policy: Hotel staff can view all bookings for their hotel
- [ ] Policy: Guests can view only their own bookings
- [ ] Policy: Guests can insert bookings (with validation)
- [ ] Policy: Hotel staff can update booking status

### 3.5 Implement RLS Policies - Rate Plans
- [ ] Enable RLS on `rate_plans`
- [ ] Policy: Hotel owners can CRUD rate plans for their hotel
- [ ] Policy: Public can view rate plans (for pricing calculation)

### 3.6 Implement RLS Policies - Profiles
- [ ] Enable RLS on `profiles`
- [ ] Policy: Users can view their own profile
- [ ] Policy: Hotel owners can view staff profiles for their hotel
- [ ] Policy: Users can update their own profile (limited fields)

---

## Phase 4: Authentication System

### 4.1 Set Up Supabase Auth
- [ ] Configure auth providers in Supabase dashboard (Email, Google, etc.)
- [ ] Set up email templates for confirmation, password reset
- [ ] Configure redirect URLs for auth flows

### 4.2 Create Auth Components
- [ ] Create `components/auth/LoginForm.tsx`
- [ ] Create `components/auth/SignUpForm.tsx`
- [ ] Create `components/auth/ForgotPasswordForm.tsx`
- [ ] Create `components/auth/ResetPasswordForm.tsx`
- [ ] Create `components/auth/AuthProvider.tsx` (context for auth state)

### 4.3 Create Auth Pages
- [ ] Create `app/[locale]/auth/login/page.tsx`
- [ ] Create `app/[locale]/auth/signup/page.tsx`
- [ ] Create `app/[locale]/auth/forgot-password/page.tsx`
- [ ] Create `app/[locale]/auth/reset-password/page.tsx`
- [ ] Create `app/[locale]/auth/callback/route.ts` (OAuth callback handler)

### 4.4 Create Auth Utilities
- [ ] Create `lib/auth/getUser.ts` - Get current user in server components
- [ ] Create `lib/auth/requireAuth.ts` - Protect server components
- [ ] Create `lib/auth/requireRole.ts` - Role-based protection
- [ ] Create `hooks/useAuth.ts` - Client-side auth hook

### 4.5 Implement Auth Middleware
- [ ] Create/update `middleware.ts` for auth session refresh
- [ ] Add protected route patterns
- [ ] Handle redirect to login for unauthenticated users

---

## Phase 5: Internationalization (i18n)

### 5.1 Set Up next-intl
- [ ] Install and configure `next-intl`
- [ ] Create `i18n.ts` configuration file
- [ ] Define supported locales: `['en', 'es', 'fr', 'de', 'it']` (or as needed)
- [ ] Set default locale

### 5.2 Create Translation Files
- [ ] Create `messages/en.json` with all UI strings
- [ ] Create translation files for each supported locale
- [ ] Organize translations by namespace (common, auth, dashboard, booking)

### 5.3 Implement i18n Routing
- [ ] Update `middleware.ts` to handle locale detection and routing
- [ ] Create `app/[locale]/layout.tsx` with NextIntlClientProvider
- [ ] Implement locale switcher component

### 5.4 Create i18n Utilities
- [ ] Create helper to extract localized content from JSONB fields
- [ ] Create hook for current locale
- [ ] Create server-side translation helpers

---

## Phase 6: Multi-Tenant Routing

### 6.1 Implement Subdomain/Path-Based Routing
- [ ] Decide on routing strategy (subdomain vs path-based)
- [ ] Update `middleware.ts` to parse tenant from request
- [ ] Create `lib/tenant/getTenant.ts` utility
- [ ] Handle tenant not found (404 page)

### 6.2 Create Tenant Context
- [ ] Create `TenantProvider` component
- [ ] Create `useTenant` hook for accessing current hotel context
- [ ] Pass tenant data through server components

### 6.3 Configure Domain Settings
- [ ] Document custom domain setup process
- [ ] Create DNS configuration guide for hotel custom domains
- [ ] Implement custom domain resolution in middleware

---

## Phase 7: Hotel Admin Dashboard

### 7.1 Dashboard Layout
- [ ] Create `app/[locale]/dashboard/layout.tsx`
- [ ] Create sidebar navigation component
- [ ] Create top header with user menu
- [ ] Implement responsive mobile navigation
- [ ] Add breadcrumb component

### 7.2 Dashboard Home Page
- [ ] Create `app/[locale]/dashboard/page.tsx`
- [ ] Display key metrics (occupancy rate, revenue, upcoming check-ins)
- [ ] Show recent bookings list
- [ ] Add quick action buttons

### 7.3 Hotel Settings Pages
- [ ] Create `app/[locale]/dashboard/settings/page.tsx` - General settings
- [ ] Create `app/[locale]/dashboard/settings/branding/page.tsx` - Logo, colors
- [ ] Create `app/[locale]/dashboard/settings/policies/page.tsx` - Check-in/out times, cancellation
- [ ] Create `app/[locale]/dashboard/settings/team/page.tsx` - Staff management

### 7.4 Room Management Pages
- [ ] Create `app/[locale]/dashboard/room-types/page.tsx` - List room types
- [ ] Create `app/[locale]/dashboard/room-types/new/page.tsx` - Add room type
- [ ] Create `app/[locale]/dashboard/room-types/[id]/page.tsx` - Edit room type
- [ ] Create `app/[locale]/dashboard/rooms/page.tsx` - List physical rooms
- [ ] Create `app/[locale]/dashboard/rooms/new/page.tsx` - Add room
- [ ] Create `app/[locale]/dashboard/rooms/[id]/page.tsx` - Edit room

### 7.5 Room Type Form Components
- [ ] Create multi-language input component for name/description
- [ ] Create amenities selector (checkbox list or tags)
- [ ] Create photo uploader with drag-and-drop
- [ ] Create occupancy settings form
- [ ] Implement form validation with Zod

### 7.6 Pricing/Rates Pages
- [ ] Create `app/[locale]/dashboard/rates/page.tsx` - List rate plans
- [ ] Create `app/[locale]/dashboard/rates/new/page.tsx` - Add rate plan
- [ ] Create `app/[locale]/dashboard/rates/[id]/page.tsx` - Edit rate plan
- [ ] Create calendar view for visualizing rate periods
- [ ] Implement bulk rate update functionality

### 7.7 Bookings Management Pages
- [ ] Create `app/[locale]/dashboard/bookings/page.tsx` - Bookings list with filters
- [ ] Create `app/[locale]/dashboard/bookings/[id]/page.tsx` - Booking details
- [ ] Implement booking status update actions
- [ ] Create booking search functionality
- [ ] Add export to CSV feature

### 7.8 Tape Chart (Scheduler View)
- [ ] Evaluate FullCalendar license or build custom
- [ ] Create `app/[locale]/dashboard/calendar/page.tsx`
- [ ] Implement room × date grid view
- [ ] Add booking visualization on grid
- [ ] Implement drag-and-drop booking modification (stretch goal)
- [ ] Add date range navigation

### 7.9 Reports & Analytics Pages
- [ ] Create `app/[locale]/dashboard/reports/page.tsx`
- [ ] Implement occupancy report
- [ ] Implement revenue report
- [ ] Add date range filters
- [ ] Create charts using a charting library (recharts, chart.js)

---

## Phase 8: Public Booking Engine

### 8.1 Hotel Landing Page
- [ ] Create `app/[locale]/[hotelSlug]/page.tsx`
- [ ] Display hotel information (name, description, photos)
- [ ] Show room type cards with starting prices
- [ ] Add search widget (dates, guests)
- [ ] Implement SEO metadata

### 8.2 Room Search & Availability
- [ ] Create `app/[locale]/[hotelSlug]/rooms/page.tsx`
- [ ] Implement availability search form
- [ ] Create room type listing with availability status
- [ ] Display dynamic pricing based on selected dates
- [ ] Add "Select" button for each room type

### 8.3 Availability API
- [ ] Create `app/api/hotels/[hotelId]/availability/route.ts`
- [ ] Implement availability algorithm (anti-join pattern)
- [ ] Return available rooms by type with pricing
- [ ] Handle edge cases (minimum stay, closed dates)

### 8.4 Pricing Calculation API
- [ ] Create `app/api/hotels/[hotelId]/pricing/route.ts`
- [ ] Implement date-by-date pricing lookup
- [ ] Apply rate plan priority logic
- [ ] Return total price for stay

### 8.5 Booking Flow - Guest Details
- [ ] Create `app/[locale]/[hotelSlug]/book/page.tsx`
- [ ] Create guest information form
- [ ] Validate guest data with Zod
- [ ] Store selection in session/state

### 8.6 Booking Flow - Payment
- [ ] Create `app/[locale]/[hotelSlug]/book/payment/page.tsx`
- [ ] Integrate Stripe Elements for card input
- [ ] Display booking summary with price breakdown
- [ ] Create PaymentIntent on page load (soft hold)

### 8.7 Booking Confirmation
- [ ] Create `app/[locale]/[hotelSlug]/book/confirmation/page.tsx`
- [ ] Display booking reference number
- [ ] Show booking details summary
- [ ] Send confirmation email (via Supabase Edge Function or external service)

### 8.8 Guest Account Pages
- [ ] Create `app/[locale]/account/page.tsx` - Guest profile
- [ ] Create `app/[locale]/account/bookings/page.tsx` - Guest's bookings
- [ ] Create `app/[locale]/account/bookings/[id]/page.tsx` - Booking details
- [ ] Implement booking cancellation flow

---

## Phase 9: Stripe Integration

### 9.1 Stripe Billing (SaaS Subscriptions)
- [ ] Create Products and Prices in Stripe Dashboard
- [ ] Create `app/api/stripe/create-checkout-session/route.ts` - Start subscription
- [ ] Create `app/api/stripe/create-portal-session/route.ts` - Manage subscription
- [ ] Create `app/api/webhooks/stripe/route.ts` - Handle billing webhooks
- [ ] Handle `customer.subscription.updated` event
- [ ] Handle `customer.subscription.deleted` event
- [ ] Update `hotels.subscription_status` on webhook events

### 9.2 Stripe Connect (Hotel Onboarding)
- [ ] Create `app/api/stripe/connect/create-account/route.ts` - Create Express account
- [ ] Create `app/api/stripe/connect/account-link/route.ts` - Onboarding link
- [ ] Create `app/[locale]/dashboard/settings/payments/page.tsx` - Payments settings
- [ ] Handle `account.updated` webhook for Connect accounts
- [ ] Display payout information in dashboard

### 9.3 Stripe Connect (Guest Payments)
- [ ] Create `app/api/bookings/create-payment-intent/route.ts`
- [ ] Implement destination charge with application fee
- [ ] Create `app/api/webhooks/stripe-connect/route.ts` - Connect webhooks
- [ ] Handle `payment_intent.succeeded` - Confirm booking
- [ ] Handle `payment_intent.payment_failed` - Cancel booking

### 9.4 Payment UI Components
- [ ] Create `components/stripe/PaymentForm.tsx` with Elements
- [ ] Create `components/stripe/ConnectOnboarding.tsx`
- [ ] Create `components/stripe/PayoutDashboard.tsx`
- [ ] Handle payment errors gracefully

---

## Phase 10: Booking Logic & Soft Holds

### 10.1 Implement Soft Hold System
- [ ] Create pending booking on checkout initiation
- [ ] Set 15-minute expiration window
- [ ] Create server action/API to create soft hold

### 10.2 Implement pg_cron Cleanup Job
- [ ] Create SQL function to cancel expired pending bookings
- [ ] Schedule cron job to run every minute
- [ ] Test expiration flow

### 10.3 Booking State Machine
- [ ] Define all valid state transitions
- [ ] Create `lib/booking/transitions.ts` with transition logic
- [ ] Implement validation for each transition
- [ ] Log state changes for audit trail

---

## Phase 11: Media Management

### 11.1 Set Up Supabase Storage
- [ ] Create storage bucket for hotel media
- [ ] Configure bucket policies (public read, authenticated write)
- [ ] Set up folder structure: `/{hotel_id}/{entity_type}/{entity_id}/`

### 11.2 Image Upload Components
- [ ] Create `components/media/ImageUploader.tsx`
- [ ] Implement drag-and-drop upload
- [ ] Add image preview
- [ ] Implement upload progress indicator
- [ ] Handle multiple file upload

### 11.3 Image Optimization
- [ ] Configure Next.js Image component with Supabase loader
- [ ] Create custom image loader for Supabase transformations
- [ ] Define standard image sizes (thumbnail, card, full)
- [ ] Implement lazy loading

### 11.4 Media Gallery Management
- [ ] Create `components/media/PhotoGallery.tsx`
- [ ] Implement photo reordering (drag-and-drop)
- [ ] Add delete functionality
- [ ] Set cover photo selection

---

## Phase 12: Email Notifications

### 12.1 Set Up Email Service
- [ ] Choose email provider (Resend, SendGrid, or Supabase Edge Functions)
- [ ] Configure API keys and sender domain
- [ ] Create email utility (`lib/email/send.ts`)

### 12.2 Create Email Templates
- [ ] Booking confirmation email
- [ ] Booking cancellation email
- [ ] Payment receipt email
- [ ] Password reset email (if custom)
- [ ] Welcome email for new hotels

### 12.3 Implement Email Triggers
- [ ] Send confirmation on booking.status = 'confirmed'
- [ ] Send cancellation on booking.status = 'cancelled'
- [ ] Integrate with Stripe webhook handlers

---

## Phase 13: Testing

### 13.1 Set Up Testing Framework
- [ ] Install Jest or Vitest for unit tests
- [ ] Install React Testing Library
- [ ] Install Playwright for E2E tests
- [ ] Configure test database for integration tests

### 13.2 Unit Tests
- [ ] Test pricing calculation logic
- [ ] Test availability algorithm
- [ ] Test booking state transitions
- [ ] Test form validation schemas
- [ ] Test utility functions

### 13.3 Integration Tests
- [ ] Test RLS policies (each role)
- [ ] Test booking creation with exclusion constraint
- [ ] Test rate plan priority resolution
- [ ] Test auth flows

### 13.4 E2E Tests (Playwright)
- [ ] Test complete booking flow (search → pay → confirm)
- [ ] Test hotel admin login and room creation
- [ ] Test rate plan management
- [ ] Test booking management in dashboard
- [ ] Test guest account flows

---

## Phase 14: DevOps & Deployment

### 14.1 CI/CD Pipeline (GitHub Actions)
- [ ] Create `.github/workflows/ci.yml`
- [ ] Run linting on PR
- [ ] Run type checking on PR
- [ ] Run unit tests on PR
- [ ] Run E2E tests on PR (optional, or on merge)

### 14.2 Database Migrations
- [ ] Set up Supabase CLI for local development
- [ ] Create migration files for all schema changes
- [ ] Document migration process
- [ ] Test migration rollback

### 14.3 Vercel Deployment
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Set up preview deployments for PRs
- [ ] Configure production domain
- [ ] Set up Vercel Analytics (optional)

### 14.4 Monitoring & Logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure Supabase logging
- [ ] Set up uptime monitoring
- [ ] Create alerts for critical errors

---

## Phase 15: Documentation & Polish

### 15.1 Code Documentation
- [ ] Add JSDoc comments to utility functions
- [ ] Document complex algorithms
- [ ] Create README with setup instructions

### 15.2 User Documentation
- [ ] Create hotel admin user guide
- [ ] Document API endpoints (if public)
- [ ] Create FAQ section

### 15.3 Final Polish
- [ ] Accessibility audit (WCAG compliance)
- [ ] Performance audit (Lighthouse)
- [ ] Security audit (OWASP checklist)
- [ ] Mobile responsiveness review
- [ ] Cross-browser testing

---

## Appendix: Database Migration Order

Execute migrations in this order to respect foreign key dependencies:

1. Enable extensions (`btree_gist`, `pg_cron`)
2. Create `user_role` enum
3. Create `hotels` table
4. Create `profiles` table (depends on auth.users, hotels)
5. Create `room_types` table (depends on hotels)
6. Create `rooms` table (depends on hotels, room_types)
7. Create `rate_plans` table (depends on hotels, room_types)
8. Create `bookings` table (depends on hotels, rooms, room_types, auth.users)
9. Create `booking_guests` table (depends on bookings)
10. Create `hotel_photos` and `room_type_photos` tables
11. Create custom access token hook function
12. Enable RLS and create policies on all tables
13. Create indexes
14. Set up pg_cron job for expired bookings

---

## Appendix: Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEFAULT_LOCALE=en

# Email (example for Resend)
RESEND_API_KEY=
```

---

## Appendix: Recommended File Structure

```
├── app/
│   ├── [locale]/
│   │   ├── (public)/
│   │   │   ├── [hotelSlug]/
│   │   │   │   ├── page.tsx          # Hotel landing
│   │   │   │   ├── rooms/page.tsx    # Search results
│   │   │   │   └── book/
│   │   │   │       ├── page.tsx      # Guest details
│   │   │   │       ├── payment/page.tsx
│   │   │   │       └── confirmation/page.tsx
│   │   │   └── account/
│   │   ├── (auth)/
│   │   │   └── auth/
│   │   │       ├── login/page.tsx
│   │   │       └── signup/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── bookings/
│   │   │   ├── rooms/
│   │   │   ├── room-types/
│   │   │   ├── rates/
│   │   │   ├── calendar/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── hotels/[hotelId]/
│   │   │   ├── availability/route.ts
│   │   │   └── pricing/route.ts
│   │   ├── bookings/
│   │   ├── stripe/
│   │   └── webhooks/
│   └── layout.tsx
├── components/
│   ├── auth/
│   ├── booking/
│   ├── dashboard/
│   ├── media/
│   ├── stripe/
│   └── ui/
├── lib/
│   ├── supabase/
│   ├── stripe.ts
│   ├── auth/
│   ├── booking/
│   └── utils.ts
├── messages/
│   ├── en.json
│   └── es.json
├── types/
│   ├── database.ts    # Supabase generated types
│   └── index.ts
└── middleware.ts
```
