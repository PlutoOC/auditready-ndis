# Email Configuration for AuditReady NDIS

## Resend Setup

**API Key:** `re_KGptTpQe_FPakiafuY4FXXkg939bEDpLX`
**From Email:** `onboarding@auditreadyndis.com`
**From Name:** `AuditReady NDIS`

## Environment Variables (for Edge Function)

Add these to Supabase Edge Function secrets:

```bash
RESEND_API_KEY=re_KGptTpQe_FPakiafuY4FXXkg939bEDpLX
CRON_SECRET=your-random-secret-here
```

## Email Sequence

| Day | Email | Trigger |
|-----|-------|---------|
| 0 | Welcome | Trial starts (stage = 'trial_started') |
| 7 | Check-in | Scheduled 7 days after trial start |
| 13 | Trial ending (links to pricing page) | 1 day before trial_ends_at |

## Cron Job Setup

Run every hour to check for pending emails:

```bash
0 * * * * curl -X POST https://lwvojuecaunctwofxkzq.supabase.co/functions/v1/send-emails \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or use Supabase cron extension (if available).

## Testing

1. Create a lead in CRM
2. Move lead to "Trial Started" stage
3. Check email_queue table for queued emails
4. Manually trigger edge function to send

> The day-13 "trial ending" email now promotes the live pricing page (`/pricing?plan=growth`) with a primary upgrade button so leads can convert straight into Stripe Checkout.
