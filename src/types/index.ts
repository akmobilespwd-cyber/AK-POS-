// Core types for Advance Auto Workshop System

export type UserRole = 'Admin' | 'Manager' | 'Cashier' | 'Mechanic' | 'Inventory Manager' | 'Accountant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export type Permission = 
  | 'view_dashboard'
  | 'manage_pos'
  | 'manage_customers'
  | 'manage_vehicles'
  | 'manage_workshop'
  | 'manage_job_cards'
  | 'manage_services'
  | 'manage_inventory'
  | 'manage_purchases'
  | 'manage_suppliers'
  | 'manage_invoices'
  | 'manage_payments'
  | 'manage_expenses'
  | 'manage_employees'
  | 'view_reports'
  | 'manage_settings'
  | 'refund'
  | 'stock_adjust';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  taxId?: string;
  creditLimit: number;
  balance: number; // positive = owes us (receivable)
  notes?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  regNumber: string;
  make: string;
  model: string;
  year: number;
  variant?: string;
  color: string;
  vin?: string;
  engineNumber?: string;
  mileage: number; // in km
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'LPG';
  createdAt: string;
}

export type ProductCategory = 'Spare Part' | 'Service' | 'Tyre' | 'Battery' | 'Fluid' | 'Accessory';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  brand: string;
  compatibility?: string; // e.g. "Toyota Corolla 2018-2024, Prado 2.8L"
  purchasePrice: number;
  salePrice: number;
  wholesalePrice?: number;
  taxPercent: number;
  stock: number;
  minStock: number;
  maxStock: number;
  supplierId?: string;
  location?: string; // Shelf A-12
  warrantyMonths?: number;
  // Tyre specific fields
  tyreWidth?: string;
  aspectRatio?: string;
  rimSize?: string;
  speedRating?: string;
  loadIndex?: string;
  dotYear?: string;
  // Battery specific fields
  batteryVoltage?: string;
  batteryAh?: string;
  batteryType?: string;
  isService?: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  labourPrice: number;
  estimatedDurationMin: number;
  taxPercent: number;
  warrantyMonths: number;
  requiredParts?: string[];
  isActive: boolean;
}

export type JobCardStatus = 
  | 'RECEIVED'
  | 'INSPECTION'
  | 'WAITING FOR PARTS'
  | 'IN PROGRESS'
  | 'READY'
  | 'DELIVERED';

export type InspectionStatus = 'Good' | 'Warning' | 'Critical' | 'Not Checked';

export interface InspectionCheckItem {
  item: string;
  status: InspectionStatus;
  notes?: string;
}

export interface VehicleInspection {
  engine: {
    oil: InspectionCheckItem;
    coolant: InspectionCheckItem;
    belts: InspectionCheckItem;
    leaks: InspectionCheckItem;
  };
  brakes: {
    brakePads: InspectionCheckItem;
    brakeDiscs: InspectionCheckItem;
    brakeFluid: InspectionCheckItem;
    handBrake: InspectionCheckItem;
  };
  tyres: {
    frontLeft: InspectionCheckItem;
    frontRight: InspectionCheckItem;
    rearLeft: InspectionCheckItem;
    rearRight: InspectionCheckItem;
    spare: InspectionCheckItem;
  };
  electrical: {
    lights: InspectionCheckItem;
    horn: InspectionCheckItem;
    ac: InspectionCheckItem;
    battery: InspectionCheckItem;
    alternator: InspectionCheckItem;
  };
  suspension: {
    shocks: InspectionCheckItem;
    bushes: InspectionCheckItem;
    steering: InspectionCheckItem;
  };
  generalNotes?: string;
  inspectorName?: string;
  inspectedAt?: string;
}

export interface JobCardPartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface JobCardServiceItem {
  serviceId: string;
  name: string;
  labourPrice: number;
  mechanicId?: string;
}

export interface JobCard {
  id: string;
  jobCardNumber: string; // e.g. "JC-2026-0001"
  customerId: string;
  vehicleId: string;
  mileage: number;
  complaint: string;
  recommendedWork?: string;
  assignedMechanicId: string;
  status: JobCardStatus;
  statusHistory: { status: JobCardStatus; timestamp: string; note?: string; updatedBy: string }[];
  inspection: VehicleInspection;
  services: JobCardServiceItem[];
  parts: JobCardPartItem[];
  labourCost: number;
  partsCost: number;
  discount: number;
  tax: number;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  isInvoiceCreated: boolean;
  invoiceId?: string;
  notes?: string;
  createdAt: string;
  estimatedDelivery?: string;
  completedAt?: string;
}

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Mobile Wallet' | 'Credit' | 'Split Payment';

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  stock: number;
  discountPercent: number;
  taxPercent: number;
  isService?: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  sku?: string;
  itemType: 'Part' | 'Service' | 'Labour' | 'Tyre' | 'Battery';
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-000001"
  jobCardId?: string;
  customerId: string;
  vehicleId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  status: 'Paid' | 'Partial' | 'Unpaid';
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface Payment {
  id: string;
  paymentNumber: string; // "PAY-2026-0001"
  invoiceId?: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference?: string;
  notes?: string;
  createdBy: string;
}

export type ExpenseCategory = 
  | 'Rent'
  | 'Electricity'
  | 'Salary'
  | 'Fuel'
  | 'Tools'
  | 'Maintenance'
  | 'Marketing'
  | 'Utilities'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  attachmentName?: string;
  createdBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  taxId?: string;
  openingBalance: number;
  currentBalance: number; // positive = we owe supplier (payable)
}

export interface PurchaseItem {
  productId: string;
  name: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string; // "PO-2026-0001"
  supplierId: string;
  status: 'Draft' | 'Ordered' | 'Received' | 'Partially Paid' | 'Paid';
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  date: string;
  notes?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  activeJobsCount: number;
  hourlyRate: number;
  joinedDate: string;
}

export interface ServiceReminder {
  id: string;
  customerId: string;
  vehicleId: string;
  type: 'Oil Change' | 'Vehicle Service' | 'Tyre Inspection' | 'Battery Warranty' | 'Brake Check' | 'General Tuneup';
  dueDate?: string;
  dueMileage?: number;
  status: 'Pending' | 'Sent' | 'Completed' | 'Dismissed';
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: 'Login' | 'Logout' | 'Sale' | 'Refund' | 'Stock Adjustment' | 'Purchase' | 'Payment' | 'Invoice Modification' | 'Job Status Change' | 'Customer Modification' | 'Permission Change';
  details: string;
  userId: string;
  userName: string;
  timestamp: string;
  ip?: string;
}

export interface CurrencySettings {
  name: string;
  code: string;
  symbol: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface WorkshopSettings {
  workshopName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  city: string;
  phone: string;
  whatsapp?: string;
  email: string;
  website?: string;
  taxNumber: string;
  registrationNumber?: string;
  invoicePrefix?: string;
  receiptPrefix?: string;
  jobCardPrefix?: string;
  currency: string;
  currencySettings: CurrencySettings;
  defaultTaxRate: number;
  printSettings: {
    autoPrintAfterSale: boolean;
    defaultFormat: '80MM' | 'A4';
    showLogo: boolean;
    receiptHeader: string;
    receiptFooter: string;
    termsAndConditions: string;
  };
  interfaceSettings?: {
    compactMode?: boolean;
    defaultNavLayout?: 'auto' | 'sidebar' | 'bottom_nav';
  };
}

export interface SameTabPrintData {
  isActive: boolean;
  type: 'invoice' | 'job_card' | 'payment_receipt';
  data: any;
  format: '80MM' | 'A4';
  returnTab?: string;
}
