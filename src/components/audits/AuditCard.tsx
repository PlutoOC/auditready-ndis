import type { Audit } from '@/types/audits';
import { CalendarDays, User } from 'lucide-react';

interface AuditCardProps {
  audit: Audit;
  onEdit: () => void;
  onView: () => void;
}

const statusStyles: Record<Audit['status'], string> = {
  in_progress: 'bg-amber-100 text-amber-700 border border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};

const statusLabel: Record<Audit['status'], string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
};

const formatter = new Intl.DateTimeFormat('en-AU', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function AuditCard({ audit, onEdit, onView }: AuditCardProps) {
  const formattedDate = audit.audit_date
    ? formatter.format(new Date(`${audit.audit_date}T00:00:00Z`))
    : 'Not set';

  const primaryLabel = audit.status === 'completed' ? 'View Audit' : 'Continue';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm backdrop-blur p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{audit.name}</h3>
          <p className="text-sm text-slate-500">Audit #{audit.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[audit.status]}`}>
          {statusLabel[audit.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span>{audit.auditor_name || 'Unassigned'}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={audit.status === 'completed' ? onView : onEdit}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 transition"
        >
          {primaryLabel}
        </button>
        <button
          onClick={audit.status === 'completed' ? onEdit : onView}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          {audit.status === 'completed' ? 'Edit Details' : 'Preview'}
        </button>
      </div>
    </div>
  );
}
