import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuditForm, type AuditFormValues } from '@/components/audits/AuditForm';
import { StandardsChecklist } from '@/components/audits/StandardsChecklist';
import { useCreateAudit, usePracticeStandards } from '@/hooks/useAudits';

interface AuditCreatePageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

const initialValues: AuditFormValues = {
  name: '',
  auditDate: '',
  auditorName: '',
  notes: '',
};

export function AuditCreatePage({ onNavigate }: AuditCreatePageProps) {
  const [values, setValues] = useState<AuditFormValues>(initialValues);
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const { standards, loading: standardsLoading } = usePracticeStandards();
  const { createAudit, creating, error } = useCreateAudit();

  const handleChange = (field: keyof AuditFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!values.name.trim() || !values.auditDate || !values.auditorName.trim()) {
      setFormError('Name, date, and auditor are required.');
      return;
    }
    if (selectedStandards.length === 0) {
      setFormError('Select at least one standard to audit.');
      return;
    }
    setFormError(null);
    try {
      const audit = await createAudit({
        name: values.name.trim(),
        auditDate: values.auditDate,
        auditorName: values.auditorName.trim(),
        standardIds: selectedStandards,
        notes: values.notes.trim() || undefined,
      });
      onNavigate('audits-edit', { auditId: audit.id });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-emerald-50/50">
      <div className="mx-auto max-w-4xl px-4 py-10 pt-24 space-y-8">
        <button
          onClick={() => onNavigate('audits')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to audits
        </button>
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl">
          {formError && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {formError}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          <AuditForm
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitLabel="Create Audit"
            submitting={creating}
            description="Set up a new audit and choose the practice standards you want to review."
          >
            <StandardsChecklist
              standards={standards}
              selectedIds={selectedStandards}
              onChange={setSelectedStandards}
              loading={standardsLoading}
              disabled={creating}
            />
          </AuditForm>
        </div>
      </div>
    </div>
  );
}
