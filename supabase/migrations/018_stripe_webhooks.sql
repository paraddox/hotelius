-- Migration: 014_stripe_webhooks.sql
-- Description: Create tables for Stripe webhook event logging and audit trail
-- Dependencies: 002_hotels.sql

-- Webhook event status enum
CREATE TYPE webhook_event_status AS ENUM (
  'received',
  'processing',
  'processed',
  'failed'
);

-- Webhook events log table
-- Stores all incoming Stripe webhook events for idempotency and audit trail
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Event identification
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,

  -- Processing status
  status webhook_event_status NOT NULL DEFAULT 'received',
  error_message TEXT,

  -- Connect account (if event is from Connect account)
  connect_account_id TEXT,

  -- Timestamps
  received_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT webhook_events_event_id_not_empty CHECK (event_id != ''),
  CONSTRAINT webhook_events_event_type_not_empty CHECK (event_type != '')
);

-- Indexes for efficient querying
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);
CREATE INDEX idx_webhook_events_connect_account ON webhook_events(connect_account_id)
  WHERE connect_account_id IS NOT NULL;

-- Failed events for retry
CREATE INDEX idx_webhook_events_failed ON webhook_events(received_at DESC)
  WHERE status = 'failed';

-- Unprocessed events
CREATE INDEX idx_webhook_events_unprocessed ON webhook_events(received_at ASC)
  WHERE status IN ('received', 'processing');

-- Updated at trigger
CREATE TRIGGER update_webhook_events_updated_at
  BEFORE UPDATE ON webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE webhook_events IS 'Log of all Stripe webhook events for idempotency and audit trail';
COMMENT ON COLUMN webhook_events.event_id IS 'Stripe event ID (unique identifier from Stripe)';
COMMENT ON COLUMN webhook_events.event_type IS 'Stripe event type (e.g., payment_intent.succeeded)';
COMMENT ON COLUMN webhook_events.event_data IS 'Full event data object from Stripe';
COMMENT ON COLUMN webhook_events.status IS 'Processing status of the webhook event';
COMMENT ON COLUMN webhook_events.connect_account_id IS 'Stripe Connect account ID if event is from Connect';
COMMENT ON COLUMN webhook_events.received_at IS 'When the event was created by Stripe';
COMMENT ON COLUMN webhook_events.processed_at IS 'When we finished processing the event';
