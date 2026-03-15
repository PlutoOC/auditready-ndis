import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  'animate-pulse bg-slate-200/70 dark:bg-slate-700/50 rounded-md',
  {
    variants: {
      variant: {
        default: '',
        glass: [
          'bg-white/30 dark:bg-slate-800/30',
          'backdrop-blur-sm',
        ],
        shimmer: [
          'relative overflow-hidden',
          'bg-slate-200/50 dark:bg-slate-700/30',
          'before:absolute before:inset-0',
          'before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent',
          'before:animate-[shimmer_2s_infinite]',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), className)}
        style={{
          width,
          height,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Pre-built skeleton patterns
const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('space-y-3 p-4', className)}>
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-20 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-4"
        style={{ width: i === lines - 1 ? '75%' : '100%' }}
      />
    ))}
  </div>
);

const SkeletonAvatar = ({ size = 40 }: { size?: number }) => (
  <Skeleton
    className="rounded-full"
    width={size}
    height={size}
  />
);

export { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar };
