-- Phase 2 billing + subscription schema

-- Organizations billing columns
ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing',
    ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'starter-monthly',
    ADD COLUMN IF NOT EXISTS plan_name TEXT,
    ADD COLUMN IF NOT EXISTS plan_interval TEXT DEFAULT 'monthly',
    ADD COLUMN IF NOT EXISTS plan_amount INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS seat_limit INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS billing_email TEXT;

ALTER TABLE organizations
    ALTER COLUMN subscription_status SET DEFAULT 'trialing';

-- Users billing fields
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing',
    ADD COLUMN IF NOT EXISTS billing_role TEXT DEFAULT 'member';

ALTER TABLE users
    ALTER COLUMN subscription_status SET DEFAULT 'trialing';

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    plan_id TEXT,
    plan_name TEXT,
    plan_interval TEXT DEFAULT 'monthly',
    status TEXT,
    unit_amount INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'AUD',
    seat_limit INTEGER DEFAULT 5,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read subscriptions"
    ON subscriptions
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
          AND users.org_id = subscriptions.org_id
    ));

CREATE POLICY "Service role manages subscriptions"
    ON subscriptions
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Backfill defaults
UPDATE organizations SET subscription_status = COALESCE(subscription_status, 'trialing');
UPDATE users SET subscription_status = COALESCE(subscription_status, 'trialing');
