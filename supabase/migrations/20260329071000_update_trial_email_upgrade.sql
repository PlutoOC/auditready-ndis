-- Refresh the queue_trial_welcome_emails function so the day 13 email points to the new pricing page
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
        <p><a href="https://auditready-ndis.vercel.app/" style="color:#4f46e5;">Get Started →</a></p>
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
        <p><a href="https://auditready-ndis.vercel.app/" style="color:#4f46e5;">Continue Your Assessment →</a></p>
        <p>Need help? Book a demo: [Demo Link]</p>
        <p>— The AuditReady Team</p>',
        NOW() + INTERVAL '7 days',
        jsonb_build_object('lead_id', NEW.id, 'email_type', 'checkin', 'day', 7)
    );

    -- Email 3: Day 13 trial ending with pricing CTA
    INSERT INTO email_queue (to_email, to_name, subject, html_content, scheduled_at, metadata)
    VALUES (
        NEW.email,
        NEW.contact_name,
        'Your trial ends tomorrow - Keep your AuditReady access',
        '<h1>Your AuditReady access expires tomorrow</h1>
        <p>Hi ' || COALESCE(NEW.contact_name, 'there') || ',</p>
        <p>Your 14-day free trial ends tomorrow. Don''t lose your progress or evidence library.</p>
        <p><strong>Upgrade now to unlock:</strong></p>
        <ul>
            <li>Unlimited QI responses across all modules</li>
            <li>Audit-ready PDF exports for auditors</li>
            <li>Full evidence vault + usage analytics</li>
            <li>Priority compliance support</li>
        </ul>
        <p style="margin:24px 0;">
            <a href="https://auditready-ndis.vercel.app/pricing?plan=growth" style="background:#4f46e5;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;">
                View Plans & Upgrade
            </a>
        </p>
        <p>Questions? Reply to this email or book a call: [Calendar Link]</p>
        <p>— The AuditReady Team</p>',
        NEW.trial_ends_at - INTERVAL '1 day',
        jsonb_build_object('lead_id', NEW.id, 'email_type', 'trial_ending', 'day', 13)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
