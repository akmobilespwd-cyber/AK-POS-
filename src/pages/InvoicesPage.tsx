import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, Search, Filter, DollarSign, CheckCircle2, 
  Clock, AlertTriangle, Eye, CreditCard, User, Car, Download,
  Printer, FileText
} from 'lucide-react';
import { Invoice, PaymentMethod } from '../types';
import { 
  downloadDocumentPdf, 
  openSynchronousPrintWindow,
  executePrintWithFallback 
} from '../utils/printAndPdfService';

export const InvoicesPage: React.FC = () => {
  const { 
    invoices, 
    customers, 
    vehicles, 
    addInvoicePayment, 
    openPrintPreview, 
    openSameTabPrint,
    settings,
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Collect Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [collectMethod, setCollectMethod] = useState<PaymentMethod>('Cash');
  const [collectRef, setCollectRef] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cust = customers.find(c => c.id === inv.customerId);
      const veh = vehicles.find(v => v.id === inv.vehicleId);
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (cust && cust.name.toLowerCase().includes(q)) ||
        (veh && veh.regNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCustomer = (id?: string) => customers.find(c => c.id === id);
  const getVehicle = (id?: string) => vehicles.find(v => v.id === id);

  const handlePrint80mm = (inv: Invoice) => {
    const cust = getCustomer(inv.customerId);
    const veh = getVehicle(inv.vehicleId);
    // 1. Immediately open print window synchronously from the click gesture!
    const win = openSynchronousPrintWindow('80MM');

    executePrintWithFallback({
      type: 'invoice',
      data: inv,
      format: '80MM',
      customer: cust,
      vehicle: veh,
      settings,
      onPreparing: (msg) => addToast('info', 'Printing', msg),
      onOpening: (msg) => addToast('info', 'Printing', msg),
      onOpened: (msg) => addToast('success', 'Print Dialog', msg),
      onBlocked: (msg) => addToast('warning', 'Print Window Blocked', msg),
      onError: (msg) => addToast('error', 'Print Error', msg),
      onFallback: () => {
        openSameTabPrint('invoice', inv, '80MM', 'invoices');
      },
    }, win);
  };

  const handlePrintA4 = (inv: Invoice) => {
    const cust = getCustomer(inv.customerId);
    const veh = getVehicle(inv.vehicleId);
    // 1. Immediately open print window synchronously from the click gesture!
    const win = openSynchronousPrintWindow('A4');

    executePrintWithFallback({
      type: 'invoice',
      data: inv,
      format: 'A4',
      customer: cust,
      vehicle: veh,
      settings,
      onPreparing: (msg) => addToast('info', 'Printing', msg),
      onOpening: (msg) => addToast('info', 'Printing', msg),
      onOpened: (msg) => addToast('success', 'Print Dialog', msg),
      onBlocked: (msg) => addToast('warning', 'Print Window Blocked', msg),
      onError: (msg) => addToast('error', 'Print Error', msg),
      onFallback: () => {
        openSameTabPrint('invoice', inv, 'A4', 'invoices');
      },
    }, win);
  };

  const handleDownloadPdf = (inv: Invoice) => {
    setTimeout(() => {
      try {
        const cust = getCustomer(inv.customerId);
        const veh = getVehicle(inv.vehicleId);
        const filename = downloadDocumentPdf('invoice', inv, cust, veh, settings);
        addToast('success', 'PDF downloaded successfully', `${filename} saved to downloads`);
      } catch (err) {
        console.error(err);
        addToast('error', 'PDF Error', 'Unable to generate PDF. Please try again.');
      }
    }, 150);
  };

  const handleOpenPreview = (inv: Invoice) => {
    openPrintPreview('invoice', inv, settings.printSettings.defaultFormat || '80MM', false);
  };

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setCollectAmount(inv.dueAmount);
    setCollectMethod('Cash');
    setCollectRef('');
    setIsPayModalOpen(true);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || collectAmount <= 0) return;

    addInvoicePayment(selectedInvoice.id, collectAmount, collectMethod, collectRef);
    setIsPayModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Invoices & Billing Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse tax invoices, manage customer receivables, print 80mm & A4 sheets or export PDF
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice number, client, vehicle plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredInvoices.length}</span> invoices
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Vehicle</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Paid / Balance</th>
                <th className="py-3 px-4 text-center">Print / Collect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.map(inv => {
                const cust = getCustomer(inv.customerId);
                const veh = getVehicle(inv.vehicleId);

                return (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {inv.invoiceNumber}
                      <span className="block text-[10px] text-slate-500 font-sans font-normal">
                        {new Date(inv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">{cust?.name || 'Walk-in'}</span>
                      {veh ? (
                        <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 mt-0.5">
                          <span className="bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700 text-amber-400 font-bold">{veh.regNumber}</span>
                          <span>{veh.make} {veh.model}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No Vehicle</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {inv.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        inv.status === 'Partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                      {settings.currency}{inv.grandTotal.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className="text-emerald-400 font-semibold block text-xs">
                        {settings.currency}{inv.paidAmount.toFixed(2)}
                      </span>
                      {inv.dueAmount > 0 && (
                        <span className="text-rose-400 font-bold text-[11px] block">
                          Due: {settings.currency}{inv.dueAmount.toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {inv.dueAmount > 0 && (
                          <button
                            onClick={() => handleOpenPay(inv)}
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] uppercase shadow transition-colors"
                          >
                            Pay Due
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint80mm(inv)}
                          title="Print 80mm Thermal Receipt"
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-lg text-[10px] flex items-center space-x-1 border border-slate-700 transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                          <span>80mm</span>
                        </button>
                        <button
                          onClick={() => handlePrintA4(inv)}
                          title="Print A4 Full Invoice"
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold rounded-lg text-[10px] flex items-center space-x-1 border border-slate-700 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>A4</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(inv)}
                          title="Download Real PDF File"
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg text-[10px] flex items-center space-x-1 border border-slate-700 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handleOpenPreview(inv)}
                          title="Open Interactive Print Preview"
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Balance Payment Modal */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-base text-white uppercase mb-1">
              Collect Invoice Balance
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Recording settlement for <strong className="text-amber-400">{selectedInvoice.invoiceNumber}</strong>
            </p>

            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Remaining Due Balance:</span>
                <span className="font-mono font-bold text-base text-rose-400">
                  {settings.currency}{selectedInvoice.dueAmount.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount Receiving ($)</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedInvoice.dueAmount}
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={collectMethod}
                  onChange={(e) => setCollectMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Wallet">Mobile Wallet</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="Receipt #, Card Auth code, or note"
                  value={collectRef}
                  onChange={(e) => setCollectRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase"
                >
                  Record & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
