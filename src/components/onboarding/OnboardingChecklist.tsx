import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  Circle, 
  User, 
  BookOpen, 
  FileText, 
  Upload, 
  Users, 
  Download,
  X
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  field: keyof OnboardingChecklist;
  action: string;
  link: string;
}

interface OnboardingChecklist {
  profile_completed: boolean;
  first_module_started: boolean;
  first_qi_answered: boolean;
  first_evidence_uploaded: boolean;
  team_member_invited: boolean;
  first_report_exported: boolean;
  completed_at: string | null;
}

const checklistItems: ChecklistItem[] = [
  {
    id: 'profile',
    label: 'Complete your profile',
    description: 'Add your organization details and logo',
    icon: <User className="w-5 h-5" />,
    field: 'profile_completed',
    action: 'Go to Settings',
    link: 'settings'
  },
  {
    id: 'module',
    label: 'Start your first module',
    description: 'Begin with the Core module assessment',
    icon: <BookOpen className="w-5 h-5" />,
    field: 'first_module_started',
    action: 'Start Assessment',
    link: 'modules'
  },
  {
    id: 'qi',
    label: 'Answer your first QI',
    description: 'Complete at least one quality indicator',
    icon: <FileText className="w-5 h-5" />,
    field: 'first_qi_answered',
    action: 'Answer QI',
    link: 'modules'
  },
  {
    id: 'evidence',
    label: 'Upload first evidence',
    description: 'Add supporting documentation',
    icon: <Upload className="w-5 h-5" />,
    field: 'first_evidence_uploaded',
    action: 'Add Evidence',
    link: 'evidence'
  },
  {
    id: 'team',
    label: 'Invite a team member',
    description: 'Collaborate with your colleagues',
    icon: <Users className="w-5 h-5" />,
    field: 'team_member_invited',
    action: 'Invite Team',
    link: 'team'
  },
  {
    id: 'report',
    label: 'Export your first report',
    description: 'Generate a compliance report',
    icon: <Download className="w-5 h-5" />,
    field: 'first_report_exported',
    action: 'Export Report',
    link: 'dashboard'
  }
];

interface OnboardingChecklistProps {
  onNavigate: (page: string) => void;
  onClose?: () => void;
}

export function OnboardingChecklist({ onNavigate }: OnboardingChecklistProps) {
  const [checklist, setChecklist] = useState<OnboardingChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('onboarding_checklist')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching checklist:', error);
        return;
      }

      setChecklist(data || {
        profile_completed: false,
        first_module_started: false,
        first_qi_answered: false,
        first_evidence_uploaded: false,
        team_member_invited: false,
        first_report_exported: false,
        completed_at: null
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = checklist ? 
    Object.entries(checklist)
      .filter(([key, value]) => key !== 'completed_at' && value === true)
      .length : 0;
  
  const totalCount = checklistItems.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const isComplete = checklist?.completed_at !== null;

  if (loading || dismissed || isComplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome to AuditReady! 👋
          </h2>
          <p className="text-slate-600 mt-1">
            Complete these steps to get the most out of your 14-day trial
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">
            {completedCount} of {totalCount} completed
          </span>
          <span className="font-medium text-emerald-600">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {checklistItems.map((item, index) => {
          const isCompleted = checklist?.[item.field] || false;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                isCompleted
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className={`flex-shrink-0 ${
                isCompleted ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>
              
              <div className={`flex-shrink-0 p-2 rounded-lg ${
                isCompleted 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-rose-100 text-rose-500'
              }`}>
                {item.icon}
              </div>
              
              <div className="flex-1">
                <h3 className={`font-medium ${
                  isCompleted 
                    ? 'text-emerald-700 line-through' 
                    : 'text-slate-900'
                }`}>
                  {item.label}
                </h3>
                <p className="text-sm text-slate-500">
                  {item.description}
                </p>
              </div>
              
              {!isCompleted && (
                <button
                  onClick={() => onNavigate(item.link)}
                  className="px-4 py-2 bg-emerald-700 text-white text-sm rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  {item.action}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
