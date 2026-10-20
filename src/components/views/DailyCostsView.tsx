/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Car,
  Coffee,
  Wrench,
  Printer,
  Plus,
  Search,
  Calendar,
  Wallet,
  ArrowRight,
  TrendingDown,
  Clock,
  Printer as PrintIcon,
  CheckCircle2,
  AlertTriangle,
  Building,
  Layers,
  MapPin,
  Compass,
  FileSpreadsheet,
  Download,
  Users,
  CreditCard,
  DollarSign,
  Edit2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { ExpenseItem, Project, CompanySettings, PettyCashFund } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';
import { ExpenseReceiptPrintModal, PrintableExpenseData } from '../modals/ExpenseReceiptPrintModal';

interface DailyCostsViewProps {
  expenses: ExpenseItem[];
  projects: Project[];
  settings: CompanySettings;
  pettyCashFund: PettyCashFund;
  language: 'EN' | 'BN';
  onAddDailyCost: () => void;
  onUpdatePettyCash: (newFund: PettyCashFund) => void;
  onEditExpense?: (expense: ExpenseItem) => void;
  onDeleteExpense: (expense: ExpenseItem) => void;
  onImportDailyCosts?: (records: ExpenseItem[]) => void;
}

export const DailyCostsView: React.FC<DailyCostsViewProps> = ({
  expenses,
  projects,
  settings,
  pettyCashFund,
  language,
  onAddDailyCost,
  onUpdatePettyCash,
  onEditExpense,
  onDeleteExpense,
  onImportDailyCosts,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [dateFilter, setDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'PROJECT_DIRECT' | 'OFFICE_OVERHEAD'>('ALL');
  const [subcatFilter, setSubcatFilter] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedStaff, setSelectedStaff] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refill Petty Cash Modal
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [refillAmount, setRefillAmount] = useState<number>(10000);

  // Edit Petty Cash Balance Modal
  const [isEditPettyCashModalOpen, setIsEditPettyCashModalOpen] = useState(false);
  const [editPettyBalance, setEditPettyBalance] = useState<number>(pettyCashFund.currentBalance);
  const [editTotalAdded, setEditTotalAdded] = useState<number>(pettyCashFund.totalFundsAdded);

  // MD Handover / Reset to 0 Modal
  const [isMdHandoverModalOpen, setIsMdHandoverModalOpen] = useState(false);
  const [handoverNote, setHandoverNote] = useState<string>(
    'এমডি সাহেবের নিকট সর্বমোট পেটি ক্যাশ হিসাব বুঝিয়ে দিয়ে ব্যালেন্স ০ করা হলো।'
  );

  // Official Receipt Print Modal State
  const [printingExpense, setPrintingExpense] = useState<PrintableExpenseData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const handlePrintDailyExpense = (e: ExpenseItem) => {
    setPrintingExpense({
      id: e.id,
      date: e.date,
      amount: e.amount,
      description: e.description,
      category: e.dailySubcategory || e.expenseCategory,
      paidTo: e.spentBy || e.supplierPayee || 'N/A',
      paymentMethod: e.paymentMethod,
      projectName: e.projectName || (e.projectId === 'OFFICE_GENERAL' ? 'অফিস সাধারণ খরচ' : e.projectId),
      billNumber: e.billInvoiceNumber,
      approvedBy: e.approvedBy,
      type: e.expenseType,
    });
    setIsReceiptModalOpen(true);
  };

  // Calculate Dates
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoStr = monthAgo.toISOString().split('T')[0];

  // Filter daily expenses
  // An expense is treated as daily if it has isDailyCost === true, or its category is Conveyance/Tea/Food/Tools/Printing
  const isDailyExpense = (e: ExpenseItem) => {
    return (
      e.isDailyCost === true ||
      e.dailySubcategory !== undefined ||
      e.expenseCategory.toLowerCase().includes('conveyance') ||
      e.expenseCategory.toLowerCase().includes('transport') ||
      e.expenseCategory.toLowerCase().includes('tea') ||
      e.expenseCategory.toLowerCase().includes('food') ||
      e.expenseCategory.toLowerCase().includes('refreshment') ||
      e.expenseCategory.toLowerCase().includes('hardware') ||
      e.expenseCategory.toLowerCase().includes('stationery') ||
      e.expenseCategory.toLowerCase().includes('printing')
    );
  };

  const dailyExpenses = expenses.filter(isDailyExpense);

  const filteredExpenses = dailyExpenses.filter((e) => {
    // Date filter
    let matchesDate = true;
    if (dateFilter === 'TODAY') {
      matchesDate = e.date === todayStr;
    } else if (dateFilter === 'YESTERDAY') {
      matchesDate = e.date === yesterdayStr;
    } else if (dateFilter === 'WEEK') {
      matchesDate = e.date >= weekAgoStr;
    } else if (dateFilter === 'MONTH') {
      matchesDate = e.date >= monthAgoStr;
    }

    // Scope filter
    const matchesScope = scopeFilter === 'ALL' || e.expenseType === scopeFilter;

    // Subcat filter
    let matchesSubcat = true;
    if (subcatFilter !== 'ALL') {
      matchesSubcat =
        e.dailySubcategory === subcatFilter ||
        e.expenseCategory.toLowerCase().includes(subcatFilter.toLowerCase());
    }

    // Project filter
    const matchesProject = selectedProjectId === 'ALL' || e.projectId === selectedProjectId;

    // Staff filter
    const matchesStaff = selectedStaff === 'ALL' || e.spentBy === selectedStaff || e.supplierPayee === selectedStaff;

    // Search
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      e.description.toLowerCase().includes(term) ||
      (e.travelRoute && e.travelRoute.toLowerCase().includes(term)) ||
      (e.spentBy && e.spentBy.toLowerCase().includes(term)) ||
      (e.conveyanceMode && e.conveyanceMode.toLowerCase().includes(term)) ||
      (e.projectName && e.projectName.toLowerCase().includes(term));

    return matchesDate && matchesScope && matchesSubcat && matchesProject && matchesStaff && matchesSearch;
  });

  // KPI Calculations
  const todayExpenses = dailyExpenses.filter((e) => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);

  const todayConveyance = todayExpenses
    .filter((e) => e.dailySubcategory === 'Conveyance' || e.expenseCategory.toLowerCase().includes('conveyance') || e.expenseCategory.toLowerCase().includes('transport'))
    .reduce((s, e) => s + e.amount, 0);

  const todayTea = todayExpenses
    .filter((e) => e.dailySubcategory === 'Tea & Snacks' || e.dailySubcategory === 'Client Entertainment' || e.expenseCategory.toLowerCase().includes('tea') || e.expenseCategory.toLowerCase().includes('food'))
    .reduce((s, e) => s + e.amount, 0);

  const todayHardware = todayExpenses
    .filter((e) => e.dailySubcategory === 'Emergency Hardware' || e.expenseCategory.toLowerCase().includes('hardware'))
    .reduce((s, e) => s + e.amount, 0);

  const monthTotal = dailyExpenses
    .filter((e) => e.date >= monthAgoStr)
    .reduce((s, e) => s + e.amount, 0);

  // Group by Conveyance Transport Mode
  const modeBreakdown: Record<string, number> = {};
  dailyExpenses.forEach((e) => {
    if (e.conveyanceMode && e.conveyanceMode !== 'N/A') {
      modeBreakdown[e.conveyanceMode] = (modeBreakdown[e.conveyanceMode] || 0) + e.amount;
    }
  });

  // Project-wise Conveyance
  const projectConveyance: Record<string, { name: string; amount: number; count: number }> = {};
  dailyExpenses.forEach((e) => {
    if (e.projectId && e.projectId !== 'OFFICE_GENERAL') {
      const projName = e.projectName || e.projectId;
      if (!projectConveyance[e.projectId]) {
        projectConveyance[e.projectId] = { name: projName, amount: 0, count: 0 };
      }
      projectConveyance[e.projectId].amount += e.amount;
      projectConveyance[e.projectId].count += 1;
    }
  });

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillAmount || refillAmount <= 0) return;

    const newFund: PettyCashFund = {
      currentBalance: pettyCashFund.currentBalance + refillAmount,
      totalFundsAdded: pettyCashFund.totalFundsAdded + refillAmount,
      lastFundAddedDate: todayStr,
      lastFundAddedAmount: refillAmount,
    };
    onUpdatePettyCash(newFund);
    setIsRefillModalOpen(false);
  };

  const handleEditPettyCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFund: PettyCashFund = {
      ...pettyCashFund,
      currentBalance: Number(editPettyBalance || 0),
      totalFundsAdded: Number(editTotalAdded || 0),
    };
    onUpdatePettyCash(newFund);
    setIsEditPettyCashModalOpen(false);
  };

  const handleMdHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFund: PettyCashFund = {
      ...pettyCashFund,
      currentBalance: 0,
      lastFundAddedDate: todayStr,
    };
    onUpdatePettyCash(newFund);
    setIsMdHandoverModalOpen(false);
  };

  const handlePrintDailyVoucher = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Car className="w-6 h-6" />
              </div>
              <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
                {language === 'EN' ? 'Daily Costs & Site Conveyance' : 'দৈনিক খরচ ও সাইট কনভেয়েন্স (যাতায়াত) খতিয়ান'}
              </h2>
            </div>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl">
              {language === 'EN'
                ? 'Track daily site visit fares (Rickshaw, CNG, Uber), office tea & snacks, emergency hardware, blueprint prints, and cash drawer petty cash.'
                : 'সাইট পরিদর্শনের রিকশা/সিএনজি/উবার ভাড়া, সাইট ভিজিট খরচ, অফিসের দৈনিক চা-নাস্তা, মিস্ত্রিদের খাবার ও স্থানীয় হার্ডওয়্যার কেনাকাটার নিখুঁত হিসাব।'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onImportDailyCosts && (
              <CategoryImportButton
                category="dailycosts"
                language={language}
                existingIds={expenses.map((e) => e.id)}
                onImportRecords={onImportDailyCosts}
              />
            )}
            <button
              onClick={onAddDailyCost}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'EN' ? 'Record Daily Expense' : 'নতুন দৈনিক খরচ এন্ট্রি'}</span>
            </button>

            <button
              onClick={() => setIsRefillModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>{language === 'EN' ? 'Refill Petty Cash' : 'পেটি ক্যাশে টাকা জমা'}</span>
            </button>

            <button
              onClick={() => {
                setEditPettyBalance(pettyCashFund.currentBalance);
                setEditTotalAdded(pettyCashFund.totalFundsAdded);
                setIsEditPettyCashModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition cursor-pointer"
              title="পেটি ক্যাশ ব্যালেন্স সংশোধন ও এডিট করুন"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>পেটি ক্যাশ এডিট</span>
            </button>

            <button
              onClick={() => setIsMdHandoverModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition cursor-pointer"
              title="এমডি সাহেবকে সকল হিসাব বুঝিয়ে দিয়ে ব্যালেন্স ৳০ করুন"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>এমডিকে বুঝিয়ে দেয়া (৳০ করা)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (filteredExpenses.length > 0) {
                  handlePrintDailyExpense(filteredExpenses[0]);
                } else {
                  handlePrintDailyVoucher();
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition cursor-pointer"
              title="খরচ ভাউচার বা রশিদ প্রিন্ট করুন"
            >
              <PrintIcon className="w-4 h-4 text-sky-400" />
              <span>{language === 'EN' ? 'Print Receipt' : 'প্রিন্ট রশিদ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Today Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'EN' ? "Today's Total Cost" : 'আজকের মোট খরচ'}</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-white">
            {formatCurrency(todayTotal, settings.currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {todayExpenses.length} {language === 'EN' ? 'vouchers today' : 'টি ভাউচার'}
          </span>
        </div>

        {/* Today Conveyance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'EN' ? "Today's Conveyance" : 'আজকের যাতায়াত ভাড়া'}</span>
            <Car className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-sky-400">
            {formatCurrency(todayConveyance, settings.currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            রিকশা, সিএনজি, উবার
          </span>
        </div>

        {/* Today Tea & Snacks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'EN' ? 'Tea & Snacks' : 'চা-নাস্তা ও পানি'}</span>
            <Coffee className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-400">
            {formatCurrency(todayTea, settings.currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            অফিস ও সাইট স্টাফ
          </span>
        </div>

        {/* Emergency Hardware */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'EN' ? 'Site Emergency' : 'জরুরি সাইট কেনাকাটা'}</span>
            <Wrench className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-rose-400">
            {formatCurrency(todayHardware, settings.currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            আঠা, পেরেক, টেপ ও টুলস
          </span>
        </div>

        {/* Remaining Petty Cash */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{language === 'EN' ? 'Petty Cash in Hand' : 'হাতে থাকা পেটি ক্যাশ'}</span>
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-extrabold font-mono text-amber-400">
              {formatCurrency(pettyCashFund.currentBalance, settings.currencySymbol)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              ক্যাশ ড্রয়ার ব্যালেন্স
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-800/80 text-[10px]">
            <button
              type="button"
              onClick={() => {
                setEditPettyBalance(pettyCashFund.currentBalance);
                setEditTotalAdded(pettyCashFund.totalFundsAdded);
                setIsEditPettyCashModalOpen(true);
              }}
              className="flex-1 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold border border-amber-500/30 transition text-center cursor-pointer"
            >
              ✏️ এডিট / সংশোধন
            </button>
            <button
              type="button"
              onClick={() => setIsMdHandoverModalOpen(true)}
              className="flex-1 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold border border-rose-500/30 transition text-center cursor-pointer"
            >
              🤝 এমডিকে বুঝিয়ে দেয়া (৳০)
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Period Selection */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                dateFilter === 'TODAY' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              আজকে ({dailyExpenses.filter(e => e.date === todayStr).length})
            </button>

            <button
              onClick={() => setDateFilter('YESTERDAY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                dateFilter === 'YESTERDAY' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              গতকাল ({dailyExpenses.filter(e => e.date === yesterdayStr).length})
            </button>

            <button
              onClick={() => setDateFilter('WEEK')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                dateFilter === 'WEEK' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              চলতি সপ্তাহ
            </button>

            <button
              onClick={() => setDateFilter('MONTH')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                dateFilter === 'MONTH' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              চলতি মাস
            </button>

            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                dateFilter === 'ALL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              সব ({dailyExpenses.length})
            </button>
          </div>

          {/* Scope Selector (Direct vs Overhead) */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setScopeFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                scopeFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              সব খাত
            </button>
            <button
              onClick={() => setScopeFilter('PROJECT_DIRECT')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                scopeFilter === 'PROJECT_DIRECT' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              সাইটের সরাসরি খরচ
            </button>
            <button
              onClick={() => setScopeFilter('OFFICE_OVERHEAD')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                scopeFilter === 'OFFICE_OVERHEAD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              অফিসের পরিচালন ব্যয়
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          {/* Subcategory */}
          <select
            value={subcatFilter}
            onChange={(e) => setSubcatFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">সব ধরনের খরচ (All Types)</option>
            <option value="Conveyance">যাতায়াত ও ভাড়া (Conveyance)</option>
            <option value="Tea & Snacks">চা-নাস্তা ও রিফ্রেশমেন্ট</option>
            <option value="Client Entertainment">ক্লায়েন্ট মিটিং আপ্যায়ন</option>
            <option value="Emergency Hardware">জরুরি সাইট হার্ডওয়্যার</option>
            <option value="Printing & Drawing">প্রিন্ট, ড্রয়িং ও স্টেশনারি</option>
            <option value="Porter & Van">কুলি ও ভ্যান ভাড়া</option>
          </select>

          {/* Project */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">সকল প্রজেক্ট ও অফিস</option>
            <option value="OFFICE_GENERAL">🏢 Head Office Overhead</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                📐 {p.projectName} ({p.id})
              </option>
            ))}
          </select>

          {/* Staff Filter */}
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">সকল কর্মী / স্টাফ (Spent By)</option>
            {settings.employees.map((emp) => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="রুট, বিবরণ বা স্টাফ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table: Daily Expenses Register */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              {language === 'EN' ? 'Daily Expense Vouchers' : 'দৈনিক খরচের খতিয়ান তালিকা'} ({filteredExpenses.length})
            </h3>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            মোট খরচ:{' '}
            <span className="font-bold font-mono text-amber-400 text-sm ml-1">
              {formatCurrency(filteredExpenses.reduce((s, e) => s + e.amount, 0), settings.currencySymbol)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">তারিখ ও আইডি</th>
                <th className="py-3 px-3.5">খরচের ধরন</th>
                <th className="py-3 px-3.5">যাতায়াত মাধ্যম ও রুট</th>
                <th className="py-3 px-3.5">বিবরণ</th>
                <th className="py-3 px-3.5">খাত (প্রজেক্ট / অফিস)</th>
                <th className="py-3 px-3.5">কে খরচ করেছেন</th>
                <th className="py-3 px-3.5">পেমেন্ট মাধ্যম</th>
                <th className="py-3 px-3.5 text-right">টাকা (৳)</th>
                <th className="py-3 px-3.5 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    কোনো খরচের রেকর্ড পাওয়া যায়নি। উপরে "নতুন দৈনিক খরচ এন্ট্রি" চাপুন।
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-850/40 transition">
                    {/* ID & Date */}
                    <td className="py-3 px-3.5">
                      <span className="font-mono text-amber-400 font-bold block">{e.id}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(e.date)}</span>
                    </td>

                    {/* Subcategory */}
                    <td className="py-3 px-3.5">
                      <span className="font-semibold text-white block">
                        {e.dailySubcategory || e.expenseCategory}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                          e.expenseType === 'PROJECT_DIRECT'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {e.expenseType === 'PROJECT_DIRECT' ? 'Project Direct' : 'Office Overhead'}
                      </span>
                    </td>

                    {/* Conveyance details */}
                    <td className="py-3 px-3.5">
                      {e.conveyanceMode && e.conveyanceMode !== 'N/A' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 font-semibold text-[11px] border border-sky-500/30">
                            <Car className="w-3 h-3" />
                            {e.conveyanceMode}
                          </span>
                          {e.travelRoute && (
                            <div className="text-[10px] text-slate-300 font-medium mt-1 truncate max-w-xs flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                              <span className="truncate">{e.travelRoute}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3.5">
                      <div className="text-slate-200 font-medium max-w-xs">{e.description}</div>
                      {e.billInvoiceNumber && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Memo: {e.billInvoiceNumber}
                        </span>
                      )}
                    </td>

                    {/* Project / Scope */}
                    <td className="py-3 px-3.5 text-slate-300">
                      {e.projectId === 'OFFICE_GENERAL' ? (
                        <span className="text-indigo-300 font-medium">🏢 Head Office</span>
                      ) : (
                        <span className="text-amber-300 font-medium">
                          📐 {e.projectName || e.projectId}
                        </span>
                      )}
                    </td>

                    {/* Spent By */}
                    <td className="py-3 px-3.5 text-slate-300 font-medium">
                      {e.spentBy || e.supplierPayee}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-3.5">
                      <span className="text-slate-300 text-[11px] block">
                        {e.paymentMethod}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-300 text-sm">
                      {formatCurrency(e.amount, settings.currencySymbol)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePrintDailyExpense(e)}
                          className="p-1 rounded bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 transition cursor-pointer"
                          title={language === 'EN' ? 'Print Receipt / Voucher' : 'ভাউচার / রশিদ প্রিন্ট করুন'}
                        >
                          <PrintIcon className="w-3.5 h-3.5" />
                        </button>
                        {onEditExpense && (
                          <button
                            onClick={() => onEditExpense(e)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                            title={language === 'EN' ? 'Edit Expense' : 'দৈনিক খরচ এডিট করুন'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteExpense(e)}
                          className="p-1 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer"
                          title={language === 'EN' ? 'Delete Expense' : 'দৈনিক খরচ মুছে ফেলুন'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Breakdown Cards: Mode & Project Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Conveyance by Transport Mode */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-white text-sm">
              {language === 'EN' ? 'Conveyance by Transport Mode' : 'যাতায়াত মাধ্যম অনুযায়ী মোট খরচ'}
            </h3>
          </div>

          <div className="space-y-2.5">
            {Object.keys(modeBreakdown).length === 0 ? (
              <p className="text-xs text-slate-500">কোনো যাতায়াত রেকর্ড নেই।</p>
            ) : (
              Object.entries(modeBreakdown).map(([mode, amt]) => {
                const totalConveyanceAll = Object.values(modeBreakdown).reduce((a, b) => a + b, 0);
                const pct = totalConveyanceAll > 0 ? Math.round((amt / totalConveyanceAll) * 100) : 0;
                return (
                  <div key={mode} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{mode}</span>
                      <span className="font-mono font-bold text-sky-300">
                        {formatCurrency(amt, settings.currencySymbol)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-500 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Project-wise Conveyance & Site Visits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              {language === 'EN' ? 'Project-wise Site Visit & Conveyance Total' : 'প্রজেক্ট অনুযায়ী সাইট ভিজিট ও কনভেয়েন্স খরচ'}
            </h3>
          </div>

          <div className="space-y-2.5">
            {Object.keys(projectConveyance).length === 0 ? (
              <p className="text-xs text-slate-500">কোনো প্রজেক্টের সাইট কনভেয়েন্স রেকর্ড নেই।</p>
            ) : (
              Object.entries(projectConveyance).map(([projId, item]) => {
                return (
                  <div
                    key={projId}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white truncate max-w-xs">{item.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {projId} • {item.count} টি ভিজিট/খরচ
                      </span>
                    </div>
                    <div className="font-mono font-bold text-amber-300 text-sm">
                      {formatCurrency(item.amount, settings.currencySymbol)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Refill Petty Cash Modal */}
      {isRefillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsRefillModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {language === 'EN' ? 'Add Funds to Petty Cash' : 'পেটি ক্যাশে টাকা রিফিল / জমা'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  বর্তমান ব্যালেন্স: {formatCurrency(pettyCashFund.currentBalance, settings.currencySymbol)}
                </p>
              </div>
            </div>

            <form onSubmit={handleRefillSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  জমা টাকার পরিমাণ (৳):
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="any"
                  value={refillAmount}
                  onChange={(e) => setRefillAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-emerald-500/60 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold text-base focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                ব্যাংক বা ক্যাশিয়ার থেকে পেটি ক্যাশ ড্রয়ারে টাকা তোলা হলে এটি এন্ট্রি করুন।
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition cursor-pointer"
              >
                টাকা জমা নিশ্চিত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Petty Cash Balance Modal */}
      {isEditPettyCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm text-xs">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsEditPettyCashModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {language === 'EN' ? 'Edit Petty Cash Balance' : 'পেটি ক্যাশ ব্যালেন্স এডিট / সংশোধন'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  ভুল এন্ট্রি হলে এখানে সঠিক ক্যাশ ড্রয়ার হিসাব লিখে আপডেট করুন
                </p>
              </div>
            </div>

            <form onSubmit={handleEditPettyCashSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  বর্তমান ক্যাশ ড্রয়ার ব্যালেন্স (৳):
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={editPettyBalance}
                  onChange={(e) => setEditPettyBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-amber-500/60 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold text-base focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  সর্বমোট তোলাইকৃত পেটি ক্যাশ ফান্ডের পরিমাণ (৳):
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={editTotalAdded}
                  onChange={(e) => setEditTotalAdded(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                পূর্বে কোনো ভুল হিসাব ইনপুট দেওয়া হয়ে থাকলে এই সংখ্যা সংশোধন করে দিলেই ব্যালেন্স সাথে সাথে ঠিক হয়ে যাবে।
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition cursor-pointer"
              >
                সংশোধিত ব্যালেন্স সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MD Handover / Reset to 0 Modal */}
      {isMdHandoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm text-xs">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsMdHandoverModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {language === 'EN' ? 'Reset Petty Cash (MD Handover)' : 'এমডি স্যারকে হিসাব বুঝিয়ে দেওয়া (ব্যালেন্স ৳০)'}
                </h3>
                <p className="text-[11px] text-rose-300 font-medium">
                  বর্তমান অবশিষ্টাংশ ক্যাশ: {formatCurrency(pettyCashFund.currentBalance, settings.currencySymbol)}
                </p>
              </div>
            </div>

            <form onSubmit={handleMdHandoverSubmit} className="space-y-3 pt-2">
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1">
                <div className="font-bold text-white text-xs">⚠️ নিশ্চিতকরণ নোটিশ</div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  এমডি সাহেবকে বর্তমান হাতে থাকা <strong>{formatCurrency(pettyCashFund.currentBalance, settings.currencySymbol)}</strong> পেটি ক্যাশের সকল হিসাব বুঝিয়ে দিয়ে ড্রয়ার ব্যালেন্স <strong>৳০</strong> করতে "হিসাব বুঝিয়ে দেওয়া নিশ্চিত করুন" বাটনে চাপুন।
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  হস্তান্তর সম্পর্কিত নোট / মন্তব্য:
                </label>
                <input
                  type="text"
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsMdHandoverModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition cursor-pointer"
                >
                  হিসাব বুঝিয়ে দেওয়া নিশ্চিত করুন (৳০)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Official Expense Receipt Print Modal */}
      <ExpenseReceiptPrintModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        expense={printingExpense}
        settings={settings}
        language={language}
      />
    </div>
  );
};
