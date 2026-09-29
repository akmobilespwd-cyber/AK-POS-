import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Truck, Plus, Search, Building2, Package, CheckCircle2, 
  Clock, DollarSign, ArrowRight, Trash2, Eye 
} from 'lucide-react';
import { Purchase, PurchaseItem } from '../types';

export const PurchasesPage: React.FC = () => {
  const { purchases, suppliers, products, createPurchase, updatePurchaseStatus, settings, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [notes, setNotes] = useState('');

  // Item line adder
  const [itemProductId, setItemProductId] = useState(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState(10);
  const [itemCost, setItemCost] = useState(products[0]?.purchasePrice || 20);

  const filteredPurchases = purchases.filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sup = suppliers.find(s => s.id === p.supplierId);
      return p.purchaseNumber.toLowerCase().includes(q) || (sup && sup.company.toLowerCase().includes(q));
    }
    return true;
  });

  const getSupplier = (id: string) => suppliers.find(s => s.id === id);

  const handleAddItem = () => {
    const prod = products.find(p => p.id === itemProductId);
    if (!prod) return;

    setPurchaseItems(prev => [
      ...prev,
      {
        productId: prod.id,
        name: prod.name,
        quantity: itemQuantity,
        unitCost: itemCost,
        total: Number((itemQuantity * itemCost).toFixed(2)),
      }
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setPurchaseItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      addToast('warning', 'Empty Order', 'Please add at least one line item to the PO');
      return;
    }

    const subtotal = purchaseItems.reduce((acc, it) => acc + it.total, 0);
    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    createPurchase({
      supplierId: selectedSupplierId,
      status: 'Ordered',
      items: purchaseItems,
      subtotal,
      tax,
      total,
      paidAmount: 0,
      dueAmount: total,
      date: new Date().toISOString(),
      notes,
    });

    setIsModalOpen(false);
    setPurchaseItems([]);
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Supplier Purchases & PO Orders
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Requisition parts, issue purchase orders, and receive stock directly into warehouse
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search PO number or supplier..."
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
            <option value="Ordered">Ordered</option>
            <option value="Received">Received</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredPurchases.length}</span> purchase orders
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier Company</th>
                <th className="py-3 px-4">Ordered Items</th>
                <th className="py-3 px-4">PO Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Receive Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPurchases.map(po => {
                const sup = getSupplier(po.supplierId);
                const isReceived = po.status === 'Received' || po.status === 'Paid';

                return (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {po.purchaseNumber}
                      <span className="block text-[10px] text-slate-500 font-sans font-normal">
                        {new Date(po.date).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">{sup?.company}</span>
                      <span className="text-[10px] text-slate-500">{sup?.name} • {sup?.phone}</span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        {po.items.map((it, idx) => (
                          <div key={idx} className="text-slate-300 text-[11px] truncate">
                            • {it.name} <span className="text-amber-400 font-mono font-bold">(x{it.quantity})</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isReceived ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {po.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="font-bold text-white text-sm">
                        {settings.currency}{po.total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-rose-400">
                        Due: {settings.currency}{po.dueAmount.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {!isReceived ? (
                        <button
                          onClick={() => updatePurchaseStatus(po.id, 'Received')}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs uppercase shadow transition-colors"
                        >
                          Receive Goods
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-xs flex items-center justify-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Stocked In</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl my-6">
            <h3 className="font-black text-base text-white uppercase mb-1">
              Create Purchase Order
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select supplier and assemble line items to replenish warehouse inventory
            </p>

            <form onSubmit={handleCreatePurchase} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Supplier Company *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.company} ({s.name})</option>
                  ))}
                </select>
              </div>

              {/* Line Item Adder */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Add Requisition Item</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={itemProductId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setItemProductId(pid);
                        const p = products.find(prod => prod.id === pid);
                        if (p) setItemCost(p.purchasePrice);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (${p.purchasePrice})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {purchaseItems.map((it, idx) => (
                  <div key={idx} className="p-2 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{it.name}</span>
                      <span className="text-slate-500 text-[11px] block">
                        {it.quantity} units @ ${it.unitCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white">${it.total.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase"
                >
                  Confirm & Issue PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
