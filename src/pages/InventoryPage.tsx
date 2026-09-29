import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Boxes, Plus, Minus, Search, AlertTriangle, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, Package, RefreshCw, Filter,
  Building2, MapPin, Tag
} from 'lucide-react';
import { Product } from '../types';

export const InventoryPage: React.FC = () => {
  const { 
    products, 
    adjustProductStock, 
    addProduct, 
    updateProduct, 
    suppliers, 
    settings,
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockLevelFilter, setStockLevelFilter] = useState<'All' | 'Low' | 'Out'>('All');

  // Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Stock replenishment');

  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (stockLevelFilter === 'Low' && p.stock > p.minStock) return false;
    if (stockLevelFilter === 'Out' && p.stock > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockCount = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.stock * p.salePrice), 0);

  const handleOpenAdjust = (p: Product) => {
    setSelectedProduct(p);
    setAdjustQty(1);
    setAdjustType('add');
    setAdjustReason('Physical stock count verification');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustQty <= 0) return;

    const delta = adjustType === 'add' ? adjustQty : -adjustQty;
    adjustProductStock(selectedProduct.id, delta, adjustReason);
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Warehouse & Inventory Operations
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock counts, threshold monitoring, bin locations & valuation
          </p>
        </div>
      </div>

      {/* 4 Summary Valuation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Total SKUs</span>
          <span className="text-2xl font-mono font-extrabold text-white">{products.length}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Catalogued lines</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Purchase Valuation</span>
          <span className="text-2xl font-mono font-extrabold text-emerald-400">
            {settings.currency}{totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">At landed cost</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Low Stock Warning</span>
          <span className="text-2xl font-mono font-extrabold text-amber-400">{lowStockCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Below reorder level</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Out of Stock</span>
          <span className={`text-2xl font-mono font-extrabold ${outOfStockCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {outOfStockCount}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Zero availability</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Categories</option>
            <option value="Spare Part">Spare Parts</option>
            <option value="Fluid">Fluids & Oils</option>
            <option value="Tyre">Tyres</option>
            <option value="Battery">Batteries</option>
          </select>

          <select
            value={stockLevelFilter}
            onChange={(e) => setStockLevelFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Stock Levels</option>
            <option value="Low">Low Stock Only</option>
            <option value="Out">Out of Stock Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredProducts.length}</span> items
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category & Brand</th>
                <th className="py-3 px-4">Location Bay</th>
                <th className="py-3 px-4 text-right">Cost Rate</th>
                <th className="py-3 px-4 text-right">Retail Price</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.map(p => {
                const isLow = p.stock <= p.minStock && p.stock > 0;
                const isOut = p.stock <= 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>SKU: {p.sku}</span>
                        <span>•</span>
                        <span>BAR: {p.barcode}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-300 block">{p.brand}</span>
                      <span className="text-[10px] text-slate-500">{p.category}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {p.location || 'Floor Bay'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {settings.currency}{p.purchasePrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {settings.currency}{p.salePrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        isOut ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        isLow ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {p.stock} units
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Min: {p.minStock} / Max: {p.maxStock}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenAdjust(p)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 mx-auto transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-base text-white uppercase mb-1">
              Adjust Physical Stock
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Modify inventory for <strong className="text-amber-400">{selectedProduct.name}</strong>
            </p>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Stock Count:</span>
                <span className="font-mono font-bold text-base text-white">{selectedProduct.stock} units</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Action Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1 ${
                      adjustType === 'add' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Stock In (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('subtract')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1 ${
                      adjustType === 'subtract' ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    <span>Stock Out (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Adjustment Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Audit Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Physical stock count verification">Physical stock count verification</option>
                  <option value="Supplier delivery receipt">Supplier delivery receipt</option>
                  <option value="Damaged in store / transit">Damaged in store / transit</option>
                  <option value="Returned by customer">Returned by customer</option>
                  <option value="Workshop internal testing">Workshop internal testing</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
