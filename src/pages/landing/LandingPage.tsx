import React from 'react';
import { motion } from 'framer-motion';
import { HeroVideo } from '@/components/landing/HeroVideo';
import { FeatureExplorer } from '@/components/landing/FeatureExplorer';
import { TabbedPersonas } from '@/components/landing/TabbedPersonas';
import { LogoMarquee } from '@/components/landing/LogoMarquee';
import { ProviderROICalculator } from '@/components/landing/ProviderROICalculator';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onViewPricing: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn, onViewPricing }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">AuditReady NDIS</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onViewPricing}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={onSignIn}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="px-4 py-2 bg-emerald-700 text-white font-medium rounded-lg hover:bg-emerald-800 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="pt-16">
        <HeroVideo onGetStarted={onGetStarted} />
      </div>

      {/* ROI Calculator */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Calculate your{' '}
              <span className="text-emerald-700">time savings</span>
            </h2>
            <p className="text-xl text-slate-600">
              See how much faster NDIS compliance can be
            </p>
          </div>
          <ProviderROICalculator onGetStarted={onGetStarted} />
        </div>
      </section>

      {/* Feature Explorer */}
      <FeatureExplorer onTryFeature={(feature) => {
        console.log('Try feature:', feature);
        onGetStarted();
      }} />

      {/* Logo Marquee */}
      <LogoMarquee />

      {/* Tabbed Personas */}
      <TabbedPersonas onGetStarted={onGetStarted} />

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-emerald-700 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to ace your NDIS audit?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join 500+ NDIS providers who trust AuditReady for their compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onSignIn}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/30"
              >
                Sign In
              </button>
            </div>
            <p className="mt-6 text-sm text-white/60">
              14-day free trial • No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-50 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-900 font-semibold">AuditReady NDIS</span>
            </div>
            <p className="text-sm">
              © 2026 AuditReady NDIS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { LandingPage };
export default LandingPage;
