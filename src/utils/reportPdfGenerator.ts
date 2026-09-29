import { jsPDF } from 'jspdf';
import { WorkshopSettings } from '../types';

export interface ReportColumn {
  header: string;
  key: string;
  width: number; // in mm
  align?: 'left' | 'center' | 'right';
  format?: (val: any, row: any) => string;
}

export interface ReportSummaryItem {
  label: string;
  value: string;
}

export interface GenerateReportPdfOptions {
  title: string;
  dateRangeText?: string;
  filtersText?: string;
  columns: ReportColumn[];
  rows: any[];
  summary?: ReportSummaryItem[];
  settings: WorkshopSettings;
  filenamePrefix?: string;
}

/**
 * Reusable Multi-Page Report PDF Engine using jsPDF.
 * Follows exact reporting requirements:
 * - Proper A4 margins and multi-page header/footer pagination
 * - Repeating column headers on every new page
 * - Logo support, date range, timestamp, and active filter tags
 * - Real Blob download with exact filename format (e.g. Sales-Report-2026-09-28.pdf)
 */
export const generateReportPdf = (options: GenerateReportPdfOptions): string => {
  const {
    title,
    dateRangeText = 'All Records',
    filtersText = 'None',
    columns,
    rows,
    summary = [],
    settings,
    filenamePrefix = 'Report',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 12;
  const marginRight = 12;
  const contentWidth = pageWidth - marginLeft - marginRight; // 186mm
  const marginBottom = 18;

  const primaryColor: [number, number, number] = [217, 119, 6]; // Amber-600
  const darkColor: [number, number, number] = [15, 23, 42]; // Slate-900
  const grayColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate-50

  let currentY = 12;

  // Render Report Header
  const renderHeader = (isFirstPage: boolean) => {
    // Dark top strip
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, pageWidth, isFirstPage ? 32 : 14, 'F');

    if (isFirstPage) {
      // Business Logo or Initial Badge
      let logoDrawn = false;
      if (settings?.logoUrl) {
        try {
          doc.addImage(settings.logoUrl, 'PNG', marginLeft, 6, 20, 20);
          logoDrawn = true;
        } catch (e) {
          logoDrawn = false;
        }
      }

      const textStartX = logoDrawn ? marginLeft + 24 : marginLeft;

      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text((settings?.workshopName || 'ADVANCE AUTO WORKSHOP').toUpperCase(), textStartX, 13);

      doc.setTextColor(226, 232, 240);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const contact = `${settings?.address || 'Industrial Hub'}, ${settings?.city || ''} | Tel: ${settings?.phone || ''} | Tax: ${settings?.taxNumber || 'TAX-9948210'}`;
      doc.text(contact, textStartX, 19);

      // Report Title Banner on Right
      doc.setFillColor(245, 158, 11);
      doc.roundedRect(pageWidth - marginRight - 65, 6, 65, 20, 2, 2, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(title.toUpperCase(), pageWidth - marginRight - 32.5, 14, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(dateRangeText, pageWidth - marginRight - 32.5, 20, { align: 'center' });

      currentY = 38;

      // Metadata card: Generation Timestamp + Filters
      doc.setFillColor(...lightBg);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginLeft, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text('Generated Date/Time:', marginLeft + 4, currentY + 5);
      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date().toLocaleString(), marginLeft + 36, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...grayColor);
      doc.text('Applied Filters:', marginLeft + 4, currentY + 9.5);
      doc.setTextColor(...darkColor);
      doc.text(filtersText, marginLeft + 26, currentY + 9.5);

      doc.setTextColor(...grayColor);
      doc.text(`Total Records: ${rows.length}`, pageWidth - marginRight - 4, currentY + 7, { align: 'right' });

      currentY += 16;
    } else {
      // Subsequent page mini header
      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${(settings?.workshopName || 'ADVANCE AUTO WORKSHOP').toUpperCase()} — ${title.toUpperCase()}`, marginLeft, 9);
      doc.setTextColor(203, 213, 225);
      doc.setFontSize(8);
      doc.text(dateRangeText, pageWidth - marginRight, 9, { align: 'right' });

      currentY = 20;
    }
  };

  // Render Table Column Headers
  const renderTableHeaders = () => {
    doc.setFillColor(...darkColor);
    doc.rect(marginLeft, currentY, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);

    let colX = marginLeft;
    columns.forEach(col => {
      let textX = colX + 2;
      if (col.align === 'right') {
        textX = colX + col.width - 2;
      } else if (col.align === 'center') {
        textX = colX + col.width / 2;
      }
      doc.text(col.header.toUpperCase(), textX, currentY + 4.8, { align: col.align || 'left' });
      colX += col.width;
    });

    currentY += 7;
  };

  // First page setup
  renderHeader(true);
  renderTableHeaders();

  // Render Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  rows.forEach((row, rowIdx) => {
    // Check if new page is needed
    if (currentY + 8 > pageHeight - marginBottom) {
      doc.addPage();
      renderHeader(false);
      renderTableHeaders();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
    }

    // Row alternating background
    if (rowIdx % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(marginLeft, currentY, contentWidth, 6.5, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(marginLeft, currentY + 6.5, marginLeft + contentWidth, currentY + 6.5);

    let colX = marginLeft;
    columns.forEach(col => {
      let rawVal = row[col.key];
      let displayVal = col.format ? col.format(rawVal, row) : String(rawVal ?? '-');

      // truncate to fit column
      const maxChars = Math.floor(col.width * 0.48);
      if (displayVal.length > maxChars) {
        displayVal = displayVal.substring(0, maxChars - 2) + '..';
      }

      let textX = colX + 2;
      if (col.align === 'right') {
        textX = colX + col.width - 2;
      } else if (col.align === 'center') {
        textX = colX + col.width / 2;
      }

      doc.setTextColor(...darkColor);
      doc.text(displayVal, textX, currentY + 4.5, { align: col.align || 'left' });
      colX += col.width;
    });

    currentY += 6.5;
  });

  currentY += 4;

  // Render Summary Cards if room allows, otherwise add page
  if (summary.length > 0) {
    if (currentY + 22 > pageHeight - marginBottom) {
      doc.addPage();
      renderHeader(false);
    }

    doc.setFillColor(...lightBg);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginLeft, currentY, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('EXECUTIVE FINANCIAL & OPERATIONAL SUMMARY', marginLeft + 4, currentY + 5);

    const itemWidth = contentWidth / summary.length;
    let sumX = marginLeft;
    summary.forEach((item, sIdx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...grayColor);
      doc.text(item.label, sumX + 4, currentY + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...darkColor);
      doc.text(item.value, sumX + 4, currentY + 15);

      sumX += itemWidth;
      if (sIdx < summary.length - 1) {
        doc.setDrawColor(226, 232, 240);
        doc.line(sumX, currentY + 7, sumX, currentY + 16);
      }
    });

    currentY += 24;
  }

  // Footer & Pagination across all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    doc.setDrawColor(226, 232, 240);
    doc.line(marginLeft, pageHeight - 12, pageWidth - marginRight, pageHeight - 12);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...grayColor);
    doc.text('Generated by ADVANCE AUTO WORKSHOP ERP System', marginLeft, pageHeight - 7);

    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginRight, pageHeight - 7, { align: 'right' });
  }

  // Generate Filename
  const dateStr = new Date().toISOString().split('T')[0];
  const safeTitle = filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '-');
  const filename = `${safeTitle}-${dateStr}.pdf`;

  // Trigger real Blob download
  try {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch (err) {
    console.warn('Fallback to doc.save:', err);
    doc.save(filename);
  }

  return filename;
};

/**
 * Universal CSV / Excel Export Generator.
 * Prepends UTF-8 BOM so Excel opens international symbols and currency symbols cleanly.
 */
export const exportDataToCsv = (
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void => {
  const formatCell = (cell: any) => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    headers.map(formatCell).join(','),
    ...rows.map(row => row.map(formatCell).join(','))
  ];

  // \uFEFF is UTF-8 Byte Order Mark for Excel compatibility
  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
