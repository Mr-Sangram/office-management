/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Car,
  Coffee,
  Wrench,
  Printer,
  ShoppingBag,
  DollarSign,
  Save,
  Truck,
  Users,
  Compass,
  MapPin,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ExpenseItem, Project, CompanySettings } from '../../types';

interface DailyCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: ExpenseItem) => void;
  editingExpense?: ExpenseItem | null;
  projects: Project[];
  settings: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

type DailyPresetType =
  | 'CONVEYANCE'
  | 'TEA_SNACKS'
  | 'CLIENT_MEETING'
  | 'EMERGENCY_HARDWARE'
  | 'PRINTING'
  | 'PORTER_VAN'
  | 'GENERAL';

export const DailyCostModal: React.FC<DailyCostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  projects,
  settings,
  nextId,
  language,
}) => {
  const [preset, setPreset] = useState<DailyPresetType>('CONVEYANCE');
  
  const [formData, setFormData] = useState<Partial<ExpenseItem>>({
    id: nextId,
    date: new Date().toISOString().split('T')[0],
    expenseType: 'PROJECT_DIRECT',
    expenseCategory: 'Conveyance & Transport',
    description: '',
    projectId: projects[0]?.id || 'OFFICE_GENERAL',
    projectName: projects[0]?.projectName || 'General Office',
    supplierPayee: settings.employees[0] || 'Staff Member',
    paymentMethod: 'Petty Cash (পেটি ক্যাশ)',
    billInvoiceNumber: '',
    amount: 0,
    paymentStatus: 'Paid',
    approvedBy: settings.employees[0] || 'Admin',
    notes: '',
    isDailyCost: true,
    conveyanceMode: 'Rickshaw',
    travelRoute: '',
    spentBy: settings.employees[0] || 'Admin',
    dailySubcategory: 'Conveyance',
  });

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setFormData(editingExpense);
      } else {
        setFormData((prev) => ({
          ...prev,
          id: nextId,
          date: new Date().toISOString().split('T')[0],
          projectId: projects[0]?.id || 'OFFICE_GENERAL',
          projectName: projects[0]?.projectName || 'General Office',
        }));
      }
    }
  }, [isOpen, editingExpense, nextId, projects]);

  if (!isOpen) return null;

  // Handle Preset Selection
  const applyPreset = (type: DailyPresetType) => {
    setPreset(type);
    if (type === 'CONVEYANCE') {
      setFormData((prev) => ({
        ...prev,
        expenseCategory: 'Conveyance & Transport',
        expenseType: 'PROJECT_DIRECT',
        dailySubcategory: 'Conveyance',
        conveyanceMode: 'Rickshaw',
        description: prev.description || 'সাইট ভিজিট ও মেজারমেন্ট যাতায়াত ভাড়া',
      }));
    } else if (type === 'TEA_SNACKS') {
      setFormData((prev) => ({
        ...prev,
        expenseCategory: 'Office Tea & Refreshments',
        expenseType: 'OFFICE_OVERHEAD',
        dailySubcategory: 'Tea & Snacks',
        conveyanceMode: 'N/A',
        travelRoute: '',
        description: prev.description || 'অফিস কর্মী ও ভিজিটরদের দৈনিক চা-নাস্তা ও পানি',
      }));
    } else if (type === 'CLIENT_MEETING') {
      setFormData((prev) => ({
        ...prev,
        expenseCategory: 'Office Tea & Refreshments',
        expenseType: 'PROJECT_DIRECT',
        dailySubcategory: 'Client Entertainment',
        conveyanceMode: 'N/A',
        description: prev.description || 'ক্লায়েন্ট মিটিং আপ্যায়ন ও নাস্তা খরচ',
      }));
    } else if (type === 'EMERGENCY_HARDWARE') {
      setFormData((prev) => ({
        ...prev,
        expenseCategory: 'Emergency Site Hardware',
        expenseType: 'PROJECT_DIRECT',
        dailySubcategory: 'Emergency Hardware',
        conveyanceMode: 'N/A',
        description: prev.description || 'সাইটের জরুরি ছোটখাটো মালামাল কেনা (আঠা, স্ক্রু, টেপ)',
      }));
    } else if (type === 'PRINTING') {
      setFormData((prev) => ({
        ...prev,
        expenseCategory: 'Printing, Drawing & Stationery',
        expenseType: 'OFFICE_OVERHEAD',
        dailySubcategory: 'Printing & Drawing',
        conveyanceMode: 'N/A',
        description: prev.description || 'A3 ড্রয়িং ব্লুপ্রিন্ট প্রিন্ট ও ফটোকপি',
      }));
    } else if (type === 'PORTER_VAN') {
      setFormData((prev) => ({
        ...prev,
        expenseCategory: 'Conveyance & Transport',
        expenseType: 'PROJECT_DIRECT',
        dailySubcategory: 'Porter & Van',
        conveyanceMode: 'Van / Pickup',
        description: prev.description || 'মাল ওঠানো-নামানো কুলি ও ভ্যান ভাড়া',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        expenseCategory: 'Miscellaneous Overhead',
        dailySubcategory: 'Miscellaneous',
        conveyanceMode: 'N/A',
      }));
    }
  };

  const handleProjectSelect = (projId: string) => {
    if (projId === 'OFFICE_GENERAL') {
      setFormData({
        ...formData,
        projectId: 'OFFICE_GENERAL',
        projectName: 'Head Office Overhead',
        expenseType: 'OFFICE_OVERHEAD',
      });
    } else {
      const p = projects.find((proj) => proj.id === projId);
      setFormData({
        ...formData,
        projectId: projId,
        projectName: p ? p.projectName : '',
        expenseType: 'PROJECT_DIRECT',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description?.trim() || !formData.amount || Number(formData.amount) <= 0) {
      alert(language === 'EN' ? 'Please provide a description and valid amount.' : 'দয়া করে খরচের বিবরণ ও সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }

    const selectedProj = projects.find((p) => p.id === formData.projectId);

    const expense: ExpenseItem = {
      id: formData.id || nextId,
      date: formData.date || new Date().toISOString().split('T')[0],
      expenseType: formData.expenseType || (formData.projectId === 'OFFICE_GENERAL' ? 'OFFICE_OVERHEAD' : 'PROJECT_DIRECT'),
      expenseCategory: formData.expenseCategory || 'Conveyance & Transport',
      description: formData.description.trim(),
      projectId: formData.projectId || 'OFFICE_GENERAL',
      projectName: formData.projectId === 'OFFICE_GENERAL' ? 'Head Office Overhead' : (selectedProj ? selectedProj.projectName : 'General'),
      supplierPayee: formData.supplierPayee || formData.spentBy || 'Staff Member',
      paymentMethod: formData.paymentMethod || 'Petty Cash (পেটি ক্যাশ)',
      billInvoiceNumber: formData.billInvoiceNumber || '',
      amount: Number(formData.amount),
      paymentStatus: formData.paymentStatus as any || 'Paid',
      approvedBy: formData.approvedBy || settings.employees[0] || 'Admin',
      notes: formData.notes || '',
      isDailyCost: true,
      conveyanceMode: formData.conveyanceMode || 'N/A',
      travelRoute: formData.travelRoute || '',
      spentBy: formData.spentBy || formData.supplierPayee || '',
      dailySubcategory: formData.dailySubcategory || 'Conveyance',
    };

    onSave(expense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{language === 'EN' ? 'Daily Cost & Conveyance Entry' : 'দৈনিক খরচ ও যাতায়াত (কনভেয়েন্স) এন্ট্রি'}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                  {formData.id}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'EN' ? 'Log site visit conveyance, tea, emergency items & petty cash' : 'সাইট ভিজিট রিকশা/সিএনজি ভাড়া, চা-নাস্তা ও দৈনিক খরচের হিসাব'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Quick Preset Selector Buttons */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {language === 'EN' ? 'Quick Expense Presets:' : 'দ্রুত খরচের ধরন নির্বাচন করুন:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('CONVEYANCE')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left font-semibold transition cursor-pointer ${
                  preset === 'CONVEYANCE'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Car className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">যাতায়াত / Conveyance</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('TEA_SNACKS')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left font-semibold transition cursor-pointer ${
                  preset === 'TEA_SNACKS'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Coffee className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">অফিস চা-নাস্তা</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('CLIENT_MEETING')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left font-semibold transition cursor-pointer ${
                  preset === 'CLIENT_MEETING'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">ক্লায়েন্ট আপ্যায়ন</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('EMERGENCY_HARDWARE')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left font-semibold transition cursor-pointer ${
                  preset === 'EMERGENCY_HARDWARE'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Wrench className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">জরুরি হার্ডওয়্যার/টুলস</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('PRINTING')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left font-semibold transition cursor-pointer ${
                  preset === 'PRINTING'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Printer className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">প্রিন্ট ও ড্রয়িং কপি</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('PORTER_VAN')}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left font-semibold transition cursor-pointer ${
                  preset === 'PORTER_VAN'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Truck className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="truncate">কুলি ও ভ্যান ভাড়া</span>
              </button>
            </div>
          </div>

          {/* Date & Amount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Date:' : 'খরচের তারিখ:'}
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Amount (৳):' : 'টাকার পরিমাণ (৳):'} <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="e.g. 250"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-amber-500/60 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Project or Office Scope */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Charge To Project / Office:' : 'খরচের খাত (প্রজেক্ট নাকি অফিস):'}
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="OFFICE_GENERAL">🏢 Head Office Overhead (অফিসের সাধারণ খরচ)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📐 {p.projectName} ({p.id}) — {p.clientName}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              {formData.projectId === 'OFFICE_GENERAL'
                ? 'এটি অফিসের সাধারণ পরিচালন খরচে যোগ হবে।'
                : 'এটি সরাসরি প্রজেক্টের মোট খরচে (Direct Cost) যোগ হবে এবং প্রজেক্টের নিট লাভ সঠিকভাবে গণনা করবে।'}
            </p>
          </div>

          {/* Conveyance Specific Fields (Mode & Route) */}
          {(preset === 'CONVEYANCE' || formData.dailySubcategory === 'Conveyance' || preset === 'PORTER_VAN') && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs">
                <Compass className="w-3.5 h-3.5" />
                <span>যাতায়াত ও পরিবহনের বিবরণ (Conveyance Details)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">যাতায়াত মাধ্যম:</label>
                  <select
                    value={formData.conveyanceMode}
                    onChange={(e) => setFormData({ ...formData, conveyanceMode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="Rickshaw">রিকশা (Rickshaw)</option>
                    <option value="CNG">সিএনজি (CNG Auto)</option>
                    <option value="Uber / Pathao">উবার / পাঠাও (Ride Sharing)</option>
                    <option value="Bus">বাস (Public Bus)</option>
                    <option value="Bike Fuel">বাইক ফুয়েল (Motorcycle Fuel)</option>
                    <option value="Metro Rail">মেট্রোরেল (Metro Rail)</option>
                    <option value="Van / Pickup">ভ্যান / পিকআপ (Van / Porter)</option>
                    <option value="Walk / Other">পায়ে হেঁটে / অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">রুট / আসা-যাওয়ার স্থান:</label>
                  <input
                    type="text"
                    placeholder="e.g. অফিস -> গুলশান-২ সাইট"
                    value={formData.travelRoute || ''}
                    onChange={(e) => setFormData({ ...formData, travelRoute: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Expense Description:' : 'খরচের বিবরণ:'} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                preset === 'CONVEYANCE'
                  ? 'e.g. সাইটে মেজারমেন্ট নিতে যাওয়া ও আর্কিটেক্ট ভিজিট'
                  : 'e.g. ক্লায়েন্ট মিটিং চা-বিস্কুট ও ফিল্টার পানির জার'
              }
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Spent By & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Spent By / Staff:' : 'কে খরচ করেছেন (স্টাফ/আর্কিটেক্ট):'}
              </label>
              <input
                type="text"
                list="staff-list"
                value={formData.spentBy || ''}
                onChange={(e) => setFormData({ ...formData, spentBy: e.target.value, supplierPayee: e.target.value })}
                placeholder="e.g. Ar. Tanvir Ahmed / Mahfuzur"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
              <datalist id="staff-list">
                {settings.employees.map((emp) => (
                  <option key={emp} value={emp} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Payment Method:' : 'পেমেন্ট মাধ্যম:'}
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.paymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="Self-Paid (To be Reimbursed)">স্টাফ নিজে দিয়েছেন (পরে রিইম্বার্স হবে)</option>
              </select>
            </div>
          </div>

          {/* Voucher / Receipt & Approved By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Voucher / Memo No (Optional):' : 'ভাউচার / ক্যাশ মেমো নং (যদি থাকে):'}
              </label>
              <input
                type="text"
                placeholder="e.g. VOUCH-102"
                value={formData.billInvoiceNumber || ''}
                onChange={(e) => setFormData({ ...formData, billInvoiceNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Approved By:' : 'অনুমোদনকারী:'}
              </label>
              <select
                value={formData.approvedBy}
                onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.employees.map((emp) => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Notes / Remarks:' : 'মন্তব্য:'}
            </label>
            <input
              type="text"
              placeholder="অতিরিক্ত কোনো তথ্য থাকলে লিখুন"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              {language === 'EN' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Daily Cost' : 'খরচ সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
