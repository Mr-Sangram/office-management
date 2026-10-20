/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  Check,
  Landmark,
  Layers,
  Plus,
} from 'lucide-react';
import { CompanySettings } from '../../types';

interface SettingsViewProps {
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onSaveSettings: (newSettings: CompanySettings) => void;
}

type DropdownFieldKey =
  | 'projectTypes'
  | 'projectStatuses'
  | 'clientTypes'
  | 'installmentNames'
  | 'materialCategories'
  | 'unitsOfMeasurement'
  | 'suppliers'
  | 'labourTypes'
  | 'expenseCategories'
  | 'dailySubcategories'
  | 'conveyanceModes'
  | 'employees'
  | 'staffRoles'
  | 'officeDepartments'
  | 'billTypes'
  | 'assetCategories'
  | 'paymentMethods';

interface DropdownCardConfig {
  key: DropdownFieldKey;
  sheetCode: string;
  titleBn: string;
  titleEn: string;
  placeholder: string;
  badgeColor: string;
  btnColor: string;
}

const ALL_SHEET_DROPDOWN_CONFIGS: DropdownCardConfig[] = [
  {
    key: 'clientTypes',
    sheetCode: '03_Clients',
    titleBn: 'ক্লায়েন্টের ধরন (Client Types)',
    titleEn: 'Client Types (Sheet 03)',
    placeholder: 'যেমন: Duplex / Corporate / Retail',
    badgeColor: 'text-sky-400',
    btnColor: 'bg-sky-600 hover:bg-sky-500',
  },
  {
    key: 'projectTypes',
    sheetCode: '04_Projects',
    titleBn: 'প্রজেক্টের ধরন (Project Types)',
    titleEn: 'Project Types (Sheet 04)',
    placeholder: 'যেমন: Penthouse Renovation',
    badgeColor: 'text-teal-400',
    btnColor: 'bg-teal-600 hover:bg-teal-500',
  },
  {
    key: 'projectStatuses',
    sheetCode: '04_Projects',
    titleBn: 'প্রজেক্ট স্ট্যাটাস (Project Statuses)',
    titleEn: 'Project Statuses (Sheet 04)',
    placeholder: 'যেমন: Handover Ready',
    badgeColor: 'text-emerald-400',
    btnColor: 'bg-emerald-600 hover:bg-emerald-500',
  },
  {
    key: 'materialCategories',
    sheetCode: '05_Materials',
    titleBn: 'উপকরণ ও মালামাল ক্যাটাগরি (Material Categories)',
    titleEn: 'Material Categories (Sheet 05)',
    placeholder: 'যেমন: Acoustic Wall Panels',
    badgeColor: 'text-amber-400',
    btnColor: 'bg-amber-600 hover:bg-amber-500',
  },
  {
    key: 'unitsOfMeasurement',
    sheetCode: '05_Materials & 06_Txns',
    titleBn: 'পরিমাপের একক (Units of Measurement)',
    titleEn: 'Units of Measurement (Sheets 05 & 06)',
    placeholder: 'যেমন: Sheets, Sq.Ft, Rft, Pcs, Cft',
    badgeColor: 'text-purple-400',
    btnColor: 'bg-purple-600 hover:bg-purple-500',
  },
  {
    key: 'suppliers',
    sheetCode: '05_Materials & 07_Suppliers',
    titleBn: 'সাপ্লায়ার ও ভেন্ডর তালিকা (Suppliers List)',
    titleEn: 'Suppliers & Vendors (Sheets 05 & 07)',
    placeholder: 'যেমন: Hatim & Akij Board Depot',
    badgeColor: 'text-orange-400',
    btnColor: 'bg-orange-600 hover:bg-orange-500',
  },
  {
    key: 'labourTypes',
    sheetCode: '08_Labour_Attendance',
    titleBn: 'মিস্ত্রি ও কারিগরের কাজের ধরন (Craftsman Trades)',
    titleEn: 'Craftsman & Labour Trades (Sheet 08)',
    placeholder: 'যেমন: বোর্ড কন্ট্রাক্টর / CNC Specialist',
    badgeColor: 'text-yellow-400',
    btnColor: 'bg-yellow-600 hover:bg-yellow-500',
  },
  {
    key: 'installmentNames',
    sheetCode: '09_Payments_Received',
    titleBn: 'ক্লায়েন্ট পেমেন্ট কিস্তির নাম (Installment Stages)',
    titleEn: 'Payment Installment Names (Sheet 09)',
    placeholder: 'যেমন: 2nd Running Bill (Carpentry)',
    badgeColor: 'text-emerald-400',
    btnColor: 'bg-emerald-600 hover:bg-emerald-500',
  },
  {
    key: 'expenseCategories',
    sheetCode: '10_Expenses',
    titleBn: 'খরচের খাত সমূহ (Expense Categories)',
    titleEn: 'Expense Categories (Sheet 10)',
    placeholder: 'যেমন: Site Transport & Carrying',
    badgeColor: 'text-rose-400',
    btnColor: 'bg-rose-600 hover:bg-rose-500',
  },
  {
    key: 'dailySubcategories',
    sheetCode: '10_Daily_Costs',
    titleBn: 'দৈনিক খরচ ও কনভেয়েন্স খাত (Daily Cost Subcategories)',
    titleEn: 'Daily Cost Subcategories (Sheet 10)',
    placeholder: 'যেমন: Site Visit / Tea & Snacks',
    badgeColor: 'text-pink-400',
    btnColor: 'bg-pink-600 hover:bg-pink-500',
  },
  {
    key: 'conveyanceModes',
    sheetCode: '10_Daily_Costs',
    titleBn: 'যাতায়াতের মাধ্যম (Conveyance Modes)',
    titleEn: 'Conveyance & Transport Modes (Sheet 10)',
    placeholder: 'যেমন: Rickshaw, CNG, Pathao, Metro Rail',
    badgeColor: 'text-cyan-400',
    btnColor: 'bg-cyan-600 hover:bg-cyan-500',
  },
  {
    key: 'employees',
    sheetCode: '04, 09, 10 & 11_Tasks',
    titleBn: 'প্রজেক্ট ম্যানেজার ও দায়িত্বপ্রাপ্ত কর্মকর্তা (Managers & Staff)',
    titleEn: 'Project Managers & Approvers (All Sheets)',
    placeholder: 'যেমন: Engr. Kamrul Hasan',
    badgeColor: 'text-indigo-400',
    btnColor: 'bg-indigo-600 hover:bg-indigo-500',
  },
  {
    key: 'staffRoles',
    sheetCode: '12_Office_Staff',
    titleBn: 'অফিস কর্মকর্তার পদবি (Staff Designations)',
    titleEn: 'Office Staff Designations (Sheet 12)',
    placeholder: 'যেমন: Senior Interior Designer',
    badgeColor: 'text-indigo-400',
    btnColor: 'bg-indigo-600 hover:bg-indigo-500',
  },
  {
    key: 'officeDepartments',
    sheetCode: '12_Office_Staff',
    titleBn: 'অফিস ডিপার্টমেন্ট / বিভাগ (Studio Departments)',
    titleEn: 'Office Departments (Sheet 12)',
    placeholder: 'যেমন: 3D Visualization Lab',
    badgeColor: 'text-teal-400',
    btnColor: 'bg-teal-600 hover:bg-teal-500',
  },
  {
    key: 'billTypes',
    sheetCode: '12_Office_Bills',
    titleBn: 'অফিস বিল ও ভাড়ার খাত (Office Bill Types)',
    titleEn: 'Office Bill & Utility Types (Sheet 12)',
    placeholder: 'যেমন: Office Rent / Generator Fuel',
    badgeColor: 'text-amber-400',
    btnColor: 'bg-amber-600 hover:bg-amber-500',
  },
  {
    key: 'assetCategories',
    sheetCode: '12_Office_Assets',
    titleBn: 'অফিস সম্পদ ও যন্ত্রপাতি ক্যাটাগরি (Asset Categories)',
    titleEn: 'Office Equipment Categories (Sheet 12)',
    placeholder: 'যেমন: Workstation PC & Laptop',
    badgeColor: 'text-cyan-400',
    btnColor: 'bg-cyan-600 hover:bg-cyan-500',
  },
  {
    key: 'paymentMethods',
    sheetCode: 'All Financial Sheets',
    titleBn: 'লেনদেন ও পেমেন্ট মেথড (Payment Methods)',
    titleEn: 'Payment Methods (All Sheets)',
    placeholder: 'যেমন: Bank Transfer / bKash / Cash in Hand',
    badgeColor: 'text-emerald-400',
    btnColor: 'bg-emerald-600 hover:bg-emerald-500',
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  language,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const addItem = (field: DropdownFieldKey) => {
    const val = (newItemInputs[field] || '').trim();
    if (!val) return;
    const currentList = (formData[field] as string[] | undefined) || [];
    if (!currentList.includes(val)) {
      const updated = {
        ...formData,
        [field]: [...currentList, val],
      };
      setFormData(updated);
      onSaveSettings(updated);
      setNewItemInputs({ ...newItemInputs, [field]: '' });
    }
  };

  const removeItem = (field: DropdownFieldKey, indexToRemove: number) => {
    const currentList = (formData[field] as string[] | undefined) || [];
    const updated = {
      ...formData,
      [field]: currentList.filter((_, idx) => idx !== indexToRemove),
    };
    setFormData(updated);
    onSaveSettings(updated);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN'
                ? 'Company Master Settings, Bank Info & All Sheet Dropdowns'
                : 'কোম্পানি সেটিংস, ব্যাংক ডিটেইলস ও সকল শিটের ড্রপডাউন'}
            </h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
              01 & 02_Master_Settings
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Manage company profile, bank accounts, mobile banking, and customize dropdown options for all 14 sheets in one place.'
              : 'কোম্পানির নাম, ব্যাংক অ্যাকাউন্ট, বিকাশ/নগদ নম্বর এবং সকল শিটের (১-১৪) ড্রপডাউন অপশন এখান থেকে ইচ্ছেমতো যোগ বা পরিবর্তন করুন।'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition self-start md:self-auto cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>
            {savedSuccess
              ? language === 'EN'
                ? 'Saved Successfully!'
                : 'সংরক্ষিত হয়েছে!'
              : language === 'EN'
              ? 'Save All Settings'
              : 'সব সেটিংস সংরক্ষণ করুন'}
          </span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Company Profile & Letterhead Branding */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Building className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'EN'
                ? '1. Company Profile, Contact & Legal Info'
                : '১. কোম্পানি পরিচিতি, ঠিকানা ও লাইসেন্স তথ্য'}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Company Name' : 'কোম্পানির নাম'}
              </label>
              <input
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Tagline / Motto' : 'ট্যাগলাইন / স্লোগান'}
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Owner / Authorized Signatory' : 'মালিক / স্বাক্ষরকারীর নাম ও পদবি'}
              </label>
              <input
                type="text"
                value={formData.ownerSignatoryName || ''}
                onChange={(e) => setFormData({ ...formData, ownerSignatoryName: e.target.value })}
                placeholder="Managing Director / Principal Architect"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Hotline / Phone' : 'হটলাইন / মোবাইল নম্বর'}
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Email Address' : 'অফিসিয়াল ইমেইল'}
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Website URL' : 'ওয়েবসাইট ঠিকানা'}
              </label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="www.yourcompany.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Studio / Head Office Address' : 'অফিসের পূর্ণ ঠিকানা'}
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Trade License & BIN / TIN' : 'ট্রেড লাইসেন্স ও টিন/বিন নম্বর'}
              </label>
              <input
                type="text"
                value={formData.tradeLicenseNo || ''}
                onChange={(e) => setFormData({ ...formData, tradeLicenseNo: e.target.value })}
                placeholder="TRAD/DNCC/... | BIN: ..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Currency Code & Symbol' : 'কারেন্সি কোড ও প্রতীক'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.currency || 'BDT'}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="BDT"
                  className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  value={formData.currencySymbol || '৳'}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  placeholder="৳"
                  className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Standard VAT / Tax Rate (%)' : 'ভ্যাট / ট্যাক্স হার (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.taxVatRate ?? 0}
                onChange={(e) => setFormData({ ...formData, taxVatRate: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Default Overhead Rate (%)' : 'ডিফল্ট অফিস ওভারহেড (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.defaultOverheadPercentage ?? 5}
                onChange={(e) =>
                  setFormData({ ...formData, defaultOverheadPercentage: Number(e.target.value) })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Company Bank Account & Mobile Banking Details */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'EN'
                  ? '2. Company Bank Account & Mobile Banking (bKash / Nagad) Details'
                  : '২. কোম্পানির ব্যাংক অ্যাকাউন্ট ও মোবাইল ব্যাংকিং (বিকাশ/নগদ) তথ্য'}
              </span>
            </h3>
            <span className="text-[11px] text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              ইনভয়েস, মানি রিসিট ও পেমেন্টের জন্য ব্যবহৃত হবে
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-emerald-300 font-semibold mb-1">
                {language === 'EN' ? 'Bank Name' : 'ব্যাংকের নাম (Bank Name)'}
              </label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="যেমন: City Bank PLC / Dutch-Bangla Bank"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-emerald-300 font-semibold mb-1">
                {language === 'EN' ? 'Bank Account Title / Name' : 'অ্যাকাউন্টের নাম (Account Name)'}
              </label>
              <input
                type="text"
                value={formData.bankAccountName || ''}
                onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                placeholder="যেমন: Advance System Company Management"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-emerald-300 font-semibold mb-1">
                {language === 'EN' ? 'Bank Account Number' : 'ব্যাংক অ্যাকাউন্ট নম্বর (A/C No)'}
              </label>
              <input
                type="text"
                value={formData.bankAccountNumber || ''}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                placeholder="যেমন: 1402938475001"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Branch Name' : 'শাখার নাম (Branch Name)'}
              </label>
              <input
                type="text"
                value={formData.bankBranch || ''}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                placeholder="যেমন: Banani Corporate Branch, Dhaka"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Routing / SWIFT Number' : 'রাউটিং নম্বর (Routing No)'}
              </label>
              <input
                type="text"
                value={formData.routingNumber || ''}
                onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                placeholder="যেমন: 225260438"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-amber-300 font-semibold mb-1">
                {language === 'EN'
                  ? 'bKash / Nagad / Rocket Numbers'
                  : 'বিকাশ / নগদ মার্চেন্ট ও পার্সোনাল নম্বর'}
              </label>
              <input
                type="text"
                value={formData.bkashNagadNumber || ''}
                onChange={(e) => setFormData({ ...formData, bkashNagadNumber: e.target.value })}
                placeholder="যেমন: 01711-000000 (bKash/Nagad)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN'
                  ? 'Invoice & Receipt Payment Note / Terms'
                  : 'ইনভয়েস ও মানি রিসিটের নিচে ব্যাংক/পেমেন্ট নির্দেশনা নোট'}
              </label>
              <input
                type="text"
                value={formData.invoiceFooterNote || ''}
                onChange={(e) => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
                placeholder="যেমন: সকল চেক ও ব্যাংক ট্রান্সফার কোম্পানির অনুমোদিত ব্যাংক অ্যাকাউন্টে প্রদান করার অনুরোধ করা হলো।"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: All Sheets' Dynamic Dropdown Lists */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {language === 'EN'
                    ? '3. All Sheets Master Dropdown Options (17 Categories)'
                    : '৩. সকল শিটের মাস্টার ড্রপডাউন অপশন সমূহ (১৭টি ক্যাটাগরি)'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'EN'
                    ? 'Add or remove options below — they immediately appear in the respective forms & sheets.'
                    : 'যেকোনো বক্সে নতুন নাম লিখে "+ যোগ করুন" বাটনে ক্লিক করলেই সংশ্লিষ্ট শিটের ফর্মে সেই অপশন চলে আসবে।'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALL_SHEET_DROPDOWN_CONFIGS.map((cfg) => {
              const items = (formData[cfg.key] as string[] | undefined) || [];
              const inputVal = newItemInputs[cfg.key] || '';

              return (
                <div
                  key={cfg.key}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-xs">
                        {language === 'EN' ? cfg.titleEn : cfg.titleBn}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Sheet: {cfg.sheetCode}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${cfg.badgeColor}`}>
                      {items.length} টি অপশন
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) =>
                        setNewItemInputs({ ...newItemInputs, [cfg.key]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem(cfg.key);
                        }
                      }}
                      placeholder={cfg.placeholder}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => addItem(cfg.key)}
                      className={`px-3 py-1.5 ${cfg.btnColor} text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'EN' ? 'Add' : 'যোগ করুন'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pt-1">
                    {items.map((itemText, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-lg text-[11px] text-slate-200"
                      >
                        <span>{itemText}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(cfg.key, idx)}
                          title="মুছে ফেলুন"
                          className="text-slate-400 hover:text-rose-400 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
};
