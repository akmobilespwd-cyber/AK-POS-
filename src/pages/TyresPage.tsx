import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Disc3, Plus, Search, Tag, DollarSign, Shield, Edit3, Trash2, Car, CheckCircle } from 'lucide-react';
import { Product } from '../types';

export const TyresPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, settings, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRim, setSelectedRim] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTyre, setEditingTyre] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    category: 'Tyre' as const,
    brand: '',
    tyreWidth: '265',
    aspectRatio: '65',
    rimSize: '17',
    speedRating: 'T (190 km/h)',
    loadIndex: '112',
    dotYear: '2026/02',
    compatibility: '',
    purchasePrice: 120,
    salePrice: 185,
    taxPercent: 5,
    stock: 8,
    minStock: 4,
    maxStock: 30,
    warrantyMonths: 36,
  });

  const tyresList = products.filter(p => p.category === 'Tyre');

  const filteredTyres = tyresList.filter(t => {
    if (selectedRim !== 'All' && t.rimSize !== selectedRim) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        (t.rimSize && t.rimSize.includes(q)) ||
        (t.tyreWidth && t.tyreWidth.includes(q))
      );
    }
    return true;
  });

  const rimSizes = ['All', ...Array.from(new Set(tyresList.map(t => t.rimSize).filter(Boolean)))];

  const handleOpenAdd = () => {
    setEditingTyre(null);
    setFormData({
      sku: 'TY-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      barcode: Date.now().toString(),
      name: 'Michelin Primacy 4 225/50 R17 98V',
      category: 'Tyre',
      brand: 'Michelin',
      tyreWidth: '225',
      aspectRatio: '50',
      rimSize: '17',
      speedRating: 'V (240 km/h)',
      loadIndex: '98 (750 kg)',
      dotYear: '2026/05',
      compatibility: 'Sedan & Hatchback OEM Fitment',
      purchasePrice: 110,
      salePrice: 165,
      taxPercent: settings.defaultTaxRate,
      stock: 8,
      minStock: 4,
      maxStock: 24,
      warrantyMonths: 36,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Product) => {
    setEditingTyre(t);
    setFormData({
      sku: t.sku,
      barcode: t.barcode,
      name: t.name,
      category: 'Tyre',
      brand: t.brand,
      tyreWidth: t.tyreWidth || '225',
      aspectRatio: t.aspectRatio || '55',
      rimSize: t.rimSize || '17',
      speedRating: t.speedRating || 'V',
      loadIndex: t.loadIndex || '95',
      dotYear: t.dotYear || '2026',
      compatibility: t.compatibility || '',
      purchasePrice: t.purchasePrice,
      salePrice: t.salePrice,
      taxPercent: t.taxPercent || settings.defaultTaxRate,
      stock: t.stock,
      minStock: t.minStock,
      maxStock: t.maxStock,
      warrantyMonths: t.warrantyMonths || 36,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand) {
      addToast('warning', 'Fields Required', 'Tyre name and brand are required');
      return;
    }

    if (editingTyre) {
      updateProduct(editingTyre.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Disc3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Tyre Bay & Wheel Inventory
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track tyre profiles: Width / Aspect / Rim / Speed / DOT manufacture batch codes
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Tyre Specification</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tyre size (e.g. 265/65 R17), brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedRim}
            onChange={(e) => setSelectedRim(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            {rimSizes.map(r => (
              <option key={r} value={r}>{r === 'All' ? 'All Rim Sizes' : `R${r} Inch`}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredTyres.length}</span> tyre models
        </div>
      </div>

      {/* Tyre Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTyres.map(tyre => (
          <div
            key={tyre.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-amber-400">
                    {tyre.brand}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-0.5 line-clamp-1">{tyre.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200">
                  {tyre.stock} in bay
                </span>
              </div>

              {/* Tyre Dimension Badge Box */}
              <div className="my-2.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono">
                <span className="text-lg font-black text-amber-400 tracking-wider">
                  {tyre.tyreWidth}/{tyre.aspectRatio} R{tyre.rimSize}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5 font-sans">
                  Load: {tyre.loadIndex} • Speed: {tyre.speedRating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div><span className="text-slate-500">DOT Code:</span> <span className="font-mono text-slate-300">{tyre.dotYear || 'Current'}</span></div>
                <div><span className="text-slate-500">Warranty:</span> <span className="font-mono text-slate-300">{tyre.warrantyMonths}m</span></div>
                <div><span className="text-slate-500">Wholesale:</span> <span className="font-mono text-slate-300">${tyre.purchasePrice.toFixed(2)}</span></div>
                <div><span className="text-slate-500">SKU:</span> <span className="font-mono text-slate-300">{tyre.sku}</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Fitted Price</span>
                <span className="text-lg font-black font-mono text-white">
                  {settings.currency}{tyre.salePrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(tyre)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteProduct(tyre.id)}
                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl my-6">
            <h3 className="font-black text-base text-white uppercase mb-1">
              {editingTyre ? 'Edit Tyre Specs' : 'Add New Tyre Model'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Define tyre dimensional parameters and fitment specifications</p>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Description *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">DOT Manufacture Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026/04"
                    value={formData.dotYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, dotYear: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Width (mm)</label>
                  <input
                    type="text"
                    value={formData.tyreWidth}
                    onChange={(e) => setFormData(prev => ({ ...prev, tyreWidth: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs font-mono text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Aspect Ratio (%)</label>
                  <input
                    type="text"
                    value={formData.aspectRatio}
                    onChange={(e) => setFormData(prev => ({ ...prev, aspectRatio: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs font-mono text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Rim Size (Inches)</label>
                  <input
                    type="text"
                    value={formData.rimSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, rimSize: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs font-mono text-white text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sale Retail Price ($) *</label>
                  <input
                    type="number"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, salePrice: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={formData.warrantyMonths}
                    onChange={(e) => setFormData(prev => ({ ...prev, warrantyMonths: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
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
                  Save Tyre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
