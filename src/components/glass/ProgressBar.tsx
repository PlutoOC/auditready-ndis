import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';

const progressBarVariants = cva(
  // Track styles
  'w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const fillVariants = cva(
  // Fill styles
  'h-full rounded-full transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-indigo-500 to-fuchsia-500',
        success: 'bg-gradient-to-r from-emerald-400 to-cyan-400',
        warning: 'bg-gradient-to-r from-amber-400 to-orange-400',
        error: 'bg-gradient-to-r from-rose-400 to-pink-400',
        info: 'bg-gradient-to-r from-violet-400 to-purple-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ProgressBarProps
  extends VariantProps<typeof progressBarVariants>,
    VariantProps<typeof fillVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size,
  variant,
  showLabel,
  labelPosition = 'outside',
  animated = true,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(showLabel && labelPosition === 'outside') && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div className={cn(progressBarVariants({ size }))}>
        <motion.div
          className={cn(
            fillVariants({ variant }),
            animated && 'relative overflow-hidden'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {animated && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              style={{
                backgroundSize: '200% 100%',
              }}
            />
          )}
          {(showLabel && labelPosition === 'inside' && percentage > 15) && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Circular Progress variant
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 48, strokeWidth: 4, fontSize: 12 },
  md: { width: 64, strokeWidth: 5, fontSize: 14 },
  lg: { width: 96, strokeWidth: 6, fontSize: 18 },
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    default: 'text-indigo-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    error: 'text-rose-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.width}
        height={config.width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className={colorClasses[variant]}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute font-semibold text-slate-900 dark:text-slate-100"
          style={{ fontSize: config.fontSize }}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export { ProgressBar, CircularProgress };
