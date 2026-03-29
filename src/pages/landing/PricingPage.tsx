import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { PRICING_PLANS } from '@/data/plans';

interface PricingPageProps {
  onBackToLanding: () => void;
  onSignup: () => void;
  onSignIn: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBackToLanding, onSignup, onSignIn }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to overview
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={onSignIn}
              className="text-slate-600 hover:text-slate-900"
            >
              Sign in
            </button>
            <button
              onClick={onSignup}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Start trial
            </button>
          </div>
        </div>
      </motion.nav>

      <div className="pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-600 font-semibold">
              PRICING
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900">
              Plans built for real NDIS providers
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Every plan includes all NDIS Practice Standards modules, audit-ready exports, and your compliance evidence vault.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: plan.highlight ? 0.15 : 0 }}
              className={`relative rounded-3xl border ${plan.highlight ? 'border-emerald-500 shadow-xl shadow-emerald-200/50 bg-white' : 'border-slate-200 bg-white/80'} p-6 flex flex-col`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold tracking-wide">
                  Most popular
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-emerald-700 uppercase tracking-[0.3em]">{plan.tier}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{plan.name}</h2>
                <p className="text-slate-600 mt-2">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">${plan.price.toLocaleString('en-AU')}</span>
                  <span className="text-slate-500">{plan.priceSuffix}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Up to {plan.seatLimit} seats included</p>
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check className="w-3 h-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.tier === 'scale' ? onSignup : onSignup}
                className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition-all ${plan.highlight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                {plan.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center text-slate-500 text-sm">
          Need enterprise onboarding or custom seats? <button className="text-emerald-600 font-semibold" onClick={onSignup}>Talk to us →</button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
