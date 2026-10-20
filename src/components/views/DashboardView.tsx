/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Layers,
  HardHat,
  Receipt,
  FileSpreadsheet,
  Download,
  Calendar,
  Building,
  PlusCircle,
  ExternalLink,
  Car,
  Coffee,
  Filter,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import {
  CompanySettings,
  Client,
  Project,
  MaterialItem,
  MaterialTransaction,
  Worker,
  LabourAttendance,
  PaymentReceived,
  ExpenseItem,
  TaskItem,
} from '../../types';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

interface DashboardViewProps {
  settings: CompanySettings;
  clients: Client[];
  projects: Project[];
  materials: MaterialItem[];
  transactions: MaterialTransaction[];
  workers: Worker[];
  attendance: LabourAttendance[];
  payments: PaymentReceived[];
  expenses: ExpenseItem[];
  tasks: TaskItem[];
  language: 'EN' | 'BN';
  onNavigateTab: (tab: any) => void;
  onOpenAppsScript: () => void;
  onExportExcel: () => void;
  onOpenNewProject: () => void;
  onOpenNewPayment: () => void;
  onOpenNewExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  clients,
  projects,
  materials,
  transactions,
  workers,
  attendance,
  payments,
  expenses,
  tasks,
  language,
  onNavigateTab,
  onOpenAppsScript,
  onExportExcel,
  onOpenNewProject,
  onOpenNewPayment,
  onOpenNewExpense,
}) => {
  // Financial Calculations
  const totalContractValue = projects.reduce((sum, p) => sum + p.contractValue, 0);
  const totalMoneyReceived = payments.reduce((sum, p) => sum + p.amountReceived, 0);
  const totalOutstandingDue = Math.max(0, totalContractValue - totalMoneyReceived);

  // Material cost from site issues
  const totalMaterialCost = transactions
    .filter((t) => t.type === 'SITE_ISSUE')
    .reduce((sum, t) => sum + t.totalCost, 0);

  // Labour wages
  const totalLabourCost = attendance.reduce((sum, a) => sum + a.labourCost, 0);

  // Office Overhead
  const totalOfficeExpenses = expenses
    .filter((e) => e.expenseType === 'OFFICE_OVERHEAD')
    .reduce((sum, e) => sum + e.amount, 0);

  // Direct Project Expenses (Subcontractors, site freight, logistics)
  const otherProjectExpenses = expenses
    .filter((e) => e.expenseType === 'PROJECT_DIRECT')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalProjectCost = totalMaterialCost + totalLabourCost + otherProjectExpenses;
  const netProfitLoss = totalMoneyReceived - (totalProjectCost + totalOfficeExpenses);
  const overallMargin = totalContractValue > 0 ? ((totalContractValue - (totalProjectCost + totalOfficeExpenses)) / totalContractValue) * 100 : 0;

  // Project Counts
  const runningProjects = projects.filter(
    (p) => p.projectStatus.includes('Progress') || p.projectStatus === 'Finishing' || p.projectStatus === 'Designing'
  );
  const completedProjects = projects.filter((p) => p.projectStatus === 'Completed');

  // Low Stock Items
  const lowStockMaterials = materials.filter((m) => m.stockStatus !== 'In Stock');

  // Overdue and Upcoming Deadlines
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingTasks = tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  // Date filter state for Day-by-Day Cost Breakdown
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('THIS_MONTH');
  const [customFromDate, setCustomFromDate] = useState<string>('');
  const [customToDate, setCustomToDate] = useState<string>('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Filter helper
  const isDateInSelectedRange = (dateStr: string) => {
    if (!dateStr) return false;
    if (dateFilter === 'ALL') return true;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (dateFilter === 'TODAY') {
      return dateStr === today;
    }
    if (dateFilter === 'YESTERDAY') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return dateStr === y.toISOString().split('T')[0];
    }
    if (dateFilter === 'LAST_7_DAYS') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      return dateStr >= past.toISOString().split('T')[0] && dateStr <= today;
    }
    if (dateFilter === 'THIS_MONTH') {
      const monthPrefix = today.slice(0, 7); // YYYY-MM
      return dateStr.startsWith(monthPrefix);
    }
    if (dateFilter === 'LAST_MONTH') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthPrefix = prev.toISOString().split('T')[0].slice(0, 7);
      return dateStr.startsWith(prevMonthPrefix);
    }
    if (dateFilter === 'CUSTOM') {
      const matchFrom = !customFromDate || dateStr >= customFromDate;
      const matchTo = !customToDate || dateStr <= customToDate;
      return matchFrom && matchTo;
    }
    return true;
  };

  // Filtered lists
  const filteredExpenses = useMemo(() => expenses.filter(e => isDateInSelectedRange(e.date)), [expenses, dateFilter, customFromDate, customToDate]);
  const filteredAttendance = useMemo(() => attendance.filter(a => isDateInSelectedRange(a.attendanceDate)), [attendance, dateFilter, customFromDate, customToDate]);
  const filteredTransactions = useMemo(() => transactions.filter(t => isDateInSelectedRange(t.date) && t.type === 'SITE_ISSUE'), [transactions, dateFilter, customFromDate, customToDate]);

  // Filtered cost totals
  const filteredMaterialCost = filteredTransactions.reduce((s, t) => s + t.totalCost, 0);
  const filteredLabourCost = filteredAttendance.reduce((s, a) => s + a.labourCost, 0);
  const filteredOtherExpenses = filteredExpenses.filter(e => e.expenseType === 'PROJECT_DIRECT').reduce((s, e) => s + e.amount, 0);
  const filteredOfficeExp = filteredExpenses.filter(e => e.expenseType === 'OFFICE_OVERHEAD').reduce((s, e) => s + e.amount, 0);
  const filteredConveyanceExp = filteredExpenses.filter(e => e.expenseCategory === 'Conveyance & Transport' || e.isDailyCost).reduce((s, e) => s + e.amount, 0);
  const filteredTotalCost = filteredMaterialCost + filteredLabourCost + filteredOtherExpenses + filteredOfficeExp;

  // Day-by-Day aggregation map
  const dayByDayAuditList = useMemo(() => {
    const map = new Map<string, {
      date: string;
      totalCost: number;
      conveyance: number;
      material: number;
      labour: number;
      office: number;
      direct: number;
      itemCount: number;
      expenses: ExpenseItem[];
    }>();

    const getOrCreate = (d: string) => {
      if (!map.has(d)) {
        map.set(d, {
          date: d,
          totalCost: 0,
          conveyance: 0,
          material: 0,
          labour: 0,
          office: 0,
          direct: 0,
          itemCount: 0,
          expenses: [],
        });
      }
      return map.get(d)!;
    };

    filteredExpenses.forEach(e => {
      const row = getOrCreate(e.date);
      row.totalCost += e.amount;
      row.itemCount += 1;
      row.expenses.push(e);
      if (e.expenseCategory === 'Conveyance & Transport' || e.isDailyCost) {
        row.conveyance += e.amount;
      } else if (e.expenseType === 'OFFICE_OVERHEAD') {
        row.office += e.amount;
      } else {
        row.direct += e.amount;
      }
    });

    filteredAttendance.forEach(a => {
      const row = getOrCreate(a.attendanceDate);
      row.totalCost += a.labourCost;
      row.labour += a.labourCost;
      row.itemCount += 1;
    });

    filteredTransactions.forEach(t => {
      const row = getOrCreate(t.date);
      row.totalCost += t.totalCost;
      row.material += t.totalCost;
      row.itemCount += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredExpenses, filteredAttendance, filteredTransactions]);

  // Unpaid Client Dues
  const clientsWithDues = clients.filter((c) => c.totalDue > 0).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none hidden md:block"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {language === 'EN' ? 'Automated Executive Cockpit' : 'স্বয়ংক্রিয় এক্সিকিউটিভ ড্যাশবোর্ড'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {settings.companyName}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {language === 'EN'
                ? 'All financial metrics, project status, material inventory, and labour costs are dynamically linked and synchronized with Google Sheets formulas.'
                : 'সকল আর্থিক হিসাব, প্রজেক্ট স্ট্যাটাস, স্টক এবং মিস্ত্রির খরচ স্বয়ংক্রিয়ভাবে গুগল শিট ফর্মুলা অনুসারে আপডেট হচ্ছে।'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'EN' ? '+ New Project' : '+ নতুন প্রজেক্ট'}</span>
            </button>
            <button
              onClick={onOpenNewPayment}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{language === 'EN' ? '+ Receive Payment' : '+ পেমেন্ট গ্রহণ'}</span>
            </button>
            <button
              onClick={onOpenNewExpense}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{language === 'EN' ? '+ Record Expense' : '+ ব্যয় এন্ট্রি'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('dailycosts')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-xs shadow-md transition cursor-pointer"
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span>{language === 'EN' ? 'Daily Conveyance' : 'দৈনিক যাতায়াত'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('smartfilter')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>{language === 'EN' ? 'Smart Audit Filter' : 'স্মার্ট অডিট ও ফিল্টার'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Clients */}
        <div
          onClick={() => onNavigateTab('clients')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{language === 'EN' ? 'Total Clients' : 'মোট ক্লায়েন্ট'}</span>
            <Users className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{clients.length}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{clients.filter(c => c.clientStatus === 'Active').length} Active</span>
            <span className="text-sky-400">View →</span>
          </div>
        </div>

        {/* Total Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{language === 'EN' ? 'Total Projects' : 'মোট প্রজেক্ট'}</span>
            <FolderKanban className="w-4 h-4 text-teal-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{projects.length}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{runningProjects.length} Running</span>
            <span className="text-teal-400">View →</span>
          </div>
        </div>

        {/* Running Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{language === 'EN' ? 'Running Sites' : 'চলতি সাইট'}</span>
            <Layers className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono">{runningProjects.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {completedProjects.length} Handed Over
          </div>
        </div>

        {/* Completed Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{language === 'EN' ? 'Completed' : 'সম্পন্ন প্রজেক্ট'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-emerald-300 font-mono">{completedProjects.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">100% Client Satisfaction</div>
        </div>

        {/* Upcoming Deadlines */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{language === 'EN' ? 'Deadlines' : 'সামনে ডেডলাইন'}</span>
            <Clock className="w-4 h-4 text-orange-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-orange-300 font-mono">
            {tasks.filter((t) => t.status !== 'Completed').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length} High Priority
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigateTab('materials')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{language === 'EN' ? 'Stock Alerts' : 'স্টক সতর্কতা'}</span>
            <Package className="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-rose-300 font-mono">{lowStockMaterials.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {lowStockMaterials.length > 0 ? 'Need Reorder' : 'All Stock OK'}
          </div>
        </div>

        {/* Active Craftsmen */}
        <div
          onClick={() => onNavigateTab('labour')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-pointer transition group col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{language === 'EN' ? 'Craftsmen' : 'মিস্ত্রি দল'}</span>
            <HardHat className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-yellow-300 font-mono">{workers.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Across Active Sites</div>
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contract Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
            <span>{language === 'EN' ? 'Total Contract Value' : 'মোট চুক্তি মূল্য (কন্ট্রাক্ট)'}</span>
            <span className="text-[10px] text-slate-400 font-mono">SUM(04_Projects!K)</span>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(totalContractValue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
            <span>Total agreed client contract volume</span>
          </div>
        </div>

        {/* Money Received */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="text-xs text-emerald-400 font-semibold mb-1 flex items-center justify-between">
            <span>{language === 'EN' ? 'Total Money Received' : 'মোট প্রাপ্ত অর্থ (ক্যাশ ও ব্যাংক)'}</span>
            <span className="text-[10px] text-emerald-500/80 font-mono">SUM(09_Payments!H)</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {formatCurrency(totalMoneyReceived, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-500/90 mt-2 flex items-center justify-between">
            <span>{totalContractValue > 0 ? ((totalMoneyReceived / totalContractValue) * 100).toFixed(1) : 0}% Realized</span>
            <button onClick={() => onNavigateTab('payments')} className="underline hover:text-emerald-300">View Vouchers →</button>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="text-xs text-rose-400 font-semibold mb-1 flex items-center justify-between">
            <span>{language === 'EN' ? 'Total Outstanding Due' : 'মোট বকেয়া পাওনা'}</span>
            <span className="text-[10px] text-rose-500/80 font-mono">Contract - Received</span>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {formatCurrency(totalOutstandingDue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-rose-400/90 mt-2 flex items-center justify-between">
            <span>{clientsWithDues.length} Clients with pending dues</span>
            <button onClick={() => onNavigateTab('clients')} className="underline hover:text-rose-300">Collect →</button>
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-amber-500/30 p-4 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="text-xs text-amber-300 font-semibold mb-1 flex items-center justify-between">
            <span>{language === 'EN' ? 'Estimated Net Profit' : 'আনুমানিক নিট লাভ (প্রফিট)'}</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
              {overallMargin.toFixed(1)}% Margin
            </span>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">
            {formatCurrency(netProfitLoss, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            After direct materials, labour & office rent
          </div>
        </div>
      </div>

      {/* Cost Breakdown Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>{language === 'EN' ? 'Comprehensive Cost & Expense Breakdown' : 'ব্যয় ও খরচের বিশদ বিভাজন'}</span>
          <span className="text-[11px] text-slate-400 font-normal">
            Total Spent: <strong className="text-white font-mono">{formatCurrency(totalProjectCost + totalOfficeExpenses, settings.currencySymbol)}</strong>
          </span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Material Cost */}
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-750">
            <span className="text-slate-400 block text-[11px] mb-1">
              🪵 {language === 'EN' ? 'Direct Material Cost' : 'উপকরণ খরচ'}
            </span>
            <span className="text-base font-bold text-white font-mono block">
              {formatCurrency(totalMaterialCost, settings.currencySymbol)}
            </span>
            <span className="text-[10px] text-slate-400">Plywood, veneer, LEDs, tiles</span>
          </div>

          {/* Labour Cost */}
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-750">
            <span className="text-slate-400 block text-[11px] mb-1">
              👷 {language === 'EN' ? 'Direct Labour Wages' : 'মিস্ত্রির মোট মজুরি'}
            </span>
            <span className="text-base font-bold text-white font-mono block">
              {formatCurrency(totalLabourCost, settings.currencySymbol)}
            </span>
            <span className="text-[10px] text-slate-400">Carpentry, paint, electrical</span>
          </div>

          {/* Subcontractor & Logistics */}
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-750">
            <span className="text-slate-400 block text-[11px] mb-1">
              📐 {language === 'EN' ? 'Other Direct Costs' : 'অন্যান্য সাইট খরচ'}
            </span>
            <span className="text-base font-bold text-white font-mono block">
              {formatCurrency(otherProjectExpenses, settings.currencySymbol)}
            </span>
            <span className="text-[10px] text-slate-400">Subcontractors, site freight</span>
          </div>

          {/* Office Overhead */}
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-750">
            <span className="text-slate-400 block text-[11px] mb-1">
              🏢 {language === 'EN' ? 'Office Fixed Overhead' : 'অফিস ওভারহেড খরচ'}
            </span>
            <span className="text-base font-bold text-white font-mono block">
              {formatCurrency(totalOfficeExpenses, settings.currencySymbol)}
            </span>
            <span className="text-[10px] text-slate-400">Studio rent, power, software</span>
          </div>

          {/* Total Project Direct Cost */}
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 col-span-2 md:col-span-1">
            <span className="text-amber-300 block text-[11px] mb-1 font-semibold">
              📊 {language === 'EN' ? 'Total Project Cost' : 'মোট প্রজেক্ট খরচ'}
            </span>
            <span className="text-base font-bold text-amber-300 font-mono block">
              {formatCurrency(totalProjectCost, settings.currencySymbol)}
            </span>
            <span className="text-[10px] text-amber-200/80">Material + Labour + Direct</span>
          </div>
        </div>
      </div>

      {/* NEW: Date-Wise Filter & Day-by-Day Cost Audit Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>{language === 'EN' ? 'Day-by-Day Cost Breakdown & Date Filter' : 'দৈনিক খরচ ও ডে-বাই-ডে ব্যয় বিশ্লেষণ'}</span>
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                {dateFilter}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'EN'
                ? 'Filter total expenses, conveyance, material issues, and labour wages by any timeframe or day-by-day.'
                : 'প্রতিদিনের যাতায়াত, সাইট খরচ, মেটেরিয়াল ও লেবার মজুরি দিনভিত্তিক ফিল্টার করে মোট খরচ দেখুন।'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: language === 'EN' ? 'All Time' : 'সব সময়' },
                { id: 'TODAY', label: language === 'EN' ? 'Today' : 'আজকে' },
                { id: 'YESTERDAY', label: language === 'EN' ? 'Yesterday' : 'গতকাল' },
                { id: 'LAST_7_DAYS', label: language === 'EN' ? 'Last 7 Days' : 'গত ৭ দিন' },
                { id: 'THIS_MONTH', label: language === 'EN' ? 'This Month' : 'চলতি মাস' },
                { id: 'LAST_MONTH', label: language === 'EN' ? 'Last Month' : 'গত মাস' },
                { id: 'CUSTOM', label: language === 'EN' ? 'Custom' : 'তারিখ নির্বাচন' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDateFilter(filter.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  dateFilter === filter.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === 'CUSTOM' && (
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400 font-semibold">{language === 'EN' ? 'Custom Date Range:' : 'তারিখ নির্বাচন করুন:'}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">From:</span>
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">To:</span>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Period Cost KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">
              {language === 'EN' ? 'Filtered Total Cost' : 'নির্বাচিত মোট খরচ'}
            </span>
            <span className="text-base font-bold font-mono text-amber-300">
              {formatCurrency(filteredTotalCost, settings.currencySymbol)}
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">{dayByDayAuditList.length} Active Days</span>
          </div>

          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">
              🚗 {language === 'EN' ? 'Conveyance & Trips' : 'যাতায়াত ও ভিজিট'}
            </span>
            <span className="text-sm font-bold font-mono text-teal-300">
              {formatCurrency(filteredConveyanceExp, settings.currencySymbol)}
            </span>
            <span className="text-[9px] text-teal-500/80 block mt-0.5">Transport & Fuel</span>
          </div>

          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">
              🪵 {language === 'EN' ? 'Materials Issued' : 'উপকরণ ব্যবহার'}
            </span>
            <span className="text-sm font-bold font-mono text-white">
              {formatCurrency(filteredMaterialCost, settings.currencySymbol)}
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Site Issues</span>
          </div>

          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">
              👷 {language === 'EN' ? 'Labour Wages' : 'লেবার মজুরি'}
            </span>
            <span className="text-sm font-bold font-mono text-yellow-300">
              {formatCurrency(filteredLabourCost, settings.currencySymbol)}
            </span>
            <span className="text-[9px] text-yellow-500/80 block mt-0.5">Attendance Wages</span>
          </div>

          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">
              🏢 {language === 'EN' ? 'Office Overhead' : 'অফিস ইউটিলিটি'}
            </span>
            <span className="text-sm font-bold font-mono text-indigo-300">
              {formatCurrency(filteredOfficeExp, settings.currencySymbol)}
            </span>
            <span className="text-[9px] text-indigo-500/80 block mt-0.5">Rent, Bills, Tea</span>
          </div>

          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">
              📐 {language === 'EN' ? 'Direct Site Costs' : 'অন্যান্য সাইট ব্যয়'}
            </span>
            <span className="text-sm font-bold font-mono text-rose-300">
              {formatCurrency(filteredOtherExpenses, settings.currencySymbol)}
            </span>
            <span className="text-[9px] text-rose-500/80 block mt-0.5">Contractors & Freight</span>
          </div>
        </div>

        {/* Day-by-Day Table */}
        <div className="overflow-hidden border border-slate-800 rounded-xl">
          <div className="p-2.5 bg-slate-950 flex items-center justify-between text-xs border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>📅 {language === 'EN' ? 'Day-by-Day Cost Log' : 'তারিখ অনুযায়ী খরচ তালিকা'}</span>
            </span>
            <button
              onClick={() => onNavigateTab('smartfilter')}
              className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] flex items-center gap-1"
            >
              <span>{language === 'EN' ? 'Deep Worker & Staff Audit →' : 'বিস্তারিত লেবার ও স্টাফ অডিট →'}</span>
            </button>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right font-bold text-white">Day's Total Cost</th>
                  <th className="py-2.5 px-3 text-right">Conveyance</th>
                  <th className="py-2.5 px-3 text-right">Materials</th>
                  <th className="py-2.5 px-3 text-right">Labour Wages</th>
                  <th className="py-2.5 px-3 text-right">Office & Utility</th>
                  <th className="py-2.5 px-3 text-right">Direct Site</th>
                  <th className="py-2.5 px-3 text-center">Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {dayByDayAuditList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      {language === 'EN' ? 'No cost records for this selected period' : 'এই সময়সীমায় কোনো খরচের এন্ট্রি নেই'}
                    </td>
                  </tr>
                ) : (
                  dayByDayAuditList.map((row) => (
                    <React.Fragment key={row.date}>
                      <tr
                        onClick={() => setExpandedDate(expandedDate === row.date ? null : row.date)}
                        className="hover:bg-slate-850/60 cursor-pointer transition"
                      >
                        <td className="py-2.5 px-3 font-mono font-semibold text-white flex items-center gap-1.5">
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                              expandedDate === row.date ? 'rotate-90 text-amber-400' : ''
                            }`}
                          />
                          <span>{formatDate(row.date)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300 text-sm">
                          {formatCurrency(row.totalCost, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-teal-300">
                          {row.conveyance > 0 ? formatCurrency(row.conveyance, settings.currencySymbol) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                          {row.material > 0 ? formatCurrency(row.material, settings.currencySymbol) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-yellow-300">
                          {row.labour > 0 ? formatCurrency(row.labour, settings.currencySymbol) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-indigo-300">
                          {row.office > 0 ? formatCurrency(row.office, settings.currencySymbol) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-300">
                          {row.direct > 0 ? formatCurrency(row.direct, settings.currencySymbol) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                            {row.itemCount} items
                          </span>
                        </td>
                      </tr>

                      {/* Expandable row detail */}
                      {expandedDate === row.date && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={8} className="p-3">
                            <div className="space-y-1.5 text-[11px] text-slate-300 pl-4 border-l-2 border-amber-500">
                              <span className="font-bold text-amber-400 block mb-1">
                                {language === 'EN' ? `Vouchers & Details for ${formatDate(row.date)}:` : `${formatDate(row.date)} তারিখের খরচের বিবরণ:`}
                              </span>
                              {row.expenses.map((exp) => (
                                <div key={exp.id} className="flex items-center justify-between py-0.5 border-b border-slate-900">
                                  <span>
                                    <strong className="text-white">[{exp.expenseCategory}]</strong> {exp.description} ({exp.projectName || exp.supplierPayee})
                                  </span>
                                  <span className="font-mono font-bold text-amber-300">
                                    {formatCurrency(exp.amount, settings.currencySymbol)}
                                  </span>
                                </div>
                              ))}
                              {row.labour > 0 && (
                                <div className="flex items-center justify-between py-0.5 text-yellow-300 border-b border-slate-900">
                                  <span>👷 Labour Attendance & Wages</span>
                                  <span className="font-mono font-bold">{formatCurrency(row.labour, settings.currencySymbol)}</span>
                                </div>
                              )}
                              {row.material > 0 && (
                                <div className="flex items-center justify-between py-0.5 text-slate-300 border-b border-slate-900">
                                  <span>🪵 Site Materials Issued</span>
                                  <span className="font-mono font-bold">{formatCurrency(row.material, settings.currencySymbol)}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Status Table + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Project-Wise Profit and Status */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-teal-400" />
                {language === 'EN' ? 'Project Status & Profitability Overview' : 'প্রজেক্ট অগ্রগতি ও লাভ-ক্ষতি বিবরণী'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Formula linked: Contract Value - Material - Labour - Direct Cost = Net Profit
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              {language === 'EN' ? 'View All Projects →' : 'সকল প্রজেক্ট দেখুন →'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Project</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2">Progress</th>
                  <th className="py-2.5 px-2 text-right">Contract</th>
                  <th className="py-2.5 px-2 text-right">Cost</th>
                  <th className="py-2.5 px-2 text-right">Received</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Est. Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {projects.map((p) => {
                  const isHealthy = p.actualProfit > 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{p.projectName}</div>
                        <div className="text-[10px] text-slate-400">{p.clientName}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.projectStatus === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : p.projectStatus === 'Finishing'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {p.projectStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="w-20">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                            <span>{p.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${p.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-medium text-slate-200">
                        {formatCurrency(p.contractValue, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-slate-400">
                        {formatCurrency(p.totalProjectCost, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-emerald-400 font-medium">
                        {formatCurrency(p.amountReceived, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={isHealthy ? 'text-amber-300' : 'text-rose-400'}>
                          {formatCurrency(p.actualProfit, settings.currencySymbol)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts + Unpaid Client Dues */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                {language === 'EN' ? 'Low Stock Alerts' : 'কম স্টক সতর্কতা'}
              </h3>
              <button
                onClick={() => onNavigateTab('materials')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Inventory →
              </button>
            </div>

            {lowStockMaterials.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <span>All materials are above reorder threshold.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-2.5 rounded-xl bg-slate-850 border border-rose-500/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{mat.materialName}</div>
                      <div className="text-[10px] text-slate-400">
                        Supplier: {mat.supplier} • Reorder: {mat.reorderLevel} {mat.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-300 block">
                        {mat.currentStock} {mat.unit}
                      </span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                        {mat.stockStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unpaid Client Dues */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-400" />
                {language === 'EN' ? 'Unpaid Client Dues' : 'বকেয়া পাওনা তালিকা'}
              </h3>
              <button
                onClick={() => onNavigateTab('clients')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Clients →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {clientsWithDues.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.projectName || c.phone}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-400 block">
                      {formatCurrency(c.totalDue, settings.currencySymbol)}
                    </span>
                    <button
                      onClick={onOpenNewPayment}
                      className="text-[10px] text-emerald-400 hover:underline font-semibold"
                    >
                      Receive Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Milestones & Deadlines */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            {language === 'EN' ? 'Critical Project Deadlines & Milestones' : 'জরুরি ডেডলাইন ও মাইলস্টোন'}
          </h3>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            {language === 'EN' ? 'All Tasks →' : 'সকল কাজ →'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {upcomingTasks.map((t) => (
            <div
              key={t.id}
              className="p-3 bg-slate-850 rounded-xl border border-slate-750 hover:border-slate-700 transition space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white leading-snug">{t.taskName}</span>
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    t.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {t.priority}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">{t.projectName}</div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                <span className="text-slate-400">Assigned: <strong className="text-slate-300">{t.assignedPerson}</strong></span>
                <span className="font-mono text-amber-300 font-bold">Due: {formatDate(t.dueDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
