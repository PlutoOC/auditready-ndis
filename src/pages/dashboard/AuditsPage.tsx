import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ClipboardCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  FileText,
  ChevronRight,
  X,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { supabase } from '@/lib/supabase';

interface Audit {
  id: string;
  title: string;
  audit_type: 'full' | 'thematic' | 'follow_up';
  scheduled_date: string;
  completed_date: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  lead_auditor: string;
  findings_summary: string;
  overall_rating: string;
}

interface Finding {
  id: string;
  audit_id: string;
  finding_type: 'strength' | 'minor_non_conformance' | 'major_non_conformance' | 'observation';
  description: string;
  qi_code: string;
}

interface CorrectiveAction {
  id: string;
  finding_id: string;
  action_description: string;
  assigned_to: string;
  due_date: string;
  status: 'open' | 'in_progress' | 'completed' | 'overdue';
}

const AUDIT_TYPES = [
  { value: 'full', label: 'Full Audit' },
  { value: 'thematic', label: 'Thematic Audit' },
  { value: 'follow_up', label: 'Follow-up Audit' },
];

const AUDIT_STATUS = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-100 text-slate-700' },
];

const FINDING_TYPES = [
  { value: 'strength', label: 'Strength', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  { value: 'minor_non_conformance', label: 'Minor NC', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  { value: 'major_non_conformance', label: 'Major NC', color: 'bg-rose-100 text-rose-700', icon: AlertCircle },
  { value: 'observation', label: 'Observation', color: 'bg-blue-100 text-blue-700', icon: FileText },
];

const AuditsPage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Form states
  const [newAudit, setNewAudit] = useState({
    title: '',
    audit_type: 'full',
    scheduled_date: '',
    lead_auditor: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      setOrganization(orgData);

      // Fetch audits
      const { data: auditsData } = await supabase
        .from('internal_audits')
        .select('*')
        .eq('org_id', orgData?.id)
        .order('scheduled_date', { ascending: false });

      if (auditsData) {
        setAudits(auditsData);
      }

      // Fetch users for assignment
      const { data: usersData } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('org_id', orgData?.id);

      if (usersData) {
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAuditDetails = async (auditId: string) => {
    try {
      // Fetch findings
      const { data: findingsData } = await supabase
        .from('audit_findings')
        .select(`
          *,
          quality_indicator:qi_id (code)
        `)
        .eq('audit_id', auditId);

      if (findingsData) {
        setFindings(findingsData.map((f: any) => ({
          ...f,
          qi_code: f.quality_indicator?.code || 'N/A'
        })));
      }

      // Fetch corrective actions
      const { data: actionsData } = await supabase
        .from('corrective_actions')
        .select('*')
        .in('finding_id', findingsData?.map((f: any) => f.id) || []);

      if (actionsData) {
        setActions(actionsData);
      }
    } catch (error) {
      console.error('Error fetching audit details:', error);
    }
  };

  const handleCreateAudit = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('internal_audits')
        .insert([{
          org_id: organization.id,
          title: newAudit.title,
          audit_type: newAudit.audit_type,
          scheduled_date: newAudit.scheduled_date,
          status: 'scheduled',
          lead_auditor: newAudit.lead_auditor,
        }])
        .select()
        .single();

      if (error) throw error;

      setAudits(prev => [data, ...prev]);
      setShowCreateModal(false);
      setNewAudit({ title: '', audit_type: 'full', scheduled_date: '', lead_auditor: '' });
    } catch (error) {
      console.error('Error creating audit:', error);
    }
  };

  const getStatusColor = (status: string) => {
    return AUDIT_STATUS.find(s => s.value === status)?.color || 'bg-slate-100 text-slate-700';
  };

  const getFindingType = (type: string) => {
    return FINDING_TYPES.find(f => f.value === type);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unassigned';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Internal Audits
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Schedule audits, record findings, and track corrective actions
              </p>
            </div>
            <GlassButton
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Schedule Audit
            </GlassButton>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Scheduled', value: audits.filter(a => a.status === 'scheduled').length, color: 'text-blue-600' },
            { label: 'In Progress', value: audits.filter(a => a.status === 'in_progress').length, color: 'text-amber-600' },
            { label: 'Completed', value: audits.filter(a => a.status === 'completed').length, color: 'text-emerald-600' },
            { label: 'Total', value: audits.length, color: 'text-slate-600' },
          ].map((stat, index) => (
            <GlassCard key={index} variant="subtle" padding="md" radius="lg">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Audit List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {audits.length === 0 ? (
            <GlassCard variant="subtle" padding="xl" radius="xl" className="text-center">
              <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No audits scheduled
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Schedule your first internal audit to get started
              </p>
              <GlassButton
                variant="secondary"
                onClick={() => setShowCreateModal(true)}
              >
                Schedule Audit
              </GlassButton>
            </GlassCard>
          ) : (
            audits.map((audit) => (
              <GlassCard
                key={audit.id}
                variant="subtle"
                padding="md"
                radius="lg"
                hover
                interactive
                onClick={() => {
                  setSelectedAudit(audit);
                  fetchAuditDetails(audit.id);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {audit.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(audit.status)}`}>
                        {AUDIT_STATUS.find(s => s.value === audit.status)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(audit.scheduled_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {getUserName(audit.lead_auditor)}
                      </span>
                      <span>
                        {AUDIT_TYPES.find(t => t.value === audit.audit_type)?.label}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </GlassCard>
            ))
          )}
        </motion.div>

        {/* Create Audit Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <GlassCard variant="strong" padding="xl" radius="2xl" className="w-full max-w-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Schedule New Audit
                    </h2>
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCreateModal(false)}
                    >
                      <X className="w-5 h-5" />
                    </GlassButton>
                  </div>

                  <div className="space-y-4">
                    <GlassInput
                      label="Audit Title"
                      placeholder="e.g., Q1 2024 Internal Audit"
                      value={newAudit.title}
                      onChange={(e) => setNewAudit({ ...newAudit, title: e.target.value })}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Audit Type
                      </label>
                      <select
                        value={newAudit.audit_type}
                        onChange={(e) => setNewAudit({ ...newAudit, audit_type: e.target.value })}
                        className="w-full h-11 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      >
                        {AUDIT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <GlassInput
                      label="Scheduled Date"
                      type="date"
                      value={newAudit.scheduled_date}
                      onChange={(e) => setNewAudit({ ...newAudit, scheduled_date: e.target.value })}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Lead Auditor
                      </label>
                      <select
                        value={newAudit.lead_auditor}
                        onChange={(e) => setNewAudit({ ...newAudit, lead_auditor: e.target.value })}
                        className="w-full h-11 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      >
                        <option value="">Select Auditor</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <GlassButton
                        variant="secondary"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </GlassButton>
                      <GlassButton
                        variant="primary"
                        onClick={handleCreateAudit}
                        disabled={!newAudit.title || !newAudit.scheduled_date}
                      >
                        Schedule Audit
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audit Detail Modal */}
        <AnimatePresence>
          {selectedAudit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedAudit(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <GlassCard variant="strong" padding="xl" radius="2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {selectedAudit.title}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Scheduled for {new Date(selectedAudit.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedAudit(null)}
                    >
                      <X className="w-5 h-5" />
                    </GlassButton>
                  </div>

                  {/* Findings Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Findings ({findings.length})
                      </h3>
                    </div>

                    {findings.length === 0 ? (
                      <GlassCard variant="subtle" padding="md" radius="lg" className="text-center">
                        <p className="text-slate-500">No findings recorded yet</p>
                      </GlassCard>
                    ) : (
                      <div className="space-y-3">
                        {findings.map((finding) => {
                          const type = getFindingType(finding.finding_type);
                          const Icon = type?.icon || FileText;
                          const findingActions = actions.filter(a => a.finding_id === finding.id);

                          return (
                            <GlassCard key={finding.id} variant="subtle" padding="md" radius="lg">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type?.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${type?.color}`}>
                                      {type?.label}
                                    </span>
                                    <span className="text-xs text-slate-400">{finding.qi_code}</span>
                                  </div>
                                  <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {finding.description}
                                  </p>

                                  {/* Corrective Actions */}
                                  {findingActions.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      {findingActions.map(action => (
                                        <div
                                          key={action.id}
                                          className="flex items-center gap-2 text-sm p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg"
                                        >
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          <span className="flex-1">{action.action_description}</span>
                                          <span className="text-xs text-slate-400">
                                            Due: {new Date(action.due_date).toLocaleDateString()}
                                          </span>
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            action.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                            action.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                                            'bg-amber-100 text-amber-700'
                                          }`}>
                                            {action.status}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </GlassCard>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export { AuditsPage };
