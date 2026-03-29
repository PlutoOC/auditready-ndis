-- Phase 2: Simple audit tracking tables

CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    audit_date DATE NOT NULL,
    auditor_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_audits_org_id ON audits(organization_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);

CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    standard_id UUID REFERENCES practice_standards(id) ON DELETE SET NULL,
    severity TEXT NOT NULL CHECK (severity IN ('pass', 'minor', 'major', 'critical')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_audit_findings_audit_id ON audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_standard_id ON audit_findings(standard_id);

CREATE TABLE IF NOT EXISTS audit_standards (
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    standard_id UUID NOT NULL REFERENCES practice_standards(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'fail' CHECK (status IN ('pass', 'fail')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (audit_id, standard_id)
);

CREATE INDEX IF NOT EXISTS idx_audit_standards_standard_id ON audit_standards(standard_id);
