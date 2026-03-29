export type PlanInterval = 'monthly' | 'annual';
export type PlanTier = 'starter' | 'growth' | 'scale';

export interface PricingPlan {
  id: `${PlanTier}-${PlanInterval}`;
  tier: PlanTier;
  name: string;
  description: string;
  price: number;
  interval: PlanInterval;
  priceSuffix: string;
  highlight?: boolean;
  tagline?: string;
  ctaLabel: string;
  seatLimit: number;
  stripePriceId: string; // Update with your real Stripe price IDs
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter-monthly',
    tier: 'starter',
    name: 'Starter',
    description: 'For new providers and consultants getting their first audit ready.',
    price: 149,
    interval: 'monthly',
    priceSuffix: 'per month',
    tagline: 'Everything you need for your first audit',
    ctaLabel: 'Start Starter Plan',
    seatLimit: 5,
    stripePriceId: 'price_starter_monthly',
    features: [
      'All 8 NDIS Practice Standards modules',
      'Self-assessment workflow',
      'Evidence library + tagging',
      '2 concurrent audits',
      'Email support',
    ],
  },
  {
    id: 'growth-monthly',
    tier: 'growth',
    name: 'Growth',
    description: 'For providers with multiple programs and growing compliance needs.',
    price: 249,
    interval: 'monthly',
    priceSuffix: 'per month',
    highlight: true,
    tagline: 'Most popular for established providers',
    ctaLabel: 'Choose Growth',
    seatLimit: 15,
    stripePriceId: 'price_growth_monthly',
    features: [
      'Everything in Starter',
      'Unlimited internal audits',
      'Advanced evidence insights',
      'Team workflow + approvals',
      'Priority chat support',
    ],
  },
  {
    id: 'scale-annual',
    tier: 'scale',
    name: 'Scale',
    description: 'For multi-site providers who need deeper reporting and governance.',
    price: 2990,
    interval: 'annual',
    priceSuffix: 'per year',
    tagline: 'Best value for multi-site teams',
    ctaLabel: 'Talk to Sales',
    seatLimit: 40,
    stripePriceId: 'price_scale_annual',
    features: [
      'Everything in Growth',
      'Custom evidence templates',
      'Audit-ready PDF packs',
      'Dedicated success manager',
      'Quarterly compliance reviews',
    ],
  },
];

export const findPlan = (planId: string) => PRICING_PLANS.find((plan) => plan.id === planId);
