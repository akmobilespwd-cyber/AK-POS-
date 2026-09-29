import { jsPDF } from 'jspdf';
import { Invoice, JobCard, Payment, Customer, Vehicle, Mechanic, WorkshopSettings } from '../types';
import { formatCurrency } from './currencyFormatter';

/**
 * Downloads a real PDF for an Invoice using jsPDF.
 * Follows exact required flow:
 * 1. Generate real invoice document in jsPDF.
 * 2. Convert to actual PDF Blob.
 * 3. Create temporary Blob URL.
 * 4. Create actual download <a> link.
 * 5. Set correct filename (e.g. ADVANCE-AUTO-WORKSHOP-INV-2026-000123.pdf).
 * 6. Trigger download.
 * 7. Clean up Blob URL.
 */
export const downloadInvoicePdf = (
  invoice: Invoice,
  customer?: Customer,
  vehicle?: Vehicle,
  settings?: WorkshopSettings
): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [217, 119, 6]; // Amber-600
  const darkColor: [number, number, number] = [15, 23, 42]; // Slate-900
  const grayColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate-50

  // Header Background Bar
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 36, 'F');

  let textStartX = 14;
  if (settings?.logoUrl) {
    try {
      doc.addImage(settings.logoUrl, 'PNG', 14, 6, 24, 24);
      textStartX = 42;
    } catch (e) {
      textStartX = 14;
    }
  }

  // Brand Name
  doc.setTextColor(245, 158, 11); // Amber-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text((settings?.workshopName || 'ADVANCE AUTO WORKSHOP').toUpperCase(), textStartX, 15);

  // Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(settings?.tagline || 'Precision Automotive Engineering, Service & Diagnostics', textStartX, 21);

  // Contact info
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const contactLine = `${settings?.address || 'Industrial Hub'}, ${settings?.city || ''} | Tel: ${settings?.phone || ''}`;
  doc.text(contactLine, textStartX, 26);
  doc.text(`Tax Reg: ${settings?.taxNumber || 'TAX-992014'} | Web: ${settings?.website || 'advanceauto.com'}`, textStartX, 31);

  // Document Title Banner on the right
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(138, 8, 58, 20, 2, 2, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TAX INVOICE', 167, 16, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.text(invoice.invoiceNumber, 167, 23, { align: 'center' });

  let currentY = 44;

  // Invoice Meta Box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(`Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, currentY);
  doc.text(`Payment Method: ${invoice.paymentMethod}`, 110, currentY);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 170, currentY);

  currentY += 8;

  // Two Info Cards (Customer & Vehicle)
  const cardWidth = 88;
  const cardHeight = 32;

  // Customer Card
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('CUSTOMER / BILL TO', 18, currentY + 6);

  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.text(customer?.name || 'Walk-in Customer', 18, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Phone: ${customer?.phone || 'N/A'}`, 18, currentY + 18);
  if (customer?.email) doc.text(`Email: ${customer.email}`, 18, currentY + 23);
  if (customer?.address) doc.text(`Address: ${customer.address.substring(0, 42)}`, 18, currentY + 28);

  // Vehicle Card
  const vehX = 108;
  doc.setFillColor(...lightBg);
  doc.roundedRect(vehX, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('VEHICLE IDENTIFICATION', vehX + 4, currentY + 6);

  if (vehicle) {
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.setFont('courier', 'bold');
    doc.text(vehicle.regNumber, vehX + 4, currentY + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, vehX + 4, currentY + 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(`Odometer: ${vehicle.mileage?.toLocaleString() || '0'} KM | Fuel: ${vehicle.fuelType || 'Petrol'}`, vehX + 4, currentY + 25);
    if (vehicle.vin) doc.text(`VIN: ${vehicle.vin}`, vehX + 4, currentY + 29);
  } else {
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('Over-the-counter sale (No vehicle attached)', vehX + 4, currentY + 16);
  }

  currentY += cardHeight + 8;

  // Items Table Header
  doc.setFillColor(...darkColor);
  doc.rect(14, currentY, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('#', 17, currentY + 5);
  doc.text('DESCRIPTION / PART OR SERVICE', 25, currentY + 5);
  doc.text('TYPE', 105, currentY + 5);
  doc.text('QTY', 125, currentY + 5, { align: 'center' });
  doc.text('RATE', 148, currentY + 5, { align: 'right' });
  doc.text('DISC', 168, currentY + 5, { align: 'right' });
  doc.text('TOTAL', 192, currentY + 5, { align: 'right' });

  currentY += 7;

  // Items List
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  invoice.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(14, currentY, 182, 7, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 7, 196, currentY + 7);

    doc.setTextColor(...darkColor);
    doc.text(String(index + 1), 17, currentY + 5);
    const desc = item.sku ? `${item.description} [${item.sku}]` : item.description;
    doc.text(desc.substring(0, 48), 25, currentY + 5);
    doc.setTextColor(...grayColor);
    doc.text(item.itemType || 'Part', 105, currentY + 5);
    doc.setTextColor(...darkColor);
    doc.text(String(item.quantity), 125, currentY + 5, { align: 'center' });
    doc.text(formatCurrency(item.unitPrice, settings), 148, currentY + 5, { align: 'right' });
    doc.setTextColor(22, 163, 74);
    const disc = Number(item.discount || 0);
    doc.text(disc > 0 ? `-${formatCurrency(disc, settings)}` : '-', 168, currentY + 5, { align: 'right' });
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.total, settings), 192, currentY + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    currentY += 7;
  });

  currentY += 4;

  // Totals Section
  const totalsX = 125;
  const totalsWidth = 71;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, currentY, totalsWidth, 40, 2, 2, 'FD');

  let totY = currentY + 6;
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Subtotal:', totalsX + 4, totY);
  doc.setTextColor(...darkColor);
  doc.text(formatCurrency(invoice.subtotal, settings), 192, totY, { align: 'right' });

  totY += 6;
  doc.setTextColor(...grayColor);
  doc.text('Discount:', totalsX + 4, totY);
  doc.setTextColor(22, 163, 74);
  const invDisc = Number(invoice.discount || 0);
  doc.text(invDisc > 0 ? `-${formatCurrency(invDisc, settings)}` : formatCurrency(0, settings), 192, totY, { align: 'right' });

  totY += 6;
  doc.setTextColor(...grayColor);
  doc.text(`Tax (${settings?.defaultTaxRate || 5}%):`, totalsX + 4, totY);
  doc.setTextColor(...darkColor);
  doc.text(formatCurrency(invoice.tax, settings), 192, totY, { align: 'right' });

  totY += 7;
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX + 4, totY - 2, 192, totY - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Grand Total:', totalsX + 4, totY + 2);
  doc.setTextColor(...primaryColor);
  doc.text(formatCurrency(invoice.grandTotal, settings), 192, totY + 2, { align: 'right' });

  totY += 7;
  doc.setFontSize(8);
  doc.setTextColor(22, 163, 74);
  doc.text(`Paid (${invoice.paymentMethod}):`, totalsX + 4, totY + 2);
  doc.text(formatCurrency(invoice.paidAmount, settings), 192, totY + 2, { align: 'right' });

  if (Number(invoice.dueAmount || 0) > 0) {
    totY += 5;
    doc.setTextColor(220, 38, 38);
    doc.text('Balance Due:', totalsX + 4, totY + 2);
    doc.text(formatCurrency(invoice.dueAmount, settings), 192, totY + 2, { align: 'right' });
  }

  // Terms & Warranty Notes (Left Column)
  const termsWidth = 105;
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, currentY, termsWidth, 40, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text('TERMS & WARRANTY CONDITIONS', 18, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  const terms = (settings?.printSettings?.termsAndConditions || '1. All parts come with manufacturer warranty.\n2. Labour is guaranteed for 30 days.\n3. Vehicles not collected within 7 days incur parking fees.').split('\n');
  let tY = currentY + 12;
  terms.forEach(t => {
    doc.text(t, 18, tY);
    tY += 5;
  });

  currentY += 46;

  // Signatures Section
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY + 15, 65, currentY + 15);
  doc.line(78, currentY + 15, 130, currentY + 15);
  doc.line(144, currentY + 15, 196, currentY + 15);

  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Technician / Master Mechanic', 39, currentY + 19, { align: 'center' });
  doc.text('Authorized Workshop Signature', 104, currentY + 19, { align: 'center' });
  doc.text('Customer Acceptance Handover', 170, currentY + 19, { align: 'center' });

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(settings?.printSettings?.receiptFooter || 'Thank you for choosing Advance Auto Workshop! Drive Safe.', 105, 285, { align: 'center' });

  // Real browser download
  const filename = `ADVANCE-AUTO-WORKSHOP-${invoice.invoiceNumber}.pdf`;
  triggerPdfBlobDownload(doc, filename);
  return filename;
};

/**
 * Downloads a real PDF for a Job Card using jsPDF.
 */
export const downloadJobCardPdf = (
  jobCard: JobCard,
  customer?: Customer,
  vehicle?: Vehicle,
  mechanic?: Mechanic,
  settings?: WorkshopSettings
): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const darkColor: [number, number, number] = [15, 23, 42];
  const primaryColor: [number, number, number] = [217, 119, 6];
  const grayColor: [number, number, number] = [100, 116, 139];
  const lightBg: [number, number, number] = [248, 250, 252];

  // Header Background Bar
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 36, 'F');

  let textStartX = 14;
  if (settings?.logoUrl) {
    try {
      doc.addImage(settings.logoUrl, 'PNG', 14, 6, 24, 24);
      textStartX = 42;
    } catch (e) {
      textStartX = 14;
    }
  }

  // Workshop Brand
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text((settings?.workshopName || 'ADVANCE AUTO WORKSHOP').toUpperCase(), textStartX, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(settings?.tagline || 'Workshop Job Card & Diagnostic Inspection', textStartX, 21);

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const contactLine = `${settings?.address || 'Industrial Hub'}, ${settings?.city || ''} | Tel: ${settings?.phone || ''}`;
  doc.text(contactLine, textStartX, 26);
  doc.text(`Lead Mechanic: ${mechanic?.name || 'Assigned Lead Technician'}`, textStartX, 31);

  // Document Badge
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.roundedRect(138, 8, 58, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('JOB CARD', 167, 16, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.text(jobCard.jobCardNumber, 167, 23, { align: 'center' });

  let currentY = 44;

  // Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(`Created: ${new Date(jobCard.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, currentY);
  doc.text(`Status: ${jobCard.status}`, 110, currentY);
  doc.text(`Est. Delivery: ${jobCard.estimatedDelivery ? new Date(jobCard.estimatedDelivery).toLocaleDateString() : 'Pending'}`, 160, currentY);

  currentY += 8;

  // Customer & Vehicle Cards
  const cardWidth = 88;
  const cardHeight = 30;

  // Customer
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('CUSTOMER INFORMATION', 18, currentY + 6);
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.text(customer?.name || 'Walk-in Customer', 18, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Phone: ${customer?.phone || 'N/A'}`, 18, currentY + 18);
  if (customer?.email) doc.text(`Email: ${customer.email}`, 18, currentY + 23);

  // Vehicle
  const vehX = 108;
  doc.setFillColor(...lightBg);
  doc.roundedRect(vehX, currentY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('VEHICLE PROFILE', vehX + 4, currentY + 6);
  if (vehicle) {
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.setFont('courier', 'bold');
    doc.text(vehicle.regNumber, vehX + 4, currentY + 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, vehX + 4, currentY + 19);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(`Odometer: ${jobCard.mileage?.toLocaleString() || vehicle.mileage?.toLocaleString() || 0} KM | Fuel: ${vehicle.fuelType || 'Petrol'}`, vehX + 4, currentY + 25);
  } else {
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('No vehicle linked', vehX + 4, currentY + 15);
  }

  currentY += cardHeight + 8;

  // Complaint Box
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.setDrawColor(253, 230, 138); // Amber-200
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'FD');
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CUSTOMER REPORTED COMPLAINT / FAULT:', 18, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(jobCard.complaint.substring(0, 120), 18, currentY + 11);

  currentY += 23;

  // Services & Parts Table Header
  doc.setFillColor(...darkColor);
  doc.rect(14, currentY, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('#', 17, currentY + 5);
  doc.text('SERVICE / SPARE PART REQUISITION', 25, currentY + 5);
  doc.text('TYPE', 115, currentY + 5);
  doc.text('QTY', 145, currentY + 5, { align: 'center' });
  doc.text('EST. TOTAL', 192, currentY + 5, { align: 'right' });

  currentY += 7;

  // Services rows
  let rowIdx = 1;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  jobCard.services.forEach(s => {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, currentY, 182, 7, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 7, 196, currentY + 7);

    doc.setTextColor(...darkColor);
    doc.text(String(rowIdx++), 17, currentY + 5);
    doc.text(s.name.substring(0, 52), 25, currentY + 5);
    doc.setTextColor(37, 99, 235);
    doc.text('Labour Service', 115, currentY + 5);
    doc.setTextColor(...darkColor);
    doc.text('1', 145, currentY + 5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(s.labourPrice, settings), 192, currentY + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    currentY += 7;
  });

  // Parts rows
  jobCard.parts.forEach(p => {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, currentY, 182, 7, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 7, 196, currentY + 7);

    doc.setTextColor(...darkColor);
    doc.text(String(rowIdx++), 17, currentY + 5);
    doc.text(p.name.substring(0, 52), 25, currentY + 5);
    doc.setTextColor(217, 119, 6);
    doc.text('Spare Part', 115, currentY + 5);
    doc.setTextColor(...darkColor);
    doc.text(String(p.quantity), 145, currentY + 5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(p.totalPrice, settings), 192, currentY + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    currentY += 7;
  });

  currentY += 4;

  // Totals Box
  const totalsX = 125;
  const totalsWidth = 71;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, currentY, totalsWidth, 32, 2, 2, 'FD');

  let totY = currentY + 6;
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Labour Total:', totalsX + 4, totY);
  doc.setTextColor(...darkColor);
  doc.text(formatCurrency(jobCard.labourCost, settings), 192, totY, { align: 'right' });

  totY += 6;
  doc.setTextColor(...grayColor);
  doc.text('Parts Total:', totalsX + 4, totY);
  doc.setTextColor(...darkColor);
  doc.text(formatCurrency(jobCard.partsCost, settings), 192, totY, { align: 'right' });

  totY += 6;
  doc.setTextColor(...grayColor);
  doc.text(`Tax (${settings?.defaultTaxRate || 5}%):`, totalsX + 4, totY);
  doc.setTextColor(...darkColor);
  doc.text(formatCurrency(jobCard.tax, settings), 192, totY, { align: 'right' });

  totY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ESTIMATE TOTAL:', totalsX + 4, totY + 2);
  doc.setTextColor(...primaryColor);
  doc.text(formatCurrency(jobCard.actualCost, settings), 192, totY + 2, { align: 'right' });

  // Inspection Checklist Summary
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, currentY, 105, 32, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text('SAFETY & INSPECTION STATUS SNAPSHOT', 18, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text(`Engine & Fluids: ${jobCard.inspection?.engine?.oil?.status || 'Good'}`, 18, currentY + 12);
  doc.text(`Braking System: ${jobCard.inspection?.brakes?.brakePads?.status || 'Good'}`, 18, currentY + 17);
  doc.text(`Tyres & Tread: ${jobCard.inspection?.tyres?.frontLeft?.status || 'Good'}`, 18, currentY + 22);
  doc.text(`Battery & Electrical: ${jobCard.inspection?.electrical?.battery?.status || 'Good'}`, 18, currentY + 27);

  currentY += 40;

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY + 15, 65, currentY + 15);
  doc.line(78, currentY + 15, 130, currentY + 15);
  doc.line(144, currentY + 15, 196, currentY + 15);

  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Lead Technician Inspection', 39, currentY + 19, { align: 'center' });
  doc.text('Workshop Service Manager', 104, currentY + 19, { align: 'center' });
  doc.text('Customer Work Authorization', 170, currentY + 19, { align: 'center' });

  const filename = `ADVANCE-AUTO-WORKSHOP-${jobCard.jobCardNumber}.pdf`;
  triggerPdfBlobDownload(doc, filename);
  return filename;
};

/**
 * Downloads a real PDF for a Payment Receipt using jsPDF.
 */
export const downloadPaymentPdf = (
  payment: Payment,
  customer?: Customer,
  settings?: WorkshopSettings
): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const darkColor: [number, number, number] = [15, 23, 42];
  const emeraldColor: [number, number, number] = [16, 185, 129];
  const grayColor: [number, number, number] = [100, 116, 139];
  const lightBg: [number, number, number] = [248, 250, 252];

  // Header Background Bar
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 36, 'F');

  let textStartX = 14;
  if (settings?.logoUrl) {
    try {
      doc.addImage(settings.logoUrl, 'PNG', 14, 6, 24, 24);
      textStartX = 42;
    } catch (e) {
      textStartX = 14;
    }
  }

  // Brand Name
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text((settings?.workshopName || 'ADVANCE AUTO WORKSHOP').toUpperCase(), textStartX, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Official Payment Receipt & Financial Settlement', textStartX, 21);

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const contactLine = `${settings?.address || 'Industrial Hub'}, ${settings?.city || ''} | Tel: ${settings?.phone || ''}`;
  doc.text(contactLine, textStartX, 26);
  doc.text(`Tax Reg: ${settings?.taxNumber || 'TAX-992014'}`, textStartX, 31);

  // Badge
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.roundedRect(138, 8, 58, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAYMENT RECEIPT', 167, 16, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.text(payment.paymentNumber, 167, 23, { align: 'center' });

  let currentY = 46;

  // Receipt Card
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 70, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text('PAYMENT SETTLEMENT DETAILS', 20, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text(`Receipt Number:`, 20, currentY + 18);
  doc.text(`Date & Time:`, 20, currentY + 25);
  doc.text(`Customer Name:`, 20, currentY + 32);
  doc.text(`Customer Phone:`, 20, currentY + 39);
  doc.text(`Payment Method:`, 20, currentY + 46);
  doc.text(`Reference / Notes:`, 20, currentY + 53);
  doc.text(`Cashier / Officer:`, 20, currentY + 60);

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(payment.paymentNumber, 70, currentY + 18);
  doc.text(new Date(payment.date).toLocaleString(), 70, currentY + 25);
  doc.text(customer?.name || 'Valued Customer', 70, currentY + 32);
  doc.text(customer?.phone || 'N/A', 70, currentY + 39);
  doc.text(payment.method, 70, currentY + 46);
  doc.text(payment.reference || payment.notes || 'Settlement completed', 70, currentY + 53);
  doc.text(payment.createdBy || 'Accounts Desk', 70, currentY + 60);

  currentY += 80;

  // Amount Banner
  doc.setFillColor(240, 253, 244); // Green-50
  doc.setDrawColor(187, 247, 208); // Green-200
  doc.roundedRect(14, currentY, 182, 25, 3, 3, 'FD');

  doc.setTextColor(22, 101, 52); // Green-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL AMOUNT RECEIVED IN FULL:', 20, currentY + 11);

  doc.setFontSize(15);
  doc.setTextColor(...emeraldColor);
  doc.text(formatCurrency(payment.amount, settings), 190, currentY + 16, { align: 'right' });

  currentY += 40;

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY + 15, 80, currentY + 15);
  doc.line(130, currentY + 15, 196, currentY + 15);

  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Finance Signatory', 47, currentY + 20, { align: 'center' });
  doc.text('Customer Received Copy', 163, currentY + 20, { align: 'center' });

  const filename = `ADVANCE-AUTO-WORKSHOP-${payment.paymentNumber}.pdf`;
  triggerPdfBlobDownload(doc, filename);
  return filename;
};

/**
 * Universal PDF downloader dispatcher.
 * Generates actual PDF, triggers browser download, and returns the filename.
 */
export const downloadDocumentPdf = (
  type: 'invoice' | 'job_card' | 'payment_receipt',
  data: any,
  customer?: Customer,
  vehicle?: Vehicle,
  settings?: WorkshopSettings,
  mechanic?: Mechanic
): string => {
  if (type === 'invoice') {
    return downloadInvoicePdf(data as Invoice, customer, vehicle, settings);
  } else if (type === 'job_card') {
    return downloadJobCardPdf(data as JobCard, customer, vehicle, mechanic, settings);
  } else {
    return downloadPaymentPdf(data as Payment, customer, settings);
  }
};

/**
 * Helper to turn a jsPDF instance into an actual PDF Blob,
 * create a temporary Object URL, and click a download anchor.
 */
const triggerPdfBlobDownload = (doc: jsPDF, filename: string): void => {
  try {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (err) {
    console.warn('Blob download fallback to doc.save:', err);
    doc.save(filename);
  }
};

/**
 * Generates standalone HTML for 80mm thermal receipt.
 * Optimized specifically for 80mm thermal printers.
 */
export const generate80mmHtml = (
  type: 'invoice' | 'job_card' | 'payment_receipt',
  data: any,
  customer?: Customer,
  vehicle?: Vehicle,
  mechanic?: Mechanic,
  settings?: WorkshopSettings
): string => {
  const currency = settings?.currency || '$';
  const workshopName = settings?.workshopName || 'ADVANCE AUTO WORKSHOP';
  const address = `${settings?.address || 'Industrial Hub'}, ${settings?.city || ''}`;
  const phone = settings?.phone || '+1 555-0100';
  const taxId = settings?.taxNumber || 'TAX-992014';
  const footerText = settings?.printSettings?.receiptFooter || 'Thank you! Drive Safe.';

  let bodyContent = '';

  if (type === 'invoice') {
    const inv = data as Invoice;
    bodyContent = `
      <div class="header">
        <div class="title">${workshopName}</div>
        <div>${address}</div>
        <div>Tel: ${phone}</div>
        <div>Tax ID: ${taxId}</div>
      </div>
      <div class="divider"></div>
      <div class="meta">
        <div><strong>INVOICE:</strong> ${inv.invoiceNumber}</div>
        <div><strong>Date:</strong> ${new Date(inv.createdAt).toLocaleString()}</div>
        <div><strong>Cashier:</strong> ${inv.createdBy || 'Staff'}</div>
        <div><strong>Customer:</strong> ${customer?.name || 'Walk-in'}</div>
        ${customer?.phone ? `<div><strong>Phone:</strong> ${customer.phone}</div>` : ''}
        ${vehicle ? `
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dotted #ccc;">
            <div><strong>Vehicle:</strong> ${vehicle.regNumber}</div>
            <div><strong>Model:</strong> ${vehicle.make} ${vehicle.model}</div>
            <div><strong>Mileage:</strong> ${vehicle.mileage?.toLocaleString() || 0} KM</div>
          </div>
        ` : ''}
      </div>
      <div class="divider"></div>
      <table class="items-table">
        <thead>
          <tr>
            <th style="text-align: left; width: 50%;">ITEM</th>
            <th style="text-align: center; width: 15%;">QTY</th>
            <th style="text-align: right; width: 35%;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map(it => `
            <tr>
              <td colspan="3" style="font-weight: bold; padding-top: 3px;">${it.description}</td>
            </tr>
            <tr>
              <td style="font-size: 9px; color: #555;">${it.itemType}</td>
              <td style="text-align: center;">${it.quantity}</td>
              <td style="text-align: right;">${currency}${Number(it.total || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="divider"></div>
      <div class="totals">
        <div class="row"><span>Subtotal:</span> <span>${currency}${Number(inv.subtotal || 0).toFixed(2)}</span></div>
        ${Number(inv.discount || 0) > 0 ? `<div class="row"><span>Discount:</span> <span>-${currency}${Number(inv.discount).toFixed(2)}</span></div>` : ''}
        <div class="row"><span>Tax (${settings?.defaultTaxRate || 5}%):</span> <span>${currency}${Number(inv.tax || 0).toFixed(2)}</span></div>
        <div class="row total-row"><span>GRAND TOTAL:</span> <span>${currency}${Number(inv.grandTotal || 0).toFixed(2)}</span></div>
        <div class="row"><span>Paid (${inv.paymentMethod}):</span> <span>${currency}${Number(inv.paidAmount || 0).toFixed(2)}</span></div>
        ${Number(inv.dueAmount || 0) > 0 ? `<div class="row due-row"><span>Balance Due:</span> <span>${currency}${Number(inv.dueAmount).toFixed(2)}</span></div>` : ''}
      </div>
      <div class="divider"></div>
      <div class="footer">
        <div class="barcode">*${inv.invoiceNumber}*</div>
        <div>${footerText.replace(/\n/g, '<br/>')}</div>
        <div style="font-size: 8px; margin-top: 4px; color: #777;">Powered by Advance Auto Workshop POS</div>
      </div>
    `;
  } else if (type === 'job_card') {
    const jc = data as JobCard;
    bodyContent = `
      <div class="header">
        <div class="title">${workshopName}</div>
        <div>${address}</div>
        <div>Tel: ${phone}</div>
      </div>
      <div class="divider"></div>
      <div class="meta">
        <div><strong>JOB CARD:</strong> ${jc.jobCardNumber}</div>
        <div><strong>Status:</strong> ${jc.status}</div>
        <div><strong>Date:</strong> ${new Date(jc.createdAt).toLocaleDateString()}</div>
        <div><strong>Customer:</strong> ${customer?.name || 'Walk-in'}</div>
        ${vehicle ? `
          <div><strong>Vehicle:</strong> ${vehicle.regNumber}</div>
          <div><strong>Model:</strong> ${vehicle.make} ${vehicle.model}</div>
          <div><strong>Odometer:</strong> ${jc.mileage?.toLocaleString() || 0} KM</div>
        ` : ''}
        <div><strong>Mechanic:</strong> ${mechanic?.name || 'Assigned Tech'}</div>
      </div>
      <div class="divider"></div>
      <div style="font-size: 10px;">
        <div><strong>COMPLAINT:</strong></div>
        <div style="font-style: italic; color: #444;">${jc.complaint}</div>
      </div>
      <div class="divider"></div>
      <div class="totals">
        <div class="row"><span>Labour Total:</span> <span>${currency}${Number(jc.labourCost || 0).toFixed(2)}</span></div>
        <div class="row"><span>Parts Total:</span> <span>${currency}${Number(jc.partsCost || 0).toFixed(2)}</span></div>
        <div class="row total-row"><span>ESTIMATED COST:</span> <span>${currency}${Number(jc.actualCost || 0).toFixed(2)}</span></div>
      </div>
      <div class="divider"></div>
      <div class="footer">
        <div class="barcode">*${jc.jobCardNumber}*</div>
        <div>${footerText.replace(/\n/g, '<br/>')}</div>
      </div>
    `;
  } else {
    const pay = data as Payment;
    bodyContent = `
      <div class="header">
        <div class="title">${workshopName}</div>
        <div>${address}</div>
        <div>Tel: ${phone}</div>
      </div>
      <div class="divider"></div>
      <div class="meta">
        <div><strong>RECEIPT:</strong> ${pay.paymentNumber}</div>
        <div><strong>Date:</strong> ${new Date(pay.date).toLocaleString()}</div>
        <div><strong>Customer:</strong> ${customer?.name || 'Customer'}</div>
        <div><strong>Method:</strong> ${pay.method}</div>
        ${pay.reference ? `<div><strong>Ref:</strong> ${pay.reference}</div>` : ''}
      </div>
      <div class="divider"></div>
      <div class="totals">
        <div class="row total-row"><span>AMOUNT RECEIVED:</span> <span>${currency}${Number(pay.amount || 0).toFixed(2)}</span></div>
      </div>
      <div class="divider"></div>
      <div class="footer">
        <div class="barcode">*${pay.paymentNumber}*</div>
        <div>Thank you for your payment!</div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>80mm Thermal Receipt</title>
    <style>
      @media print {
        @page {
          size: 80mm auto;
          margin: 0;
        }
        html,
        body {
          width: 80mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      * {
        box-sizing: border-box;
      }
      html, body {
        width: 80mm;
        margin: 0 auto;
        padding: 4mm 3mm;
        background: #ffffff;
        color: #000000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace;
        font-size: 11px;
        line-height: 1.35;
      }
      .header { text-align: center; font-size: 10px; }
      .title { font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 2px; }
      .divider { border-top: 1px dashed #444; margin: 6px 0; }
      .meta div { font-size: 10px; margin-bottom: 1px; }
      .items-table { width: 100%; border-collapse: collapse; font-size: 10px; }
      .items-table th { border-bottom: 1px solid #444; font-size: 9px; padding-bottom: 2px; }
      .totals .row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; }
      .total-row { font-size: 12px; font-weight: 900; border-top: 1px solid #000; padding-top: 3px; }
      .due-row { font-weight: bold; color: #b91c1c; }
      .footer { text-align: center; font-size: 9px; margin-top: 6px; }
      .barcode { font-family: monospace; letter-spacing: 2px; font-size: 9px; margin: 4px 0; background: #eee; padding: 2px; }
    </style>
  </head>
  <body>
    ${bodyContent}
  </body>
</html>`;
};

/**
 * Generates standalone HTML for A4 Commercial Full-Page Sheet.
 * Optimized specifically for A4 printers.
 */
export const generateA4Html = (
  type: 'invoice' | 'job_card' | 'payment_receipt',
  data: any,
  customer?: Customer,
  vehicle?: Vehicle,
  mechanic?: Mechanic,
  settings?: WorkshopSettings
): string => {
  const currency = settings?.currency || '$';
  const workshopName = settings?.workshopName || 'ADVANCE AUTO WORKSHOP';
  const tagline = settings?.tagline || 'Precision Automotive Engineering, Service & Diagnostics';
  const address = `${settings?.address || 'Industrial Hub'}, ${settings?.city || ''}`;
  const phone = settings?.phone || '+1 555-0100';
  const email = settings?.email || 'service@advanceauto.com';
  const taxId = settings?.taxNumber || 'TAX-992014';
  const termsText = settings?.printSettings?.termsAndConditions || '1. All parts come with warranty.\n2. Labour guaranteed 30 days.\n3. Vehicles not collected in 7 days incur parking fees.';

  let docTitle = 'TAX INVOICE';
  let docNumber = '';
  let docDate = '';
  let itemsHtml = '';
  let totalsHtml = '';
  let specialBoxHtml = '';

  if (type === 'invoice') {
    const inv = data as Invoice;
    docTitle = 'TAX INVOICE';
    docNumber = inv.invoiceNumber;
    docDate = new Date(inv.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    itemsHtml = `
      <table class="table">
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 45%;">DESCRIPTION / ITEM</th>
            <th style="width: 15%; text-align: center;">TYPE</th>
            <th style="width: 10%; text-align: center;">QTY</th>
            <th style="width: 12%; text-align: right;">RATE</th>
            <th style="width: 13%; text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map((it, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${it.description}</strong> ${it.sku ? `<span style="font-size: 9px; color: #666; display: block;">SKU: ${it.sku}</span>` : ''}</td>
              <td style="text-align: center;"><span class="badge">${it.itemType}</span></td>
              <td style="text-align: center;">${it.quantity}</td>
              <td style="text-align: right;">${currency}${Number(it.unitPrice || 0).toFixed(2)}</td>
              <td style="text-align: right; font-weight: bold;">${currency}${Number(it.total || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    totalsHtml = `
      <div class="totals-box">
        <div class="row"><span>Subtotal:</span> <span>${currency}${Number(inv.subtotal || 0).toFixed(2)}</span></div>
        ${Number(inv.discount || 0) > 0 ? `<div class="row" style="color: #15803d;"><span>Discount:</span> <span>-${currency}${Number(inv.discount).toFixed(2)}</span></div>` : ''}
        <div class="row"><span>Sales Tax (${settings?.defaultTaxRate || 5}%):</span> <span>${currency}${Number(inv.tax || 0).toFixed(2)}</span></div>
        <div class="row total-row"><span>GRAND TOTAL:</span> <span>${currency}${Number(inv.grandTotal || 0).toFixed(2)}</span></div>
        <div class="row" style="margin-top: 4px; border-top: 1px solid #ccc; padding-top: 4px;">
          <span>Paid (${inv.paymentMethod}):</span> <span style="font-weight: bold;">${currency}${Number(inv.paidAmount || 0).toFixed(2)}</span>
        </div>
        ${Number(inv.dueAmount || 0) > 0 ? `<div class="row" style="color: #b91c1c; font-weight: bold;"><span>Balance Due:</span> <span>${currency}${Number(inv.dueAmount).toFixed(2)}</span></div>` : ''}
      </div>
    `;
  } else if (type === 'job_card') {
    const jc = data as JobCard;
    docTitle = 'WORKSHOP JOB CARD';
    docNumber = jc.jobCardNumber;
    docDate = new Date(jc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    specialBoxHtml = `
      <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
        <strong style="color: #b45309; font-size: 10px; text-transform: uppercase;">Customer Reported Complaint:</strong>
        <p style="margin: 4px 0 0 0; font-size: 11px;">${jc.complaint}</p>
        ${jc.recommendedWork ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #4b5563;"><strong>Recommendation:</strong> ${jc.recommendedWork}</p>` : ''}
      </div>
    `;

    itemsHtml = `
      <table class="table">
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 50%;">SERVICE / SPARE PART</th>
            <th style="width: 15%; text-align: center;">TYPE</th>
            <th style="width: 10%; text-align: center;">QTY</th>
            <th style="width: 20%; text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${jc.services.map((s, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${s.name}</strong></td>
              <td style="text-align: center;"><span class="badge">Labour</span></td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right; font-weight: bold;">${currency}${Number(s.labourPrice || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
          ${jc.parts.map((p, idx) => `
            <tr>
              <td>${jc.services.length + idx + 1}</td>
              <td><strong>${p.name}</strong></td>
              <td style="text-align: center;"><span class="badge">Part</span></td>
              <td style="text-align: center;">${p.quantity}</td>
              <td style="text-align: right; font-weight: bold;">${currency}${Number(p.totalPrice || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    totalsHtml = `
      <div class="totals-box">
        <div class="row"><span>Labour Total:</span> <span>${currency}${Number(jc.labourCost || 0).toFixed(2)}</span></div>
        <div class="row"><span>Parts Total:</span> <span>${currency}${Number(jc.partsCost || 0).toFixed(2)}</span></div>
        <div class="row"><span>Tax (${settings?.defaultTaxRate || 5}%):</span> <span>${currency}${Number(jc.tax || 0).toFixed(2)}</span></div>
        <div class="row total-row"><span>ESTIMATE TOTAL:</span> <span>${currency}${Number(jc.actualCost || 0).toFixed(2)}</span></div>
      </div>
    `;
  } else {
    const pay = data as Payment;
    docTitle = 'PAYMENT RECEIPT';
    docNumber = pay.paymentNumber;
    docDate = new Date(pay.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    totalsHtml = `
      <div class="totals-box" style="margin-top: 15px;">
        <div class="row total-row" style="font-size: 15px; color: #15803d;">
          <span>AMOUNT RECEIVED:</span> <span>${currency}${Number(pay.amount || 0).toFixed(2)}</span>
        </div>
        <div class="row" style="margin-top: 6px;"><span>Payment Method:</span> <strong>${pay.method}</strong></div>
        ${pay.reference ? `<div class="row"><span>Reference:</span> <span>${pay.reference}</span></div>` : ''}
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${docTitle} - ${docNumber}</title>
    <style>
      @media print {
        @page {
          size: A4;
          margin: 12mm;
        }
        html,
        body {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      * {
        box-sizing: border-box;
      }
      html, body {
        width: 100%;
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 11px;
        line-height: 1.4;
      }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
      .brand-title { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 0; }
      .tagline { font-size: 10px; color: #64748b; margin: 2px 0 6px 0; }
      .meta-box { text-align: right; }
      .doc-badge { display: inline-block; background: #0f172a; color: #ffffff; padding: 4px 10px; font-weight: 900; font-size: 12px; border-radius: 4px; text-transform: uppercase; margin-bottom: 4px; }
      .doc-num { font-family: monospace; font-size: 14px; font-weight: bold; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
      .card-title { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #d97706; margin-bottom: 4px; }
      .table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      .table th { background: #0f172a; color: #ffffff; text-align: left; padding: 6px 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
      .table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
      .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; }
      .footer-section { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
      .totals-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
      .totals-box .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
      .totals-box .total-row { border-top: 2px solid #0f172a; padding-top: 6px; margin-top: 4px; font-size: 13px; font-weight: 900; }
      .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 10px; }
      .sig-line { border-bottom: 1px solid #94a3b8; height: 25px; margin-bottom: 4px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1 class="brand-title">${workshopName}</h1>
        <div class="tagline">${tagline}</div>
        <div style="font-size: 10px; color: #64748b;">
          <div>${address}</div>
          <div>Tel: ${phone} | Email: ${email}</div>
          <div>Tax Reg: ${taxId}</div>
        </div>
      </div>
      <div class="meta-box">
        <div class="doc-badge">${docTitle}</div>
        <div class="doc-num">${docNumber}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Date: ${docDate}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">CUSTOMER INFORMATION</div>
        <div style="font-size: 12px; font-weight: bold;">${customer?.name || 'Walk-in Customer'}</div>
        <div style="color: #475569;">${customer?.phone || 'No phone'}</div>
        ${customer?.email ? `<div style="color: #475569;">${customer.email}</div>` : ''}
        ${customer?.address ? `<div style="color: #64748b; font-size: 10px; margin-top: 2px;">${customer.address}</div>` : ''}
      </div>

      <div class="card">
        <div class="card-title">VEHICLE SPECIFICATION</div>
        ${vehicle ? `
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-family: monospace; font-size: 13px; font-weight: 900; background: #fef3c7; border: 1px solid #fde68a; padding: 1px 6px; border-radius: 3px;">
              ${vehicle.regNumber}
            </span>
            <span style="font-weight: bold;">${vehicle.year} ${vehicle.make} ${vehicle.model}</span>
          </div>
          <div style="color: #64748b; font-size: 10px; margin-top: 4px;">
            Odometer: ${vehicle.mileage?.toLocaleString() || 0} KM | Fuel: ${vehicle.fuelType || 'Petrol'} | Color: ${vehicle.color || 'N/A'}
          </div>
          ${vehicle.vin ? `<div style="font-family: monospace; font-size: 9px; color: #94a3b8; margin-top: 2px;">VIN: ${vehicle.vin}</div>` : ''}
        ` : `
          <div style="color: #94a3b8; font-style: italic;">No vehicle attached to this transaction.</div>
        `}
      </div>
    </div>

    ${specialBoxHtml}
    ${itemsHtml}

    <div class="footer-section">
      <div class="card">
        <div class="card-title">TERMS & CONDITIONS</div>
        <div style="font-size: 9px; color: #64748b; white-space: pre-line;">${termsText}</div>
      </div>
      ${totalsHtml}
    </div>

    <div class="signatures">
      <div>
        <div class="sig-line"></div>
        <strong>Technician / Inspector</strong>
      </div>
      <div>
        <div class="sig-line"></div>
        <strong>Authorized Signatory</strong>
      </div>
      <div>
        <div class="sig-line"></div>
        <strong>Customer Acceptance</strong>
      </div>
    </div>
  </body>
</html>`;
};

/**
 * Options for triggering standard browser print flow.
 */
export interface PrintTriggerOptions {
  type: 'invoice' | 'job_card' | 'payment_receipt';
  data: any;
  format: '80MM' | 'A4';
  customer?: Customer;
  vehicle?: Vehicle;
  mechanic?: Mechanic;
  settings?: WorkshopSettings;
  onPreparing?: (msg: string) => void;
  onOpening?: (msg: string) => void;
  onOpened?: (msg: string) => void;
  onBlocked?: (msg: string) => void;
  onError?: (msg: string) => void;
  onFallback?: () => void;
}

/**
 * Synchronously opens a dedicated print window from a user click gesture.
 * If popups are blocked by the browser or iframe sandbox, returns null.
 */
export const openSynchronousPrintWindow = (format: '80MM' | 'A4'): Window | null => {
  try {
    const features = format === '80MM'
      ? 'width=450,height=750,left=150,top=50,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
      : 'width=850,height=950,left=100,top=50,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes';
    const win = window.open('', '_blank', features);
    return win;
  } catch (err) {
    console.warn('window.open blocked:', err);
    return null;
  }
};

/**
 * Writes print document to the opened print window and calls .print().
 */
export const writeAndPrintToWindow = (
  printWindow: Window,
  html: string,
  onOpening?: (msg: string) => void,
  onOpened?: (msg: string) => void,
  onError?: (msg: string) => void,
  onFallback?: () => void
): void => {
  try {
    if (onOpening) onOpening('Opening print dialog...');

    const doc = printWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    const trigger = () => {
      try {
        printWindow.focus();
        printWindow.print();
        if (onOpened) onOpened('Print dialog opened.');

        // Auto-close after print dialog finishes (either Print or Cancel)
        printWindow.addEventListener('afterprint', () => {
          try {
            printWindow.close();
          } catch (e) {
            // Ignore
          }
        });
      } catch (printErr) {
        console.warn('printWindow.print() failed:', printErr);
        if (onFallback) onFallback();
      }
    };

    if (doc.readyState === 'complete') {
      setTimeout(trigger, 250);
    } else {
      printWindow.onload = () => setTimeout(trigger, 250);
      // Fallback timer if onload does not fire for dynamic document
      setTimeout(trigger, 450);
    }
  } catch (err) {
    console.error('Failed to write to print window:', err);
    if (onError) onError('Unable to prepare print document.');
    if (onFallback) onFallback();
  }
};

/**
 * High-level unified print executor with automatic popup detection and same-tab fallback.
 */
export const executePrintWithFallback = (
  options: PrintTriggerOptions,
  existingWindow?: Window | null
): boolean => {
  const {
    type,
    data,
    format,
    customer,
    vehicle,
    mechanic,
    settings,
    onPreparing,
    onOpening,
    onOpened,
    onBlocked,
    onError,
    onFallback,
  } = options;

  if (onPreparing) {
    onPreparing(format === '80MM' ? 'Preparing 80mm receipt...' : 'Preparing A4 document...');
  }

  // 1. Try to use or open synchronous print window
  const printWindow = existingWindow !== undefined ? existingWindow : openSynchronousPrintWindow(format);

  // 2. Generate HTML
  const html = format === '80MM'
    ? generate80mmHtml(type, data, customer, vehicle, mechanic, settings)
    : generateA4Html(type, data, customer, vehicle, mechanic, settings);

  // 3. If window is available, write and trigger print
  if (printWindow && !printWindow.closed) {
    writeAndPrintToWindow(printWindow, html, onOpening, onOpened, onError, onFallback);
    return true;
  }

  // 4. If window is blocked by browser
  if (onBlocked) {
    onBlocked('Print window blocked. Please allow popups for this website.');
  }

  // 5. Trigger reliable same-tab fallback
  if (onFallback) {
    onFallback();
  }

  return false;
};

/**
 * Triggers native browser print dialog for an isolated document.
 */
export const executeBrowserPrint = (
  html: string,
  onInitiated?: () => void,
  onError?: (err: any) => void
): void => {
  try {
    if (onInitiated) onInitiated();

    // Remove any previous print iframes
    const oldIframe = document.getElementById('advance-auto-print-iframe');
    if (oldIframe && oldIframe.parentNode) {
      oldIframe.parentNode.removeChild(oldIframe);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'advance-auto-print-iframe';
    iframe.setAttribute(
      'style',
      'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; opacity: 0.001; pointer-events: none; z-index: -9999; border: none; background: #fff;'
    );

    document.body.appendChild(iframe);

    const fWindow = iframe.contentWindow;
    const fDoc = fWindow?.document || iframe.contentDocument;

    if (!fWindow || !fDoc) {
      throw new Error('Print frame window could not be initialized');
    }

    fDoc.open();
    fDoc.write(html);
    fDoc.close();

    const doPrint = () => {
      try {
        fWindow.focus();
        fWindow.print();

        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 60000);
      } catch (printErr) {
        console.warn('Iframe print failed or restricted, using direct print fallback:', printErr);
        executeDirectWindowFallback(html);
      }
    };

    if (fDoc.readyState === 'complete') {
      setTimeout(doPrint, 150);
    } else {
      iframe.onload = () => setTimeout(doPrint, 150);
    }
  } catch (err) {
    console.error('Print execution error:', err);
    try {
      executeDirectWindowFallback(html);
    } catch (fallbackErr) {
      if (onError) onError(fallbackErr);
    }
  }
};

/**
 * Fallback mechanism for sandboxed iframe environments where nested
 * iframe print() is blocked by browser policy.
 */
const executeDirectWindowFallback = (html: string): void => {
  let printArea = document.getElementById('advance-auto-print-area');
  if (!printArea) {
    printArea = document.createElement('div');
    printArea.id = 'advance-auto-print-area';
    document.body.appendChild(printArea);
  }

  // Extract body content and styles from HTML
  printArea.innerHTML = html;
  document.body.classList.add('direct-printing-active');

  setTimeout(() => {
    window.focus();
    window.print();
    setTimeout(() => {
      document.body.classList.remove('direct-printing-active');
      if (printArea) printArea.innerHTML = '';
    }, 1000);
  }, 200);
};
