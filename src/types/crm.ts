// CRM Types for AuditReady NDIS

export type LeadStage = 
  | 'new_lead' 
  | 'contacted' 
  | 'demo_scheduled' 
  | 'demo_done' 
  | 'trial_started' 
  | 'converted' 
  | 'paused';

export type LeadSource = 
  | 'ndis_register' 
  | 'referral' 
  | 'event' 
  | 'cold_outreach' 
  | 'website' 
  | 'other';

export type ActivityType = 'call' | 'email' | 'demo' | 'note';

export interface Lead {
  id: string;
  organization_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  stage: LeadStage;
  notes?: string;
  demo_scheduled_at?: string;
  trial_started_at?: string;
  trial_ends_at?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  type: ActivityType;
  description: string;
  created_at: string;
  created_by?: string;
}

export interface LeadWithActivities extends Lead {
  activities: Activity[];
}

export interface CRMStats {
  stage: LeadStage;
  count: number;
}

export const STAGE_LABELS: Record<LeadStage, string> = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  demo_scheduled: 'Demo Scheduled',
  demo_done: 'Demo Done',
  trial_started: 'Trial Started',
  converted: 'Converted',
  paused: 'Paused'
};

export const STAGE_COLORS: Record<LeadStage, string> = {
  new_lead: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  demo_scheduled: 'bg-yellow-100 text-yellow-800',
  demo_done: 'bg-orange-100 text-orange-800',
  trial_started: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  paused: 'bg-red-100 text-red-800'
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  ndis_register: 'NDIS Register',
  referral: 'Referral',
  event: 'Event',
  cold_outreach: 'Cold Outreach',
  website: 'Website',
  other: 'Other'
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  call: 'Call',
  email: 'Email',
  demo: 'Demo',
  note: 'Note'
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  call: '📞',
  email: '✉️',
  demo: '🎥',
  note: '📝'
};
