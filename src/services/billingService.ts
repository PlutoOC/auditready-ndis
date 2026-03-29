import { supabase } from '@/lib/supabase';
import { PRICING_PLANS, findPlan } from '@/data/plans';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';

export interface BillingSummary {
  organizationId: string;
  planId?: string;
  planName: string;
  planInterval: 'monthly' | 'annual';
  seatLimit: number;
  status: SubscriptionStatus;
  amount?: number;
  currency?: string;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  stripeCustomerId?: string | null;
  last4?: string | null;
}

export interface BillingHistoryEntry {
  id: string;
  status: SubscriptionStatus | 'incomplete_expired';
  planName: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'annual';
  created_at: string;
  current_period_end?: string | null;
}

export interface BillingSnapshot {
  summary: BillingSummary | null;
  history: BillingHistoryEntry[];
}

export const getBillingSnapshot = async (): Promise<BillingSnapshot> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { summary: null, history: [] };
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('org_id, subscription_status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || 'Unable to load user profile');
  }

  const orgId = profile.org_id;
  if (!orgId) {
    return { summary: null, history: [] };
  }

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, business_name, subscription_status, plan_tier, plan_interval, plan_amount, plan_name, seat_limit, stripe_customer_id, current_period_end, trial_ends_at')
    .eq('id', orgId)
    .single();

  if (orgError) {
    throw new Error(orgError.message);
  }

  const { data: history, error: historyError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (historyError) {
    throw new Error(historyError.message);
  }

  const summary: BillingSummary = {
    organizationId: org.id,
    planId: org.plan_tier,
    planName: org.plan_name || org.plan_tier || 'Trial',
    planInterval: (org.plan_interval || 'monthly') as 'monthly' | 'annual',
    seatLimit: org.seat_limit || 5,
    status: (org.subscription_status || 'trialing') as SubscriptionStatus,
    amount: org.plan_amount || undefined,
    currency: 'aud',
    trialEndsAt: org.trial_ends_at,
    currentPeriodEnd: org.current_period_end,
    stripeCustomerId: org.stripe_customer_id,
  };

  const formattedHistory: BillingHistoryEntry[] = (history || []).map((entry) => ({
    id: entry.id,
    status: entry.status || 'active',
    planName: entry.plan_name || entry.plan_id || 'Plan',
    amount: entry.unit_amount || 0,
    currency: (entry.currency || 'aud').toUpperCase(),
    interval: entry.plan_interval || 'monthly',
    created_at: entry.created_at,
    current_period_end: entry.current_period_end,
  }));

  return { summary, history: formattedHistory };
};

export const startCheckoutSession = async (planId: string) => {
  const plan = findPlan(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You need to be signed in to change plans');
  }

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: {
      planId,
      successUrl: `${window.location.origin}/settings?tab=billing&upgrade=success`,
      cancelUrl: `${window.location.origin}/settings?tab=billing`,
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw new Error(error.message || 'Unable to start checkout session');
  }

  if (!data?.url) {
    throw new Error('Stripe session did not return a redirect URL');
  }

  return data.url as string;
};

export const getPlanOptions = () => PRICING_PLANS;
