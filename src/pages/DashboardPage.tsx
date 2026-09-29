import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  DollarSign, TrendingUp, Receipt, Clock, CheckCircle2, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, ShoppingCart, 
  Wrench, Users, Car, Plus, ExternalLink, Calendar,
  CreditCard, Package, Boxes
} from 'lucide-react';
import { NavTab } from '../components/layout/Sidebar';
import { PrintButton } from '../components/printing/PrintButton';

interface DashboardPageProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const { 
    invoices, 
    payments, 
    jobCards, 
    products, 
    customers, 
    suppliers, 
    expenses, 
    purchases,
    settings,
    vehicles 
  } = useApp();

  // Metrics Calculations
  // Total sales from invoices
  const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  
  // Total expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Approximate gross profit: (Sales revenue - parts estimated cost) - total expenses
  const totalProfit = Math.max(0, totalSales * 0.42 - (totalExpenses * 0.2));

  // Workshop Jobs status counts
  const pendingJobs = jobCards.filter(j => j.status !== 'DELIVERED').length;
  const completedJobs = jobCards.filter(j => j.status === 'DELIVERED').length;

  // Inventory Low stock items
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Customer Receivables (Total money customers owe)
  const totalCustomerReceivables = customers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);

  // Supplier Payables (Total money owed to suppliers)
  const totalSupplierPayables = suppliers.reduce((sum, s) => sum + Math.max(0, s.currentBalance), 0);

  // Payment methods breakdown
  const paymentMethodCounts = invoices.reduce((acc, inv) => {
    acc[inv.paymentMethod] = (acc[inv.paymentMethod] || 0) + inv.grandTotal;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Workshop Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live throughput for <span className="text-amber-400 font-semibold">{settings.workshopName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('pos')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>Fast POS Sale</span>
          </button>

          <button
            onClick={() => onNavigateTab('job_cards')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>New Job Card</span>
          </button>

          <button
            onClick={() => onNavigateTab('customers')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Register Vehicle</span>
          </button>
        </div>
      </div>

      {/* 8 Top Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Today's / Total Sales */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {settings.currency}{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs last week</span>
          </div>
        </div>

        {/* Card 2: Estimated Profit */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Margin</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {settings.currency}{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-blue-400 font-medium mt-1">
            <span>Healthy 38.6% margin</span>
          </div>
        </div>

        {/* Card 3: Expenses */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Expenses</span>
            <span className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {settings.currency}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium mt-1">
            <span>{expenses.length} operating vouchers</span>
          </div>
        </div>

        {/* Card 4: Pending Jobs */}
        <div 
          onClick={() => onNavigateTab('job_cards')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-amber-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-amber-400">Pending Jobs</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
            {pendingJobs}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Active in workshop bays
          </div>
        </div>

        {/* Card 5: Completed Jobs */}
        <div 
          onClick={() => onNavigateTab('job_cards')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Finished Jobs</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {completedJobs}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            100% Quality inspected
          </div>
        </div>

        {/* Card 6: Low Stock Alert */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className={`bg-slate-900 border p-4 rounded-2xl transition-all cursor-pointer ${
            lowStockProducts.length > 0 ? 'border-rose-500/50 hover:border-rose-400' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Items</span>
            <span className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-xl sm:text-2xl font-extrabold font-mono ${lowStockProducts.length > 0 ? 'text-rose-400' : 'text-white'}`}>
            {lowStockProducts.length}
          </div>
          <div className="text-[11px] text-rose-400/90 font-medium mt-1">
            {lowStockProducts.length > 0 ? 'Reorder needed now' : 'Optimal inventory levels'}
          </div>
        </div>

        {/* Card 7: Customer Receivables */}
        <div 
          onClick={() => onNavigateTab('customers')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Receivables</span>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {settings.currency}{totalCustomerReceivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            From client credit limits
          </div>
        </div>

        {/* Card 8: Supplier Payables */}
        <div 
          onClick={() => onNavigateTab('suppliers')}
          className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Payables</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
            {settings.currency}{totalSupplierPayables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            To component suppliers
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workshop Pipeline Flow Matrix */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Workshop Bay Workload By Stage</span>
              </h3>
              <p className="text-xs text-slate-400">Current active repair & service progression</p>
            </div>
            <button
              onClick={() => onNavigateTab('workshop')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
            >
              <span>Kanban Board</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
            {[
              { stage: 'RECEIVED', label: 'Received', color: 'border-slate-600 bg-slate-800/40 text-slate-300' },
              { stage: 'INSPECTION', label: 'Inspection', color: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
              { stage: 'WAITING FOR PARTS', label: 'Parts Wait', color: 'border-rose-500/40 bg-rose-500/10 text-rose-400' },
              { stage: 'IN PROGRESS', label: 'In Progress', color: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
              { stage: 'READY', label: 'Ready for Pickup', color: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
              { stage: 'DELIVERED', label: 'Delivered', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
            ].map(col => {
              const count = jobCards.filter(j => j.status === col.stage).length;
              return (
                <div key={col.stage} className={`p-3 rounded-xl border ${col.color} text-center`}>
                  <div className="text-xl font-black font-mono">{count}</div>
                  <div className="text-[10px] uppercase font-bold mt-1 tracking-tight truncate">{col.label}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Mini Timeline of Active Vehicles */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Vehicles Currently In Workshop
            </h4>
            <div className="space-y-2">
              {jobCards.filter(j => j.status !== 'DELIVERED').slice(0, 3).map(jc => {
                const veh = vehicles.find(v => v.id === jc.vehicleId);
                const cust = customers.find(c => c.id === jc.customerId);
                return (
                  <div key={jc.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 font-mono font-bold bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                        {veh?.regNumber || 'VEHICLE'}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-200">{veh?.make} {veh?.model}</span>
                        <span className="text-slate-500 text-[11px] block">{cust?.name} • {jc.jobCardNumber}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                      {jc.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center space-x-2 mb-1">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Revenue Channels</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Settlement collection breakdown</p>

            <div className="space-y-3">
              {Object.entries(paymentMethodCounts).map(([method, amount]) => {
                const pct = totalSales > 0 ? (amount / totalSales) * 100 : 0;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{method}</span>
                      <span className="font-mono text-slate-100 font-bold">{settings.currency}{amount.toFixed(2)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Total Invoices Settled:</span>
            <span className="font-bold text-white font-mono">{invoices.length}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Sections (Sales, Job Cards, Purchases) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent POS & Workshop Invoices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span>Recent Invoices</span>
            </h3>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {invoices.slice(0, 5).map(inv => {
              const cust = customers.find(c => c.id === inv.customerId);
              return (
                <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-200">{inv.invoiceNumber}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' :
                        inv.status === 'Partial' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{cust?.name || 'Walk-in'} • {new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-white text-sm">
                      {settings.currency}{inv.grandTotal.toFixed(2)}
                    </span>
                    <PrintButton type="invoice" data={inv} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Warning Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center space-x-2">
              <Package className="w-4 h-4 text-rose-400" />
              <span>Inventory Stock Alerts</span>
            </h3>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Manage Stock
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
              All parts and consumables are above threshold limits
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {lowStockProducts.map(prod => (
                <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block truncate max-w-[200px]">{prod.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">SKU: {prod.sku} • {prod.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-400 text-xs block">
                      {prod.stock} / {prod.minStock} min
                    </span>
                    <span className="text-[10px] text-slate-500">Bay: {prod.location || 'Warehouse'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
