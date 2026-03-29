export type AuditStatus = 'in_progress' | 'completed';
export type AuditSeverity = 'pass' | 'minor' | 'major' | 'critical';

export interface Audit {
  id: string;
  organization_id: string;
  name: string;
  audit_date: string;
  auditor_name: string;
  status: AuditStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PracticeStandard {
  id: string;
  code?: string | null;
  title?: string | null;
  domain?: string | null;
  name?: string | null;
}

export type StandardResult = 'pass' | 'fail';

export interface AuditStandardReview {
  audit_id: string;
  standard_id: string;
  status: StandardResult;
  standard?: PracticeStandard | null;
}

export interface AuditFinding {
  id: string;
  audit_id: string;
  description: string;
  standard_id: string | null;
  severity: AuditSeverity;
  notes?: string | null;
  created_at: string;
  standard?: PracticeStandard | null;
}

export interface AuditDetail extends Audit {
  standards: AuditStandardReview[];
  findings: AuditFinding[];
}

export interface CreateAuditPayload {
  name: string;
  auditDate: string;
  auditorName: string;
  standardIds: string[];
  notes?: string;
}

export interface UpdateAuditPayload {
  name: string;
  auditDate: string;
  auditorName: string;
  notes?: string;
}

export interface FindingPayload {
  description: string;
  standardId: string | null;
  severity: AuditSeverity;
  notes?: string;
}
