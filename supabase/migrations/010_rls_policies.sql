-- Migration: 010_rls_policies.sql
-- Description: Row Level Security policies for multi-tenant isolation
-- Dependencies: All previous migrations

-- Enable RLS on all tables
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_type_photos ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's hotel_id
CREATE OR REPLACE FUNCTION get_user_hotel_id()
RETURNS UUID AS $$
  SELECT hotel_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'platform_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if user has access to hotel
CREATE OR REPLACE FUNCTION has_hotel_access(hotel_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (
      role = 'platform_admin'
      OR (role IN ('hotel_owner', 'hotel_staff') AND hotel_id = hotel_id_param)
    )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

--------------------------------------------------------------------------------
-- HOTELS POLICIES
--------------------------------------------------------------------------------

-- Public can view active hotels with active subscriptions
CREATE POLICY "hotels_public_view" ON hotels
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND subscription_status IN ('trial', 'active')
  );

-- Hotel staff can view their own hotel
CREATE POLICY "hotels_staff_view" ON hotels
  FOR SELECT
  TO authenticated
  USING (
    is_platform_admin() OR
    id = get_user_hotel_id()
  );

-- Platform admins can do everything
CREATE POLICY "hotels_admin_all" ON hotels
  FOR ALL
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Hotel owners can update their own hotel
CREATE POLICY "hotels_owner_update" ON hotels
  FOR UPDATE
  TO authenticated
  USING (
    id = get_user_hotel_id()
    AND get_user_role() = 'hotel_owner'
  )
  WITH CHECK (
    id = get_user_hotel_id()
    AND get_user_role() = 'hotel_owner'
  );

--------------------------------------------------------------------------------
-- PROFILES POLICIES
--------------------------------------------------------------------------------

-- Users can view their own profile
CREATE POLICY "profiles_own_view" ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent users from changing their own role or hotel_id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND COALESCE(hotel_id, '00000000-0000-0000-0000-000000000000'::uuid) =
        COALESCE((SELECT hotel_id FROM profiles WHERE id = auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- Platform admins can do everything
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL
  TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Hotel owners can view staff in their hotel
CREATE POLICY "profiles_hotel_view_staff" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    get_user_role() IN ('hotel_owner', 'hotel_staff')
    AND hotel_id = get_user_hotel_id()
  );

-- Hotel owners can manage staff in their hotel
CREATE POLICY "profiles_hotel_owner_manage_staff" ON profiles
  FOR ALL
  TO authenticated
  USING (
    get_user_role() = 'hotel_owner'
    AND hotel_id = get_user_hotel_id()
    AND role IN ('hotel_staff')
  )
  WITH CHECK (
    get_user_role() = 'hotel_owner'
    AND hotel_id = get_user_hotel_id()
    AND role IN ('hotel_staff')
  );

--------------------------------------------------------------------------------
-- ROOM TYPES POLICIES
--------------------------------------------------------------------------------

-- Public can view active room types for active hotels
CREATE POLICY "room_types_public_view" ON room_types
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM hotels
      WHERE id = room_types.hotel_id
      AND is_active = true
      AND subscription_status IN ('trial', 'active')
    )
  );

-- Hotel staff can manage their hotel's room types
CREATE POLICY "room_types_staff_all" ON room_types
  FOR ALL
  TO authenticated
  USING (has_hotel_access(hotel_id))
  WITH CHECK (has_hotel_access(hotel_id));

--------------------------------------------------------------------------------
-- ROOMS POLICIES
--------------------------------------------------------------------------------

-- Public can view active rooms for active hotels
CREATE POLICY "rooms_public_view" ON rooms
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND status = 'available'
    AND EXISTS (
      SELECT 1 FROM hotels
      WHERE id = rooms.hotel_id
      AND is_active = true
      AND subscription_status IN ('trial', 'active')
    )
  );

-- Hotel staff can manage their hotel's rooms
CREATE POLICY "rooms_staff_all" ON rooms
  FOR ALL
  TO authenticated
  USING (has_hotel_access(hotel_id))
  WITH CHECK (has_hotel_access(hotel_id));

--------------------------------------------------------------------------------
-- RATE PLANS POLICIES
--------------------------------------------------------------------------------

-- Public can view active rate plans for active hotels
CREATE POLICY "rate_plans_public_view" ON rate_plans
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM hotels
      WHERE id = rate_plans.hotel_id
      AND is_active = true
      AND subscription_status IN ('trial', 'active')
    )
  );

-- Hotel staff can manage their hotel's rate plans
CREATE POLICY "rate_plans_staff_all" ON rate_plans
  FOR ALL
  TO authenticated
  USING (has_hotel_access(hotel_id))
  WITH CHECK (has_hotel_access(hotel_id));

--------------------------------------------------------------------------------
-- BOOKINGS POLICIES
--------------------------------------------------------------------------------

-- Guests can view their own bookings
CREATE POLICY "bookings_guest_view_own" ON bookings
  FOR SELECT
  TO authenticated
  USING (guest_id = auth.uid());

-- Guests can create bookings (for active hotels)
CREATE POLICY "bookings_guest_create" ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    guest_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM hotels
      WHERE id = bookings.hotel_id
      AND is_active = true
      AND subscription_status IN ('trial', 'active')
    )
  );

-- Guests can update their own pending bookings (limited updates)
CREATE POLICY "bookings_guest_update_own" ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    guest_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    guest_id = auth.uid()
    AND status IN ('pending', 'cancelled')
  );

-- Hotel staff can manage their hotel's bookings
CREATE POLICY "bookings_staff_all" ON bookings
  FOR ALL
  TO authenticated
  USING (has_hotel_access(hotel_id))
  WITH CHECK (has_hotel_access(hotel_id));

-- Platform admins can view all bookings
CREATE POLICY "bookings_admin_view" ON bookings
  FOR SELECT
  TO authenticated
  USING (is_platform_admin());

--------------------------------------------------------------------------------
-- BOOKING GUESTS POLICIES
--------------------------------------------------------------------------------

-- Users can view guest details for their own bookings
CREATE POLICY "booking_guests_own_booking_view" ON booking_guests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_guests.booking_id
      AND guest_id = auth.uid()
    )
  );

-- Users can manage guest details for their own bookings
CREATE POLICY "booking_guests_own_booking_all" ON booking_guests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_guests.booking_id
      AND guest_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_guests.booking_id
      AND guest_id = auth.uid()
    )
  );

-- Hotel staff can manage guest details for their hotel's bookings
CREATE POLICY "booking_guests_staff_all" ON booking_guests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_guests.booking_id
      AND has_hotel_access(bookings.hotel_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_guests.booking_id
      AND has_hotel_access(bookings.hotel_id)
    )
  );

--------------------------------------------------------------------------------
-- HOTEL PHOTOS POLICIES
--------------------------------------------------------------------------------

-- Public can view active hotel photos for active hotels
CREATE POLICY "hotel_photos_public_view" ON hotel_photos
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM hotels
      WHERE id = hotel_photos.hotel_id
      AND is_active = true
      AND subscription_status IN ('trial', 'active')
    )
  );

-- Hotel staff can manage their hotel's photos
CREATE POLICY "hotel_photos_staff_all" ON hotel_photos
  FOR ALL
  TO authenticated
  USING (has_hotel_access(hotel_id))
  WITH CHECK (has_hotel_access(hotel_id));

--------------------------------------------------------------------------------
-- ROOM TYPE PHOTOS POLICIES
--------------------------------------------------------------------------------

-- Public can view active room type photos for active hotels
CREATE POLICY "room_type_photos_public_view" ON room_type_photos
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM room_types
      JOIN hotels ON hotels.id = room_types.hotel_id
      WHERE room_types.id = room_type_photos.room_type_id
      AND room_types.is_active = true
      AND hotels.is_active = true
      AND hotels.subscription_status IN ('trial', 'active')
    )
  );

-- Hotel staff can manage their hotel's room type photos
CREATE POLICY "room_type_photos_staff_all" ON room_type_photos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_types
      WHERE id = room_type_photos.room_type_id
      AND has_hotel_access(room_types.hotel_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_types
      WHERE id = room_type_photos.room_type_id
      AND has_hotel_access(room_types.hotel_id)
    )
  );

-- Comments
COMMENT ON FUNCTION get_user_role IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION get_user_hotel_id IS 'Returns the hotel_id of the current authenticated user';
COMMENT ON FUNCTION is_platform_admin IS 'Checks if current user is a platform admin';
COMMENT ON FUNCTION has_hotel_access IS 'Checks if current user has access to a specific hotel';
