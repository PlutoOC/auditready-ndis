import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lead, LeadStage, CRMStats, STAGE_LABELS } from '@/types/crm';

export function useCRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<CRMStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_crm_stats');

      if (error) throw error;
      setStats(data || []);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const createLead = async (lead: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .insert([lead])
        .select()
        .single();

      if (error) throw error;
      await fetchLeads();
      await fetchStats();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create lead');
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchLeads();
      await fetchStats();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update lead');
    }
  };

  const updateLeadStage = async (id: string, stage: LeadStage) => {
    const updates: Partial<Lead> = { stage };
    
    // Set timestamps based on stage
    if (stage === 'trial_started') {
      updates.trial_started_at = new Date().toISOString();
      updates.trial_ends_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    } else if (stage === 'converted') {
      updates.converted_at = new Date().toISOString();
    }

    return updateLead(id, updates);
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchLeads();
      await fetchStats();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete lead');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  return {
    leads,
    stats,
    loading,
    error,
    fetchLeads,
    fetchStats,
    createLead,
    updateLead,
    updateLeadStage,
    deleteLead
  };
}
