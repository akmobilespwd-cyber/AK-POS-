import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Customer, Vehicle, Product, ServiceItem, JobCard, 
  Invoice, Payment, Expense, Supplier, Purchase, 
  Mechanic, ServiceReminder, AuditLog, WorkshopSettings, User,
  JobCardStatus, VehicleInspection, CartItem, PaymentMethod,
  SameTabPrintData
} from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import { 
  initialSettings, initialUsers, initialCustomers, initialVehicles,
  initialMechanics, initialSuppliers, initialProducts, initialServices,
  initialJobCards, initialInvoices, initialPayments, initialExpenses,
  initialPurchases, initialReminders, initialAuditLogs, initialInspectionChecklist
} from '../data/mockInitialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface PrintPreviewData {
  isOpen: boolean;
  type: 'invoice' | 'job_card' | 'payment_receipt';
  data: any;
  format: '80MM' | 'A4';
  autoPrint?: boolean;
}

interface AppContextType {
  // Theme & UI
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Current Auth User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUserRole: (role: User['role']) => void;
  login: (email: string) => boolean;
  logout: () => void;

  // Core Data
  customers: Customer[];
  vehicles: Vehicle[];
  products: Product[];
  services: ServiceItem[];
  jobCards: JobCard[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  suppliers: Supplier[];
  purchases: Purchase[];
  mechanics: Mechanic[];
  reminders: ServiceReminder[];
  auditLogs: AuditLog[];
  settings: WorkshopSettings;
  formatMoney: (amount: number | string | undefined | null) => string;

  // Printing
  printPreview: PrintPreviewData;
  openPrintPreview: (type: 'invoice' | 'job_card' | 'payment_receipt', data: any, format?: '80MM' | 'A4', autoPrint?: boolean) => void;
  closePrintPreview: () => void;
  setPrintFormat: (format: '80MM' | 'A4') => void;

  sameTabPrint: SameTabPrintData;
  openSameTabPrint: (type: 'invoice' | 'job_card' | 'payment_receipt', data: any, format?: '80MM' | 'A4', returnTab?: string) => void;
  closeSameTabPrint: () => void;

  // Actions
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'balance'>) => Customer;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addVehicle: (veh: Omit<Vehicle, 'id' | 'createdAt'>) => Vehicle;
  updateVehicle: (id: string, veh: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  addProduct: (prod: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  adjustProductStock: (id: string, delta: number, reason: string) => void;
  deleteProduct: (id: string) => void;

  addService: (srv: Omit<ServiceItem, 'id'>) => ServiceItem;
  updateService: (id: string, srv: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  createJobCard: (data: Partial<JobCard>) => JobCard;
  updateJobCard: (id: string, data: Partial<JobCard>) => void;
  updateJobCardStatus: (id: string, status: JobCardStatus, note?: string) => void;
  updateJobCardInspection: (id: string, inspection: VehicleInspection) => void;
  convertJobCardToInvoice: (jobCardId: string, paymentMethod?: PaymentMethod) => Invoice | null;

  createPOSSale: (saleData: {
    customerId: string;
    vehicleId?: string;
    cart: CartItem[];
    invoiceDiscount: number;
    taxRate: number;
    paymentMethod: PaymentMethod;
    paidAmount: number;
    notes?: string;
  }) => Invoice;

  addInvoicePayment: (invoiceId: string, amount: number, method: PaymentMethod, reference?: string) => Payment | null;

  addExpense: (exp: Omit<Expense, 'id' | 'createdBy'>) => Expense;
  deleteExpense: (id: string) => void;

  addSupplier: (sup: Omit<Supplier, 'id' | 'currentBalance'>) => Supplier;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;

  createPurchase: (po: Omit<Purchase, 'id' | 'purchaseNumber'>) => Purchase;
  updatePurchaseStatus: (id: string, status: Purchase['status']) => void;

  addMechanic: (mech: Omit<Mechanic, 'id' | 'activeJobsCount'>) => Mechanic;
  updateMechanic: (id: string, mech: Partial<Mechanic>) => void;

  addReminder: (rem: Omit<ServiceReminder, 'id' | 'status'>) => ServiceReminder;
  updateReminderStatus: (id: string, status: ServiceReminder['status']) => void;

  updateSettings: (newSettings: Partial<WorkshopSettings>) => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('advance_auto_theme');
    return saved ? saved === 'dark' : true; // Default dark automotive styling
  });

  useEffect(() => {
    localStorage.setItem('advance_auto_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('advance_auto_user');
    return saved ? JSON.parse(saved) : initialUsers[0];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('advance_auto_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('advance_auto_user');
    }
  }, [currentUser]);

  // Core state collections with localStorage hydration
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('advance_auto_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('advance_auto_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('advance_auto_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('advance_auto_services');
    return saved ? JSON.parse(saved) : initialServices;
  });

  const [jobCards, setJobCards] = useState<JobCard[]>(() => {
    const saved = localStorage.getItem('advance_auto_job_cards');
    return saved ? JSON.parse(saved) : initialJobCards;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('advance_auto_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('advance_auto_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('advance_auto_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('advance_auto_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('advance_auto_purchases');
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [mechanics, setMechanics] = useState<Mechanic[]>(() => {
    const saved = localStorage.getItem('advance_auto_mechanics');
    return saved ? JSON.parse(saved) : initialMechanics;
  });

  const [reminders, setReminders] = useState<ServiceReminder[]>(() => {
    const saved = localStorage.getItem('advance_auto_reminders');
    return saved ? JSON.parse(saved) : initialReminders;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('advance_auto_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [settings, setSettings] = useState<WorkshopSettings>(() => {
    const saved = localStorage.getItem('advance_auto_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialSettings,
          ...parsed,
          currency: parsed.currency || initialSettings.currency,
          currencySettings: parsed.currencySettings || initialSettings.currencySettings,
          printSettings: { ...initialSettings.printSettings, ...(parsed.printSettings || {}) },
        };
      } catch (e) {
        return initialSettings;
      }
    }
    return initialSettings;
  });

  // Centralized Currency Formatter
  const formatMoney = (amount: number | string | undefined | null): string => {
    return formatCurrency(amount, settings);
  };

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('advance_auto_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('advance_auto_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('advance_auto_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('advance_auto_services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('advance_auto_job_cards', JSON.stringify(jobCards)); }, [jobCards]);
  useEffect(() => { localStorage.setItem('advance_auto_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('advance_auto_payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('advance_auto_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('advance_auto_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('advance_auto_purchases', JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem('advance_auto_mechanics', JSON.stringify(mechanics)); }, [mechanics]);
  useEffect(() => { localStorage.setItem('advance_auto_reminders', JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { localStorage.setItem('advance_auto_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('advance_auto_settings', JSON.stringify(settings)); }, [settings]);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Audit Logging helper
  const logAudit = (action: AuditLog['action'], details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      action,
      details,
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'System',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Print Preview state
  const [printPreview, setPrintPreview] = useState<PrintPreviewData>({
    isOpen: false,
    type: 'invoice',
    data: null,
    format: '80MM',
  });

  const openPrintPreview = (
    type: 'invoice' | 'job_card' | 'payment_receipt', 
    data: any, 
    format?: '80MM' | 'A4',
    autoPrint = false
  ) => {
    setPrintPreview({
      isOpen: true,
      type,
      data,
      format: format || settings.printSettings.defaultFormat || '80MM',
      autoPrint,
    });
  };

  const closePrintPreview = () => {
    setPrintPreview(prev => ({ ...prev, isOpen: false }));
  };

  const setPrintFormat = (format: '80MM' | 'A4') => {
    setPrintPreview(prev => ({ ...prev, format }));
  };

  // Dedicated Same-Tab Print state (reliable fallback when popup windows blocked)
  const [sameTabPrint, setSameTabPrint] = useState<SameTabPrintData>({
    isActive: false,
    type: 'invoice',
    data: null,
    format: '80MM',
  });

  const openSameTabPrint = (
    type: 'invoice' | 'job_card' | 'payment_receipt',
    data: any,
    format?: '80MM' | 'A4',
    returnTab?: string
  ) => {
    setSameTabPrint({
      isActive: true,
      type,
      data,
      format: format || settings.printSettings.defaultFormat || '80MM',
      returnTab,
    });
  };

  const closeSameTabPrint = () => {
    setSameTabPrint(prev => ({ ...prev, isActive: false }));
  };

  // Auth actions
  const login = (email: string) => {
    const found = initialUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      logAudit('Login', `User ${found.name} signed in successfully`);
      addToast('success', 'Welcome Back', `Logged in as ${found.name} (${found.role})`);
      return true;
    }
    // Generic fallback for any email
    const generic: User = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0].toUpperCase(),
      email,
      role: 'Admin',
    };
    setCurrentUser(generic);
    logAudit('Login', `User ${generic.name} logged in`);
    addToast('success', 'Logged In', `Welcome ${generic.name}`);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      logAudit('Logout', `User ${currentUser.name} signed out`);
    }
    setCurrentUser(null);
    addToast('info', 'Logged Out', 'You have been safely signed out');
  };

  const switchUserRole = (role: User['role']) => {
    const found = initialUsers.find(u => u.role === role) || {
      id: 'usr-switched',
      name: `Demo ${role}`,
      email: `${role.toLowerCase().replace(/\s+/g, '')}@advanceauto.com`,
      role,
    };
    setCurrentUser(found);
    logAudit('Permission Change', `Switched active role to ${role}`);
    addToast('info', 'Role Switched', `Active view now: ${role}`);
  };

  // Customer Actions
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt' | 'balance'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: 'cust-' + (customers.length + 1) + '-' + Date.now().toString().slice(-4),
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [newCust, ...prev]);
    logAudit('Customer Modification', `Created new customer: ${newCust.name}`);
    addToast('success', 'Customer Added', `${newCust.name} registered successfully`);
    return newCust;
  };

  const updateCustomer = (id: string, partial: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...partial } : c));
    logAudit('Customer Modification', `Updated customer ID ${id}`);
    addToast('success', 'Customer Updated', 'Details saved successfully');
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    logAudit('Customer Modification', `Deleted customer ID ${id}`);
    addToast('warning', 'Customer Removed', 'Customer deleted from directory');
  };

  // Vehicle Actions
  const addVehicle = (vehData: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle => {
    const newVeh: Vehicle = {
      ...vehData,
      id: 'veh-' + (vehicles.length + 1) + '-' + Date.now().toString().slice(-4),
      createdAt: new Date().toISOString(),
    };
    setVehicles(prev => [newVeh, ...prev]);
    logAudit('Customer Modification', `Added vehicle ${newVeh.regNumber} (${newVeh.make} ${newVeh.model})`);
    addToast('success', 'Vehicle Added', `${newVeh.regNumber} registered successfully`);
    return newVeh;
  };

  const updateVehicle = (id: string, partial: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...partial } : v));
    addToast('success', 'Vehicle Updated', 'Vehicle details updated');
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    addToast('warning', 'Vehicle Removed', 'Vehicle profile deleted');
  };

  // Product Actions
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...prodData,
      id: 'prod-' + (products.length + 1) + '-' + Date.now().toString().slice(-4),
    };
    setProducts(prev => [newProd, ...prev]);
    logAudit('Stock Adjustment', `Added new product catalog item: ${newProd.name} (SKU: ${newProd.sku})`);
    addToast('success', 'Product Added', `${newProd.name} added to inventory`);
    return newProd;
  };

  const updateProduct = (id: string, partial: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...partial } : p));
    addToast('success', 'Product Updated', 'Product specifications updated');
  };

  const adjustProductStock = (id: string, delta: number, reason: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextStock = Math.max(0, p.stock + delta);
        return { ...p, stock: nextStock };
      }
      return p;
    }));
    const p = products.find(prod => prod.id === id);
    logAudit('Stock Adjustment', `Adjusted stock for ${p?.name || id}: ${delta > 0 ? '+' : ''}${delta}. Reason: ${reason}`);
    addToast('info', 'Stock Adjusted', `Stock adjusted by ${delta > 0 ? '+' : ''}${delta}`);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast('warning', 'Product Deleted', 'Item removed from inventory');
  };

  // Service Actions
  const addService = (srvData: Omit<ServiceItem, 'id'>): ServiceItem => {
    const newSrv: ServiceItem = {
      ...srvData,
      id: 'srv-' + (services.length + 1) + '-' + Date.now().toString().slice(-4),
    };
    setServices(prev => [newSrv, ...prev]);
    addToast('success', 'Service Created', `${newSrv.name} added to service menu`);
    return newSrv;
  };

  const updateService = (id: string, partial: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...partial } : s));
    addToast('success', 'Service Updated', 'Service details modified');
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    addToast('warning', 'Service Removed', 'Service removed from catalog');
  };

  // Job Cards
  const createJobCard = (data: Partial<JobCard>): JobCard => {
    const nextNumber = 'JC-2026-' + (jobCards.length + 1).toString().padStart(4, '0');
    const newJob: JobCard = {
      id: 'jc-' + Date.now(),
      jobCardNumber: nextNumber,
      customerId: data.customerId || '',
      vehicleId: data.vehicleId || '',
      mileage: data.mileage || 0,
      complaint: data.complaint || 'General diagnostic & repair',
      recommendedWork: data.recommendedWork || '',
      assignedMechanicId: data.assignedMechanicId || mechanics[0]?.id || '',
      status: 'RECEIVED',
      statusHistory: [
        {
          status: 'RECEIVED',
          timestamp: new Date().toISOString(),
          note: 'Job Card initialized at workshop reception',
          updatedBy: currentUser?.name || 'Reception',
        }
      ],
      inspection: data.inspection || initialInspectionChecklist(),
      services: data.services || [],
      parts: data.parts || [],
      labourCost: data.labourCost || 0,
      partsCost: data.partsCost || 0,
      discount: data.discount || 0,
      tax: data.tax || 0,
      estimatedCost: data.estimatedCost || 0,
      actualCost: data.actualCost || 0,
      paidAmount: 0,
      isInvoiceCreated: false,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      estimatedDelivery: data.estimatedDelivery || '',
    };

    setJobCards(prev => [newJob, ...prev]);
    logAudit('Job Status Change', `Created Job Card ${nextNumber} for vehicle ID ${newJob.vehicleId}`);
    addToast('success', 'Job Card Created', `${nextNumber} has been logged in workshop queue`);

    // Auto-update vehicle mileage if higher
    if (newJob.vehicleId && newJob.mileage > 0) {
      setVehicles(prev => prev.map(v => (v.id === newJob.vehicleId && newJob.mileage > v.mileage) ? { ...v, mileage: newJob.mileage } : v));
    }

    return newJob;
  };

  const updateJobCard = (id: string, data: Partial<JobCard>) => {
    setJobCards(prev => prev.map(jc => {
      if (jc.id === id) {
        // Recalculate totals if parts or services changed
        const services = data.services !== undefined ? data.services : jc.services;
        const parts = data.parts !== undefined ? data.parts : jc.parts;
        const labourCost = services.reduce((sum, s) => sum + s.labourPrice, 0);
        const partsCost = parts.reduce((sum, p) => sum + p.totalPrice, 0);
        const discount = data.discount !== undefined ? data.discount : jc.discount;
        const subtotal = Math.max(0, labourCost + partsCost - discount);
        const taxRate = settings.defaultTaxRate / 100;
        const tax = Number((subtotal * taxRate).toFixed(2));
        const actualCost = Number((subtotal + tax).toFixed(2));

        return {
          ...jc,
          ...data,
          labourCost,
          partsCost,
          actualCost,
          tax,
        };
      }
      return jc;
    }));
    addToast('success', 'Job Card Saved', 'Job specifications and parts updated');
  };

  const updateJobCardStatus = (id: string, status: JobCardStatus, note?: string) => {
    setJobCards(prev => prev.map(jc => {
      if (jc.id === id) {
        const historyEntry = {
          status,
          timestamp: new Date().toISOString(),
          note: note || `Status transitioned to ${status}`,
          updatedBy: currentUser?.name || 'Staff',
        };
        const isCompleted = status === 'READY' || status === 'DELIVERED';
        return {
          ...jc,
          status,
          statusHistory: [historyEntry, ...jc.statusHistory],
          completedAt: isCompleted ? (jc.completedAt || new Date().toISOString()) : jc.completedAt,
        };
      }
      return jc;
    }));
    logAudit('Job Status Change', `Job Card ${id} marked as ${status}`);
    addToast('info', 'Status Updated', `Job marked as ${status}`);
  };

  const updateJobCardInspection = (id: string, inspection: VehicleInspection) => {
    setJobCards(prev => prev.map(jc => jc.id === id ? { ...jc, inspection } : jc));
    addToast('success', 'Inspection Saved', 'Vehicle inspection checklist updated');
  };

  const convertJobCardToInvoice = (jobCardId: string, paymentMethod: PaymentMethod = 'Cash'): Invoice | null => {
    const jc = jobCards.find(j => j.id === jobCardId);
    if (!jc) return null;
    if (jc.isInvoiceCreated && jc.invoiceId) {
      addToast('warning', 'Invoice Exists', `Invoice already generated for ${jc.jobCardNumber}`);
      const existing = invoices.find(inv => inv.id === jc.invoiceId);
      if (existing) openPrintPreview('invoice', existing);
      return existing || null;
    }

    const nextInvNumber = 'INV-2026-' + (invoices.length + 1).toString().padStart(6, '0');
    
    // Map items
    const invoiceItems = [
      ...jc.services.map(s => ({
        id: 'item-' + Math.random().toString(36).substr(2, 6),
        description: s.name,
        itemType: 'Service' as const,
        quantity: 1,
        unitPrice: s.labourPrice,
        discount: 0,
        tax: Number((s.labourPrice * (settings.defaultTaxRate / 100)).toFixed(2)),
        total: Number((s.labourPrice * (1 + settings.defaultTaxRate / 100)).toFixed(2)),
      })),
      ...jc.parts.map(p => ({
        id: 'item-' + Math.random().toString(36).substr(2, 6),
        description: p.name,
        itemType: 'Part' as const,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        discount: 0,
        tax: Number((p.totalPrice * (settings.defaultTaxRate / 100)).toFixed(2)),
        total: Number((p.totalPrice * (1 + settings.defaultTaxRate / 100)).toFixed(2)),
      })),
    ];

    const subtotal = jc.labourCost + jc.partsCost;
    const grandTotal = jc.actualCost;

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: nextInvNumber,
      jobCardId: jc.id,
      customerId: jc.customerId,
      vehicleId: jc.vehicleId,
      items: invoiceItems,
      subtotal,
      discount: jc.discount,
      tax: jc.tax,
      grandTotal,
      paidAmount: grandTotal, // Mark paid by default on completion
      dueAmount: 0,
      paymentMethod,
      status: 'Paid',
      notes: `Generated from Job Card ${jc.jobCardNumber}. ${jc.complaint}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Staff',
    };

    // Deduct stock for parts used in job card
    jc.parts.forEach(part => {
      adjustProductStock(part.productId, -part.quantity, `Deducted for Job Card ${jc.jobCardNumber}`);
    });

    // Create payment entry
    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      paymentNumber: 'PAY-2026-' + (payments.length + 1).toString().padStart(4, '0'),
      invoiceId: newInvoice.id,
      customerId: jc.customerId,
      amount: grandTotal,
      method: paymentMethod,
      date: new Date().toISOString(),
      reference: `JOB-${jc.jobCardNumber}`,
      notes: `Settlement for Job Card ${jc.jobCardNumber}`,
      createdBy: currentUser?.name || 'Staff',
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setPayments(prev => [newPayment, ...prev]);

    // Update job card as invoiced and delivered
    setJobCards(prev => prev.map(item => item.id === jc.id ? {
      ...item,
      isInvoiceCreated: true,
      invoiceId: newInvoice.id,
      status: 'DELIVERED',
      paidAmount: grandTotal,
      statusHistory: [
        {
          status: 'DELIVERED',
          timestamp: new Date().toISOString(),
          note: `Invoice ${nextInvNumber} settled and vehicle released`,
          updatedBy: currentUser?.name || 'Staff',
        },
        ...item.statusHistory,
      ]
    } : item));

    logAudit('Sale', `Converted Job Card ${jc.jobCardNumber} to Invoice ${nextInvNumber} ($${grandTotal})`);
    addToast('success', 'Invoice & Payment Completed', `Invoice ${nextInvNumber} created & settled`);

    // Trigger Print Preview (and auto-print if configured)
    openPrintPreview('invoice', newInvoice, settings.printSettings.defaultFormat, settings.printSettings.autoPrintAfterSale);

    return newInvoice;
  };

  // Complete POS Fast Sale Flow
  const createPOSSale = (saleData: {
    customerId: string;
    vehicleId?: string;
    cart: CartItem[];
    invoiceDiscount: number;
    taxRate: number;
    paymentMethod: PaymentMethod;
    paidAmount: number;
    notes?: string;
  }): Invoice => {
    const nextInvNumber = 'INV-2026-' + (invoices.length + 1).toString().padStart(6, '0');

    // Calculate line items
    let subtotal = 0;
    const items = saleData.cart.map(item => {
      const lineSub = item.price * item.quantity;
      const lineDisc = (lineSub * (item.discountPercent || 0)) / 100;
      const netLine = lineSub - lineDisc;
      const lineTax = (netLine * (item.taxPercent || 0)) / 100;
      subtotal += lineSub;

      return {
        id: 'item-' + Math.random().toString(36).substr(2, 6),
        description: item.name,
        sku: item.sku,
        itemType: (item.category === 'Service' ? 'Service' : item.category === 'Tyre' ? 'Tyre' : item.category === 'Battery' ? 'Battery' : 'Part') as any,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: lineDisc,
        tax: lineTax,
        total: Number((netLine + lineTax).toFixed(2)),
      };
    });

    const netAfterItemDiscounts = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice - it.discount), 0);
    const invoiceDiscount = saleData.invoiceDiscount || 0;
    const taxableAmount = Math.max(0, netAfterItemDiscounts - invoiceDiscount);
    const tax = Number((taxableAmount * (saleData.taxRate / 100)).toFixed(2));
    const grandTotal = Number((taxableAmount + tax).toFixed(2));
    const paidAmount = Number(saleData.paidAmount.toFixed(2));
    const dueAmount = Number(Math.max(0, grandTotal - paidAmount).toFixed(2));

    const invoiceStatus = dueAmount <= 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid');

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: nextInvNumber,
      customerId: saleData.customerId,
      vehicleId: saleData.vehicleId,
      items,
      subtotal,
      discount: invoiceDiscount,
      tax,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentMethod: saleData.paymentMethod,
      status: invoiceStatus,
      notes: saleData.notes,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Cashier',
    };

    // 1. Save Sale & Invoice
    setInvoices(prev => [newInvoice, ...prev]);

    // 2. Deduct inventory for physical products in cart
    saleData.cart.forEach(item => {
      if (item.category !== 'Service') {
        adjustProductStock(item.productId, -item.quantity, `POS Sale ${nextInvNumber}`);
      }
    });

    // 3. Record payment if paidAmount > 0
    if (paidAmount > 0) {
      const newPay: Payment = {
        id: 'pay-' + Date.now(),
        paymentNumber: 'PAY-2026-' + (payments.length + 1).toString().padStart(4, '0'),
        invoiceId: newInvoice.id,
        customerId: saleData.customerId,
        amount: paidAmount,
        method: saleData.paymentMethod,
        date: new Date().toISOString(),
        reference: `POS-SALE-${nextInvNumber}`,
        notes: `POS transaction payment for ${nextInvNumber}`,
        createdBy: currentUser?.name || 'Cashier',
      };
      setPayments(prev => [newPay, ...prev]);
    }

    // 4. Update Customer Balance if credit/due
    if (dueAmount > 0) {
      setCustomers(prev => prev.map(c => c.id === saleData.customerId ? { ...c, balance: Number((c.balance + dueAmount).toFixed(2)) } : c));
    }

    logAudit('Sale', `Completed POS Sale ${nextInvNumber} for $${grandTotal} (Paid: $${paidAmount}, Due: $${dueAmount})`);
    addToast('success', 'Sale Processed!', `Invoice ${nextInvNumber} created successfully`);

    // 5. Open print preview / trigger auto-print if enabled
    openPrintPreview('invoice', newInvoice, settings.printSettings.defaultFormat, settings.printSettings.autoPrintAfterSale);

    return newInvoice;
  };

  const addInvoicePayment = (invoiceId: string, amount: number, method: PaymentMethod, reference?: string): Payment | null => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return null;

    const actualAmount = Math.min(amount, inv.dueAmount);
    const newPaid = Number((inv.paidAmount + actualAmount).toFixed(2));
    const newDue = Number(Math.max(0, inv.grandTotal - newPaid).toFixed(2));
    const newStatus = newDue <= 0 ? 'Paid' : 'Partial';

    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      paymentNumber: 'PAY-2026-' + (payments.length + 1).toString().padStart(4, '0'),
      invoiceId: inv.id,
      customerId: inv.customerId,
      amount: actualAmount,
      method,
      date: new Date().toISOString(),
      reference: reference || `MANUAL-${inv.invoiceNumber}`,
      notes: `Balance payment towards ${inv.invoiceNumber}`,
      createdBy: currentUser?.name || 'Cashier',
    };

    // Update invoice
    setInvoices(prev => prev.map(i => i.id === invoiceId ? {
      ...i,
      paidAmount: newPaid,
      dueAmount: newDue,
      status: newStatus,
    } : i));

    // Update customer balance
    setCustomers(prev => prev.map(c => c.id === inv.customerId ? {
      ...c,
      balance: Math.max(0, Number((c.balance - actualAmount).toFixed(2)))
    } : c));

    setPayments(prev => [newPayment, ...prev]);
    logAudit('Payment', `Recorded payment of $${actualAmount} against ${inv.invoiceNumber} via ${method}`);
    addToast('success', 'Payment Received', `$${actualAmount} recorded against ${inv.invoiceNumber}`);

    openPrintPreview('payment_receipt', newPayment);
    return newPayment;
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id' | 'createdBy'>): Expense => {
    const newExp: Expense = {
      ...expData,
      id: 'exp-' + Date.now(),
      createdBy: currentUser?.name || 'Staff',
    };
    setExpenses(prev => [newExp, ...prev]);
    logAudit('Payment', `Recorded workshop expense: ${newExp.category} - $${newExp.amount} (${newExp.description})`);
    addToast('success', 'Expense Recorded', `$${newExp.amount} added to ${newExp.category}`);
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    addToast('info', 'Expense Deleted', 'Expense entry removed');
  };

  // Suppliers & Purchases
  const addSupplier = (supData: Omit<Supplier, 'id' | 'currentBalance'>): Supplier => {
    const newSup: Supplier = {
      ...supData,
      id: 'sup-' + Date.now(),
      currentBalance: supData.openingBalance || 0,
    };
    setSuppliers(prev => [newSup, ...prev]);
    addToast('success', 'Supplier Added', `${newSup.company} saved`);
    return newSup;
  };

  const updateSupplier = (id: string, partial: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...partial } : s));
    addToast('success', 'Supplier Updated', 'Supplier profile updated');
  };

  const createPurchase = (poData: Omit<Purchase, 'id' | 'purchaseNumber'>): Purchase => {
    const nextNumber = 'PO-2026-' + (purchases.length + 1).toString().padStart(4, '0');
    const newPO: Purchase = {
      ...poData,
      id: 'po-' + Date.now(),
      purchaseNumber: nextNumber,
    };
    setPurchases(prev => [newPO, ...prev]);
    logAudit('Purchase', `Created Purchase Order ${nextNumber} from supplier ID ${newPO.supplierId} ($${newPO.total})`);
    addToast('success', 'PO Created', `Purchase Order ${nextNumber} generated`);
    return newPO;
  };

  const updatePurchaseStatus = (id: string, status: Purchase['status']) => {
    const po = purchases.find(p => p.id === id);
    if (!po) return;

    if (status === 'Received' && po.status !== 'Received') {
      // Receiving purchase automatically increases inventory!
      po.items.forEach(item => {
        adjustProductStock(item.productId, item.quantity, `Stock In from PO ${po.purchaseNumber}`);
      });
      // Update supplier payable balance
      if (po.dueAmount > 0) {
        setSuppliers(prev => prev.map(s => s.id === po.supplierId ? { ...s, currentBalance: s.currentBalance + po.dueAmount } : s));
      }
      addToast('success', 'Stock Received!', `Items added to inventory from ${po.purchaseNumber}`);
    }

    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    logAudit('Purchase', `PO ${po.purchaseNumber} status changed to ${status}`);
    addToast('info', 'Status Updated', `PO marked as ${status}`);
  };

  // Mechanics
  const addMechanic = (mechData: Omit<Mechanic, 'id' | 'activeJobsCount'>): Mechanic => {
    const newMech: Mechanic = {
      ...mechData,
      id: 'mech-' + Date.now(),
      activeJobsCount: 0,
    };
    setMechanics(prev => [newMech, ...prev]);
    addToast('success', 'Mechanic Enrolled', `${newMech.name} added to staff roster`);
    return newMech;
  };

  const updateMechanic = (id: string, partial: Partial<Mechanic>) => {
    setMechanics(prev => prev.map(m => m.id === id ? { ...m, ...partial } : m));
    addToast('success', 'Staff Updated', 'Mechanic profile updated');
  };

  // Reminders
  const addReminder = (remData: Omit<ServiceReminder, 'id' | 'status'>): ServiceReminder => {
    const newRem: ServiceReminder = {
      ...remData,
      id: 'rem-' + Date.now(),
      status: 'Pending',
    };
    setReminders(prev => [newRem, ...prev]);
    addToast('success', 'Reminder Scheduled', `${newRem.type} reminder logged`);
    return newRem;
  };

  const updateReminderStatus = (id: string, status: ServiceReminder['status']) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    addToast('info', 'Reminder Updated', `Reminder marked as ${status}`);
  };

  // Settings
  const updateSettings = (newSettings: Partial<WorkshopSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      printSettings: {
        ...prev.printSettings,
        ...(newSettings.printSettings || {}),
      }
    }));
    logAudit('Permission Change', 'Updated workshop configuration and print settings');
    addToast('success', 'Settings Saved', 'Workshop preferences successfully updated');
  };

  // Reset to seed data
  const resetToDemoData = () => {
    localStorage.removeItem('advance_auto_customers');
    localStorage.removeItem('advance_auto_vehicles');
    localStorage.removeItem('advance_auto_products');
    localStorage.removeItem('advance_auto_services');
    localStorage.removeItem('advance_auto_job_cards');
    localStorage.removeItem('advance_auto_invoices');
    localStorage.removeItem('advance_auto_payments');
    localStorage.removeItem('advance_auto_expenses');
    localStorage.removeItem('advance_auto_suppliers');
    localStorage.removeItem('advance_auto_purchases');
    localStorage.removeItem('advance_auto_mechanics');
    localStorage.removeItem('advance_auto_reminders');
    localStorage.removeItem('advance_auto_audit_logs');
    localStorage.removeItem('advance_auto_settings');

    setCustomers(initialCustomers);
    setVehicles(initialVehicles);
    setProducts(initialProducts);
    setServices(initialServices);
    setJobCards(initialJobCards);
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setSuppliers(initialSuppliers);
    setPurchases(initialPurchases);
    setMechanics(initialMechanics);
    setReminders(initialReminders);
    setAuditLogs(initialAuditLogs);
    setSettings(initialSettings);
    addToast('info', 'Reset Complete', 'Workshop restored to pristine initial commercial dataset');
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        setDarkMode,
        toasts,
        addToast,
        removeToast,
        currentUser,
        setCurrentUser,
        switchUserRole,
        login,
        logout,
        customers,
        vehicles,
        products,
        services,
        jobCards,
        invoices,
        payments,
        expenses,
        suppliers,
        purchases,
        mechanics,
        reminders,
        auditLogs,
        settings,
        formatMoney,
        printPreview,
        openPrintPreview,
        closePrintPreview,
        setPrintFormat,
        sameTabPrint,
        openSameTabPrint,
        closeSameTabPrint,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addProduct,
        updateProduct,
        adjustProductStock,
        deleteProduct,
        addService,
        updateService,
        deleteService,
        createJobCard,
        updateJobCard,
        updateJobCardStatus,
        updateJobCardInspection,
        convertJobCardToInvoice,
        createPOSSale,
        addInvoicePayment,
        addExpense,
        deleteExpense,
        addSupplier,
        updateSupplier,
        createPurchase,
        updatePurchaseStatus,
        addMechanic,
        updateMechanic,
        addReminder,
        updateReminderStatus,
        updateSettings,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
