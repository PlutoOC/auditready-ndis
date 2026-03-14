import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glassCardVariants = cva(
  // Base styles
  'relative overflow-hidden transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: [
          'bg-white/70 dark:bg-slate-900/70',
          'backdrop-blur-[20px]',
          'border border-white/50 dark:border-white/10',
          'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
          'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        ],
        subtle: [
          'bg-white/50 dark:bg-slate-900/50',
          'backdrop-blur-[12px]',
          'border border-white/30 dark:border-white/5',
          'shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
        ],
        strong: [
          'bg-white/85 dark:bg-slate-900/85',
          'backdrop-blur-[30px]',
          'border border-white/60 dark:border-white/15',
          'shadow-[0_12px_40px_rgba(0,0,0,0.15)]',
          'dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
        ],
        frosted: [
          'bg-white/90 dark:bg-slate-900/90',
          'backdrop-blur-[40px] saturate-[220%]',
          'border border-white/70 dark:border-white/20',
          'shadow-[0_16px_48px_rgba(0,0,0,0.18)]',
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
        true: 'hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] cursor-pointer',
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
