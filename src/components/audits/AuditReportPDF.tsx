import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Audit, AuditFinding, AuditStandardReview } from '@/types/audits';

interface AuditReportPDFProps {
  audit: Audit;
  standards: AuditStandardReview[];
  findings: AuditFinding[];
}

export function AuditReportPDF({ audit, standards, findings }: AuditReportPDFProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    const formatter = new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.setFontSize(18);
    doc.text('Audit Summary Report', 14, 20);

    doc.setFontSize(12);
    doc.text(`Audit: ${audit.name}`, 14, 32);
    doc.text(`Auditor: ${audit.auditor_name || 'Not set'}`, 14, 40);
    doc.text(`Audit Date: ${audit.audit_date ? formatter.format(new Date(`${audit.audit_date}T00:00:00Z`)) : 'Not set'}`, 14, 48);
    doc.text(`Status: ${audit.status === 'completed' ? 'Completed' : 'In Progress'}`, 14, 56);

    if (audit.notes) {
      const lines = doc.splitTextToSize(`Notes: ${audit.notes}`, 180);
      doc.text(lines, 14, 66);
    }

    autoTable(doc, {
      head: [['Standard', 'Result']],
      body: standards.map((standard) => [
        `${standard.standard?.code || ''} ${standard.standard?.title || ''}`.trim() || 'Standard',
        standard.status === 'pass' ? 'Pass' : 'Fail',
      ]),
      startY: audit.notes ? 80 : 70,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    const afterStandardsY = (doc as any).lastAutoTable?.finalY || 100;

    if (findings.length) {
      autoTable(doc, {
        head: [['Severity', 'Description', 'Standard']],
        body: findings.map((finding) => [
          finding.severity,
          finding.description,
          finding.standard?.code || finding.standard?.title || '—',
        ]),
        startY: afterStandardsY + 10,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [51, 65, 85] },
      });
    }

    const filename = `${audit.name || 'audit'}-report`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    doc.save(`${filename || 'audit-report'}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
    >
      Export PDF
    </button>
  );
}
