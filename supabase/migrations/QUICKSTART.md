# Quick Start Guide - Hotelius Database Migrations

## Overview

This guide will help you quickly set up the Hotelius hotel reservation SaaS database on Supabase.

## Prerequisites

- Supabase project created
- Supabase CLI installed (optional but recommended)
- PostgreSQL access to your Supabase database

## Installation Methods

### Method 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Apply all migrations**:
   ```bash
   supabase db push
   ```

### Method 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order (001 through 011)
4. Execute each one sequentially

### Method 3: Using psql

```bash
# Set your connection string
export DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Apply migrations in order
psql $DATABASE_URL -f supabase/migrations/001_extensions.sql
psql $DATABASE_URL -f supabase/migrations/002_hotels.sql
psql $DATABASE_URL -f supabase/migrations/003_profiles.sql
psql $DATABASE_URL -f supabase/migrations/004_room_types.sql
psql $DATABASE_URL -f supabase/migrations/005_rooms.sql
psql $DATABASE_URL -f supabase/migrations/006_rate_plans.sql
psql $DATABASE_URL -f supabase/migrations/007_bookings.sql
psql $DATABASE_URL -f supabase/migrations/008_booking_guests.sql
psql $DATABASE_URL -f supabase/migrations/009_media.sql
psql $DATABASE_URL -f supabase/migrations/010_rls_policies.sql
psql $DATABASE_URL -f supabase/migrations/011_indexes.sql
```

## Verification

After applying all migrations, verify the setup:

```bash
psql $DATABASE_URL -f supabase/migrations/VERIFY_SCHEMA.sql
```

Or run in Supabase SQL Editor to see a comprehensive verification report.

## Expected Output

You should see:
- 4 extensions installed
- 9 tables created
- 6 enum types
- 1 EXCLUDE constraint on bookings
- RLS enabled on all tables
- Multiple RLS policies per table
- Numerous indexes including GiST and GIN indexes
- Helper functions for RLS
- Triggers for auto-updates

## Testing with Sample Data

Load sample data to test the schema:

```bash
psql $DATABASE_URL -f supabase/migrations/EXAMPLE_DATA.sql
```

**Important**: Edit `EXAMPLE_DATA.sql` first to replace placeholder UUIDs with actual values from your database.

## Migration Files

| File | Purpose | Key Features |
|------|---------|--------------|
| 001_extensions.sql | PostgreSQL extensions | uuid-ossp, btree_gist, pg_trgm, unaccent |
| 002_hotels.sql | Hotels table | Subscription management, Stripe integration |
| 003_profiles.sql | User profiles | Role-based access, auto-creation from auth |
| 004_room_types.sql | Room types | i18n support, amenities, pricing |
| 005_rooms.sql | Physical rooms | Status tracking, validation |
| 006_rate_plans.sql | Dynamic pricing | Date ranges, priorities, restrictions |
| 007_bookings.sql | Reservations | **EXCLUDE constraint**, confirmation codes |
| 008_booking_guests.sql | Guest details | Primary/additional guests |
| 009_media.sql | Photos | Hotel and room type images |
| 010_rls_policies.sql | Security | Multi-tenant isolation |
| 011_indexes.sql | Performance | GiST, GIN, B-tree indexes |

## Common Operations

### Create a Platform Admin

```sql
-- First create user via Supabase Auth, then:
UPDATE profiles
SET role = 'platform_admin'
WHERE email = 'admin@yourdomain.com';
```

### Create a Hotel Owner

```sql
-- After creating hotel and user:
UPDATE profiles
SET
  role = 'hotel_owner',
  hotel_id = 'your-hotel-uuid-here'
WHERE email = 'owner@hotel.com';
```

### Check Available Rooms

```sql
SELECT
  r.room_number,
  rt.name_default as room_type,
  rt.base_price_cents / 100.0 as price_usd
FROM rooms r
JOIN room_types rt ON rt.id = r.room_type_id
WHERE r.hotel_id = 'hotel-uuid'
  AND r.status = 'available'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.room_id = r.id
      AND b.status NOT IN ('cancelled', 'no_show')
      AND b.stay_range && daterange('2024-12-15', '2024-12-18', '[)')
  );
```

### Test Double Booking Prevention

```sql
-- First booking (should succeed)
INSERT INTO bookings (hotel_id, room_id, room_type_id, check_in_date, check_out_date, num_adults, status, total_price_cents)
VALUES ('hotel-uuid', 'room-uuid', 'room-type-uuid', '2024-12-15', '2024-12-18', 2, 'confirmed', 38700);

-- Overlapping booking (should fail with EXCLUDE constraint error)
INSERT INTO bookings (hotel_id, room_id, room_type_id, check_in_date, check_out_date, num_adults, status, total_price_cents)
VALUES ('hotel-uuid', 'room-uuid', 'room-type-uuid', '2024-12-16', '2024-12-19', 2, 'confirmed', 38700);
-- Expected: ERROR:  conflicting key value violates exclusion constraint "bookings_no_overlap"
```

## Row Level Security (RLS) Testing

### As Public User (Not Authenticated)

```sql
-- Should only see active hotels with active subscriptions
SELECT * FROM hotels;

-- Should only see active room types for active hotels
SELECT * FROM room_types;
```

### As Hotel Staff

```sql
-- Can view/manage own hotel's data
SELECT * FROM bookings WHERE hotel_id = get_user_hotel_id();

-- Cannot view other hotels' data (returns empty)
SELECT * FROM bookings WHERE hotel_id != get_user_hotel_id();
```

### As Guest

```sql
-- Can view own bookings
SELECT * FROM bookings WHERE guest_id = auth.uid();

-- Cannot view other guests' bookings (returns empty)
SELECT * FROM bookings WHERE guest_id != auth.uid();
```

## Configuration

### Update Hotel Settings

```sql
UPDATE hotels
SET settings = settings || '{
  "check_in_time": "14:00",
  "check_out_time": "12:00",
  "tax_rate": 0.10
}'::jsonb
WHERE id = 'hotel-uuid';
```

### Add Room Amenities

```sql
UPDATE room_types
SET amenities = amenities || '["pool_access", "gym_access"]'::jsonb
WHERE id = 'room-type-uuid';
```

## Troubleshooting

### Issue: RLS prevents all access

**Solution**: Make sure you're authenticated and your profile has the correct role and hotel_id:

```sql
SELECT id, email, role, hotel_id FROM profiles WHERE id = auth.uid();
```

### Issue: Cannot insert booking (foreign key violation)

**Solution**: Ensure room_id, room_type_id, and hotel_id are all consistent:

```sql
SELECT
  r.id as room_id,
  r.hotel_id,
  r.room_type_id,
  rt.hotel_id as room_type_hotel_id
FROM rooms r
JOIN room_types rt ON rt.id = r.room_type_id
WHERE r.id = 'your-room-uuid';
```

### Issue: Double booking error on cancelled booking

**Solution**: The EXCLUDE constraint only applies to non-cancelled bookings. This is by design. Cancelled bookings don't block the room.

### Issue: Cannot find available rooms

**Solution**: Check room status and existing bookings:

```sql
SELECT
  r.room_number,
  r.status,
  COUNT(b.id) as booking_count
FROM rooms r
LEFT JOIN bookings b ON b.room_id = r.id
  AND b.status NOT IN ('cancelled', 'no_show')
  AND b.stay_range && daterange('2024-12-15', '2024-12-18', '[)')
WHERE r.hotel_id = 'hotel-uuid'
GROUP BY r.id, r.room_number, r.status;
```

## Performance Tips

1. **Use date ranges**: Always use `daterange` for booking queries to leverage GiST indexes
2. **Filter by hotel_id**: Always include `hotel_id` in queries for better index usage
3. **Use partial indexes**: Query active records with `is_active = true` to use partial indexes
4. **Avoid SELECT ***: Only select columns you need
5. **Use materialized views**: For complex reports, consider materialized views

## Next Steps

1. Set up Supabase Storage for hotel and room photos
2. Configure Stripe webhooks for subscription management
3. Set up Edge Functions for complex business logic
4. Implement real-time subscriptions for availability updates
5. Create database backups and point-in-time recovery strategy

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Date Ranges](https://www.postgresql.org/docs/current/rangetypes.html)
- [PostgreSQL GiST Indexes](https://www.postgresql.org/docs/current/gist.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Schema Diagram

```
hotels (1) ──────┬──────> (N) room_types
                 │              │
                 │              │ (1)
                 │              │
                 │              ↓
                 │           (N) rooms
                 │              │
                 │              │ (1)
                 │              │
                 │              ↓
                 │           (N) bookings
                 │              │
                 │              │ (1)
                 │              │
                 │              ↓
                 │           (N) booking_guests
                 │
                 ├──────> (N) hotel_photos
                 │
                 ├──────> (N) rate_plans
                 │
                 └──────> (N) profiles (staff)

profiles (guests) ──> (N) bookings
```

## License

This schema is part of the Hotelius hotel reservation SaaS application.
