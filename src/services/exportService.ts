/**
 * Export Service for AuditReady NDIS
 * Handles PDF, DOCX, Compliance Reports, and Evidence ZIP exports
 */

import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const doc = buildCompliancePdf(reportData);
  return doc.output('blob');
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

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let cursorY = 60;

  doc.setFontSize(18);
  doc.text(`${moduleData.code}: ${moduleData.name}`, 40, cursorY);
  cursorY += 18;
  doc.setFontSize(11);
  doc.text(`Organization: ${orgData?.name || 'N/A'}`, 40, cursorY);
  cursorY += 14;
  doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, 40, cursorY);
  cursorY += 24;

  for (const outcome of outcomes) {
    if (cursorY > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage();
      cursorY = 60;
    }
    doc.setFontSize(14);
    doc.text(`${outcome.code}: ${outcome.name}`, 40, cursorY);
    cursorY += 12;

    const rows = outcome.qualityIndicators.map((qi) => [
      `${qi.code} ${qi.title}`,
      qi.status,
      qi.response ? doc.splitTextToSize(qi.response, 240) : '—',
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [['Quality Indicator', 'Status', 'Response']],
      body: rows,
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 180 },
        1: { cellWidth: 60, halign: 'center' },
        2: { cellWidth: 240 },
      },
      theme: 'grid',
      margin: { left: 40, right: 40 },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 20;
  }

  return doc.output('blob');
}

function buildCompliancePdf(data: ComplianceReportData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let cursorY = 60;

  doc.setFontSize(18);
  doc.text('NDIS Practice Standards Compliance Report', 40, cursorY);
  cursorY += 24;

  doc.setFontSize(11);
  doc.text(`Organization: ${data.organization.name}`, 40, cursorY);
  cursorY += 14;
  doc.text(`Generated: ${new Date(data.generatedAt).toLocaleDateString('en-AU')}`, 40, cursorY);
  cursorY += 20;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: 40, right: 40 },
    head: [['Metric', 'Value']],
    body: [
      ['Compliance Score', `${data.summary.complianceScore}%`],
      ['Completed QIs', `${data.summary.completedQIs}/${data.summary.totalQIs}`],
      ['Evidence Files', `${data.summary.evidenceCount}`],
      ['Modules Completed', `${data.summary.completedModules}/${data.summary.totalModules}`],
    ],
    styles: { fontSize: 10 },
    theme: 'grid',
  });

  cursorY = (doc as any).lastAutoTable.finalY + 24;

  for (const module of data.modules) {
    if (cursorY > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage();
      cursorY = 60;
    }

    doc.setFontSize(14);
    doc.text(`${module.code}: ${module.name}`, 40, cursorY);
    cursorY += 12;

    doc.setFontSize(10);
    const description = doc.splitTextToSize(module.description || '', 520);
    doc.text(description, 40, cursorY);
    cursorY += description.length * 12 + 8;

    for (const outcome of module.outcomes) {
      if (cursorY > doc.internal.pageSize.getHeight() - 120) {
        doc.addPage();
        cursorY = 60;
      }

      doc.setFontSize(12);
      doc.text(`${outcome.code}: ${outcome.name}`, 40, cursorY);
      cursorY += 12;

      const rows = outcome.qualityIndicators.map((qi) => [
        `${qi.code} ${qi.title}`,
        qi.status,
        `${qi.evidenceCount}`,
        qi.response ? doc.splitTextToSize(qi.response, 200) : doc.splitTextToSize(qi.description || '—', 200),
      ]);

      autoTable(doc, {
        startY: cursorY,
        margin: { left: 40, right: 40 },
        head: [['Quality Indicator', 'Status', 'Evidence', 'Response']],
        body: rows,
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 180 },
          1: { cellWidth: 60, halign: 'center' },
          2: { cellWidth: 60, halign: 'center' },
          3: { cellWidth: 180 },
        },
        theme: 'grid',
      });

      cursorY = (doc as any).lastAutoTable.finalY + 20;
    }
  }

  return doc;
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
