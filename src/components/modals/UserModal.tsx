/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Save,
  User,
  Mail,
  Phone,
  KeyRound,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  PlusCircle,
  Edit3,
  Trash2,
} from 'lucide-react';
import { AppUser, UserRole, ModuleKey } from '../../types';
import { ROLE_PRESET_PERMISSIONS } from '../../data/initialData';
import { normalizePermissions } from '../../utils/permissions';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: AppUser) => void;
  editingUser?: AppUser | null;
  nextId: string;
  language: 'EN' | 'BN';
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingUser,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<AppUser>({
    id: nextId,
    name: '',
    email: '',
    phone: '',
    role: 'Manager',
    pin: '1234',
    status: 'Active',
    avatar: '👔',
    notes: '',
    permissions: normalizePermissions('Manager'),
    createdAt: new Date().toISOString().split('T')[0],
  });

  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingUser) {
      setFormData({
        ...editingUser,
        permissions: normalizePermissions(editingUser.role, editingUser.permissions),
      });
    } else {
      setFormData({
        id: nextId,
        name: '',
        email: '',
        phone: '',
        role: 'Manager',
        pin: String(Math.floor(1000 + Math.random() * 9000)),
        status: 'Active',
        avatar: '👔',
        notes: '',
        permissions: normalizePermissions('Manager'),
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [editingUser, nextId, isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    const avatarMap: Record<UserRole, string> = {
      Owner: '👑',
      Manager: '👔',
      'Site Supervisor': '👷',
      Accountant: '💼',
      Custom: '👤',
      Client: '🌐',
    };

    setFormData((prev) => ({
      ...prev,
      role,
      avatar: avatarMap[role] || '👤',
      permissions: normalizePermissions(role),
    }));
  };

  const handleActionToggle = (moduleKey: ModuleKey, actionKey: string) => {
    setFormData((prev) => {
      const currentModules = prev.permissions.modules
        ? JSON.parse(JSON.stringify(prev.permissions.modules))
        : normalizePermissions(prev.role).modules;

      const mod = currentModules[moduleKey] || {};
      const nextVal = !mod[actionKey];
      mod[actionKey] = nextVal;

      // If enabling Add, Edit, or Delete, automatically enable View
      if (actionKey !== 'view' && nextVal) {
        mod.view = true;
      }
      // If disabling View, disable Add, Edit, Delete for that module
      if (actionKey === 'view' && !nextVal) {
        if ('add' in mod) mod.add = false;
        if ('edit' in mod) mod.edit = false;
        if ('delete' in mod) mod.delete = false;
        if ('disburseSalary' in mod) mod.disburseSalary = false;
        if ('export' in mod) mod.export = false;
        if ('sync' in mod) mod.sync = false;
        if ('restore' in mod) mod.restore = false;
      }

      currentModules[moduleKey] = mod;
      return {
        ...prev,
        permissions: normalizePermissions(prev.role, { modules: currentModules }),
      };
    });
  };

  const applyMatrixPreset = (presetType: 'ALL' | 'NO_DELETE' | 'VIEW_ADD' | 'VIEW_ONLY') => {
    setFormData((prev) => {
      const m = JSON.parse(JSON.stringify(ROLE_PRESET_PERMISSIONS['Owner'].modules));
      Object.keys(m).forEach((k) => {
        const mod = m[k];
        if (presetType === 'ALL') {
          Object.keys(mod).forEach((act) => (mod[act] = true));
        } else if (presetType === 'NO_DELETE') {
          Object.keys(mod).forEach((act) => (mod[act] = act !== 'delete' && act !== 'restore'));
        } else if (presetType === 'VIEW_ADD') {
          Object.keys(mod).forEach((act) => (mod[act] = act === 'view' || act === 'add'));
        } else if (presetType === 'VIEW_ONLY') {
          Object.keys(mod).forEach((act) => (mod[act] = act === 'view'));
        }
      });
      return {
        ...prev,
        role: 'Custom',
        permissions: normalizePermissions('Custom', { modules: m }),
      };
    });
  };

  const generateRandomPin = () => {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    setFormData((prev) => ({ ...prev, pin }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = language === 'EN' ? 'User name is required' : 'ব্যবহারকারীর নাম আবশ্যক';
    }
    if (!formData.email.trim()) {
      errs.email = language === 'EN' ? 'Email is required' : 'ইমেইল আবশ্যক';
    }
    if (!formData.pin.trim() || formData.pin.length < 4) {
      errs.pin = language === 'EN' ? 'PIN must be at least 4 digits' : 'কমপক্ষে ৪ ডিজিটের পিন দিন';
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

  const modulesList: {
    key: ModuleKey;
    labelEn: string;
    labelBn: string;
    actions: { key: string; labelEn: string; labelBn: string }[];
  }[] = [
    {
      key: 'dashboard',
      labelEn: '📊 Main Dashboard',
      labelBn: '📊 মেইন ড্যাশবোর্ড',
      actions: [{ key: 'view', labelEn: 'View', labelBn: 'দেখা' }],
    },
    {
      key: 'projects',
      labelEn: '📁 Projects & Tasks',
      labelBn: '📁 প্রজেক্ট ও টাস্ক',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'add', labelEn: 'Add (+)', labelBn: 'যোগ (+)' },
        { key: 'edit', labelEn: 'Edit', labelBn: 'এডিট' },
        { key: 'delete', labelEn: 'Delete', labelBn: 'ডিলিট' },
      ],
    },
    {
      key: 'clients',
      labelEn: '👥 Client Management',
      labelBn: '👥 ক্লায়েন্ট ও চুক্তি',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'add', labelEn: 'Add (+)', labelBn: 'যোগ (+)' },
        { key: 'edit', labelEn: 'Edit', labelBn: 'এডিট' },
        { key: 'delete', labelEn: 'Delete', labelBn: 'ডিলিট' },
      ],
    },
    {
      key: 'dailyCosts',
      labelEn: '🚗 Daily Costs & Conveyance',
      labelBn: '🚗 দৈনিক যাতায়াত ও চা-নাস্তা',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'add', labelEn: 'Add (+)', labelBn: 'যোগ (+)' },
        { key: 'edit', labelEn: 'Edit', labelBn: 'এডিট' },
        { key: 'delete', labelEn: 'Delete', labelBn: 'ডিলিট' },
      ],
    },
    {
      key: 'expenses',
      labelEn: '🧾 Site & Office Expenses',
      labelBn: '🧾 প্রজেক্ট ও অফিস ব্যয়',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'add', labelEn: 'Add (+)', labelBn: 'যোগ (+)' },
        { key: 'edit', labelEn: 'Edit', labelBn: 'এডিট' },
        { key: 'delete', labelEn: 'Delete', labelBn: 'ডিলিট' },
      ],
    },
    {
      key: 'inventory',
      labelEn: '📦 Materials & Suppliers',
      labelBn: '📦 উপকরণ ও সাপ্লায়ার',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'add', labelEn: 'Add (+)', labelBn: 'যোগ (+)' },
        { key: 'edit', labelEn: 'Edit', labelBn: 'এডিট' },
        { key: 'delete', labelEn: 'Delete', labelBn: 'ডিলিট' },
      ],
    },
    {
      key: 'labour',
      labelEn: '👷 Labour & Mistri Logs',
      labelBn: '👷 লেবার ও মিস্ত্রি হাজিরা',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'add', labelEn: 'Add (+)', labelBn: 'যোগ (+)' },
        { key: 'edit', labelEn: 'Edit', labelBn: 'এডিট' },
        { key: 'delete', labelEn: 'Delete', labelBn: 'ডিলিট' },
      ],
    },
    {
      key: 'staff',
      labelEn: '💼 Office Staff & Payroll',
      labelBn: '💼 স্টাফ বেতন ও অফিস হিসাব',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'add', labelEn: 'Add (+)', labelBn: 'যোগ (+)' },
        { key: 'edit', labelEn: 'Edit', labelBn: 'এডিট' },
        { key: 'disburseSalary', labelEn: 'Pay Salary', labelBn: 'বেতন প্রদান' },
        { key: 'delete', labelEn: 'Delete', labelBn: 'ডিলিট' },
      ],
    },
    {
      key: 'reports',
      labelEn: '📈 Profit/Loss & Reports',
      labelBn: '📈 লাভ-ক্ষতি ও অডিট রিপোর্ট',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'export', labelEn: 'Export Excel', labelBn: 'এক্সেল ডাউনলোড' },
      ],
    },
    {
      key: 'settings',
      labelEn: '⚙️ Company Settings',
      labelBn: '⚙️ কোম্পানি সেটিংস',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'edit', labelEn: 'Modify Settings', labelBn: 'পরিবর্তন' },
      ],
    },
    {
      key: 'cloudSync',
      labelEn: '☁️ Cloud & Drive Backup',
      labelBn: '☁️ ক্লাউড ও ড্রাইভ ব্যাকআপ',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'sync', labelEn: 'Sync Now', labelBn: 'সিঙ্ক করা' },
        { key: 'restore', labelEn: 'Restore DB', labelBn: 'রিস্টোর' },
      ],
    },
    {
      key: 'users',
      labelEn: '🛡️ Team & Access Control',
      labelBn: '🛡️ টিম মেম্বার ও পারমিশন',
      actions: [
        { key: 'view', labelEn: 'View', labelBn: 'দেখা' },
        { key: 'add', labelEn: 'Add (+)', labelBn: 'যোগ (+)' },
        { key: 'edit', labelEn: 'Edit', labelBn: 'এডিট' },
        { key: 'delete', labelEn: 'Delete', labelBn: 'ডিলিট' },
      ],
    },
  ];

  const currentModules = formData.permissions.modules || normalizePermissions(formData.role).modules;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {editingUser
                  ? language === 'EN'
                    ? 'Edit User & Granular CRUD Permissions'
                    : 'মেম্বার ও সূক্ষ্ম (Add/Edit/Delete) পারমিশন সম্পাদনা'
                  : language === 'EN'
                  ? 'Add Team Member & Granular Access'
                  : 'নতুন টিম মেম্বার যুক্ত ও এক্সেস নির্ধারণ'}
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                  {formData.id}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'EN'
                  ? 'Define exact View, Add (+), Edit, and Delete permissions for each module'
                  : 'প্রতিটি মডিউলের জন্য আলাদাভাবে দেখা (View), যোগ (Add), এডিট (Edit) ও ডিলিট (Delete) পারমিশন দিন'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Identity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'EN' ? 'Full Name' : 'পূর্ণ নাম'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === 'EN' ? 'e.g. Md. Rafiqul Islam' : 'যেমন: মো: রফিকুল ইসলাম'}
                  className={`w-full bg-slate-950 border ${
                    errors.name ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            {/* Email / Login ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'EN' ? 'Email / Username' : 'ইমেইল / ইউজার আইডি'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="manager@interiorcraft.com"
                  className={`w-full bg-slate-950 border ${
                    errors.email ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'EN' ? 'Phone Number' : 'মোবাইল নম্বর'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+880 1712-345678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 4-digit PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {language === 'EN' ? 'Login PIN / Password' : 'লগইন পিন / পাসওয়ার্ড'}{' '}
                  <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomPin}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {language === 'EN' ? 'Generate PIN' : 'অটো পিন'}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={8}
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  placeholder="1234"
                  className={`w-full bg-slate-950 border ${
                    errors.pin ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl pl-9 pr-10 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.pin && <p className="text-[11px] text-rose-400 mt-1">{errors.pin}</p>}
            </div>
          </div>

          {/* Role Templates */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {language === 'EN' ? '1. Select Role Template:' : '১. রোল টেমপ্লেট নির্বাচন করুন:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Owner', 'Manager', 'Site Supervisor', 'Accountant', 'Custom'] as UserRole[]).map((r) => {
                const isSelected = formData.role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-sm ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-slate-200 block truncate">{r}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {r === 'Owner'
                        ? 'All CRUD'
                        : r === 'Manager'
                        ? 'Add/Edit Sites'
                        : r === 'Site Supervisor'
                        ? 'Add Site Logs'
                        : r === 'Accountant'
                        ? 'Accounts & Pay'
                        : 'Custom Matrix'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Field-Level Action Matrix */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'EN'
                    ? '2. Granular Action Permissions (View / Add / Edit / Delete)'
                    : '২. মডিউল ভিত্তিক সূক্ষ্ম পারমিশন (দেখা / যোগ / এডিট / ডিলিট)'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'EN'
                    ? 'Customize exactly which actions this user can execute inside each section'
                    : 'এই ইউজার কোন সেকশনে কী অ্যাকশন করতে পারবেন তা টিক চিহ্ন দিয়ে নির্ধারণ করুন'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyMatrixPreset('ALL')}
                  className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold transition"
                >
                  {language === 'EN' ? 'Full Access' : 'সব চালু'}
                </button>
                <button
                  type="button"
                  onClick={() => applyMatrixPreset('NO_DELETE')}
                  className="px-2 py-1 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold transition"
                >
                  {language === 'EN' ? 'No Delete' : 'ডিলিট ছাড়া সব'}
                </button>
                <button
                  type="button"
                  onClick={() => applyMatrixPreset('VIEW_ADD')}
                  className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-semibold transition"
                >
                  {language === 'EN' ? 'View & Add Only' : 'শুধু দেখা ও যোগ'}
                </button>
                <button
                  type="button"
                  onClick={() => applyMatrixPreset('VIEW_ONLY')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-semibold transition"
                >
                  {language === 'EN' ? 'View Only' : 'শুধুমাত্র দেখা'}
                </button>
              </div>
            </div>

            {/* Matrix Rows */}
            <div className="divide-y divide-slate-800/70">
              {modulesList.map((mod) => {
                const modPerms = (currentModules as any)[mod.key] || {};
                const isViewEnabled = !!modPerms.view;

                return (
                  <div
                    key={mod.key}
                    className={`py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg transition ${
                      isViewEnabled ? 'bg-slate-900/40' : 'opacity-60'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-200 min-w-[200px]">
                      {language === 'EN' ? mod.labelEn : mod.labelBn}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {mod.actions.map((act) => {
                        const checked = !!modPerms[act.key];
                        const isDelete = act.key === 'delete' || act.key === 'restore';

                        return (
                          <button
                            key={act.key}
                            type="button"
                            onClick={() => handleActionToggle(mod.key, act.key)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                              checked
                                ? isDelete
                                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                                  : act.key === 'view'
                                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                                checked
                                  ? isDelete
                                    ? 'bg-rose-500 text-white'
                                    : act.key === 'view'
                                    ? 'bg-sky-500 text-slate-950'
                                    : 'bg-emerald-500 text-slate-950'
                                  : 'border border-slate-700 bg-slate-950'
                              }`}
                            >
                              {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span>{language === 'EN' ? act.labelEn : act.labelBn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Status & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'EN' ? 'Account Status' : 'অ্যাকাউন্ট স্ট্যাটাস'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Active">{language === 'EN' ? 'Active (Can Log in)' : 'সক্রিয় (লগইন চালু)'}</option>
                <option value="Suspended">{language === 'EN' ? 'Suspended (Blocked)' : 'স্থগিত (সাময়িক বন্ধ)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'EN' ? 'Notes / Responsibility' : 'মন্তব্য বা দায়িত্ব বিবরণী'}
              </label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={language === 'EN' ? 'e.g. Banani & Gulshan Site Manager' : 'যেমন: বনানী ও গুলশান সাইটের দায়িত্বে'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <p className="text-xs text-slate-400">
            {language === 'EN'
              ? 'User logs in using their Email/Name and 4-digit PIN.'
              : 'ব্যবহারকারী নিজের নাম/ইমেইল এবং ৪ ডিজিটের পিন দিয়ে লগইন করবেন।'}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              {language === 'EN' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save User & Permissions' : 'ইউজার ও পারমিশন সেভ করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
