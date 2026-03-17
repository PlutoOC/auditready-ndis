import React from 'react';
import { cn } from '@/lib/utils';
import { LeadStage, STAGE_LABELS, STAGE_COLORS } from '@/types/crm';

interface StageBadgeProps {
  stage: LeadStage;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const StageBadge: React.FC<StageBadgeProps> = ({
  stage,
  className,
  size = 'md',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium text-white',
        STAGE_COLORS[stage],
        sizeClasses[size],
        className
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
};
