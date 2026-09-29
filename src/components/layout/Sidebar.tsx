import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Car,
  Wrench,
  FileCheck2,
  Settings2,
  Package,
  Disc3,
  BatteryCharging,
  Boxes,
  Truck,
  Building2,
  CreditCard,
  Receipt,
  UserCheck,
  FileSpreadsheet,
  BarChart3,
  BellRing,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'pos'
  | 'customers'
  | 'vehicles'
  | 'workshop'
  | 'job_cards'
  | 'services'
  | 'spare_parts'
  | 'tyres'
  | 'batteries'
  | 'inventory'
  | 'purchases'
  | 'suppliers'
  | 'payments'
  | 'expenses'
  | 'employees'
  | 'invoices'
  | 'reports'
  | 'reminders'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { currentUser, logout, jobCards, products, settings } = useApp();

  // Counts for alerts
  const pendingJobsCount = jobCards.filter(j => j.status !== 'DELIVERED').length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pos', label: 'POS Terminal', icon: <ShoppingCart className="w-4 h-4 text-amber-400" /> },
    { id: 'job_cards', label: 'Job Cards', icon: <FileCheck2 className="w-4 h-4" />, badge: pendingJobsCount, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    { id: 'workshop', label: 'Workshop Workflow', icon: <Wrench className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'vehicles', label: 'Vehicles Registry', icon: <Car className="w-4 h-4" /> },
    { id: 'invoices', label: 'Invoices', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'services', label: 'Services Catalog', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'spare_parts', label: 'Spare Parts', icon: <Package className="w-4 h-4" /> },
    { id: 'tyres', label: 'Tyre Bay', icon: <Disc3 className="w-4 h-4" /> },
    { id: 'batteries', label: 'Batteries', icon: <BatteryCharging className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory & Stock', icon: <Boxes className="w-4 h-4" />, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
    { id: 'purchases', label: 'Purchases / PO', icon: <Truck className="w-4 h-4" /> },
    { id: 'suppliers', label: 'Suppliers', icon: <Building2 className="w-4 h-4" /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt className="w-4 h-4" /> },
    { id: 'employees', label: 'Mechanics & Staff', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'reminders', label: 'Service Reminders', icon: <BellRing className="w-4 h-4" /> },
    { id: 'reports', label: 'Financial & Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings2 className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: NavTab) => {
    setActiveTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden print:hidden"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out print:hidden ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Branding & Logo Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Wrench className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-sm tracking-tight text-white uppercase truncate">
                  Advance Auto
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono tracking-wider truncate">
                  WORKSHOP & POS
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links Scroll Container */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 custom-scrollbar">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <span className={`${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'} shrink-0 transition-colors`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-800 text-slate-200'}`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Active Indicator Pip */}
                {isCollapsed && isActive && (
                  <span className="absolute right-1 w-1.5 h-1.5 rounded-full bg-slate-950" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {currentUser?.name || 'Authorized Staff'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span className="text-[10px] text-slate-400 truncate">
                      {currentUser?.role || 'Operator'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
