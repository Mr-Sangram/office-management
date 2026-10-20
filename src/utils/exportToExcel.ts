/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import {
  CompanySettings,
  Client,
  Project,
  MaterialItem,
  MaterialTransaction,
  Supplier,
  PurchaseOrder,
  Worker,
  LabourAttendance,
  PaymentReceived,
  ExpenseItem,
  OfficeStaff,
  OfficeAsset,
  OfficeBill,
  TaskItem,
  AuditRecord,
} from '../types';

export function exportCompleteWorkbook(
  settings: CompanySettings,
  clients: Client[],
  projects: Project[],
  materials: MaterialItem[],
  transactions: MaterialTransaction[],
  suppliers: Supplier[],
  purchases: PurchaseOrder[],
  workers: Worker[],
  attendance: LabourAttendance[],
  payments: PaymentReceived[],
  expenses: ExpenseItem[],
  staff: OfficeStaff[],
  assets: OfficeAsset[],
  bills: OfficeBill[],
  tasks: TaskItem[],
  auditLogs: AuditRecord[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Dashboard Sheet
  const totalContract = projects.reduce((s, p) => s + p.contractValue, 0);
  const totalReceived = payments.reduce((s, p) => s + p.amountReceived, 0);
  const totalOutstanding = totalContract - totalReceived;
  const totalMaterialCost = transactions.filter(t => t.type === 'SITE_ISSUE').reduce((s, t) => s + t.totalCost, 0);
  const totalLabourCost = attendance.reduce((s, a) => s + a.labourCost, 0);
  const totalOfficeExpenses = expenses.filter(e => e.expenseType === 'OFFICE_OVERHEAD').reduce((s, e) => s + e.amount, 0);
  const totalDirectExpenses = expenses.filter(e => e.expenseType === 'PROJECT_DIRECT').reduce((s, e) => s + e.amount, 0);
  const totalProjectCost = totalMaterialCost + totalLabourCost + totalDirectExpenses;
  const netEstimatedProfit = totalReceived - (totalProjectCost + totalOfficeExpenses);

  const dashboardData: (string | number)[][] = [
    ['STUDIO ARCHVISTA INTERIOR & DECOR - EXECUTIVE ERP DASHBOARD'],
    ['Generated On:', new Date().toLocaleString()],
    [''],
    ['KPI METRIC', 'VALUE', '', 'FINANCIAL METRIC', 'AMOUNT (BDT ৳)'],
    ['Total Registered Clients', clients.length, '', 'Total Contract Value', totalContract],
    ['Total Projects', projects.length, '', 'Total Money Received', totalReceived],
    ['Active Running Projects', projects.filter(p => p.projectStatus.includes('Progress') || p.projectStatus === 'Finishing').length, '', 'Total Outstanding Due', totalOutstanding],
    ['Completed Projects', projects.filter(p => p.projectStatus === 'Completed').length, '', 'Total Material Cost', totalMaterialCost],
    ['Pending Tasks', tasks.filter(t => t.status !== 'Completed').length, '', 'Total Labour Wages Cost', totalLabourCost],
    ['Low Stock Alerts', materials.filter(m => m.stockStatus !== 'In Stock').length, '', 'Office Overhead Expenses', totalOfficeExpenses],
    ['Active Workers', workers.filter(w => w.status === 'Active').length, '', 'NET ESTIMATED PROFIT', netEstimatedProfit],
    [''],
    ['PROJECT PROGRESS & COST SUMMARY'],
    ['Project ID', 'Project Name', 'Client Name', 'Status', 'Progress %', 'Contract Value', 'Actual Cost', 'Received', 'Due', 'Profit Margin %']
  ];

  projects.forEach(p => {
    dashboardData.push([
      p.id,
      p.projectName,
      p.clientName,
      p.projectStatus,
      `${p.progressPercentage}%`,
      p.contractValue,
      p.totalProjectCost,
      p.amountReceived,
      p.outstandingDue,
      `${p.profitMargin.toFixed(1)}%`
    ]);
  });

  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);
  XLSX.utils.book_append_sheet(wb, wsDashboard, '01_Dashboard');

  // 2. Settings Sheet
  const maxRows = Math.max(
    settings.projectTypes.length,
    settings.projectStatuses.length,
    settings.expenseCategories.length,
    settings.materialCategories.length,
    settings.labourTypes.length,
    settings.paymentMethods.length,
    settings.unitsOfMeasurement.length
  );

  const settingsRows: (string | number)[][] = [
    ['Project Types', 'Project Statuses', 'Expense Categories', 'Material Categories', 'Labour Types', 'Payment Methods', 'Units']
  ];
  for (let i = 0; i < maxRows; i++) {
    settingsRows.push([
      settings.projectTypes[i] || '',
      settings.projectStatuses[i] || '',
      settings.expenseCategories[i] || '',
      settings.materialCategories[i] || '',
      settings.labourTypes[i] || '',
      settings.paymentMethods[i] || '',
      settings.unitsOfMeasurement[i] || ''
    ]);
  }
  const wsSettings = XLSX.utils.aoa_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(wb, wsSettings, '02_Settings');

  // 3. Clients Sheet
  const clientRows: (string | number)[][] = [
    ['Client ID', 'Client Name', 'Phone', 'Email', 'Address', 'Client Type', 'Project Name', 'Contract Date', 'Total Contract Amount', 'Advance Payment', 'Total Received', 'Total Due', 'Client Status', 'Notes']
  ];
  clients.forEach(c => {
    clientRows.push([
      c.id, c.name, c.phone, c.email, c.address, c.clientType, c.projectName, c.contractDate,
      c.totalContractAmount, c.advancePayment, c.totalReceived, c.totalDue, c.clientStatus, c.notes
    ]);
  });
  const wsClients = XLSX.utils.aoa_to_sheet(clientRows);
  XLSX.utils.book_append_sheet(wb, wsClients, '03_Clients');

  // 4. Projects Sheet
  const projectRows: (string | number)[][] = [
    ['Project ID', 'Project Name', 'Client ID', 'Client Name', 'Site Address', 'Project Type', 'Start Date', 'Expected Completion Date', 'Actual Completion Date', 'Project Manager', 'Contract Value', 'Project Status', 'Progress %', 'Total Material Cost', 'Total Labour Cost', 'Other Direct Costs', 'Allocated Overhead', 'Total Project Cost', 'Amount Received', 'Outstanding Due', 'Actual Profit', 'Profit Margin %', 'Remarks']
  ];
  projects.forEach(p => {
    projectRows.push([
      p.id, p.projectName, p.clientId, p.clientName, p.siteAddress, p.projectType, p.startDate,
      p.expectedCompletionDate, p.actualCompletionDate || '', p.projectManager, p.contractValue,
      p.projectStatus, p.progressPercentage, p.actualMaterialCost, p.actualLabourCost,
      p.otherDirectCosts, p.allocatedOverhead, p.totalProjectCost, p.amountReceived,
      p.outstandingDue, p.actualProfit, Number(p.profitMargin.toFixed(1)), p.remarks
    ]);
  });
  const wsProjects = XLSX.utils.aoa_to_sheet(projectRows);
  XLSX.utils.book_append_sheet(wb, wsProjects, '04_Projects');

  // 5. Materials & Inventory Sheet
  const materialRows: (string | number)[][] = [
    ['Material ID', 'Material Name', 'Category', 'Unit', 'Supplier', 'Unit Purchase Price', 'Total Purchased Qty', 'Total Used Qty', 'Total Returned Qty', 'Current Stock', 'Total Stock Value', 'Reorder Level', 'Stock Status', 'Notes']
  ];
  materials.forEach(m => {
    materialRows.push([
      m.id, m.materialName, m.category, m.unit, m.supplier, m.unitPurchasePrice,
      m.totalPurchasedQty, m.totalUsedQty, m.totalReturnedQty, m.currentStock,
      m.totalStockValue, m.reorderLevel, m.stockStatus, m.notes
    ]);
  });
  const wsMaterials = XLSX.utils.aoa_to_sheet(materialRows);
  XLSX.utils.book_append_sheet(wb, wsMaterials, '05_Materials_Inventory');

  // 6. Material Transactions Sheet
  const txRows: (string | number)[][] = [
    ['Txn ID', 'Date', 'Material ID', 'Material Name', 'Type', 'Project ID', 'Project Name', 'Quantity', 'Unit', 'Unit Price', 'Total Cost', 'Reference', 'Notes']
  ];
  transactions.forEach(t => {
    txRows.push([
      t.id, t.date, t.materialId, t.materialName, t.type, t.projectId, t.projectName || '',
      t.quantity, t.unit, t.unitPrice, t.totalCost, t.reference, t.notes
    ]);
  });
  const wsTransactions = XLSX.utils.aoa_to_sheet(txRows);
  XLSX.utils.book_append_sheet(wb, wsTransactions, '06_Material_Transactions');

  // 7. Suppliers & Purchases
  const supRows: (string | number)[][] = [
    ['Supplier ID', 'Supplier Name', 'Phone', 'Address', 'Material Supplied', 'Total Billed', 'Total Paid', 'Outstanding Due', 'Status']
  ];
  suppliers.forEach(s => {
    supRows.push([
      s.id, s.name, s.phone, s.address, s.materialSupplied, s.totalBilled, s.totalPaid, s.outstandingDue, s.status
    ]);
  });
  const wsSuppliers = XLSX.utils.aoa_to_sheet(supRows);
  XLSX.utils.book_append_sheet(wb, wsSuppliers, '07_Suppliers_Purchases');

  // 8. Labour & Attendance
  const labourRows: (string | number)[][] = [
    ['Record ID', 'Attendance Date', 'Worker ID', 'Worker Name', 'Skill/Trade', 'Project ID', 'Project Name', 'Status', 'Overtime Hours', 'Overtime Rate', 'Base Rate', 'Labour Cost', 'Amount Paid', 'Outstanding Salary', 'Notes']
  ];
  attendance.forEach(a => {
    labourRows.push([
      a.id, a.attendanceDate, a.workerId, a.workerName, a.skillTrade, a.projectId, a.projectName,
      a.status, a.overtimeHours, a.overtimeRate, a.baseRate, a.labourCost, a.amountPaid, a.outstandingSalary, a.notes
    ]);
  });
  const wsLabour = XLSX.utils.aoa_to_sheet(labourRows);
  XLSX.utils.book_append_sheet(wb, wsLabour, '08_Labour_Attendance');

  // 9. Payments Received
  const payRows: (string | number)[][] = [
    ['Payment ID', 'Date', 'Client ID', 'Client Name', 'Project ID', 'Project Name', 'Installment Name', 'Payment Method', 'Payment Reference', 'Amount Received', 'Received By', 'Notes']
  ];
  payments.forEach(p => {
    payRows.push([
      p.id, p.date, p.clientId, p.clientName, p.projectId, p.projectName, p.installmentName,
      p.paymentMethod, p.paymentReference, p.amountReceived, p.receivedBy, p.notes
    ]);
  });
  const wsPayments = XLSX.utils.aoa_to_sheet(payRows);
  XLSX.utils.book_append_sheet(wb, wsPayments, '09_Payments_Received');

  // 10. Expenses & Daily Conveyance
  const expRows: (string | number)[][] = [
    [
      'Expense ID',
      'Date',
      'Expense Type',
      'Expense Category',
      'Subcategory',
      'Conveyance Mode',
      'Travel Route',
      'Spent By',
      'Description',
      'Project ID',
      'Project Name',
      'Supplier / Payee',
      'Payment Method',
      'Bill / Invoice No',
      'Amount',
      'Payment Status',
      'Approved By',
      'Notes',
    ]
  ];
  expenses.forEach(e => {
    expRows.push([
      e.id,
      e.date,
      e.expenseType,
      e.expenseCategory,
      e.dailySubcategory || '',
      e.conveyanceMode || '',
      e.travelRoute || '',
      e.spentBy || e.supplierPayee,
      e.description,
      e.projectId,
      e.projectName || '',
      e.supplierPayee,
      e.paymentMethod,
      e.billInvoiceNumber,
      e.amount,
      e.paymentStatus,
      e.approvedBy,
      e.notes,
    ]);
  });
  const wsExpenses = XLSX.utils.aoa_to_sheet(expRows);
  XLSX.utils.book_append_sheet(wb, wsExpenses, '10_Expenses');

  // 11. Project Profit & Loss
  const pnlRows: (string | number)[][] = [
    ['Project ID', 'Project Name', 'Client Name', 'Contract Revenue', 'Direct Material Cost', 'Direct Labour Cost', 'Subcontractor Cost', 'Other Direct Cost', 'Allocated Overhead', 'Total Cost', 'Net Profit', 'Profit Margin %', 'Cash Received', 'Outstanding Cash Due']
  ];
  projects.forEach(p => {
    pnlRows.push([
      p.id, p.projectName, p.clientName, p.contractValue, p.actualMaterialCost, p.actualLabourCost,
      p.subcontractorCost, p.otherDirectCosts, p.allocatedOverhead, p.totalProjectCost,
      p.actualProfit, Number(p.profitMargin.toFixed(1)), p.amountReceived, p.outstandingDue
    ]);
  });
  const wsPnl = XLSX.utils.aoa_to_sheet(pnlRows);
  XLSX.utils.book_append_sheet(wb, wsPnl, '11_Project_Profit_Loss');

  // 12. Office Management
  const officeRows: (string | number)[][] = [
    ['Staff ID', 'Name', 'Role', 'Phone', 'Email', 'Monthly Salary', 'Join Date', 'Status']
  ];
  staff.forEach(s => {
    officeRows.push([s.id, s.name, s.role, s.phone, s.email, s.monthlySalary, s.joinDate, s.status]);
  });
  const wsOffice = XLSX.utils.aoa_to_sheet(officeRows);
  XLSX.utils.book_append_sheet(wb, wsOffice, '12_Office_Staff_Bills');

  // 13. Tasks & Timeline
  const taskRows: (string | number)[][] = [
    ['Task ID', 'Project ID', 'Project Name', 'Task Name', 'Assigned Person', 'Start Date', 'Due Date', 'Priority', 'Status', 'Completion %', 'Notes']
  ];
  tasks.forEach(t => {
    taskRows.push([
      t.id, t.projectId, t.projectName, t.taskName, t.assignedPerson, t.startDate, t.dueDate,
      t.priority, t.status, t.completionPercentage, t.notes
    ]);
  });
  const wsTasks = XLSX.utils.aoa_to_sheet(taskRows);
  XLSX.utils.book_append_sheet(wb, wsTasks, '13_Tasks_Timeline');

  // 14. Audit Log
  const auditRows: (string | number)[][] = [
    ['Log ID', 'Timestamp', 'Action', 'Module', 'Record ID', 'Summary', 'User']
  ];
  auditLogs.forEach(a => {
    auditRows.push([a.id, a.timestamp, a.action, a.module, a.recordId, a.summary, a.user]);
  });
  const wsAudit = XLSX.utils.aoa_to_sheet(auditRows);
  XLSX.utils.book_append_sheet(wb, wsAudit, '14_Audit_Log');

  // Trigger download
  const fileName = `InteriorCraft_ERP_GoogleSheets_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
