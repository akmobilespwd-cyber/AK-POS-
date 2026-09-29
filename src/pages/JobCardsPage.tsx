import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileCheck2, Plus, Search, Filter, Wrench, Car, 
  User, CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  DollarSign, ShieldCheck, Printer, FileText, ChevronRight,
  Eye, Edit3, Trash2
} from 'lucide-react';
import { JobCard, JobCardStatus, VehicleInspection, InspectionStatus } from '../types';
import { PrintButton } from '../components/printing/PrintButton';

export const JobCardsPage: React.FC = () => {
  const { 
    jobCards, 
    customers, 
    vehicles, 
    mechanics, 
    services, 
    products, 
    createJobCard, 
    updateJobCard, 
    updateJobCardStatus,
    updateJobCardInspection,
    convertJobCardToInvoice,
    settings,
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [mechanicFilter, setMechanicFilter] = useState<string>('All');

  // Modal states
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    customerId: string;
    vehicleId: string;
    mileage: number;
    complaint: string;
    recommendedWork: string;
    assignedMechanicId: string;
    services: { serviceId: string; name: string; labourPrice: number }[];
    parts: { productId: string; name: string; quantity: number; unitPrice: number; totalPrice: number }[];
    notes: string;
  }>({
    customerId: customers[0]?.id || '',
    vehicleId: '',
    mileage: 0,
    complaint: '',
    recommendedWork: '',
    assignedMechanicId: mechanics[0]?.id || '',
    services: [],
    parts: [],
    notes: '',
  });

  // Inspection Checklist Modal
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [inspectionTargetJob, setInspectionTargetJob] = useState<JobCard | null>(null);
  const [currentInspection, setCurrentInspection] = useState<VehicleInspection | null>(null);

  // Filtered Job Cards
  const filteredJobs = jobCards.filter(jc => {
    if (statusFilter !== 'All' && jc.status !== statusFilter) return false;
    if (mechanicFilter !== 'All' && jc.assignedMechanicId !== mechanicFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cust = customers.find(c => c.id === jc.customerId);
      const veh = vehicles.find(v => v.id === jc.vehicleId);
      return (
        jc.jobCardNumber.toLowerCase().includes(q) ||
        jc.complaint.toLowerCase().includes(q) ||
        (cust && cust.name.toLowerCase().includes(q)) ||
        (veh && veh.regNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCustomer = (id?: string) => customers.find(c => c.id === id);
  const getVehicle = (id?: string) => vehicles.find(v => v.id === id);
  const getMechanic = (id?: string) => mechanics.find(m => m.id === id);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setFormData({
      customerId: customers[0]?.id || '',
      vehicleId: vehicles.find(v => v.customerId === customers[0]?.id)?.id || '',
      mileage: 0,
      complaint: '',
      recommendedWork: '',
      assignedMechanicId: mechanics[0]?.id || '',
      services: [],
      parts: [],
      notes: '',
    });
    setIsEditorModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (jc: JobCard) => {
    setEditingJobId(jc.id);
    setFormData({
      customerId: jc.customerId,
      vehicleId: jc.vehicleId,
      mileage: jc.mileage,
      complaint: jc.complaint,
      recommendedWork: jc.recommendedWork || '',
      assignedMechanicId: jc.assignedMechanicId,
      services: [...jc.services],
      parts: [...jc.parts],
      notes: jc.notes || '',
    });
    setIsEditorModalOpen(true);
  };

  // Save Job Card
  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      addToast('warning', 'Customer Required', 'Please assign a customer');
      return;
    }

    if (editingJobId) {
      updateJobCard(editingJobId, formData);
    } else {
      createJobCard(formData);
    }
    setIsEditorModalOpen(false);
  };

  // Inspection Checklist Open
  const handleOpenInspection = (jc: JobCard) => {
    setInspectionTargetJob(jc);
    setCurrentInspection(JSON.parse(JSON.stringify(jc.inspection)));
    setIsInspectionModalOpen(true);
  };

  const handleSaveInspection = () => {
    if (inspectionTargetJob && currentInspection) {
      updateJobCardInspection(inspectionTargetJob.id, currentInspection);
      setIsInspectionModalOpen(false);
    }
  };

  const updateCheckItem = (section: keyof VehicleInspection, subItem: string, status: InspectionStatus, note?: string) => {
    if (!currentInspection) return;
    setCurrentInspection(prev => {
      if (!prev) return prev;
      const secObj = (prev as any)[section];
      if (secObj && secObj[subItem]) {
        secObj[subItem].status = status;
        if (note !== undefined) secObj[subItem].notes = note;
      }
      return { ...prev };
    });
  };

  const getStatusBadge = (status: JobCardStatus) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
      case 'INSPECTION':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'WAITING FOR PARTS':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'IN PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'READY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Workshop Job Cards
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track repair orders, assign mechanics, manage inspections & convert to invoices
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Job Card</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search JC number, reg no, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Stages</option>
            <option value="RECEIVED">Received</option>
            <option value="INSPECTION">Inspection</option>
            <option value="WAITING FOR PARTS">Waiting For Parts</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
          </select>

          {/* Mechanic Filter */}
          <select
            value={mechanicFilter}
            onChange={(e) => setMechanicFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Mechanics</option>
            {mechanics.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredJobs.length}</span> cards
        </div>
      </div>

      {/* Job Cards Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Job Number</th>
                <th className="py-3 px-4">Vehicle & Customer</th>
                <th className="py-3 px-4">Mechanic</th>
                <th className="py-3 px-4">Complaint / Work</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4 text-right">Estimate Cost</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredJobs.map(jc => {
                const cust = getCustomer(jc.customerId);
                const veh = getVehicle(jc.vehicleId);
                const mech = getMechanic(jc.assignedMechanicId);

                return (
                  <tr key={jc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {jc.jobCardNumber}
                      <span className="block text-[10px] text-slate-500 font-sans font-normal">
                        {new Date(jc.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {veh ? (
                        <div>
                          <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                            {veh.regNumber}
                          </span>
                          <span className="text-slate-300 font-medium block mt-1">
                            {veh.make} {veh.model}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No Vehicle Linked</span>
                      )}
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {cust?.name || 'Walk-in'} • {cust?.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">{mech?.name || 'Unassigned'}</span>
                      <span className="text-[10px] text-slate-500 truncate block max-w-[140px]">{mech?.specialization}</span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-300 font-medium line-clamp-2 leading-relaxed">
                        {jc.complaint}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                        <span>{jc.services.length} services</span>
                        <span>•</span>
                        <span>{jc.parts.length} parts</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {/* Interactive Stage Transition Selector */}
                      <select
                        value={jc.status}
                        onChange={(e) => updateJobCardStatus(jc.id, e.target.value as JobCardStatus)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider border focus:outline-none ${getStatusBadge(jc.status)}`}
                      >
                        <option value="RECEIVED">RECEIVED</option>
                        <option value="INSPECTION">INSPECTION</option>
                        <option value="WAITING FOR PARTS">WAITING FOR PARTS</option>
                        <option value="IN PROGRESS">IN PROGRESS</option>
                        <option value="READY">READY</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="font-bold text-white text-sm">
                        {settings.currency}{jc.actualCost.toFixed(2)}
                      </div>
                      {jc.isInvoiceCreated ? (
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Invoiced</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => convertJobCardToInvoice(jc.id)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                        >
                          Generate Invoice
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Inspection Checklist Button */}
                        <button
                          onClick={() => handleOpenInspection(jc)}
                          title="Open Multi-Point Inspection"
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>

                        {/* Edit Job Card */}
                        <button
                          onClick={() => handleOpenEditModal(jc)}
                          title="Edit Job Card"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Print Button Dropdown */}
                        <PrintButton type="job_card" data={jc} size="sm" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* JOB CARD CREATE / EDIT MODAL                             */}
      {/* ======================================================== */}
      {isEditorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl my-8">
            <h3 className="text-lg font-black text-white uppercase mb-1">
              {editingJobId ? 'Edit Job Card' : 'Create New Workshop Job Card'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter customer complaints, odometer reading, and assign lead master technician
            </p>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Customer */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Customer *</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const matchedVehs = vehicles.filter(v => v.customerId === cid);
                      setFormData(prev => ({
                        ...prev,
                        customerId: cid,
                        vehicleId: matchedVehs[0]?.id || ''
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Vehicle *</label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">Select vehicle...</option>
                    {vehicles.filter(v => v.customerId === formData.customerId).map(v => (
                      <option key={v.id} value={v.id}>{v.regNumber} - {v.make} {v.model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Mileage */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Odometer Mileage (KM)</label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mileage: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                {/* Assigned Mechanic */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Mechanic</label>
                  <select
                    value={formData.assignedMechanicId}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedMechanicId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {mechanics.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Complaint */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reported Customer Complaint *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Squealing noise from front axle when braking, AC blowing warm"
                  value={formData.complaint}
                  onChange={(e) => setFormData(prev => ({ ...prev, complaint: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              {/* Recommended Work */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Recommended Workshop Work</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Replace ceramic brake pads, top up brake fluid, vacuum test AC"
                  value={formData.recommendedWork}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendedWork: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              {/* Quick Add Services & Parts */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                  Attach Services / Labour
                </label>
                <div className="flex flex-wrap gap-2">
                  {services.map(s => {
                    const isAdded = formData.services.some(srv => srv.serviceId === s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            setFormData(prev => ({ ...prev, services: prev.services.filter(srv => srv.serviceId !== s.id) }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              services: [...prev.services, { serviceId: s.id, name: s.name, labourPrice: s.labourPrice }]
                            }));
                          }
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                          isAdded
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {isAdded ? '✓ ' : '+ '} {s.name} (${s.labourPrice})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase"
                >
                  Save Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VEHICLE MULTI-POINT INSPECTION CHECKLIST MODAL           */}
      {/* ======================================================== */}
      {isInspectionModalOpen && currentInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl my-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white uppercase">
                    Vehicle Multi-Point Safety Inspection
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspection checklist for {inspectionTargetJob?.jobCardNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInspectionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Inspection Checklist Categories */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar text-xs">
              {/* 1. Engine Section */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  1. Engine Bay & Mechanical
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(currentInspection.engine).map(([key, check]) => (
                    <div key={key} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{check.item}</span>
                        <div className="flex space-x-1">
                          {(['Good', 'Warning', 'Critical', 'Not Checked'] as InspectionStatus[]).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => updateCheckItem('engine', key, st)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                check.status === st
                                  ? st === 'Good' ? 'bg-emerald-500 text-slate-950' :
                                    st === 'Warning' ? 'bg-amber-500 text-slate-950' :
                                    st === 'Critical' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {st === 'Not Checked' ? 'N/C' : st}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Condition remarks..."
                        value={check.notes || ''}
                        onChange={(e) => updateCheckItem('engine', key, check.status, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Brakes Section */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  2. Braking System & Hydraulics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(currentInspection.brakes).map(([key, check]) => (
                    <div key={key} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{check.item}</span>
                        <div className="flex space-x-1">
                          {(['Good', 'Warning', 'Critical', 'Not Checked'] as InspectionStatus[]).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => updateCheckItem('brakes', key, st)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                check.status === st
                                  ? st === 'Good' ? 'bg-emerald-500 text-slate-950' :
                                    st === 'Warning' ? 'bg-amber-500 text-slate-950' :
                                    st === 'Critical' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {st === 'Not Checked' ? 'N/C' : st}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Pad mm or condition..."
                        value={check.notes || ''}
                        onChange={(e) => updateCheckItem('brakes', key, check.status, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Tyres Section */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  3. Tyres, Pressure & Tread Depth
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(currentInspection.tyres).map(([key, check]) => (
                    <div key={key} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{check.item}</span>
                        <div className="flex space-x-1">
                          {(['Good', 'Warning', 'Critical', 'Not Checked'] as InspectionStatus[]).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => updateCheckItem('tyres', key, st)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                check.status === st
                                  ? st === 'Good' ? 'bg-emerald-500 text-slate-950' :
                                    st === 'Warning' ? 'bg-amber-500 text-slate-950' :
                                    st === 'Critical' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {st === 'Not Checked' ? 'N/C' : st}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="PSI & tread depth..."
                        value={check.notes || ''}
                        onChange={(e) => updateCheckItem('tyres', key, check.status, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Electrical Section */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  4. Electrical, AC & Battery SOH
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(currentInspection.electrical).map(([key, check]) => (
                    <div key={key} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{check.item}</span>
                        <div className="flex space-x-1">
                          {(['Good', 'Warning', 'Critical', 'Not Checked'] as InspectionStatus[]).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => updateCheckItem('electrical', key, st)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                check.status === st
                                  ? st === 'Good' ? 'bg-emerald-500 text-slate-950' :
                                    st === 'Warning' ? 'bg-amber-500 text-slate-950' :
                                    st === 'Critical' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {st === 'Not Checked' ? 'N/C' : st}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Voltage or vent temp..."
                        value={check.notes || ''}
                        onChange={(e) => updateCheckItem('electrical', key, check.status, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Safety checklist verified by authorized technician
              </span>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsInspectionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveInspection}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase"
                >
                  Save Inspection Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
