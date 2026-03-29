import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  PieChart,
  ClipboardList,
  Layers,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  legal_name: string;
  business_name: string;
  abn: string;
  owner_id: string;
  created_at: string;
  owner_email?: string;
}

interface Stats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalEvidence: number;
  totalQIsCompleted: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organization?: string;
  status: 'active' | 'inactive';
  lastLogin?: string | null;
  created_at: string;
}

interface ModuleContentSummary {
  id: string;
  code: string;
  name: string;
  outcomeCount: number;
  qiCount: number;
}

interface AnalyticsBreakdown {
  activeTrials: number;
  payingCustomers: number;
  evidencePerOrg: number;
  averageCompletion: number;
}

const AdminDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalUsers: 0,
    totalEvidence: 0,
    totalQIsCompleted: 0,
  });
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [contentSummaries, setContentSummaries] = useState<ModuleContentSummary[]>([]);
  const [analyticsBreakdown, setAnalyticsBreakdown] = useState<AnalyticsBreakdown>({
    activeTrials: 0,
    payingCustomers: 0,
    evidencePerOrg: 0,
    averageCompletion: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch all organizations with owner email
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select(`
          *,
          users:owner_id (email)
        `)
        .order('created_at', { ascending: false });

      if (orgsError) {
        console.error('Error fetching organizations:', orgsError);
        return;
      }

      const orgsWithEmail = orgsData?.map((org: any) => ({
        ...org,
        owner_email: org.users?.email,
      })) || [];

      setOrganizations(orgsWithEmail);

      // Fetch stats
      const { count: orgsCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: evidenceCount } = await supabase
        .from('evidence_files')
        .select('*', { count: 'exact', head: true });

      const { count: completedQIs } = await supabase
        .from('self_assessment_responses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: totalResponses } = await supabase
        .from('self_assessment_responses')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalOrganizations: orgsCount || 0,
        activeOrganizations: orgsCount || 0, // All are active for now
        totalUsers: usersCount || 0,
        totalEvidence: evidenceCount || 0,
        totalQIsCompleted: completedQIs || 0,
      });

      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, is_active, last_login_at, created_at, organizations:org_id ( business_name )')
        .order('created_at', { ascending: false })
        .limit(50);

      const formattedUsers: AdminUser[] = (usersData || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email,
        role: user.role,
        organization: user.organizations?.business_name,
        status: user.is_active ? 'active' : 'inactive',
        lastLogin: user.last_login_at,
        created_at: user.created_at,
      }));
      setUsersList(formattedUsers);

      const { data: modulesData } = await supabase
        .from('modules')
        .select('id, code, name, outcomes(id, code, name, quality_indicators(id))')
        .order('display_order');

      const formattedContent: ModuleContentSummary[] = (modulesData || []).map((module: any) => ({
        id: module.id,
        code: module.code,
        name: module.name,
        outcomeCount: module.outcomes?.length || 0,
        qiCount: module.outcomes?.reduce(
          (acc: number, outcome: any) => acc + (outcome.quality_indicators?.length || 0),
          0
        ) || 0,
      }));
      setContentSummaries(formattedContent);

      const activeTrials = orgsWithEmail.filter((org) => org.subscription_status === 'trialing').length;
      const payingCustomers = orgsWithEmail.filter((org) => ['active', 'past_due'].includes(org.subscription_status)).length;
      const evidencePerOrg = orgsCount ? Math.round((evidenceCount || 0) / orgsCount) : 0;
      const averageCompletion = totalResponses ? Math.round(((completedQIs || 0) / totalResponses) * 100) : 0;

      setAnalyticsBreakdown({
        activeTrials,
        payingCustomers,
        evidencePerOrg,
        averageCompletion,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (_org: Organization) => {
    // For now, all are active. Later can check subscription status
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage all organizations and platform analytics
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard variant="frosted" padding="lg" radius="xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Organizations</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalOrganizations}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard variant="frosted" padding="lg" radius="xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalUsers}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard variant="frosted" padding="lg" radius="xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Evidence Files</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalEvidence}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard variant="frosted" padding="lg" radius="xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">QIs Completed</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalQIsCompleted}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Platform Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <GlassCard padding="lg" radius="xl">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-5 h-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">System Analytics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[{
                label: 'Active Trials',
                value: analyticsBreakdown.activeTrials,
                description: 'Organizations still in trial',
                icon: PieChart,
                accent: 'bg-indigo-100 text-indigo-700',
              }, {
                label: 'Paying Customers',
                value: analyticsBreakdown.payingCustomers,
                description: 'Active Stripe subscriptions',
                icon: CreditCard,
                accent: 'bg-emerald-100 text-emerald-700',
              }, {
                label: 'Avg Evidence / Org',
                value: analyticsBreakdown.evidencePerOrg,
                description: 'Evidence density',
                icon: ClipboardList,
                accent: 'bg-blue-100 text-blue-700',
              }, {
                label: 'Avg QI Completion',
                value: `${analyticsBreakdown.averageCompletion}%`,
                description: 'Self-assessment progress',
                icon: Layers,
                accent: 'bg-amber-100 text-amber-700',
              }].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${metric.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-slate-500">{metric.label}</p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{metric.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* User Management Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-8"
        >
          <GlassCard padding="lg" radius="xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-500" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Users</h3>
                  <p className="text-sm text-slate-500">Latest invites across organizations</p>
                </div>
              </div>
            </div>
            {usersList.length === 0 ? (
              <p className="text-sm text-slate-500">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3">User</th>
                      <th className="py-3">Organization</th>
                      <th className="py-3">Role</th>
                      <th className="py-3">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.slice(0, 6).map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="py-3 text-sm text-slate-700 dark:text-slate-300">{user.organization || '—'}</td>
                        <td className="py-3 text-sm capitalize">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-slate-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Content Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <GlassCard padding="lg" radius="xl">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-5 h-5 text-slate-500" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Modules & Quality Indicators</h3>
                <p className="text-sm text-slate-500">Read-only snapshot of the Practice Standards library</p>
              </div>
            </div>
            {contentSummaries.length === 0 ? (
              <p className="text-sm text-slate-500">No modules loaded.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentSummaries.map((module) => (
                  <div key={module.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{module.code}</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{module.name}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                      <span>{module.outcomeCount} outcomes</span>
                      <span>•</span>
                      <span>{module.qiCount} QIs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Organizations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard variant="frosted" padding="lg" radius="xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  All Organizations
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {organizations.length} total
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                      Organization
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                      Owner
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                      ABN
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {org.business_name || org.legal_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {org.legal_name}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {org.owner_email || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {org.abn}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(org)}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(org.created_at).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {organizations.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No organizations yet
                </p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
