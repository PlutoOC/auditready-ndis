import React from 'react';
import { cn } from '@/lib/utils';
import type { LeadSource } from '@/types/crm';
import { SOURCE_LABELS } from '@/types/crm';

interface SourceBadgeProps {
  source: LeadSource;
  className?: string;
  size?: 'sm' | 'md';
}

const sourceColors: Record<LeadSource, string> = {
  ndis_register: 'bg-indigo-100 text-emerald-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  referral: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  event: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  cold_outreach: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  website: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  className,
  size = 'md',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sourceColors[source],
        sizeClasses[size],
        className
      )}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
};
