import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

export interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith('image/')) return <Image className="w-6 h-6" />;
  if (type.includes('pdf')) return <FileText className="w-6 h-6" />;
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) {
    return <FileSpreadsheet className="w-6 h-6" />;
  }
  return <File className="w-6 h-6" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles,
  disabled = false,
  label = 'Drop files here or click to browse',
  sublabel = 'PDF, Word, or images up to 10MB',
  className,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList | null): File[] => {
    if (!files) return [];
    
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max ${formatFileSize(maxSize)})`);
        return;
      }

      // Check file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(',').map((t: string) => t.trim());
        const isAccepted = acceptedTypes.some((type: string) => {
          if (type.includes('*')) {
            return file.type.startsWith(type.replace('/*', ''));
          }
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        });
        
        if (!isAccepted) {
          errors.push(`${file.name} is not an accepted file type`);
          return;
        }
      }

      validFiles.push(file);
    });

    // Check max files
    if (maxFiles && validFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return validFiles.slice(0, maxFiles);
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
    } else {
      setError(null);
    }

    return validFiles;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      if (multiple) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
        onFilesSelected([...selectedFiles, ...validFiles]);
      } else {
        setSelectedFiles(validFiles);
        onFilesSelected(validFiles);
      }
    }
  }, [multiple, onFilesSelected, selectedFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Drop Zone */}
      <motion.div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragOver ? 1.02 : 1,
          borderColor: isDragOver ? 'rgba(99, 102, 241, 0.5)' : undefined,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <GlassCard
          variant={isDragOver ? 'strong' : 'subtle'}
          padding="xl"
          radius="xl"
          className={cn(
            'cursor-pointer border-2 border-dashed transition-colors',
            isDragOver
              ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="text-center">
            <motion.div
              animate={{ y: isDragOver ? -5 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <div className={cn(
                'w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors',
                isDragOver
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              )}>
                <Upload className="w-8 h-8" />
              </div>
            </motion.div>
            
            <p className="text-base font-medium text-slate-900 dark:text-slate-100">
              {label}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {sublabel}
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-rose-500"
        >
          {error}
        </motion.p>
      )}

      {/* Selected Files List */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {selectedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  variant="subtle"
                  padding="md"
                  radius="lg"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </GlassButton>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { FileUploadZone };
