import { useState } from 'react';
import type { AuditStandardReview, AuditSeverity } from '@/types/audits';

interface FindingFormProps {
  standards: AuditStandardReview[];
  onSubmit: (payload: {
    description: string;
    standardId: string | null;
    severity: AuditSeverity;
    notes?: string;
  }) => Promise<void> | void;
  disabled?: boolean;
}

const SEVERITY_OPTIONS: { value: AuditSeverity; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'minor', label: 'Minor' },
  { value: 'major', label: 'Major' },
  { value: 'critical', label: 'Critical' },
];

export function FindingForm({ standards, onSubmit, disabled }: FindingFormProps) {
  const [description, setDescription] = useState('');
  const [standardId, setStandardId] = useState<string | 'none'>('none');
  const [severity, setSeverity] = useState<AuditSeverity>('minor');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!description.trim()) return;
    try {
      setSaving(true);
      await onSubmit({
        description: description.trim(),
        standardId: standardId === 'none' ? null : standardId,
        severity,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      setDescription('');
      setStandardId('none');
      setSeverity('minor');
      setNotes('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-600">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={disabled || saving}
          placeholder="Describe the finding"
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Related Standard</label>
          <select
            value={standardId}
            onChange={(e) => setStandardId(e.target.value)}
            disabled={disabled || saving}
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="none">Not linked</option>
            {standards.map((standard) => (
              <option key={standard.standard_id} value={standard.standard_id}>
                {standard.standard?.code || ''} {standard.standard?.title || ''}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as AuditSeverity)}
            disabled={disabled || saving}
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-1">
          <label className="text-sm font-medium text-slate-600">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={disabled || saving}
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={disabled || saving}
        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Add Finding'}
      </button>
    </form>
  );
}
