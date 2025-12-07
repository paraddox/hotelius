-- Migration: Add Stripe Integration Tables
-- Description: Adds tables and columns for Stripe billing and Connect integration
-- Date: 2025-12-06

-- =============================================
-- 1. Add Stripe columns to hotels table
-- =============================================

-- Add Stripe customer ID for SaaS billing
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT;

-- Add Stripe Connect account fields
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT FALSE;

-- Add indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_hotels_stripe_customer_id ON hotels(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_hotels_stripe_account_id ON hotels(stripe_account_id);

-- =============================================
-- 2. Create subscriptions table (SaaS billing)
-- =============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- References
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,

  -- Subscription details
  status TEXT NOT NULL,
  plan TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotel_id ON subscriptions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- =============================================
-- 3. Create invoices table
-- =============================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Stripe IDs
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,

  -- Invoice details
  amount_paid INTEGER NOT NULL,
  amount_due INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,

  -- URLs
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,

  -- Timestamps
  paid_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_subscription_id ON invoices(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- =============================================
-- 4. Create connect_accounts table
-- =============================================

CREATE TABLE IF NOT EXISTS connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- References
  hotel_id UUID NOT NULL UNIQUE REFERENCES hotels(id) ON DELETE CASCADE,

  -- Stripe Connect account ID
  stripe_account_id TEXT NOT NULL UNIQUE,

  -- Account status
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,

  -- Requirements
  requirements_currently_due TEXT[] DEFAULT '{}',
  requirements_eventually_due TEXT[] DEFAULT '{}',
  requirements_past_due TEXT[] DEFAULT '{}',

  -- Account details
  country TEXT NOT NULL,
  default_currency TEXT DEFAULT 'usd'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_connect_accounts_hotel_id ON connect_accounts(hotel_id);
CREATE INDEX IF NOT EXISTS idx_connect_accounts_stripe_account_id ON connect_accounts(stripe_account_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_connect_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER connect_accounts_updated_at
  BEFORE UPDATE ON connect_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_connect_accounts_updated_at();

-- =============================================
-- 5. Create payments table (booking payments)
-- =============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- References
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Stripe payment intent ID
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,

  -- Payment details
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  application_fee_amount INTEGER NOT NULL,
  status TEXT NOT NULL,

  -- Payment method
  payment_method TEXT,

  -- Failure details
  failure_reason TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =============================================
-- 6. Create payouts table
-- =============================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- References
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_payout_id TEXT NOT NULL UNIQUE,
  stripe_account_id TEXT NOT NULL,

  -- Payout details
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  arrival_date TIMESTAMPTZ NOT NULL,

  -- Optional fields
  description TEXT,
  failure_reason TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payouts_hotel_id ON payouts(hotel_id);
CREATE INDEX IF NOT EXISTS idx_payouts_stripe_payout_id ON payouts(stripe_payout_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_arrival_date ON payouts(arrival_date);

-- =============================================
-- 7. Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Hotel owners/staff can view their own subscriptions
CREATE POLICY "Hotel staff can view their subscriptions"
  ON subscriptions FOR SELECT
  USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles
      WHERE id = auth.uid() AND role IN ('hotel_owner', 'hotel_staff')
    )
  );

-- Invoices: Hotel owners/staff can view their own invoices
CREATE POLICY "Hotel staff can view their invoices"
  ON invoices FOR SELECT
  USING (
    stripe_subscription_id IN (
      SELECT stripe_subscription_id FROM subscriptions
      WHERE hotel_id IN (
        SELECT hotel_id FROM profiles
        WHERE id = auth.uid() AND role IN ('hotel_owner', 'hotel_staff')
      )
    )
  );

-- Connect accounts: Hotel owners/staff can view their own Connect account
CREATE POLICY "Hotel staff can view their Connect account"
  ON connect_accounts FOR SELECT
  USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles
      WHERE id = auth.uid() AND role IN ('hotel_owner', 'hotel_staff')
    )
  );

-- Payments: Hotel staff and guests can view relevant payments
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE guest_id = auth.uid() OR hotel_id IN (
        SELECT hotel_id FROM profiles
        WHERE id = auth.uid() AND role IN ('hotel_owner', 'hotel_staff')
      )
    )
  );

-- Payouts: Hotel owners/staff can view their own payouts
CREATE POLICY "Hotel staff can view their payouts"
  ON payouts FOR SELECT
  USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles
      WHERE id = auth.uid() AND role IN ('hotel_owner', 'hotel_staff')
    )
  );

-- =============================================
-- 8. Grant permissions (if needed)
-- =============================================

-- Grant service role full access (for webhooks)
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON invoices TO service_role;
GRANT ALL ON connect_accounts TO service_role;
GRANT ALL ON payments TO service_role;
GRANT ALL ON payouts TO service_role;

-- Comments for documentation
COMMENT ON TABLE subscriptions IS 'SaaS billing subscriptions for hotel management platform';
COMMENT ON TABLE invoices IS 'Invoice records for subscription payments';
COMMENT ON TABLE connect_accounts IS 'Stripe Connect account information for hotels';
COMMENT ON TABLE payments IS 'Payment records for guest bookings via Stripe Connect';
COMMENT ON TABLE payouts IS 'Payout records from Stripe to hotel accounts';
