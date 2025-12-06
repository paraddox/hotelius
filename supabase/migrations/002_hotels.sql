-- Migration: 002_hotels.sql
-- Description: Create hotels table with subscription management
-- Dependencies: 001_extensions.sql

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM (
  'trial',
  'active',
  'past_due',
  'canceled',
  'suspended'
);

-- Hotels table
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,

  -- Address
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,

  -- Geolocation
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),

  -- Settings (flexible JSONB for hotel-specific configurations)
  settings JSONB NOT NULL DEFAULT '{
    "currency": "USD",
    "timezone": "UTC",
    "check_in_time": "15:00",
    "check_out_time": "11:00",
    "cancellation_policy_hours": 24,
    "allow_same_day_booking": true,
    "require_credit_card": true,
    "tax_rate": 0.0,
    "notification_emails": []
  }'::jsonb,

  -- Subscription & billing
  subscription_status subscription_status NOT NULL DEFAULT 'trial',
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id TEXT,
  stripe_account_id TEXT,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Constraints
  CONSTRAINT hotels_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT hotels_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT hotels_coordinates_valid CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL AND
     latitude BETWEEN -90 AND 90 AND
     longitude BETWEEN -180 AND 180)
  )
);

-- Indexes
CREATE INDEX idx_hotels_slug ON hotels(slug);
CREATE INDEX idx_hotels_subscription_status ON hotels(subscription_status);
CREATE INDEX idx_hotels_is_active ON hotels(is_active) WHERE is_active = true;
CREATE INDEX idx_hotels_stripe_customer ON hotels(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_hotels_location ON hotels USING gist(ll_to_earth(latitude::float8, longitude::float8)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE hotels IS 'Main hotels table for multi-tenant SaaS';
COMMENT ON COLUMN hotels.settings IS 'Flexible JSONB for hotel-specific configurations';
COMMENT ON COLUMN hotels.subscription_status IS 'Current subscription status for billing';
COMMENT ON COLUMN hotels.stripe_account_id IS 'Stripe Connect account ID for marketplace payments';
