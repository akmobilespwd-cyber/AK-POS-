import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings2, Printer, Shield, Database, Save, RotateCcw, 
  Download, Building, FileText, CheckCircle2, History 
} from 'lucide-react';
import { WorkshopSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, auditLogs, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'printing' | 'audit' | 'database'>('general');
  const [formData, setFormData] = useState<WorkshopSettings>(settings);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `advance_auto_backup_${Date.now()}.json`);
    dlAnchorElem.click();
    addToast('success', 'Backup Exported', 'JSON database backup downloaded');
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
              Workshop Configuration & Settings
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Printing preferences (80mm vs A4), business registration, audit trails & database backup
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        {[
          { id: 'general', label: 'Workshop Profile', icon: <Building className="w-4 h-4" /> },
          { id: 'printing', label: 'Printing & Thermal 80mm', icon: <Printer className="w-4 h-4" /> },
          { id: 'audit', label: 'Audit Trail & Logs', icon: <History className="w-4 h-4" /> },
          { id: 'database', label: 'Backup & Maintenance', icon: <Database className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 max-w-2xl">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Commercial Business Identity
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Workshop Business Name</label>
              <input
                type="text"
                value={formData.workshopName}
                onChange={(e) => setFormData(prev => ({ ...prev, workshopName: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">City & Postal</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Telephone / Hotline</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Service Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tax Reg / CNIC</label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Default Sales Tax (%)</label>
              <input
                type="number"
                step="0.5"
                value={formData.defaultTaxRate}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultTaxRate: Number(e.target.value) || 0 }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </form>
      )}

      {/* Printing Settings */}
      {activeTab === 'printing' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 max-w-2xl">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center space-x-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Hardware Printing & Formatting Preferences</span>
          </h3>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-slate-200 block">Auto Print After POS Sale</span>
                <span className="text-[11px] text-slate-400">Instantly open receipt print dialog upon completing transaction</span>
              </div>
              <input
                type="checkbox"
                checked={formData.printSettings.autoPrintAfterSale}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  printSettings: { ...prev.printSettings, autoPrintAfterSale: e.target.checked }
                }))}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-slate-200 block">Default Print Format</span>
                <span className="text-[11px] text-slate-400">Choose between POS 80mm thermal roll or A4 commercial invoice</span>
              </div>
              <div className="flex space-x-2">
                {(['80MM', 'A4'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      printSettings: { ...prev.printSettings, defaultFormat: fmt }
                    }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      formData.printSettings.defaultFormat === fmt
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">80mm Receipt Header Text</label>
            <textarea
              rows={2}
              value={formData.printSettings.receiptHeader}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                printSettings: { ...prev.printSettings, receiptHeader: e.target.value }
              }))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Receipt Footer Memo</label>
            <textarea
              rows={2}
              value={formData.printSettings.receiptFooter}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                printSettings: { ...prev.printSettings, receiptFooter: e.target.value }
              }))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Commercial Terms & Conditions (A4 Invoice)</label>
            <textarea
              rows={3}
              value={formData.printSettings.termsAndConditions}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                printSettings: { ...prev.printSettings, termsAndConditions: e.target.value }
              }))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white text-[11px]"
            />
          </div>
        </form>
      )}

      {/* Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center space-x-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Security Audit Trail & Compliance Log</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total {auditLogs.length} events logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4">Action Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Database & Maintenance */}
      {activeTab === 'database' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-xl">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-1">
              Data Backup & Factory Restore
            </h3>
            <p className="text-xs text-slate-400">
              Download complete local JSON database snapshot or restore pristine workshop demonstration seed records
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-200">Export Complete JSON Backup</h4>
              <p className="text-[11px] text-slate-400">Save all customers, vehicles, job cards, and invoices</p>
            </div>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-rose-500/20 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-rose-300">Reset to Initial Commercial Seed Data</h4>
              <p className="text-[11px] text-slate-400">Restores all stock, demo vehicles, and technicians</p>
            </div>
            <button
              onClick={resetToDemoData}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-rose-500/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
