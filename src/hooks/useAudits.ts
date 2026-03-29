import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getActiveOrganizationId } from '@/lib/organizations';
import type {
  Audit,
  AuditDetail,
  AuditFinding,
  AuditStandardReview,
  AuditStatus,
  CreateAuditPayload,
  FindingPayload,
  PracticeStandard,
  StandardResult,
  UpdateAuditPayload,
} from '@/types/audits';

export function useAudits() {
  type StatusFilter = 'all' | AuditStatus;
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const orgId = await getActiveOrganizationId();
      let query = supabase
        .from('audits')
        .select('*')
        .eq('organization_id', orgId)
        .order('audit_date', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm.trim().length) {
        query = query.ilike('name', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAudits(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audits');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAudits();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchAudits]);

  return {
    audits,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    refresh: fetchAudits,
  };
}

export function usePracticeStandards() {
  const [standards, setStandards] = useState<PracticeStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandards = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('practice_standards')
        .select('id, code, title, domain, name')
        .order('code');

      if (error) throw error;
      setStandards(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load standards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandards();
  }, [fetchStandards]);

  return { standards, loading, error, refresh: fetchStandards };
}

export function useAudit(auditId?: string | null) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [standards, setStandards] = useState<AuditStandardReview[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = useCallback(async () => {
    if (!auditId) return;
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Audit not found');
      setAudit(data as Audit);

      const { data: standardRows, error: standardError } = await supabase
        .from('audit_standards')
        .select('*')
        .eq('audit_id', auditId)
        .order('standard_id');

      if (standardError) throw standardError;

      let decoratedStandards: AuditStandardReview[] = (standardRows as AuditStandardReview[]) || [];
      if ((standardRows?.length || 0) > 0) {
        const ids = (standardRows || []).map((row) => row.standard_id);
        const uniqueIds = Array.from(new Set(ids));
        if (uniqueIds.length) {
          const { data: practiceData } = await supabase
            .from('practice_standards')
            .select('id, code, title, domain, name')
            .in('id', uniqueIds);

          const map = new Map((practiceData || []).map((item) => [item.id, item]));
          decoratedStandards = (standardRows || []).map((row) => ({
            ...(row as AuditStandardReview),
            standard: map.get(row.standard_id) || null,
          }));
        }
      }
      setStandards(decoratedStandards);

      const { data: findingRows, error: findingError } = await supabase
        .from('audit_findings')
        .select('*')
        .eq('audit_id', auditId)
        .order('created_at', { ascending: false });

      if (findingError) throw findingError;

      let decoratedFindings: AuditFinding[] = (findingRows as AuditFinding[]) || [];
      if ((findingRows?.length || 0) > 0) {
        const findingStandardIds = (findingRows || [])
          .map((row) => row.standard_id)
          .filter(Boolean) as string[];
        const uniqueFindingStandardIds = Array.from(new Set(findingStandardIds));
        if (uniqueFindingStandardIds.length) {
          const { data: practiceData } = await supabase
            .from('practice_standards')
            .select('id, code, title, domain, name')
            .in('id', uniqueFindingStandardIds);

          const map = new Map((practiceData || []).map((item) => [item.id, item]));
          decoratedFindings = (findingRows || []).map((row) => ({
            ...(row as AuditFinding),
            standard: row.standard_id ? map.get(row.standard_id) || null : null,
          }));
        }
      }
      setFindings(decoratedFindings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit');
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  useEffect(() => {
    if (auditId) {
      fetchAudit();
    }
  }, [auditId, fetchAudit]);

  return { audit, standards, findings, loading, error, refresh: fetchAudit } as const;
}

export function useCreateAudit() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAudit = useCallback(async (payload: CreateAuditPayload) => {
    try {
      setCreating(true);
      setError(null);
      const orgId = await getActiveOrganizationId();

      const { data, error } = await supabase
        .from('audits')
        .insert([
          {
            organization_id: orgId,
            name: payload.name,
            audit_date: payload.auditDate,
            auditor_name: payload.auditorName,
            status: 'in_progress',
            notes: payload.notes || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (payload.standardIds.length) {
        const { error: standardsError } = await supabase
          .from('audit_standards')
          .insert(
            payload.standardIds.map((standardId) => ({
              audit_id: data.id,
              standard_id: standardId,
              status: 'fail',
            }))
          );

        if (standardsError) throw standardsError;
      }

      return data as AuditDetail;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create audit');
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  return { createAudit, creating, error } as const;
}

export function useAuditActions() {
  const [savingBasics, setSavingBasics] = useState(false);
  const [completing, setCompleting] = useState(false);

  const updateAuditDetails = useCallback(async (auditId: string, updates: UpdateAuditPayload) => {
    try {
      setSavingBasics(true);
      const { error } = await supabase
        .from('audits')
        .update({
          name: updates.name,
          audit_date: updates.auditDate,
          auditor_name: updates.auditorName,
          notes: updates.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auditId);

      if (error) throw error;
    } finally {
      setSavingBasics(false);
    }
  }, []);

  const setStandardStatus = useCallback(async (auditId: string, standardId: string, status: StandardResult) => {
    const { error } = await supabase
      .from('audit_standards')
      .update({ status })
      .eq('audit_id', auditId)
      .eq('standard_id', standardId);

    if (error) throw error;
  }, []);

  const addFinding = useCallback(async (auditId: string, payload: FindingPayload) => {
    const { data, error } = await supabase
      .from('audit_findings')
      .insert([
        {
          audit_id: auditId,
          description: payload.description,
          standard_id: payload.standardId,
          severity: payload.severity,
          notes: payload.notes || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as AuditFinding;
  }, []);

  const deleteFinding = useCallback(async (findingId: string) => {
    const { error } = await supabase
      .from('audit_findings')
      .delete()
      .eq('id', findingId);

    if (error) throw error;
  }, []);

  const completeAudit = useCallback(async (auditId: string) => {
    try {
      setCompleting(true);
      const { error } = await supabase
        .from('audits')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', auditId);

      if (error) throw error;
    } finally {
      setCompleting(false);
    }
  }, []);

  return {
    updateAuditDetails,
    setStandardStatus,
    addFinding,
    deleteFinding,
    completeAudit,
    savingBasics,
    completing,
  } as const;
}
