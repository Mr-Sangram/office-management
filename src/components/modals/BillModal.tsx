/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Receipt, Save, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { OfficeBill, CompanySettings } from '../../types';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: OfficeBill) => void;
  editingBill?: OfficeBill | null;
  settings: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBill,
  settings,
  nextId,
  language,
}) => {
  const defaultBillTypes = settings.billTypes || [
    'Office Lease Rent (অফিস ভাড়া)',
    'Electricity & Water (ডেসকো/ওয়াসা)',
    'High-Speed Internet & Fiber',
    'Mobile Bill Allowance (মোবাইল বিল ভাতা)',
    'Software Subscriptions (AutoCAD / 3Ds Max / Cloud)',
    'Trade License & Renewal Govt Fees',
    'Studio Maintenance & Cleaning',
    'Office Tea & Pantry Supplies',
  ];

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const [formData, setFormData] = useState<OfficeBill>({
    id: nextId,
    billType: defaultBillTypes[0] || 'Office Lease Rent (অফিস ভাড়া)',
    billingMonth: currentMonthName,
    amount: 15000,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Unpaid',
    paidDate: '',
    paymentMethod: 'Bank Wire / BEFTN',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingBill) {
      setFormData(editingBill);
    } else {
      setFormData({
        id: nextId,
        billType: defaultBillTypes[0] || 'Office Lease Rent (অফিস ভাড়া)',
        billingMonth: currentMonthName,
        amount: 15000,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Unpaid',
        paidDate: '',
        paymentMethod: 'Bank Wire / BEFTN',
        notes: '',
      });
    }
    setErrors({});
  }, [editingBill, nextId, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.billingMonth.trim()) {
      errs.billingMonth = language === 'EN' ? 'Billing month is required' : 'বিলিং মাস উল্লেখ করুন';
    }
    if (formData.amount <= 0) {
      errs.amount = language === 'EN' ? 'Valid amount is required' : 'সঠিক টাকার পরিমাণ দিন';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingBill
                  ? language === 'EN'
                    ? 'Edit Office Bill'
                    : 'অফিস বিল সংশোধন'
                  : language === 'EN'
                  ? 'Record Office & Utility Bill'
                  : 'নতুন অফিস বিল ও ইউটিলিটি এন্ট্রি'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'EN'
                  ? 'Rent, DESCO, internet, mobile bills & recurring overhead'
                  : 'অফিস ভাড়া, বিদ্যুৎ, ইন্টারনেট ও মোবাইল বিল হিসাব'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Bill ID' : 'বিল আইডি'}
              </label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Bill Type / Purpose *' : 'বিলের ধরন ও খাত *'}
              </label>
              <select
                value={formData.billType}
                onChange={(e) => setFormData({ ...formData, billType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {defaultBillTypes.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Billing Month *' : 'বিলিং মাস / সময়কাল *'}
              </label>
              <input
                type="text"
                value={formData.billingMonth}
                onChange={(e) => setFormData({ ...formData, billingMonth: e.target.value })}
                placeholder="e.g. October 2026"
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 ${
                  errors.billingMonth ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.billingMonth && <p className="text-rose-400 text-[10px] mt-0.5">{errors.billingMonth}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-amber-400" />
                <span>{language === 'EN' ? 'Amount (৳) *' : 'বিলের পরিমাণ (৳) *'}</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500 ${
                  errors.amount ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.amount && <p className="text-rose-400 text-[10px] mt-0.5">{errors.amount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{language === 'EN' ? 'Due Date' : 'পরিশোধের শেষ তারিখ'}</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Payment Status' : 'পরিশোধের অবস্থা'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => {
                  const newStatus = e.target.value as 'Paid' | 'Unpaid';
                  setFormData({
                    ...formData,
                    status: newStatus,
                    paidDate: newStatus === 'Paid' && !formData.paidDate ? new Date().toISOString().split('T')[0] : formData.paidDate,
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Unpaid">{language === 'EN' ? 'Unpaid / Pending' : 'বাকি / পরিশোধ হয়নি'}</option>
                <option value="Paid">{language === 'EN' ? 'Paid / Cleared' : 'পরিশোধিত (Paid)'}</option>
              </select>
            </div>
          </div>

          {formData.status === 'Paid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  {language === 'EN' ? 'Paid Date' : 'পরিশোধের তারিখ'}
                </label>
                <input
                  type="date"
                  value={formData.paidDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                  className="w-full bg-slate-900 border border-emerald-800/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-400" />
                  <span>{language === 'EN' ? 'Paid Via' : 'পেমেন্ট মেথড'}</span>
                </label>
                <select
                  value={formData.paymentMethod || 'Bank Wire / BEFTN'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full bg-slate-900 border border-emerald-800/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Bank Wire / BEFTN">Bank Wire / BEFTN</option>
                  <option value="bKash / Nagad Corporate">bKash / Nagad</option>
                  <option value="Cash in Hand (হাতে নগদ)">Cash in Hand</option>
                  <option value="Petty Cash (পেটি ক্যাশ)">Petty Cash</option>
                  <option value="Account Payee Cheque">Account Payee Cheque</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'EN' ? 'Notes / Voucher Reference' : 'ভাউচার নম্বর বা রিসিট নোট'}
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={language === 'EN' ? 'e.g. Meter No: 987654, TrxID: 98AB...' : 'যেমন: ট্রানজেকশন আইডি বা মিটার নম্বর...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Bill Record' : 'বিল সেভ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
