// Evidence suggestions for each QI type
// This helps providers know what documents to upload

export const evidenceSuggestions: Record<string, string[]> = {
  // CORE MODULE - Rights and Responsibilities
  'CORE-01-01': [
    'Participant intake/assessment forms',
    'Individual support plans showing preferences',
    'Participant feedback survey results',
    'Staff training records on person-centred care',
    'Meeting minutes with participants/families'
  ],
  'CORE-01-02': [
    'Cultural competency policy',
    'Cultural assessment forms',
    'Staff cultural training records',
    'Examples of culturally adapted services',
    'Participant cultural preference records'
  ],
  'CORE-02-01': [
    'Governance structure/org chart',
    'Management meeting minutes',
    'Decision-making policies',
    'Conflict of interest declarations',
    'Participant advisory group records'
  ],
  'CORE-02-02': [
    'Risk management policy',
    'Risk register/assessment forms',
    'Incident reports and investigations',
    'Staff risk training records',
    'Business continuity plan'
  ],
  'CORE-02-03': [
    'Quality management system documentation',
    'Internal audit reports',
    'Continuous improvement plan',
    'Quality indicators dashboard',
    'Management review meeting minutes'
  ],
  
  // VERIFICATION MODULE
  'VER-01-01': [
    'HR policy and procedures',
    'Recruitment process documentation',
    'Police check records',
    'Reference check forms',
    'Staff induction/training records'
  ],
  'VER-02-01': [
    'Incident management policy',
    'Incident report forms',
    'Incident register/log',
    'Investigation procedures',
    'Staff incident training records'
  ],
  'VER-03-01': [
    'Complaints policy and procedure',
    'Complaints register',
    'Complaint resolution records',
    'Staff complaints training',
    'Complaints analysis reports'
  ],
  'VER-04-01': [
    'Risk assessment policy',
    'Risk management framework',
    'Risk registers',
    'Risk mitigation plans',
    'Risk review meeting minutes'
  ],
  
  // CORE MODULE - Provision of Supports
  'CORE-03-01': [
    'Access and equity policy',
    'Waiting list management procedure',
    'Service eligibility criteria',
    'Referral pathway documentation',
    'Access timeframes records'
  ],
  'CORE-03-02': [
    'Support planning templates',
    'Goal setting documentation',
    'Participant review meeting records',
    'Plan implementation records',
    'Outcome measurement tools'
  ],
  'CORE-03-03': [
    'Service agreement templates',
    'Consent forms',
    'Terms and conditions',
    'Agreement review records',
    'Complaints about agreements'
  ],
  
  // CORE MODULE - Supports Environment
  'CORE-04-01': [
    'Workplace health and safety policy',
    'Risk assessment forms',
    'Safety inspection checklists',
    'Incident reports',
    'Emergency procedures'
  ],
  'CORE-04-02': [
    'Participant money handling policy',
    'Financial transaction records',
    'Property management procedures',
    'Receipt and banking records',
    'Financial audit reports'
  ],
  
  // MODULE 1 - High Intensity
  'MOD1-01-01': [
    'Complex bowel care procedure',
    'Staff competency assessments',
    'Medical clearance forms',
    'Care plan documentation',
    'Incident/near miss records'
  ],
  'MOD1-02-01': [
    'Enteral feeding protocol',
    'Dietitian consultation records',
    'Feeding chart templates',
    'Equipment maintenance logs',
    'Staff training certificates'
  ],
  
  // MODULE 2 - Behaviour Support
  'MOD2-01-01': [
    'Behaviour support policy',
    'Positive behaviour support plans',
    'Functional behaviour assessments',
    'Behaviour incident records',
    'Restrictive practice authorisations'
  ],
  'MOD2-02-01': [
    'Restrictive practice policy',
    'Authorisation records',
    'Monitoring and review forms',
    'Incident reports',
    'Alternative strategies documentation'
  ],
  
  // Default suggestions for any QI
  'DEFAULT': [
    'Relevant policy and procedure',
    'Staff training records',
    'Forms/templates used',
    'Meeting minutes',
    'Participant feedback',
    'Audit/review reports'
  ]
};

// Get suggestions for a QI
export function getEvidenceSuggestions(qiCode: string): string[] {
  return evidenceSuggestions[qiCode] || evidenceSuggestions['DEFAULT'];
}

// Get suggestions with category
export function getCategorizedSuggestions(qiCode: string) {
  const suggestions = getEvidenceSuggestions(qiCode);
  
  return {
    policies: suggestions.filter(s => 
      s.toLowerCase().includes('policy') || 
      s.toLowerCase().includes('procedure')
    ),
    forms: suggestions.filter(s => 
      s.toLowerCase().includes('form') || 
      s.toLowerCase().includes('template')
    ),
    records: suggestions.filter(s => 
      s.toLowerCase().includes('record') || 
      s.toLowerCase().includes('register') ||
      s.toLowerCase().includes('log')
    ),
    training: suggestions.filter(s => 
      s.toLowerCase().includes('training')
    ),
    other: suggestions.filter(s => 
      !s.toLowerCase().includes('policy') &&
      !s.toLowerCase().includes('procedure') &&
      !s.toLowerCase().includes('form') &&
      !s.toLowerCase().includes('template') &&
      !s.toLowerCase().includes('record') &&
      !s.toLowerCase().includes('register') &&
      !s.toLowerCase().includes('log') &&
      !s.toLowerCase().includes('training')
    )
  };
}
