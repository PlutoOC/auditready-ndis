import React from 'react';
import { motion } from 'framer-motion';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';
import { CheckCircle, FileText, Shield, BarChart3, Users, Clock } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const features = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Self-Assessment Made Easy',
    description: 'Write tailored responses for all 249 NDIS Quality Indicators across 8 modules with guided assistance.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Evidence Management',
    description: 'Upload and map evidence to specific Quality Indicators. Track compliance status in real-time.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Compliance Dashboard',
    description: 'Visual overview of your compliance status across all NDIS Practice Standards modules.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Internal Audits',
    description: 'Schedule, conduct, and document internal audits with auto-generated checklists.',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Save Time',
    description: 'Streamline your NDIS registration and renewal process with organized documentation.',
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Avoid Penalties',
    description: 'Ensure your self-assessment responses are unique and tailored to avoid NDIS Commission scrutiny.',
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-fuchsia-950/30" />
      
      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[100px]"
          animate={{
            x: ['-20%', '10%', '-20%'],
            y: ['-10%', '20%', '-10%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ top: '-10%', left: '-10%' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-600/20 blur-[100px]"
          animate={{
            x: ['10%', '-20%', '10%'],
            y: ['20%', '-10%', '20%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ bottom: '-10%', right: '-10%' }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gradient">AuditReady NDIS</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onSignIn}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-colors"
            >
              Sign In
            </button>
            <GlassButton onClick={onGetStarted} variant="primary" size="sm">
              Get Started
            </GlassButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-6">
              Simplify Your{' '}
              <span className="text-gradient">NDIS Compliance</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
              The complete internal audit tool for NDIS providers. Write self-assessment responses, 
              map evidence to Quality Indicators, and track compliance across all modules.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GlassButton onClick={onGetStarted} variant="primary" size="lg">
                Get Started Free
              </GlassButton>
              <GlassButton onClick={onSignIn} variant="outline" size="lg">
                Sign In
              </GlassButton>
            </div>
          </motion.div>

          {/* Hero Image / Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 relative"
          >
            <GlassCard variant="frosted" padding="none" radius="2xl" className="overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-indigo-600">57</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Outcomes</div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-fuchsia-600">249</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Quality Indicators</div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-violet-600">8</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Modules</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-indigo-500/20 rounded-full w-3/4" />
                  <div className="h-3 bg-fuchsia-500/20 rounded-full w-1/2" />
                  <div className="h-3 bg-violet-500/20 rounded-full w-2/3" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Everything You Need for NDIS Compliance
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Built specifically for NDIS providers to streamline internal audits and self-assessments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassCard variant="frosted" padding="lg" radius="xl" className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard variant="strong" padding="xl" radius="2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Ready to Simplify Your NDIS Compliance?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Join NDIS providers who use AuditReady to streamline their internal audits and self-assessments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GlassButton onClick={onGetStarted} variant="primary" size="lg">
                Get Started Free
              </GlassButton>
              <GlassButton onClick={onSignIn} variant="outline" size="lg">
                Sign In
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">AuditReady NDIS</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2026 AuditReady NDIS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { LandingPage };
