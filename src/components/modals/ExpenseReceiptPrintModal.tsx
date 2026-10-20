/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  Printer,
  X,
  Receipt,
  Building,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { CompanySettings, ExpenseItem } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export interface PrintableExpenseData {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  paidTo: string;
  paymentMethod: string;
  projectName?: string;
  billNumber?: string;
  approvedBy?: string;
  type?: string;
}

interface ExpenseReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: PrintableExpenseData | null;
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onNavigateToFullPrintables?: () => void;
}

export const ExpenseReceiptPrintModal: React.FC<ExpenseReceiptPrintModalProps> = ({
  isOpen,
  onClose,
  expense,
  settings,
  language,
  onNavigateToFullPrintables,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !expense) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls Header - Hidden during print */}
        <div className="no-print px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {language === 'EN' ? 'Official Expense Receipt / Voucher' : 'অফিসিয়াল খরচ রশিদ ও ডেবিট ভাউচার'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'EN'
                  ? 'Ready for direct thermal or A4 printing and PDF download'
                  : 'প্রিন্ট বা পিডিএফ সেভ করার জন্য প্রস্তুত'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'EN' ? 'Print / PDF' : 'প্রিন্ট করুন'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper Card */}
        <div className="p-4 sm:p-6 bg-slate-900 overflow-y-auto max-h-[75vh]">
          <div
            ref={receiptRef}
            className="print-area bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden"
          >
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-200 pb-5 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {settings.companyName}
                  </h1>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {settings.tagline || 'Interior Design & Decoration Management System'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {settings.address} • Phone: {settings.phone} • Email: {settings.email}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="inline-block px-3 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs uppercase tracking-wider mb-1">
                  {language === 'EN' ? 'EXPENSE DEBIT VOUCHER' : 'অফিস খরচ ভাউচার / রশিদ'}
                </span>
                <div className="text-xs font-mono font-bold text-slate-700">
                  {language === 'EN' ? 'Voucher No:' : 'ভাউচার নং:'}{' '}
                  <span className="text-amber-700 font-black">{expense.id}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {language === 'EN' ? 'Date:' : 'তারিখ:'}{' '}
                  <span className="font-semibold text-slate-800">{formatDate(expense.date)}</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                  {language === 'EN' ? 'Paid To (Payee / Supplier):' : 'প্রাপক / প্রদানকারী:'}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {expense.paidTo || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                  {language === 'EN' ? 'Project / Allocation Head:' : 'প্রজেক্ট / খরচের খাত:'}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {expense.projectName || 'অফিস সাধারণ খরচ (Office Overhead)'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                  {language === 'EN' ? 'Expense Category:' : 'ক্যাটাগরি:'}
                </span>
                <span className="font-semibold text-slate-800">
                  {expense.category || 'General Expense'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                  {language === 'EN' ? 'Payment Method / Bill Ref:' : 'পেমেন্ট মাধ্যম / বিল নং:'}
                </span>
                <span className="font-semibold text-slate-800">
                  {expense.paymentMethod || 'Cash'} {expense.billNumber ? `(Bill: ${expense.billNumber})` : ''}
                </span>
              </div>
            </div>

            {/* Description & Purpose */}
            <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                {language === 'EN' ? 'Particulars / Description of Expense:' : 'খরচের বিবরণ ও উদ্দেশ্য:'}
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {expense.description || 'অফিস বা সাইট সম্পর্কিত অনুমোদিত খরচ।'}
              </p>
            </div>

            {/* Amount Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white gap-3 mb-8">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  {language === 'EN' ? 'Total Amount Paid' : 'পরিশোধিত মোট টাকার পরিমাণ'}
                </span>
                <span className="text-xs text-slate-300">
                  {language === 'EN' ? 'Inclusive of all applicable tax/bills' : 'অনুমোদিত ও ক্যাশ/ব্যাংক রেজিস্টারে অন্তর্ভুক্ত'}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                {formatCurrency(expense.amount, settings.currencySymbol)}
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-slate-200 text-center text-xs">
              <div>
                <div className="h-10 border-b border-dashed border-slate-400" />
                <span className="block font-bold text-slate-700 mt-1.5">
                  {language === 'EN' ? 'Prepared By' : 'প্রস্তুতকারক'}
                </span>
                <span className="text-[10px] text-slate-500">হিসাব শাখা</span>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-slate-400" />
                <span className="block font-bold text-slate-700 mt-1.5">
                  {language === 'EN' ? 'Checked By' : 'যাচাইকারী'}
                </span>
                <span className="text-[10px] text-slate-500">ম্যানেজার / সুপারভাইজার</span>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-slate-400" />
                <span className="block font-bold text-slate-700 mt-1.5">
                  {language === 'EN' ? 'Authorized Owner' : 'অনুমোদনকারী'}
                </span>
                <span className="text-[10px] text-slate-500">ওনার / পরিচালক</span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
              {settings.invoiceFooterNote || 'Computer Generated Official Voucher • Valid Without Seal'}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions - Hidden during print */}
        <div className="no-print px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          {onNavigateToFullPrintables ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToFullPrintables();
              }}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'EN' ? 'Open All Printable Templates' : 'সব প্রিন্ট ও ইনভয়েস টেমপ্লেট দেখুন'}</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">Advance System ERP</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'EN' ? 'Print' : 'প্রিন্ট'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              {language === 'EN' ? 'Close' : 'বন্ধ করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
