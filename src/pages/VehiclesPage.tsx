import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Car, Plus, Search, User, Wrench, ShieldCheck, 
  Calendar, FileText, Gauge, Edit3, Trash2, ExternalLink,
  ChevronRight, CheckCircle2 
} from 'lucide-react';
import { Vehicle } from '../types';
import { PrintButton } from '../components/printing/PrintButton';

export const VehiclesPage: React.FC = () => {
  const { 
    vehicles, 
    customers, 
    jobCards, 
    invoices, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle, 
    settings,
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    regNumber: '',
    make: '',
    model: '',
    year: 2022,
    variant: '',
    color: '',
    vin: '',
    engineNumber: '',
    mileage: 0,
    fuelType: 'Petrol' as Vehicle['fuelType'],
  });

  const filteredVehicles = vehicles.filter(v => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const cust = customers.find(c => c.id === v.customerId);
    return (
      v.regNumber.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (v.vin && v.vin.toLowerCase().includes(q)) ||
      (cust && cust.name.toLowerCase().includes(q))
    );
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const vehicleCustomer = customers.find(c => c.id === selectedVehicle?.customerId);
  const vehicleJobCards = jobCards.filter(j => j.vehicleId === selectedVehicle?.id);
  const vehicleInvoices = invoices.filter(i => i.vehicleId === selectedVehicle?.id);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      customerId: customers[0]?.id || '',
      regNumber: '',
      make: '',
      model: '',
      year: 2023,
      variant: '',
      color: 'Black',
      vin: '',
      engineNumber: '',
      mileage: 0,
      fuelType: 'Petrol',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      customerId: v.customerId,
      regNumber: v.regNumber,
      make: v.make,
      model: v.model,
      year: v.year,
      variant: v.variant || '',
      color: v.color,
      vin: v.vin || '',
      engineNumber: v.engineNumber || '',
      mileage: v.mileage,
      fuelType: v.fuelType,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.regNumber || !formData.make || !formData.model) {
      addToast('warning', 'Fields Required', 'Registration number, make and model are required');
      return;
    }

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        ...formData,
        regNumber: formData.regNumber.toUpperCase(),
      });
    } else {
      addVehicle({
        ...formData,
        regNumber: formData.regNumber.toUpperCase(),
      });
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
              <Car className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Vehicles Master Registry
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete vehicle history logs, inspections, odometer tracking & linked customer profiles
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register Vehicle</span>
        </button>
      </div>

      {/* Main Grid: Left Fleet List, Right Vehicle 360 History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vehicles List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reg no, make, model, VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[600px] custom-scrollbar pr-1">
            {filteredVehicles.map(veh => {
              const isSelected = selectedVehicle?.id === veh.id;
              const owner = customers.find(c => c.id === veh.customerId);

              return (
                <div
                  key={veh.id}
                  onClick={() => setSelectedVehicleId(veh.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-white text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {veh.regNumber}
                      </span>
                      <h4 className="font-bold text-xs text-slate-200 mt-1">
                        {veh.year} {veh.make} {veh.model}
                      </h4>
                      <p className="text-[10px] text-slate-500">{veh.variant || 'Standard'} • {veh.fuelType}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-300">
                        {veh.mileage.toLocaleString()} KM
                      </span>
                      <span className="text-[10px] text-slate-500 block">Odometer</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{owner?.name || 'Walk-in'}</span>
                    </span>
                    <span>Color: {veh.color}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Vehicle 360 Full History */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          {selectedVehicle ? (
            <>
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
                    <Car className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base sm:text-lg font-black text-white font-mono">{selectedVehicle.regNumber}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {selectedVehicle.fuelType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.variant}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(selectedVehicle)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Specs</span>
                  </button>
                  <button
                    onClick={() => deleteVehicle(selectedVehicle.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Odometer Mileage</span>
                  <span className="font-mono font-bold text-sm text-amber-400 block">{selectedVehicle.mileage.toLocaleString()} KM</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Color / Finish</span>
                  <span className="font-semibold text-slate-200 block truncate">{selectedVehicle.color}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Owner / Customer</span>
                  <span className="font-semibold text-slate-200 block truncate">{vehicleCustomer?.name || 'Walk-in'}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Chassis / VIN</span>
                  <span className="font-mono text-[10px] text-slate-300 block truncate">{selectedVehicle.vin || 'Not Set'}</span>
                </div>
              </div>

              {/* Vehicle Job Cards History */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Workshop Job Cards & Inspections ({vehicleJobCards.length})</span>
                </h4>

                {vehicleJobCards.length === 0 ? (
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center text-slate-500 text-xs">
                    No repair or service job cards recorded for this vehicle.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {vehicleJobCards.map(jc => (
                      <div key={jc.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-amber-400">{jc.jobCardNumber}</span>
                            <span className="text-slate-400 text-[11px] block mt-0.5">
                              {new Date(jc.createdAt).toLocaleDateString()} • {jc.mileage.toLocaleString()} KM
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                            {jc.status}
                          </span>
                        </div>

                        <p className="text-slate-300 text-[11px] italic">"{jc.complaint}"</p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <span className="font-mono font-bold text-white text-xs">
                            Cost: {settings.currency}{jc.actualCost.toFixed(2)}
                          </span>
                          <PrintButton type="job_card" data={jc} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoices History */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Settled Invoices ({vehicleInvoices.length})</span>
                </h4>

                {vehicleInvoices.length === 0 ? (
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center text-slate-500 text-xs">
                    No invoices generated yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    {vehicleInvoices.map(inv => (
                      <div key={inv.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/60 transition-colors">
                        <div>
                          <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {new Date(inv.createdAt).toLocaleDateString()} • {inv.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-slate-100">
                            {settings.currency}{inv.grandTotal.toFixed(2)}
                          </span>
                          <PrintButton type="invoice" data={inv} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs">
              Select a vehicle to inspect records
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-base text-white uppercase mb-1">
              {editingVehicle ? 'Update Vehicle' : 'Register Vehicle to Fleet'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter vehicle registration plate, chassis VIN and assign owner
            </p>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Customer / Fleet Owner *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Registration Plate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KAA-8921"
                    value={formData.regNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, regNumber: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Make (Brand) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota"
                    value={formData.make}
                    onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Land Cruiser Prado"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) || 2022 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mileage (KM)</label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mileage: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                    <option value="LPG">LPG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Pearl White"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">VIN / Chassis #</label>
                  <input
                    type="text"
                    placeholder="Optional 17-digit VIN"
                    value={formData.vin}
                    onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase"
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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
