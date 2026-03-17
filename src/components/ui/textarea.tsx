import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const textareaVariants = cva(
  'w-full rounded-lg border bg-white/70 dark:bg-slate-900/70 backdrop-blur-[10px] px-3 py-2 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none',
  {
    variants: {
      variant: {
        default: 'border-slate-200 dark:border-slate-700',
        error: 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30',
      },
      size: {
        default: 'min-h-[100px]',
        sm: 'min-h-[60px] text-xs',
        lg: 'min-h-[150px] text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(textareaVariants({ variant: error ? 'error' : variant, size }), className)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-rose-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
