import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glassCardVariants = cva(
  // Base styles - enhanced with smooth transitions and subtle glassmorphism
  'relative overflow-hidden transition-all duration-200 ease-out will-change-transform',
  {
    variants: {
      variant: {
        default: [
          'bg-white/70 dark:bg-slate-900/70',
          'backdrop-blur-[10px]',
          'border border-white/30 dark:border-white/10',
          'shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
          'dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        ],
        subtle: [
          'bg-white/60 dark:bg-slate-900/60',
          'backdrop-blur-[8px]',
          'border border-white/25 dark:border-white/5',
          'shadow-[0_4px_20px_rgba(0,0,0,0.08)]',
        ],
        strong: [
          'bg-white/80 dark:bg-slate-900/80',
          'backdrop-blur-[12px]',
          'border border-white/40 dark:border-white/15',
          'shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
          'dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]',
        ],
        frosted: [
          'bg-white/85 dark:bg-slate-900/85',
          'backdrop-blur-[16px] saturate-[180%]',
          'border border-white/50 dark:border-white/20',
          'shadow-[0_16px_48px_rgba(0,0,0,0.15)]',
        ],
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      radius: {
        sm: 'rounded-lg',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        xl: 'rounded-3xl',
        '2xl': 'rounded-[2rem]',
      },
      hover: {
        true: [
          'hover:translate-y-[-4px]',
          'hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)]',
          'dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
          'cursor-pointer',
        ],
        false: '',
      },
      interactive: {
        true: 'active:scale-[0.98] cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      radius: 'lg',
      hover: false,
      interactive: false,
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  children: React.ReactNode;
  innerHighlight?: boolean;
  glowOnHover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      variant,
      padding,
      radius,
      hover,
      interactive,
      innerHighlight = true,
      glowOnHover = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, padding, radius, hover, interactive }),
          innerHighlight &&
            'before:absolute before:inset-0 before:rounded-inherit before:pointer-events-none before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]',
          glowOnHover && 'hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard, glassCardVariants };
