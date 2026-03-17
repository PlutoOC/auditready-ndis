import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { Lead, Activity } from '@/types/crm';
import { STAGE_LABELS, SOURCE_LABELS, ACTIVITY_LABELS, ACTIVITY_ICONS } from '@/types/crm';
import { ArrowLeft, Phone, Mail, Calendar, Edit2, Save, X, Plus } from 'lucide-react';

interface LeadDetailPageProps {
  leadId: string;
  onNavigate: (page: string, params?: any) => void;
}

export function LeadDetailPage({ leadId, onNavigate }: LeadDetailPageProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    fetchLead();
    fetchActivities();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      setLead(data);
    } catch (error) {
      console.error('Failed to fetch lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('crm_leads')
        .update({
          organization_name: formData.get('organization_name'),
          contact_name: formData.get('contact_name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          notes: formData.get('notes'),
        })
        .eq('id', leadId);

      if (error) throw error;
      await fetchLead();
      setEditing(false);
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const handleAddActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('crm_activities')
        .insert({
          lead_id: leadId,
          type: formData.get('type'),
          description: formData.get('description'),
        });

      if (error) throw error;
      await fetchActivities();
      setShowActivityModal(false);
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate('crm-leads')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{lead.organization_name}</h1>
            <p className="text-slate-600 dark:text-slate-400">
              {STAGE_LABELS[lead.stage]} • {lead.source ? SOURCE_LABELS[lead.source] : 'No source'}
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
          >
            {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              {editing ? (
                <form onSubmit={handleUpdateLead} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Organization Name
                    </label>
                    <input
                      name="organization_name"
                      defaultValue={lead.organization_name}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Contact Name
                    </label>
                    <input
                      name="contact_name"
                      defaultValue={lead.contact_name || ''}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={lead.email || ''}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone
                    </label>
                    <input
                      name="phone"
                      defaultValue={lead.phone || ''}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={4}
                      defaultValue={lead.notes || ''}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Contact</p>
                      <p className="font-medium text-slate-900 dark:text-white">{lead.contact_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Source</p>
                      <p className="font-medium text-slate-900 dark:text-white">{lead.source ? SOURCE_LABELS[lead.source] : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                      <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {lead.email ? (
                          <>
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </>
                        ) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                      <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {lead.phone ? (
                          <>
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </>
                        ) : '-'}
                      </p>
                    </div>
                  </div>
                  {lead.notes && (
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Notes</p>
                      <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Activity History</h2>
                <button
                  onClick={() => setShowActivityModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-700 text-white text-sm rounded-lg hover:bg-emerald-800"
                >
                  <Plus className="w-4 h-4" />
                  Add Activity
                </button>
              </div>

              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                      <span className="text-lg">{ACTIVITY_ICONS[activity.type]}</span>
                    </div>
                    <div className="flex-1 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {ACTIVITY_LABELS[activity.type]}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">{activity.description}</p>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No activities yet. Add your first activity above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Dates */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Key Dates</h3>
              <div className="space-y-3">
                {lead.demo_scheduled_at && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Demo Scheduled</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(lead.demo_scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {lead.trial_started_at && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Trial Started</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(lead.trial_started_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {lead.trial_ends_at && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Trial Ends</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(lead.trial_ends_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {lead.converted_at && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Converted</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(lead.converted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Add Activity</h2>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Activity Type
                </label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                >
                  <option value="">Select type...</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="demo">Demo</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                  placeholder="What happened?"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
