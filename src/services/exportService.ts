/**
 * Export Service for AuditReady NDIS
 * Handles PDF, DOCX, Compliance Reports, and Evidence ZIP exports
 */

import { supabase } from '@/lib/supabase';

// Export options interface for future use
// interface ExportOptions {
//   organizationId: string;
//   format: 'pdf' | 'docx' | 'html';
//   includeEvidence?: boolean;
//   moduleIds?: string[];
//   dateRange?: { start: string; end: string };
// }

interface ComplianceReportData {
  organization: {
    name: string;
    abn: string;
    address: string;
    phone: string;
    email: string;
  };
  generatedAt: string;
  summary: {
    totalModules: number;
    completedModules: number;
    totalQIs: number;
    completedQIs: number;
    complianceScore: number;
    evidenceCount: number;
  };
  modules: Array<{
    code: string;
    name: string;
    description: string;
    outcomes: Array<{
      code: string;
      name: string;
      qualityIndicators: Array<{
        code: string;
        title: string;
        description: string;
        response: string;
        status: 'draft' | 'completed';
        evidenceCount: number;
      }>;
    }>;
  }>;
}

// Evidence file interface for future use
// interface EvidenceFile {
//   id: string;
//   file_name: string;
//   file_path: string;
//   file_type: string;
//   file_size: number;
//   created_at: string;
//   qualityIndicators?: string[];
// }

/**
 * Generate a compliance report with all self-assessment data
 */
export async function generateComplianceReport(
  organizationId: string
): Promise<ComplianceReportData> {
  // Fetch organization details
  const { data: orgData } = await supabase
    .from('organizations')
    .select('name, abn, address, phone, email')
    .eq('id', organizationId)
    .single();

  // Fetch all modules with outcomes and QIs
  const { data: modulesData } = await supabase
    .from('modules')
    .select('*')
    .order('display_order');

  const modules: ComplianceReportData['modules'] = [];
  let totalQIs = 0;
  let completedQIs = 0;

  for (const module of modulesData || []) {
    const { data: outcomesData } = await supabase
      .from('outcomes')
      .select('*')
      .eq('module_id', module.id)
      .order('code');

    const outcomes: ComplianceReportData['modules'][0]['outcomes'] = [];

    for (const outcome of outcomesData || []) {
      const { data: qisData } = await supabase
        .from('quality_indicators')
        .select('*')
        .eq('outcome_id', outcome.id)
        .order('code');

      const qualityIndicators: ComplianceReportData['modules'][0]['outcomes'][0]['qualityIndicators'] = [];

      for (const qi of qisData || []) {
        totalQIs++;

        // Fetch response for this QI
        const { data: responseData } = await supabase
          .from('self_assessment_responses')
          .select('response_text, status')
          .eq('quality_indicator_id', qi.id)
          .eq('organization_id', organizationId)
          .single();

        // Fetch evidence count
        const { count: evidenceCount } = await supabase
          .from('evidence_qi_mappings')
          .select('*', { count: 'exact', head: true })
          .eq('quality_indicator_id', qi.id);

        if (responseData?.status === 'completed') {
          completedQIs++;
        }

        qualityIndicators.push({
          code: qi.code,
          title: qi.title,
          description: qi.description,
          response: responseData?.response_text || '',
          status: responseData?.status || 'draft',
          evidenceCount: evidenceCount || 0,
        });
      }

      outcomes.push({
        code: outcome.code,
        name: outcome.name,
        qualityIndicators,
      });
    }

    modules.push({
      code: module.code,
      name: module.name,
      description: module.description,
      outcomes,
    });
  }

  // Get evidence count
  const { count: evidenceCount } = await supabase
    .from('evidence_files')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  return {
    organization: {
      name: orgData?.name || '',
      abn: orgData?.abn || '',
      address: orgData?.address || '',
      phone: orgData?.phone || '',
      email: orgData?.email || '',
    },
    generatedAt: new Date().toISOString(),
    summary: {
      totalModules: modules.length,
      completedModules: modules.filter((m) =>
        m.outcomes.every((o) =>
          o.qualityIndicators.every((qi) => qi.status === 'completed')
        )
      ).length,
      totalQIs,
      completedQIs,
      complianceScore: totalQIs > 0 ? Math.round((completedQIs / totalQIs) * 100) : 0,
      evidenceCount: evidenceCount || 0,
    },
    modules,
  };
}

/**
 * Export compliance report as PDF
 */
export async function exportToPDF(
  organizationId: string,
  _filename?: string
): Promise<Blob> {
  const reportData = await generateComplianceReport(organizationId);

  // Generate HTML content for PDF
  const htmlContent = generateReportHTML(reportData);

  // For now, return as HTML blob (in production, use a PDF library like jsPDF or puppeteer)
  return new Blob([htmlContent], { type: 'text/html' });
}

/**
 * Export compliance report as DOCX
 */
export async function exportToDOCX(
  organizationId: string,
  _filename?: string
): Promise<Blob> {
  const reportData = await generateComplianceReport(organizationId);

  // Generate markdown content (can be converted to DOCX)
  const markdownContent = generateReportMarkdown(reportData);

  return new Blob([markdownContent], { type: 'text/markdown' });
}

/**
 * Export all evidence files as a ZIP archive
 */
export async function exportEvidenceZIP(
  organizationId: string
): Promise<Blob> {
  // Fetch all evidence files for the organization
  const { data: evidenceFiles } = await supabase
    .from('evidence_files')
    .select('*')
    .eq('organization_id', organizationId);

  if (!evidenceFiles || evidenceFiles.length === 0) {
    throw new Error('No evidence files found');
  }

  // Create a ZIP file using JSZip (would need to be added as a dependency)
  // For now, return a placeholder
  const zipContent = JSON.stringify({
    message: 'Evidence export',
    files: evidenceFiles.map((f) => ({
      name: f.file_name,
      size: f.file_size,
      path: f.file_path,
    })),
  });

  return new Blob([zipContent], { type: 'application/json' });
}

/**
 * Generate a summary compliance report
 */
export async function generateSummaryReport(
  organizationId: string
): Promise<string> {
  const reportData = await generateComplianceReport(organizationId);

  return `
NDIS PRACTICE STANDARDS COMPLIANCE REPORT
==========================================

Organization: ${reportData.organization.name}
ABN: ${reportData.organization.abn}
Generated: ${new Date(reportData.generatedAt).toLocaleDateString('en-AU')}

SUMMARY
-------
Total Modules: ${reportData.summary.totalModules}
Completed Modules: ${reportData.summary.completedModules}
Total Quality Indicators: ${reportData.summary.totalQIs}
Completed QIs: ${reportData.summary.completedQIs}
Compliance Score: ${reportData.summary.complianceScore}%
Evidence Files: ${reportData.summary.evidenceCount}

MODULE BREAKDOWN
----------------
${reportData.modules
  .map(
    (m) => `
${m.code}: ${m.name}
${m.outcomes
  .map(
    (o) => `
  ${o.code}: ${o.name}
  ${o.qualityIndicators
    .map(
      (qi) => `
    ${qi.code}: ${qi.title}
    Status: ${qi.status}
    Evidence: ${qi.evidenceCount} files
  `
    )
    .join('')}
`
  )
  .join('')}
`
  )
  .join('')}
`;
}

/**
 * Generate HTML report for PDF export
 */
function generateReportHTML(data: ComplianceReportData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Compliance Report - ${data.organization.name}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
    h2 { color: #7c3aed; margin-top: 30px; }
    h3 { color: #555; }
    .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .summary-item { text-align: center; }
    .summary-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
    .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .module { margin: 30px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
    .outcome { margin: 20px 0; padding-left: 20px; border-left: 3px solid #c4b5fd; }
    .qi { margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 6px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .response { margin-top: 10px; padding: 10px; background: white; border-radius: 4px; font-style: italic; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <h1>NDIS Practice Standards Compliance Report</h1>
  
  <div class="summary">
    <h2>Organization Details</h2>
    <p><strong>Name:</strong> ${data.organization.name}</p>
    <p><strong>ABN:</strong> ${data.organization.abn}</p>
    <p><strong>Address:</strong> ${data.organization.address}</p>
    <p><strong>Phone:</strong> ${data.organization.phone}</p>
    <p><strong>Email:</strong> ${data.organization.email}</p>
    <p><strong>Report Generated:</strong> ${new Date(data.generatedAt).toLocaleDateString('en-AU')}</p>
  </div>

  <div class="summary">
    <h2>Compliance Summary</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-value">${data.summary.complianceScore}%</div>
        <div class="summary-label">Compliance Score</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${data.summary.completedQIs}/${data.summary.totalQIs}</div>
        <div class="summary-label">QIs Completed</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${data.summary.evidenceCount}</div>
        <div class="summary-label">Evidence Files</div>
      </div>
    </div>
  </div>

  <h2>Detailed Assessment</h2>
  
  ${data.modules
    .map(
      (module) => `
    <div class="module">
      <h3>${module.code}: ${module.name}</h3>
      <p>${module.description}</p>
      
      ${module.outcomes
        .map(
          (outcome) => `
        <div class="outcome">
          <h4>${outcome.code}: ${outcome.name}</h4>
          
          ${outcome.qualityIndicators
            .map(
              (qi) => `
            <div class="qi">
              <strong>${qi.code}: ${qi.title}</strong>
              <span class="status status-${qi.status}">${qi.status}</span>
              <p><small>${qi.description}</small></p>
              ${qi.response ? `<div class="response">${qi.response}</div>` : '<p><em>No response provided</em></p>'}
              <p><small>Evidence files: ${qi.evidenceCount}</small></p>
            </div>
          `
            )
            .join('')}
        </div>
      `
        )
        .join('')}
    </div>
  `
    )
    .join('')}

  <div class="footer">
    <p>Generated by AuditReady NDIS Compliance Platform</p>
    <p>This report is confidential and intended for the registered organization only.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate Markdown report for DOCX export
 */
function generateReportMarkdown(data: ComplianceReportData): string {
  return `# NDIS Practice Standards Compliance Report

## Organization Details

- **Name:** ${data.organization.name}
- **ABN:** ${data.organization.abn}
- **Address:** ${data.organization.address}
- **Phone:** ${data.organization.phone}
- **Email:** ${data.organization.email}
- **Report Generated:** ${new Date(data.generatedAt).toLocaleDateString('en-AU')}

## Compliance Summary

| Metric | Value |
|--------|-------|
| Compliance Score | ${data.summary.complianceScore}% |
| QIs Completed | ${data.summary.completedQIs}/${data.summary.totalQIs} |
| Evidence Files | ${data.summary.evidenceCount} |
| Modules Completed | ${data.summary.completedModules}/${data.summary.totalModules} |

## Detailed Assessment

${data.modules
  .map(
    (module) => `
### ${module.code}: ${module.name}

${module.description}

${module.outcomes
  .map(
    (outcome) => `
#### ${outcome.code}: ${outcome.name}

${outcome.qualityIndicators
  .map(
    (qi) => `
**${qi.code}: ${qi.title}**

- Status: ${qi.status}
- Evidence: ${qi.evidenceCount} files

${qi.description}

${qi.response ? `**Response:**\n${qi.response}` : '*No response provided*'}
`
  )
  .join('\n---\n')}
`
  )
  .join('\n')}
`
  )
  .join('\n---\n')}

---

*Generated by AuditReady NDIS Compliance Platform*
*This report is confidential and intended for the registered organization only.*
`;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export module responses to PDF
 */
export async function exportModuleToPDF(
  moduleId: string,
  organizationId: string
): Promise<Blob> {
  const { data: moduleData } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .single();

  if (!moduleData) {
    throw new Error('Module not found');
  }

  const { data: orgData } = await supabase
    .from('organizations')
    .select('name, abn')
    .eq('id', organizationId)
    .single();

  // Fetch module-specific data
  const { data: outcomesData } = await supabase
    .from('outcomes')
    .select('*')
    .eq('module_id', moduleId)
    .order('code');

  const outcomes: Array<{
    code: string;
    name: string;
    qualityIndicators: Array<{
      code: string;
      title: string;
      response: string;
      status: string;
    }>;
  }> = [];

  for (const outcome of outcomesData || []) {
    const { data: qisData } = await supabase
      .from('quality_indicators')
      .select('*')
      .eq('outcome_id', outcome.id)
      .order('code');

    const qualityIndicators = [];
    for (const qi of qisData || []) {
      const { data: responseData } = await supabase
        .from('self_assessment_responses')
        .select('response_text, status')
        .eq('quality_indicator_id', qi.id)
        .eq('organization_id', organizationId)
        .single();

      qualityIndicators.push({
        code: qi.code,
        title: qi.title,
        response: responseData?.response_text || '',
        status: responseData?.status || 'draft',
      });
    }

    outcomes.push({
      code: outcome.code,
      name: outcome.name,
      qualityIndicators,
    });
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${moduleData.name} - Module Report</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #4f46e5; }
    h2 { color: #7c3aed; margin-top: 30px; }
    .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .outcome { margin: 20px 0; }
    .qi { margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 6px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .response { margin-top: 10px; padding: 10px; background: white; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${moduleData.code}: ${moduleData.name}</h1>
    <p>${moduleData.description}</p>
    <p><strong>Organization:</strong> ${orgData?.name || 'N/A'}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-AU')}</p>
  </div>

  ${outcomes
    .map(
      (outcome) => `
    <div class="outcome">
      <h2>${outcome.code}: ${outcome.name}</h2>
      
      ${outcome.qualityIndicators
        .map(
          (qi) => `
        <div class="qi">
          <strong>${qi.code}: ${qi.title}</strong>
          <span class="status status-${qi.status}">${qi.status}</span>
          ${qi.response ? `<div class="response">${qi.response}</div>` : '<p><em>No response provided</em></p>'}
        </div>
      `
        )
        .join('')}
    </div>
  `
    )
    .join('')}
</body>
</html>
  `;

  return new Blob([htmlContent], { type: 'text/html' });
}

export default {
  generateComplianceReport,
  exportToPDF,
  exportToDOCX,
  exportEvidenceZIP,
  generateSummaryReport,
  exportModuleToPDF,
  downloadBlob,
};
