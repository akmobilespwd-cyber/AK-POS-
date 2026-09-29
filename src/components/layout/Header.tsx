import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Menu, Sun, Moon, ShoppingCart, Search, Bell, 
  Shield, Check, Clock, ChevronDown, Wrench, RefreshCw
} from 'lucide-react';
import { UserRole } from '../../types';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar, onNavigateTab }) => {
  const { 
    darkMode, 
    setDarkMode, 
    currentUser, 
    switchUserRole, 
    jobCards, 
    products, 
    customers,
    vehicles,
    invoices,
    settings,
    resetToDemoData 
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles: UserRole[] = ['Admin', 'Manager', 'Cashier', 'Mechanic', 'Inventory Manager', 'Accountant'];

  // Global search matches
  const filteredCustomers = globalSearch.trim().length > 1
    ? customers.filter(c => c.name.toLowerCase().includes(globalSearch.toLowerCase()) || c.phone.includes(globalSearch))
    : [];
  const filteredVehicles = globalSearch.trim().length > 1
    ? vehicles.filter(v => v.regNumber.toLowerCase().includes(globalSearch.toLowerCase()) || v.make.toLowerCase().includes(globalSearch.toLowerCase()))
    : [];
  const filteredInvoices = globalSearch.trim().length > 1
    ? invoices.filter(i => i.invoiceNumber.toLowerCase().includes(globalSearch.toLowerCase()))
    : [];

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between print:hidden">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Lookup Input */}
        <div className="relative hidden md:block w-72">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reg no, customer, invoice..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
          </div>

          {/* Quick Search Floating Results */}
          {searchOpen && globalSearch.trim().length > 1 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs max-h-80 overflow-y-auto">
              <div className="flex justify-between items-center px-2 py-1 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-800">
                <span>Quick Search Results</span>
                <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white">Esc</button>
              </div>

              {filteredVehicles.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] text-amber-400 font-semibold px-2 mb-1">Vehicles</div>
                  {filteredVehicles.map(v => (
                    <div
                      key={v.id}
                      onClick={() => { onNavigateTab('vehicles'); setSearchOpen(false); setGlobalSearch(''); }}
                      className="px-2 py-1.5 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center text-slate-200"
                    >
                      <span className="font-mono font-bold text-amber-400">{v.regNumber}</span>
                      <span className="text-slate-400">{v.make} {v.model}</span>
                    </div>
                  ))}
                </div>
              )}

              {filteredCustomers.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] text-blue-400 font-semibold px-2 mb-1">Customers</div>
                  {filteredCustomers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => { onNavigateTab('customers'); setSearchOpen(false); setGlobalSearch(''); }}
                      className="px-2 py-1.5 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center text-slate-200"
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-slate-400 text-[10px]">{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}

              {filteredInvoices.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] text-emerald-400 font-semibold px-2 mb-1">Invoices</div>
                  {filteredInvoices.map(i => (
                    <div
                      key={i.id}
                      onClick={() => { onNavigateTab('invoices'); setSearchOpen(false); setGlobalSearch(''); }}
                      className="px-2 py-1.5 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center text-slate-200"
                    >
                      <span className="font-mono font-bold text-emerald-400">{i.invoiceNumber}</span>
                      <span className="text-slate-400">{settings.currency}{i.grandTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {filteredVehicles.length === 0 && filteredCustomers.length === 0 && filteredInvoices.length === 0 && (
                <div className="py-4 text-center text-slate-500 text-xs">
                  No matching records found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Station Clock */}
      <div className="hidden xl:flex items-center space-x-2 text-xs font-mono text-slate-400 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-slate-200 font-medium">{currentTime}</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Workshop Online</span>
        </span>
      </div>

      {/* Right Action Icons & Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Launch POS Button */}
        <button
          onClick={() => onNavigateTab('pos')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
        >
          <ShoppingCart className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span className="hidden sm:inline">Open POS</span>
        </button>

        {/* Role Switcher Selector */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold hidden sm:inline">{currentUser?.role || 'Admin'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-800">
                Switch Security Role
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    switchUserRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <span>{r}</span>
                  {currentUser?.role === r && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* Quick Demo Reset Icon */}
        <button
          onClick={resetToDemoData}
          title="Reset To Initial Demo Data"
          className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
