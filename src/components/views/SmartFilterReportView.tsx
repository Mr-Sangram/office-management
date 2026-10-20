/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Filter,
  Search,
  HardHat,
  User,
  Car,
  Receipt,
  Calendar,
  DollarSign,
  Printer,
  Download,
  Building2,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  ChevronDown
} from 'lucide-react';
import {
  Worker,
  LabourAttendance,
  OfficeStaff,
  ExpenseItem,
  OfficeBill,
  Project,
  CompanySettings
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface SmartFilterReportViewProps {
  workers: Worker[];
  attendance: LabourAttendance[];
  staff: OfficeStaff[];
  expenses: ExpenseItem[];
  bills: OfficeBill[];
  projects: Project[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
}

type FilterCategory = 'worker' | 'staff' | 'conveyance' | 'bills';

export const SmartFilterReportView: React.FC<SmartFilterReportViewProps> = ({
  workers,
  attendance,
  staff,
  expenses,
  bills,
  projects,
  settings,
  language,
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('worker');

  // Worker filter states
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('ALL');
  const [workerDateFrom, setWorkerDateFrom] = useState<string>('');
  const [workerDateTo, setWorkerDateTo] = useState<string>('');

  // Staff filter states
  const [selectedStaffId, setSelectedStaffId] = useState<string>('ALL');
  const [staffMonthFilter, setStaffMonthFilter] = useState<string>('ALL');

  // Conveyance filter states
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [conveyanceModeFilter, setConveyanceModeFilter] = useState<string>('ALL');
  const [conveyanceDateFrom, setConveyanceDateFrom] = useState<string>('');
  const [conveyanceDateTo, setConveyanceDateTo] = useState<string>('');

  // Bills filter states
  const [selectedBillType, setSelectedBillType] = useState<string>('ALL');
  const [selectedBillMonth, setSelectedBillMonth] = useState<string>('ALL');
  const [billStatusFilter, setBillStatusFilter] = useState<'ALL' | 'Paid' | 'Unpaid'>('ALL');

  // Unique lists for dropdowns
  const uniqueMonths = useMemo(() => {
    const months = new Set<string>();
    bills.forEach((b) => {
      if (b.billingMonth) months.add(b.billingMonth);
    });
    // Add expenses months if available
    expenses.forEach((e) => {
      if (e.date) {
        const d = new Date(e.date);
        const m = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        months.add(m);
      }
    });
    return Array.from(months);
  }, [bills, expenses]);

  // 1. Worker calculations & filtered attendance
  const filteredWorkerAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const matchWorker = selectedWorkerId === 'ALL' || a.workerId === selectedWorkerId;
      const matchFrom = !workerDateFrom || a.attendanceDate >= workerDateFrom;
      const matchTo = !workerDateTo || a.attendanceDate <= workerDateTo;
      return matchWorker && matchFrom && matchTo;
    }).sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
  }, [attendance, selectedWorkerId, workerDateFrom, workerDateTo]);

  const workerSummary = useMemo(() => {
    const totalWagesEarned = filteredWorkerAttendance.reduce((sum, a) => sum + a.labourCost, 0);
    const totalCashPaid = filteredWorkerAttendance.reduce((sum, a) => sum + a.amountPaid, 0);
    const totalOutstanding = filteredWorkerAttendance.reduce((sum, a) => sum + a.outstandingSalary, 0);
    const totalDays = filteredWorkerAttendance.filter((a) => a.status === 'Present').length;
    const totalOvertimeHours = filteredWorkerAttendance.reduce((sum, a) => sum + a.overtimeHours, 0);

    return { totalWagesEarned, totalCashPaid, totalOutstanding, totalDays, totalOvertimeHours };
  }, [filteredWorkerAttendance]);

  // 2. Staff Salary & Advance calculations
  // Expenses that represent staff salary or advance or mobile allowance
  const filteredStaffExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const isStaffExpense =
        e.expenseCategory === 'Staff Salaries & Advances' ||
        e.expenseCategory === 'Staff Salary & Payroll' ||
        e.expenseCategory === 'Mobile Bill Allowance' ||
        (e.description && e.description.toLowerCase().includes('salary')) ||
        (e.description && e.description.toLowerCase().includes('advance'));

      if (!isStaffExpense) return false;

      const matchStaff =
        selectedStaffId === 'ALL' ||
        e.supplierPayee === selectedStaffId ||
        (e.description && selectedStaffId !== 'ALL' && staff.some((s) => s.id === selectedStaffId && e.description.includes(s.name)));

      const matchMonth =
        staffMonthFilter === 'ALL' ||
        (e.date && new Date(e.date).toLocaleString('en-US', { month: 'long', year: 'numeric' }) === staffMonthFilter);

      return matchStaff && matchMonth;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, selectedStaffId, staffMonthFilter, staff]);

  const targetStaffMember = staff.find((s) => s.id === selectedStaffId);

  // 3. Project Conveyance calculations
  const filteredConveyance = useMemo(() => {
    return expenses.filter((e) => {
      const isConveyance =
        e.isDailyCost ||
        e.expenseCategory === 'Conveyance & Transport' ||
        e.expenseCategory === 'Site Visit & Inspection' ||
        (e.dailySubcategory && e.dailySubcategory.includes('Conveyance'));

      if (!isConveyance) return false;

      const matchProject = selectedProjectId === 'ALL' || e.projectId === selectedProjectId;
      const matchMode = conveyanceModeFilter === 'ALL' || e.conveyanceMode === conveyanceModeFilter;
      const matchFrom = !conveyanceDateFrom || e.date >= conveyanceDateFrom;
      const matchTo = !conveyanceDateTo || e.date <= conveyanceDateTo;

      return matchProject && matchMode && matchFrom && matchTo;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, selectedProjectId, conveyanceModeFilter, conveyanceDateFrom, conveyanceDateTo]);

  const totalConveyanceSpent = filteredConveyance.reduce((sum, e) => sum + e.amount, 0);

  // 4. Office Bills & Mobile Bills calculations
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const matchType = selectedBillType === 'ALL' || b.billType === selectedBillType;
      const matchMonth = selectedBillMonth === 'ALL' || b.billingMonth === selectedBillMonth;
      const matchStatus = billStatusFilter === 'ALL' || b.status === billStatusFilter;
      return matchType && matchMonth && matchStatus;
    }).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  }, [bills, selectedBillType, selectedBillMonth, billStatusFilter]);

  const totalBillsAmount = filteredBills.reduce((sum, b) => sum + b.amount, 0);
  const totalBillsPaid = filteredBills.filter((b) => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalBillsUnpaid = filteredBills.filter((b) => b.status === 'Unpaid').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-amber-400" />
              <span>{language === 'EN' ? 'Smart Multi-Filter & Audit Hub' : 'স্মার্ট ফিল্টার ও কস্ট অডিট সেন্টার'}</span>
            </h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
              Deep_Audit_Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Deep-dive audit by Worker wages, Staff salary/advance, Project conveyance, and Mobile/utility bills.'
              : 'লেবার ভিত্তিক মোট খরচ, কর্মকর্তার বেতন ও অগ্রিম, প্রজেক্ট ভিত্তিক যাতায়াত এবং মোবাইল বিলের বিস্তারিত ডেট-ভিত্তিক রিপোর্ট।'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 shadow-md transition self-start md:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>{language === 'EN' ? 'Print Statement' : 'রিপোর্ট প্রিন্ট করুন'}</span>
        </button>
      </div>

      {/* Main 4 Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveCategory('worker')}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
            activeCategory === 'worker'
              ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeCategory === 'worker' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400'}`}>
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">{language === 'EN' ? 'Labour Wages' : 'লেবার ভিত্তিক অডিট'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{workers.length} Workers Enrolled</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('staff')}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
            activeCategory === 'staff'
              ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeCategory === 'staff' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-indigo-400'}`}>
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">{language === 'EN' ? 'Staff Salary & Advance' : 'কর্মকর্তার বেতন ও অগ্রিম'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{staff.length} Permanent Staff</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('conveyance')}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
            activeCategory === 'conveyance'
              ? 'bg-teal-500/10 border-teal-500 text-white shadow-lg shadow-teal-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeCategory === 'conveyance' ? 'bg-teal-600 text-white font-bold' : 'bg-slate-800 text-teal-400'}`}>
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">{language === 'EN' ? 'Project Conveyance' : 'প্রজেক্ট যাতায়াত খরচ'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{projects.length} Project Sites</div>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('bills')}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
            activeCategory === 'bills'
              ? 'bg-rose-500/10 border-rose-500 text-white shadow-lg shadow-rose-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeCategory === 'bills' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-800 text-rose-400'}`}>
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">{language === 'EN' ? 'Mobile & Utility Bills' : 'মোবাইল বিল ও ইউটিলিটি'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{bills.length} Bills Tracked</div>
          </div>
        </button>
      </div>

      {/* CATEGORY 1: WORKER / LABOUR WAGES AUDIT */}
      {activeCategory === 'worker' && (
        <div className="space-y-4">
          {/* Worker Filter Controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'EN' ? 'Select Labour / Worker *' : 'লেবার / মিস্ত্রির নাম সিলেক্ট করুন *'}</span>
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="ALL">{language === 'EN' ? 'All Workers (সকল মিস্ত্রি)' : 'সকল মিস্ত্রি ও লেবার'}</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.skillTrade}) - Daily: ৳{w.dailyRate}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'EN' ? 'From Date' : 'তারিখ থেকে'}</span>
              </label>
              <input
                type="date"
                value={workerDateFrom}
                onChange={(e) => setWorkerDateFrom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'EN' ? 'To Date' : 'তারিখ পর্যন্ত'}</span>
              </label>
              <input
                type="date"
                value={workerDateTo}
                onChange={(e) => setWorkerDateTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Worker KPI Stats Card */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Total Wages Earned' : 'মোট উপার্জিত মজুরি'}
              </span>
              <span className="text-lg font-bold font-mono text-white">
                {formatCurrency(workerSummary.totalWagesEarned, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{workerSummary.totalDays} Days Present</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Total Cash Paid' : 'মোট পরিশোধিত টাকা'}
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {formatCurrency(workerSummary.totalCashPaid, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-emerald-500/80 block mt-0.5">Cash / Advance Disbursed</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Outstanding Dues' : 'মোট বাকি পাওনা'}
              </span>
              <span className={`text-lg font-bold font-mono ${workerSummary.totalOutstanding > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatCurrency(workerSummary.totalOutstanding, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">To be paid</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Total Overtime' : 'মোট ওভারটাইম'}
              </span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {workerSummary.totalOvertimeHours} hrs
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Extra Site Hours</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Entries Found' : 'হাজিরা রেকর্ড সংখ্যা'}
              </span>
              <span className="text-lg font-bold font-mono text-indigo-300">
                {filteredWorkerAttendance.length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Filtered Records</span>
            </div>
          </div>

          {/* Date-wise Worker Ledger Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'EN' ? 'Date-wise Labour Attendance & Wage Ledger' : 'তারিখভিত্তিক হাজিরা ও মজুরি লেজার'}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredWorkerAttendance.length} records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Worker Name & Trade</th>
                    <th className="py-3 px-3">Project Site</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Daily Rate</th>
                    <th className="py-3 px-3 text-right">OT Hours</th>
                    <th className="py-3 px-3 text-right">Day Wage</th>
                    <th className="py-3 px-3 text-right">Paid Today</th>
                    <th className="py-3 px-3 text-right">Due Balance</th>
                    <th className="py-3 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredWorkerAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        {language === 'EN' ? 'No attendance records found for selected filter' : 'কোনো হাজিরার রেকর্ড পাওয়া যায়নি'}
                      </td>
                    </tr>
                  ) : (
                    filteredWorkerAttendance.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-3 font-mono text-slate-300 font-semibold">{formatDate(att.attendanceDate)}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{att.workerName}</div>
                          <span className="text-[10px] text-slate-400">{att.skillTrade}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{att.projectName}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              att.status === 'Present'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : att.status === 'Half Day'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">৳{att.baseRate}</td>
                        <td className="py-3 px-3 text-right font-mono text-amber-300">
                          {att.overtimeHours > 0 ? `${att.overtimeHours}h` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          {formatCurrency(att.labourCost, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                          {formatCurrency(att.amountPaid, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                          {formatCurrency(att.outstandingSalary, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">{att.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 2: STAFF SALARY & ADVANCE AUDIT */}
      {activeCategory === 'staff' && (
        <div className="space-y-4">
          {/* Staff Filter Controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'EN' ? 'Select Staff Member *' : 'কর্মকর্তার নাম সিলেক্ট করুন *'}</span>
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="ALL">{language === 'EN' ? 'All Staff Members (সকল কর্মকর্তা)' : 'সকল কর্মকর্তা ও কর্মী'}</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role}) - Base Salary: ৳{s.monthlySalary}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'EN' ? 'Filter by Month' : 'মাস নির্বাচন করুন'}</span>
              </label>
              <select
                value={staffMonthFilter}
                onChange={(e) => setStaffMonthFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">{language === 'EN' ? 'All Months (সকল মাস)' : 'সকল মাস'}</option>
                {uniqueMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Staff Profile Banner */}
          {targetStaffMember && (
            <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 border border-indigo-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{targetStaffMember.name}</h3>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                    {targetStaffMember.id}
                  </span>
                  <span className="text-xs text-slate-400">({targetStaffMember.role})</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 font-mono">
                  <span>Phone: {targetStaffMember.phone}</span>
                  <span>Dept: {targetStaffMember.department || 'Design Studio'}</span>
                  <span>Joined: {formatDate(targetStaffMember.joinDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Monthly Base Salary</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {formatCurrency(targetStaffMember.monthlySalary, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Date-wise Staff Salary Payout Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'EN' ? 'Staff Salary & Advance Disbursal Records' : 'কর্মকর্তার বেতন ও অগ্রিম প্রদানের রেকর্ডসমূহ'}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredStaffExpenses.length} transactions
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Staff Name / Payee</th>
                    <th className="py-3 px-3">Expense Category</th>
                    <th className="py-3 px-3">Description / Month</th>
                    <th className="py-3 px-3 text-right">Amount Disbursed</th>
                    <th className="py-3 px-3">Payment Method</th>
                    <th className="py-3 px-3">Trx / Ref No</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredStaffExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        {language === 'EN' ? 'No salary or advance records found for selected criteria' : 'কোনো বেতন বা অগ্রিমের রেকর্ড পাওয়া যায়নি'}
                      </td>
                    </tr>
                  ) : (
                    filteredStaffExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-3 font-mono text-slate-300 font-semibold">{formatDate(exp.date)}</td>
                        <td className="py-3 px-3 font-bold text-white">{exp.supplierPayee}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                            {exp.expenseCategory}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{exp.description}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                          {formatCurrency(exp.amount, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-[11px]">{exp.paymentMethod}</td>
                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{exp.billInvoiceNumber || '-'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                            {exp.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: PROJECT CONVEYANCE & SITE TRAVEL AUDIT */}
      {activeCategory === 'conveyance' && (
        <div className="space-y-4">
          {/* Conveyance Filter Controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <span>{language === 'EN' ? 'Project Site *' : 'প্রজেক্ট সাইট *'}</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-semibold"
              >
                <option value="ALL">{language === 'EN' ? 'All Projects (সকল প্রজেক্ট)' : 'সকল প্রজেক্ট সাইট'}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-teal-400" />
                <span>{language === 'EN' ? 'Vehicle Mode' : 'যাতায়াত বাহন'}</span>
              </label>
              <select
                value={conveyanceModeFilter}
                onChange={(e) => setConveyanceModeFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">{language === 'EN' ? 'All Vehicles' : 'সকল বাহন'}</option>
                <option value="Rickshaw">Rickshaw (রিকশা)</option>
                <option value="CNG">CNG (সিএনজি)</option>
                <option value="Uber / Pathao">Uber / Pathao</option>
                <option value="Bike Fuel">Bike Fuel (বাইক তেল)</option>
                <option value="Bus">Bus (বাস)</option>
                <option value="Metro Rail">Metro Rail</option>
                <option value="Van">Van / Porter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'EN' ? 'From Date' : 'তারিখ থেকে'}</span>
              </label>
              <input
                type="date"
                value={conveyanceDateFrom}
                onChange={(e) => setConveyanceDateFrom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'EN' ? 'To Date' : 'তারিখ পর্যন্ত'}</span>
              </label>
              <input
                type="date"
                value={conveyanceDateTo}
                onChange={(e) => setConveyanceDateTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Conveyance KPI Stats Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Total Conveyance Spent' : 'মোট যাতায়াত ও সাইট ভিজিট খরচ'}
              </span>
              <span className="text-xl font-bold font-mono text-teal-300">
                {formatCurrency(totalConveyanceSpent, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {filteredConveyance.length} Site Trips Logged
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Selected Project' : 'নির্বাচিত প্রজেক্ট'}
              </span>
              <span className="text-sm font-bold text-white truncate block">
                {selectedProjectId === 'ALL'
                  ? 'All Projects'
                  : projects.find((p) => p.id === selectedProjectId)?.projectName || selectedProjectId}
              </span>
              <span className="text-[10px] text-teal-400 block mt-0.5">Direct Site Transportation</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Average Cost per Trip' : 'গড় ট্রিপ খরচ'}
              </span>
              <span className="text-lg font-bold font-mono text-white">
                {formatCurrency(
                  filteredConveyance.length > 0 ? totalConveyanceSpent / filteredConveyance.length : 0,
                  settings.currencySymbol
                )}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Per site inspection</span>
            </div>
          </div>

          {/* Date-wise Conveyance Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-teal-400" />
                <span>{language === 'EN' ? 'Date-wise Project Conveyance Statement' : 'তারিখভিত্তিক যাতায়াত ও পরিদর্শনের তালিকা'}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredConveyance.length} trips
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Project Site</th>
                    <th className="py-3 px-3">Spent By / Traveler</th>
                    <th className="py-3 px-3">Vehicle Mode</th>
                    <th className="py-3 px-3">Travel Route</th>
                    <th className="py-3 px-3">Purpose / Notes</th>
                    <th className="py-3 px-3 text-right">Cost (৳)</th>
                    <th className="py-3 px-3">Payment Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredConveyance.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        {language === 'EN' ? 'No conveyance entries match your filters' : 'কোনো যাতায়াত খরচ পাওয়া যায়নি'}
                      </td>
                    </tr>
                  ) : (
                    filteredConveyance.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-3 font-mono text-slate-300 font-semibold">{formatDate(c.date)}</td>
                        <td className="py-3 px-3 font-bold text-white">{c.projectName || c.projectId}</td>
                        <td className="py-3 px-3 text-slate-300">{c.spentBy || c.supplierPayee}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            {c.conveyanceMode || 'Transport'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-[11px]">{c.travelRoute || '-'}</td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">{c.description}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-teal-300 text-sm">
                          {formatCurrency(c.amount, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">{c.paymentMethod}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 4: MOBILE BILLS & OFFICE UTILITIES AUDIT */}
      {activeCategory === 'bills' && (
        <div className="space-y-4">
          {/* Bills Filter Controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'EN' ? 'Bill Type / Category' : 'বিলের খাত'}</span>
              </label>
              <select
                value={selectedBillType}
                onChange={(e) => setSelectedBillType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
              >
                <option value="ALL">{language === 'EN' ? 'All Bill Types (সকল বিল)' : 'সকল বিল ও ইউটিলিটি'}</option>
                {(settings.billTypes || [
                  'Office Lease Rent (অফিস ভাড়া)',
                  'Electricity & Water (ডেসকো/ওয়াসা)',
                  'High-Speed Internet & Fiber',
                  'Mobile Bill Allowance (মোবাইল বিল ভাতা)',
                  'Software Subscriptions (AutoCAD / 3Ds Max / Cloud)',
                ]).map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'EN' ? 'Billing Month' : 'বিলিং মাস'}</span>
              </label>
              <select
                value={selectedBillMonth}
                onChange={(e) => setSelectedBillMonth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">{language === 'EN' ? 'All Months' : 'সকল মাস'}</option>
                {uniqueMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Payment Status' : 'পরিশোধের স্ট্যাটাস'}
              </label>
              <select
                value={billStatusFilter}
                onChange={(e) => setBillStatusFilter(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">{language === 'EN' ? 'All (সবগুলো)' : 'সবগুলো'}</option>
                <option value="Unpaid">{language === 'EN' ? 'Unpaid / Due Only' : 'শুধু বাকি'}</option>
                <option value="Paid">{language === 'EN' ? 'Paid Only' : 'শুধু পরিশোধিত'}</option>
              </select>
            </div>
          </div>

          {/* Bills KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Total Bill Amount' : 'মোট বিলের পরিমাণ'}
              </span>
              <span className="text-xl font-bold font-mono text-white">
                {formatCurrency(totalBillsAmount, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{filteredBills.length} Bills Total</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Total Paid Bills' : 'পরিশোধিত বিলের পরিমাণ'}
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatCurrency(totalBillsPaid, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-emerald-500/80 block mt-0.5">Cleared</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
                {language === 'EN' ? 'Pending Unpaid Bills' : 'বকেয়া বিলের পরিমাণ'}
              </span>
              <span className={`text-xl font-bold font-mono ${totalBillsUnpaid > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatCurrency(totalBillsUnpaid, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-rose-400/80 block mt-0.5">Due for payment</span>
            </div>
          </div>

          {/* Bills List Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'EN' ? 'Monthly Utility & Mobile Bill Records' : 'মাসিক ইউটিলিটি ও মোবাইল বিলের তালিকা'}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredBills.length} records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Bill ID & Type</th>
                    <th className="py-3 px-3">Billing Month</th>
                    <th className="py-3 px-3 text-right">Amount (৳)</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Payment Status</th>
                    <th className="py-3 px-3">Payment Info</th>
                    <th className="py-3 px-3">Remarks / Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        {language === 'EN' ? 'No utility or mobile bills match your search' : 'কোনো বিলের তথ্য পাওয়া যায়নি'}
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{bill.billType}</div>
                          <span className="font-mono text-[10px] text-amber-400">{bill.id}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{bill.billingMonth}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-300 text-sm">
                          {formatCurrency(bill.amount, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{formatDate(bill.dueDate)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              bill.status === 'Paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-[11px]">
                          {bill.paidDate ? `Paid on ${formatDate(bill.paidDate)} (${bill.paymentMethod || 'Bank'})` : 'Pending'}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">{bill.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
