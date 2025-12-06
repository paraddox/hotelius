-- Migration: 003_profiles.sql
-- Description: Create user profiles with role-based access
-- Dependencies: 002_hotels.sql

-- User role enum
CREATE TYPE user_role AS ENUM (
  'platform_admin',
  'hotel_owner',
  'hotel_staff',
  'guest'
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Basic info
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,

  -- Role & hotel association
  role user_role NOT NULL DEFAULT 'guest',
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,

  -- Preferences
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT profiles_hotel_required_for_staff CHECK (
    (role IN ('platform_admin', 'guest') AND hotel_id IS NULL) OR
    (role IN ('hotel_owner', 'hotel_staff') AND hotel_id IS NOT NULL)
  ),
  CONSTRAINT profiles_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_hotel_id ON profiles(hotel_id) WHERE hotel_id IS NOT NULL;
CREATE INDEX idx_profiles_is_active ON profiles(is_active) WHERE is_active = true;

-- Updated at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Comments
COMMENT ON TABLE profiles IS 'User profiles extending auth.users with role-based access';
COMMENT ON COLUMN profiles.hotel_id IS 'Associated hotel for hotel_owner and hotel_staff roles';
COMMENT ON COLUMN profiles.role IS 'User role determining access level in the system';
