-- EXAMPLE_DATA.sql
-- Sample data for testing the Hotelius database schema
-- Run this AFTER all migrations have been applied

-- NOTE: This assumes you have created a test user via Supabase Auth
-- Replace 'YOUR_TEST_USER_ID' with an actual UUID from auth.users

-- ============================================================================
-- EXAMPLE 1: Create a test hotel
-- ============================================================================

INSERT INTO hotels (
  name,
  slug,
  email,
  phone,
  website,
  address_line1,
  city,
  state_province,
  postal_code,
  country,
  latitude,
  longitude,
  subscription_status,
  subscription_started_at,
  settings
) VALUES (
  'Grand Plaza Hotel',
  'grand-plaza-hotel',
  'info@grandplaza.com',
  '+1-555-0100',
  'https://grandplaza.com',
  '123 Main Street',
  'San Francisco',
  'CA',
  '94102',
  'USA',
  37.7749,
  -122.4194,
  'active',
  NOW(),
  '{
    "currency": "USD",
    "timezone": "America/Los_Angeles",
    "check_in_time": "15:00",
    "check_out_time": "11:00",
    "cancellation_policy_hours": 24,
    "allow_same_day_booking": true,
    "require_credit_card": true,
    "tax_rate": 0.0875,
    "notification_emails": ["reservations@grandplaza.com", "manager@grandplaza.com"]
  }'::jsonb
) RETURNING id;

-- Save the hotel ID for later use
-- Let's assume it's: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

-- ============================================================================
-- EXAMPLE 2: Update a profile to be hotel owner
-- ============================================================================

-- First, manually create a user in Supabase Auth dashboard, then:
/*
UPDATE profiles
SET
  role = 'hotel_owner',
  hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  full_name = 'John Smith'
WHERE email = 'john@example.com';
*/

-- ============================================================================
-- EXAMPLE 3: Create room types
-- ============================================================================

INSERT INTO room_types (
  hotel_id,
  name,
  description,
  name_default,
  base_price_cents,
  max_adults,
  max_children,
  max_occupancy,
  size_sqm,
  bed_configuration,
  amenities,
  sort_order
) VALUES
-- Standard Room
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '{
    "en": "Standard Room",
    "es": "Habitación Estándar",
    "fr": "Chambre Standard"
  }'::jsonb,
  '{
    "en": "Comfortable room with modern amenities and city view",
    "es": "Habitación cómoda con comodidades modernas y vista a la ciudad",
    "fr": "Chambre confortable avec équipements modernes et vue sur la ville"
  }'::jsonb,
  'Standard Room',
  12900, -- $129.00
  2,
  1,
  3,
  25.0,
  '[{"type": "queen", "count": 1}]'::jsonb,
  '["wifi", "tv", "minibar", "safe", "desk", "air_conditioning"]'::jsonb,
  1
),
-- Deluxe Suite
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '{
    "en": "Deluxe Suite",
    "es": "Suite de Lujo",
    "fr": "Suite Deluxe"
  }'::jsonb,
  '{
    "en": "Spacious suite with separate living area and premium amenities",
    "es": "Suite espaciosa con sala de estar separada y comodidades premium",
    "fr": "Suite spacieuse avec coin salon séparé et équipements premium"
  }'::jsonb,
  'Deluxe Suite',
  24900, -- $249.00
  2,
  2,
  4,
  45.0,
  '[{"type": "king", "count": 1}, {"type": "sofa_bed", "count": 1}]'::jsonb,
  '["wifi", "tv", "minibar", "safe", "desk", "air_conditioning", "balcony", "bathtub", "coffee_maker", "premium_toiletries"]'::jsonb,
  2
)
RETURNING id, name_default, base_price_cents;

-- ============================================================================
-- EXAMPLE 4: Create physical rooms
-- ============================================================================

-- Assuming room_type IDs from above
-- Standard Rooms: 101-110
-- Deluxe Suites: 201-205

INSERT INTO rooms (hotel_id, room_type_id, room_number, floor, status)
SELECT
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  (SELECT id FROM room_types WHERE name_default = 'Standard Room' LIMIT 1),
  (100 + generate_series(1, 10))::text,
  1,
  'available';

INSERT INTO rooms (hotel_id, room_type_id, room_number, floor, status)
SELECT
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  (SELECT id FROM room_types WHERE name_default = 'Deluxe Suite' LIMIT 1),
  (200 + generate_series(1, 5))::text,
  2,
  'available';

-- ============================================================================
-- EXAMPLE 5: Create rate plans
-- ============================================================================

INSERT INTO rate_plans (
  hotel_id,
  room_type_id,
  name,
  code,
  description,
  validity_range,
  price_cents,
  priority,
  min_stay_nights,
  is_refundable,
  cancellation_deadline_hours
) VALUES
-- Standard Rate for Standard Room
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  (SELECT id FROM room_types WHERE name_default = 'Standard Room' LIMIT 1),
  'Standard Rate',
  'STD-2024',
  'Regular pricing for standard room',
  daterange('2024-01-01', '2025-12-31', '[)'),
  12900,
  1,
  1,
  true,
  24
),
-- Weekend Special for Standard Room
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  (SELECT id FROM room_types WHERE name_default = 'Standard Room' LIMIT 1),
  'Weekend Special',
  'WKND-2024',
  'Special pricing for weekend stays',
  daterange('2024-01-01', '2025-12-31', '[)'),
  9900,
  10, -- Higher priority
  2,
  true,
  48,
  ARRAY[5, 6] -- Friday, Saturday
),
-- Deluxe Suite Standard Rate
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  (SELECT id FROM room_types WHERE name_default = 'Deluxe Suite' LIMIT 1),
  'Suite Standard Rate',
  'SUITE-2024',
  'Regular pricing for deluxe suite',
  daterange('2024-01-01', '2025-12-31', '[)'),
  24900,
  1,
  1,
  true,
  48
);

-- ============================================================================
-- EXAMPLE 6: Create a sample booking
-- ============================================================================

-- First, get a room ID
DO $$
DECLARE
  test_room_id UUID;
  test_guest_id UUID;
  test_booking_id UUID;
BEGIN
  -- Get a standard room
  SELECT id INTO test_room_id
  FROM rooms
  WHERE room_number = '101'
  LIMIT 1;

  -- Create a booking (replace with actual guest_id from profiles)
  INSERT INTO bookings (
    hotel_id,
    room_id,
    room_type_id,
    guest_id,
    check_in_date,
    check_out_date,
    num_adults,
    num_children,
    status,
    payment_status,
    total_price_cents,
    tax_cents,
    special_requests
  ) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    test_room_id,
    (SELECT room_type_id FROM rooms WHERE id = test_room_id),
    NULL, -- Set to actual guest_id if available
    CURRENT_DATE + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '10 days',
    2,
    0,
    'confirmed',
    'paid',
    38700, -- 3 nights * $129
    3387, -- Tax at 8.75%
    'Late check-in requested, arriving around 10 PM'
  )
  RETURNING id INTO test_booking_id;

  -- Add primary guest details
  INSERT INTO booking_guests (
    booking_id,
    guest_type,
    first_name,
    last_name,
    email,
    phone,
    country
  ) VALUES (
    test_booking_id,
    'primary',
    'Jane',
    'Doe',
    'jane.doe@example.com',
    '+1-555-0123',
    'USA'
  );

  RAISE NOTICE 'Created booking with ID: %', test_booking_id;
END $$;

-- ============================================================================
-- EXAMPLE 7: Test double booking prevention (should fail)
-- ============================================================================

-- This should raise an error due to EXCLUDE constraint
/*
INSERT INTO bookings (
  hotel_id,
  room_id,
  room_type_id,
  check_in_date,
  check_out_date,
  num_adults,
  status,
  payment_status,
  total_price_cents
)
SELECT
  hotel_id,
  room_id,
  room_type_id,
  CURRENT_DATE + INTERVAL '8 days', -- Overlaps with previous booking
  CURRENT_DATE + INTERVAL '11 days',
  2,
  'confirmed',
  'pending',
  25800
FROM bookings
WHERE room_id = (SELECT id FROM rooms WHERE room_number = '101' LIMIT 1)
LIMIT 1;
-- Expected error: conflicting key value violates exclusion constraint "bookings_no_overlap"
*/

-- ============================================================================
-- EXAMPLE 8: Query available rooms for dates
-- ============================================================================

-- Find available rooms for specific dates
SELECT
  r.room_number,
  rt.name_default as room_type,
  rt.base_price_cents / 100.0 as price_usd,
  r.status
FROM rooms r
JOIN room_types rt ON rt.id = r.room_type_id
WHERE r.hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  AND r.is_active = true
  AND r.status = 'available'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.room_id = r.id
      AND b.status NOT IN ('cancelled', 'no_show')
      AND b.stay_range && daterange('2024-12-15', '2024-12-18', '[)')
  )
ORDER BY rt.sort_order, r.room_number;

-- ============================================================================
-- EXAMPLE 9: Query with rate plan pricing
-- ============================================================================

-- Find best rate for a room type on specific dates
SELECT
  rt.name_default as room_type,
  rp.name as rate_plan,
  rp.price_cents / 100.0 as price_usd,
  rp.min_stay_nights,
  rp.is_refundable,
  rp.cancellation_deadline_hours
FROM room_types rt
JOIN rate_plans rp ON rp.room_type_id = rt.id
WHERE rt.hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  AND rt.is_active = true
  AND rp.is_active = true
  AND rp.validity_range @> '2024-12-15'::date
  AND (
    rp.applicable_days IS NULL
    OR EXTRACT(DOW FROM '2024-12-15'::date)::integer = ANY(rp.applicable_days)
  )
ORDER BY rt.sort_order, rp.priority DESC, rp.price_cents;

-- ============================================================================
-- EXAMPLE 10: Hotel statistics
-- ============================================================================

-- Get booking statistics for a hotel
SELECT
  COUNT(*) as total_bookings,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
  COUNT(*) FILTER (WHERE status = 'checked_in') as current_guests,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
  SUM(total_price_cents) FILTER (WHERE payment_status = 'paid') / 100.0 as total_revenue_usd,
  AVG(check_out_date - check_in_date) as avg_stay_length
FROM bookings
WHERE hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  AND created_at >= NOW() - INTERVAL '30 days';

-- ============================================================================
-- CLEANUP (if needed)
-- ============================================================================

/*
-- Delete all test data
DELETE FROM booking_guests WHERE booking_id IN (
  SELECT id FROM bookings WHERE hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
);
DELETE FROM bookings WHERE hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
DELETE FROM rate_plans WHERE hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
DELETE FROM rooms WHERE hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
DELETE FROM room_types WHERE hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
DELETE FROM profiles WHERE hotel_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
DELETE FROM hotels WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
*/
