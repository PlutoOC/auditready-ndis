import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Clock,
  FileText,
  X,
  History,
  Paperclip,
  Trash2,
  Eye,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { FileUploadZone } from '@/components/glass/FileUploadZone';
import { supabase } from '@/lib/supabase';

interface Version {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  word_count: number;
}

interface Evidence {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

interface EnhancedResponseEditorProps {
  content: string;
  onChange: (content: string) => void;
  qiId: string;
  organizationId: string;
  placeholder?: string;
  onSave?: () => void;
  lastSaved?: Date | null;
  isSaving?: boolean;
}

const EnhancedResponseEditor: React.FC<EnhancedResponseEditorProps> = ({
  content,
  onChange,
  qiId,
  organizationId,
  placeholder = 'Write your response here...',
  onSave,
  lastSaved,
  isSaving = false,
}) => {
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showEvidenceSidebar, setShowEvidenceSidebar] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setWordCount(content.trim().split(/\s+/).filter((w) => w.length > 0).length);
  }, [content]);

  useEffect(() => {
    if (showVersionHistory) {
      fetchVersions();
    }
  }, [showVersionHistory, qiId, organizationId]);

  useEffect(() => {
    if (showEvidenceSidebar) {
      fetchEvidence();
    }
  }, [showEvidenceSidebar, qiId]);

  const fetchVersions = async () => {
    try {
      const { data } = await supabase
        .from('response_versions')
        .select('*')
        .eq('quality_indicator_id', qiId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setVersions(data);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const fetchEvidence = async () => {
    try {
      const { data } = await supabase
        .from('evidence_qi_mappings')
        .select(`
          evidence_file:evidence_file_id (id, file_name, file_type, file_size, created_at)
        `)
        .eq('quality_indicator_id', qiId);

      if (data) {
        const formattedEvidence: Evidence[] = data.map((m: any) => ({
          id: m.evidence_file.id,
          file_name: m.evidence_file.file_name,
          file_type: m.evidence_file.file_type,
          file_size: m.evidence_file.file_size,
          uploaded_at: m.evidence_file.created_at,
        }));
        setEvidence(formattedEvidence);
      }
    } catch (error) {
      console.error('Error fetching evidence:', error);
    }
  };

  const handleInsertFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = content;

    switch (format) {
      case 'bold':
        newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        break;
      case 'italic':
        newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
        break;
      case 'underline':
        newText = content.substring(0, start) + `<u>${selectedText}</u>` + content.substring(end);
        break;
      case 'h1':
        newText = content.substring(0, start) + `\n# ${selectedText}\n` + content.substring(end);
        break;
      case 'h2':
        newText = content.substring(0, start) + `\n## ${selectedText}\n` + content.substring(end);
        break;
      case 'h3':
        newText = content.substring(0, start) + `\n### ${selectedText}\n` + content.substring(end);
        break;
      case 'bullet':
        newText = content.substring(0, start) + `\n- ${selectedText}` + content.substring(end);
        break;
      case 'numbered':
        newText = content.substring(0, start) + `\n1. ${selectedText}` + content.substring(end);
        break;
      case 'quote':
        newText = content.substring(0, start) + `\n> ${selectedText}\n` + content.substring(end);
        break;
      case 'code':
        newText = content.substring(0, start) + `\`\`\`\n${selectedText}\n\`\`\`` + content.substring(end);
        break;
      case 'link':
        newText = content.substring(0, start) + `[${selectedText || 'link text'}](url)` + content.substring(end);
        break;
    }

    onChange(newText);

    // Restore focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (newText.length - content.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleRestoreVersion = (version: Version) => {
    onChange(version.content);
    setSelectedVersion(null);
    setShowVersionHistory(false);
  };

  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${organizationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }

      const { data: evidenceData, error: evidenceError } = await supabase
        .from('evidence_files')
        .insert([
          {
            organization_id: organizationId,
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

      await supabase.from('evidence_qi_mappings').insert([
        {
          evidence_file_id: evidenceData.id,
          quality_indicator_id: qiId,
        },
      ]);

      setEvidence((prev) => [
        ...prev,
        {
          id: evidenceData.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
        },
      ]);
    }

    setShowUploadZone(false);
  };

  const handleRemoveEvidence = async (evidenceId: string) => {
    await supabase
      .from('evidence_qi_mappings')
      .delete()
      .eq('evidence_file_id', evidenceId)
      .eq('quality_indicator_id', qiId);

    setEvidence((prev) => prev.filter((e) => e.id !== evidenceId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ToolbarButton = ({
    icon: Icon,
    onClick,
    tooltip,
    active = false,
  }: {
    icon: React.ElementType;
    onClick: () => void;
    tooltip: string;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="flex gap-4 h-full">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        <GlassCard padding="none" radius="xl" className="flex-1 flex flex-col">
          {/* Enhanced Toolbar */}
          <div className="flex items-center gap-1 p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-xl flex-wrap">
            {/* Text Formatting */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                icon={Bold}
                onClick={() => handleInsertFormatting('bold')}
                tooltip="Bold (Ctrl+B)"
              />
              <ToolbarButton
                icon={Italic}
                onClick={() => handleInsertFormatting('italic')}
                tooltip="Italic (Ctrl+I)"
              />
              <ToolbarButton
                icon={Underline}
                onClick={() => handleInsertFormatting('underline')}
                tooltip="Underline (Ctrl+U)"
              />
            </div>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2" />

            {/* Headings */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                icon={Heading1}
                onClick={() => handleInsertFormatting('h1')}
                tooltip="Heading 1"
              />
              <ToolbarButton
                icon={Heading2}
                onClick={() => handleInsertFormatting('h2')}
                tooltip="Heading 2"
              />
              <ToolbarButton
                icon={Heading3}
                onClick={() => handleInsertFormatting('h3')}
                tooltip="Heading 3"
              />
            </div>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2" />

            {/* Lists */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                icon={List}
                onClick={() => handleInsertFormatting('bullet')}
                tooltip="Bullet List"
              />
              <ToolbarButton
                icon={ListOrdered}
                onClick={() => handleInsertFormatting('numbered')}
                tooltip="Numbered List"
              />
            </div>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2" />

            {/* Special Formatting */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                icon={Quote}
                onClick={() => handleInsertFormatting('quote')}
                tooltip="Blockquote"
              />
              <ToolbarButton
                icon={Code}
                onClick={() => handleInsertFormatting('code')}
                tooltip="Code Block"
              />
              <ToolbarButton
                icon={LinkIcon}
                onClick={() => handleInsertFormatting('link')}
                tooltip="Insert Link"
              />
            </div>

            <div className="flex-1" />

            {/* Sidebar Toggles */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                icon={History}
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                tooltip="Version History"
                active={showVersionHistory}
              />
              <ToolbarButton
                icon={Paperclip}
                onClick={() => setShowEvidenceSidebar(!showEvidenceSidebar)}
                tooltip="Evidence"
                active={showEvidenceSidebar}
              />
            </div>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 w-full p-6 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 leading-relaxed text-base"
            style={{ minHeight: '400px' }}
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
                  <span className="w-3 h-3 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                  Saving...
                </span>
              )}
            </div>
            {onSave && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
              >
                Save
              </GlassButton>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Version History Sidebar */}
      <AnimatePresence>
        {showVersionHistory && (
          <motion.div
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 320 }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <GlassCard padding="lg" className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Version History
                </h3>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {versions.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No versions yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Versions are saved automatically
                    </p>
                  </div>
                ) : (
                  versions.map((version, index) => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version)}
                      className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                        selectedVersion?.id === version.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500">
                          Version {versions.length - index}
                        </span>
                        <span className="text-xs text-slate-400">
                          {version.word_count} words
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                        {version.content.substring(0, 100)}...
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(version.created_at)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evidence Sidebar */}
      <AnimatePresence>
        {showEvidenceSidebar && (
          <motion.div
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 320 }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <GlassCard padding="lg" className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Evidence
                </h3>
                <button
                  onClick={() => setShowEvidenceSidebar(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <GlassButton
                variant="secondary"
                size="sm"
                fullWidth
                className="mb-4"
                onClick={() => setShowUploadZone(!showUploadZone)}
              >
                {showUploadZone ? 'Cancel' : 'Add Evidence'}
              </GlassButton>

              <AnimatePresence>
                {showUploadZone && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <FileUploadZone
                      onFilesSelected={handleFilesSelected}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                      multiple
                      label="Drop files here"
                      sublabel="PDF, Word, Excel, or images"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 overflow-y-auto space-y-3">
                {evidence.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No evidence attached</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload files to support your response
                    </p>
                  </div>
                ) : (
                  evidence.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {item.file_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(item.file_size)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveEvidence(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version Preview Modal */}
      <AnimatePresence>
        {selectedVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedVersion(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <GlassCard padding="lg" className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Version Preview
                    </h3>
                    <p className="text-sm text-slate-500">
                      {formatDate(selectedVersion.created_at)} • {selectedVersion.word_count} words
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                      onClick={() => handleRestoreVersion(selectedVersion)}
                    >
                      Restore
                    </GlassButton>
                    <button
                      onClick={() => setSelectedVersion(null)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans">
                    {selectedVersion.content}
                  </pre>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { EnhancedResponseEditor };
export default EnhancedResponseEditor;
