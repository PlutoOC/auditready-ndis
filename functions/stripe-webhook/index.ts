import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@16.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null;

const jsonResponse = (payload: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(payload),
  {
    status,
    headers: { 'Content-Type': 'application/json' },
  },
);

const normalizeInterval = (interval?: string | null): 'monthly' | 'annual' => {
  if (interval === 'year' || interval === 'annual') return 'annual';
  return 'monthly';
};

const supabaseAdmin = () => createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const syncSubscription = async (subscription: Stripe.Subscription) => {
  const supabase = supabaseAdmin();
  const orgId = (subscription.metadata?.org_id as string) || (subscription.items.data[0]?.price?.metadata?.org_id as string) || null;
  if (!orgId) {
    console.warn('stripe-webhook: missing org_id metadata');
    return;
  }

  const planId = (subscription.metadata?.plan_id as string) || subscription.items.data[0]?.price?.lookup_key || subscription.items.data[0]?.plan?.nickname || 'custom-plan';
  const interval = normalizeInterval(subscription.items.data[0]?.plan?.interval);
  const amount = subscription.items.data[0]?.plan?.amount || subscription.items.data[0]?.price?.unit_amount || 0;
  const seatLimit = Number(subscription.metadata?.seat_limit || subscription.items.data[0]?.price?.metadata?.seat_limit || 5);

  await supabase
    .from('subscriptions')
    .upsert({
      org_id: orgId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      plan_id: planId,
      plan_name: subscription.items.data[0]?.price?.nickname || planId,
      status: subscription.status,
      plan_interval: interval,
      unit_amount: amount,
      currency: subscription.currency?.toUpperCase() || 'AUD',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      seat_limit: seatLimit,
      metadata: subscription.metadata,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_subscription_id' });

  await supabase
    .from('organizations')
    .update({
      subscription_status: subscription.status,
      plan_tier: planId,
      plan_name: subscription.items.data[0]?.price?.nickname || subscription.items.data[0]?.plan?.nickname || planId,
      plan_interval: interval,
      plan_amount: amount,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      stripe_subscription_id: subscription.id,
      seat_limit: seatLimit,
    })
    .eq('id', orgId);

  await supabase
    .from('users')
    .update({ subscription_status: subscription.status })
    .eq('org_id', orgId);
};

const markPastDue = async (customerId: string, status: string) => {
  const supabase = supabaseAdmin();
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!org?.id) return;

  await supabase
    .from('organizations')
    .update({ subscription_status: status })
    .eq('id', org.id);

  await supabase
    .from('users')
    .update({ subscription_status: status })
    .eq('org_id', org.id);
};

serve(async (req) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return jsonResponse({ error: 'Stripe not configured' }, 500);
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return jsonResponse({ error: 'Missing signature' }, 400);
  }

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('stripe-webhook signature error', error);
    return jsonResponse({ error: 'Invalid signature' }, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await syncSubscription(subscription);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          await markPastDue(invoice.customer as string, 'past_due');
        }
        break;
      }
      default:
        console.log(`stripe-webhook: unhandled event ${event.type}`);
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error('stripe-webhook handler error', error);
    return jsonResponse({ error: error.message || 'Webhook error' }, 500);
  }
});
