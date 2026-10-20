/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  Layers,
  Info,
  Edit2,
  Trash2,
  Printer,
} from 'lucide-react';
import { ExpenseItem, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';
import { ExpenseReceiptPrintModal, PrintableExpenseData } from '../modals/ExpenseReceiptPrintModal';

interface ExpensesViewProps {
  expenses: ExpenseItem[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onAddExpense: () => void;
  onEditExpense?: (expense: ExpenseItem) => void;
  onDeleteExpense?: (expense: ExpenseItem) => void;
  onImportExpenses?: (records: ExpenseItem[]) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  settings,
  language,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onImportExpenses,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'PROJECT_DIRECT' | 'OFFICE_OVERHEAD'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [printingExpense, setPrintingExpense] = useState<PrintableExpenseData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const handlePrintExpense = (e: ExpenseItem) => {
    setPrintingExpense({
      id: e.id,
      date: e.date,
      amount: e.amount,
      description: e.description,
      category: e.expenseCategory,
      paidTo: e.supplierPayee,
      paymentMethod: e.paymentMethod,
      projectName: e.projectName || (e.expenseType === 'PROJECT_DIRECT' ? e.projectId : 'অফিস সাধারণ খরচ'),
      billNumber: e.billInvoiceNumber,
      approvedBy: e.approvedBy,
      type: e.expenseType,
    });
    setIsReceiptModalOpen(true);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.supplierPayee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.billInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || e.expenseType === filterType;
    const matchesCat = selectedCategory === 'ALL' || e.expenseCategory === selectedCategory;
    return matchesSearch && matchesType && matchesCat;
  });

  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const totalDirect = expenses.filter((e) => e.expenseType === 'PROJECT_DIRECT').reduce((s, e) => s + e.amount, 0);
  const totalOverhead = expenses.filter((e) => e.expenseType === 'OFFICE_OVERHEAD').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN' ? 'Office & Project Expense Directory' : 'অফিস ও প্রজেক্ট খরচ রেজিস্টার'}
            </h2>
            <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-mono">
              08_Expense_Management
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Categorized site expenses, office overheads, bill references, and approval tracking'
              : 'ক্যাটাগরি ভিত্তিক প্রজেক্ট ও অফিস খরচ, ভাউচার এন্ট্রি এবং অনুমোদন ট্র্যাকিং'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onImportExpenses && (
            <CategoryImportButton
              category="expenses"
              language={language}
              existingIds={expenses.map((e) => e.id)}
              onImportRecords={onImportExpenses}
            />
          )}
          <button
            type="button"
            onClick={() => {
              if (filteredExpenses.length > 0) {
                handlePrintExpense(filteredExpenses[0]);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-bold text-xs shadow-sm transition cursor-pointer"
            title={language === 'EN' ? 'Print Official Expense Voucher' : 'খরচ ভাউচার বা রশিদ প্রিন্ট করুন'}
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>{language === 'EN' ? 'Print Receipt' : 'প্রিন্ট রশিদ'}</span>
          </button>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'EN' ? 'Add Expense' : 'নতুন খরচ এন্ট্রি'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Expenses (All)' : 'সর্বমোট খরচ'}
          </span>
          <span className="text-xl font-bold font-mono text-white">
            {formatCurrency(totalAll, settings.currencySymbol)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Direct Project Cost' : 'প্রজেক্ট ডাইরেক্ট খরচ'}
          </span>
          <span className="text-xl font-bold font-mono text-amber-400">
            {formatCurrency(totalDirect, settings.currencySymbol)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Office Overhead' : 'অফিস অভারহেড খরচ'}
          </span>
          <span className="text-xl font-bold font-mono text-indigo-400">
            {formatCurrency(totalOverhead, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All ({expenses.length})
          </button>
          <button
            onClick={() => setFilterType('PROJECT_DIRECT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'PROJECT_DIRECT'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🏛️ Direct Project ({expenses.filter(e => e.expenseType === 'PROJECT_DIRECT').length})
          </button>
          <button
            onClick={() => setFilterType('OFFICE_OVERHEAD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'OFFICE_OVERHEAD'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🏢 Office Overhead ({expenses.filter(e => e.expenseType === 'OFFICE_OVERHEAD').length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description, payee, invoice..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500 text-xs"
          >
            <option value="ALL">All Categories</option>
            {settings.expenseCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Expense ID & Date</th>
                <th className="py-3 px-3">Category & Scope</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Project / Overhead</th>
                <th className="py-3 px-3">Supplier / Payee</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Approved By</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3.5 px-3">
                    <span className="font-mono text-rose-400 font-bold block">{e.id}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(e.date)}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-white block">{e.expenseCategory}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                        e.expenseType === 'PROJECT_DIRECT'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {e.expenseType === 'PROJECT_DIRECT' ? 'Direct Project' : 'Office Overhead'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="text-slate-200 font-medium max-w-xs">{e.description}</div>
                    {e.billInvoiceNumber && (
                      <div className="text-[10px] text-slate-400 font-mono">Invoice: {e.billInvoiceNumber}</div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-slate-300">
                    {e.projectName || e.projectId}
                  </td>

                  <td className="py-3.5 px-3 text-slate-300 font-medium">
                    {e.supplierPayee}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-300 text-sm">
                    {formatCurrency(e.amount, settings.currencySymbol)}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        e.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {e.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                    {e.approvedBy || 'Admin'}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePrintExpense(e)}
                        title={language === 'EN' ? 'Print Receipt / Voucher' : 'ভাউচার / রশিদ প্রিন্ট করুন'}
                        className="p-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 border border-sky-500/20 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {onEditExpense && (
                        <button
                          onClick={() => onEditExpense(e)}
                          title={language === 'EN' ? 'Edit Expense' : 'খরচ এডিট করুন'}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteExpense && (
                        <button
                          onClick={() => onDeleteExpense(e)}
                          title={language === 'EN' ? 'Delete Expense' : 'খরচ মুছে ফেলুন'}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
