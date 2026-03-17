import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  File as FileIcon,
  X,
  Check,
  Search,
  Filter,
  Trash2,
  Link as LinkIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { FileUploadZone } from '@/components/glass/FileUploadZone';
import { supabase } from '@/lib/supabase';

interface EvidenceFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  category: string;
  description: string;
  uploaded_at: string;
  uploaded_by: string;
  storage_path: string;
  status?: 'draft' | 'under_review' | 'approved' | 'rejected' | 'expired';
  reviewer?: { email: string };
  evidence_type: 'file' | 'url' | 'text';
  url?: string;
  text_content?: string;
}

interface QualityIndicator {
  id: string;
  code: string;
  text: string;
}

const EVIDENCE_CATEGORIES = [
  { value: 'policy', label: 'Policy', color: 'bg-blue-100 text-blue-700' },
  { value: 'procedure', label: 'Procedure', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'training_record', label: 'Training Record', color: 'bg-amber-100 text-amber-700' },
  { value: 'form', label: 'Form/Template', color: 'bg-purple-100 text-purple-700' },
  { value: 'report', label: 'Report', color: 'bg-rose-100 text-rose-700' },
  { value: 'other', label: 'Other', color: 'bg-slate-100 text-slate-700' },
];

const EvidencePage: React.FC = () => {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [qualityIndicators, setQualityIndicators] = useState<QualityIndicator[]>([]);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [mappedQIs, setMappedQIs] = useState<Record<string, string[]>>({});
  const [organization, setOrganization] = useState<any>(null);
  
  // Evidence type states
  const [evidenceType, setEvidenceType] = useState<'file' | 'url' | 'text'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [urlDescription, setUrlDescription] = useState('');
  const [textDescription, setTextDescription] = useState('');
  const [urlCategory, setUrlCategory] = useState('policy');
  const [textCategory, setTextCategory] = useState('policy');
  const [urlCustomCategory, setUrlCustomCategory] = useState('');
  const [textCustomCategory, setTextCustomCategory] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      setOrganization(orgData);

      // Fetch evidence files with reviewer info
      const { data: filesData } = orgData?.id
        ? await supabase
            .from('evidence_files')
            .select(`
              *,
              reviewer:reviewed_by(email)
            `)
            .eq('organization_id', orgData.id)
            .eq('is_active', true)
            .order('uploaded_at', { ascending: false })
        : { data: [] };
      
      // Process files to add reviewer_name
      const processedFiles = filesData?.map((file: any) => ({
        ...file,
        reviewer_name: file.reviewer?.email?.split('@')[0] || 'Unknown'
      })) || [];

      if (processedFiles) {
        setFiles(processedFiles);
      }

      // Fetch quality indicators for mapping
      const { data: qiData } = await supabase
        .from('quality_indicators')
        .select('id, code, text');

      if (qiData) {
        setQualityIndicators(qiData);
      }

      // Fetch existing mappings
      const { data: mappingsData } = await supabase
        .from('evidence_qi_mappings')
        .select('evidence_file_id, quality_indicator_id');

      if (mappingsData) {
        const mappings: Record<string, string[]> = {};
        mappingsData.forEach((m: any) => {
          if (!mappings[m.evidence_file_id]) {
            mappings[m.evidence_file_id] = [];
          }
          mappings[m.evidence_file_id].push(m.quality_indicator_id);
        });
        setMappedQIs(mappings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    if (!organization) return;
    
    for (const file of selectedFiles) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${organization.id}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('evidence-files')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        // Create database record
        const { data: evidenceData, error: dbError } = await supabase
          .from('evidence_files')
          .insert([{
            organization_id: organization.id,
            filename: file.name,
            storage_path: filePath,
            file_type: file.type,
            file_size: file.size,
            category: 'other',
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          }])
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          continue;
        }

        setFiles(prev => [evidenceData, ...prev]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setShowUploadZone(false);
  }, [organization]);

  const handleAddUrl = async () => {
    if (!organization || !urlInput.trim()) return;
    if (urlCategory === 'other' && !urlCustomCategory.trim()) return;

    try {
      const { data: evidenceData, error: dbError } = await supabase
        .from('evidence_files')
        .insert([{
          organization_id: organization.id,
          filename: urlInput.split('/').pop() || 'URL Link',
          storage_path: '',
          file_type: 'url',
          file_size: 0,
          category: urlCategory === 'other' ? urlCustomCategory.trim() : urlCategory,
          description: urlDescription,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          evidence_type: 'url',
          url: urlInput,
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return;
      }

      setFiles(prev => [evidenceData, ...prev]);
      setUrlInput('');
      setUrlDescription('');
      setUrlCustomCategory('');
      setShowUploadZone(false);
    } catch (error) {
      console.error('Error adding URL:', error);
    }
  };

  const handleAddText = async () => {
    if (!organization || !textInput.trim()) return;
    if (textCategory === 'other' && !textCustomCategory.trim()) return;

    try {
      const { data: evidenceData, error: dbError } = await supabase
        .from('evidence_files')
        .insert([{
          organization_id: organization.id,
          filename: 'Text Evidence',
          storage_path: '',
          file_type: 'text',
          file_size: textInput.length,
          category: textCategory === 'other' ? textCustomCategory.trim() : textCategory,
          description: textDescription,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          evidence_type: 'text',
          text_content: textInput,
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return;
      }

      setFiles(prev => [evidenceData, ...prev]);
      setTextInput('');
      setTextDescription('');
      setTextCustomCategory('');
      setShowUploadZone(false);
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('evidence-files')
        .remove([file.storage_path]);

      // Soft delete in database
      await supabase
        .from('evidence_files')
        .update({ is_active: false })
        .eq('id', fileId);

      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleMapToQI = async (fileId: string, qiId: string) => {
    try {
      const isMapped = mappedQIs[fileId]?.includes(qiId);

      if (isMapped) {
        // Remove mapping
        await supabase
          .from('evidence_qi_mappings')
          .delete()
          .eq('evidence_file_id', fileId)
          .eq('quality_indicator_id', qiId);

        setMappedQIs(prev => ({
          ...prev,
          [fileId]: prev[fileId]?.filter(id => id !== qiId) || []
        }));
      } else {
        // Add mapping
        await supabase
          .from('evidence_qi_mappings')
          .insert([{
            evidence_file_id: fileId,
            quality_indicator_id: qiId,
          }]);

        setMappedQIs(prev => ({
          ...prev,
          [fileId]: [...(prev[fileId] || []), qiId]
        }));
      }
    } catch (error) {
      console.error('Error mapping to QI:', error);
    }
  };

  const handleUpdateCategory = async (fileId: string, category: string) => {
    try {
      await supabase
        .from('evidence_files')
        .update({ category })
        .eq('id', fileId);

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, category } : f
      ));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      draft: { color: 'bg-slate-500', icon: Clock, label: 'Draft' },
      under_review: { color: 'bg-amber-500', icon: AlertTriangle, label: 'Under Review' },
      approved: { color: 'bg-green-500', icon: CheckCircle2, label: 'Approved' },
      rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
      expired: { color: 'bg-purple-500', icon: AlertCircle, label: 'Expired' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getFileIcon = (file: EvidenceFile) => {
    // Check evidence type first
    if (file.evidence_type === 'url') return <LinkIcon className="w-5 h-5 text-blue-600" />;
    if (file.evidence_type === 'text') return <FileText className="w-5 h-5 text-emerald-600" />;
    
    // File type icons
    if (file.file_type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (file.file_type.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (file.file_type.includes('spreadsheet') || file.file_type.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Evidence Management
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Upload and manage evidence files, map them to Quality Indicators
              </p>
            </div>
            <GlassButton
              variant="primary"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setShowUploadZone(!showUploadZone)}
            >
              {showUploadZone ? 'Cancel' : 'Add Evidence'}
            </GlassButton>
          </div>
        </motion.div>

        {/* Add Evidence - Three Types */}
        <AnimatePresence>
          {showUploadZone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <GlassCard variant="frosted" padding="lg" radius="xl">
                {/* Evidence Type Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setEvidenceType('file')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      evidenceType === 'file'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                  <button
                    onClick={() => setEvidenceType('url')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      evidenceType === 'url'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Add URL
                  </button>
                  <button
                    onClick={() => setEvidenceType('text')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      evidenceType === 'text'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Add Text
                  </button>
                </div>

                {/* File Upload */}
                {evidenceType === 'file' && (
                  <FileUploadZone
                    onFilesSelected={handleFilesSelected}
                    accept="*/*"
                    multiple
                    label="Drop evidence files here or click to browse"
                    sublabel="All file types accepted up to 50MB"
                  />
                )}

                {/* URL Input */}
                {evidenceType === 'url' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        URL Link
                      </label>
                      <GlassInput
                        placeholder="https://example.com/document"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        leftIcon={<LinkIcon className="w-4 h-4" />}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe what this link contains..."
                        value={urlDescription}
                        onChange={(e) => setUrlDescription(e.target.value)}
                        className="w-full h-24 px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        value={urlCategory}
                        onChange={(e) => setUrlCategory(e.target.value)}
                        className="w-full h-11 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      >
                        {EVIDENCE_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    {urlCategory === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Specify Category *
                        </label>
                        <input
                          type="text"
                          value={urlCustomCategory}
                          onChange={(e) => setUrlCustomCategory(e.target.value)}
                          placeholder="What type of evidence is this?"
                          className="w-full h-11 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-3">
                      <GlassButton variant="secondary" onClick={() => setShowUploadZone(false)}>
                        Cancel
                      </GlassButton>
                      <GlassButton
                        variant="primary"
                        onClick={handleAddUrl}
                        disabled={!urlInput.trim() || (urlCategory === 'other' && !urlCustomCategory.trim())}
                      >
                        Add URL Evidence
                      </GlassButton>
                    </div>
                  </div>
                )}

                {/* Text Input */}
                {evidenceType === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Evidence Description
                      </label>
                      <textarea
                        placeholder="Describe the evidence in detail. This could be a procedure, policy summary, or any text-based evidence..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="w-full h-32 px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Additional Notes
                      </label>
                      <GlassInput
                        placeholder="Any additional context..."
                        value={textDescription}
                        onChange={(e) => setTextDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        value={textCategory}
                        onChange={(e) => setTextCategory(e.target.value)}
                        className="w-full h-11 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      >
                        {EVIDENCE_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    {textCategory === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Specify Category *
                        </label>
                        <input
                          type="text"
                          value={textCustomCategory}
                          onChange={(e) => setTextCustomCategory(e.target.value)}
                          placeholder="What type of evidence is this?"
                          className="w-full h-11 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-3">
                      <GlassButton variant="secondary" onClick={() => setShowUploadZone(false)}>
                        Cancel
                      </GlassButton>
                      <GlassButton
                        variant="primary"
                        onClick={handleAddText}
                        disabled={!textInput.trim()}
                      >
                        Add Text Evidence
                      </GlassButton>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard variant="subtle" padding="md" radius="lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <GlassInput
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-11 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="all">All Categories</option>
                  {EVIDENCE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* File List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Files Grid */}
          <div className="lg:col-span-2 space-y-4">
            {filteredFiles.length === 0 ? (
              <GlassCard variant="subtle" padding="xl" radius="xl" className="text-center">
                <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No evidence files yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Upload your first evidence file to get started
                </p>
                <GlassButton
                  variant="secondary"
                  onClick={() => setShowUploadZone(true)}
                >
                  Upload File
                </GlassButton>
              </GlassCard>
            ) : (
              filteredFiles.map((file) => {
                const category = EVIDENCE_CATEGORIES.find(c => c.value === file.category);
                const fileMappings = mappedQIs[file.id] || [];
                
                return (
                  <GlassCard
                    key={file.id}
                    variant={selectedFile?.id === file.id ? 'strong' : 'subtle'}
                    padding="md"
                    radius="lg"
                    hover
                    interactive
                    onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        file.evidence_type === 'url' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : file.evidence_type === 'text'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-100 dark:bg-indigo-900/30 text-emerald-700 dark:text-emerald-600'
                      }`}>
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {file.filename}
                          </h4>
                          {category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${category.color}`}>
                              {category.label}
                            </span>
                          )}
                          {file.status && getStatusBadge(file.status)}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                        {fileMappings.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <LinkIcon className="w-3 h-3 text-indigo-500" />
                            <span className="text-xs text-emerald-700 dark:text-emerald-600">
                              Mapped to {fileMappings.length} Quality Indicator{fileMappings.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <GlassButton
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="text-rose-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedFile ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <GlassCard variant="default" padding="lg" radius="xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        File Details
                      </h3>
                      <GlassButton
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </GlassButton>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          {selectedFile.evidence_type === 'url' ? 'URL Link' : 
                           selectedFile.evidence_type === 'text' ? 'Text Evidence' : 'Filename'}
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 break-all">
                          {selectedFile.filename}
                        </p>
                      </div>

                      {/* URL Evidence Display */}
                      {selectedFile.evidence_type === 'url' && selectedFile.url && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Link</p>
                          <a 
                            href={selectedFile.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 break-all underline"
                          >
                            {selectedFile.url}
                          </a>
                        </div>
                      )}

                      {/* Text Evidence Display */}
                      {selectedFile.evidence_type === 'text' && selectedFile.text_content && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Content</p>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg max-h-48 overflow-y-auto">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                              {selectedFile.text_content}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Description for all types */}
                      {selectedFile.description && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Description</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {selectedFile.description}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Type</p>
                          <p className="text-sm text-slate-900 dark:text-slate-100 capitalize">
                            {selectedFile.evidence_type || 'File'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Size</p>
                          <p className="text-sm text-slate-900 dark:text-slate-100">
                            {selectedFile.evidence_type === 'url' ? 'URL' : 
                             selectedFile.evidence_type === 'text' ? `${selectedFile.file_size} chars` :
                             formatFileSize(selectedFile.file_size)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Category</p>
                        <select
                          value={selectedFile.category}
                          onChange={(e) => handleUpdateCategory(selectedFile.id, e.target.value)}
                          className="w-full h-10 px-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        >
                          {EVIDENCE_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <p className="text-xs text-slate-500 mb-2">Map to Quality Indicators</p>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {qualityIndicators.map((qi) => {
                            const isMapped = mappedQIs[selectedFile.id]?.includes(qi.id);
                            return (
                              <div
                                key={qi.id}
                                onClick={() => handleMapToQI(selectedFile.id, qi.id)}
                                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                                  isMapped 
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 ${
                                    isMapped 
                                      ? 'bg-indigo-500 border-indigo-500' 
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}>
                                    {isMapped && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                      {qi.code}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                      {qi.text}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GlassCard variant="subtle" padding="xl" radius="xl" className="text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Select a file to view details and map to Quality Indicators
                    </p>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export { EvidencePage };
