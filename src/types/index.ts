/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompanySettings {
  companyName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  currencySymbol: string;
  taxVatRate: number; // e.g. 7.5%
  defaultOverheadPercentage: number; // e.g. 10%
  // Company Bank & Legal Details
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  routingNumber?: string;
  bkashNagadNumber?: string;
  tradeLicenseNo?: string;
  tinBinNumber?: string;
  ownerSignatoryName?: string;
  invoiceFooterNote?: string;
  // All Sheet Dropdown Lists
  projectTypes: string[];
  projectStatuses: string[];
  clientTypes?: string[];
  installmentNames?: string[];
  expenseCategories: string[];
  dailySubcategories?: string[];
  conveyanceModes?: string[];
  materialCategories: string[];
  labourTypes: string[];
  paymentMethods: string[];
  suppliers: string[];
  employees: string[];
  unitsOfMeasurement: string[];
  staffRoles?: string[];
  officeDepartments?: string[];
  billTypes?: string[];
  assetCategories?: string[];
}

export interface Client {
  id: string; // CLI-001
  name: string;
  phone: string;
  email: string;
  address: string;
  clientType: string;
  projectName: string;
  contractDate: string;
  totalContractAmount: number;
  advancePayment: number;
  totalReceived: number; // Calculated
  totalDue: number; // Calculated
  clientStatus: 'Active' | 'Completed' | 'Prospective' | 'Archived';
  notes: string;
  isArchived?: boolean;
}

export interface Project {
  id: string; // PRJ-001
  projectName: string;
  clientId: string;
  clientName: string;
  siteAddress: string;
  projectType: string;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  projectManager: string;
  contractValue: number;
  vatRate: number;
  discount: number;
  netContractValue: number;
  projectStatus: 'In Planning' | 'Designing' | 'In Progress / Execution' | 'Finishing' | 'Completed' | 'On Hold' | 'Cancelled';
  progressPercentage: number;
  
  // Cost breakdown
  estimatedMaterialCost: number;
  estimatedLabourCost: number;
  estimatedOtherCost: number;
  estimatedProfit: number;

  actualMaterialCost: number; // Calculated from Transactions
  actualLabourCost: number; // Calculated from Labour Attendance
  subcontractorCost: number;
  otherDirectCosts: number;
  allocatedOverhead: number; // General overhead allocation
  totalProjectCost: number; // Calculated

  amountReceived: number; // Calculated from Payments
  outstandingDue: number; // Calculated
  actualProfit: number; // netContractValue - totalProjectCost
  profitMargin: number; // (actualProfit / netContractValue) * 100
  remarks: string;
  isArchived?: boolean;
}

export interface MaterialItem {
  id: string; // MAT-001
  materialName: string;
  category: string;
  unit: string;
  supplier: string;
  purchaseDate: string;
  projectId?: string;
  unitPurchasePrice: number;
  totalPurchasedQty: number;
  totalUsedQty: number;
  totalReturnedQty: number;
  currentStock: number; // totalPurchased - totalUsed + totalReturned
  totalStockValue: number; // currentStock * unitPurchasePrice
  reorderLevel: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  notes: string;
}

export interface MaterialTransaction {
  id: string; // MTX-001
  date: string;
  materialId: string;
  materialName: string;
  type: 'PURCHASE' | 'SITE_ISSUE' | 'SITE_RETURN';
  projectId: string; // PRJ-001 or "WAREHOUSE"
  projectName?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  reference: string; // PO number, Chalan, Site Slip
  notes: string;
}

export interface Supplier {
  id: string; // SUP-001
  name: string;
  phone: string;
  address: string;
  materialSupplied: string;
  totalBilled: number;
  totalPaid: number;
  outstandingDue: number;
  status: 'Active' | 'Archived';
}

export interface PurchaseOrder {
  id: string; // PO-001
  date: string;
  supplierId: string;
  supplierName: string;
  projectId: string;
  projectName?: string;
  materialItemsSummary: string;
  totalBill: number;
  amountPaid: number;
  outstandingSupplierDue: number;
  dueDate: string;
  paymentStatus: 'Fully Paid' | 'Partially Paid' | 'Unpaid';
  notes: string;
}

export interface Worker {
  id: string; // WRK-001
  name: string;
  phone: string;
  skillTrade: string;
  paymentType: 'Daily Wage' | 'Monthly Salary' | 'Contract Based' | 'Board Rate';
  dailyRate: number;
  monthlySalary: number;
  boardRate?: number;
  totalBoards?: number;
  assignedProject: string;
  totalEarned: number;
  totalPaid: number;
  outstandingSalary: number;
  status: 'Active' | 'Inactive';
  notes: string;
}

export interface LabourAttendance {
  id: string; // ATT-001
  attendanceDate: string;
  workerId: string;
  workerName: string;
  skillTrade: string;
  projectId: string;
  projectName: string;
  status: 'Present' | 'Absent' | 'Half Day';
  paymentMode?: 'Daily Wage' | 'Monthly Salary' | 'Contract Based' | 'Board Rate';
  boardRate?: number;
  boardCount?: number;
  overtimeHours: number;
  overtimeRate: number;
  baseRate: number;
  labourCost: number; // Calculated
  amountPaid: number;
  outstandingSalary: number;
  notes: string;
}

export interface PaymentReceived {
  id: string; // PAY-001
  date: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  installmentName: string; // "Advance 25%", "Civil & Carpentry 35%", "Paint & Fixtures 25%", "Final Handover 15%"
  paymentMethod: string;
  paymentReference: string; // Cheque No, TrxID, Bank ref
  amountReceived: number;
  receivedBy: string;
  notes: string;
}

export interface ExpenseItem {
  id: string; // EXP-001
  date: string;
  expenseCategory: string;
  expenseType: 'PROJECT_DIRECT' | 'OFFICE_OVERHEAD';
  description: string;
  projectId: string; // Specific project ID or "OFFICE_GENERAL"
  projectName?: string;
  supplierPayee: string;
  paymentMethod: string;
  billInvoiceNumber: string;
  amount: number;
  paymentStatus: 'Paid' | 'Unpaid';
  approvedBy: string;
  notes: string;
  // Daily Costs & Conveyance Specific Fields
  isDailyCost?: boolean;
  conveyanceMode?: string; // 'Rickshaw' | 'CNG' | 'Uber / Pathao' | 'Bus' | 'Bike Fuel' | 'Metro Rail' | 'Van' | 'N/A'
  travelRoute?: string; // e.g., 'Office -> Gulshan-2 Site'
  spentBy?: string; // Employee/Architect who spent the money
  dailySubcategory?: string; // 'Conveyance' | 'Site Visit' | 'Tea & Snacks' | 'Client Entertainment' | 'Emergency Hardware' | 'Printing & Drawing' | 'Porter' | 'Office Daily'
  // Office Salary & Advance Specific Fields
  staffId?: string;
  salaryMonth?: string;
  salaryPaymentType?: string;
}

export interface PettyCashFund {
  currentBalance: number;
  totalFundsAdded: number;
  lastFundAddedDate?: string;
  lastFundAddedAmount?: number;
}


export interface OfficeStaff {
  id: string; // STF-001
  name: string;
  role: string;
  department?: string;
  phone: string;
  email: string;
  paymentType?: 'Daily Wage' | 'Monthly Salary' | 'Contract Based';
  dailyRate?: number;
  monthlySalary: number;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  paymentMethod?: string;
  bankOrBkashDetails?: string;
  totalAdvancePaid?: number;
  totalSalaryPaid?: number;
  notes?: string;
}

export interface OfficeAsset {
  id: string; // AST-001
  assetName: string;
  category: string;
  purchaseDate: string;
  purchaseCost: number;
  condition: 'Brand New' | 'Excellent' | 'Good' | 'Needs Maintenance';
  assignedTo: string;
  serialNumber: string;
  notes: string;
}

export interface OfficeBill {
  id: string; // BIL-001
  billType: string;
  billingMonth: string; // e.g. "October 2026"
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid';
  paidDate?: string;
  notes: string;
  paymentMethod?: string;
}

export interface TaskItem {
  id: string; // TSK-001
  projectId: string;
  projectName: string;
  taskName: string;
  assignedPerson: string;
  startDate: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed';
  completionPercentage: number;
  notes: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'RESTORE';
  module: string;
  recordId: string;
  summary: string;
  user: string;
}

export interface CrudPermission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface ModulePermissions {
  dashboard: { view: boolean };
  projects: CrudPermission;
  clients: CrudPermission;
  dailyCosts: CrudPermission;
  expenses: CrudPermission;
  inventory: CrudPermission;
  labour: CrudPermission;
  staff: CrudPermission & { disburseSalary: boolean };
  reports: { view: boolean; export: boolean };
  settings: { view: boolean; edit: boolean };
  cloudSync: { view: boolean; sync: boolean; restore: boolean };
  users: CrudPermission;
}

export type ModuleKey =
  | 'dashboard'
  | 'projects'
  | 'clients'
  | 'dailyCosts'
  | 'expenses'
  | 'inventory'
  | 'labour'
  | 'staff'
  | 'reports'
  | 'settings'
  | 'cloudSync'
  | 'users';

export type ActionType = 'view' | 'add' | 'edit' | 'delete' | 'export' | 'sync' | 'restore' | 'disburseSalary';

export interface UserPermissions {
  // Granular action-level permissions
  modules?: ModulePermissions;
  // Legacy module flags for direct tab access checks
  viewDashboard?: boolean;
  manageProjects?: boolean;
  manageClients?: boolean;
  manageInventory?: boolean;
  manageDailyCosts?: boolean;
  manageLabour?: boolean;
  manageStaffAndPayroll?: boolean;
  viewFinancialReports?: boolean;
  manageCompanySettings?: boolean;
  manageCloudBackup?: boolean;
  manageUsers?: boolean;
}

export type UserRole = 'Owner' | 'Manager' | 'Site Supervisor' | 'Accountant' | 'Custom' | 'Client';

export interface AppUser {
  id: string; // USR-001
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  pin: string; // 4-digit PIN
  status: 'Active' | 'Suspended';
  avatar?: string;
  notes?: string;
  permissions: UserPermissions;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ReleaseNotification {
  id: string;
  version: string;
  title: string;
  summary: string;
  changes: string[];
  publishedAt: string;
  publishedBy: string;
  dataPreservedCount: number;
  audience: 'All' | 'ClientPortal' | 'TeamOnly';
}

export interface DataSnapshotBackup {
  id: string;
  label: string;
  createdAt: string;
  version: string;
  recordCounts: {
    projects: number;
    clients: number;
    payments: number;
    expenses: number;
    workers: number;
    attendance: number;
    materials: number;
    staff: number;
  };
  payloadJson: string;
}

