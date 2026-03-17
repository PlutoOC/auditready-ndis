import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, BarChart3, Shield, ArrowRight, Sparkles } from 'lucide-react';

interface FeatureExplorerProps {
  onTryFeature: (feature: string) => void;
}

const features = [
  {
    id: 'assessment',
    title: 'Self-Assessment',
    subtitle: 'AI-Powered',
    description: 'Answer 308 Quality Indicators with intelligent guidance. AI suggests responses based on your evidence.',
    icon: <FileText className="w-8 h-8" />,
    color: 'from-rose-400 to-orange-400',
    bgColor: 'bg-rose-50',
    stats: { label: 'QIs Covered', value: '308' },
    image: '/features/assessment.jpg'
  },
  {
    id: 'evidence',
    title: 'Evidence Hub',
    subtitle: 'Smart Mapping',
    description: 'Upload once, use everywhere. Auto-maps policies, procedures, and records to relevant QIs.',
    icon: <Upload className="w-8 h-8" />,
    color: 'from-violet-400 to-purple-400',
    bgColor: 'bg-violet-50',
    stats: { label: 'Time Saved', value: '80%' },
    image: '/features/evidence.jpg'
  },
  {
    id: 'analytics',
    title: 'Compliance Dashboard',
    subtitle: 'Real-time Insights',
    description: 'Track progress across all 8 modules. Identify gaps before your audit. Export ready-to-submit reports.',
    icon: <BarChart3 className="w-8 h-8" />,
    color: 'from-amber-400 to-yellow-400',
    bgColor: 'bg-amber-50',
    stats: { label: 'Modules', value: '8' },
    image: '/features/analytics.jpg'
  },
  {
    id: 'security',
    title: 'Audit-Ready Security',
    subtitle: 'Enterprise Grade',
    description: 'Bank-level encryption, role-based access, and complete audit trails. Your data stays yours.',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-teal-400 to-cyan-400',
    bgColor: 'bg-teal-50',
    stats: { label: 'Compliance', value: '100%' },
    image: '/features/security.jpg'
  }
];

export function FeatureExplorer({ onTryFeature }: FeatureExplorerProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-slate-900 dark:text-white mb-4"
          >
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
              ace your audit
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
          >
            By bringing best-in-class compliance and AI tools together, AuditReady 
            unlocks your potential — helping you prepare, track, and succeed.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
              className="relative group cursor-pointer"
            >
              <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-500 ${
                hoveredFeature === feature.id ? 'shadow-2xl scale-[1.02]' : 'shadow-lg'
              }`}>
                {/* Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className={`px-3 py-1 rounded-full ${feature.bgColor} text-sm font-medium`}>
                      <span className={`bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                        {feature.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Stats & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {feature.stats.value}
                      </span>
                      <span className="text-sm text-slate-500">
                        {feature.stats.label}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ x: 5 }}
                      onClick={() => onTryFeature(feature.id)}
                      className="flex items-center gap-2 text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      Try it
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Hover Image Preview */}
                <div className={`absolute bottom-0 right-0 w-48 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transform translate-y-full group-hover:translate-y-0 transition-all duration-500 rounded-tl-3xl`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => onTryFeature('all')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-700/25"
          >
            <Sparkles className="w-5 h-5" />
            Explore All Features
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
