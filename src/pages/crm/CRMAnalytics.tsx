import { motion } from 'framer-motion';
import { useCRM } from '@/hooks/useCRM';
import { SOURCE_LABELS, STAGE_LABELS } from '@/types/crm';
import { PieChart, BarChart3, TrendingUp, Users } from 'lucide-react';

interface CRMAnalyticsProps {
  onNavigate: (page: string, params?: any) => void;
}

export function CRMAnalytics({ onNavigate }: CRMAnalyticsProps) {
  const { leads, stats, loading } = useCRM();

  // Calculate source distribution
  const sourceData = leads.reduce((acc, lead) => {
    const source = lead.source || 'other';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate conversion by source
  const conversionBySource = leads.reduce((acc, lead) => {
    const source = lead.source || 'other';
    if (!acc[source]) {
      acc[source] = { total: 0, converted: 0 };
    }
    acc[source].total++;
    if (lead.stage === 'converted') {
      acc[source].converted++;
    }
    return acc;
  }, {} as Record<string, { total: number; converted: number }>);

  // Calculate conversion rates
  const sourceConversionRates = Object.entries(conversionBySource).map(([source, data]) => ({
    source,
    label: SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] || source,
    total: data.total,
    converted: data.converted,
    rate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0,
  })).sort((a, b) => b.rate - a.rate);

  // Calculate pipeline velocity (avg days in each stage)
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.stage === 'converted').length;
  const overallConversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Trials started
  const trialsStarted = leads.filter(l => l.stage === 'trial_started' || l.stage === 'converted').length;
  const trialConversionRate = trialsStarted > 0 ? Math.round((convertedLeads / trialsStarted) * 100) : 0;

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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">CRM Analytics</h1>
            <p className="text-slate-600 dark:text-slate-400">Track your sales performance and lead sources</p>
          </div>
          <button
            onClick={() => onNavigate('crm')}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Back to CRM
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Leads</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalLeads}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{overallConversionRate}%</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Trials Started</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{trialsStarted}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Trial → Paid</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{trialConversionRate}%</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Source Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Leads by Source</h2>
            {Object.keys(sourceData).length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(sourceData).map(([source, count]) => {
                  const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                  return (
                    <div key={source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700 dark:text-slate-300">
                          {SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] || source}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-emerald-700 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conversion by Source */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Conversion by Source</h2>
            {sourceConversionRates.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-4">
                {sourceConversionRates.map((data) => (
                  <div key={data.source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{data.label}</span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {data.converted}/{data.total} ({data.rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
      </div>
    </div>
  );
}
