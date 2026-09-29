import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Package, Plus, Search, Tag, DollarSign, Shield, 
  MapPin, Edit3, Trash2, CheckCircle2, AlertTriangle, Barcode
} from 'lucide-react';
import { Product } from '../types';

export const SparePartsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, suppliers, settings, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    category: 'Spare Part' as Product['category'],
    brand: '',
    compatibility: '',
    purchasePrice: 0,
    salePrice: 0,
    wholesalePrice: 0,
    taxPercent: 5,
    stock: 10,
    minStock: 4,
    maxStock: 50,
    location: '',
    warrantyMonths: 12,
  });

  const sparePartsList = products.filter(p => p.category === 'Spare Part' || p.category === 'Fluid');

  const filteredParts = sparePartsList.filter(p => {
    if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        (p.compatibility && p.compatibility.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const brands = ['All', ...Array.from(new Set(sparePartsList.map(p => p.brand)))];

  const handleOpenAdd = () => {
    setEditingPart(null);
    setFormData({
      sku: 'BP-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      barcode: Date.now().toString(),
      name: '',
      category: 'Spare Part',
      brand: 'Bosch',
      compatibility: '',
      purchasePrice: 20,
      salePrice: 45,
      wholesalePrice: 35,
      taxPercent: settings.defaultTaxRate,
      stock: 12,
      minStock: 4,
      maxStock: 40,
      location: 'Shelf A-01',
      warrantyMonths: 12,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingPart(p);
    setFormData({
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      category: p.category,
      brand: p.brand,
      compatibility: p.compatibility || '',
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      wholesalePrice: p.wholesalePrice || 0,
      taxPercent: p.taxPercent,
      stock: p.stock,
      minStock: p.minStock,
      maxStock: p.maxStock,
      location: p.location || '',
      warrantyMonths: p.warrantyMonths || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      addToast('warning', 'Fields Required', 'Part name and SKU are required');
      return;
    }

    if (editingPart) {
      updateProduct(editingPart.id, formData);
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
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Spare Parts & Lubricants Catalog
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Genuine OE & aftermarket filters, brake pads, plugs, fluids & vehicle fitments
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Spare Part</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search part name, compatibility, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            {brands.map(b => (
              <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredParts.length}</span> components
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredParts.map(part => {
          const isLow = part.stock <= part.minStock;
          return (
            <div
              key={part.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[10px] uppercase tracking-wider text-amber-400">
                      {part.brand}
                    </span>
                    <h3 className="font-bold text-sm text-white mt-0.5 line-clamp-1">{part.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isLow ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {part.stock} in stock
                  </span>
                </div>

                {part.compatibility && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mt-2">
                    <span className="text-slate-500 font-semibold block text-[10px]">FITMENT COMPATIBILITY:</span>
                    {part.compatibility}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-3">
                  <div><span className="text-slate-500">SKU:</span> <span className="font-mono text-slate-300">{part.sku}</span></div>
                  <div><span className="text-slate-500">Bay:</span> <span className="font-mono text-slate-300">{part.location || 'Shelf'}</span></div>
                  <div><span className="text-slate-500">Cost:</span> <span className="font-mono text-slate-300">${part.purchasePrice.toFixed(2)}</span></div>
                  <div><span className="text-slate-500">Warranty:</span> <span className="font-mono text-slate-300">{part.warrantyMonths}m</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Selling Price</span>
                  <span className="text-lg font-black font-mono text-white">
                    {settings.currency}{part.salePrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(part)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteProduct(part.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Part Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl my-6">
            <h3 className="font-black text-base text-white uppercase mb-1">
              {editingPart ? 'Edit Spare Part' : 'Add New Spare Part'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Define part specifications, fitment, and retail pricing</p>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Part Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bosch QuietCast Ceramic Front Brake Pads"
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
                    placeholder="e.g. Bosch, Denso, NGK"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="Spare Part">Spare Part</option>
                    <option value="Fluid">Fluids & Oils</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Vehicle Compatibility</label>
                <input
                  type="text"
                  placeholder="e.g. Toyota Prado 150 2.8L Diesel, Fortuner"
                  value={formData.compatibility}
                  onChange={(e) => setFormData(prev => ({ ...prev, compatibility: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Purchase Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sale Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, salePrice: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Min Alert Stock</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStock: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Shelf Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
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
                  Save Spare Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
