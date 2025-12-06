# Hotelius Database Migrations

This directory contains SQL migration files for the Hotelius hotel reservation SaaS application, designed for Supabase PostgreSQL.

## Migration Files

The migrations are numbered sequentially and must be run in order:

1. **001_extensions.sql** - PostgreSQL extensions
   - `uuid-ossp` for UUID generation
   - `btree_gist` for EXCLUDE constraints with date ranges
   - `pg_trgm` for trigram text search
   - `unaccent` for accent-insensitive searches

2. **002_hotels.sql** - Hotels table
   - Multi-tenant hotel management
   - Subscription status tracking (trial, active, past_due, canceled, suspended)
   - Stripe integration (customer_id, account_id for Connect)
   - Flexible JSONB settings for hotel-specific configurations
   - Geolocation support

3. **003_profiles.sql** - User profiles
   - Extends `auth.users` with application-specific data
   - Role-based access: platform_admin, hotel_owner, hotel_staff, guest
   - Hotel association for staff members
   - Auto-creates profile on user signup

4. **004_room_types.sql** - Room type definitions
   - Internationalized names and descriptions (JSONB)
   - Base pricing in cents (avoids floating point issues)
   - Occupancy limits and bed configurations
   - Amenities as JSONB arrays

5. **005_rooms.sql** - Physical rooms
   - Links to hotel and room_type
   - Room status: available, occupied, maintenance, out_of_service
   - Unique room numbers per hotel
   - Consistency validation triggers

6. **006_rate_plans.sql** - Dynamic pricing
   - Date range validity using DATERANGE type
   - Priority-based rate selection
   - Stay restrictions (min/max nights, advance booking)
   - Day-of-week applicability
   - Cancellation policies

7. **007_bookings.sql** - Reservations
   - **CRITICAL**: EXCLUDE constraint using GiST prevents double bookings
   - Date range operations with DATERANGE type
   - Status tracking: pending, confirmed, checked_in, checked_out, cancelled, no_show
   - Payment status integration with Stripe
   - Auto-generated confirmation codes
   - Special requests and internal notes

8. **008_booking_guests.sql** - Guest details
   - Primary and additional guests per booking
   - Personal information and identification
   - Address details
   - Ensures one primary guest per booking

9. **009_media.sql** - Photo galleries
   - Hotel photos with categorization
   - Room type photos
   - Internationalized captions
   - Sort ordering and featured images
   - Image metadata (dimensions, file size, MIME type)

10. **010_rls_policies.sql** - Row Level Security
    - Multi-tenant data isolation
    - Public access to active hotels with valid subscriptions
    - Hotel staff can only access their hotel's data
    - Guests can view/manage their own bookings
    - Platform admins have full access
    - Helper functions for role-based access control

11. **011_indexes.sql** - Performance optimization
    - Composite indexes for common query patterns
    - GiST indexes for date range operations
    - Trigram indexes for text search
    - Partial indexes for filtered queries
    - JSONB indexes for amenities and settings
    - Covering indexes for high-frequency queries

## Key Features

### Double Booking Prevention
The `bookings` table uses a GiST EXCLUDE constraint to prevent overlapping reservations:

```sql
ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    room_id WITH =,
    stay_range WITH &&
  )
  WHERE (status NOT IN ('cancelled', 'no_show'));
```

This ensures database-level enforcement that no room can be double-booked.

### Multi-Tenant Architecture
- All tables have `hotel_id` foreign keys
- RLS policies enforce data isolation
- Staff can only access their hotel's data
- Public API shows only active hotels with valid subscriptions

### Internationalization (i18n)
Room types support multiple languages:

```json
{
  "name": {
    "en": "Deluxe Ocean View",
    "es": "Vista al Mar de Lujo",
    "fr": "Vue sur l'Océan Deluxe"
  }
}
```

### Date Range Operations
Uses PostgreSQL DATERANGE type for efficient overlap detection:
- Check-in/check-out date validation
- Rate plan validity periods
- Availability queries with GiST indexes

### Subscription Management
Hotels have subscription status tracking:
- Trial period (14 days default)
- Active subscriptions
- Past due handling
- Cancellation tracking
- Stripe integration for billing

## Running Migrations

### Using Supabase CLI

```bash
# Apply all migrations
supabase db push

# Or apply individually
supabase db push --file supabase/migrations/001_extensions.sql
```

### Using psql

```bash
# Apply in order
psql -h your-host -U postgres -d your-database \
  -f supabase/migrations/001_extensions.sql \
  -f supabase/migrations/002_hotels.sql \
  -f supabase/migrations/003_profiles.sql \
  # ... etc
```

### Using Migration Tool

```bash
# If using a migration tool like Flyway or Liquibase
# The numbered prefixes ensure correct ordering
```

## Schema Overview

### Core Entities
- **hotels** - Hotel properties
- **profiles** - User accounts with roles
- **room_types** - Room categories (e.g., Deluxe, Suite)
- **rooms** - Physical room instances
- **rate_plans** - Dynamic pricing rules
- **bookings** - Reservations
- **booking_guests** - Guest information

### Supporting Tables
- **hotel_photos** - Hotel image gallery
- **room_type_photos** - Room type image gallery

### Enums
- `subscription_status` - trial, active, past_due, canceled, suspended
- `user_role` - platform_admin, hotel_owner, hotel_staff, guest
- `room_status` - available, occupied, maintenance, out_of_service
- `booking_status` - pending, confirmed, checked_in, checked_out, cancelled, no_show
- `payment_status` - pending, authorized, paid, partially_refunded, refunded, failed
- `guest_type` - primary, additional, child

## Data Types

### UUIDs
All primary keys use UUID with `gen_random_uuid()` default.

### Timestamps
All tables use TIMESTAMPTZ for proper timezone handling.

### Money
All prices stored as INTEGER cents to avoid floating point errors.

### JSONB
Used for flexible data:
- Hotel settings
- Room type names/descriptions (i18n)
- Amenities lists
- Bed configurations
- Photo captions (i18n)

### Date Ranges
DATERANGE type used for:
- Booking stay periods
- Rate plan validity
- Enables efficient overlap detection with GiST indexes

## Triggers

### Auto-Update Timestamps
All tables have `updated_at` triggers that automatically update on row modification.

### Auto-Generate Codes
- Booking confirmation codes auto-generated
- Ensures uniqueness across system

### Data Consistency
- Room must belong to same hotel as room_type
- Rate plan room_type must belong to same hotel
- Booking room/room_type must belong to same hotel

### Profile Creation
Auto-creates profile when user signs up via auth.users trigger.

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- Public read access (active hotels only)
- Staff access (own hotel only)
- Guest access (own bookings only)
- Admin access (full access)

### Helper Functions
- `get_user_role()` - Get current user's role
- `get_user_hotel_id()` - Get current user's hotel
- `is_platform_admin()` - Check admin status
- `has_hotel_access()` - Verify hotel access

## Performance Considerations

### Indexes
- B-tree indexes for standard lookups
- GiST indexes for date range operations and geolocation
- GIN indexes for JSONB and full-text search
- Partial indexes for filtered queries
- Covering indexes for common query patterns

### Query Optimization
- Trigram indexes enable fast fuzzy search
- Date range indexes optimize availability checks
- Composite indexes reduce index lookups
- Partial indexes reduce index size and maintenance

## Best Practices

1. **Always check subscription status** when displaying hotels publicly
2. **Use date ranges** for booking operations to leverage GiST indexes
3. **Store prices in cents** to avoid floating point precision issues
4. **Use JSONB** for flexible, schema-less data
5. **Leverage RLS** for security - don't bypass it in application code
6. **Use prepared statements** to prevent SQL injection
7. **Monitor query performance** and add indexes as needed

## Maintenance

### Regular Tasks
- Monitor subscription expirations
- Clean up cancelled bookings (optional archival)
- Analyze query performance and add indexes
- Review and update RLS policies

### Backup Strategy
- Regular database backups (Supabase handles this)
- Export critical data before schema changes
- Test migrations on staging environment first

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review PostgreSQL date range docs: https://www.postgresql.org/docs/current/rangetypes.html
- Check GiST index usage: https://www.postgresql.org/docs/current/gist.html
