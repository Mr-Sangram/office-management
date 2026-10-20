/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

export type ImportCategoryKey =
  | 'clients'
  | 'projects'
  | 'materials'
  | 'suppliers'
  | 'workers'
  | 'payments'
  | 'dailyCosts'
  | 'dailycosts'
  | 'expenses'
  | 'tasks'
  | 'staff'
  | 'assets'
  | 'bills';

interface CategoryImportButtonProps {
  category: ImportCategoryKey;
  language: 'EN' | 'BN';
  onImportRecords: (records: any[]) => void;
  existingCount?: number;
  existingIds?: string[];
}

const todayStr = new Date().toISOString().split('T')[0];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCSVToObjects(csvText: string): Record<string, string>[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (vals[idx] || '').replace(/^"|"$/g, '').trim();
    });
    rows.push(obj);
  }
  return rows;
}

interface CategoryConfig {
  titleEN: string;
  titleBN: string;
  descEN: string;
  descBN: string;
  csvHeaders: string[];
  csvSampleRow: string[];
  getSampleRecord: (seq: number) => any;
  mapCsvRowToRecord: (row: Record<string, string>, seq: number) => any;
}

const CATEGORY_CONFIGS: Record<Exclude<ImportCategoryKey, 'dailycosts'>, CategoryConfig> = {
  clients: {
    titleEN: 'Import Clients (CSV / JSON / Sample)',
    titleBN: 'ক্লায়েন্ট ইমপোর্ট করুন (CSV / JSON / স্যাম্পল)',
    descEN: 'Import client records with Contract Value, Total Paid, and Pending Balance (Due).',
    descBN: 'চুক্তির মূল্য, জমা (Paid) এবং বকেয়া (Due) সহ ক্লায়েন্টের তথ্য ইমপোর্ট করুন।',
    csvHeaders: [
      'name',
      'phone',
      'email',
      'address',
      'projectType',
      'projectLocation',
      'totalBudget',
      'totalPaid',
      'status',
      'notes',
    ],
    csvSampleRow: [
      'Engr. Farhan Ahmed',
      '+880 1715-223344',
      'farhan@example.com',
      'House 14, Road 7, Dhanmondi, Dhaka',
      'Residential',
      'Dhanmondi Duplex Interior',
      '1800000',
      '1000000',
      'Active',
      'Imported Client — 10L Paid, 8L Due',
    ],
    getSampleRecord: (seq) => {
      const budget = 1800000;
      const paid = 1000000;
      return {
        id: `CLI-00${seq}`,
        name: 'Engr. Farhan Ahmed (Imported)',
        phone: '+880 1715-223344',
        email: 'farhan@example.com',
        address: 'House 14, Road 7, Dhanmondi, Dhaka',
        projectType: 'Residential',
        projectLocation: 'Dhanmondi Duplex Interior',
        startDate: todayStr,
        handoverDate: '2026-12-30',
        totalBudget: budget,
        totalPaid: paid,
        outstandingBalance: budget - paid,
        status: 'Active',
        notes: 'Imported sample client with ৳10,00,000 Paid and ৳8,00,000 Due.',
      };
    },
    mapCsvRowToRecord: (r, seq) => {
      const budget = Number(r.totalBudget || r.budget || 1500000);
      const paid = Number(r.totalPaid || r.paid || 800000);
      return {
        id: r.id || `CLI-IMP-${seq}`,
        name: r.name || `Imported Client ${seq}`,
        phone: r.phone || '+880 1700-000000',
        email: r.email || 'client@example.com',
        address: r.address || 'Dhaka, Bangladesh',
        projectType: (r.projectType as any) || 'Residential',
        projectLocation: r.projectLocation || 'Dhaka',
        startDate: r.startDate || todayStr,
        handoverDate: r.handoverDate || '2026-12-31',
        totalBudget: budget,
        totalPaid: paid,
        outstandingBalance: budget - paid,
        status: (r.status as any) || 'Active',
        notes: r.notes || 'Imported via CSV',
      };
    },
  },
  projects: {
    titleEN: 'Import Projects (CSV / JSON / Sample)',
    titleBN: 'প্রজেক্ট ইমপোর্ট করুন (CSV / JSON / স্যাম্পল)',
    descEN: 'Import interior/construction projects with Budget, Received Amount, and Cost breakdown.',
    descBN: 'বাজেট, জমা টাকা (Paid) এবং খরচের হিসাবসহ প্রজেক্ট ইমপোর্ট করুন।',
    csvHeaders: [
      'projectName',
      'clientName',
      'location',
      'projectType',
      'totalBudget',
      'advanceReceived',
      'totalReceived',
      'CompletionPercentage',
      'status',
    ],
    csvSampleRow: [
      'Dhanmondi Duplex Luxury Interior',
      'Engr. Farhan Ahmed',
      'Dhanmondi, Dhaka',
      'Residential',
      '1800000',
      '500000',
      '1000000',
      '55',
      'In Progress',
    ],
    getSampleRecord: (seq) => {
      const budget = 1800000;
      const received = 1000000;
      const matCost = 220000;
      const labCost = 95000;
      const otherCost = 35000;
      const spent = matCost + labCost + otherCost;
      return {
        id: `PRJ-00${seq}`,
        projectName: 'Dhanmondi Duplex Luxury Interior (Imported)',
        clientId: 'CLI-001',
        clientName: 'Alhaj Shafiqul Islam',
        location: 'Road 7, Dhanmondi, Dhaka',
        projectType: 'Residential',
        floorArea: '2,850 sq.ft',
        startDate: todayStr,
        deadlineDate: '2026-12-30',
        totalBudget: budget,
        advanceReceived: 500000,
        totalReceived: received,
        totalMaterialCost: matCost,
        totalLabourCost: labCost,
        totalOtherCost: otherCost,
        totalSpent: spent,
        remainingBudget: budget - spent,
        netProfit: received - spent,
        completionPercentage: 55,
        status: 'In Progress',
        assignedSupervisor: 'Engr. Kamrul Hasan',
        description: 'Imported sample project with ৳10,00,000 Received and ৳8,00,000 Client Due.',
      };
    },
    mapCsvRowToRecord: (r, seq) => {
      const budget = Number(r.totalBudget || 1500000);
      const received = Number(r.totalReceived || 800000);
      const spent = Number(r.totalSpent || 250000);
      return {
        id: r.id || `PRJ-IMP-${seq}`,
        projectName: r.projectName || `Imported Project ${seq}`,
        clientId: r.clientId || 'CLI-001',
        clientName: r.clientName || 'Alhaj Shafiqul Islam',
        location: r.location || 'Dhaka',
        projectType: (r.projectType as any) || 'Residential',
        floorArea: r.floorArea || '2,200 sq.ft',
        startDate: r.startDate || todayStr,
        deadlineDate: r.deadlineDate || '2026-12-31',
        totalBudget: budget,
        advanceReceived: Number(r.advanceReceived || 400000),
        totalReceived: received,
        totalMaterialCost: Number(r.totalMaterialCost || 150000),
        totalLabourCost: Number(r.totalLabourCost || 75000),
        totalOtherCost: Number(r.totalOtherCost || 25000),
        totalSpent: spent,
        remainingBudget: budget - spent,
        netProfit: received - spent,
        completionPercentage: Number(r.CompletionPercentage || r.completionPercentage || 45),
        status: (r.status as any) || 'In Progress',
        assignedSupervisor: r.assignedSupervisor || 'Engr. Kamrul Hasan',
        description: r.description || 'Imported via CSV',
      };
    },
  },
  materials: {
    titleEN: 'Import Inventory Materials (CSV / JSON / Sample)',
    titleBN: 'মালামাল ও স্টক ইমপোর্ট করুন (CSV / JSON / স্যাম্পল)',
    descEN: 'Import construction/interior materials with Opening Stock, Unit Price, and Supplier info.',
    descBN: 'ওপেনিং স্টক, ইউনিট দর এবং সাপ্লায়ারের তথ্যসহ মালামাল ইমপোর্ট করুন।',
    csvHeaders: [
      'name',
      'category',
      'unit',
      'unitPrice',
      'openingStock',
      'totalPurchased',
      'totalUsed',
      'minStockLevel',
      'preferredSupplier',
      'storageLocation',
    ],
    csvSampleRow: [
      'Crown Cement (PCC 50kg)',
      'Civil & Wood',
      'Bag',
      '560',
      '100',
      '150',
      '80',
      '30',
      'Bengal Timber & Hardware Syndicate',
      'Site Godown A',
    ],
    getSampleRecord: (seq) => {
      const opening = 100;
      const purchased = 150;
      const used = 80;
      const current = opening + purchased - used;
      const price = 560;
      return {
        id: `MAT-00${seq}`,
        name: 'Crown Cement PCC 50kg (Imported)',
        category: 'Wood & Plywood',
        unit: 'Bag',
        unitPrice: price,
        openingStock: opening,
        totalPurchased: purchased,
        totalUsed: used,
        currentStock: current,
        minStockLevel: 30,
        preferredSupplier: 'Bengal Timber & Hardware Syndicate',
        storageLocation: 'Site Godown A',
        stockValue: current * price,
        status: 'In Stock',
      };
    },
    mapCsvRowToRecord: (r, seq) => {
      const opening = Number(r.openingStock || 50);
      const purchased = Number(r.totalPurchased || 100);
      const used = Number(r.totalUsed || 40);
      const current = opening + purchased - used;
      const price = Number(r.unitPrice || 500);
      const min = Number(r.minStockLevel || 20);
      return {
        id: r.id || `MAT-IMP-${seq}`,
        name: r.name || `Imported Material ${seq}`,
        category: (r.category as any) || 'Wood & Plywood',
        unit: (r.unit as any) || 'Pcs',
        unitPrice: price,
        openingStock: opening,
        totalPurchased: purchased,
        totalUsed: used,
        currentStock: current,
        minStockLevel: min,
        preferredSupplier: r.preferredSupplier || 'Bengal Timber & Hardware Syndicate',
        storageLocation: r.storageLocation || 'Main Warehouse',
        stockValue: current * price,
        status: current <= 0 ? 'Out of Stock' : current <= min ? 'Low Stock' : 'In Stock',
      };
    },
  },
  suppliers: {
    titleEN: 'Import Suppliers (CSV / JSON / Sample)',
    titleBN: 'সাপ্লায়ার ইমপোর্ট করুন (CSV / JSON / স্যাম্পল)',
    descEN: 'Import suppliers with Total Purchase Amount, Total Paid, and Payable Due balance.',
    descBN: 'মোট ক্রয়, পরিশোধ (Paid) এবং বকেয়া (Due) সহ সাপ্লায়ার ইমপোর্ট করুন।',
    csvHeaders: [
      'name',
      'contactPerson',
      'phone',
      'email',
      'address',
      'suppliedCategories',
      'totalPurchaseAmount',
      'totalPaid',
      'status',
    ],
    csvSampleRow: [
      'Dhaka Sanitary & Tiles Emporium',
      'Haji Abdul Karim',
      '+880 1819-556677',
      'sales@dhakasanitary.com',
      'Hatirpool, Dhaka-1205',
      'Tiles, Sanitary, Fittings',
      '450000',
      '275000',
      'Active',
    ],
    getSampleRecord: (seq) => {
      const billed = 450000;
      const paid = 275000;
      return {
        id: `SUP-00${seq}`,
        name: 'Dhaka Sanitary & Tiles Emporium (Imported)',
        contactPerson: 'Haji Abdul Karim',
        phone: '+880 1819-556677',
        email: 'sales@dhakasanitary.com',
        address: 'Hatirpool, Dhaka-1205',
        suppliedCategories: 'Tiles, Sanitary, Fittings',
        totalPurchaseAmount: billed,
        totalPaid: paid,
        outstandingPayable: billed - paid,
        paymentTerms: '50% Advance, Balance in 15 Days',
        rating: 5,
        status: 'Active',
        notes: 'Imported supplier with ৳2,75,000 Paid and ৳1,75,000 Due.',
      };
    },
    mapCsvRowToRecord: (r, seq) => {
      const billed = Number(r.totalPurchaseAmount || 200000);
      const paid = Number(r.totalPaid || 120000);
      return {
        id: r.id || `SUP-IMP-${seq}`,
        name: r.name || `Imported Supplier ${seq}`,
        contactPerson: r.contactPerson || 'Manager',
        phone: r.phone || '+880 1800-000000',
        email: r.email || 'supplier@example.com',
        address: r.address || 'Dhaka',
        suppliedCategories: r.suppliedCategories || 'Hardware & Materials',
        totalPurchaseAmount: billed,
        totalPaid: paid,
        outstandingPayable: billed - paid,
        paymentTerms: r.paymentTerms || 'Credit 15 Days',
        rating: 5,
        status: (r.status as any) || 'Active',
        notes: r.notes || 'Imported via CSV',
      };
    },
  },
  workers: {
    titleEN: 'Import Workers / Labour (CSV / JSON / Sample)',
    titleBN: 'শ্রমিক/মিস্ত্রি ইমপোর্ট করুন (CSV / JSON / স্যাম্পল)',
    descEN: 'Import skilled workers with Daily/Contract Rate, Total Earned, Paid, and Pending Due.',
    descBN: 'দৈনিক/চুক্তিভিত্তিক মজুরি, মোট আয়, পরিশোধ (Paid) এবং বকেয়া (Due) সহ শ্রমিক ইমপোর্ট করুন।',
    csvHeaders: [
      'name',
      'skillCategory',
      'phone',
      'nidNumber',
      'paymentType',
      'dailyWageRate',
      'totalDaysWorked',
      'totalEarned',
      'totalPaid',
      'assignedProjectId',
    ],
    csvSampleRow: [
      'Md. Babul Mia (Head Painter)',
      'Painter',
      '+880 1912-334455',
      '1988269000112',
      'Daily Wage',
      '1100',
      '18',
      '19800',
      '14000',
      'PRJ-001',
    ],
    getSampleRecord: (seq) => {
      const earned = 19800;
      const paid = 14000;
      return {
        id: `WRK-00${seq}`,
        name: 'Md. Babul Mia — Head Painter (Imported)',
        skillCategory: 'Painter',
        phone: '+880 1912-334455',
        nidNumber: '1988269000112',
        paymentType: 'Daily Wage',
        dailyWageRate: 1100,
        monthlySalaryRate: 0,
        contractAmount: 0,
        overtimeHourlyRate: 150,
        assignedProjectId: 'PRJ-001',
        totalDaysWorked: 18,
        totalEarned: earned,
        totalPaid: paid,
        pendingWages: earned - paid,
        status: 'Active',
      };
    },
    mapCsvRowToRecord: (r, seq) => {
      const earned = Number(r.totalEarned || 15000);
      const paid = Number(r.totalPaid || 10000);
      return {
        id: r.id || `WRK-IMP-${seq}`,
        name: r.name || `Imported Worker ${seq}`,
        skillCategory: (r.skillCategory as any) || 'Carpenter',
        phone: r.phone || '+880 1900-000000',
        nidNumber: r.nidNumber || '1990000000',
        paymentType: (r.paymentType as any) || 'Daily Wage',
        dailyWageRate: Number(r.dailyWageRate || 1000),
        monthlySalaryRate: Number(r.monthlySalaryRate || 0),
        contractAmount: Number(r.contractAmount || 0),
        overtimeHourlyRate: Number(r.overtimeHourlyRate || 120),
        assignedProjectId: r.assignedProjectId || 'PRJ-001',
        totalDaysWorked: Number(r.totalDaysWorked || 15),
        totalEarned: earned,
        totalPaid: paid,
        pendingWages: earned - paid,
        status: 'Active',
      };
    },
  },
  payments: {
    titleEN: 'Import Client Collections / Payments (CSV / JSON / Sample)',
    titleBN: 'ক্লায়েন্ট পেমেন্ট/জমা ইমপোর্ট করুন (CSV / JSON / স্যাম্পল)',
    descEN: 'Import client payment installments (Advance / Running Bill / Final Settlement).',
    descBN: 'ক্লায়েন্টের কাছ থেকে প্রাপ্ত অগ্রিম বা রানিং বিলের পেমেন্ট ইমপোর্ট করুন।',
    csvHeaders: [
      'date',
      'clientId',
      'clientName',
      'projectId',
      'projectName',
      'paymentStage',
      'amountReceived',
      'paymentMethod',
      'referenceNumber',
      'notes',
    ],
    csvSampleRow: [
      todayStr,
      'CLI-001',
      'Alhaj Shafiqul Islam',
      'PRJ-001',
      'Gulshan North Avenue Penthouse Interior',
      '2nd Installment',
      '450000',
      'Bank Transfer',
      'CITY-CHQ-99201',
      'Imported 2nd Running Bill Collection',
    ],
    getSampleRecord: (seq) => ({
      id: `PAY-00${seq}`,
      date: todayStr,
      clientId: 'CLI-001',
      clientName: 'Alhaj Shafiqul Islam',
      projectId: 'PRJ-001',
      projectName: 'Gulshan North Avenue Penthouse Interior',
      paymentStage: '2nd Installment',
      amountReceived: 450000,
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'CITY-CHQ-99201',
      receivedBy: 'Architect Mahmudul Hasan',
      notes: 'Imported sample payment collection (৳4,50,000)',
    }),
    mapCsvRowToRecord: (r, seq) => ({
      id: r.id || `PAY-IMP-${seq}`,
      date: r.date || todayStr,
      clientId: r.clientId || 'CLI-001',
      clientName: r.clientName || 'Alhaj Shafiqul Islam',
      projectId: r.projectId || 'PRJ-001',
      projectName: r.projectName || 'Gulshan North Avenue Penthouse Interior',
      paymentStage: (r.paymentStage as any) || '1st Installment',
      amountReceived: Number(r.amountReceived || 250000),
      paymentMethod: (r.paymentMethod as any) || 'Bank Transfer',
      referenceNumber: r.referenceNumber || `REF-${seq}`,
      receivedBy: r.receivedBy || 'Architect Mahmudul Hasan',
      notes: r.notes || 'Imported via CSV',
    }),
  },
  dailyCosts: {
    titleEN: 'Import Daily Site Costs (CSV / JSON / Sample)',
    titleBN: 'দৈনিক সাইট খরচ ইমপোর্ট করুন (CSV / JSON / স্যাম্পল)',
    descEN: 'Import daily site expenses (Transport, Refreshment, Hardware, Petty Cash).',
    descBN: 'দৈনিক সাইটের যাতায়াত, নাস্তা, হার্ডওয়্যার ও খুচরা খরচ ইমপোর্ট করুন।',
    csvHeaders: [
      'date',
      'projectId',
      'projectName',
      'category',
      'description',
      'amount',
      'paidTo',
      'paymentMethod',
      'approvedBy',
    ],
    csvSampleRow: [
      todayStr,
      'PRJ-001',
      'Gulshan North Avenue Penthouse Interior',
      'Transportation & Delivery',
      'Pickup van fare for plywood & glass delivery to Gulshan site',
      '2200',
      'Rana Transport Agency',
      'Petty Cash',
      'Architect Mahmudul Hasan',
    ],
    getSampleRecord: (seq) => ({
      id: `EXP-DC-00${seq}`,
      date: todayStr,
      projectId: 'PRJ-001',
      projectName: 'Gulshan North Avenue Penthouse Interior',
      category: 'Transportation & Delivery',
      description: 'Pickup van fare for plywood & glass delivery to site (Imported)',
      amount: 2200,
      paidTo: 'Rana Transport Agency',
      paymentMethod: 'Petty Cash',
      approvedBy: 'Architect Mahmudul Hasan',
      receiptReference: `VCH-DC-0${seq}`,
      notes: 'Imported sample daily site cost',
    }),
    mapCsvRowToRecord: (r, seq) => ({
      id: r.id || `EXP-DC-IMP-${seq}`,
      date: r.date || todayStr,
      projectId: r.projectId || 'PRJ-001',
      projectName: r.projectName || 'Gulshan North Avenue Penthouse Interior',
      category: (r.category as any) || 'Transportation & Delivery',
      description: r.description || 'Imported Daily Site Cost',
      amount: Number(r.amount || 1000),
      paidTo: r.paidTo || 'Site Vendor',
      paymentMethod: (r.paymentMethod as any) || 'Petty Cash',
      approvedBy: r.approvedBy || 'Architect Mahmudul Hasan',
      receiptReference: r.receiptReference || `VCH-${seq}`,
      notes: r.notes || 'Imported via CSV',
    }),
  },
  expenses: {
    titleEN: 'Import General & Subcontractor Expenses (CSV / JSON / Sample)',
    titleBN: 'সাধারণ ও সাব-কন্ট্রাক্টর খরচ ইমপোর্ট করুন',
    descEN: 'Import project overheads, subcontractor bills, and general expenses.',
    descBN: 'প্রজেক্ট ওভারহেড, সাব-কন্ট্রাক্টর বিল ও অন্যান্য খরচ ইমপোর্ট করুন।',
    csvHeaders: [
      'date',
      'projectId',
      'projectName',
      'category',
      'description',
      'amount',
      'paidTo',
      'paymentMethod',
      'approvedBy',
    ],
    csvSampleRow: [
      todayStr,
      'PRJ-001',
      'Gulshan North Avenue Penthouse Interior',
      'Subcontractor Payment',
      '12mm Tempered Glass Partition installation partial bill',
      '45000',
      'Crystal Glass & Thai Aluminum Works',
      'Bank Transfer',
      'Architect Mahmudul Hasan',
    ],
    getSampleRecord: (seq) => ({
      id: `EXP-GEN-00${seq}`,
      date: todayStr,
      projectId: 'PRJ-001',
      projectName: 'Gulshan North Avenue Penthouse Interior',
      category: 'Subcontractor Payment',
      description: '12mm Tempered Glass Partition installation partial bill (Imported)',
      amount: 45000,
      paidTo: 'Crystal Glass & Thai Aluminum Works',
      paymentMethod: 'Bank Transfer',
      approvedBy: 'Architect Mahmudul Hasan',
      receiptReference: `SUB-BILL-0${seq}`,
      notes: 'Imported sample subcontractor expense (৳45,000 Paid, ৳25,000 Due in work order)',
    }),
    mapCsvRowToRecord: (r, seq) => ({
      id: r.id || `EXP-IMP-${seq}`,
      date: r.date || todayStr,
      projectId: r.projectId || 'PRJ-001',
      projectName: r.projectName || 'Gulshan North Avenue Penthouse Interior',
      category: (r.category as any) || 'Subcontractor Payment',
      description: r.description || 'Imported General Expense',
      amount: Number(r.amount || 15000),
      paidTo: r.paidTo || 'Vendor',
      paymentMethod: (r.paymentMethod as any) || 'Cash',
      approvedBy: r.approvedBy || 'Architect Mahmudul Hasan',
      receiptReference: r.receiptReference || `EXP-REF-${seq}`,
      notes: r.notes || 'Imported via CSV',
    }),
  },
  tasks: {
    titleEN: 'Import Project Tasks & Timeline (CSV / JSON / Sample)',
    titleBN: 'প্রজেক্ট টাস্ক ও টাইমলাইন ইমপোর্ট করুন',
    descEN: 'Import work schedule milestones, assigned engineers, and progress percentages.',
    descBN: 'প্রজেক্টের কাজের সময়সূচী, দায়িত্বপ্রাপ্ত ইঞ্জিনিয়ার ও অগ্রগতির হার ইমপোর্ট করুন।',
    csvHeaders: [
      'projectId',
      'projectName',
      'taskName',
      'assignedPerson',
      'startDate',
      'dueDate',
      'priority',
      'status',
      'completionPercentage',
    ],
    csvSampleRow: [
      'PRJ-001',
      'Gulshan North Avenue Penthouse Interior',
      'Master Bedroom Walk-in Closet & Veneer Panelling',
      'Md. Rafiqul Islam (Head Carpenter)',
      todayStr,
      '2026-11-25',
      'High',
      'In Progress',
      '65',
    ],
    getSampleRecord: (seq) => ({
      id: `TSK-00${seq}`,
      projectId: 'PRJ-001',
      projectName: 'Gulshan North Avenue Penthouse Interior',
      taskName: 'Master Bedroom Walk-in Closet & Veneer Panelling (Imported)',
      assignedPerson: 'Md. Rafiqul Islam (Head Carpenter)',
      startDate: todayStr,
      dueDate: '2026-11-25',
      priority: 'High',
      status: 'In Progress',
      completionPercentage: 65,
      notes: 'Imported sample timeline task — carcass complete, veneer pressing ongoing.',
    }),
    mapCsvRowToRecord: (r, seq) => ({
      id: r.id || `TSK-IMP-${seq}`,
      projectId: r.projectId || 'PRJ-001',
      projectName: r.projectName || 'Gulshan North Avenue Penthouse Interior',
      taskName: r.taskName || `Imported Task ${seq}`,
      assignedPerson: r.assignedPerson || 'Engr. Kamrul Hasan',
      startDate: r.startDate || todayStr,
      dueDate: r.dueDate || '2026-12-15',
      priority: (r.priority as any) || 'High',
      status: (r.status as any) || 'In Progress',
      completionPercentage: Number(r.completionPercentage || 50),
      notes: r.notes || 'Imported via CSV',
    }),
  },
  staff: {
    titleEN: 'Import Office Staff & Payroll (CSV / JSON / Sample)',
    titleBN: 'অফিস স্টাফ ইমপোর্ট করুন (CSV / JSON / স্যাম্পল)',
    descEN: 'Import staff members with Monthly Salary / Contract structure, Paid amount, and Due balance.',
    descBN: 'মাসিক বেতন/চুক্তি, পরিশোধিত টাকা (Paid) এবং বকেয়া (Due) সহ অফিস স্টাফ ইমপোর্ট করুন।',
    csvHeaders: [
      'name',
      'role',
      'department',
      'phone',
      'email',
      'paymentType',
      'monthlySalary',
      'totalSalaryPaid',
      'totalAdvancePaid',
      'status',
    ],
    csvSampleRow: [
      'Ar. Nusrat Jahan',
      'Senior 3D Visualizer',
      'Design Studio',
      '+880 1716-998877',
      'nusrat@advancesystem.com.bd',
      'Monthly Salary',
      '45000',
      '30000',
      '5000',
      'Active',
    ],
    getSampleRecord: (seq) => ({
      id: `STF-00${seq}`,
      name: 'Ar. Nusrat Jahan (Imported)',
      role: 'Senior 3D Visualizer',
      department: 'Design Studio',
      phone: '+880 1716-998877',
      email: 'nusrat@advancesystem.com.bd',
      paymentType: 'Monthly Salary',
      dailyRate: 1500,
      monthlySalary: 45000,
      joinDate: '2025-06-01',
      status: 'Active',
      paymentMethod: 'Bank Transfer',
      bankOrBkashDetails: 'Brac Bank A/C 1501204455',
      totalSalaryPaid: 30000,
      totalAdvancePaid: 5000,
      notes: 'Imported sample staff — Salary ৳45,000, Paid ৳35,000, Remaining Due ৳10,000.',
    }),
    mapCsvRowToRecord: (r, seq) => ({
      id: r.id || `STF-IMP-${seq}`,
      name: r.name || `Imported Staff ${seq}`,
      role: r.role || 'Project Engineer',
      department: r.department || 'Engineering',
      phone: r.phone || '+880 1700-000000',
      email: r.email || 'staff@advancesystem.com.bd',
      paymentType: (r.paymentType as any) || 'Monthly Salary',
      dailyRate: Number(r.dailyRate || 1200),
      monthlySalary: Number(r.monthlySalary || 40000),
      joinDate: r.joinDate || todayStr,
      status: (r.status as any) || 'Active',
      paymentMethod: r.paymentMethod || 'Bank Transfer',
      bankOrBkashDetails: r.bankOrBkashDetails || '',
      totalSalaryPaid: Number(r.totalSalaryPaid || 25000),
      totalAdvancePaid: Number(r.totalAdvancePaid || 0),
      notes: r.notes || 'Imported via CSV',
    }),
  },
  assets: {
    titleEN: 'Import Office & Site Assets (CSV / JSON / Sample)',
    titleBN: 'অফিস ও সাইট অ্যাসেট ইমপোর্ট করুন',
    descEN: 'Import laptops, laser meters, power tools, and office equipment.',
    descBN: 'ল্যাপটপ, লেজার মিটার, পাওয়ার টুলস এবং অফিসের সরঞ্জাম ইমপোর্ট করুন।',
    csvHeaders: [
      'assetName',
      'category',
      'purchaseDate',
      'purchaseCost',
      'condition',
      'assignedTo',
      'serialNumber',
      'notes',
    ],
    csvSampleRow: [
      'Bosch Professional Laser Distance Meter GLM 50-27 CG',
      'Site Equipment',
      todayStr,
      '18500',
      'Brand New',
      'Engr. Kamrul Hasan',
      'BOSCH-GLM-8821',
      'Used for site measurement',
    ],
    getSampleRecord: (seq) => ({
      id: `AST-00${seq}`,
      assetName: 'Bosch Laser Distance Meter GLM 50-27 (Imported)',
      category: 'Site Equipment',
      purchaseDate: todayStr,
      purchaseCost: 18500,
      condition: 'Brand New',
      assignedTo: 'Engr. Kamrul Hasan',
      serialNumber: `BOSCH-GLM-882${seq}`,
      notes: 'Imported sample site measurement asset',
    }),
    mapCsvRowToRecord: (r, seq) => ({
      id: r.id || `AST-IMP-${seq}`,
      assetName: r.assetName || `Imported Asset ${seq}`,
      category: r.category || 'Equipment',
      purchaseDate: r.purchaseDate || todayStr,
      purchaseCost: Number(r.purchaseCost || 20000),
      condition: (r.condition as any) || 'Good',
      assignedTo: r.assignedTo || 'Office',
      serialNumber: r.serialNumber || `SN-${seq}`,
      notes: r.notes || 'Imported via CSV',
    }),
  },
  bills: {
    titleEN: 'Import Office Utility Bills & Rent (CSV / JSON / Sample)',
    titleBN: 'অফিস ভাড়া ও ইউটিলিটি বিল ইমপোর্ট করুন',
    descEN: 'Import monthly office rent, electricity, internet, and maintenance bills.',
    descBN: 'মাসিক অফিস ভাড়া, বিদ্যুৎ বিল, ইন্টারনেট ও মেইনটেন্যান্স বিল ইমপোর্ট করুন।',
    csvHeaders: ['billType', 'billingMonth', 'amount', 'dueDate', 'status', 'paymentMethod', 'notes'],
    csvSampleRow: [
      'DESCO Commercial Electricity Bill',
      'October 2026',
      '14800',
      '2026-10-30',
      'Unpaid',
      'bKash / Nagad',
      'Due utility bill for Banani head office',
    ],
    getSampleRecord: (seq) => ({
      id: `BIL-00${seq}`,
      billType: 'DESCO Commercial Electricity Bill (Imported)',
      billingMonth: 'October 2026',
      amount: 14800,
      dueDate: '2026-10-30',
      status: 'Unpaid',
      paymentMethod: 'bKash / Nagad',
      notes: 'Imported sample unpaid utility bill (৳14,800 Due)',
    }),
    mapCsvRowToRecord: (r, seq) => ({
      id: r.id || `BIL-IMP-${seq}`,
      billType: r.billType || 'Utility Bill',
      billingMonth: r.billingMonth || 'October 2026',
      amount: Number(r.amount || 5000),
      dueDate: r.dueDate || todayStr,
      status: (r.status as any) || 'Unpaid',
      paymentMethod: r.paymentMethod || 'Cash',
      notes: r.notes || 'Imported via CSV',
    }),
  },
};

export const CategoryImportButton: React.FC<CategoryImportButtonProps> = ({
  category,
  language,
  onImportRecords,
  existingCount,
  existingIds,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizedCategory = category === 'dailycosts' ? 'dailyCosts' : category;
  const config = CATEGORY_CONFIGS[normalizedCategory];
  const baseCount = existingIds ? existingIds.length : existingCount ?? 1;

  const handleImportSample = () => {
    const seq = baseCount + 1;
    const sample = config.getSampleRecord(seq);
    onImportRecords([sample]);
    setFeedback({
      type: 'success',
      message:
        language === 'EN'
          ? '1 sample record imported and synced with all calculations!'
          : '১টি স্যাম্পল এন্ট্রি সফলভাবে ইমপোর্ট এবং সব হিসাবের সাথে সিঙ্ক হয়েছে!',
    });
    setTimeout(() => {
      setFeedback(null);
      setIsOpen(false);
    }, 1400);
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent =
      config.csvHeaders.join(',') +
      '\n' +
      config.csvSampleRow.map((cell) => `"${cell}"`).join(',') +
      '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${category}_import_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || '').trim();
        let importedRecords: any[] = [];

        if (file.name.endsWith('.json') || text.startsWith('[') || text.startsWith('{')) {
          const parsed = JSON.parse(text);
          const arr = Array.isArray(parsed) ? parsed : [parsed];
          importedRecords = arr.map((item, idx) =>
            config.mapCsvRowToRecord(item, baseCount + idx + 1)
          );
        } else {
          const rows = parseCSVToObjects(text);
          importedRecords = rows.map((row, idx) =>
            config.mapCsvRowToRecord(row, baseCount + idx + 1)
          );
        }

        if (importedRecords.length === 0) {
          setFeedback({
            type: 'error',
            message:
              language === 'EN'
                ? 'No valid rows found in file. Download the template first.'
                : 'ফাইলে কোনো সঠিক ডাটা পাওয়া যায়নি। প্রথমে টেমপ্লেট ডাউনলোড করুন।',
          });
          return;
        }

        onImportRecords(importedRecords);
        setFeedback({
          type: 'success',
          message:
            language === 'EN'
              ? `Successfully imported ${importedRecords.length} record(s)!`
              : `${importedRecords.length}টি রেকর্ড সফলভাবে ইমপোর্ট হয়েছে!`,
        });
        setTimeout(() => {
          setFeedback(null);
          setIsOpen(false);
        }, 1500);
      } catch {
        setFeedback({
          type: 'error',
          message:
            language === 'EN'
              ? 'Failed to parse file. Please upload a valid CSV or JSON file.'
              : 'ফাইলটি পড়া যায়নি। অনুগ্রহ করে সঠিক CSV বা JSON ফাইল আপলোড করুন।',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFeedback(null);
          setIsOpen(true);
        }}
        className="flex items-center gap-2 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
        title={
          language === 'EN'
            ? 'Import Sample / CSV / Excel Data into this category'
            : 'এই ক্যাটাগরিতে ১ ক্লিকে ডেমো ইমপোর্ট অথবা CSV/Excel ফাইল ইমপোর্ট করুন'
        }
      >
        <Upload className="w-4 h-4 text-indigo-400" />
        <span>{language === 'EN' ? 'Import Data' : 'ইমপোর্ট (Import)'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'EN' ? config.titleEN : config.titleBN}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'EN' ? config.descEN : config.descBN}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Option 1: 1-Click Sample Record Import */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-indigo-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'EN'
                      ? 'Quick Test Import (Recommended)'
                      : '১-ক্লিকে টেস্ট ইমপোর্ট (সবচেয়ে সহজ)'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    Paid + Due Synced
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'EN'
                    ? 'Instantly import 1 complete, realistic entry with Paid and Due balances to see how this module works and syncs.'
                    : 'এই ক্যাটাগরিতে কীভাবে এন্ট্রি, জমা (Paid) এবং বকেয়া (Due) কাজ করে তা সহজে বোঝার জন্য ১ ক্লিকে একটি রেডিমেড এন্ট্রি ইমপোর্ট করুন।'}
                </p>
                <button
                  type="button"
                  onClick={handleImportSample}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {language === 'EN'
                    ? 'Import 1 Ready Sample Entry Now'
                    : '১টি রেডি স্যাম্পল এন্ট্রি ইমপোর্ট করুন'}
                </button>
              </div>

              {/* Option 2: Upload CSV or JSON File */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    {language === 'EN'
                      ? 'Upload Excel CSV or JSON File'
                      : 'আপনার CSV অথবা JSON ফাইল আপলোড করুন'}
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {language === 'EN' ? 'Download CSV Template' : 'CSV টেমপ্লেট ডাউনলোড'}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-900 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  {language === 'EN'
                    ? 'Click to select .CSV or .JSON file from computer'
                    : 'কম্পিউটার বা মোবাইল থেকে .CSV বা .JSON ফাইল সিলেক্ট করুন'}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {language === 'EN' ? 'Close' : 'বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default CategoryImportButton;
