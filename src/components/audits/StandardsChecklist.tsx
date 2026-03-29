import { useMemo, useState } from 'react';
import type { PracticeStandard } from '@/types/audits';
import { Search } from 'lucide-react';

interface StandardsChecklistProps {
  standards: PracticeStandard[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function StandardsChecklist({
  standards,
  selectedIds,
  onChange,
  loading,
  disabled,
}: StandardsChecklistProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return standards.filter((standard) => {
      const label = `${standard.code || ''} ${standard.title || standard.name || ''}`.toLowerCase();
      return label.includes(term);
    });
  }, [standards, search]);

  const toggle = (id: string) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm">
      <div className="flex flex-col gap-1 mb-4">
        <h3 className="text-lg font-semibold text-slate-900">NDIS Standards to Review</h3>
        <p className="text-sm text-slate-500">Select the practice standards included in this audit.</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          placeholder="Search by code or title"
          className="w-full rounded-xl border border-slate-200 bg-white/70 pl-10 pr-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">Loading standards…</div>
      ) : (
        <div className="max-h-72 overflow-y-auto pr-2 space-y-2">
          {filtered.map((standard) => {
            const label = `${standard.code || ''} ${standard.title || standard.name || ''}`.trim();
            return (
              <label
                key={standard.id}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                  selectedIds.includes(standard.id)
                    ? 'border-emerald-300 bg-emerald-50/70'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(standard.id)}
                  onChange={() => toggle(standard.id)}
                  disabled={disabled}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-slate-900">{label || 'Untitled Standard'}</p>
                  {standard.domain && (
                    <p className="text-xs text-slate-500">{standard.domain}</p>
                  )}
                </div>
              </label>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">No standards match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
