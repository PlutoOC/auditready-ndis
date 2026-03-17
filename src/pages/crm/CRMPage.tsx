import { motion } from 'framer-motion';
import { useCRM } from '@/hooks/useCRM';
import { STAGE_LABELS } from '@/types/crm';
import { Users, Calendar, TrendingUp, DollarSign } from 'lucide-react';

interface CRMPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function CRMPage({ onNavigate }: CRMPageProps) {
  const { stats, leads, loading } = useCRM();

  const totalLeads = leads.length;
  const demosThisWeek = leads.filter(l => 
    l.demo_scheduled_at && 
    new Date(l.demo_scheduled_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const trialsActive = leads.filter(l => 
    l.stage === 'trial_started' && 
    l.trial_ends_at && 
    new Date(l.trial_ends_at) > new Date()
  ).length;
  const converted = leads.filter(l => l.stage === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

  const statCards = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'bg-blue-500' },
    { label: 'Demos This Week', value: demosThisWeek, icon: Calendar, color: 'bg-yellow-500' },
    { label: 'Active Trials', value: trialsActive, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: DollarSign, color: 'bg-green-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">CRM Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Track your NDIS provider sales pipeline</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('crm-leads')}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
            >
              View Leads
            </button>
            <button
              onClick={() => onNavigate('crm-pipeline')}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Pipeline View
            </button>
            <button
              onClick={() => onNavigate('crm-analytics')}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Pipeline Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.stage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-600">{stat.count}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{STAGE_LABELS[stat.stage]}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Recent Activity</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              View and manage your sales activities in the leads section.
            </p>
            <button
              onClick={() => onNavigate('crm-leads')}
              className="mt-4 text-emerald-700 dark:text-emerald-600 hover:underline text-sm"
            >
              Go to Leads →
            </button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Pipeline Management</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Drag and drop leads between stages to track your sales progress.
            </p>
            <button
              onClick={() => onNavigate('crm-pipeline')}
              className="mt-4 text-emerald-700 dark:text-emerald-600 hover:underline text-sm"
            >
              View Pipeline →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
