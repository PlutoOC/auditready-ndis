-- Email queue table for trial welcome sequence
-- Migration: 20260317075300_add_email_queue

CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email TEXT NOT NULL,
    to_name TEXT,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching pending emails
CREATE INDEX idx_email_queue_status_scheduled ON email_queue(status, scheduled_at);

-- RLS policies (only service role can access)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage email queue"
    ON email_queue FOR ALL
    USING (auth.role() = 'service_role');

-- Function to queue welcome email sequence when trial starts
CREATE OR REPLACE FUNCTION queue_trial_welcome_emails()
RETURNS TRIGGER AS $$
BEGIN
    -- Email 1: Welcome (immediate)
    INSERT INTO email_queue (to_email, to_name, subject, html_content, scheduled_at, metadata)
    VALUES (
        NEW.email,
        NEW.contact_name,
        'Welcome to AuditReady NDIS - Your 14-Day Trial Starts Now',
        '<h1>Welcome to AuditReady NDIS!</h1>
        <p>Hi ' || COALESCE(NEW.contact_name, 'there') || ',</p>
        <p>Your 14-day free trial has started. Here''s how to get the most out of it:</p>
        <ul>
            <li>Complete your first self-assessment</li>
            <li>Upload evidence for your QIs</li>
            <li>Invite your team members</li>
        </ul>
        <p><a href="https://auditready-ndis.vercel.app/">Get Started →</a></p>
        <p>Questions? Reply to this email.</p>
        <p>— The AuditReady Team</p>',
        NOW(),
        jsonb_build_object('lead_id', NEW.id, 'email_type', 'welcome', 'day', 0)
    );

    -- Email 2: Day 7 check-in
    INSERT INTO email_queue (to_email, to_name, subject, html_content, scheduled_at, metadata)
    VALUES (
        NEW.email,
        NEW.contact_name,
        'How''s your AuditReady trial going?',
        '<h1>Halfway Through Your Trial</h1>
        <p>Hi ' || COALESCE(NEW.contact_name, 'there') || ',</p>
        <p>You''re 7 days into your AuditReady trial. Here are some tips to maximize your experience:</p>
        <ul>
            <li>Review your progress dashboard</li>
            <li>Schedule a demo if you need help</li>
            <li>Check out our evidence templates</li>
        </ul>
        <p><a href="https://auditready-ndis.vercel.app/">Continue Your Assessment →</a></p>
        <p>Need help? Book a demo: [Demo Link]</p>
        <p>— The AuditReady Team</p>',
        NOW() + INTERVAL '7 days',
        jsonb_build_object('lead_id', NEW.id, 'email_type', 'checkin', 'day', 7)
    );

    -- Email 3: Day 13 trial ending
    INSERT INTO email_queue (to_email, to_name, subject, html_content, scheduled_at, metadata)
    VALUES (
        NEW.email,
        NEW.contact_name,
        'Your trial ends tomorrow - Keep your AuditReady access',
        '<h1>Your Trial Ends Tomorrow</h1>
        <p>Hi ' || COALESCE(NEW.contact_name, 'there') || ',</p>
        <p>Your 14-day free trial ends tomorrow. Don''t lose your progress!</p>
        <p><strong>Upgrade now to:</strong></p>
        <ul>
            <li>Keep all your evidence and assessments</li>
            <li>Continue with unlimited QIs</li>
            <li>Get priority support</li>
        </ul>
        <p><a href="https://auditready-ndis.vercel.app/upgrade" style="background:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">Upgrade Now</a></p>
        <p>Questions? Reply or book a call: [Calendar Link]</p>
        <p>— The AuditReady Team</p>',
        NEW.trial_ends_at - INTERVAL '1 day',
        jsonb_build_object('lead_id', NEW.id, 'email_type', 'trial_ending', 'day', 13)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to queue emails when trial starts
CREATE TRIGGER queue_welcome_emails_on_trial_start
    AFTER UPDATE OF stage ON crm_leads
    FOR EACH ROW
    WHEN (NEW.stage = 'trial_started' AND OLD.stage != 'trial_started')
    EXECUTE FUNCTION queue_trial_welcome_emails();
