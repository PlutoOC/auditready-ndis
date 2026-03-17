// Supabase Edge Function to send emails via Resend
// File: supabase/functions/send-emails/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_KGptTpQe_FPakiafuY4FXXkg939bEDpLX';
const FROM_EMAIL = 'onboarding@auditreadyndis.com';
const FROM_NAME = 'AuditReady NDIS';

interface EmailQueueItem {
  id: string;
  to_email: string;
  to_name: string | null;
  subject: string;
  html_content: string;
}

async function sendEmail(email: EmailQueueItem): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email,
        subject: email.subject,
        html: email.html_content,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Verify cron secret (check both CRON_SECRET and Authorization header)
  const authHeader = req.headers.get('authorization') || '';
  const cronSecret = Deno.env.get('CRON_SECRET') || 'auditready-cron-2024-secure';
  
  // Allow both "Bearer <token>" and just "<token>"
  const providedSecret = authHeader.replace('Bearer ', '').trim();
  
  if (providedSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized', provided: providedSecret }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Fetch pending emails that are due
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { data: pendingEmails, error: fetchError } = await fetch(
      `${supabaseUrl}/rest/v1/email_queue?select=*&status=eq.pending&scheduled_at=lte.${new Date().toISOString()}&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      }
    ).then(res => res.json());

    if (fetchError) {
      throw new Error(`Failed to fetch emails: ${fetchError.message}`);
    }

    const results = [];

    for (const email of pendingEmails || []) {
      const result = await sendEmail(email);

      // Update email status
      await fetch(
        `${supabaseUrl}/rest/v1/email_queue?id=eq.${email.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: result.success ? 'sent' : 'failed',
            sent_at: result.success ? new Date().toISOString() : null,
            error_message: result.error || null,
          }),
        }
      );

      results.push({
        email_id: email.id,
        to: email.to_email,
        success: result.success,
        error: result.error,
      });
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
