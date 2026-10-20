/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Receipt, Save, Info } from 'lucide-react';
import { ExpenseItem, Project, CompanySettings } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: ExpenseItem) => void;
  editingExpense?: ExpenseItem | null;
  projects: Project[];
  settings: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  projects,
  settings,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<ExpenseItem>>({
    id: nextId,
    date: new Date().toISOString().split('T')[0],
    expenseType: 'PROJECT_DIRECT',
    expenseCategory: settings.expenseCategories[0] || 'Transport & Site Logistics',
    description: '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.projectName || '',
    supplierPayee: '',
    paymentMethod: settings.paymentMethods[0] || 'Bank Wire / BEFTN',
    billInvoiceNumber: '',
    amount: 0,
    paymentStatus: 'Paid',
    approvedBy: settings.employees[0] || 'Admin',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setFormData(editingExpense);
      } else {
        setFormData({
          id: nextId,
          date: new Date().toISOString().split('T')[0],
          expenseType: projects.length > 0 ? 'PROJECT_DIRECT' : 'OFFICE_OVERHEAD',
          expenseCategory: settings.expenseCategories[0] || 'Transport & Site Logistics',
          description: '',
          projectId: projects[0]?.id || 'OFFICE_GENERAL',
          projectName: projects[0]?.projectName || 'Head Office Overhead',
          supplierPayee: '',
          paymentMethod: settings.paymentMethods[0] || 'Bank Wire / BEFTN',
          billInvoiceNumber: '',
          amount: 0,
          paymentStatus: 'Paid',
          approvedBy: settings.employees[0] || 'Admin',
          notes: '',
        });
      }
    }
  }, [isOpen, editingExpense, nextId, projects, settings]);

  if (!isOpen) return null;

  const handleProjectChange = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    setFormData({
      ...formData,
      projectId: projId,
      projectName: proj ? proj.projectName : 'General Studio Overhead',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description?.trim() || !formData.amount || Number(formData.amount) <= 0) return;

    const selectedProj = projects.find((p) => p.id === formData.projectId);

    const expense: ExpenseItem = {
      id: formData.id || nextId,
      date: formData.date || new Date().toISOString().split('T')[0],
      expenseType: formData.expenseType as any,
      expenseCategory: formData.expenseCategory || 'Miscellaneous',
      description: formData.description.trim(),
      projectId: formData.expenseType === 'OFFICE_OVERHEAD' ? 'OFFICE_GENERAL' : (formData.projectId || ''),
      projectName: formData.expenseType === 'OFFICE_OVERHEAD' ? 'Head Office Overhead' : (selectedProj ? selectedProj.projectName : ''),
      supplierPayee: formData.supplierPayee || '',
      paymentMethod: formData.paymentMethod || 'Cash',
      billInvoiceNumber: formData.billInvoiceNumber || '',
      amount: Number(formData.amount),
      paymentStatus: formData.paymentStatus as any,
      approvedBy: formData.approvedBy || '',
      notes: formData.notes || '',
    };

    onSave(expense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'EN' ? 'Record Expense & Disbursement' : 'ব্যয় / খরচ এন্ট্রি'}
              </h2>
              <span className="text-xs text-rose-400 font-mono font-semibold">
                ID: {formData.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anti-Duplicate Notice */}
        <div className="px-6 py-2.5 bg-rose-950/30 border-b border-rose-900/30 text-rose-200 text-[11px] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-rose-400" />
          <span>
            {language === 'EN'
              ? 'Anti-Duplicate Accounting: Direct materials and site labour wages are automatically calculated from their modules. Use this for Subcontractors, Logistics, and Office Overheads.'
              : 'সতর্কতা: উপাদান ও মিস্ত্রির মজুরি সংশ্লিষ্ট মডিউল থেকে স্বয়ংক্রিয়ভাবে প্রজেক্টে যুক্ত হয়। এখানে সাব-কন্ট্রাক্টর, পরিবহন ও অফিসের সাধারণ খরচ এন্ট্রি করুন।'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Expense Classification */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Expense Allocation Type *' : 'খরচের ধরন নির্বাচন করুন *'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, expenseType: 'PROJECT_DIRECT' })}
                className={`py-2 px-3 rounded-lg text-left font-semibold border transition ${
                  formData.expenseType === 'PROJECT_DIRECT'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <div className="font-bold">📐 Project Direct Cost</div>
                <div className="text-[10px] text-slate-400 font-normal">Subcontractors, site freight, direct permits</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, expenseType: 'OFFICE_OVERHEAD' })}
                className={`py-2 px-3 rounded-lg text-left font-semibold border transition ${
                  formData.expenseType === 'OFFICE_OVERHEAD'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <div className="font-bold">🏢 Office Overhead</div>
                <div className="text-[10px] text-slate-400 font-normal">Studio rent, electricity, marketing, software</div>
              </button>
            </div>
          </div>

          {/* Project selector if Direct */}
          {formData.expenseType === 'PROJECT_DIRECT' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Charge Directly To Project *' : 'সংশ্লিষ্ট প্রজেক্ট নির্বাচন করুন *'}
              </label>
              <select
                required
                value={formData.projectId || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.projectName} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Expense Category *' : 'খরচের ক্যাটাগরি *'}
              </label>
              <select
                value={formData.expenseCategory || ''}
                onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Date *' : 'তারিখ *'}
              </label>
              <input
                type="date"
                required
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Expense Description *' : 'খরচের বিবরণ *'}
            </label>
            <input
              type="text"
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Italian marble polishing specialist contractor advance"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Amount, Method, Payee */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Amount (৳) *' : 'টাকার পরিমাণ (৳) *'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                placeholder="45000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-rose-300 font-bold font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Payment Method' : 'পেমেন্ট মাধ্যম'}
              </label>
              <select
                value={formData.paymentMethod || ''}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.paymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Payment Status' : 'পেমেন্ট স্ট্যাটাস'}
              </label>
              <select
                value={formData.paymentStatus || 'Paid'}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid / Due</option>
              </select>
            </div>
          </div>

          {/* Payee & Bill No */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Supplier / Payee / Vendor' : 'প্রাপক / ভেন্ডর'}
              </label>
              <input
                type="text"
                value={formData.supplierPayee || ''}
                onChange={(e) => setFormData({ ...formData, supplierPayee: e.target.value })}
                placeholder="e.g. Apex Marble Polish Specialists"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Bill / Invoice / Voucher No' : 'বিল / ভাউচার নং'}
              </label>
              <input
                type="text"
                value={formData.billInvoiceNumber || ''}
                onChange={(e) => setFormData({ ...formData, billInvoiceNumber: e.target.value })}
                placeholder="e.g. INV-APX-88"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Approved By */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Approved By' : 'অনুমোদনকারী কর্মকর্তা'}
            </label>
            <input
              type="text"
              value={formData.approvedBy || ''}
              onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
              placeholder="Ar. Tanvir Ahmed (Principal Architect)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {language === 'EN' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Expense' : 'খরচ সংরক্ষণ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
