import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Plus, Search, Wrench, Phone, Calendar, DollarSign, Shield, Edit3 } from 'lucide-react';
import { Mechanic } from '../types';

export const EmployeesPage: React.FC = () => {
  const { mechanics, addMechanic, updateMechanic, jobCards, settings, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialization: '',
    hourlyRate: 50,
    joinedDate: new Date().toISOString().split('T')[0],
  });

  const filteredMechanics = mechanics.filter(m => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.specialization.toLowerCase().includes(q) || m.phone.includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingMechanic(null);
    setFormData({
      name: '',
      phone: '+1 555-0100',
      specialization: 'General Diagnostics & Engine',
      hourlyRate: 55,
      joinedDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Mechanic) => {
    setEditingMechanic(m);
    setFormData({
      name: m.name,
      phone: m.phone,
      specialization: m.specialization,
      hourlyRate: m.hourlyRate,
      joinedDate: m.joinedDate,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('warning', 'Name Required', 'Please enter employee name');
      return;
    }

    if (editingMechanic) {
      updateMechanic(editingMechanic.id, formData);
    } else {
      addMechanic(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Mechanics & Technical Roster
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Certified automotive technicians, specialization areas, active job cards & hourly rates
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Technician</span>
        </button>
      </div>

      {/* Mechanics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredMechanics.map(mech => {
          const activeJobs = jobCards.filter(j => j.assignedMechanicId === mech.id && j.status !== 'DELIVERED');

          return (
            <div
              key={mech.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-lg">
                    {mech.name.charAt(0)}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                    {activeJobs.length} active jobs
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mt-3">{mech.name}</h3>
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">{mech.specialization}</p>

                <div className="pt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{mech.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Joined: {mech.joinedDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Base Rate</span>
                  <span className="font-mono font-black text-white text-sm">
                    {settings.currency}{mech.hourlyRate}/hr
                  </span>
                </div>
                <button
                  onClick={() => handleOpenEdit(mech)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-base text-white uppercase mb-1">
              {editingMechanic ? 'Edit Staff Profile' : 'Enroll New Technician'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Enter mechanic qualifications and labour wage parameters</p>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Technician Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kenji Sato"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Technical Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Master Tech: German Autos, AC & Electrical"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Hourly Labour Rate ($)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joinedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, joinedDate: e.target.value }))}
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
