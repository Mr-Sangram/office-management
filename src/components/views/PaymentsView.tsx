/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BadgeDollarSign,
  Plus,
  Search,
  Printer,
  Calendar,
  Building,
  CreditCard,
  UserCheck,
  Edit2,
  Trash2,
} from 'lucide-react';
import { PaymentReceived, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';

interface PaymentsViewProps {
  payments: PaymentReceived[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onAddPayment: () => void;
  onEditPayment?: (payment: PaymentReceived) => void;
  onDeletePayment?: (payment: PaymentReceived) => void;
  onPrintReceipt: (payment: PaymentReceived) => void;
  onImportPayments?: (records: PaymentReceived[]) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  settings,
  language,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  onPrintReceipt,
  onImportPayments,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paymentReference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = selectedMethod === 'ALL' || p.paymentMethod === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const totalReceived = payments.reduce((s, p) => s + p.amountReceived, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN' ? 'Client Payments & Receipts Ledger' : 'ক্লায়েন্ট পেমেন্ট ও মানি রিসিট লেজার'}
            </h2>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
              09_Payments_Received
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Multi-stage installments, transaction references, official money receipt generation, and live due reduction'
              : 'বহু-ধাপের কিস্তি, ব্যাংক ও ক্যাশ ট্রানজেকশন, অফিশিয়াল মানি রিসিট ও স্বয়ংক্রিয় বকেয়া সমন্বয়'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onImportPayments && (
            <CategoryImportButton
              category="payments"
              language={language}
              existingIds={payments.map((p) => p.id)}
              onImportRecords={onImportPayments}
            />
          )}
          <button
            onClick={onAddPayment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'EN' ? 'Record Payment' : 'পেমেন্ট ভাউচার এন্ট্রি'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Cash Inflow Received' : 'মোট নগদ ও ব্যাংক জমা'}
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {formatCurrency(totalReceived, settings.currencySymbol)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Payment Vouchers' : 'মোট মানি রিসিট সংখ্যা'}
          </span>
          <span className="text-xl font-bold font-mono text-white">
            {payments.length} Transactions
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Latest Transaction' : 'সর্বশেষ পেমেন্ট'}
          </span>
          <span className="text-sm font-semibold text-slate-200 block truncate">
            {payments[payments.length - 1]?.clientName || 'None'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {formatDate(payments[payments.length - 1]?.date || '')}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'EN' ? 'Search client, project, cheque/trx ID...' : 'ক্লায়েন্ট নাম, প্রজেক্ট বা চেক নম্বর দিয়ে খুঁজুন...'}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs w-full md:w-auto"
        >
          <option value="ALL">All Methods (সব মাধ্যম)</option>
          {settings.paymentMethods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Voucher ID & Date</th>
                <th className="py-3 px-3">Client & Project</th>
                <th className="py-3 px-3">Installment Stage</th>
                <th className="py-3 px-3">Payment Method & Reference</th>
                <th className="py-3 px-3 text-right">Amount Received</th>
                <th className="py-3 px-3">Received By</th>
                <th className="py-3 px-3 text-center">Receipt & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3.5 px-3">
                    <span className="font-mono text-emerald-400 font-bold block">{p.id}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(p.date)}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white text-sm">{p.clientName}</div>
                    <div className="text-[10px] text-slate-400">{p.projectName}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold text-[11px]">
                      {p.installmentName}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="text-slate-200 font-medium">{p.paymentMethod}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.paymentReference || 'Direct'}</div>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-400 text-sm">
                    {formatCurrency(p.amountReceived, settings.currencySymbol)}
                  </td>

                  <td className="py-3.5 px-3 text-slate-300">
                    <span className="text-[11px]">{p.receivedBy}</span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onPrintReceipt(p)}
                        title="Print Official Money Receipt"
                        className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {onEditPayment && (
                        <button
                          onClick={() => onEditPayment(p)}
                          title={language === 'EN' ? 'Edit Payment' : 'পেমেন্ট ভাউচার এডিট করুন'}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeletePayment && (
                        <button
                          onClick={() => onDeletePayment(p)}
                          title={language === 'EN' ? 'Delete Payment' : 'পেমেন্ট ভাউচার মুছে ফেলুন'}
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
    </div>
  );
};
