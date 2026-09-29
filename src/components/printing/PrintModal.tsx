import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Printer, Download, X, Eye, FileText, CheckCircle, 
  Share2, Wrench, ShieldCheck, Car, Phone, Mail, MapPin 
} from 'lucide-react';
import { Invoice, JobCard, Payment } from '../../types';
import { 
  downloadDocumentPdf, 
  openSynchronousPrintWindow,
  executePrintWithFallback 
} from '../../utils/printAndPdfService';

export const PrintModal: React.FC = () => {
  const { 
    printPreview, 
    closePrintPreview, 
    setPrintFormat, 
    settings, 
    customers, 
    vehicles, 
    mechanics,
    addToast,
    openSameTabPrint 
  } = useApp();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Retrieve customer & vehicle helpers
  const getCustomer = (id?: string) => customers.find(c => c.id === id);
  const getVehicle = (id?: string) => vehicles.find(v => v.id === id);
  const getMechanic = (id?: string) => mechanics.find(m => m.id === id);

  const type = printPreview.type;
  const data = printPreview.data;
  const format = printPreview.format;

  const custId = type === 'invoice' ? (data as Invoice)?.customerId : (type === 'job_card' ? (data as JobCard)?.customerId : (data as Payment)?.customerId);
  const vehId = type === 'invoice' ? (data as Invoice)?.vehicleId : (type === 'job_card' ? (data as JobCard)?.vehicleId : undefined);
  const mechId = type === 'job_card' ? (data as JobCard)?.assignedMechanicId : undefined;

  const cust = getCustomer(custId);
  const veh = getVehicle(vehId);
  const mech = getMechanic(mechId);

  const handleTriggerPrint = () => {
    if (!data) return;
    // 1. Immediately open print window synchronously from the click gesture!
    const win = openSynchronousPrintWindow(format);

    executePrintWithFallback({
      type,
      data,
      format,
      customer: cust,
      vehicle: veh,
      mechanic: mech,
      settings,
      onPreparing: (msg) => addToast('info', 'Printing', msg),
      onOpening: (msg) => addToast('info', 'Printing', msg),
      onOpened: (msg) => addToast('success', 'Print Dialog', msg),
      onBlocked: (msg) => addToast('warning', 'Print Window Blocked', msg),
      onError: (msg) => addToast('error', 'Print Error', msg),
      onFallback: () => {
        closePrintPreview();
        openSameTabPrint(type, data, format);
      },
    }, win);
  };

  const handleDownloadPdf = () => {
    if (!data) return;
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        const filename = downloadDocumentPdf(type, data, cust, veh, settings, mech);
        // Only AFTER the download operation is successfully triggered, show success toast
        addToast('success', 'PDF downloaded successfully', `${filename} saved to downloads`);
      } catch (err) {
        console.error(err);
        addToast('error', 'PDF Error', 'Unable to generate PDF. Please try again.');
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 150);
  };

  // Auto-print effect when opened with autoPrint=true (Hooks unconditionally at the top)
  useEffect(() => {
    if (printPreview.isOpen && printPreview.autoPrint && printPreview.data) {
      const timer = setTimeout(() => {
        handleTriggerPrint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [printPreview.isOpen, printPreview.autoPrint, printPreview.data]);

  if (!printPreview.isOpen || !printPreview.data) return null;

  const handleShareWhatsapp = () => {
    let text = '';
    if (type === 'invoice') {
      const inv = data as Invoice;
      const cust = getCustomer(inv.customerId);
      const veh = getVehicle(inv.vehicleId);
      text = `Hello ${cust?.name || 'Customer'},\nYour invoice *${inv.invoiceNumber}* from *${settings.workshopName}* is ready.\nTotal: ${settings.currency}${inv.grandTotal.toFixed(2)}\nPaid: ${settings.currency}${inv.paidAmount.toFixed(2)}\nDue: ${settings.currency}${inv.dueAmount.toFixed(2)}${veh ? `\nVehicle: ${veh.make} ${veh.model} (${veh.regNumber})` : ''}\nThank you for choosing Advance Auto!`;
      const phoneClean = (cust?.whatsapp || cust?.phone || '').replace(/[^0-9]/g, '');
      const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } else if (type === 'job_card') {
      const jc = data as JobCard;
      const cust = getCustomer(jc.customerId);
      const veh = getVehicle(jc.vehicleId);
      text = `Hello ${cust?.name || 'Customer'},\nYour Job Card *${jc.jobCardNumber}* status is *${jc.status}* at *${settings.workshopName}*.\nVehicle: ${veh?.make} ${veh?.model} (${veh?.regNumber})\nEst. Total: ${settings.currency}${jc.actualCost.toFixed(2)}`;
      const phoneClean = (cust?.whatsapp || cust?.phone || '').replace(/[^0-9]/g, '');
      const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm print:p-0 print:bg-white">
      {/* Container - hidden on print when printing clean view */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none print:w-full print:h-auto print:rounded-none print:bg-white text-slate-100 print:text-black">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-800/90 border-b border-slate-700/70 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Print Preview: {type === 'invoice' ? 'Tax Invoice' : type === 'job_card' ? 'Workshop Job Card' : 'Payment Receipt'}
              </h3>
              <p className="text-xs text-slate-400">
                {type === 'invoice' ? (data as Invoice).invoiceNumber : type === 'job_card' ? (data as JobCard).jobCardNumber : (data as Payment).paymentNumber}
              </p>
            </div>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setPrintFormat('80MM')}
              className={`px-3 py-1.5 rounded-md transition-all ${format === '80MM' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              80mm Thermal Receipt
            </button>
            <button
              onClick={() => setPrintFormat('A4')}
              className={`px-3 py-1.5 rounded-md transition-all ${format === 'A4' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              A4 Commercial Sheet
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsapp}
              title="Share via WhatsApp"
              className="p-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isGeneratingPdf ? 'GENERATING PDF...' : 'DOWNLOAD PDF'}</span>
            </button>

            <button
              onClick={handleTriggerPrint}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT {format}</span>
            </button>

            <button
              onClick={closePrintPreview}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>CLOSE</span>
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/70 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          {format === '80MM' ? (
            /* ============================================================ */
            /* 80MM THERMAL RECEIPT VIEW                                    */
            /* ============================================================ */
            <div className="w-[80mm] max-w-[80mm] bg-white text-slate-900 p-4 font-mono text-[11px] leading-tight rounded-sm shadow-xl print:shadow-none print:p-2 print:m-0 print:w-[80mm]">
              {/* Header */}
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Wrench className="w-4 h-4 text-slate-900" />
                  <span className="font-extrabold text-sm tracking-tighter uppercase">{settings.workshopName}</span>
                </div>
                <p className="text-[10px] text-slate-600 font-sans">{settings.address}, {settings.city}</p>
                <p className="text-[10px] text-slate-600 font-sans">Tel: {settings.phone}</p>
                <p className="text-[10px] text-slate-600 font-sans">Tax ID: {settings.taxNumber}</p>
              </div>

              {/* Document Meta */}
              {type === 'invoice' && (
                (() => {
                  const inv = data as Invoice;
                  const cust = getCustomer(inv.customerId);
                  const veh = getVehicle(inv.vehicleId);
                  return (
                    <div className="py-2 border-b border-dashed border-slate-300 text-[10px]">
                      <div className="flex justify-between font-bold">
                        <span>INVOICE:</span>
                        <span>{inv.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Date & Time:</span>
                        <span>{new Date(inv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Cashier:</span>
                        <span>{inv.createdBy || 'Staff'}</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-1">
                        <span>Customer:</span>
                        <span className="truncate max-w-[120px]">{cust?.name || 'Walk-in'}</span>
                      </div>
                      {cust?.phone && (
                        <div className="flex justify-between text-slate-600">
                          <span>Phone:</span>
                          <span>{cust.phone}</span>
                        </div>
                      )}
                      {veh && (
                        <div className="mt-1 pt-1 border-t border-dotted border-slate-200">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>Vehicle:</span>
                            <span>{veh.regNumber}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Make/Model:</span>
                            <span className="truncate max-w-[120px]">{veh.make} {veh.model}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Mileage:</span>
                            <span>{veh.mileage.toLocaleString()} KM</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {type === 'job_card' && (
                (() => {
                  const jc = data as JobCard;
                  const cust = getCustomer(jc.customerId);
                  const veh = getVehicle(jc.vehicleId);
                  const mech = getMechanic(jc.assignedMechanicId);
                  return (
                    <div className="py-2 border-b border-dashed border-slate-300 text-[10px]">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>JOB CARD:</span>
                        <span>{jc.jobCardNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Status:</span>
                        <span className="font-bold uppercase text-slate-800">{jc.status}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Date:</span>
                        <span>{new Date(jc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 font-semibold mt-1">
                        <span>Customer:</span>
                        <span>{cust?.name || 'Walk-in'}</span>
                      </div>
                      {veh && (
                        <div className="mt-1 pt-1 border-t border-dotted border-slate-200">
                          <div className="flex justify-between font-bold">
                            <span>Reg No:</span>
                            <span>{veh.regNumber}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Model:</span>
                            <span>{veh.make} {veh.model}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Mileage:</span>
                            <span>{jc.mileage.toLocaleString()} KM</span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600 mt-1">
                        <span>Mechanic:</span>
                        <span>{mech?.name || 'Technician'}</span>
                      </div>
                    </div>
                  );
                })()
              )}

              {type === 'payment_receipt' && (
                (() => {
                  const pay = data as Payment;
                  const cust = getCustomer(pay.customerId);
                  return (
                    <div className="py-2 border-b border-dashed border-slate-300 text-[10px]">
                      <div className="flex justify-between font-bold">
                        <span>RECEIPT:</span>
                        <span>{pay.paymentNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Date:</span>
                        <span>{new Date(pay.date).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-1">
                        <span>Customer:</span>
                        <span>{cust?.name || 'Customer'}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Method:</span>
                        <span>{pay.method}</span>
                      </div>
                      {pay.reference && (
                        <div className="flex justify-between text-slate-600">
                          <span>Ref:</span>
                          <span>{pay.reference}</span>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* Items List */}
              {type === 'invoice' && (
                <div className="py-2 border-b border-dashed border-slate-300">
                  <div className="grid grid-cols-12 font-bold text-[9px] pb-1 border-b border-slate-200 text-slate-700">
                    <span className="col-span-6">ITEM</span>
                    <span className="col-span-2 text-center">QTY</span>
                    <span className="col-span-4 text-right">AMT</span>
                  </div>
                  <div className="divide-y divide-dotted divide-slate-200 pt-1 space-y-1">
                    {(data as Invoice).items.map((it, idx) => (
                      <div key={idx} className="pt-1">
                        <div className="font-semibold text-slate-900 leading-tight">{it.description}</div>
                        <div className="grid grid-cols-12 text-[10px] text-slate-600">
                          <span className="col-span-6 text-[9px] text-slate-500">{it.itemType}</span>
                          <span className="col-span-2 text-center">{it.quantity}</span>
                          <span className="col-span-4 text-right font-medium text-slate-900">{settings.currency}{it.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {type === 'job_card' && (
                <div className="py-2 border-b border-dashed border-slate-300 space-y-2 text-[10px]">
                  <div>
                    <span className="font-bold block text-slate-800">CUSTOMER COMPLAINT:</span>
                    <p className="text-slate-600 font-sans italic text-[9px]">{(data as JobCard).complaint}</p>
                  </div>
                  <div>
                    <span className="font-bold block text-slate-800">SERVICES:</span>
                    {(data as JobCard).services.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>• {s.name}</span>
                        <span>{settings.currency}{s.labourPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {(data as JobCard).parts.length > 0 && (
                    <div>
                      <span className="font-bold block text-slate-800">PARTS:</span>
                      {(data as JobCard).parts.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span>• {p.name} (x{p.quantity})</span>
                          <span>{settings.currency}{p.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Totals Section */}
              {type === 'invoice' && (
                (() => {
                  const inv = data as Invoice;
                  return (
                    <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span>{settings.currency}{inv.subtotal.toFixed(2)}</span>
                      </div>
                      {inv.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount:</span>
                          <span>-{settings.currency}{inv.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Tax ({settings.defaultTaxRate}%):</span>
                        <span>{settings.currency}{inv.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-800 text-slate-950">
                        <span>GRAND TOTAL:</span>
                        <span>{settings.currency}{inv.grandTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 pt-1">
                        <span>Paid ({inv.paymentMethod}):</span>
                        <span className="font-bold">{settings.currency}{inv.paidAmount.toFixed(2)}</span>
                      </div>
                      {inv.dueAmount > 0 && (
                        <div className="flex justify-between text-rose-600 font-bold">
                          <span>Balance Due:</span>
                          <span>{settings.currency}{inv.dueAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {type === 'payment_receipt' && (
                (() => {
                  const pay = data as Payment;
                  return (
                    <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
                      <div className="flex justify-between font-extrabold text-xs pt-1 text-slate-950">
                        <span>AMOUNT RECEIVED:</span>
                        <span>{settings.currency}{pay.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Payment Method:</span>
                        <span className="font-bold">{pay.method}</span>
                      </div>
                    </div>
                  );
                })()
              )}

              {type === 'job_card' && (
                (() => {
                  const jc = data as JobCard;
                  return (
                    <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Labour Cost:</span>
                        <span>{settings.currency}{jc.labourCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Parts Cost:</span>
                        <span>{settings.currency}{jc.partsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-800 text-slate-950">
                        <span>ESTIMATE TOTAL:</span>
                        <span>{settings.currency}{jc.actualCost.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Barcode & Footer */}
              <div className="pt-3 text-center space-y-2">
                <div className="font-mono text-[9px] tracking-widest bg-slate-100 py-1 border border-slate-200">
                  *{(type === 'invoice' ? (data as Invoice).invoiceNumber : (type === 'job_card' ? (data as JobCard).jobCardNumber : (data as Payment).paymentNumber))}*
                </div>
                <p className="text-[9px] text-slate-500 whitespace-pre-line font-sans">
                  {settings.printSettings.receiptFooter}
                </p>
                <div className="text-[8px] text-slate-400">
                  Powered by Advance Auto Workshop POS
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* A4 COMMERCIAL SHEET VIEW                                     */
            /* ============================================================ */
            <div className="w-[210mm] min-h-[297mm] max-w-[210mm] bg-white text-slate-900 p-8 sm:p-12 font-sans text-xs leading-normal shadow-2xl rounded-sm print:shadow-none print:p-0 print:m-0 print:w-full">
              {/* Header with Workshop Brand & Document Title */}
              <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
                <div className="space-y-1 max-w-[340px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg">
                      A
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-950 uppercase">
                      {settings.workshopName}
                    </h1>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{settings.tagline}</p>
                  <div className="pt-2 text-[11px] text-slate-500 space-y-0.5">
                    <p className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> <span>{settings.address}, {settings.city}</span></p>
                    <p className="flex items-center space-x-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> <span>{settings.phone}</span></p>
                    <p className="flex items-center space-x-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> <span>{settings.email}</span></p>
                    <p className="font-semibold text-slate-700">Tax Reg: {settings.taxNumber}</p>
                  </div>
                </div>

                <div className="text-right space-y-1.5">
                  <div className="inline-block px-3 py-1 bg-slate-950 text-white font-extrabold text-sm uppercase tracking-wider rounded">
                    {type === 'invoice' ? 'TAX INVOICE' : type === 'job_card' ? 'WORKSHOP JOB CARD' : 'PAYMENT RECEIPT'}
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    {type === 'invoice' ? (data as Invoice).invoiceNumber : type === 'job_card' ? (data as JobCard).jobCardNumber : (data as Payment).paymentNumber}
                  </div>
                  <p className="text-xs text-slate-500">
                    Date: <span className="font-semibold text-slate-800">
                      {new Date(type === 'invoice' ? (data as Invoice).createdAt : (type === 'job_card' ? (data as JobCard).createdAt : (data as Payment).date)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </p>
                  {type === 'invoice' && (
                    <div className="pt-1">
                      <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded ${
                        (data as Invoice).status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        (data as Invoice).status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        Status: {(data as Invoice).status}
                      </span>
                    </div>
                  )}
                  {type === 'job_card' && (
                    <div className="pt-1">
                      <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-blue-100 text-blue-900">
                        Workflow: {(data as JobCard).status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Vehicle Info Boxes */}
              <div className="grid grid-cols-2 gap-6 my-6">
                {/* Customer Box */}
                {(() => {
                  const custId = type === 'invoice' ? (data as Invoice).customerId : (type === 'job_card' ? (data as JobCard).customerId : (data as Payment).customerId);
                  const cust = getCustomer(custId);
                  return (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Customer Information</h4>
                      <p className="text-sm font-bold text-slate-900">{cust?.name || 'Walk-in Customer'}</p>
                      <p className="text-slate-600 mt-0.5">{cust?.phone || 'No phone'}</p>
                      {cust?.email && <p className="text-slate-600">{cust.email}</p>}
                      {cust?.address && <p className="text-slate-500 text-[11px] mt-1">{cust.address}</p>}
                      {cust?.taxId && <p className="text-slate-500 text-[11px]">Tax/CNIC: {cust.taxId}</p>}
                    </div>
                  );
                })()}

                {/* Vehicle Box */}
                {(() => {
                  const vehId = type === 'invoice' ? (data as Invoice).vehicleId : (type === 'job_card' ? (data as JobCard).vehicleId : undefined);
                  const veh = getVehicle(vehId);
                  return (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Vehicle Specification</h4>
                      {veh ? (
                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-base font-extrabold text-slate-950 font-mono bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                              {veh.regNumber}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">{veh.year} {veh.make} {veh.model}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                            <div><span className="text-slate-400">Variant:</span> {veh.variant || 'Standard'}</div>
                            <div><span className="text-slate-400">Color:</span> {veh.color}</div>
                            <div><span className="text-slate-400">Fuel:</span> {veh.fuelType}</div>
                            <div><span className="text-slate-400">Odometer:</span> {veh.mileage.toLocaleString()} KM</div>
                            {veh.vin && <div className="col-span-2 text-[10px] font-mono text-slate-500">VIN: {veh.vin}</div>}
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No vehicle attached to this transaction</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Job Card Specific Complaint & Inspection Highlights */}
              {type === 'job_card' && (
                (() => {
                  const jc = data as JobCard;
                  return (
                    <div className="mb-6 space-y-4">
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Customer Reported Fault / Complaint:</span>
                        <p className="text-slate-800 font-medium text-xs mt-1">{jc.complaint}</p>
                      </div>

                      {jc.recommendedWork && (
                        <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs">
                          <span className="font-bold text-slate-700">Workshop Recommendation: </span>
                          <span className="text-slate-600">{jc.recommendedWork}</span>
                        </div>
                      )}

                      {/* Inspection Summary Matrix */}
                      <div className="border border-slate-200 rounded-lg p-3">
                        <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Multi-Point Safety Inspection Snapshot</span>
                        </h4>
                        <div className="grid grid-cols-5 gap-2 text-[10px]">
                          <div className="p-2 bg-slate-50 rounded">
                            <span className="font-bold block text-slate-700">Engine & Belts</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${jc.inspection?.engine?.oil?.status === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {jc.inspection?.engine?.oil?.status || 'Good'}
                            </span>
                            <p className="text-[9px] text-slate-500 mt-1 truncate">{jc.inspection?.engine?.oil?.notes || 'Checked'}</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded">
                            <span className="font-bold block text-slate-700">Braking Discs/Pads</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${jc.inspection?.brakes?.brakePads?.status === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                              {jc.inspection?.brakes?.brakePads?.status || 'Good'}
                            </span>
                            <p className="text-[9px] text-slate-500 mt-1 truncate">{jc.inspection?.brakes?.brakePads?.notes || 'Checked'}</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded">
                            <span className="font-bold block text-slate-700">Tyres & Tread</span>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                              {jc.inspection?.tyres?.frontLeft?.status || 'Good'}
                            </span>
                            <p className="text-[9px] text-slate-500 mt-1 truncate">{jc.inspection?.tyres?.frontLeft?.notes || 'Checked'}</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded">
                            <span className="font-bold block text-slate-700">AC & Electrical</span>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                              {jc.inspection?.electrical?.battery?.status || 'Good'}
                            </span>
                            <p className="text-[9px] text-slate-500 mt-1 truncate">{jc.inspection?.electrical?.battery?.notes || 'Checked'}</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded">
                            <span className="font-bold block text-slate-700">Suspension</span>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                              {jc.inspection?.suspension?.shocks?.status || 'Good'}
                            </span>
                            <p className="text-[9px] text-slate-500 mt-1 truncate">{jc.inspection?.suspension?.shocks?.notes || 'Checked'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Items & Services Table */}
              <div className="mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3 rounded-l">#</th>
                      <th className="py-2.5 px-3">Description / Item</th>
                      <th className="py-2.5 px-3 text-center">Type</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Disc</th>
                      <th className="py-2.5 px-3 text-right rounded-r">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {type === 'invoice' && (data as Invoice).items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {it.description}
                          {it.sku && <span className="block text-[10px] font-mono text-slate-500">SKU: {it.sku}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            it.itemType === 'Service' || it.itemType === 'Labour' ? 'bg-blue-100 text-blue-800' :
                            it.itemType === 'Tyre' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {it.itemType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-medium">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{settings.currency}{it.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                          {it.discount > 0 ? `-${settings.currency}${it.discount.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                          {settings.currency}{it.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {type === 'job_card' && (
                      <>
                        {(data as JobCard).services.map((s, idx) => (
                          <tr key={`srv-${idx}`} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                            <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">Labour</span></td>
                            <td className="py-2.5 px-3 text-center font-mono">1</td>
                            <td className="py-2.5 px-3 text-right font-mono">{settings.currency}{s.labourPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono">-</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">{settings.currency}{s.labourPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                        {(data as JobCard).parts.map((p, idx) => (
                          <tr key={`prt-${idx}`} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{(data as JobCard).services.length + idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                            <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">Spare Part</span></td>
                            <td className="py-2.5 px-3 text-center font-mono">{p.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{settings.currency}{p.unitPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono">-</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">{settings.currency}{p.totalPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & Notes Section */}
              <div className="grid grid-cols-12 gap-8 pt-4 border-t border-slate-200">
                <div className="col-span-7 space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800 block mb-1">Standard Terms & Warranty Conditions:</span>
                    <p className="whitespace-pre-line leading-relaxed">{settings.printSettings.termsAndConditions}</p>
                  </div>
                  {type === 'invoice' && (data as Invoice).notes && (
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">Special Notes: </span>
                      <span>{(data as Invoice).notes}</span>
                    </div>
                  )}
                </div>

                <div className="col-span-5 space-y-2 text-xs">
                  {type === 'invoice' && (
                    (() => {
                      const inv = data as Invoice;
                      return (
                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-2">
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal:</span>
                            <span className="font-mono font-medium">{settings.currency}{inv.subtotal.toFixed(2)}</span>
                          </div>
                          {inv.discount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>Special Discount:</span>
                              <span className="font-mono">-{settings.currency}{inv.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-600">
                            <span>VAT / Sales Tax ({settings.defaultTaxRate}%):</span>
                            <span className="font-mono">{settings.currency}{inv.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-extrabold text-sm pt-2 border-t-2 border-slate-900 text-slate-950">
                            <span>Grand Total:</span>
                            <span className="font-mono">{settings.currency}{inv.grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                            <span>Paid ({inv.paymentMethod}):</span>
                            <span className="font-mono font-bold">{settings.currency}{inv.paidAmount.toFixed(2)}</span>
                          </div>
                          {inv.dueAmount > 0 && (
                            <div className="flex justify-between text-rose-600 font-bold">
                              <span>Outstanding Due:</span>
                              <span className="font-mono">{settings.currency}{inv.dueAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}

                  {type === 'job_card' && (
                    (() => {
                      const jc = data as JobCard;
                      return (
                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-2">
                          <div className="flex justify-between text-slate-600">
                            <span>Labour Total:</span>
                            <span className="font-mono">{settings.currency}{jc.labourCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Parts Total:</span>
                            <span className="font-mono">{settings.currency}{jc.partsCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Tax ({settings.defaultTaxRate}%):</span>
                            <span className="font-mono">{settings.currency}{jc.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-extrabold text-sm pt-2 border-t-2 border-slate-900 text-slate-950">
                            <span>Estimated Total:</span>
                            <span className="font-mono">{settings.currency}{jc.actualCost.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Signatures Row */}
              <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-3 gap-8 text-center text-xs text-slate-500">
                <div>
                  <div className="border-b border-slate-400 mb-2 h-10"></div>
                  <p className="font-semibold text-slate-800">Technician / Inspector</p>
                  <p className="text-[10px]">Quality Verification</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 mb-2 h-10"></div>
                  <p className="font-semibold text-slate-800">Authorized Workshop Signatory</p>
                  <p className="text-[10px]">{settings.workshopName}</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 mb-2 h-10"></div>
                  <p className="font-semibold text-slate-800">Customer Acceptance</p>
                  <p className="text-[10px]">I accept the work & vehicle handover</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
