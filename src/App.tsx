/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationToast } from './components/common/NotificationToast';
import { PrintModal } from './components/printing/PrintModal';
import { DedicatedPrintPage } from './pages/DedicatedPrintPage';

// Pages
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PosPage } from './pages/PosPage';
import { CustomersPage } from './pages/CustomersPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { WorkshopWorkflowPage } from './pages/WorkshopWorkflowPage';
import { JobCardsPage } from './pages/JobCardsPage';
import { ServicesPage } from './pages/ServicesPage';
import { SparePartsPage } from './pages/SparePartsPage';
import { TyresPage } from './pages/TyresPage';
import { BatteriesPage } from './pages/BatteriesPage';
import { InventoryPage } from './pages/InventoryPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { ServiceRemindersPage } from './pages/ServiceRemindersPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const WorkshopApp: React.FC = () => {
  const { currentUser, sameTabPrint, closeSameTabPrint } = useApp();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If user is not authenticated, show premium automotive Auth Portal
  if (!currentUser) {
    return <AuthPage />;
  }

  // Same-Tab Dedicated Print View (reliable browser printing fallback)
  if (sameTabPrint.isActive && sameTabPrint.data) {
    return (
      <DedicatedPrintPage
        type={sameTabPrint.type}
        data={sameTabPrint.data}
        format={sameTabPrint.format}
        onBack={() => {
          closeSameTabPrint();
          if (sameTabPrint.returnTab) {
            setActiveTab(sameTabPrint.returnTab as NavTab);
          }
        }}
      />
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigateTab={setActiveTab} />;
      case 'pos':
        return <PosPage />;
      case 'customers':
        return <CustomersPage />;
      case 'vehicles':
        return <VehiclesPage />;
      case 'workshop':
        return <WorkshopWorkflowPage />;
      case 'job_cards':
        return <JobCardsPage />;
      case 'services':
        return <ServicesPage />;
      case 'spare_parts':
        return <SparePartsPage />;
      case 'tyres':
        return <TyresPage />;
      case 'batteries':
        return <BatteriesPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'purchases':
        return <PurchasesPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'reminders':
        return <ServiceRemindersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateTab={setActiveTab}
        />

        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <PrintModal />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <WorkshopApp />
    </AppProvider>
  );
}
