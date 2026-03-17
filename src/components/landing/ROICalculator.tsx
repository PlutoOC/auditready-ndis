import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Clock, FileText, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ROICalculatorProps {
  onGetStarted: () => void;
}

export function ROICalculator({ onGetStarted }: ROICalculatorProps) {
  const [providers, setProviders] = useState<number>(1);
  const [auditsPerYear, setAuditsPerYear] = useState<number>(1);
  const [showResults, setShowResults] = useState(false);

  // Calculations
  const hoursPerAuditManual = 40; // Manual audit prep takes ~40 hours
  const hoursPerAuditWithTool = 8; // With AuditReady ~8 hours
  const hourlyRate = 75; // Average NDIS consultant rate

  const hoursSavedPerAudit = hoursPerAuditManual - hoursPerAuditWithTool;
  const totalHoursSaved = hoursSavedPerAudit * auditsPerYear;
  const moneySaved = totalHoursSaved * hourlyRate;
  const timeSavedPercent = Math.round((hoursSavedPerAudit / hoursPerAuditManual) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              See How Much Time You'll Save
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Calculate your ROI in seconds
            </p>
          </div>
        </div>

        {!showResults ? (
          <div className="space-y-6">
            {/* Number of Providers */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                How many NDIS providers do you audit per year?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={providers}
                  onChange={(e) => setProviders(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-600">
                    {providers}
                  </span>
                  <span className="text-xs text-slate-500 block">providers</span>
                </div>
              </div>
            </div>

            {/* Audits per Provider */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                How many audits per provider per year?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={auditsPerYear}
                  onChange={(e) => setAuditsPerYear(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-600">
                    {auditsPerYear}
                  </span>
                  <span className="text-xs text-slate-500 block">audits</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Preview */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Current time</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">40 hrs/audit</p>
              </div>
              <div className="text-center">
                <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">With AuditReady</p>
                <p className="font-semibold text-emerald-700 dark:text-emerald-600">8 hrs/audit</p>
              </div>
              <div className="text-center">
                <Users className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Total audits</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{providers * auditsPerYear}</p>
              </div>
            </div>

            <button
              onClick={() => setShowResults(true)}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-fuchsia-700 transition-all flex items-center justify-center gap-2"
            >
              Calculate My Savings
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Results */}
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                With AuditReady, you'll save:
              </p>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 mb-2">
                ${moneySaved.toLocaleString()}
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-300">
                per year
              </p>
            </div>

            {/* Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Hours saved per audit</span>
                <span className="font-semibold text-slate-900 dark:text-white">{hoursSavedPerAudit} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total hours saved per year</span>
                <span className="font-semibold text-slate-900 dark:text-white">{totalHoursSaved} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Time reduction</span>
                <span className="font-semibold text-green-600">{timeSavedPercent}%</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-600 pt-4 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Based on hourly rate</span>
                <span className="font-semibold text-slate-900 dark:text-white">${hourlyRate}/hr</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Automated compliance tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>AI-assisted self-assessments</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Instant report generation</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResults(false)}
                className="flex-1 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Recalculate
              </button>
              <button
                onClick={onGetStarted}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-fuchsia-700 transition-all flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
