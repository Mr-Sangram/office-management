/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Monitor, Save, DollarSign, Calendar, Tag } from 'lucide-react';
import { OfficeAsset, CompanySettings, OfficeStaff } from '../../types';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: OfficeAsset) => void;
  editingAsset?: OfficeAsset | null;
  settings: CompanySettings;
  staff: OfficeStaff[];
  nextId: string;
  language: 'EN' | 'BN';
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  settings,
  staff,
  nextId,
  language,
}) => {
  const defaultCats = settings.assetCategories || [
    'High-End CAD/3D Workstations',
    'Laptops & Studio iPads',
    'Laser Distance Measurers & Scanners',
    'Printers, Plotters & Scanners',
    'Office Ergonomic Furniture & Desks',
    'Studio Site Inspection Vehicle / Bike',
    'Air Conditioning & Power Backup / IPS',
  ];

  const [formData, setFormData] = useState<OfficeAsset>({
    id: nextId,
    assetName: '',
    category: defaultCats[0] || 'High-End CAD/3D Workstations',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 35000,
    condition: 'Brand New',
    assignedTo: staff[0]?.name || 'Design Studio',
    serialNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingAsset) {
      setFormData(editingAsset);
    } else {
      setFormData({
        id: nextId,
        assetName: '',
        category: defaultCats[0] || 'High-End CAD/3D Workstations',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCost: 35000,
        condition: 'Brand New',
        assignedTo: staff[0]?.name || 'Design Studio',
        serialNumber: `SN-${Date.now().toString().slice(-6)}`,
        notes: '',
      });
    }
    setErrors({});
  }, [editingAsset, nextId, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.assetName.trim()) {
      errs.assetName = language === 'EN' ? 'Asset name is required' : 'সরঞ্জাম বা সম্পদের নাম দিন';
    }
    if (formData.purchaseCost <= 0) {
      errs.purchaseCost = language === 'EN' ? 'Valid cost is required' : 'সঠিক ক্রয়মূল্য দিন';
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
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingAsset
                  ? language === 'EN'
                    ? 'Edit Office Asset'
                    : 'অফিস সম্পদ বা সরঞ্জাম সংশোধন'
                  : language === 'EN'
                  ? 'Register New Office Asset'
                  : 'নতুন অফিস সম্পদ ও ইকুইপমেন্ট এন্ট্রি'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'EN'
                  ? 'Hardware, CAD workstations, laser measurers & studio tools'
                  : 'ওয়ার্কস্টেশন, লেজার মিটার ও অফিসের স্থায়ী সম্পদ'}
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
                {language === 'EN' ? 'Asset ID' : 'অ্যাসেট আইডি'}
              </label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-400 font-mono font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Asset Name *' : 'সরঞ্জাম / সম্পদের নাম *'}
              </label>
              <input
                type="text"
                value={formData.assetName}
                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                placeholder={language === 'EN' ? 'e.g. Dell Precision 3D Workstation' : 'যেমন: ডেল প্রিসিশন থ্রিডি ওয়ার্কস্টেশন'}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 ${
                  errors.assetName ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.assetName && <p className="text-rose-400 text-[10px] mt-0.5">{errors.assetName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Category' : 'ক্যাটাগরি'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {defaultCats.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>{language === 'EN' ? 'Purchase Cost (৳) *' : 'ক্রয়মূল্য (৳) *'}</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.purchaseCost}
                onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-indigo-500 ${
                  errors.purchaseCost ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.purchaseCost && <p className="text-rose-400 text-[10px] mt-0.5">{errors.purchaseCost}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{language === 'EN' ? 'Purchase Date' : 'ক্রয়ের তারিখ'}</span>
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Condition' : 'বর্তমান অবস্থা'}
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Brand New">{language === 'EN' ? 'Brand New' : 'নতুন / ব্র্যান্ড নিউ'}</option>
                <option value="Excellent">{language === 'EN' ? 'Excellent' : 'খুব ভালো'}</option>
                <option value="Good">{language === 'EN' ? 'Good' : 'চলতি অবস্থা'}</option>
                <option value="Needs Maintenance">{language === 'EN' ? 'Needs Maintenance' : 'মেরামত প্রয়োজন'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Assigned To' : 'কার দায়িত্বে আছে'}
              </label>
              <input
                type="text"
                list="staff-list-options"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder={language === 'EN' ? 'Person or Studio' : 'ব্যক্তি বা স্টুডিও'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <datalist id="staff-list-options">
                <option value="Design Studio" />
                <option value="Conference Room" />
                <option value="Site Team" />
                {staff.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Serial Number / Tag' : 'সিরিয়াল নম্বর বা ট্যাগ'}
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="SN-123456"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'EN' ? 'Warranty / Notes' : 'ওয়ারেন্টি ও নোট'}
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={language === 'EN' ? '3 Years replacement warranty...' : '৩ বছর রিপ্লেসমেন্ট ওয়ারেন্টি...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Asset' : 'সম্পদ সেভ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
