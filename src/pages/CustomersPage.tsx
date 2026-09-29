import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Plus, Search, Phone, Mail, MapPin, 
  Car, FileText, CreditCard, Clock, Edit3, Trash2, 
  ExternalLink, DollarSign, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { Customer } from '../types';
import { PrintButton } from '../components/printing/PrintButton';

export const CustomersPage: React.FC = () => {
  const { 
    customers, 
    vehicles, 
    jobCards, 
    invoices, 
    payments, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    settings,
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    taxId: '',
    creditLimit: 1500,
    notes: '',
  });

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Related data for customer profile
  const customerVehicles = vehicles.filter(v => v.customerId === selectedCustomer?.id);
  const customerJobCards = jobCards.filter(j => j.customerId === selectedCustomer?.id);
  const customerInvoices = invoices.filter(i => i.customerId === selectedCustomer?.id);
  const customerPayments = payments.filter(p => p.customerId === selectedCustomer?.id);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      taxId: '',
      creditLimit: 1500,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      whatsapp: c.whatsapp || '',
      email: c.email || '',
      address: c.address || '',
      taxId: c.taxId || '',
      creditLimit: c.creditLimit,
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      addToast('warning', 'Fields Required', 'Customer name and phone number are required');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Customer Accounts & Fleets
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain customer directories, linked vehicle profiles, receivables ledgers & history
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Main Grid: Directory Left, Profile & History Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Directory List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Customer Cards List */}
          <div className="space-y-2 overflow-y-auto max-h-[600px] custom-scrollbar pr-1">
            {filteredCustomers.map(cust => {
              const isSelected = selectedCustomer?.id === cust.id;
              const vehCount = vehicles.filter(v => v.customerId === cust.id).length;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-white truncate">{cust.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cust.phone}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-mono font-bold block ${
                        cust.balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {settings.currency}{cust.balance.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {cust.balance > 0 ? 'Outstanding' : 'Clear Balance'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Car className="w-3 h-3 text-amber-400" />
                      <span>{vehCount} Vehicle(s)</span>
                    </span>
                    <span className="text-slate-400">Credit Limit: {settings.currency}{cust.creditLimit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer Detailed 360 Profile */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          {selectedCustomer ? (
            <>
              {/* Profile Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">{selectedCustomer.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-2">
                      <span>ID: {selectedCustomer.id}</span>
                      <span>•</span>
                      <span>Member since {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(selectedCustomer)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => deleteCustomer(selectedCustomer.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contact & Credit Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Phone / WhatsApp</span>
                  <span className="font-semibold text-slate-200 block truncate">{selectedCustomer.phone}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Email Address</span>
                  <span className="font-semibold text-slate-200 block truncate">{selectedCustomer.email || 'None'}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Outstanding Balance</span>
                  <span className={`font-mono font-bold text-sm block ${selectedCustomer.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {settings.currency}{selectedCustomer.balance.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Credit Ceiling</span>
                  <span className="font-mono font-bold text-sm text-slate-200 block">
                    {settings.currency}{selectedCustomer.creditLimit}
                  </span>
                </div>
              </div>

              {/* Linked Vehicles */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span>Linked Vehicles ({customerVehicles.length})</span>
                  </h4>
                </div>

                {customerVehicles.length === 0 ? (
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center text-slate-500 text-xs">
                    No vehicles registered for this client yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {customerVehicles.map(veh => (
                      <div key={veh.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            {veh.regNumber}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{veh.mileage.toLocaleString()} KM</span>
                        </div>
                        <h5 className="font-semibold text-slate-200 mt-1">{veh.year} {veh.make} {veh.model}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">{veh.variant} • {veh.fuelType} • {veh.color}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoices & Service History */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Invoice & Service History ({customerInvoices.length})</span>
                </h4>

                {customerInvoices.length === 0 ? (
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center text-slate-500 text-xs">
                    No billing history on record.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    {customerInvoices.map(inv => (
                      <div key={inv.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/60 transition-colors">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {new Date(inv.createdAt).toLocaleDateString()} • {inv.items.length} line items
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
              Select a customer to view account details
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-base text-white uppercase mb-1">
              {editingCustomer ? 'Update Customer Profile' : 'Register New Customer'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter customer contact information and credit authorization limits
            </p>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Harris"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+1 555-0199"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Credit Limit ($)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="Street, City, Sector"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Notes / Preferences</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Requires Mobil 1 synthetic oil, OEM parts only"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
