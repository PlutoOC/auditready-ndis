import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAudit } from '@/hooks/useAudits';
import { AuditReportPDF } from '@/components/audits/AuditReportPDF';

interface AuditViewPageProps {
  auditId: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

const formatter = new Intl.DateTimeFormat('en-AU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function AuditViewPage({ auditId, onNavigate }: AuditViewPageProps) {
  const { audit, standards, findings, loading, error } = useAudit(auditId);

  useEffect(() => {
    if (audit && audit.status !== 'completed') {
      onNavigate('audits-edit', { auditId });
    }
  }, [audit, auditId, onNavigate]);

  if (loading || !audit) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading audit…</p>
      </div>
    );
  }

  if (audit.status !== 'completed') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 pt-24 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('audits')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to audits
          </button>
          <AuditReportPDF audit={audit} standards={standards} findings={findings} />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{audit.name}</h1>
            <p className="text-sm text-slate-500">
              Completed {audit.audit_date ? formatter.format(new Date(`${audit.audit_date}T00:00:00Z`)) : 'Date not set'} by {audit.auditor_name}
            </p>
          </div>

          {audit.notes && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <h3 className="text-sm font-semibold text-slate-700">Notes</h3>
              <p className="text-sm text-slate-600 mt-1">{audit.notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Standards Review</h3>
            <div className="mt-3 space-y-3">
              {standards.map((standard) => (
                <div
                  key={standard.standard_id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {standard.standard?.code} {standard.standard?.title}
                    </p>
                    {standard.standard?.domain && (
                      <p className="text-xs text-slate-500">{standard.standard.domain}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      standard.status === 'pass'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {standard.status === 'pass' ? 'Pass' : 'Fail'}
                  </span>
                </div>
              ))}

              {standards.length === 0 && (
                <p className="text-sm text-slate-500">No standards recorded.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Findings</h3>
            <div className="mt-3 space-y-3">
              {findings.length === 0 && (
                <p className="text-sm text-slate-500">No findings were logged.</p>
              )}
              {findings.map((finding) => (
                <div key={finding.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {finding.severity}
                    </span>
                    {finding.standard && (
                      <span className="text-xs text-slate-500">
                        {finding.standard.code} {finding.standard.title}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{finding.description}</p>
                  {finding.notes && (
                    <p className="mt-2 text-xs text-slate-500">Notes: {finding.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
