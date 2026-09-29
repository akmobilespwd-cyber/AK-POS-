import React, { useState, useRef, useEffect } from 'react';
import { Printer, ChevronDown, FileText, Download, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  downloadDocumentPdf, 
  openSynchronousPrintWindow,
  executePrintWithFallback 
} from '../../utils/printAndPdfService';
import { Invoice } from '../../types';

interface PrintButtonProps {
  type: 'invoice' | 'job_card' | 'payment_receipt';
  data: any;
  label?: string;
  size?: 'sm' | 'md';
}

export const PrintButton: React.FC<PrintButtonProps> = ({ 
  type, 
  data, 
  label = 'Print', 
  size = 'sm' 
}) => {
  const { openPrintPreview, openSameTabPrint, settings, customers, vehicles, mechanics, addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCustomer = (id?: string) => customers.find(c => c.id === id);
  const getVehicle = (id?: string) => vehicles.find(v => v.id === id);
  const getMechanic = (id?: string) => mechanics.find(m => m.id === id);

  const custId = type === 'invoice' ? data.customerId : (type === 'job_card' ? data.customerId : data.customerId);
  const vehId = type === 'invoice' ? data.vehicleId : (type === 'job_card' ? data.vehicleId : undefined);
  const mechId = type === 'job_card' ? data.assignedMechanicId : undefined;

  const cust = getCustomer(custId);
  const veh = getVehicle(vehId);
  const mech = getMechanic(mechId);

  // Primary button click: uses configured default format
  const handleMainClick = () => {
    const defaultFmt = settings.printSettings.defaultFormat || '80MM';
    if (defaultFmt === '80MM') {
      handleDirectPrint80mm();
    } else {
      handleDirectPrintA4();
    }
  };

  const handleDirectPrint80mm = () => {
    setIsOpen(false);
    // 1. Immediately open print window synchronously from the click gesture!
    const win = openSynchronousPrintWindow('80MM');

    executePrintWithFallback({
      type,
      data,
      format: '80MM',
      customer: cust,
      vehicle: veh,
      mechanic: mech,
      settings,
      onPreparing: (msg) => addToast('info', 'Printing', msg),
      onOpening: (msg) => addToast('info', 'Printing', msg),
      onOpened: (msg) => addToast('success', 'Print Dialog', msg),
      onBlocked: (msg) => addToast('warning', 'Print Window Blocked', msg),
      onError: (msg) => addToast('error', 'Print Error', msg),
      onFallback: () => {
        openSameTabPrint(type, data, '80MM');
      },
    }, win);
  };

  const handleDirectPrintA4 = () => {
    setIsOpen(false);
    // 1. Immediately open print window synchronously from the click gesture!
    const win = openSynchronousPrintWindow('A4');

    executePrintWithFallback({
      type,
      data,
      format: 'A4',
      customer: cust,
      vehicle: veh,
      mechanic: mech,
      settings,
      onPreparing: (msg) => addToast('info', 'Printing', msg),
      onOpening: (msg) => addToast('info', 'Printing', msg),
      onOpened: (msg) => addToast('success', 'Print Dialog', msg),
      onBlocked: (msg) => addToast('warning', 'Print Window Blocked', msg),
      onError: (msg) => addToast('error', 'Print Error', msg),
      onFallback: () => {
        openSameTabPrint(type, data, 'A4');
      },
    }, win);
  };

  const handleDirectDownloadPdf = () => {
    setIsOpen(false);
    setTimeout(() => {
      try {
        const filename = downloadDocumentPdf(type, data, cust, veh, settings, mech);
        addToast('success', 'PDF downloaded successfully', `${filename} saved to downloads`);
      } catch (err) {
        console.error(err);
        addToast('error', 'PDF Error', 'Unable to generate PDF. Please try again.');
      }
    }, 150);
  };

  const handleOpenPreview = () => {
    setIsOpen(false);
    openPrintPreview(type, data, settings.printSettings.defaultFormat || '80MM', false);
  };

  return (
    <div className="relative inline-flex items-center rounded-lg shadow-sm" ref={dropdownRef}>
      {/* Primary Action Button */}
      <button
        onClick={handleMainClick}
        className={`inline-flex items-center space-x-1.5 font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors rounded-l-lg ${
          size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
        }`}
      >
        <Printer className={size === 'sm' ? 'w-3.5 h-3.5 text-amber-400' : 'w-4 h-4 text-amber-400'} />
        <span>{label}</span>
      </button>

      {/* Dropdown Toggle Caret */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-y border-r border-slate-700 hover:border-slate-600 transition-colors rounded-r-lg ${
          size === 'sm' ? 'py-1.5' : 'py-2'
        }`}
        aria-label="Print Options"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
          <button
            onClick={handleDirectPrint80mm}
            className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700/80 hover:text-amber-400 flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <div className="font-medium">Print 80mm Thermal</div>
              <div className="text-[10px] text-slate-400">Direct thermal print dialog</div>
            </div>
          </button>

          <button
            onClick={handleDirectPrintA4}
            className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700/80 hover:text-amber-400 flex items-center space-x-2 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div>
              <div className="font-medium">Print A4 Commercial</div>
              <div className="text-[10px] text-slate-400">Full-sheet invoice dialog</div>
            </div>
          </button>

          <button
            onClick={handleDirectDownloadPdf}
            className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700/80 hover:text-amber-400 flex items-center space-x-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-medium">Download PDF</div>
              <div className="text-[10px] text-slate-400">Save real .pdf file</div>
            </div>
          </button>

          <div className="my-1 border-t border-slate-700/70" />

          <button
            onClick={handleOpenPreview}
            className="w-full px-3 py-1.5 text-left text-slate-400 hover:bg-slate-700/80 hover:text-white flex items-center space-x-2 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Interactive Preview</span>
          </button>
        </div>
      )}
    </div>
  );
};
