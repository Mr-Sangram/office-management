/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  Save,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { OfficeStaff, CompanySettings, ExpenseItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export interface SalaryPaymentData {
  staffId: string;
  staffName: string;
  paymentType:
    | 'Monthly Salary'
    | 'Salary Advance'
    | 'Previous Month Salary'
    | 'Partial Salary'
    | 'Contract Payment'
    | 'Daily Payment'
    | 'Mobile Bill Allowance'
    | 'Festival Bonus / Incentive';
  month: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNo: string;
  notes: string;
}

interface SalaryPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: SalaryPaymentData) => void;
  onSaveBulk?: (payments: SalaryPaymentData[]) => void;
  staffList: OfficeStaff[];
  expenses?: ExpenseItem[];
  selectedStaff?: OfficeStaff | null;
  initialBulkMode?: boolean;
  settings: CompanySettings;
  language: 'EN' | 'BN';
}

export const SalaryPaymentModal: React.FC<SalaryPaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveBulk,
  staffList,
  expenses = [],
  selectedStaff,
  initialBulkMode = false,
  settings,
  language,
}) => {
  const now = new Date();
  const runningMonthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthName = prevDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthName = nextDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Generate recent 12 months list for easy selection
  const monthOptions: string[] = [];
  for (let offset = -6; offset <= 2; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    monthOptions.push(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  }

  const [disburseMode, setDisburseMode] = useState<'single' | 'bulk'>('single');
  const [targetStaffId, setTargetStaffId] = useState<string>('');
  const [paymentType, setPaymentType] =
    useState<SalaryPaymentData['paymentType']>('Monthly Salary');
  const [month, setMonth] = useState<string>(runningMonthName);
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    settings.paymentMethods?.[0] || 'Bank Transfer (BEFTN / NPSB)'
  );
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Bulk payment state: staffId -> { selected: boolean, amount: number, type: SalaryPaymentData['paymentType'] }
  const [bulkItems, setBulkItems] = useState<
    Record<
      string,
      {
        selected: boolean;
        amount: number;
        paymentType: SalaryPaymentData['paymentType'];
      }
    >
  >({});

  // Helper to calculate how much salary & advance a staff member was already paid for a given month
  const getStaffMonthStats = (staffMember: OfficeStaff | undefined, targetMonth: string) => {
    if (!staffMember) {
      return { baseSalary: 0, paidInMonth: 0, advanceInMonth: 0, totalReceivedInMonth: 0, remainingDue: 0 };
    }
    const baseSalary = Number(staffMember.monthlySalary || staffMember.dailyRate || 0);
    const matchingExpenses = expenses.filter((e) => {
      const isSameStaff =
        e.staffId === staffMember.id ||
        e.supplierPayee.toLowerCase() === staffMember.name.toLowerCase();
      if (!isSameStaff) return false;
      const isSalaryCat =
        e.expenseCategory === 'Staff Salaries & Advances' ||
        Boolean(e.salaryPaymentType);
      if (!isSalaryCat) return false;
      const matchesMonth =
        e.salaryMonth === targetMonth ||
        (e.description && e.description.toLowerCase().includes(targetMonth.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(targetMonth.toLowerCase()));
      return Boolean(matchesMonth);
    });

    let paidInMonth = 0;
    let advanceInMonth = 0;
    for (const exp of matchingExpenses) {
      const isAdv =
        exp.salaryPaymentType === 'Salary Advance' ||
        exp.description.toLowerCase().includes('advance') ||
        exp.description.includes('অগ্রিম');
      if (isAdv) {
        advanceInMonth += Number(exp.amount || 0);
      } else {
        paidInMonth += Number(exp.amount || 0);
      }
    }

    const totalReceivedInMonth = paidInMonth + advanceInMonth;
    const remainingDue = Math.max(0, baseSalary - totalReceivedInMonth);

    return {
      baseSalary,
      paidInMonth,
      advanceInMonth,
      totalReceivedInMonth,
      remainingDue,
    };
  };

  // Initialize bulk items whenever month or staffList changes
  const initBulkForMonth = (targetMonth: string, defaultType?: SalaryPaymentData['paymentType']) => {
    const nextBulk: Record<
      string,
      { selected: boolean; amount: number; paymentType: SalaryPaymentData['paymentType'] }
    > = {};
    const activeStaff = staffList.filter((s) => s.status === 'Active');
    for (const s of activeStaff) {
      const stats = getStaffMonthStats(s, targetMonth);
      const suggestedAmt = stats.remainingDue > 0 ? stats.remainingDue : s.monthlySalary;
      nextBulk[s.id] = {
        selected: stats.remainingDue > 0 || defaultType === 'Salary Advance',
        amount: suggestedAmt,
        paymentType:
          defaultType ||
          (targetMonth === prevMonthName ? 'Previous Month Salary' : 'Monthly Salary'),
      };
    }
    setBulkItems(nextBulk);
  };

  useEffect(() => {
    if (!isOpen) return;
    const mode = initialBulkMode ? 'bulk' : 'single';
    setDisburseMode(mode);

    const activeStaff = selectedStaff || staffList[0];
    const defaultMonth = runningMonthName;
    setMonth(defaultMonth);

    if (activeStaff) {
      setTargetStaffId(activeStaff.id);
      const stats = getStaffMonthStats(activeStaff, defaultMonth);
      setAmount(stats.remainingDue > 0 ? stats.remainingDue : activeStaff.monthlySalary);
      setPaymentMethod(
        activeStaff.paymentMethod ||
          settings.paymentMethods?.[0] ||
          'Bank Transfer (BEFTN / NPSB)'
      );
    }
    initBulkForMonth(defaultMonth);
  }, [selectedStaff, staffList, isOpen, initialBulkMode]);

  const currentStaff = staffList.find((s) => s.id === targetStaffId);
  const monthStats = getStaffMonthStats(currentStaff, month);

  const handleStaffChange = (id: string) => {
    setTargetStaffId(id);
    const s = staffList.find((x) => x.id === id);
    if (s) {
      const stats = getStaffMonthStats(s, month);
      setAmount(stats.remainingDue > 0 ? stats.remainingDue : s.monthlySalary);
      if (s.paymentMethod) setPaymentMethod(s.paymentMethod);
    }
  };

  const handleMonthSelect = (newMonth: string, suggestedType?: SalaryPaymentData['paymentType']) => {
    setMonth(newMonth);
    if (suggestedType) {
      setPaymentType(suggestedType);
    }
    if (currentStaff) {
      const stats = getStaffMonthStats(currentStaff, newMonth);
      setAmount(stats.remainingDue > 0 ? stats.remainingDue : currentStaff.monthlySalary);
    }
    initBulkForMonth(newMonth, suggestedType);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (disburseMode === 'bulk') {
      const paymentsToSave: SalaryPaymentData[] = [];
      for (const s of staffList) {
        const item = bulkItems[s.id];
        if (item && item.selected && item.amount > 0) {
          paymentsToSave.push({
            staffId: s.id,
            staffName: s.name,
            paymentType: item.paymentType,
            month,
            amount: Number(item.amount),
            paymentDate,
            paymentMethod: s.paymentMethod || paymentMethod,
            referenceNo,
            notes:
              notes ||
              `${item.paymentType} (${month}) - একসাথে বেতন প্রদান`,
          });
        }
      }
      if (paymentsToSave.length === 0) return;
      if (onSaveBulk) {
        onSaveBulk(paymentsToSave);
      } else {
        paymentsToSave.forEach((p) => onSave(p));
      }
      onClose();
      return;
    }

    if (!currentStaff) return;
    if (amount <= 0) return;

    onSave({
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      paymentType,
      month,
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      referenceNo,
      notes:
        notes ||
        `${paymentType} (${month}) | পরিশোধ: ৳${amount.toLocaleString()} | বাকি: ৳${Math.max(
          0,
          monthStats.remainingDue - amount
        ).toLocaleString()}`,
    });
    onClose();
  };

  const totalBulkSelectedAmount = Object.entries(bulkItems).reduce(
    (sum, [, val]) => (val.selected ? sum + (Number(val.amount) || 0) : sum),
    0
  );
  const totalBulkSelectedCount = Object.values(bulkItems).filter(
    (v) => v.selected && v.amount > 0
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'EN'
                  ? 'Staff Salary, Previous Month Due & Advance Payment'
                  : 'আগের মাসের বেতন, চলতি মাসের অগ্রিম ও একসাথে বেতন প্রদান'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'EN'
                  ? 'Pay previous month full/partial salary, running month advance, or disburse all salaries at once'
                  : 'আগের মাসের ফুল/আংশিক বেতন, চলতি মাসের অগ্রিম অথবা সব বেতন একসাথে বা অল্প অল্প করে প্রদান'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: Single Staff vs Pay All Together */}
        <div className="px-5 pt-3.5 pb-2 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDisburseMode('single')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                disburseMode === 'single'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {language === 'EN'
                  ? 'Single Staff (Full / Partial / Advance)'
                  : 'একজন কর্মকর্তা (ফুল / অল্প অল্প / অগ্রিম)'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDisburseMode('bulk');
                initBulkForMonth(month);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                disburseMode === 'bulk'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {language === 'EN'
                  ? `Pay All Salaries Together (${staffList.length})`
                  : `সব বেতন একসাথে প্রদান (${staffList.length} জন)`}
              </span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Quick Period / Action Presets */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {language === 'EN'
                    ? '1. Select Month & Salary Mode:'
                    : '১. মাস ও পেমেন্টের ধরন নির্বাচন করুন:'}
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMonthSelect(prevMonthName, 'Previous Month Salary')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                    month === prevMonthName
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  ⏮️ আগের মাস ({prevMonthName})
                </button>
                <button
                  type="button"
                  onClick={() => handleMonthSelect(runningMonthName, 'Monthly Salary')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                    month === runningMonthName && paymentType !== 'Salary Advance'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  📅 চলতি মাস ({runningMonthName})
                </button>
                <button
                  type="button"
                  onClick={() => handleMonthSelect(runningMonthName, 'Salary Advance')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                    month === runningMonthName && paymentType === 'Salary Advance'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  ⚡ চলতি মাসের অগ্রিম (Advance)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'EN' ? 'For Month / Period *' : 'কোন মাসের বেতন / অগ্রিম *'}
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={monthOptions.includes(month) ? month : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') {
                        handleMonthSelect(e.target.value);
                      }
                    }}
                    className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>
                        {m === prevMonthName
                          ? `${m} (আগের মাস)`
                          : m === runningMonthName
                          ? `${m} (চলতি মাস)`
                          : m === nextMonthName
                          ? `${m} (আগামী মাস)`
                          : m}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={month}
                    onChange={(e) => handleMonthSelect(e.target.value)}
                    placeholder="e.g. September 2026"
                    className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'EN' ? 'Payment Category *' : 'পেমেন্টের ধরন *'}
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="Previous Month Salary">
                    {language === 'EN'
                      ? 'Previous Month Salary (আগের মাসের বেতন)'
                      : 'আগের মাসের বেতন (ফুল / বকেয়া)'}
                  </option>
                  <option value="Monthly Salary">
                    {language === 'EN'
                      ? 'Monthly Salary (চলতি মাসের বেতন)'
                      : 'মাসিক বেতন (ফুল পেমেন্ট)'}
                  </option>
                  <option value="Partial Salary">
                    {language === 'EN'
                      ? 'Partial / Installment Salary (অল্প অল্প করে বেতন)'
                      : 'আংশিক বেতন (অল্প অল্প করে প্রদান)'}
                  </option>
                  <option value="Salary Advance">
                    {language === 'EN'
                      ? 'Running Month Advance (চলতি মাসের অগ্রিম)'
                      : 'চলতি মাসের অগ্রিম বেতন (Advance)'}
                  </option>
                  <option value="Contract Payment">
                    {language === 'EN' ? 'Contract Payment' : 'চুক্তির টাকা প্রদান'}
                  </option>
                  <option value="Daily Payment">
                    {language === 'EN' ? 'Daily Wage / Payment' : 'দৈনিক টাকা প্রদান'}
                  </option>
                  <option value="Mobile Bill Allowance">
                    {language === 'EN' ? 'Mobile Bill Allowance' : 'মোবাইল বিল ভাতা'}
                  </option>
                  <option value="Festival Bonus / Incentive">
                    {language === 'EN' ? 'Festival Bonus / Incentive' : 'উৎসব বোনাস / ইনসেন্টিভ'}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {disburseMode === 'single' ? (
            <>
              {/* Select Staff */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {language === 'EN' ? 'Select Staff Member *' : 'কর্মকর্তা নির্বাচন করুন *'}
                  </span>
                </label>
                <select
                  value={targetStaffId}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role}) - মূল বেতন:{' '}
                      {formatCurrency(s.monthlySalary, settings.currencySymbol)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Month Salary & Advance Ledger Box */}
              {currentStaff && (
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-300 text-xs">
                      📊 {month} মাসের হিসাব ({currentStaff.name})
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAmount(
                            monthStats.remainingDue > 0
                              ? monthStats.remainingDue
                              : currentStaff.monthlySalary
                          );
                          if (month === prevMonthName) {
                            setPaymentType('Previous Month Salary');
                          } else {
                            setPaymentType('Monthly Salary');
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer"
                      >
                        সম্পূর্ণ বকেয়া ({formatCurrency(monthStats.remainingDue, settings.currencySymbol)})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const half = Math.round(
                            (monthStats.remainingDue > 0
                              ? monthStats.remainingDue
                              : currentStaff.monthlySalary) / 2
                          );
                          setAmount(half);
                          setPaymentType('Partial Salary');
                        }}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer"
                      >
                        ৫০% আংশিক (অল্প অল্প)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAmount(Math.round(currentStaff.monthlySalary * 0.3));
                          setPaymentType('Salary Advance');
                        }}
                        className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-bold cursor-pointer"
                      >
                        চলতি মাসের অগ্রিম
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">মাসিক বেতন</span>
                      <span className="font-bold text-white text-sm">
                        {formatCurrency(monthStats.baseSalary, settings.currencySymbol)}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">আগে পরিশোধ / অগ্রিম</span>
                      <span className="font-bold text-sky-300 text-sm">
                        {formatCurrency(monthStats.totalReceivedInMonth, settings.currencySymbol)}
                      </span>
                      {monthStats.advanceInMonth > 0 && (
                        <span className="text-[9px] text-purple-300 block">
                          (অগ্রিম: ৳{monthStats.advanceInMonth.toLocaleString()})
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">এই মাসের বকেয়া</span>
                      <span className="font-bold text-amber-300 text-sm">
                        {formatCurrency(monthStats.remainingDue, settings.currencySymbol)}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-rose-500/30">
                      <span className="text-[10px] text-rose-300 block">পেমেন্টের পর বকেয়া</span>
                      <span className="font-bold text-rose-400 text-sm">
                        {formatCurrency(
                          Math.max(0, monthStats.remainingDue - Number(amount || 0)),
                          settings.currencySymbol
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>
                      {language === 'EN'
                        ? 'Amount Paid Now (৳) *'
                        : 'এখন কত টাকা দিচ্ছেন (ফুল / অল্প অল্প / অগ্রিম) (৳) *'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{language === 'EN' ? 'Payment Date' : 'প্রদানের তারিখ'}</span>
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          ) : (
            /* BULK MODE: Pay All Staff Together or Partial Amounts */
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-xl">
                <div>
                  <span className="font-bold text-indigo-300 text-xs block">
                    👥 {month} মাসের সব কর্মকর্তার বেতন তালিকা
                  </span>
                  <span className="text-[11px] text-slate-400">
                    সব বেতন একসাথে ফুল পেমেন্ট করুন অথবা যেকোনো কর্মকর্তার বক্সে অল্প অল্প (আংশিক) টাকার পরিমাণ লিখে দিন।
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...bulkItems };
                      staffList.forEach((s) => {
                        const st = getStaffMonthStats(s, month);
                        updated[s.id] = {
                          selected: true,
                          amount: st.remainingDue > 0 ? st.remainingDue : s.monthlySalary,
                          paymentType:
                            month === prevMonthName ? 'Previous Month Salary' : 'Monthly Salary',
                        };
                      });
                      setBulkItems(updated);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer"
                  >
                    সবাইকে ফুল বকেয়া দিন
                  </button>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">নির্বাচন ও নাম</th>
                      <th className="py-2.5 px-2 text-right">মাসিক বেতন</th>
                      <th className="py-2.5 px-2 text-right">আগে দেওয়া</th>
                      <th className="py-2.5 px-2 text-right">বকেয়া আছে</th>
                      <th className="py-2.5 px-3 text-right">এখন প্রদান (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 bg-slate-900">
                    {staffList.map((s) => {
                      const st = getStaffMonthStats(s, month);
                      const rowState = bulkItems[s.id] || {
                        selected: false,
                        amount: st.remainingDue,
                        paymentType: 'Monthly Salary',
                      };
                      return (
                        <tr key={s.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={rowState.selected}
                                onChange={(e) =>
                                  setBulkItems({
                                    ...bulkItems,
                                    [s.id]: { ...rowState, selected: e.target.checked },
                                  })
                                }
                                className="rounded accent-emerald-500"
                              />
                              <div>
                                <div className="font-bold text-white">{s.name}</div>
                                <div className="text-[10px] text-slate-400">{s.role}</div>
                              </div>
                            </label>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                            ৳{st.baseSalary.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-sky-300">
                            ৳{st.totalReceivedInMonth.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-amber-300">
                            ৳{st.remainingDue.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              min="0"
                              value={rowState.amount || ''}
                              onChange={(e) =>
                                setBulkItems({
                                  ...bulkItems,
                                  [s.id]: {
                                    ...rowState,
                                    selected: true,
                                    amount: Number(e.target.value) || 0,
                                  },
                                })
                              }
                              className="w-28 bg-slate-950 border border-emerald-500/40 rounded-lg px-2 py-1 text-right font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-emerald-500/30 font-mono">
                <span className="text-slate-300 font-semibold">
                  মোট নির্বাচিত কর্মকর্তা: <strong>{totalBulkSelectedCount} জন</strong>
                </span>
                <span className="text-emerald-300 font-bold text-sm">
                  একসাথে মোট পরিশোধ: ৳ {totalBulkSelectedAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method & Trx Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-indigo-400" />
                <span>{language === 'EN' ? 'Payment Method' : 'পেমেন্ট মেথড'}</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {(settings.paymentMethods && settings.paymentMethods.length > 0
                  ? settings.paymentMethods
                  : [
                      'Bank Transfer (BEFTN / NPSB)',
                      'bKash / Nagad (মোবাইল ব্যাংকিং)',
                      'Cash in Hand (হাতে নগদ)',
                      'Petty Cash (পেটি ক্যাশ)',
                      'Account Payee Cheque',
                    ]
                ).map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'TrxID / Cheque / Ref No' : 'ট্রানজেকশন / চেক নম্বর'}
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. TrxID: 98AB..., Cheque: #4401"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'EN' ? 'Voucher Remarks / Notes' : 'ভাউচার রিমার্কস বা নোট'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                language === 'EN'
                  ? 'Previous month full salary / running month advance / installment'
                  : 'যেমন: আগের মাসের সম্পূর্ণ বেতন / চলতি মাসের অগ্রিম / আংশিক কিস্তি'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              {language === 'EN' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {disburseMode === 'bulk'
                  ? language === 'EN'
                    ? `Disburse All (${totalBulkSelectedCount} Staff)`
                    : `একসাথে ${totalBulkSelectedCount} জনের বেতন পরিশোধ করুন`
                  : language === 'EN'
                  ? 'Confirm Payment & Sync'
                  : 'টাকা প্রদান ও হিসাবভুক্ত করুন'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
