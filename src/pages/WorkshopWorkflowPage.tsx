import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wrench, Car, Clock, User, ArrowRight, CheckCircle2, 
  AlertTriangle, ChevronRight, FileCheck2, ExternalLink
} from 'lucide-react';
import { JobCardStatus } from '../types';
import { PrintButton } from '../components/printing/PrintButton';

export const WorkshopWorkflowPage: React.FC = () => {
  const { 
    jobCards, 
    customers, 
    vehicles, 
    mechanics, 
    updateJobCardStatus, 
    convertJobCardToInvoice,
    settings 
  } = useApp();

  const stages: { id: JobCardStatus; label: string; desc: string; color: string; border: string }[] = [
    { id: 'RECEIVED', label: '1. Received', desc: 'Booked in at reception', color: 'bg-slate-800/40 text-slate-300', border: 'border-slate-700' },
    { id: 'INSPECTION', label: '2. Inspection', desc: 'Safety multi-point check', color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/30' },
    { id: 'WAITING FOR PARTS', label: '3. Parts Wait', desc: 'Requisition from store', color: 'bg-rose-500/10 text-rose-400', border: 'border-rose-500/30' },
    { id: 'IN PROGRESS', label: '4. In Progress', desc: 'Active mechanic on ramp', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/30' },
    { id: 'READY', label: '5. Ready', desc: 'Road test & QC passed', color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/30' },
    { id: 'DELIVERED', label: '6. Delivered', desc: 'Invoiced & handover', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/30' },
  ];

  const getCustomer = (id?: string) => customers.find(c => c.id === id);
  const getVehicle = (id?: string) => vehicles.find(v => v.id === id);
  const getMechanic = (id?: string) => mechanics.find(m => m.id === id);

  const handleNextStage = (jcId: string, currentStatus: JobCardStatus) => {
    const sequence: JobCardStatus[] = ['RECEIVED', 'INSPECTION', 'WAITING FOR PARTS', 'IN PROGRESS', 'READY', 'DELIVERED'];
    const idx = sequence.indexOf(currentStatus);
    if (idx < sequence.length - 1) {
      updateJobCardStatus(jcId, sequence[idx + 1]);
    }
  };

  return (
    <div className="space-y-6 pb-12 print:hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Workshop Bay Workflow Board
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual stage progression pipeline: RECEIVED → INSPECTION → PARTS → IN PROGRESS → READY → DELIVERED
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Active Workshop Queue: <strong className="text-white">{jobCards.length} Vehicles</strong></span>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
        {stages.map(stage => {
          const cardsInStage = jobCards.filter(jc => jc.status === stage.id);

          return (
            <div
              key={stage.id}
              className={`bg-slate-900/90 border ${stage.border} rounded-2xl p-3 flex flex-col min-h-[480px] shadow-lg`}
            >
              {/* Stage Header */}
              <div className="pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${stage.color}`}>
                    {stage.label}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-slate-950 text-slate-200 text-[10px] font-mono font-bold flex items-center justify-center border border-slate-800">
                    {cardsInStage.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{stage.desc}</p>
              </div>

              {/* Cards List in this stage */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {cardsInStage.map(jc => {
                  const cust = getCustomer(jc.customerId);
                  const veh = getVehicle(jc.vehicleId);
                  const mech = getMechanic(jc.assignedMechanicId);

                  return (
                    <div
                      key={jc.id}
                      className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-all shadow space-y-2 text-xs group"
                    >
                      {/* Top Job Card & Badge */}
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-amber-400 text-[11px]">
                          {jc.jobCardNumber}
                        </span>
                        <span className="font-mono text-slate-400 text-[10px]">
                          {settings.currency}{jc.actualCost.toFixed(2)}
                        </span>
                      </div>

                      {/* Vehicle Badge */}
                      {veh && (
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-white text-[11px] bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                              {veh.regNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {jc.mileage.toLocaleString()} km
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-300 block mt-1">
                            {veh.make} {veh.model}
                          </span>
                        </div>
                      )}

                      {/* Complaint Preview */}
                      <p className="text-slate-400 text-[11px] line-clamp-2 italic leading-tight">
                        "{jc.complaint}"
                      </p>

                      {/* Mechanic & Customer info */}
                      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-0.5">
                        <div className="flex items-center space-x-1 truncate text-slate-400 font-medium">
                          <Wrench className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{mech?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center space-x-1 truncate text-slate-500">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{cust?.name || 'Customer'}</span>
                        </div>
                      </div>

                      {/* Stage Action Controls */}
                      <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-800/80">
                        <PrintButton type="job_card" data={jc} size="sm" />

                        {stage.id === 'READY' && !jc.isInvoiceCreated ? (
                          <button
                            onClick={() => convertJobCardToInvoice(jc.id)}
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase rounded-lg transition-colors"
                          >
                            Bill & Release
                          </button>
                        ) : stage.id !== 'DELIVERED' ? (
                          <button
                            onClick={() => handleNextStage(jc.id, jc.status)}
                            className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors"
                            title="Move to Next Stage"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Finished</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {cardsInStage.length === 0 && (
                  <div className="h-36 flex flex-col items-center justify-center text-center p-3 text-slate-600 text-[11px] border border-dashed border-slate-800/80 rounded-xl">
                    No vehicles in this bay
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
