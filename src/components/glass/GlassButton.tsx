import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'framer-motion';

const glassButtonVariants = cva(
  // Base styles
  'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-r from-indigo-500 to-fuchsia-500',
          'text-white',
          'shadow-[0_4px_14px_rgba(99,102,241,0.4)]',
          'hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)]',
          'hover:brightness-110',
        ],
        secondary: [
          'bg-white/70 dark:bg-slate-800/70',
          'backdrop-blur-[12px]',
          'text-slate-900 dark:text-slate-100',
          'border border-slate-200 dark:border-slate-700',
          'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
          'hover:bg-white/85 dark:hover:bg-slate-800/85',
          'hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
        ],
        ghost: [
          'bg-transparent',
          'text-slate-700 dark:text-slate-300',
          'hover:bg-slate-100/50 dark:hover:bg-slate-800/50',
        ],
        outline: [
          'bg-transparent',
          'border-2 border-slate-200 dark:border-slate-700',
          'text-slate-700 dark:text-slate-300',
          'hover:bg-slate-50/50 dark:hover:bg-slate-800/50',
          'hover:border-slate-300 dark:hover:border-slate-600',
        ],
        glass: [
          'bg-white/30 dark:bg-slate-800/30',
          'backdrop-blur-[12px]',
          'border border-white/40 dark:border-white/10',
          'text-slate-900 dark:text-slate-100',
          'hover:bg-white/50 dark:hover:bg-slate-800/50',
        ],
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-lg',
        md: 'h-11 px-6 text-base rounded-xl',
        lg: 'h-12 px-8 text-base rounded-xl',
        icon: 'h-10 w-10 rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface GlassButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof glassButtonVariants> {
  children: React.ReactNode;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          glassButtonVariants({ variant, size, fullWidth }),
          className
        )}
        disabled={isDisabled}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export { GlassButton, glassButtonVariants };
