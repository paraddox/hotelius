-- Migration: 011_indexes.sql
-- Description: Additional indexes for performance optimization
-- Dependencies: All previous migrations

--------------------------------------------------------------------------------
-- COMPOSITE INDEXES FOR COMMON QUERIES
--------------------------------------------------------------------------------

-- Hotels: Common filtering combinations
CREATE INDEX idx_hotels_active_subscription ON hotels(is_active, subscription_status)
  WHERE is_active = true AND subscription_status IN ('trial', 'active');

CREATE INDEX idx_hotels_country_city ON hotels(country, city)
  WHERE is_active = true;

-- Room Types: Availability queries
CREATE INDEX idx_room_types_hotel_active_price ON room_types(hotel_id, is_active, base_price_cents)
  WHERE is_active = true;

-- Rooms: Availability by type and status
CREATE INDEX idx_rooms_hotel_type_status_active ON rooms(hotel_id, room_type_id, status, is_active)
  WHERE is_active = true AND status = 'available';

-- Rate Plans: Active plans by hotel and validity
CREATE INDEX idx_rate_plans_hotel_active_validity ON rate_plans
  USING gist(hotel_id, is_active, validity_range)
  WHERE is_active = true;

CREATE INDEX idx_rate_plans_room_type_active_validity ON rate_plans
  USING gist(room_type_id, is_active, validity_range)
  WHERE is_active = true;

-- Bookings: Availability checking (critical for performance)
CREATE INDEX idx_bookings_room_status_dates ON bookings(room_id, status, check_in_date, check_out_date)
  WHERE status NOT IN ('cancelled', 'no_show');

CREATE INDEX idx_bookings_hotel_dates_status ON bookings(hotel_id, check_in_date, check_out_date, status);

-- Bookings: Guest lookup and history
CREATE INDEX idx_bookings_guest_status_dates ON bookings(guest_id, status, check_in_date DESC)
  WHERE guest_id IS NOT NULL;

-- Bookings: Upcoming check-ins and check-outs (no date filter - date filtering done at query time)
CREATE INDEX idx_bookings_upcoming_checkins ON bookings(hotel_id, check_in_date, status)
  WHERE status = 'confirmed';

CREATE INDEX idx_bookings_upcoming_checkouts ON bookings(hotel_id, check_out_date, status)
  WHERE status IN ('confirmed', 'checked_in');

-- Bookings: Current occupancy (no date filter - date filtering done at query time)
CREATE INDEX idx_bookings_current_occupancy ON bookings(hotel_id, room_id, check_in_date, check_out_date)
  WHERE status IN ('confirmed', 'checked_in');

--------------------------------------------------------------------------------
-- GIST INDEXES FOR DATE RANGE OPERATIONS
--------------------------------------------------------------------------------

-- Bookings: Room and date range overlap (already created in 007_bookings.sql via EXCLUDE constraint)
-- But adding additional GiST index for queries without room_id
CREATE INDEX idx_bookings_hotel_stay_range_status ON bookings
  USING gist(hotel_id, stay_range)
  WHERE status NOT IN ('cancelled', 'no_show');

-- Rate Plans: Multiple hotels query with date ranges
CREATE INDEX idx_rate_plans_validity_priority ON rate_plans
  USING gist(validity_range)
  WHERE is_active = true;

--------------------------------------------------------------------------------
-- INDEXES FOR REPORTING & ANALYTICS
--------------------------------------------------------------------------------

-- Bookings: Revenue reporting
CREATE INDEX idx_bookings_hotel_created_status_payment ON bookings(
  hotel_id,
  created_at DESC,
  status,
  payment_status
);

-- Bookings: Financial reconciliation
CREATE INDEX idx_bookings_payment_intent ON bookings(hotel_id, stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX idx_bookings_charge_id ON bookings(hotel_id, stripe_charge_id)
  WHERE stripe_charge_id IS NOT NULL;

-- Bookings: Source tracking
CREATE INDEX idx_bookings_source ON bookings(hotel_id, booking_source, created_at DESC);

-- Bookings: Cancellation analysis
CREATE INDEX idx_bookings_cancelled ON bookings(hotel_id, cancelled_at DESC)
  WHERE status = 'cancelled';

--------------------------------------------------------------------------------
-- TEXT SEARCH INDEXES
--------------------------------------------------------------------------------

-- Hotels: Full text search on name and city
CREATE INDEX idx_hotels_name_trgm ON hotels USING gin(name gin_trgm_ops);
CREATE INDEX idx_hotels_city_trgm ON hotels USING gin(city gin_trgm_ops);

-- Room Types: Search on default name
CREATE INDEX idx_room_types_name_default_trgm ON room_types USING gin(name_default gin_trgm_ops);

-- Booking Guests: Search by name and email
CREATE INDEX idx_booking_guests_first_name_trgm ON booking_guests USING gin(first_name gin_trgm_ops);
CREATE INDEX idx_booking_guests_last_name_trgm ON booking_guests USING gin(last_name gin_trgm_ops);
CREATE INDEX idx_booking_guests_full_name ON booking_guests
  USING gin((first_name || ' ' || last_name) gin_trgm_ops);

--------------------------------------------------------------------------------
-- PARTIAL INDEXES FOR SPECIFIC QUERIES
--------------------------------------------------------------------------------

-- Hotels: Trial expiring soon (no time filter - filtering done at query time)
CREATE INDEX idx_hotels_trial_expiring ON hotels(trial_ends_at)
  WHERE subscription_status = 'trial'
  AND trial_ends_at IS NOT NULL;

-- Hotels: Subscription expiring soon (no time filter - filtering done at query time)
CREATE INDEX idx_hotels_subscription_expiring ON hotels(subscription_ends_at)
  WHERE subscription_status = 'active'
  AND subscription_ends_at IS NOT NULL;

-- Profiles: Active staff by hotel
CREATE INDEX idx_profiles_hotel_staff_active ON profiles(hotel_id, role)
  WHERE is_active = true
  AND role IN ('hotel_owner', 'hotel_staff')
  AND hotel_id IS NOT NULL;

-- Rooms: Maintenance status
CREATE INDEX idx_rooms_maintenance ON rooms(hotel_id, status)
  WHERE status IN ('maintenance', 'out_of_service');

-- Bookings: No-shows
CREATE INDEX idx_bookings_no_show ON bookings(hotel_id, check_in_date)
  WHERE status = 'no_show';

-- Bookings: Pending payment
CREATE INDEX idx_bookings_pending_payment ON bookings(hotel_id, created_at DESC)
  WHERE payment_status = 'pending'
  AND status NOT IN ('cancelled', 'no_show');

--------------------------------------------------------------------------------
-- JSONB INDEXES
--------------------------------------------------------------------------------

-- Hotels: Settings queries
CREATE INDEX idx_hotels_settings_currency ON hotels((settings->>'currency'));
CREATE INDEX idx_hotels_settings_gin ON hotels USING gin(settings jsonb_path_ops);

-- Room Types: Amenities search
CREATE INDEX idx_room_types_amenities_gin ON room_types USING gin(amenities jsonb_path_ops);

-- Room Types: Bed configuration
CREATE INDEX idx_room_types_bed_config_gin ON room_types USING gin(bed_configuration jsonb_path_ops);

-- Hotel Photos: Caption search
CREATE INDEX idx_hotel_photos_caption_gin ON hotel_photos USING gin(caption jsonb_path_ops)
  WHERE caption IS NOT NULL;

-- Room Type Photos: Caption search
CREATE INDEX idx_room_type_photos_caption_gin ON room_type_photos USING gin(caption jsonb_path_ops)
  WHERE caption IS NOT NULL;

--------------------------------------------------------------------------------
-- COVERING INDEXES FOR COMMON QUERIES
--------------------------------------------------------------------------------

-- Bookings: Quick availability check with minimal data
CREATE INDEX idx_bookings_availability_check ON bookings(
  room_id,
  stay_range,
  status
) WHERE status NOT IN ('cancelled', 'no_show');

-- Room Types: Public listing
CREATE INDEX idx_room_types_public_list ON room_types(
  hotel_id,
  is_active,
  sort_order,
  base_price_cents
) WHERE is_active = true;

-- Comments
COMMENT ON INDEX idx_bookings_room_status_dates IS 'Optimizes room availability queries';
COMMENT ON INDEX idx_bookings_hotel_stay_range_status IS 'GiST index for date range overlap queries';
COMMENT ON INDEX idx_rate_plans_hotel_active_validity IS 'GiST index for finding applicable rate plans';
COMMENT ON INDEX idx_hotels_name_trgm IS 'Trigram index for fuzzy name search';
COMMENT ON INDEX idx_bookings_availability_check IS 'Covering index for quick availability checks';
