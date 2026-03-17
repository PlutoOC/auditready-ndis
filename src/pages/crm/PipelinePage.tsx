import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCRM } from '@/hooks/useCRM';
import { Lead, LeadStage, STAGE_LABELS, STAGE_COLORS } from '@/types/crm';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

interface PipelinePageProps {
  onNavigate: (page: string, params?: any) => void;
}

const STAGES: LeadStage[] = [
  'new_lead',
  'contacted',
  'demo_scheduled',
  'demo_done',
  'trial_started',
  'converted',
  'paused'
];

export function PipelinePage({ onNavigate }: PipelinePageProps) {
  const { leads, loading, updateLeadStage } = useCRM();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const leadsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter(lead => lead.stage === stage);
    return acc;
  }, {} as Record<LeadStage, Lead[]>);

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stage !== stage) {
      try {
        await updateLeadStage(draggedLead.id, stage);
      } catch (error) {
        console.error('Failed to update lead stage:', error);
      }
    }
    setDraggedLead(null);
  };

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
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate('crm')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales Pipeline</h1>
            <p className="text-slate-600 dark:text-slate-400">Drag leads between stages to update their status</p>
          </div>
        </div>

        {/* Pipeline Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div
              key={stage}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {STAGE_LABELS[stage]}
                  </h3>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm px-2 py-1 rounded-full">
                    {leadsByStage[stage]?.length || 0}
                  </span>
                </div>

                {/* Lead Cards */}
                <div className="space-y-3">
                  {leadsByStage[stage]?.map((lead, index) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      draggable
                      onDragStart={() => handleDragStart(lead)}
                      onClick={() => onNavigate('crm-lead-detail', { leadId: lead.id })}
                      className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                          {lead.organization_name}
                        </h4>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                      {lead.contact_name && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {lead.contact_name}
                        </p>
                      )}
                      {lead.trial_ends_at && stage === 'trial_started' && (
                        <div className="mt-2">
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                            Trial ends: {new Date(lead.trial_ends_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {lead.demo_scheduled_at && stage === 'demo_scheduled' && (
                        <div className="mt-2">
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                            Demo: {new Date(lead.demo_scheduled_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {leadsByStage[stage]?.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                    <p className="text-sm text-slate-400 dark:text-slate-500">No leads</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
