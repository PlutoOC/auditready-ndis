import React from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { getEvidenceSuggestions } from '@/data/evidenceSuggestions';

interface EvidenceSuggestionsProps {
  qiCode: string;
  qiTitle?: string;
  onUploadClick: () => void;
}

export const EvidenceSuggestions: React.FC<EvidenceSuggestionsProps> = ({
  qiCode,
  qiTitle,
  onUploadClick,
}) => {
  const suggestions = getEvidenceSuggestions(qiCode, qiTitle);

  return (
    <GlassCard variant="subtle" padding="lg">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            What Evidence Do I Need?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Based on this Quality Indicator, you should provide evidence of:
          </p>

          <div className="space-y-2 mb-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {suggestion}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Tip:</strong> You don't need all of these. Upload what you have available. 
                The auditor will look for evidence that demonstrates your practices meet the standard.
              </span>
            </p>
          </div>

          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Add Evidence
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default EvidenceSuggestions;
