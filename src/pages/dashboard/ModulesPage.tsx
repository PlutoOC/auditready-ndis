import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { ProgressBar } from '@/components/glass/ProgressBar';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { supabase } from '@/lib/supabase';

interface ModulesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

interface Outcome {
  id: string;
  code: string;
  name: string;
  description: string;
  display_order: number;
  quality_indicators: QualityIndicator[];
}

interface QualityIndicator {
  id: string;
  code: string;
  title: string;
  description: string;
  display_order: number;
  response_status?: 'not_started' | 'draft' | 'completed';
}

interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  outcomes: Outcome[];
  total_qis: number;
  completed_qis: number;
}

const ModulesPage: React.FC<ModulesPageProps> = ({ onNavigate }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [expandedOutcomes, setExpandedOutcomes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      // Organization data available in orgData

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .order('display_order');

      if (modulesData) {
        const modulesWithData = await Promise.all(
          modulesData.map(async (module) => {
            const { data: outcomesData } = await supabase
              .from('outcomes')
              .select('*')
              .eq('module_id', module.id)
              .order('display_order');

            const outcomesWithQIs = await Promise.all(
              (outcomesData || []).map(async (outcome) => {
                const { data: qisData } = await supabase
                  .from('quality_indicators')
                  .select('*')
                  .eq('outcome_id', outcome.id)
                  .order('display_order');

                // Get response status for each QI
                const qisWithStatus = await Promise.all(
                  (qisData || []).map(async (qi: QualityIndicator) => {
                    const { data: responseData } = orgData?.id
                      ? await supabase
                          .from('self_assessment_responses')
                          .select('status')
                          .eq('quality_indicator_id', qi.id)
                          .eq('organization_id', orgData.id)
                          .single()
                      : { data: null };

                    return {
                      ...qi,
                      response_status: responseData?.status || 'not_started',
                    };
                  })
                );

                return {
                  ...outcome,
                  quality_indicators: qisWithStatus,
                };
              })
            );

            const total_qis = outcomesWithQIs.reduce(
              (sum, o) => sum + o.quality_indicators.length,
              0
            );
            const completed_qis = outcomesWithQIs.reduce(
              (sum, o) =>
                sum +
                o.quality_indicators.filter((qi: QualityIndicator) => qi.response_status === 'completed').length,
              0
            );

            return {
              ...module,
              outcomes: outcomesWithQIs,
              total_qis,
              completed_qis,
            };
          })
        );

        setModules(modulesWithData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setLoading(false);
    }
  };

  const toggleOutcome = (outcomeId: string) => {
    setExpandedOutcomes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(outcomeId)) {
        newSet.delete(outcomeId);
      } else {
        newSet.add(outcomeId);
      }
      return newSet;
    });
  };

  const filteredModules = modules.filter(
    (module) =>
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <GlassCard key={i} padding="lg" className="h-24"><div /></GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <GlassButton
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </GlassButton>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                NDIS Practice Standards
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Select a module to view outcomes and quality indicators
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <GlassInput
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
        </motion.div>

        {/* Modules List */}
        <div className="space-y-4">
          {filteredModules.map((module, index) => {
            const progress = module.total_qis > 0
              ? Math.round((module.completed_qis / module.total_qis) * 100)
              : 0;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard padding="none" radius="xl">
                  {/* Module Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() =>
                      setSelectedModule(selectedModule?.id === module.id ? null : module)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <GlassBadge
                            variant={progress === 100 ? 'success' : progress > 0 ? 'warning' : 'default'}
                          >
                            {module.code}
                          </GlassBadge>
                          <span className="text-sm text-slate-500">
                            {module.completed_qis}/{module.total_qis} QIs
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                          {module.name}
                        </h2>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                          {module.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {progress}%
                          </span>
                        </div>
                        <motion.div
                          animate={{ rotate: selectedModule?.id === module.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-6 h-6 text-slate-400" />
                        </motion.div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <ProgressBar
                        value={progress}
                        size="sm"
                        variant={progress === 100 ? 'success' : progress > 0 ? 'warning' : 'default'}
                      />
                    </div>
                  </div>

                  {/* Expanded Outcomes */}
                  {selectedModule?.id === module.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-200 dark:border-slate-700"
                    >
                      <div className="p-6 space-y-4">
                        {module.outcomes.map((outcome) => {
                          const outcomeProgress = outcome.quality_indicators.length > 0
                            ? Math.round(
                                (outcome.quality_indicators.filter(
                                  (qi) => qi.response_status === 'completed'
                                ).length /
                                  outcome.quality_indicators.length) *
                                  100
                              )
                            : 0;

                          return (
                            <div
                              key={outcome.id}
                              className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                            >
                              <button
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                onClick={() => toggleOutcome(outcome.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-slate-500">
                                    {outcome.code}
                                  </span>
                                  <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {outcome.name}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    ({outcome.quality_indicators.length} QIs)
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {outcomeProgress === 100 && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                  )}
                                  <motion.div
                                    animate={{
                                      rotate: expandedOutcomes.has(outcome.id) ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                  </motion.div>
                                </div>
                              </button>

                              {expandedOutcomes.has(outcome.id) && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                                >
                                  <div className="p-4 space-y-2">
                                    {outcome.quality_indicators.map((qi) => (
                                      <button
                                        key={qi.id}
                                        className="w-full p-3 flex items-start gap-3 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-left"
                                        onClick={() =>
                                          onNavigate('response-editor', {
                                            moduleId: module.id,
                                            outcomeId: outcome.id,
                                            qiId: qi.id,
                                          })
                                        }
                                      >
                                        {qi.response_status === 'completed' ? (
                                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        ) : (
                                          <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-500">
                                              {qi.code}
                                            </span>
                                            {qi.response_status === 'completed' && (
                                              <GlassBadge variant="success" size="sm">
                                                Complete
                                              </GlassBadge>
                                            )}
                                            {qi.response_status === 'draft' && (
                                              <GlassBadge variant="warning" size="sm">
                                                Draft
                                              </GlassBadge>
                                            )}
                                          </div>
                                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                                            {qi.title}
                                          </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { ModulesPage };
