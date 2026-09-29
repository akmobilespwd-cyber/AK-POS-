import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Search, DollarSign, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { PrintButton } from '../components/printing/PrintButton';

export const PaymentsPage: React.FC = () => {
  const { payments, customers, invoices, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');

  const filteredPayments = payments.filter(p => {
    if (methodFilter !== 'All' && p.method !== methodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cust = customers.find(c => c.id === p.customerId);
      return (
        p.paymentNumber.toLowerCase().includes(q) ||
        (p.reference && p.reference.toLowerCase().includes(q)) ||
        (cust && cust.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCustomer = (id?: string) => customers.find(c => c.id === id);
  const getInvoice = (id?: string) => invoices.find(i => i.id === id);

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Customer Payments & Receipts
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cash register receipts, credit card settlements, mobile wallet and wire transfers
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
              placeholder="Search receipt #, reference, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Mobile Wallet">Mobile Wallet</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredPayments.length}</span> payment logs
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice Linked</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4">Reference / Memo</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPayments.map(p => {
                const cust = getCustomer(p.customerId);
                const inv = getInvoice(p.invoiceId);

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {p.paymentNumber}
                      <span className="block text-[10px] text-slate-500 font-sans font-normal">
                        {new Date(p.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {cust?.name || 'Customer'}
                      <span className="text-[10px] text-slate-500 font-normal block">{cust?.phone}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {inv ? inv.invoiceNumber : 'Account Balance'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {p.method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] truncate max-w-xs">
                      {p.reference || p.notes || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                      {settings.currency}{p.amount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <PrintButton type="payment_receipt" data={p} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
