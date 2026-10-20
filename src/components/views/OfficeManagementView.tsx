/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Wallet,
  Search,
  Phone,
  Mail,
  History,
  CheckCircle2,
} from 'lucide-react';
import { OfficeStaff, OfficeAsset, OfficeBill, CompanySettings, ExpenseItem } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';

interface OfficeManagementViewProps {
  staff: OfficeStaff[];
  assets: OfficeAsset[];
  bills: OfficeBill[];
  expenses?: ExpenseItem[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onAddStaff: () => void;
  onEditStaff: (staff: OfficeStaff) => void;
  onDeleteStaff: (staffId: string) => void;
  onOpenSalaryPayment: (staff?: OfficeStaff, bulkMode?: boolean) => void;
  onAddAsset: () => void;
  onEditAsset: (asset: OfficeAsset) => void;
  onDeleteAsset: (assetId: string) => void;
  onAddBill: () => void;
  onEditBill: (bill: OfficeBill) => void;
  onDeleteBill: (billId: string) => void;
  onToggleBillStatus: (billId: string) => void;
  onEditExpense?: (expense: ExpenseItem) => void;
  onDeleteExpense?: (expense: ExpenseItem) => void;
  onImportStaff?: (records: OfficeStaff[]) => void;
}

export const OfficeManagementView: React.FC<OfficeManagementViewProps> = ({
  staff,
  assets,
  bills,
  expenses = [],
  settings,
  language,
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onOpenSalaryPayment,
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
  onAddBill,
  onEditBill,
  onDeleteBill,
  onToggleBillStatus,
  onEditExpense,
  onDeleteExpense,
  onImportStaff,
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'salary_logs' | 'assets' | 'bills'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const now = new Date();
  const runningMonthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthName = prevDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Filter salary & advance expenses
  const salaryExpenseLogs = expenses.filter(
    (e) =>
      e.expenseCategory === 'Staff Salaries & Advances' ||
      e.expenseCategory === 'Mobile Bill Allowance' ||
      Boolean(e.salaryPaymentType)
  );

  // Per-staff month breakdown helper
  const getStaffMonthBreakdown = (s: OfficeStaff, targetMonth: string) => {
    const base = Number(s.monthlySalary || s.dailyRate || 0);
    const logs = salaryExpenseLogs.filter((e) => {
      const sameStaff =
        e.staffId === s.id || e.supplierPayee.toLowerCase() === s.name.toLowerCase();
      if (!sameStaff) return false;
      return (
        e.salaryMonth === targetMonth ||
        (e.description && e.description.toLowerCase().includes(targetMonth.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(targetMonth.toLowerCase()))
      );
    });
    let salaryPaid = 0;
    let advancePaid = 0;
    for (const l of logs) {
      const isAdv =
        l.salaryPaymentType === 'Salary Advance' ||
        l.description.toLowerCase().includes('advance') ||
        l.description.includes('অগ্রিম');
      if (isAdv) advancePaid += Number(l.amount || 0);
      else salaryPaid += Number(l.amount || 0);
    }
    const totalPaidInMonth = salaryPaid + advancePaid;
    const dueInMonth = Math.max(0, base - totalPaidInMonth);
    return { base, salaryPaid, advancePaid, totalPaidInMonth, dueInMonth };
  };

  // KPI calculations
  const totalMonthlySalaries = staff
    .filter((s) => s.status === 'Active')
    .reduce((sum, s) => sum + s.monthlySalary, 0);

  const totalAdvancePaid = staff.reduce((sum, s) => sum + (s.totalAdvancePaid || 0), 0);
  const totalSalaryDisbursed = staff.reduce((sum, s) => sum + (s.totalSalaryPaid || 0), 0);

  const totalAssetValuation = assets.reduce((sum, a) => sum + a.purchaseCost, 0);

  const unpaidBills = bills.filter((b) => b.status === 'Unpaid');
  const totalUnpaidBillsAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  // Filtered staff
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered salary logs
  const filteredSalaryLogs = salaryExpenseLogs.filter(
    (e) =>
      e.supplierPayee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.salaryMonth && e.salaryMonth.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filtered assets
  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filtered bills
  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      b.billType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.billingMonth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN'
                ? 'Office, Staff Payroll & Asset Management'
                : 'অফিস, কর্মকর্তা বেতন ও সরঞ্জামাদি ব্যবস্থাপনা'}
            </h2>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono">
              12_Office_Staff_Bills
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Previous month full/partial salary, running month advance, bulk payroll, equipment & office bills'
              : 'আগের মাসের ফুল/আংশিক বেতন, চলতি মাসের অগ্রিম, একসাথে সব বেতন প্রদান ও অফিস হিসাব'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onImportStaff && (
            <CategoryImportButton
              category="staff"
              language={language}
              existingIds={staff.map((s) => s.id)}
              onImportRecords={onImportStaff}
            />
          )}
          {(activeTab === 'staff' || activeTab === 'salary_logs') && (
            <>
              <button
                onClick={() => onOpenSalaryPayment(undefined, false)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {language === 'EN'
                    ? 'Salary / Advance (Full or Partial)'
                    : 'বেতন ও অগ্রিম প্রদান (ফুল / অল্প অল্প)'}
                </span>
              </button>
              <button
                onClick={() => onOpenSalaryPayment(undefined, true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>
                  {language === 'EN' ? 'Pay All Salaries Together' : 'সব বেতন একসাথে দিন'}
                </span>
              </button>
              <button
                onClick={onAddStaff}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'EN' ? 'Add Staff Member' : 'নতুন কর্মকর্তা যোগ +'}</span>
              </button>
            </>
          )}

          {activeTab === 'assets' && (
            <button
              onClick={onAddAsset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'EN' ? 'Register Office Asset' : 'নতুন সম্পদ এন্ট্রি +'}</span>
            </button>
          )}

          {activeTab === 'bills' && (
            <button
              onClick={onAddBill}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'EN' ? 'Record Office Bill' : 'নতুন বিল এন্ট্রি +'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Monthly Office Payroll' : 'মাসিক কর্মকর্তা বেতন বাজেট'}
          </span>
          <span className="text-lg font-bold font-mono text-white">
            {formatCurrency(totalMonthlySalaries, settings.currencySymbol)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {staff.filter((s) => s.status === 'Active').length} Active Permanent Staff
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Salary & Advances Paid' : 'মোট পরিশোধিত বেতন ও অগ্রিম'}
          </span>
          <span className="text-lg font-bold font-mono text-emerald-300">
            {formatCurrency(totalSalaryDisbursed + totalAdvancePaid, settings.currencySymbol)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            বেতন: {formatCurrency(totalSalaryDisbursed, settings.currencySymbol)} | অগ্রিম:{' '}
            {formatCurrency(totalAdvancePaid, settings.currencySymbol)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Studio Asset Valuation' : 'অফিস সরঞ্জাম ও মেশিনারিজ মূল্য'}
          </span>
          <span className="text-lg font-bold font-mono text-indigo-300">
            {formatCurrency(totalAssetValuation, settings.currencySymbol)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {assets.length} Registered Equipment
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Unpaid Office Bills' : 'অফিসের বাকি বিল সমূহ'}
          </span>
          <span
            className={`text-lg font-bold font-mono ${
              totalUnpaidBillsAmount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(totalUnpaidBillsAmount, settings.currencySymbol)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {unpaidBills.length} Bills Pending Clearance
          </span>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('staff');
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            👥{' '}
            {language === 'EN'
              ? `Staff & Payroll (${staff.length})`
              : `কর্মকর্তা ও বেতন হিসাব (${staff.length})`}
          </button>
          <button
            onClick={() => {
              setActiveTab('salary_logs');
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'salary_logs'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            💵{' '}
            {language === 'EN'
              ? `Salary & Advance Logs (${salaryExpenseLogs.length})`
              : `বেতন ও অগ্রিম লগ (${salaryExpenseLogs.length})`}
          </button>
          <button
            onClick={() => {
              setActiveTab('assets');
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🖥️{' '}
            {language === 'EN'
              ? `Equipment & Assets (${assets.length})`
              : `অফিস সম্পদ ও যন্ত্রপাতি (${assets.length})`}
          </button>
          <button
            onClick={() => {
              setActiveTab('bills');
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'bills'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🧾{' '}
            {language === 'EN'
              ? `Office Bills & Rent (${bills.length})`
              : `অফিস বিল ও ভাড়া (${bills.length})`}
          </button>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'staff'
                  ? language === 'EN'
                    ? 'Search staff, role, phone...'
                    : 'কর্মকর্তার নাম, পদবি খুঁজুন...'
                  : activeTab === 'salary_logs'
                  ? language === 'EN'
                    ? 'Search staff, month, note...'
                    : 'নাম বা মাসের নাম খুঁজুন...'
                  : activeTab === 'assets'
                  ? language === 'EN'
                    ? 'Search equipment, serial...'
                    : 'সরঞ্জাম, সিরিয়াল নং খুঁজুন...'
                  : language === 'EN'
                  ? 'Search bill type, month...'
                  : 'বিলের খাত, মাস খুঁজুন...'
              }
              className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-52"
            />
          </div>

          {activeTab === 'staff' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">{language === 'EN' ? 'All Status' : 'সকল স্ট্যাটাস'}</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
            </select>
          )}

          {activeTab === 'bills' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">{language === 'EN' ? 'All Bills' : 'সকল বিল'}</option>
              <option value="Unpaid">{language === 'EN' ? 'Unpaid Only' : 'শুধু বাকি'}</option>
              <option value="Paid">{language === 'EN' ? 'Paid Only' : 'শুধু পরিশোধিত'}</option>
            </select>
          )}
        </div>
      </div>

      {/* Tab 1: Staff */}
      {activeTab === 'staff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Staff ID & Name</th>
                  <th className="py-3 px-3">Designation & Dept</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3 text-right">
                    {language === 'EN' ? 'Base Salary' : 'মাসিক বেতন'}
                  </th>
                  <th className="py-3 px-3 text-right">
                    {language === 'EN'
                      ? `Prev Month (${prevMonthName})`
                      : `আগের মাস (${prevMonthName})`}
                  </th>
                  <th className="py-3 px-3 text-right">
                    {language === 'EN'
                      ? `Running Month (${runningMonthName})`
                      : `চলতি মাস (${runningMonthName})`}
                  </th>
                  <th className="py-3 px-3 text-right">
                    {language === 'EN' ? 'Total Disbursed' : 'মোট পরিশোধ ও অগ্রিম'}
                  </th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      {language === 'EN'
                        ? 'No staff members found matching criteria'
                        : 'কোনো কর্মকর্তা পাওয়া যায়নি'}
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((s) => {
                    const pType = s.paymentType || 'Monthly Salary';
                    const prevStats = getStaffMonthBreakdown(s, prevMonthName);
                    const runStats = getStaffMonthBreakdown(s, runningMonthName);

                    return (
                      <tr key={s.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white text-sm">{s.name}</div>
                          <span className="font-mono text-[10px] text-indigo-400 font-semibold">
                            {s.id}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-slate-200 font-medium">{s.role}</div>
                          <div className="text-[10px] text-slate-400">
                            {s.department || 'Design Studio'}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 space-y-0.5">
                          <div className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-500" />
                            <span>{s.phone}</span>
                          </div>
                          {s.email && (
                            <div className="text-slate-500 text-[10px] flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5 text-slate-500" />
                              <span>{s.email}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono">
                          {pType === 'Daily Wage' ? (
                            <div>
                              <span className="font-bold text-sky-300 text-xs">
                                {formatCurrency(s.dailyRate || 0, settings.currencySymbol)} / দিন
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-white text-sm">
                                {formatCurrency(s.monthlySalary, settings.currencySymbol)}
                              </span>
                              <div className="text-[10px] text-slate-500">
                                {pType === 'Contract Based' ? 'মোট চুক্তি' : 'প্রতি মাস'}
                              </div>
                            </div>
                          )}
                        </td>
                        {/* Previous Month Status */}
                        <td className="py-3.5 px-3 text-right font-mono text-xs">
                          <div className="text-emerald-300 font-bold">
                            প্রদান: {formatCurrency(prevStats.totalPaidInMonth, settings.currencySymbol)}
                          </div>
                          <div
                            className={`text-[10px] font-semibold ${
                              prevStats.dueInMonth > 0 ? 'text-amber-300' : 'text-emerald-400'
                            }`}
                          >
                            {prevStats.dueInMonth > 0
                              ? `বকেয়া: ${formatCurrency(prevStats.dueInMonth, settings.currencySymbol)}`
                              : 'সম্পূর্ণ পরিশোধ'}
                          </div>
                        </td>
                        {/* Running Month Status */}
                        <td className="py-3.5 px-3 text-right font-mono text-xs">
                          <div className="text-sky-300 font-bold">
                            প্রদান: {formatCurrency(runStats.totalPaidInMonth, settings.currencySymbol)}
                          </div>
                          {runStats.advancePaid > 0 && (
                            <div className="text-[10px] text-purple-300">
                              অগ্রিম: {formatCurrency(runStats.advancePaid, settings.currencySymbol)}
                            </div>
                          )}
                          <div
                            className={`text-[10px] font-semibold ${
                              runStats.dueInMonth > 0 ? 'text-rose-300' : 'text-emerald-400'
                            }`}
                          >
                            {runStats.dueInMonth > 0
                              ? `বাকি: ${formatCurrency(runStats.dueInMonth, settings.currencySymbol)}`
                              : 'পরিশোধিত'}
                          </div>
                        </td>
                        {/* Total Disbursed */}
                        <td className="py-3.5 px-3 text-right font-mono text-xs">
                          <div className="text-emerald-400 font-bold text-sm">
                            {formatCurrency(
                              (s.totalSalaryPaid || 0) + (s.totalAdvancePaid || 0),
                              settings.currencySymbol
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            বেতন: {formatCurrency(s.totalSalaryPaid || 0, settings.currencySymbol)}
                            {(s.totalAdvancePaid || 0) > 0 &&
                              ` | অগ্রিম: ${formatCurrency(
                                s.totalAdvancePaid || 0,
                                settings.currencySymbol
                              )}`}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenSalaryPayment(s, false)}
                              title={
                                language === 'EN'
                                  ? 'Pay Previous Month / Running Salary / Advance'
                                  : 'বেতন বা অগ্রিম দিন (ফুল / অল্প অল্প)'
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              <span>বেতন দিন</span>
                            </button>
                            <button
                              onClick={() => onEditStaff(s)}
                              title={language === 'EN' ? 'Edit Staff Profile' : 'সংশোধন করুন'}
                              className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteStaff(s.id)}
                              title={language === 'EN' ? 'Delete Staff Member' : 'মুছে ফেলুন'}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Salary & Advance Payment History Log */}
      {activeTab === 'salary_logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Date & Voucher</th>
                  <th className="py-3 px-3">Staff Name</th>
                  <th className="py-3 px-3">Month & Type</th>
                  <th className="py-3 px-3">Method & Ref</th>
                  <th className="py-3 px-3">Remarks / Notes</th>
                  <th className="py-3 px-3 text-right">Amount Paid</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSalaryLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      {language === 'EN'
                        ? 'No salary or advance payment records yet'
                        : 'এখনো কোনো বেতন বা অগ্রিম প্রদানের লগ নেই'}
                    </td>
                  </tr>
                ) : (
                  filteredSalaryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{formatDate(log.date)}</div>
                        <span className="font-mono text-[10px] text-emerald-400">{log.id}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">{log.supplierPayee}</td>
                      <td className="py-3 px-3">
                        <div className="text-slate-200 font-semibold">
                          {log.salaryMonth || log.description}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 inline-block mt-0.5">
                          {log.salaryPaymentType || log.expenseCategory}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        <div>{log.paymentMethod}</div>
                        <span className="text-[10px] text-slate-500">{log.billInvoiceNumber}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{log.notes || log.description}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                        {formatCurrency(log.amount, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onEditExpense && (
                            <button
                              onClick={() => onEditExpense(log)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                              title={language === 'EN' ? 'Edit Salary Voucher' : 'বেতন ভাউচার এডিট করুন'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteExpense && (
                            <button
                              onClick={() => onDeleteExpense(log)}
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer"
                              title={language === 'EN' ? 'Delete Salary Voucher' : 'বেতন ভাউচার মুছে ফেলুন'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Assets */}
      {activeTab === 'assets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Asset ID & Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Purchase Cost</th>
                  <th className="py-3 px-3">Purchase Date</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Assigned To</th>
                  <th className="py-3 px-3">Serial No</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      {language === 'EN'
                        ? 'No equipment found'
                        : 'কোনো সম্পদ বা সরঞ্জাম পাওয়া যায়নি'}
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">{a.assetName}</div>
                        <span className="font-mono text-[10px] text-indigo-400 font-semibold">
                          {a.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{a.category}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                        {formatCurrency(a.purchaseCost, settings.currencySymbol)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 font-mono">
                        {formatDate(a.purchaseDate)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                          {a.condition}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{a.assignedTo}</td>
                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {a.serialNumber}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditAsset(a)}
                            title={language === 'EN' ? 'Edit Asset' : 'সংশোধন করুন'}
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteAsset(a.id)}
                            title={language === 'EN' ? 'Delete Asset' : 'মুছে ফেলুন'}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
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
      )}

      {/* Tab 4: Bills */}
      {activeTab === 'bills' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Bill ID & Type</th>
                  <th className="py-3 px-3">Billing Month</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Payment Info</th>
                  <th className="py-3 px-3 text-center">Status Action</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      {language === 'EN'
                        ? 'No bills found matching criteria'
                        : 'কোনো বিল পাওয়া যায়নি'}
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">{b.billType}</div>
                        <span className="font-mono text-[10px] text-amber-400 font-semibold">
                          {b.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-200 font-medium">{b.billingMonth}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-300 text-sm">
                        {formatCurrency(b.amount, settings.currencySymbol)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono">
                        {formatDate(b.dueDate)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {b.status === 'Paid'
                            ? language === 'EN'
                              ? 'Paid'
                              : 'পরিশোধিত'
                            : language === 'EN'
                            ? 'Unpaid'
                            : 'বাকি আছে'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                        {b.notes ||
                          (b.paidDate ? `Paid on ${formatDate(b.paidDate)}` : 'Pending Clearance')}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onToggleBillStatus(b.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                            b.status === 'Paid'
                              ? 'bg-slate-800 text-slate-400 hover:text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          {b.status === 'Paid'
                            ? language === 'EN'
                              ? 'Mark Unpaid'
                              : 'বাকি করুন'
                            : language === 'EN'
                            ? 'Mark as Paid'
                            : 'পরিশোধ চিহ্নিত'}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditBill(b)}
                            title={language === 'EN' ? 'Edit Bill' : 'সংশোধন করুন'}
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteBill(b.id)}
                            title={language === 'EN' ? 'Delete Bill' : 'মুছে ফেলুন'}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
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
      )}
    </div>
  );
};
