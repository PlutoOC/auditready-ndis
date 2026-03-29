import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@16.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('VITE_APP_URL') || Deno.env.get('APP_URL') || 'https://auditready-ndis.vercel.app';

const PLAN_CATALOG: Record<string, {
  name: string;
  stripePriceId: string;
  interval: 'monthly' | 'annual';
  tier: string;
  seatLimit: number;
}> = {
  'starter-monthly': {
    name: 'Starter',
    stripePriceId: 'price_starter_monthly',
    interval: 'monthly',
    tier: 'starter',
    seatLimit: 5,
  },
  'growth-monthly': {
    name: 'Growth',
    stripePriceId: 'price_growth_monthly',
    interval: 'monthly',
    tier: 'growth',
    seatLimit: 15,
  },
  'scale-annual': {
    name: 'Scale',
    stripePriceId: 'price_scale_annual',
    interval: 'annual',
    tier: 'scale',
    seatLimit: 40,
  },
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(payload),
  {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  },
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!STRIPE_SECRET_KEY) {
    return jsonResponse({ error: 'Stripe secret key not configured' }, 500);
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse({ error: 'Invalid session' }, 401);
    }

    const body = await req.json();
    const { planId, successUrl, cancelUrl } = body;

    if (!planId || typeof planId !== 'string') {
      return jsonResponse({ error: 'planId is required' }, 400);
    }

    const plan = PLAN_CATALOG[planId];
    if (!plan) {
      return jsonResponse({ error: 'Invalid plan selected' }, 400);
    }

    if (!plan.stripePriceId || plan.stripePriceId.includes('placeholder')) {
      return jsonResponse({ error: 'Stripe price IDs are not configured yet.' }, 500);
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('org_id, email, first_name, last_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.org_id) {
      return jsonResponse({ error: 'User profile incomplete' }, 400);
    }

    const { data: organization, error: orgError } = await supabaseClient
      .from('organizations')
      .select('id, legal_name, business_name, email, stripe_customer_id, seat_limit, plan_tier, plan_interval')
      .eq('id', profile.org_id)
      .single();

    if (orgError || !organization) {
      return jsonResponse({ error: 'Organization not found' }, 404);
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });

    let customerId = organization.stripe_customer_id || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: organization.email || profile.email || user.email,
        name: organization.business_name || organization.legal_name || profile.first_name || user.email || 'AuditReady Customer',
        metadata: {
          org_id: organization.id,
        },
      });
      customerId = customer.id;
      await supabaseClient
        .from('organizations')
        .update({ stripe_customer_id: customer.id, billing_email: organization.email || profile.email || user.email })
        .eq('id', organization.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      success_url: successUrl || `${APP_URL}/settings?tab=billing&upgrade=success`,
      cancel_url: cancelUrl || `${APP_URL}/settings?tab=billing`,
      allow_promotion_codes: true,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          org_id: organization.id,
          plan_id: planId,
          seat_limit: plan.seatLimit,
          requested_by: user.id,
        },
      },
      metadata: {
        org_id: organization.id,
        plan_id: planId,
        requested_by: user.id,
      },
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error('create-checkout error', error);
    return jsonResponse({ error: error.message || 'Unexpected error' }, 500);
  }
});
