import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  TrendingUp,
  FileText,
  ArrowRight,
  Users,
  FileCheck,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { supabase } from '@/lib/supabase';

interface DashboardWidgetsProps {
  onNavigate?: (page: string, params?: any) => void;
}

interface ActivityItem {
  id: string;
  type: 'response' | 'evidence' | 'audit' | 'user';
  description: string;
  timestamp: string;
  user?: string;
}

interface Audit {
  id: string;
  title: string;
  scheduled_date: string;
  type: 'internal' | 'external';
  status: 'scheduled' | 'in_progress' | 'completed';
}

interface QuickStats {
  totalResponses: number;
  completedResponses: number;
  evidenceCount: number;
  complianceScore: number;
  activeUsers: number;
  upcomingAudits: number;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ onNavigate }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [upcomingAudits, setUpcomingAudits] = useState<Audit[]>([]);
  const [stats, setStats] = useState<QuickStats>({
    totalResponses: 0,
    completedResponses: 0,
    evidenceCount: 0,
    complianceScore: 0,
    activeUsers: 0,
    upcomingAudits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!orgData) return;

      // Fetch quick stats
      const { count: totalResponses } = await supabase
        .from('self_assessment_responses')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgData.id);

      const { count: completedResponses } = await supabase
        .from('self_assessment_responses')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgData.id)
        .eq('status', 'completed');

      const { count: evidenceCount } = await supabase
        .from('evidence_files')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgData.id);

      const { count: activeUsers } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgData.id);

      const { count: upcomingAuditsCount } = await supabase
        .from('internal_audits')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgData.id)
        .gte('scheduled_date', new Date().toISOString());

      // Calculate compliance score
      const totalQIs = 249; // Total NDIS QIs
      const complianceScore = totalResponses
        ? Math.round(((completedResponses || 0) / totalQIs) * 100)
        : 0;

      setStats({
        totalResponses: totalResponses || 0,
        completedResponses: completedResponses || 0,
        evidenceCount: evidenceCount || 0,
        complianceScore,
        activeUsers: activeUsers || 0,
        upcomingAudits: upcomingAuditsCount || 0,
      });

      // Fetch recent activity
      const { data: recentResponses } = await supabase
        .from('self_assessment_responses')
        .select('id, response_text, updated_at, status')
        .eq('organization_id', orgData.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      const { data: recentEvidence } = await supabase
        .from('evidence_files')
        .select('id, file_name, created_at')
        .eq('organization_id', orgData.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Combine and format activities
      const formattedActivities: ActivityItem[] = [
        ...(recentResponses?.map((r) => ({
          id: r.id,
          type: 'response' as const,
          description: r.status === 'completed'
            ? 'Completed a self-assessment response'
            : 'Updated a self-assessment response',
          timestamp: r.updated_at,
        })) || []),
        ...(recentEvidence?.map((e) => ({
          id: e.id,
          type: 'evidence' as const,
          description: `Uploaded "${e.file_name}"`,
          timestamp: e.created_at,
        })) || []),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setActivities(formattedActivities);

      // Fetch upcoming audits
      const { data: auditsData } = await supabase
        .from('internal_audits')
        .select('*')
        .eq('organization_id', orgData.id)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(3);

      if (auditsData) {
        setUpcomingAudits(auditsData.map((a) => ({
          id: a.id,
          title: a.title,
          scheduled_date: a.scheduled_date,
          type: a.audit_type || 'internal',
          status: a.status,
        })));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'response':
        return <FileCheck className="w-4 h-4 text-indigo-500" />;
      case 'evidence':
        return <FileText className="w-4 h-4 text-fuchsia-500" />;
      case 'audit':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'user':
        return <Users className="w-4 h-4 text-emerald-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getAuditBadgeVariant = (daysUntil: number) => {
    if (daysUntil <= 3) return 'error';
    if (daysUntil <= 7) return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <GlassCard key={i} padding="lg" className="animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard padding="lg" className="h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Quick Stats
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.completedResponses}
              </p>
              <p className="text-xs text-slate-500 mt-1">Responses</p>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.evidenceCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">Evidence Files</p>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.complianceScore}%
              </p>
              <p className="text-xs text-slate-500 mt-1">Compliance</p>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.activeUsers}
              </p>
              <p className="text-xs text-slate-500 mt-1">Team Members</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Upcoming Audits
              </span>
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {stats.upcomingAudits}
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard padding="lg" className="h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-fuchsia-500" />
              Recent Activity
            </h3>
          </div>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No recent activity</p>
                <p className="text-xs text-slate-400 mt-1">
                  Start working on your compliance
                </p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => onNavigate?.('modules')}
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {activities.length > 0 && (
            <GlassButton
              variant="ghost"
              size="sm"
              fullWidth
              className="mt-4"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate?.('modules')}
            >
              View All Activity
            </GlassButton>
          )}
        </GlassCard>
      </motion.div>

      {/* Upcoming Audits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard padding="lg" className="h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Upcoming Audits
            </h3>
          </div>

          <div className="space-y-3">
            {upcomingAudits.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No upcoming audits</p>
                <p className="text-xs text-slate-400 mt-1">
                  Schedule an audit to get started
                </p>
              </div>
            ) : (
              upcomingAudits.map((audit) => {
                const daysUntil = Math.ceil(
                  (new Date(audit.scheduled_date).getTime() - new Date().getTime()) / 86400000
                );

                return (
                  <div
                    key={audit.id}
                    className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                        {audit.title}
                      </h4>
                      <GlassBadge
                        variant={getAuditBadgeVariant(daysUntil)}
                        size="sm"
                      >
                        {formatDate(audit.scheduled_date)}
                      </GlassBadge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="capitalize">{audit.type} Audit</span>
                      <span>•</span>
                      <span className="capitalize">{audit.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            fullWidth
            className="mt-4"
            leftIcon={<Calendar className="w-4 h-4" />}
            onClick={() => onNavigate?.('audits')}
          >
            Schedule Audit
          </GlassButton>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export { DashboardWidgets };
export default DashboardWidgets;
