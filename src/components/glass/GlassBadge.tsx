import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glassBadgeVariants = cva(
  // Base styles
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide backdrop-blur-[8px] border',
  {
    variants: {
      variant: {
        default: [
          'bg-slate-500/10 dark:bg-slate-400/10',
          'text-slate-700 dark:text-slate-300',
          'border-slate-500/20 dark:border-slate-400/20',
        ],
        primary: [
          'bg-emerald-50 dark:bg-indigo-400/10',
          'text-emerald-800 dark:text-indigo-300',
          'border-indigo-500/20 dark:border-indigo-400/20',
        ],
        success: [
          'bg-emerald-500/10 dark:bg-emerald-400/10',
          'text-emerald-700 dark:text-emerald-300',
          'border-emerald-500/20 dark:border-emerald-400/20',
        ],
        warning: [
          'bg-amber-500/10 dark:bg-amber-400/10',
          'text-amber-700 dark:text-amber-300',
          'border-amber-500/20 dark:border-amber-400/20',
        ],
        error: [
          'bg-rose-500/10 dark:bg-rose-400/10',
          'text-rose-700 dark:text-rose-300',
          'border-rose-500/20 dark:border-rose-400/20',
        ],
        info: [
          'bg-violet-500/10 dark:bg-violet-400/10',
          'text-violet-700 dark:text-violet-300',
          'border-violet-500/20 dark:border-violet-400/20',
        ],
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface GlassBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof glassBadgeVariants> {
  children: React.ReactNode;
  dot?: boolean;
}

const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  className,
  variant,
  size,
  dot = false,
  ...props
}) => {
  const dotColors = {
    default: 'bg-slate-500',
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-violet-500',
  };

  return (
    <span
      className={cn(glassBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColors[variant || 'default']
          )}
        />
      )}
      {children}
    </span>
  );
};

export { GlassBadge, glassBadgeVariants };
