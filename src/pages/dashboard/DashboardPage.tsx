import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  FileText,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { ProgressBar, CircularProgress } from '@/components/glass/ProgressBar';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalModules: number;
  completedModules: number;
  totalQIs: number;
  completedQIs: number;
  evidenceCount: number;
  upcomingAudits: number;
}

interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  total_outcomes: number;
  total_qis: number;
  completed_qis: number;
}

interface DashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalModules: 8,
    completedModules: 0,
    totalQIs: 249,
    completedQIs: 0,
    evidenceCount: 0,
    upcomingAudits: 0,
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      // Organization data available in orgData

      // Get all modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .order('display_order');

      if (modulesData) {
        // Get outcomes count for each module
        const modulesWithCounts = await Promise.all(
          modulesData.map(async (module) => {
            const { count: outcomeCount } = await supabase
              .from('outcomes')
              .select('*', { count: 'exact', head: true })
              .eq('module_id', module.id);

            const { count: qiCount } = await supabase
              .from('quality_indicators')
              .select('*', { count: 'exact', head: true })
              .eq('module_id', module.id);

            // Get completed QIs count (would need self_assessment_responses table)
            const { count: completedCount } = await supabase
              .from('self_assessment_responses')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', orgData?.id)
              .eq('status', 'completed');

            return {
              ...module,
              total_outcomes: outcomeCount || 0,
              total_qis: qiCount || 0,
              completed_qis: completedCount || 0,
            };
          })
        );

        setModules(modulesWithCounts);
      }

      // Get evidence count
      const { count: evidenceCount } = await supabase
        .from('evidence_files')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgData?.id);

      // Get upcoming audits count
      const { count: auditCount } = await supabase
        .from('internal_audits')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgData?.id)
        .gte('scheduled_date', new Date().toISOString());

      setStats({
        totalModules: modulesData?.length || 8,
        completedModules: 0,
        totalQIs: 249,
        completedQIs: 0,
        evidenceCount: evidenceCount || 0,
        upcomingAudits: auditCount || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const overallProgress = stats.totalQIs > 0
    ? Math.round((stats.completedQIs / stats.totalQIs) * 100)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Compliance Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Track your NDIS Practice Standards compliance progress
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Overall Progress */}
          <motion.div variants={itemVariants}>
            <GlassCard padding="lg" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Overall Progress
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {overallProgress}%
                  </p>
                </div>
                <CircularProgress
                  value={overallProgress}
                  size="lg"
                  variant={overallProgress >= 80 ? 'success' : overallProgress >= 50 ? 'warning' : 'default'}
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {stats.completedQIs} of {stats.totalQIs} Quality Indicators
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Modules Complete */}
          <motion.div variants={itemVariants}>
            <GlassCard padding="lg" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Modules
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {stats.completedModules}/{stats.totalModules}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Modules fully completed
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Evidence Files */}
          <motion.div variants={itemVariants}>
            <GlassCard padding="lg" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Evidence Files
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {stats.evidenceCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Files uploaded
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Upcoming Audits */}
          <motion.div variants={itemVariants}>
            <GlassCard padding="lg" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Upcoming Audits
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {stats.upcomingAudits}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Scheduled audits
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            <GlassButton
              variant="primary"
              leftIcon={<TrendingUp className="w-4 h-4" />}
              onClick={() => onNavigate('modules')}
            >
              Continue Assessment
            </GlassButton>
            <GlassButton
              variant="secondary"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={() => onNavigate('evidence')}
            >
              Upload Evidence
            </GlassButton>
            <GlassButton
              variant="secondary"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => onNavigate('audits')}
            >
              Schedule Audit
            </GlassButton>
          </div>
        </motion.div>

        {/* Dashboard Widgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <DashboardWidgets onNavigate={onNavigate} />
        </motion.div>

        {/* Modules Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              NDIS Practice Standards Modules
            </h2>
            <GlassButton
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('modules')}
            >
              View All
            </GlassButton>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <GlassCard key={i} padding="lg" className="animate-pulse">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module, index) => {
                const progress = module.total_qis > 0
                  ? Math.round((module.completed_qis / module.total_qis) * 100)
                  : 0;
                
                let statusVariant: 'default' | 'success' | 'warning' | 'error' = 'default';
                if (progress === 100) statusVariant = 'success';
                else if (progress >= 50) statusVariant = 'warning';
                else if (progress > 0) statusVariant = 'default';
                else statusVariant = 'error';

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <GlassCard
                      padding="lg"
                      hover
                      interactive
                      onClick={() => onNavigate('module-detail', { moduleId: module.id })}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <GlassBadge variant={statusVariant} dot>
                          {progress === 100 ? 'Complete' : progress > 0 ? 'In Progress' : 'Not Started'}
                        </GlassBadge>
                        <span className="text-xs font-medium text-slate-400">
                          {module.code}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {module.name}
                      </h3>
                      
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                        {module.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <span>{module.total_outcomes} Outcomes</span>
                        <span>{module.total_qis} Quality Indicators</span>
                      </div>

                      <ProgressBar
                        value={progress}
                        size="sm"
                        variant={statusVariant}
                        showLabel
                      />
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export { DashboardPage };
