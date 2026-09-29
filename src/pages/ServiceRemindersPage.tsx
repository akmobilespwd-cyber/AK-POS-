import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BellRing, Plus, Search, Calendar, Gauge, CheckCircle2, MessageSquare, Car, User, Trash2 } from 'lucide-react';
import { ServiceReminder } from '../types';

export const ServiceRemindersPage: React.FC = () => {
  const { reminders, customers, vehicles, addReminder, updateReminderStatus, settings, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    vehicleId: '',
    type: 'Oil Change' as ServiceReminder['type'],
    dueDate: '2026-04-15',
    dueMileage: 50000,
    notes: '',
  });

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getVehicle = (id: string) => vehicles.find(v => v.id === id);

  const filteredReminders = reminders.filter(r => {
    const cust = getCustomer(r.customerId);
    const veh = getVehicle(r.vehicleId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.type.toLowerCase().includes(q) ||
        (cust && cust.name.toLowerCase().includes(q)) ||
        (veh && veh.regNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    const firstCust = customers[0]?.id || '';
    const firstVeh = vehicles.find(v => v.customerId === firstCust)?.id || '';
    setFormData({
      customerId: firstCust,
      vehicleId: firstVeh,
      type: 'Oil Change',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      dueMileage: 50000,
      notes: 'Scheduled 5,000 KM maintenance interval',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.vehicleId) {
      addToast('warning', 'Fields Required', 'Customer and vehicle are required');
      return;
    }

    addReminder(formData);
    setIsModalOpen(false);
  };

  const handleSendAlert = (rem: ServiceReminder) => {
    const cust = getCustomer(rem.customerId);
    const veh = getVehicle(rem.vehicleId);
    const text = `Hello ${cust?.name || 'Customer'},\nThis is a friendly maintenance reminder from *${settings.workshopName}* for your vehicle *${veh?.regNumber}* (${veh?.make} ${veh?.model}).\nService Due: *${rem.type}*.\nTarget Date: ${rem.dueDate || 'Soon'} or ${rem.dueMileage?.toLocaleString()} KM.\nPlease contact us at ${settings.phone} to book your slot!`;
    const phoneClean = (cust?.whatsapp || cust?.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    updateReminderStatus(rem.id, 'Sent');
    addToast('success', 'Reminder Triggered', `WhatsApp notification prepared for ${cust?.name}`);
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <BellRing className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Predictive Service & Warranty Reminders
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated notifications by calendar date or odometer mileage (Oil, Tyres, Brakes, Battery)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Schedule Reminder</span>
        </button>
      </div>

      {/* Reminders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Due Mileage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Alert Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredReminders.map(rem => {
                const cust = getCustomer(rem.customerId);
                const veh = getVehicle(rem.vehicleId);

                return (
                  <tr key={rem.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {rem.type}
                      </span>
                      {rem.notes && <p className="text-[10px] text-slate-400 mt-1">{rem.notes}</p>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">{cust?.name || 'Customer'}</span>
                      <span className="text-[10px] text-slate-500">{cust?.phone}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {veh ? (
                        <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {veh.regNumber}
                        </span>
                      ) : '-'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {rem.dueDate || '-'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {rem.dueMileage ? `${rem.dueMileage.toLocaleString()} KM` : '-'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rem.status === 'Sent' ? 'bg-blue-500/10 text-blue-400' :
                        rem.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {rem.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleSendAlert(rem)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 mx-auto transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Send WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-base text-white uppercase mb-1">
              Schedule Service Reminder
            </h3>
            <p className="text-xs text-slate-400 mb-4">Set target date or odometer reading for preventive maintenance</p>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Customer *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const matched = vehicles.filter(v => v.customerId === cid);
                    setFormData(prev => ({
                      ...prev,
                      customerId: cid,
                      vehicleId: matched[0]?.id || ''
                    }));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Vehicle *</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.filter(v => v.customerId === formData.customerId).map(v => (
                    <option key={v.id} value={v.id}>{v.regNumber} - {v.make} {v.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reminder Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="Oil Change">Oil Change</option>
                  <option value="Vehicle Service">Periodic Scheduled Service</option>
                  <option value="Tyre Inspection">Tyre Inspection & Rotation</option>
                  <option value="Battery Warranty">Battery Health Check</option>
                  <option value="Brake Check">Brake Pad & Disc Check</option>
                  <option value="General Tuneup">General Tuneup</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Mileage (KM)</label>
                  <input
                    type="number"
                    value={formData.dueMileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueMileage: Number(e.target.value) || 0 }))}
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
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
