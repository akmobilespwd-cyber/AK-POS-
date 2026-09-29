import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, Printer, Download, Wrench, ShieldCheck, 
  MapPin, Phone, Mail, FileText 
} from 'lucide-react';
import { Invoice, JobCard, Payment } from '../types';
import { downloadDocumentPdf } from '../utils/printAndPdfService';

interface DedicatedPrintPageProps {
  type: 'invoice' | 'job_card' | 'payment_receipt';
  data: any;
  format: '80MM' | 'A4';
  onBack: () => void;
}

export const DedicatedPrintPage: React.FC<DedicatedPrintPageProps> = ({
  type,
  data,
  format: initialFormat,
  onBack,
}) => {
  const { settings, customers, vehicles, mechanics, addToast } = useApp();
  const [currentFormat, setCurrentFormat] = useState<'80MM' | 'A4'>(initialFormat);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const getCustomer = (id?: string) => customers.find(c => c.id === id);
  const getVehicle = (id?: string) => vehicles.find(v => v.id === id);
  const getMechanic = (id?: string) => mechanics.find(m => m.id === id);

  const custId = type === 'invoice' ? (data as Invoice)?.customerId : (type === 'job_card' ? (data as JobCard)?.customerId : (data as Payment)?.customerId);
  const vehId = type === 'invoice' ? (data as Invoice)?.vehicleId : (type === 'job_card' ? (data as JobCard)?.vehicleId : undefined);
  const mechId = type === 'job_card' ? (data as JobCard)?.assignedMechanicId : undefined;

  const cust = getCustomer(custId);
  const veh = getVehicle(vehId);
  const mech = getMechanic(mechId);

  // Automatically invoke browser print dialog on mount
  useEffect(() => {
    addToast('info', 'Opening print dialog...', 'Preparing document for printing');
    const timer = setTimeout(() => {
      try {
        window.focus();
        window.print();
        addToast('success', 'Print dialog opened.', 'Browser print dialog displayed');
      } catch (err) {
        console.error('Window print failed:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handlePrintAgain = () => {
    addToast('info', 'Opening print dialog...', 'Preparing document for printing');
    setTimeout(() => {
      window.focus();
      window.print();
      addToast('success', 'Print dialog opened.', 'Browser print dialog displayed');
    }, 150);
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        const filename = downloadDocumentPdf(type, data, cust, veh, settings, mech);
        addToast('success', 'PDF downloaded successfully', `${filename} saved to downloads`);
      } catch (err) {
        console.error(err);
        addToast('error', 'PDF Error', 'Unable to generate PDF. Please try again.');
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans print:bg-white print:text-black print:min-h-0">
      {/* ======================================================== */}
      {/* TOP ACTION BAR (Strictly hidden during printing)         */}
      {/* ======================================================== */}
      <div className="no-print sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>BACK TO POS</span>
            </button>

            <div className="hidden sm:block">
              <span className="text-xs text-slate-400">Document: </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {type === 'invoice' ? (data as Invoice)?.invoiceNumber : type === 'job_card' ? (data as JobCard)?.jobCardNumber : (data as Payment)?.paymentNumber}
              </span>
            </div>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setCurrentFormat('80MM')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                currentFormat === '80MM' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              80mm Thermal Receipt
            </button>
            <button
              onClick={() => setCurrentFormat('A4')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                currentFormat === 'A4' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              A4 Commercial Sheet
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isGeneratingPdf ? 'GENERATING PDF...' : 'DOWNLOAD PDF'}</span>
            </button>

            <button
              onClick={handlePrintAgain}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT AGAIN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner when fallback triggered */}
      <div className="no-print bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300">
        Dedicated Print View Active — System print dialog was initiated. Use "Print Again" if you need to re-open it, or click "Back to POS" when finished.
      </div>

      {/* ======================================================== */}
      {/* PRINTABLE DOCUMENT VIEW                                  */}
      {/* ======================================================== */}
      <div className="flex-1 p-4 sm:p-8 flex justify-center items-start overflow-y-auto print:p-0 print:m-0 print:overflow-visible">
        {currentFormat === '80MM' ? (
          /* ---------------------------------------------------- */
          /* 80MM THERMAL RECEIPT                                 */
          /* ---------------------------------------------------- */
          <div className="w-[80mm] max-w-[80mm] bg-white text-black p-4 font-mono text-[11px] leading-tight shadow-2xl rounded-sm print:shadow-none print:p-1 print:m-0 print:w-[80mm]">
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-neutral-400">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Wrench className="w-4 h-4 text-black" />
                <span className="font-extrabold text-sm tracking-tighter uppercase">{settings.workshopName}</span>
              </div>
              <p className="text-[10px] text-neutral-700 font-sans">{settings.address}, {settings.city}</p>
              <p className="text-[10px] text-neutral-700 font-sans">Tel: {settings.phone}</p>
              <p className="text-[10px] text-neutral-700 font-sans">Tax ID: {settings.taxNumber}</p>
            </div>

            {/* Document Meta */}
            {type === 'invoice' && (
              (() => {
                const inv = data as Invoice;
                return (
                  <div className="py-2 border-b border-dashed border-neutral-400 text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span>INVOICE:</span>
                      <span>{inv.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Date & Time:</span>
                      <span>{new Date(inv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Cashier:</span>
                      <span>{inv.createdBy || 'Staff'}</span>
                    </div>
                    <div className="flex justify-between font-semibold mt-1">
                      <span>Customer:</span>
                      <span className="truncate max-w-[120px]">{cust?.name || 'Walk-in'}</span>
                    </div>
                    {cust?.phone && (
                      <div className="flex justify-between text-neutral-700">
                        <span>Phone:</span>
                        <span>{cust.phone}</span>
                      </div>
                    )}
                    {veh && (
                      <div className="mt-1 pt-1 border-t border-dotted border-neutral-300">
                        <div className="flex justify-between font-bold text-black">
                          <span>Vehicle:</span>
                          <span>{veh.regNumber}</span>
                        </div>
                        <div className="flex justify-between text-neutral-700">
                          <span>Make/Model:</span>
                          <span className="truncate max-w-[120px]">{veh.make} {veh.model}</span>
                        </div>
                        <div className="flex justify-between text-neutral-700">
                          <span>Mileage:</span>
                          <span>{veh.mileage?.toLocaleString() || 0} KM</span>
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
                return (
                  <div className="py-2 border-b border-dashed border-neutral-400 text-[10px]">
                    <div className="flex justify-between font-bold text-black">
                      <span>JOB CARD:</span>
                      <span>{jc.jobCardNumber}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Status:</span>
                      <span className="font-bold uppercase text-black">{jc.status}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Date:</span>
                      <span>{new Date(jc.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-black font-semibold mt-1">
                      <span>Customer:</span>
                      <span>{cust?.name || 'Walk-in'}</span>
                    </div>
                    {veh && (
                      <div className="mt-1 pt-1 border-t border-dotted border-neutral-300">
                        <div className="flex justify-between font-bold">
                          <span>Reg No:</span>
                          <span>{veh.regNumber}</span>
                        </div>
                        <div className="flex justify-between text-neutral-700">
                          <span>Model:</span>
                          <span>{veh.make} {veh.model}</span>
                        </div>
                        <div className="flex justify-between text-neutral-700">
                          <span>Mileage:</span>
                          <span>{jc.mileage?.toLocaleString() || 0} KM</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-700 mt-1">
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
                return (
                  <div className="py-2 border-b border-dashed border-neutral-400 text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span>RECEIPT:</span>
                      <span>{pay.paymentNumber}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Date:</span>
                      <span>{new Date(pay.date).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold mt-1">
                      <span>Customer:</span>
                      <span>{cust?.name || 'Customer'}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Method:</span>
                      <span>{pay.method}</span>
                    </div>
                    {pay.reference && (
                      <div className="flex justify-between text-neutral-700">
                        <span>Ref:</span>
                        <span>{pay.reference}</span>
                      </div>
                    )}
                  </div>
                );
              })()
            )}

            {/* Items Table for Invoice */}
            {type === 'invoice' && (
              <div className="py-2 border-b border-dashed border-neutral-400">
                <div className="grid grid-cols-12 font-bold text-[9px] pb-1 border-b border-neutral-300 text-black">
                  <span className="col-span-6">ITEM</span>
                  <span className="col-span-2 text-center">QTY</span>
                  <span className="col-span-4 text-right">AMT</span>
                </div>
                <div className="divide-y divide-dotted divide-neutral-300 pt-1 space-y-1">
                  {(data as Invoice)?.items?.map((it, idx) => (
                    <div key={idx} className="pt-1">
                      <div className="font-semibold text-black leading-tight">{it.description}</div>
                      <div className="grid grid-cols-12 text-[10px] text-neutral-700">
                        <span className="col-span-6 text-[9px] text-neutral-600">{it.itemType}</span>
                        <span className="col-span-2 text-center">{it.quantity}</span>
                        <span className="col-span-4 text-right font-medium text-black">{settings.currency}{Number(it.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals Section */}
            {type === 'invoice' && (
              (() => {
                const inv = data as Invoice;
                return (
                  <div className="py-2 border-b border-dashed border-neutral-400 space-y-1 text-[10px]">
                    <div className="flex justify-between text-neutral-700">
                      <span>Subtotal:</span>
                      <span>{settings.currency}{Number(inv.subtotal || 0).toFixed(2)}</span>
                    </div>
                    {Number(inv.discount || 0) > 0 && (
                      <div className="flex justify-between text-black font-semibold">
                        <span>Discount:</span>
                        <span>-{settings.currency}{Number(inv.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-700">
                      <span>Tax ({settings.defaultTaxRate}%):</span>
                      <span>{settings.currency}{Number(inv.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-black text-black">
                      <span>GRAND TOTAL:</span>
                      <span>{settings.currency}{Number(inv.grandTotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-800 pt-1">
                      <span>Paid ({inv.paymentMethod}):</span>
                      <span className="font-bold">{settings.currency}{Number(inv.paidAmount || 0).toFixed(2)}</span>
                    </div>
                    {Number(inv.dueAmount || 0) > 0 && (
                      <div className="flex justify-between text-black font-bold">
                        <span>Balance Due:</span>
                        <span>{settings.currency}{Number(inv.dueAmount).toFixed(2)}</span>
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
                  <div className="py-2 border-b border-dashed border-neutral-400 space-y-1 text-[10px]">
                    <div className="flex justify-between font-extrabold text-xs pt-1 text-black">
                      <span>AMOUNT RECEIVED:</span>
                      <span>{settings.currency}{Number(pay.amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
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
                  <div className="py-2 border-b border-dashed border-neutral-400 space-y-1 text-[10px]">
                    <div className="flex justify-between text-neutral-700">
                      <span>Labour Cost:</span>
                      <span>{settings.currency}{Number(jc.labourCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Parts Cost:</span>
                      <span>{settings.currency}{Number(jc.partsCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-black text-black">
                      <span>ESTIMATE TOTAL:</span>
                      <span>{settings.currency}{Number(jc.actualCost || 0).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Barcode & Footer */}
            <div className="pt-3 text-center space-y-2">
              <div className="font-mono text-[9px] tracking-widest bg-neutral-100 py-1 border border-neutral-300 text-black">
                *{(type === 'invoice' ? (data as Invoice)?.invoiceNumber : (type === 'job_card' ? (data as JobCard)?.jobCardNumber : (data as Payment)?.paymentNumber))}*
              </div>
              <p className="text-[9px] text-neutral-600 whitespace-pre-line font-sans">
                {settings.printSettings.receiptFooter}
              </p>
              <div className="text-[8px] text-neutral-500">
                Powered by Advance Auto Workshop POS
              </div>
            </div>
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* A4 COMMERCIAL SHEET                                  */
          /* ---------------------------------------------------- */
          <div className="w-[210mm] min-h-[297mm] max-w-[210mm] bg-white text-slate-900 p-8 sm:p-12 font-sans text-xs leading-normal shadow-2xl rounded-sm print:shadow-none print:p-0 print:m-0 print:w-full">
            {/* Header */}
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
                  {type === 'invoice' ? (data as Invoice)?.invoiceNumber : type === 'job_card' ? (data as JobCard)?.jobCardNumber : (data as Payment)?.paymentNumber}
                </div>
                <p className="text-xs text-slate-500">
                  Date: <span className="font-semibold text-slate-800">
                    {new Date(type === 'invoice' ? (data as Invoice)?.createdAt : (type === 'job_card' ? (data as JobCard)?.createdAt : (data as Payment)?.date)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </p>
              </div>
            </div>

            {/* Customer & Vehicle Info Boxes */}
            <div className="grid grid-cols-2 gap-6 my-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Customer Information</h4>
                <p className="text-sm font-bold text-slate-900">{cust?.name || 'Walk-in Customer'}</p>
                <p className="text-slate-600 mt-0.5">{cust?.phone || 'No phone'}</p>
                {cust?.email && <p className="text-slate-600">{cust.email}</p>}
                {cust?.address && <p className="text-slate-500 text-[11px] mt-1">{cust.address}</p>}
              </div>

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
                      <div><span className="text-slate-400">Color:</span> {veh.color}</div>
                      <div><span className="text-slate-400">Fuel:</span> {veh.fuelType}</div>
                      <div><span className="text-slate-400">Odometer:</span> {veh.mileage?.toLocaleString() || 0} KM</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No vehicle attached to this transaction</p>
                )}
              </div>
            </div>

            {/* Invoice Items Table */}
            {type === 'invoice' && (
              <div className="mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Description / Item</th>
                      <th className="py-2 px-3 text-center">Type</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Rate</th>
                      <th className="py-2 px-3 text-right">Disc</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {(data as Invoice)?.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{it.description}</td>
                        <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-semibold">{it.itemType}</span></td>
                        <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">{settings.currency}{Number(it.unitPrice || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-600">{Number(it.discount || 0) > 0 ? `-${settings.currency}${Number(it.discount).toFixed(2)}` : '-'}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">{settings.currency}{Number(it.total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals & Notes */}
            <div className="grid grid-cols-12 gap-8 pt-4 border-t border-slate-200">
              <div className="col-span-7 space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800 block mb-1">Standard Terms & Conditions:</span>
                  <p className="whitespace-pre-line leading-relaxed">{settings.printSettings.termsAndConditions}</p>
                </div>
              </div>

              <div className="col-span-5 space-y-2 text-xs">
                {type === 'invoice' && (
                  (() => {
                    const inv = data as Invoice;
                    return (
                      <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-2">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-mono">{settings.currency}{Number(inv.subtotal || 0).toFixed(2)}</span>
                        </div>
                        {Number(inv.discount || 0) > 0 && (
                          <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Discount:</span>
                            <span className="font-mono">-{settings.currency}{Number(inv.discount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                          <span>VAT / Sales Tax ({settings.defaultTaxRate}%):</span>
                          <span className="font-mono">{settings.currency}{Number(inv.tax || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-sm pt-2 border-t-2 border-slate-900 text-slate-950">
                          <span>Grand Total:</span>
                          <span className="font-mono">{settings.currency}{Number(inv.grandTotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                          <span>Paid ({inv.paymentMethod}):</span>
                          <span className="font-mono font-bold">{settings.currency}{Number(inv.paidAmount || 0).toFixed(2)}</span>
                        </div>
                        {Number(inv.dueAmount || 0) > 0 && (
                          <div className="flex justify-between text-rose-600 font-bold">
                            <span>Outstanding Due:</span>
                            <span className="font-mono">{settings.currency}{Number(inv.dueAmount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 text-center mt-12 pt-6 border-t border-slate-200 text-xs">
              <div>
                <div className="border-b border-slate-300 h-8 mb-2"></div>
                <span className="text-slate-600 font-medium">Technician / Inspector</span>
              </div>
              <div>
                <div className="border-b border-slate-300 h-8 mb-2"></div>
                <span className="text-slate-600 font-medium">Authorized Signatory</span>
              </div>
              <div>
                <div className="border-b border-slate-300 h-8 mb-2"></div>
                <span className="text-slate-600 font-medium">Customer Acceptance</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
