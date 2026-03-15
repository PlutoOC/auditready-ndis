import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Trash2,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Users,
  FileCheck,
  ClipboardCheck,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { FileUploadZone } from '@/components/glass/FileUploadZone';
import { GuidedQuestionnaire } from '@/components/editors/GuidedQuestionnaire';
import { EvidenceSuggestions } from '@/components/editors/EvidenceSuggestions';
import { supabase } from '@/lib/supabase';

interface ResponseEditorPageProps {
  moduleId: string;
  outcomeId: string;
  qiId: string;
  onNavigate: (page: string, params?: any) => void;
}

interface QualityIndicator {
  id: string;
  code: string;
  title: string;
  description: string;
}

interface Outcome {
  id: string;
  code: string;
  name: string;
}

interface Module {
  id: string;
  code: string;
  name: string;
}

interface Response {
  id?: string;
  content: string;
  status: 'draft' | 'completed';
  updated_at?: string;
}

const ResponseEditorPage: React.FC<ResponseEditorPageProps> = ({
  moduleId,
  outcomeId,
  qiId,
  onNavigate,
}) => {
  const [module, setModule] = useState<Module | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [qi, setQi] = useState<QualityIndicator | null>(null);
  const [response, setResponse] = useState<Response>({
    content: '',
    status: 'draft',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [mappedEvidence, setMappedEvidence] = useState<any[]>([]);
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [moduleId, outcomeId, qiId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (response.content && response.status === 'draft') {
        handleSave(false);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [response]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      setOrganization(orgData);

      // Fetch module
      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single();
      setModule(moduleData);

      // Fetch outcome
      const { data: outcomeData } = await supabase
        .from('outcomes')
        .select('*')
        .eq('id', outcomeId)
        .single();
      setOutcome(outcomeData);

      // Fetch QI
      const { data: qiData } = await supabase
        .from('quality_indicators')
        .select('*')
        .eq('id', qiId)
        .single();
      setQi(qiData);

      // Fetch existing response
      const { data: responseData } = orgData?.id
        ? await supabase
            .from('self_assessment_responses')
            .select('*')
            .eq('quality_indicator_id', qiId)
            .eq('organization_id', orgData.id)
            .single()
        : { data: null };

      if (responseData) {
        setResponse({
          id: responseData.id,
          content: responseData.response_text || '',
          status: responseData.status,
          updated_at: responseData.updated_at,
        });
        setLastSaved(new Date(responseData.updated_at));
      }

      // Fetch mapped evidence
      fetchMappedEvidence(orgData?.id, qiId);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchMappedEvidence = async (_orgId: string, qiId: string) => {
    const { data } = await supabase
      .from('evidence_qi_mappings')
      .select(`
        evidence_file:evidence_file_id (*)
      `)
      .eq('quality_indicator_id', qiId);

    if (data) {
      setMappedEvidence(data.map((m: any) => m.evidence_file));
    }
  };

  const handleSave = async (markComplete: boolean = false) => {
    if (!organization) return;
    
    setIsSaving(true);
    try {
      const saveData = {
        organization_id: organization.id,
        quality_indicator_id: qiId,
        response_text: response.content,
        status: markComplete ? 'completed' : 'draft',
      };

      if (response.id) {
        await supabase
          .from('self_assessment_responses')
          .update(saveData)
          .eq('id', response.id);
      } else {
        const { data } = await supabase
          .from('self_assessment_responses')
          .insert([saveData])
          .select()
          .single();
        
        if (data) {
          setResponse((prev) => ({ ...prev, id: data.id }));
        }
      }

      setLastSaved(new Date());
      if (markComplete) {
        setResponse((prev) => ({ ...prev, status: 'completed' }));
      }
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setResponse((prev) => ({ ...prev, content }));
    setWordCount(content.trim().split(/\s+/).filter((w) => w.length > 0).length);
  };

  const handleFilesSelected = async (files: File[]) => {
    // Upload files to Supabase storage
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${organization.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }

      // Create evidence file record
      const { data: evidenceData, error: evidenceError } = await supabase
        .from('evidence_files')
        .insert([
          {
            organization_id: organization.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
          },
        ])
        .select()
        .single();

      if (evidenceError) {
        console.error('Error creating evidence record:', evidenceError);
        continue;
      }

      // Map to QI
      await supabase.from('evidence_qi_mappings').insert([
        {
          evidence_file_id: evidenceData.id,
          quality_indicator_id: qiId,
        },
      ]);

      setMappedEvidence((prev) => [...prev, evidenceData]);
    }

    setShowEvidenceUpload(false);
  };

  const removeEvidence = async (evidenceId: string) => {
    await supabase
      .from('evidence_qi_mappings')
      .delete()
      .eq('evidence_file_id', evidenceId)
      .eq('quality_indicator_id', qiId);

    setMappedEvidence((prev) => prev.filter((e) => e.id !== evidenceId));
  };

  if (!qi || !outcome || !module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20 pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <GlassButton
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('modules')}
            >
              <ArrowLeft className="w-5 h-5" />
            </GlassButton>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <span>{module.code}</span>
                <span>/</span>
                <span>{outcome.code}</span>
                <span>/</span>
                <span>{qi.code}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {qi.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {response.status === 'completed' ? (
                <GlassBadge variant="success" dot>
                  Complete
                </GlassBadge>
              ) : (
                <GlassBadge variant="warning" dot>
                  Draft
                </GlassBadge>
              )}
            </div>
          </div>
        </motion.div>

        {/* QI Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard variant="subtle" padding="lg">
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Quality Indicator Description
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              {qi.description}
            </p>
          </GlassCard>
        </motion.div>

        {/* Guided Questionnaire Toggle */}
        {!showQuestionnaire && !response.content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <GlassCard variant="subtle" padding="lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Need help writing this response?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Answer a few simple questions and we'll help you craft a comprehensive response that meets NDIS standards.
                  </p>
                  <GlassButton
                    variant="primary"
                    leftIcon={<MessageSquare className="w-4 h-4" />}
                    onClick={() => setShowQuestionnaire(true)}
                  >
                    Start Guided Questionnaire
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Guided Questionnaire */}
        {showQuestionnaire && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <GlassCard padding="lg" radius="xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Guided Response Assistant
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Answer these questions about your practice
                  </p>
                </div>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestionnaire(false)}
                >
                  Close
                </GlassButton>
              </div>
              <GuidedQuestionnaire
                qiCode={qi?.code || ''}
                qiText={qi?.title || ''}
                existingResponse={response.content}
                onResponseGenerated={(generatedResponse) => {
                  setResponse(prev => ({ ...prev, content: generatedResponse }));
                  setShowQuestionnaire(false);
                  setWordCount(generatedResponse.split(/\s+/).filter(w => w.length > 0).length);
                }}
              />
            </GlassCard>
          </motion.div>
        )}

        {/* Rating Section */}
        {!showQuestionnaire && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <GlassCard variant="frosted" padding="lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-500" />
                Self-Assessment Rating
              </h3>

              {/* Rating Options */}
              <div className="space-y-3 mb-6">
                {[
                  { value: 0, label: 'Major Nonconformity', desc: 'High risk - cannot certify', color: 'red', icon: XCircle },
                  { value: 1, label: 'Minor Nonconformity', desc: 'Needs corrective action', color: 'orange', icon: AlertTriangle },
                  { value: 2, label: 'Conformity', desc: 'Meets NDIS standard', color: 'green', icon: CheckCircle },
                  { value: 3, label: 'Best Practice', desc: 'Exceeds standard', color: 'blue', icon: Star },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = response.rating === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => setResponse(prev => ({ ...prev, rating: option.value }))}
                        className="mt-1 w-4 h-4 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 text-${option.color}-500`} />
                          <span className={`font-semibold text-${option.color}-700 dark:text-${option.color}-300`}>
                            {option.value} — {option.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{option.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Evidence Triangulation */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Evidence Triangulation
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'participants', label: 'Participant feedback', icon: Users },
                    { key: 'staff', label: 'Staff interviews', icon: Users },
                    { key: 'documents', label: 'Document review', icon: FileCheck },
                  ].map((item) => {
                    const Icon = item.icon;
                    const key = item.key as keyof typeof response.triangulation;
                    return (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={response.triangulation[key]}
                          onChange={(e) => setResponse(prev => ({
                            ...prev,
                            triangulation: { ...prev.triangulation, [key]: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Rating Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rating Justification
                </label>
                <textarea
                  value={response.ratingNotes}
                  onChange={(e) => setResponse(prev => ({ ...prev, ratingNotes: e.target.value }))}
                  placeholder="Explain why you gave this rating. What evidence supports your assessment?"
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm min-h-[80px]"
                />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Evidence Suggestions */}
        {!showQuestionnaire && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mb-6"
          >
            <EvidenceSuggestions
              qiCode={qi?.code || ''}
              onUploadClick={() => setShowEvidenceUpload(true)}
            />
          </motion.div>
        )}

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <GlassCard padding="none" radius="xl">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-xl">
              <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                <Bold className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                <Italic className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2" />
              <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                <List className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2" />
              <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Text Area */}
            <textarea
              value={response.content}
              onChange={handleContentChange}
              placeholder="Write your self-assessment response here...&#10;&#10;Describe how your organization meets this quality indicator. Be specific about your policies, procedures, and practices.&#10;&#10;Tips:&#10;- Use specific examples&#10;- Reference your evidence&#10;- Be concise but thorough"
              className="w-full min-h-[400px] p-6 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 leading-relaxed"
            />

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-xl">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{wordCount} words</span>
                {lastSaved && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {isSaving && (
                  <span className="flex items-center gap-1">
                    <Save className="w-3 h-3 animate-pulse" />
                    Saving...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <GlassButton
                  variant="secondary"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                >
                  Save Draft
                </GlassButton>
                <GlassButton
                  variant="primary"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleSave(true)}
                  disabled={isSaving || !response.content.trim()}
                >
                  Mark Complete
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Evidence Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Evidence
            </h2>
            <GlassButton
              variant="secondary"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setShowEvidenceUpload(!showEvidenceUpload)}
            >
              {showEvidenceUpload ? 'Cancel' : 'Add Evidence'}
            </GlassButton>
          </div>

          {showEvidenceUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                label="Drop evidence files here or click to browse"
                sublabel="PDF, Word, or images up to 10MB"
              />
            </motion.div>
          )}

          {mappedEvidence.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mappedEvidence.map((evidence) => (
                <GlassCard
                  key={evidence.id}
                  variant="subtle"
                  padding="md"
                  radius="lg"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {evidence.file_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(evidence.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEvidence(evidence.id)}
                    className="text-rose-500 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </GlassButton>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard variant="subtle" padding="lg" className="text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No evidence mapped to this quality indicator yet.
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Upload files to support your response.
              </p>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export { ResponseEditorPage };
