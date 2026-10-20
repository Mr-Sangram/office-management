/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Save,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { OfficeStaff, CompanySettings } from '../../types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: OfficeStaff, newlyPaidAmount?: number) => void;
  editingStaff?: OfficeStaff | null;
  settings: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStaff,
  settings,
  nextId,
  language,
}) => {
  const defaultRoles = settings.staffRoles || [
    'Principal Architect',
    'Senior Interior Designer',
    'Junior Architect',
    '3D Visualizer & Render Specialist',
    'Project Engineer & Site Manager',
    'Site Supervisor',
    'Accountant & Admin Officer',
    'Procurement & Logistics Specialist',
    'Office Assistant & Messenger',
  ];

  const defaultDepts = settings.officeDepartments || [
    'Architectural Design Studio',
    'Interior Decor & Planning',
    'Project Execution & Civil',
    'Finance & Payroll Accounts',
    'Procurement & Inventory',
    'Administration & HR',
  ];

  const [formData, setFormData] = useState<OfficeStaff>({
    id: nextId,
    name: '',
    role: defaultRoles[0] || 'Junior Architect',
    department: defaultDepts[0] || 'Architectural Design Studio',
    phone: '',
    email: '',
    paymentType: 'Monthly Salary',
    dailyRate: 1000,
    monthlySalary: 35000,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    paymentMethod: 'Bank Wire / BEFTN',
    bankOrBkashDetails: '',
    totalAdvancePaid: 0,
    totalSalaryPaid: 0,
    notes: '',
  });

  const [paidNowAmount, setPaidNowAmount] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        ...editingStaff,
        paymentType: editingStaff.paymentType || 'Monthly Salary',
        dailyRate: editingStaff.dailyRate || 1000,
        department: editingStaff.department || defaultDepts[0],
        paymentMethod: editingStaff.paymentMethod || 'Bank Wire / BEFTN',
        bankOrBkashDetails: editingStaff.bankOrBkashDetails || '',
        totalAdvancePaid: editingStaff.totalAdvancePaid || 0,
        totalSalaryPaid: editingStaff.totalSalaryPaid || 0,
        notes: editingStaff.notes || '',
      });
      setPaidNowAmount(editingStaff.totalSalaryPaid || 0);
    } else {
      setFormData({
        id: nextId,
        name: '',
        role: defaultRoles[0] || 'Junior Architect',
        department: defaultDepts[0] || 'Architectural Design Studio',
        phone: '',
        email: '',
        paymentType: 'Monthly Salary',
        dailyRate: 1000,
        monthlySalary: 35000,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        paymentMethod: 'Bank Wire / BEFTN',
        bankOrBkashDetails: '',
        totalAdvancePaid: 0,
        totalSalaryPaid: 0,
        notes: '',
      });
      setPaidNowAmount(0);
    }
    setErrors({});
  }, [editingStaff, nextId, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      errs.name = language === 'EN' ? 'Full name is required' : 'কর্মকর্তার পূর্ণ নাম আবশ্যক';
    }
    if (!formData.phone.trim()) {
      errs.phone = language === 'EN' ? 'Phone number is required' : 'মোবাইল নম্বর আবশ্যক';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const prevPaid = editingStaff ? Number(editingStaff.totalSalaryPaid || 0) : 0;
    const totalPaidVal = Number(paidNowAmount || 0);
    const deltaPaid = Math.max(0, totalPaidVal - prevPaid);

    const updatedStaff: OfficeStaff = {
      ...formData,
      monthlySalary:
        formData.paymentType === 'Contract Based'
          ? Math.max(Number(formData.monthlySalary || 0), totalPaidVal)
          : formData.paymentType === 'Daily Wage'
          ? Number(formData.dailyRate || 0) * 30
          : Number(formData.monthlySalary || 0),
      totalSalaryPaid: totalPaidVal,
    };

    onSave(updatedStaff, deltaPaid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingStaff
                  ? language === 'EN'
                    ? 'Edit Office Staff & Payment'
                    : 'কর্মকর্তা ও পেমেন্ট তথ্য সংশোধন'
                  : language === 'EN'
                  ? 'Add New Office Staff Member'
                  : 'নতুন কর্মকর্তা ও কর্মী নিবন্ধন'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'EN'
                  ? 'Staff profile, daily/monthly/contract structure and payment sync'
                  : 'কর্মকর্তার প্রোফাইল, দৈনিক/মাসিক/চুক্তি পেমেন্ট এবং অটো লগ সিঙ্ক'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Row 1: ID & Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Staff ID' : 'স্টাফ আইডি'}
              </label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-400 font-mono font-bold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Full Name *' : 'পূর্ণ নাম *'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'EN' ? 'e.g. Ar. Tanvir Ahmed' : 'যেমন: স্থপতি তানভীর আহমেদ'}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 ${
                  errors.name ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.name && <p className="text-rose-400 text-[10px] mt-0.5">{errors.name}</p>}
            </div>
          </div>

          {/* Row 2: Designation & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Designation / Role *' : 'পদবি ও দায়িত্ব *'}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {defaultRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Department' : 'বিভাগ / ডিপার্টমেন্ট'}
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {defaultDepts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{language === 'EN' ? 'Mobile / Phone *' : 'মোবাইল নম্বর *'}</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 17xx-xxxxxx"
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono ${
                  errors.phone ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.phone && <p className="text-rose-400 text-[10px] mt-0.5">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{language === 'EN' ? 'Email Address' : 'ইমেইল ঠিকানা'}</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@advancesystem.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Payment Structure: Daily / Monthly / Contract */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'EN'
                ? 'Payment Structure (Day / Month / Contract) *'
                : 'বেতন কাঠামো (দৈনিক / মাসিক / চুক্তি) *'}
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'Daily Wage' })}
                className={`py-2 px-2 rounded-xl font-semibold border transition cursor-pointer ${
                  formData.paymentType === 'Daily Wage'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                📅 Daily (দৈনিক)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'Monthly Salary' })}
                className={`py-2 px-2 rounded-xl font-semibold border transition cursor-pointer ${
                  (formData.paymentType || 'Monthly Salary') === 'Monthly Salary'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                💼 Monthly (মাসিক)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'Contract Based' })}
                className={`py-2 px-2 rounded-xl font-semibold border transition cursor-pointer ${
                  formData.paymentType === 'Contract Based'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                📜 Contract (চুক্তি)
              </button>
            </div>
          </div>

          {/* Dynamic Payment Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            {formData.paymentType === 'Contract Based' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>
                      {language === 'EN'
                        ? 'Amount Paid / Given (৳) *'
                        : 'কত টাকা দেওয়া হলো (৳) *'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidNowAmount || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setPaidNowAmount(val);
                      if (!formData.monthlySalary || formData.monthlySalary < val) {
                        setFormData((prev) => ({ ...prev, monthlySalary: val }));
                      }
                    }}
                    placeholder={language === 'EN' ? 'Enter amount paid' : 'কত টাকা দেওয়া হলো'}
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teal-300 mb-1">
                    {language === 'EN'
                      ? 'Total Contract Deal (৳) (Optional)'
                      : 'চুক্তির মোট টাকা (৳) (ঐচ্ছিক)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlySalary || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </>
            ) : formData.paymentType === 'Daily Wage' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    {language === 'EN' ? 'Daily Wage Rate (৳) *' : 'দৈনিক রেট (৳) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dailyRate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>
                      {language === 'EN' ? 'Amount Paid Now (৳)' : 'কত টাকা দেওয়া হলো (৳)'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidNowAmount || ''}
                    onChange={(e) => setPaidNowAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>{language === 'EN' ? 'Monthly Salary (৳) *' : 'মাসিক মূল বেতন (৳) *'}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlySalary}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>
                      {language === 'EN' ? 'Amount Paid Now (৳)' : 'কত টাকা দেওয়া হলো (৳)'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidNowAmount || ''}
                    onChange={(e) => setPaidNowAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </>
            )}
          </div>

          {/* Row 4: Joining Date & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{language === 'EN' ? 'Joining Date' : 'যোগদানের তারিখ'}</span>
              </label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Employment Status' : 'বর্তমান স্ট্যাটাস'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Active">{language === 'EN' ? 'Active' : 'নিয়মিত / সক্রিয়'}</option>
                <option value="On Leave">{language === 'EN' ? 'On Leave' : 'ছুটিতে আছেন'}</option>
                <option value="Resigned">{language === 'EN' ? 'Resigned' : 'অব্যাহতিপ্রাপ্ত'}</option>
              </select>
            </div>
          </div>

          {/* Row 5: Payment Method & Bank/bKash Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-indigo-400" />
                <span>{language === 'EN' ? 'Salary Payment Mode' : 'বেতন প্রদানের মাধ্যম'}</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Bank Wire / BEFTN">Bank Wire / BEFTN (ব্যাংক ট্রান্সফার)</option>
                <option value="bKash / Nagad Corporate">bKash / Nagad (বিকাশ / নগদ)</option>
                <option value="Cash in Hand (হাতে নগদ)">Cash in Hand (হাতে নগদ ক্যাশ)</option>
                <option value="Account Payee Cheque">Account Payee Cheque (অ্যাকাউন্ট পে চেক)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Bank Account / bKash Number' : 'অ্যাকাউন্ট বা বিকাশ নম্বর'}
              </label>
              <input
                type="text"
                value={formData.bankOrBkashDetails || ''}
                onChange={(e) => setFormData({ ...formData, bankOrBkashDetails: e.target.value })}
                placeholder={
                  language === 'EN'
                    ? 'e.g. City Bank A/C: 123456 or bKash: 017...'
                    : 'যেমন: ডাচ-বাংলা ব্যাংক বা বিকাশ নং'
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 6: Notes & Responsibilities */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'EN' ? 'Notes & Responsibilities' : 'দায়িত্ব ও অতিরিক্ত নোট'}
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={
                language === 'EN'
                  ? 'Architectural project responsibilities, portfolio details...'
                  : 'প্রজেক্ট দায়িত্ব বা বিশেষ মন্তব্য...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save & Sync Staff' : 'সেভ ও লগে সিঙ্ক করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
