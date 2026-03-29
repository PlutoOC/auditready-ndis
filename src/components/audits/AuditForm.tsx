import type { FormEvent, ReactNode } from 'react';

export interface AuditFormValues {
  name: string;
  auditDate: string;
  auditorName: string;
  notes: string;
}

interface AuditFormProps {
  values: AuditFormValues;
  onChange: (field: keyof AuditFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  submitting?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  description?: string;
}

export function AuditForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  submitting,
  disabled,
  children,
  description,
}: AuditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Audit Details</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Audit Name</label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={disabled || submitting}
            className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Mid-year internal audit"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Audit Date</label>
          <input
            type="date"
            value={values.auditDate}
            onChange={(e) => onChange('auditDate', e.target.value)}
            disabled={disabled || submitting}
            className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Auditor Name</label>
          <input
            type="text"
            value={values.auditorName}
            onChange={(e) => onChange('auditorName', e.target.value)}
            disabled={disabled || submitting}
            className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Jane Consultant"
            required
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <label className="text-sm font-medium text-slate-600">Notes</label>
          <textarea
            value={values.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            rows={4}
            disabled={disabled || submitting}
            className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Add any context for this audit"
          />
        </div>
      </div>

      {children && <div className="space-y-4">{children}</div>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting || disabled}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
