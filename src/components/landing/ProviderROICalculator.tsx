import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Clock, FileText, TrendingUp, ArrowRight, CheckCircle2, Play, X } from 'lucide-react';

interface ProviderROICalculatorProps {
  onGetStarted: () => void;
}

export function ProviderROICalculator({ onGetStarted }: ProviderROICalculatorProps) {
  const [staffCount, setStaffCount] = useState<number>(5);
  const [showResults, setShowResults] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Calculations for NDIS providers
  const hoursPerQI_Manual = 2; // Manual: 2 hours per QI (research + writing)
  const hoursPerQI_Tool = 0.5; // With tool: 30 mins per QI (AI-assisted)
  const totalQIs = 308;

  const totalHoursManual = totalQIs * hoursPerQI_Manual;
  const totalHoursWithTool = totalQIs * hoursPerQI_Tool;
  const hoursSaved = totalHoursManual - totalHoursWithTool;
  const timeReduction = Math.round((hoursSaved / totalHoursManual) * 100);

  // Demo steps
  const demoSteps = [
    {
      title: "Self-Assessment",
      desc: "Answer 308 Quality Indicators with AI guidance",
      icon: <FileText className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Evidence Upload",
      desc: "Map policies, procedures & records to each QI",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Compliance Dashboard",
      desc: "Track progress across all 8 modules in real-time",
      icon: <Clock className="w-8 h-8" />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Export & Submit",
      desc: "Generate audit-ready reports for NDIS Commission",
      icon: <CheckCircle2 className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Interactive Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full relative overflow-hidden"
            >
              <button
                onClick={() => setShowDemo(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                See How AuditReady Works
              </h3>

              {/* Demo Steps */}
              <div className="relative">
                {/* Progress Bar */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((demoStep + 1) / demoSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Step Indicators */}
                <div className="flex justify-between mb-8 relative z-10">
                  {demoSteps.map((_step, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDemoStep(idx)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        idx <= demoStep
                          ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Current Step */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={demoStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center py-8"
                  >
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${demoSteps[demoStep].color} flex items-center justify-center text-white shadow-xl`}>
                      {demoSteps[demoStep].icon}
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {demoSteps[demoStep].title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {demoSteps[demoStep].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setDemoStep(Math.max(0, demoStep - 1))}
                    disabled={demoStep === 0}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {demoStep < demoSteps.length - 1 ? (
                    <button
                      onClick={() => setDemoStep(demoStep + 1)}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-lg font-medium"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowDemo(false);
                        onGetStarted();
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                      Start Free Trial
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Calculator Card */}
      <div className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700">
        {/* Header with Demo Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Calculate Your Time Savings
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                See how much faster NDIS compliance can be
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDemo(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-fuchsia-700 transition-all"
          >
            <Play className="w-4 h-4" />
            Watch Demo
          </button>
        </div>

        {!showResults ? (
          <div className="space-y-6">
            {/* Staff Count Slider */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                How many staff work on compliance?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={staffCount}
                  onChange={(e) => setStaffCount(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="w-24 text-center">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {staffCount}
                  </span>
                  <span className="text-xs text-slate-500 block">staff</span>
                </div>
              </div>
            </div>

            {/* Comparison Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Without AuditReady</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{totalHoursManual} hrs</p>
                <p className="text-xs text-red-600 dark:text-red-400">to complete 308 QIs</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">With AuditReady</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalHoursWithTool} hrs</p>
                <p className="text-xs text-green-600 dark:text-green-400">AI-assisted completion</p>
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
            {/* Big Result */}
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                You'll save
              </p>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 mb-2">
                {hoursSaved} hours
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-300">
                on your next NDIS audit
              </p>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Time per QI (manual)</span>
                <span className="font-semibold text-slate-900 dark:text-white">{hoursPerQI_Manual} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Time per QI (with AuditReady)</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{hoursPerQI_Tool} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total Quality Indicators</span>
                <span className="font-semibold text-slate-900 dark:text-white">{totalQIs}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-600 pt-4 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Time reduction</span>
                <span className="font-semibold text-green-600 text-lg">{timeReduction}%</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>AI writes responses</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Evidence auto-mapped</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Real-time progress</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Instant reports</span>
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
