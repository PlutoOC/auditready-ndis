import React from 'react';
import { motion } from 'framer-motion';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassCard } from '@/components/glass/GlassCard';
import { CheckCircle, FileText, Shield, BarChart3, Users, Clock, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const features = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Self-Assessment Made Easy',
    description: 'Write tailored responses for all 308 NDIS Quality Indicators across 8 modules with guided assistance.',
    // Updated: 308 QIs (was 249)
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-fuchsia-50/50 dark:from-slate-950 dark:via-indigo-950/50 dark:to-fuchsia-950/50" />

      {/* Animated Mesh Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[900px] h-[900px] rounded-full bg-gradient-to-r from-indigo-400/40 to-violet-400/40 dark:from-indigo-600/40 dark:to-violet-600/40 blur-[120px]"
          animate={{
            x: ['-30%', '20%', '-30%'],
            y: ['-20%', '30%', '-20%'],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '-25%', left: '-25%' }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-r from-fuchsia-400/35 to-pink-400/35 dark:from-fuchsia-600/35 dark:to-pink-600/35 blur-[100px]"
          animate={{
            x: ['20%', '-30%', '20%'],
            y: ['30%', '-20%', '30%'],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ bottom: '-15%', right: '-15%' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-400/25 to-blue-400/25 dark:from-cyan-600/25 dark:to-blue-600/25 blur-[80px]"
          animate={{
            x: ['-10%', '40%', '-10%'],
            y: ['40%', '-10%', '40%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '35%', right: '15%' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 dark:from-amber-600/20 dark:to-orange-600/20 blur-[90px]"
          animate={{
            x: ['30%', '-20%', '30%'],
            y: ['-10%', '50%', '-10%'],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ bottom: '30%', left: '5%' }}
        />
      </div>

      {/* Glass Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full py-4 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">AuditReady NDIS</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <button
              onClick={onSignIn}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-colors duration-200"
            >
              Sign In
            </button>
            <GlassButton onClick={onGetStarted} variant="primary" size="sm">
              Get Started
            </GlassButton>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Now available for all NDIS providers</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-6">
              Simplify Your{' '}
              <span className="relative">
                <span className="text-gradient">NDIS Compliance</span>
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <motion.path
                    d="M2 10C50 4 100 2 150 2C200 2 250 4 298 10"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
              The complete internal audit tool for NDIS providers. Write self-assessment responses, 
              map evidence to Quality Indicators, and track compliance across all modules.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <GlassButton onClick={onGetStarted} variant="primary" size="lg" className="shadow-lg shadow-indigo-500/25">
                  Get Started Free
                </GlassButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <GlassButton onClick={onSignIn} variant="outline" size="lg">
                  Sign In
                </GlassButton>
              </motion.div>
            </div>
          </motion.div>

          {/* Hero Image / Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 relative"
          >
            <motion.div
              variants={floatingVariants}
              animate="animate"
            >
              <GlassCard variant="frosted" padding="none" radius="2xl" className="overflow-hidden shadow-2xl shadow-indigo-500/10">
                <div className="bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80 p-8">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <motion.div 
                      className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">57</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Outcomes</div>
                    </motion.div>
                    <motion.div 
                      className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">249</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Quality Indicators</div>
                    </motion.div>
                    <motion.div 
                      className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">8</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Modules</div>
                    </motion.div>
                  </div>
                  <div className="space-y-3">
                    <motion.div 
                      className="h-3 bg-gradient-to-r from-indigo-500/30 to-indigo-500/10 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                    <motion.div 
                      className="h-3 bg-gradient-to-r from-fuchsia-500/30 to-fuchsia-500/10 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '50%' }}
                      transition={{ duration: 1, delay: 1 }}
                    />
                    <motion.div 
                      className="h-3 bg-gradient-to-r from-violet-500/30 to-violet-500/10 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '66%' }}
                      transition={{ duration: 1, delay: 1.2 }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-400/30 blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-pink-400/30 blur-xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-transparent dark:from-transparent dark:via-slate-900/40 dark:to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Everything You Need for{' '}
              <span className="text-gradient">NDIS Compliance</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Built specifically for NDIS providers to streamline internal audits and self-assessments.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <GlassCard 
                  variant="frosted" 
                  padding="lg" 
                  radius="xl" 
                  className="h-full group"
                >
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard variant="strong" padding="xl" radius="2xl" className="relative overflow-visible">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-2xl -z-10" />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Ready to Simplify Your{' '}
                  <span className="text-gradient">NDIS Compliance?</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                  Join NDIS providers who use AuditReady to streamline their internal audits and self-assessments.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <GlassButton onClick={onGetStarted} variant="primary" size="lg" className="shadow-lg shadow-indigo-500/25">
                      Get Started Free
                    </GlassButton>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <GlassButton onClick={onSignIn} variant="outline" size="lg">
                      Sign In
                    </GlassButton>
                  </motion.div>
                </div>
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-white/20 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">AuditReady NDIS</span>
            </motion.div>
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
