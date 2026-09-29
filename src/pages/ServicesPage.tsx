import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings2, Plus, Search, Clock, DollarSign, Shield, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { ServiceItem } from '../types';

export const ServicesPage: React.FC = () => {
  const { services, addService, updateService, deleteService, settings, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'General Maintenance',
    description: '',
    labourPrice: 50,
    estimatedDurationMin: 60,
    taxPercent: 5,
    warrantyMonths: 3,
    isActive: true,
  });

  const filteredServices = services.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'General Maintenance',
      description: '',
      labourPrice: 50,
      estimatedDurationMin: 60,
      taxPercent: settings.defaultTaxRate,
      warrantyMonths: 3,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: ServiceItem) => {
    setEditingService(s);
    setFormData({
      name: s.name,
      category: s.category,
      description: s.description,
      labourPrice: s.labourPrice,
      estimatedDurationMin: s.estimatedDurationMin,
      taxPercent: s.taxPercent,
      warrantyMonths: s.warrantyMonths,
      isActive: s.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('warning', 'Name Required', 'Please enter a service title');
      return;
    }

    if (editingService) {
      updateService(editingService.id, formData);
    } else {
      addService(formData);
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
              <Settings2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Labour Rates & Service Packages
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard shop labour times, periodic service intervals & flat rate diagnostic charges
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Workshop Service</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search service name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredServices.length}</span> services
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredServices.map(srv => (
          <div
            key={srv.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="font-bold text-[10px] uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  {srv.category}
                </span>
                <span className="flex items-center space-x-1 text-slate-400 text-[11px] font-mono">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{srv.estimatedDurationMin} mins</span>
                </span>
              </div>

              <h3 className="font-bold text-sm text-white mt-2">{srv.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                {srv.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Standard Labour</span>
                <span className="text-lg font-black font-mono text-white">
                  {settings.currency}{srv.labourPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteService(srv.id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-base text-white uppercase mb-1">
              {editingService ? 'Edit Service' : 'Add New Service Package'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Define flat rate labour fees and estimated shop bay duration</p>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laser 3D Wheel Alignment"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="General Maintenance">General Maintenance</option>
                  <option value="Lubrication">Lubrication</option>
                  <option value="Braking System">Braking System</option>
                  <option value="Tyres & Suspension">Tyres & Suspension</option>
                  <option value="Climate & AC">Climate & AC</option>
                  <option value="Diagnostics">Diagnostics</option>
                  <option value="Drivetrain">Drivetrain</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Scope of work and procedure..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Labour Price ($) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.labourPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, labourPrice: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Est. Duration (Minutes)</label>
                  <input
                    type="number"
                    step="5"
                    value={formData.estimatedDurationMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDurationMin: Number(e.target.value) || 30 }))}
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
