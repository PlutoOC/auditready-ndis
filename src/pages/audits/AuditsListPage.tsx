import { Plus, Search } from 'lucide-react';
import { useAudits } from '@/hooks/useAudits';
import { AuditCard } from '@/components/audits/AuditCard';
import type { Audit } from '@/types/audits';

interface AuditsListPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

const formatter = new Intl.DateTimeFormat('en-AU', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const statusLabels: Record<Audit['status'], string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
};

const statusChipStyles: Record<Audit['status'], string> = {
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export function AuditsListPage({ onNavigate }: AuditsListPageProps) {
  const {
    audits,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    refresh,
  } = useAudits();

  const handleEdit = (auditId: string) => onNavigate('audits-edit', { auditId });
  const handleView = (auditId: string) => onNavigate('audits-view', { auditId });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 py-10 pt-24 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Audits</h1>
            <p className="text-slate-500">Track every internal audit from planning through completion.</p>
          </div>
          <button
            onClick={() => onNavigate('audits-new')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-500"
          >
            <Plus className="w-4 h-4" />
            New Audit
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {['all', 'in_progress', 'completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter as typeof statusFilter)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  statusFilter === filter
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'in_progress' ? 'In Progress' : 'Completed'}
              </button>
            ))}
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search audits by name"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
            <button
              className="ml-2 text-rose-900 underline"
              onClick={() => refresh()}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
        ) : audits.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-12 text-center">
            <p className="text-lg font-medium text-slate-700">No audits yet</p>
            <p className="text-sm text-slate-500">Create your first audit to start tracking findings.</p>
            <button
              onClick={() => onNavigate('audits-new')}
              className="mt-4 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white"
            >
              Create Audit
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-100 bg-white/90 shadow-sm">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    {['Name', 'Date', 'Auditor', 'Status', 'Actions'].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {audits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{audit.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {audit.audit_date
                          ? formatter.format(new Date(`${audit.audit_date}T00:00:00Z`))
                          : 'Not set'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{audit.auditor_name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusChipStyles[audit.status]}`}>
                          {statusLabels[audit.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(audit.id)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {audit.status === 'completed' ? 'Edit' : 'Continue'}
                        </button>
                        <button
                          onClick={() => handleView(audit.id)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          disabled={audit.status !== 'completed'}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {audits.map((audit) => (
                <AuditCard
                  key={audit.id}
                  audit={audit}
                  onEdit={() => handleEdit(audit.id)}
                  onView={() => handleView(audit.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
