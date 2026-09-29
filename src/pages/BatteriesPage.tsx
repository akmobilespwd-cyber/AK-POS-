import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BatteryCharging, Plus, Search, Tag, DollarSign, Shield, Edit3, Trash2, Zap } from 'lucide-react';
import { Product } from '../types';

export const BatteriesPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, settings, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBattery, setEditingBattery] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    category: 'Battery' as const,
    brand: '',
    batteryVoltage: '12V',
    batteryAh: '70Ah',
    batteryType: 'AGM Start-Stop',
    compatibility: '',
    purchasePrice: 90,
    salePrice: 155,
    taxPercent: 5,
    stock: 6,
    minStock: 2,
    maxStock: 20,
    warrantyMonths: 24,
  });

  const batteriesList = products.filter(p => p.category === 'Battery');

  const filteredBatteries = batteriesList.filter(b => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.brand.toLowerCase().includes(q) ||
        (b.batteryAh && b.batteryAh.toLowerCase().includes(q)) ||
        (b.compatibility && b.compatibility.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingBattery(null);
    setFormData({
      sku: 'BAT-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      barcode: Date.now().toString(),
      name: 'Amaron PRO High Cranking 74Ah',
      category: 'Battery',
      brand: 'Amaron',
      batteryVoltage: '12V',
      batteryAh: '74Ah',
      batteryType: 'Maintenance Free Silver Alloy',
      compatibility: 'Toyota Land Cruiser, Lexus GX460, Hilux',
      purchasePrice: 95,
      salePrice: 160,
      taxPercent: settings.defaultTaxRate,
      stock: 6,
      minStock: 3,
      maxStock: 20,
      warrantyMonths: 36,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Product) => {
    setEditingBattery(b);
    setFormData({
      sku: b.sku,
      barcode: b.barcode,
      name: b.name,
      category: 'Battery',
      brand: b.brand,
      batteryVoltage: b.batteryVoltage || '12V',
      batteryAh: b.batteryAh || '65Ah',
      batteryType: b.batteryType || 'MF',
      compatibility: b.compatibility || '',
      purchasePrice: b.purchasePrice,
      salePrice: b.salePrice,
      taxPercent: b.taxPercent || settings.defaultTaxRate,
      stock: b.stock,
      minStock: b.minStock,
      maxStock: b.maxStock,
      warrantyMonths: b.warrantyMonths || 24,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand) {
      addToast('warning', 'Fields Required', 'Battery name and brand are required');
      return;
    }

    if (editingBattery) {
      updateProduct(editingBattery.id, formData);
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
              <BatteryCharging className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Batteries & Electrical Storage
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            AGM, EFB, Start-Stop & conventional automotive batteries with warranty logging
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Battery Spec</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search battery model, Ah capacity, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredBatteries.length}</span> units
        </div>
      </div>

      {/* Battery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBatteries.map(battery => (
          <div
            key={battery.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-amber-400">
                    {battery.brand}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-0.5 line-clamp-1">{battery.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200">
                  {battery.stock} in stock
                </span>
              </div>

              {/* Battery Specs Ribbon */}
              <div className="my-2.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800 flex justify-around text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Voltage</span>
                  <span className="font-mono font-black text-amber-400 text-sm">{battery.batteryVoltage || '12V'}</span>
                </div>
                <div className="border-x border-slate-800 px-3">
                  <span className="text-[10px] text-slate-500 block">Capacity</span>
                  <span className="font-mono font-black text-white text-sm">{battery.batteryAh || '65Ah'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Chemistry</span>
                  <span className="font-mono font-semibold text-slate-300 text-xs truncate max-w-[90px] block">{battery.batteryType || 'MF'}</span>
                </div>
              </div>

              {battery.compatibility && (
                <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80 mt-1 truncate">
                  <span className="text-slate-500 font-semibold mr-1">Fitment:</span>
                  {battery.compatibility}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2">
                <div><span className="text-slate-500">Warranty:</span> <span className="font-mono text-emerald-400 font-bold">{battery.warrantyMonths} Months</span></div>
                <div><span className="text-slate-500">Cost:</span> <span className="font-mono text-slate-300">${battery.purchasePrice.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Fitted & Tested</span>
                <span className="text-lg font-black font-mono text-white">
                  {settings.currency}{battery.salePrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(battery)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteProduct(battery.id)}
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
              {editingBattery ? 'Edit Battery' : 'Add New Battery Model'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Define battery capacity rating, type and replacement warranty</p>

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
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Battery Type</label>
                  <input
                    type="text"
                    placeholder="e.g. AGM Start-Stop, MF"
                    value={formData.batteryType}
                    onChange={(e) => setFormData(prev => ({ ...prev, batteryType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Voltage Rating</label>
                  <input
                    type="text"
                    value={formData.batteryVoltage}
                    onChange={(e) => setFormData(prev => ({ ...prev, batteryVoltage: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Ah Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 70Ah, 80Ah"
                    value={formData.batteryAh}
                    onChange={(e) => setFormData(prev => ({ ...prev, batteryAh: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Vehicle Fitment</label>
                <input
                  type="text"
                  placeholder="e.g. Toyota Prado, BMW G20 Start-Stop"
                  value={formData.compatibility}
                  onChange={(e) => setFormData(prev => ({ ...prev, compatibility: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Purchase Cost ($)</label>
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
                  Save Battery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
