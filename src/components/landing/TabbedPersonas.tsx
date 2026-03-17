import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface TabbedPersonasProps {
  onGetStarted: () => void;
}

const personas = [
  {
    id: 'new',
    title: 'New Providers',
    subtitle: 'Just starting your NDIS journey',
    quote: "I was overwhelmed by the 308 Quality Indicators. AuditReady broke it down into manageable steps. The AI suggestions helped me write responses I actually understood.",
    author: 'Sarah Chen',
    role: 'Director, Bright Care Services',
    image: '/testimonials/sarah.jpg',
    logo: '/logos/bright-care.png',
    benefit: 'First-time registration success',
    metric: '100%',
    metricLabel: 'Audit Ready'
  },
  {
    id: 'growing',
    title: 'Growing Providers',
    subtitle: 'Expanding your services',
    quote: "We added 3 new modules and AuditReady made it seamless. The evidence mapping saved us weeks of work. Our audit was done in days, not months.",
    author: 'Michael Torres',
    role: 'Operations Manager, Active Support Co',
    image: '/testimonials/michael.jpg',
    logo: '/logos/active-support.png',
    benefit: 'Scaled without adding headcount',
    metric: '3x',
    metricLabel: 'Faster Audits'
  },
  {
    id: 'auditready',
    title: 'Audit-Ready Pros',
    subtitle: 'Optimizing compliance processes',
    quote: "After 5 years of manual audits, AuditReady is a game-changer. The dashboard shows exactly where we stand. No more surprises at audit time.",
    author: 'Jennifer Walsh',
    role: 'Compliance Officer, Premier Disability Services',
    image: '/testimonials/jennifer.jpg',
    logo: '/logos/premier.png',
    benefit: 'Zero non-conformances',
    metric: '5+',
    metricLabel: 'Years Compliant'
  },
  {
    id: 'consultants',
    title: 'NDIS Consultants',
    subtitle: 'Helping multiple providers',
    quote: "I manage compliance for 12 providers. AuditReady's multi-tenant setup and CRM features let me scale my practice without burning out.",
    author: 'David Park',
    role: 'Principal Consultant, NDIS Compliance Partners',
    image: '/testimonials/david.jpg',
    logo: '/logos/ndis-partners.png',
    benefit: 'Scaled consulting practice',
    metric: '12',
    metricLabel: 'Providers Managed'
  }
];

export function TabbedPersonas({ onGetStarted }: TabbedPersonasProps) {
  const [activeTab, setActiveTab] = useState('new');
  const activePersona = personas.find(p => p.id === activeTab) || personas[0];

  return (
    <section className="py-24 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-slate-900 dark:text-white mb-4"
          >
            Built for every stage of your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
              NDIS journey
            </span>
          </motion.h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setActiveTab(persona.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === persona.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {persona.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left: Quote Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-3xl p-8 lg:p-12 relative">
              <Quote className="absolute top-8 left-8 w-12 h-12 text-indigo-200 dark:text-indigo-900" />
              
              <div className="relative z-10 pt-8">
                <p className="text-xl lg:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
                  "{activePersona.quote}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold">
                    {activePersona.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {activePersona.author}
                    </p>
                    <p className="text-sm text-slate-500">
                      {activePersona.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="absolute top-8 right-8 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>

            {/* Right: Benefits & Stats */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {activePersona.title}
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  {activePersona.subtitle}
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm text-emerald-700 dark:text-emerald-600 font-medium mb-2">
                  Key Benefit
                </p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {activePersona.benefit}
                </p>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
                    {activePersona.metric}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {activePersona.metricLabel}
                  </p>
                </div>
              </div>

              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-fuchsia-700 transition-all"
              >
                Start Your Journey
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
