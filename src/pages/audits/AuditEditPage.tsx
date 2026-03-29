import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { ArrowLeft, ClipboardList, ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react';
import { AuditForm, type AuditFormValues } from '@/components/audits/AuditForm';
import { FindingForm } from '@/components/audits/FindingForm';
import { useAudit, useAuditActions } from '@/hooks/useAudits';
import type { AuditFinding } from '@/types/audits';

interface AuditEditPageProps {
  auditId: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

const severityStyles: Record<AuditFinding['severity'], string> = {
  pass: 'bg-emerald-100 text-emerald-700',
  minor: 'bg-amber-100 text-amber-700',
  major: 'bg-orange-100 text-orange-700',
  critical: 'bg-rose-100 text-rose-700',
};

const severityIcons: Record<AuditFinding['severity'], ComponentType<{ className?: string }>> = {
  pass: ShieldCheck,
  minor: ClipboardList,
  major: AlertTriangle,
  critical: AlertTriangle,
};

const formatter = new Intl.DateTimeFormat('en-AU', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function AuditEditPage({ auditId, onNavigate }: AuditEditPageProps) {
  const { audit, standards, findings, loading, error, refresh } = useAudit(auditId);
  const { updateAuditDetails, setStandardStatus, addFinding, deleteFinding, completeAudit, savingBasics, completing } = useAuditActions();
  const [values, setValues] = useState<AuditFormValues>({ name: '', auditDate: '', auditorName: '', notes: '' });
  const [localError, setLocalError] = useState<string | null>(null);
  const [togglingStandard, setTogglingStandard] = useState<string | null>(null);
  const [deletingFindingId, setDeletingFindingId] = useState<string | null>(null);

  useEffect(() => {
    if (audit) {
      setValues({
        name: audit.name,
        auditDate: audit.audit_date,
        auditorName: audit.auditor_name || '',
        notes: audit.notes || '',
      });
    }
  }, [audit]);

  const handleChange = (field: keyof AuditFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!audit) return;
    if (!values.name.trim() || !values.auditDate || !values.auditorName.trim()) {
      setLocalError('Name, date, and auditor are required.');
      return;
    }
    setLocalError(null);
    try {
      await updateAuditDetails(audit.id, {
        name: values.name.trim(),
        auditDate: values.auditDate,
        auditorName: values.auditorName.trim(),
        notes: values.notes.trim(),
      });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStandard = async (standardId: string, status: 'pass' | 'fail') => {
    if (!audit) return;
    try {
      setTogglingStandard(standardId + status);
      await setStandardStatus(audit.id, standardId, status);
      refresh();
    } finally {
      setTogglingStandard(null);
    }
  };

  const handleAddFinding = async (payload: { description: string; standardId: string | null; severity: AuditFinding['severity']; notes?: string }) => {
    if (!audit) return;
    await addFinding(audit.id, payload);
    refresh();
  };

  const handleDeleteFinding = async (findingId: string) => {
    setDeletingFindingId(findingId);
    try {
      await deleteFinding(findingId);
      refresh();
    } finally {
      setDeletingFindingId(null);
    }
  };

  const handleComplete = async () => {
    if (!audit) return;
    await completeAudit(audit.id);
    refresh();
  };

  const canComplete = useMemo(() => {
    if (!audit) return false;
    if (!standards.length) return false;
    return standards.every((standard) => standard.status === 'pass');
  }, [audit, standards]);

  const showCompleteButton = audit?.status === 'in_progress';

  if (loading && !audit) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading audit…</p>
      </div>
    );
  }

  if (!audit && !loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold text-slate-700">Audit not found</p>
        <button
          onClick={() => onNavigate('audits')}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to audits
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 pt-24 space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => onNavigate('audits')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to audits
          </button>
          {audit?.status === 'completed' && (
            <button
              onClick={() => onNavigate('audits-view', { auditId })}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View completed report
            </button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
              {(localError || error) && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {localError || error}
                </div>
              )}
              <AuditForm
                values={values}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitLabel="Save Details"
                submitting={savingBasics}
                disabled={audit?.status === 'completed'}
                description="Update the basic details for this audit. Notes stay internal only."
              />
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Findings</h3>
                  <p className="text-sm text-slate-500">Document observations and non-conformities.</p>
                </div>
              </div>
              {audit?.status !== 'completed' && (
                <FindingForm standards={standards} onSubmit={handleAddFinding} />
              )}

              <div className="mt-6 space-y-4">
                {findings.length === 0 && (
                  <p className="text-sm text-slate-500">No findings yet.</p>
                )}
                {findings.map((finding) => {
                  const Icon = severityIcons[finding.severity];
                  return (
                    <div
                      key={finding.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${severityStyles[finding.severity]}`}>
                            <Icon className="h-3.5 w-3.5" /> {finding.severity}
                          </span>
                          {finding.standard && (
                            <span className="text-xs font-medium text-slate-500">
                              {finding.standard.code} {finding.standard.title}
                            </span>
                          )}
                        </div>
                        {audit?.status !== 'completed' && (
                          <button
                            onClick={() => handleDeleteFinding(finding.id)}
                            disabled={deletingFindingId === finding.id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingFindingId === finding.id ? 'Removing…' : 'Delete'}
                          </button>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-slate-700">{finding.description}</p>
                      {finding.notes && (
                        <p className="mt-2 text-xs text-slate-500">Notes: {finding.notes}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        Logged {formatter.format(new Date(finding.created_at))}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Standards Review</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  audit?.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {audit?.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Toggle each selected standard once reviewed.</p>

              <div className="mt-4 space-y-3">
                {standards.length === 0 && (
                  <p className="text-sm text-slate-500">No standards linked to this audit.</p>
                )}
                {standards.map((standard) => (
                  <div
                    key={standard.standard_id}
                    className="rounded-2xl border border-slate-100 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {standard.standard?.code} {standard.standard?.title}
                    </p>
                    <div className="mt-2 flex gap-3">
                      {['pass', 'fail'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleToggleStandard(standard.standard_id, status as 'pass' | 'fail')}
                          disabled={audit?.status === 'completed' || togglingStandard === standard.standard_id + status}
                          className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                            standard.status === status
                              ? status === 'pass'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {status === 'pass' ? 'Pass' : 'Fail'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showCompleteButton && (
              <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Complete Audit</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Mark the audit as completed once all standards have been reviewed.
                </p>
                <button
                  onClick={handleComplete}
                  disabled={!canComplete || completing}
                  className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
                >
                  {completing ? 'Finishing…' : 'Complete Audit'}
                </button>
                {!canComplete && (
                  <p className="mt-2 text-xs text-slate-500">
                    Each standard must be marked "Pass" before you can complete the audit.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
