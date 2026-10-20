/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Truck, Save, DollarSign } from 'lucide-react';
import { Supplier, CompanySettings } from '../../types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  editingSupplier?: Supplier | null;
  settings: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSupplier,
  settings,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<Supplier>>({
    id: nextId,
    name: '',
    phone: '',
    address: '',
    materialSupplied: 'General Hardware',
    totalBilled: 0,
    totalPaid: 0,
    outstandingDue: 0,
    status: 'Active',
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormData(editingSupplier);
    } else {
      setFormData({
        id: nextId,
        name: '',
        phone: '',
        address: '',
        materialSupplied: settings.materialCategories[0] || 'General Hardware',
        totalBilled: 0,
        totalPaid: 0,
        outstandingDue: 0,
        status: 'Active',
      });
    }
  }, [editingSupplier, nextId, settings, isOpen]);

  // Auto-calculate outstanding due balance when totalBilled or totalPaid changes
  const handleBilledChange = (val: number) => {
    const paid = Number(formData.totalPaid || 0);
    setFormData((prev) => ({
      ...prev,
      totalBilled: val,
      outstandingDue: Math.max(0, val - paid),
    }));
  };

  const handlePaidChange = (val: number) => {
    const billed = Number(formData.totalBilled || 0);
    setFormData((prev) => ({
      ...prev,
      totalPaid: val,
      outstandingDue: Math.max(0, billed - val),
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const billed = Number(formData.totalBilled || 0);
    const paid = Number(formData.totalPaid || 0);
    const due = Number(formData.outstandingDue ?? Math.max(0, billed - paid));

    onSave({
      id: formData.id || nextId,
      name: formData.name.trim(),
      phone: formData.phone?.trim() || '+880 1700-000000',
      address: formData.address?.trim() || 'Dhaka, Bangladesh',
      materialSupplied: formData.materialSupplied?.trim() || 'General Hardware',
      totalBilled: billed,
      totalPaid: paid,
      outstandingDue: due,
      status: formData.status || 'Active',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {editingSupplier
                  ? language === 'EN'
                    ? 'Edit Supplier Details'
                    : 'সাপ্লায়ার তথ্য পরিবর্তন করুন'
                  : language === 'EN'
                  ? 'Add New Supplier'
                  : 'নতুন সাপ্লায়ার ও ভেন্ডর যোগ করুন'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'EN'
                  ? 'Manage vendor contact, supplied items, and billed balances'
                  : 'সাপ্লায়ার নাম, মোবাইল, সরবরাহকৃত পণ্য ও বকেয়া তথ্য পূরণ করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Supplier ID</label>
              <input
                type="text"
                disabled
                value={formData.id || nextId}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Status' : 'স্ট্যাটাস'}
              </label>
              <select
                value={formData.status || 'Active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="Active">Active (সক্রিয়)</option>
                <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Supplier / Company Name *' : 'সাপ্লায়ার / প্রতিষ্ঠানের নাম *'}
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={
                language === 'EN'
                  ? 'e.g. Bengal Glass & Hardware Store'
                  : 'যেমন: মেসার্স বেঙ্গল গ্লাস অ্যান্ড হার্ডওয়্যার'
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Mobile / Contact' : 'মোবাইল / যোগাযোগের নম্বর'}
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 1700-000000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Supplied Items / Trade' : 'সরবরাহকৃত মালামালের ধরন'}
              </label>
              <input
                type="text"
                list="vendor-categories-list"
                value={formData.materialSupplied || ''}
                onChange={(e) => setFormData({ ...formData, materialSupplied: e.target.value })}
                placeholder="Hardware, Tiles, Plywood, Glass..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <datalist id="vendor-categories-list">
                {settings.materialCategories.map((cat: string) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Office / Shop Address' : 'দোকান বা অফিসের ঠিকানা'}
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Tejgaon Industrial Area, Dhaka"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Financials Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>
                {language === 'EN' ? 'Financials & Billed Balance' : 'বিলিংস ও পেমেন্ট হিসাব'}
              </span>
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">
                  {language === 'EN' ? 'Total Billed' : 'মোট বিল'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalBilled || 0}
                  onChange={(e) => handleBilledChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1">
                  {language === 'EN' ? 'Total Paid' : 'পরিশোধিত'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalPaid || 0}
                  onChange={(e) => handlePaidChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1">
                  {language === 'EN' ? 'Due Balance' : 'বকেয়া পাওনা'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.outstandingDue || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, outstandingDue: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-rose-400 font-mono text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              {language === 'EN' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Supplier' : 'সাপ্লায়ার সেভ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
