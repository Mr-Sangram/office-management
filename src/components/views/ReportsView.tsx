/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Download,
  DollarSign,
  PieChart,
  Calendar,
  Layers,
  Printer
} from 'lucide-react';
import {
  Project,
  Client,
  Supplier,
  MaterialItem,
  MaterialTransaction,
  LabourAttendance,
  PaymentReceived,
  ExpenseItem,
  CompanySettings
} from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ReportsViewProps {
  projects: Project[];
  clients: Client[];
  suppliers: Supplier[];
  materials: MaterialItem[];
  transactions: MaterialTransaction[];
  attendance: LabourAttendance[];
  payments: PaymentReceived[];
  expenses: ExpenseItem[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onExportExcel: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  clients,
  suppliers,
  materials,
  transactions,
  attendance,
  payments,
  expenses,
  settings,
  language,
  onExportExcel,
}) => {
  const [reportType, setReportType] = useState<
    | 'income_statement'
    | 'cash_flow'
    | 'project_profit'
    | 'client_dues'
    | 'supplier_dues'
    | 'material_valuation'
    | 'labour_summary'
  >('income_statement');

  // Aggregates
  const totalContractRevenue = projects.reduce((s, p) => s + p.contractValue, 0);
  const totalCashReceived = payments.reduce((s, p) => s + p.amountReceived, 0);

  const directMaterialCost = transactions
    .filter((t) => t.type === 'SITE_ISSUE')
    .reduce((s, t) => s + t.totalCost, 0);

  const directLabourCost = attendance.reduce((s, a) => s + a.labourCost, 0);
  const directSubcontractorCost = expenses
    .filter((e) => e.expenseType === 'PROJECT_DIRECT')
    .reduce((s, e) => s + e.amount, 0);

  const totalCostOfGoodsSold = directMaterialCost + directLabourCost + directSubcontractorCost;
  const grossProfit = totalContractRevenue - totalCostOfGoodsSold;

  const officeOverhead = expenses
    .filter((e) => e.expenseType === 'OFFICE_OVERHEAD')
    .reduce((s, e) => s + e.amount, 0);

  const netOperatingProfit = grossProfit - officeOverhead;
  const netMargin = totalContractRevenue > 0 ? (netOperatingProfit / totalContractRevenue) * 100 : 0;

  const totalClientDues = clients.reduce((s, c) => s + c.totalDue, 0);
  const totalSupplierDues = suppliers.reduce((s, sup) => s + sup.outstandingDue, 0);
  const totalInventoryValue = materials.reduce((s, m) => s + m.totalStockValue, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN' ? 'Executive Financial & Cost Audit Reports' : 'আর্থিক বিবরণী ও অডিট রিপোর্ট'}
            </h2>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
              Executive Reports
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Monthly income statement, cash flow statement, client receivables, vendor payables, and inventory valuation'
              : 'মাসিক আয় বিবরণী, ক্যাশ ফ্লো, ক্লায়েন্ট বকেয়া, ভেন্ডর দেনা ও ইনভেন্টরি স্টক মূল্যায়ন'}
          </p>
        </div>

        <button
          onClick={onExportExcel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{language === 'EN' ? 'Export All Reports to Excel' : 'সকল রিপোর্ট এক্সেলে ডাউনলোড'}</span>
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setReportType('income_statement')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            reportType === 'income_statement'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          📊 {language === 'EN' ? 'Income Statement (P&L)' : 'আয় বিবরণী (লাভ-ক্ষতি)'}
        </button>
        <button
          onClick={() => setReportType('cash_flow')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            reportType === 'cash_flow'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          💵 {language === 'EN' ? 'Cash Flow Statement' : 'ক্যাশ ফ্লো স্টেটমেন্ট'}
        </button>
        <button
          onClick={() => setReportType('project_profit')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            reportType === 'project_profit'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          📐 {language === 'EN' ? 'Project Profitability' : 'প্রজেক্ট প্রফিট সামারি'}
        </button>
        <button
          onClick={() => setReportType('client_dues')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            reportType === 'client_dues'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          👥 {language === 'EN' ? 'Client Receivables (Dues)' : 'ক্লায়েন্ট বকেয়া তালিকা'}
        </button>
        <button
          onClick={() => setReportType('supplier_dues')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            reportType === 'supplier_dues'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          🚚 {language === 'EN' ? 'Supplier Payables' : 'সাপ্লায়ার বাকি হিসাব'}
        </button>
        <button
          onClick={() => setReportType('material_valuation')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            reportType === 'material_valuation'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          🪵 {language === 'EN' ? 'Material Stock Valuation' : 'স্টক ও মালামাল মূল্যায়ন'}
        </button>
      </div>

      {/* Report 1: Income Statement */}
      {reportType === 'income_statement' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="text-center border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              {settings.companyName}
            </h3>
            <h4 className="text-sm font-semibold text-amber-400 mt-0.5">
              Comprehensive Income Statement ( লাভ ও ক্ষতি বিবরণী )
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Accounting Period: Fiscal Year 2026-2027 (Cumulative)
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Revenue */}
            <div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800 font-bold text-slate-200">
                <span className="text-sm">I. CONTRACT REVENUE (মোট চুক্তি রাজস্ব)</span>
                <span className="text-sm text-emerald-400">{formatCurrency(totalContractRevenue, settings.currencySymbol)}</span>
              </div>
            </div>

            {/* Direct Costs / COGS */}
            <div>
              <div className="py-1 font-bold text-rose-300">II. DIRECT PROJECT COSTS (কাজের প্রত্যক্ষ খরচ / COGS)</div>
              <div className="pl-4 space-y-1 text-slate-300">
                <div className="flex justify-between py-1">
                  <span>• Direct Materials Consumed on Sites</span>
                  <span>{formatCurrency(directMaterialCost, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>• Direct Site Labour & Craftsmen Wages</span>
                  <span>{formatCurrency(directLabourCost, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>• Specialist Subcontractor & Freight Costs</span>
                  <span>{formatCurrency(directSubcontractorCost, settings.currencySymbol)}</span>
                </div>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-800 font-bold text-rose-400">
                <span>Total Direct Project Costs</span>
                <span>({formatCurrency(totalCostOfGoodsSold, settings.currencySymbol)})</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between py-2.5 px-3 bg-slate-850 rounded-xl font-bold text-white text-sm">
              <span>GROSS PROFIT (মোট লাভ)</span>
              <span className="text-emerald-400">{formatCurrency(grossProfit, settings.currencySymbol)}</span>
            </div>

            {/* Operating Overheads */}
            <div>
              <div className="py-1 font-bold text-indigo-300">III. HEAD OFFICE OPERATING OVERHEAD (অফিস পরিচালন ব্যয়)</div>
              <div className="pl-4 space-y-1 text-slate-300">
                <div className="flex justify-between py-1">
                  <span>• Studio Rent, Electricity, Internet & Tech Tools</span>
                  <span>{formatCurrency(officeOverhead, settings.currencySymbol)}</span>
                </div>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-800 font-bold text-indigo-400">
                <span>Total Operating Overhead</span>
                <span>({formatCurrency(officeOverhead, settings.currencySymbol)})</span>
              </div>
            </div>

            {/* Net Operating Profit */}
            <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 rounded-xl font-extrabold text-white text-base">
              <span>NET OPERATING PROFIT (নিট অর্জিত লাভ)</span>
              <div className="text-right">
                <span className="text-amber-300 block">{formatCurrency(netOperatingProfit, settings.currencySymbol)}</span>
                <span className="text-xs text-amber-400 font-normal">Margin: {netMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report 2: Cash Flow */}
      {reportType === 'cash_flow' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="text-center border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              {settings.companyName}
            </h3>
            <h4 className="text-sm font-semibold text-emerald-400 mt-0.5">
              Cash Flow Statement ( নগদ প্রবাহ বিবরণী )
            </h4>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-750">
              <div className="text-slate-400 block mb-1">CASH INFLOWS (নগদ আগমন)</div>
              <div className="flex justify-between font-bold text-emerald-400 text-sm">
                <span>Total Client Installments & Advances Received</span>
                <span>{formatCurrency(totalCashReceived, settings.currencySymbol)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-850 rounded-xl border border-slate-750">
              <div className="text-slate-400 block mb-1">CASH OUTFLOWS (নগদ নির্গমন)</div>
              <div className="space-y-1 text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span>• Paid to Material Suppliers</span>
                  <span>{formatCurrency(suppliers.reduce((s, sup) => s + sup.totalPaid, 0), settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Paid to Site Labourers & Craftsmen</span>
                  <span>{formatCurrency(attendance.reduce((s, a) => s + a.amountPaid, 0), settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Paid Subcontractors & Logistics</span>
                  <span>{formatCurrency(directSubcontractorCost, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Paid Office Rent, Utilities & Overheads</span>
                  <span>{formatCurrency(officeOverhead, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between py-3 px-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl font-bold text-white text-sm">
              <span>NET CASH SURPLUS IN HAND & BANK (নিট উদ্বৃত্ত নগদ)</span>
              <span className="text-emerald-300 text-base">
                {formatCurrency(totalCashReceived - (directMaterialCost + directLabourCost + directSubcontractorCost + officeOverhead), settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Report 3: Project Profitability */}
      {reportType === 'project_profit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3 text-right">Contract</th>
                  <th className="py-3 px-3 text-right">Direct Costs</th>
                  <th className="py-3 px-3 text-right">Net Profit</th>
                  <th className="py-3 px-3 text-right">Margin %</th>
                  <th className="py-3 px-3 text-right">Cash Received</th>
                  <th className="py-3 px-3 text-right">Due Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-3 font-semibold text-white">{p.projectName}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200">{formatCurrency(p.contractValue, settings.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-300">{formatCurrency(p.totalProjectCost, settings.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">{formatCurrency(p.actualProfit, settings.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{p.profitMargin.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">{formatCurrency(p.amountReceived, settings.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400">{formatCurrency(p.outstandingDue, settings.currencySymbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 4: Client Dues */}
      {reportType === 'client_dues' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Client Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Project Site</th>
                  <th className="py-3 px-3 text-right">Contract</th>
                  <th className="py-3 px-3 text-right">Received</th>
                  <th className="py-3 px-3 text-right">Outstanding Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {clients.filter(c => c.totalDue > 0).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-3 font-semibold text-white">{c.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{c.phone}</td>
                    <td className="py-3 px-3 text-slate-300">{c.projectName}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200">{formatCurrency(c.totalContractAmount, settings.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">{formatCurrency(c.totalReceived, settings.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">{formatCurrency(c.totalDue, settings.currencySymbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 5: Supplier Dues */}
      {reportType === 'supplier_dues' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Supplier Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Materials</th>
                  <th className="py-3 px-3 text-right">Total Billed</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Due Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-3 font-semibold text-white">{s.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{s.phone}</td>
                    <td className="py-3 px-3 text-slate-300">{s.materialSupplied}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200">{formatCurrency(s.totalBilled, settings.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">{formatCurrency(s.totalPaid, settings.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">{formatCurrency(s.outstandingDue, settings.currencySymbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 6: Material Valuation */}
      {reportType === 'material_valuation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Material Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Unit Rate</th>
                  <th className="py-3 px-3 text-right">Current Stock</th>
                  <th className="py-3 px-3 text-right">Stock Valuation</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-3 font-semibold text-white">{m.materialName}</td>
                    <td className="py-3 px-3 text-slate-300">{m.category}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{formatCurrency(m.unitPurchasePrice, settings.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">{m.currentStock} {m.unit}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">{formatCurrency(m.totalStockValue, settings.currencySymbol)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
                        {m.stockStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
