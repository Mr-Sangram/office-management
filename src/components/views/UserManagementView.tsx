/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  UserCheck,
  Lock,
  Sparkles,
  Info,
  Users,
  Eye,
  EyeOff,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { AppUser, UserRole, UserPermissions } from '../../types';
import { getSharedClientUrl } from '../../utils/googleDriveSync';

interface UserManagementViewProps {
  users: AppUser[];
  currentUserId: string;
  onAddUser: () => void;
  onEditUser: (user: AppUser) => void;
  onDeleteUser: (userId: string) => void;
  onOpenSwitchModal: () => void;
  language: 'EN' | 'BN';
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUserId,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onOpenSwitchModal,
  language,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const handleCopyCredentials = (user: AppUser) => {
    const clientUrl = getSharedClientUrl();
    const credText = `🏢 Advance System Company Management ERP Access\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nSecurity PIN: ${user.pin}\nClient Login Link: ${clientUrl}`;
    navigator.clipboard.writeText(credText);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePinVisibility = (id: string) => {
    setShowPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const roleColors: Record<UserRole, { badge: string; border: string }> = {
    Owner: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', border: 'border-emerald-500/30' },
    Manager: { badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40', border: 'border-sky-500/30' },
    'Site Supervisor': { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', border: 'border-amber-500/30' },
    Accountant: { badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', border: 'border-indigo-500/30' },
    Custom: { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', border: 'border-purple-500/30' },
    Client: { badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40', border: 'border-teal-500/30' },
  };

  const activeCount = users.filter((u) => u.status === 'Active').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">
                {language === 'EN' ? 'Team & Role Access Control' : 'টিম পারমিশন ও এক্সেস কন্ট্রোল'}
              </h1>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                RBAC Security
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'EN'
                ? 'Assign manager limits, grant custom permissions, and invite team members with 4-digit PINs'
                : 'ম্যানেজার ও সাইট স্টাফদের নির্দিষ্ট সীমা নির্ধারণ করুন এবং ৪ ডিজিটের পিন দিয়ে এক্সেস দিন'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSwitchModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'EN' ? 'Switch Profile' : 'প্রোফাইল পরিবর্তন'}</span>
          </button>

          <button
            onClick={onAddUser}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'EN' ? 'Add Team Member +' : 'নতুন মেম্বার যুক্ত করুন +'}</span>
          </button>
        </div>
      </div>

      {/* Current Active User Session Card */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-sm">
            {currentUser?.avatar || '👑'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                {language === 'EN' ? 'Active Logged-In User' : 'বর্তমান সক্রিয় ব্যবহারকারী'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">{currentUser?.name}</h3>
            <p className="text-xs text-slate-400">
              {currentUser?.email} •{' '}
              <span className="text-indigo-400 font-medium">{currentUser?.role}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
            <span className="text-slate-500 mr-1.5">{language === 'EN' ? 'Your PIN:' : 'আপনার পিন:'}</span>
            <span className="font-mono font-bold text-indigo-400">{currentUser?.pin}</span>
          </div>
          <button
            onClick={onOpenSwitchModal}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition font-semibold"
          >
            {language === 'EN' ? 'Change Account' : 'অন্য অ্যাকাউন্টে যান'}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">{language === 'EN' ? 'Total Users' : 'মোট ব্যবহারকারী'}</div>
          <div className="text-2xl font-black text-white">{users.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{activeCount} Active accounts</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">{language === 'EN' ? 'Managers & Staff' : 'ম্যানেজার ও স্টাফ'}</div>
          <div className="text-2xl font-black text-sky-400">
            {users.filter((u) => u.role !== 'Owner').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">With custom limits</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">{language === 'EN' ? 'Security PIN Protection' : 'পিন সুরক্ষা'}</div>
          <div className="text-2xl font-black text-emerald-400">100%</div>
          <div className="text-[11px] text-slate-500 mt-1">Encrypted on device</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">{language === 'EN' ? 'Cross-Device Sync' : 'মাল্টি-ডিভাইস এক্সেস'}</div>
          <div className="text-2xl font-black text-amber-400">Online/PWA</div>
          <div className="text-[11px] text-slate-500 mt-1">Works on PC & Mobile</div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>{language === 'EN' ? 'Team Members & Assigned Permissions' : 'টিম মেম্বার ও নির্ধারিত পারমিশন'}</span>
          </h2>
          <span className="text-xs text-slate-400">
            {language === 'EN' ? 'Click "Edit" to modify limits' : 'সীমাবদ্ধতা পরিবর্তন করতে Edit চাপুন'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => {
            const roleStyle = roleColors[user.role] || roleColors['Custom'];
            const isSelf = user.id === currentUserId;
            const isShown = showPins[user.id];

            // Calculate active permissions count
            const enabledPerms = Object.entries(user.permissions).filter(([_, val]) => val);

            return (
              <div
                key={user.id}
                className={`bg-slate-900 border ${
                  isSelf ? 'border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20' : 'border-slate-800'
                } rounded-2xl p-5 flex flex-col justify-between space-y-4 transition hover:border-slate-700`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                        {user.avatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{user.name}</h4>
                          {isSelf && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                              {language === 'EN' ? 'You' : 'আপনি'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] border px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${roleStyle.badge}`}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* Credentials & Details */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">
                        {language === 'EN' ? 'Security PIN:' : 'লগইন পিন:'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-white">
                          {isShown ? user.pin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(user.id)}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">
                        {language === 'EN' ? 'Phone:' : 'ফোন নম্বর:'}
                      </span>
                      <span className="text-slate-300 mt-0.5 block truncate">
                        {user.phone || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Active Permissions Badges with Granular CRUD Tags */}
                  <div className="mt-3.5">
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
                      {language === 'EN'
                        ? 'Granular Module Permissions (View / Add / Edit / Delete):'
                        : 'মডিউল ভিত্তিক অনুমোদিত এক্সেস (দেখা / যোগ / এডিট / ডিলিট):'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: 'dashboard', label: '📊 Dashboard', flag: user.permissions.viewDashboard },
                        { key: 'projects', label: '📁 Projects', flag: user.permissions.manageProjects },
                        { key: 'clients', label: '👥 Clients', flag: user.permissions.manageClients },
                        { key: 'dailyCosts', label: '🚗 Daily Costs', flag: user.permissions.manageDailyCosts },
                        { key: 'inventory', label: '📦 Inventory', flag: user.permissions.manageInventory },
                        { key: 'labour', label: '👷 Labour', flag: user.permissions.manageLabour },
                        { key: 'staff', label: '💼 Payroll', flag: user.permissions.manageStaffAndPayroll },
                        { key: 'reports', label: '📈 Reports', flag: user.permissions.viewFinancialReports },
                        { key: 'settings', label: '⚙️ Settings', flag: user.permissions.manageCompanySettings },
                        { key: 'cloudSync', label: '☁️ Cloud', flag: user.permissions.manageCloudBackup },
                        { key: 'users', label: '🛡️ Users', flag: user.permissions.manageUsers },
                      ].map((m) => {
                        const mod = user.permissions.modules ? (user.permissions.modules as any)[m.key] : null;
                        const isVisible = mod ? mod.view : m.flag;
                        if (!isVisible) return null;

                        const tags: string[] = ['V'];
                        if (mod) {
                          if (mod.add) tags.push('+');
                          if (mod.edit || mod.disburseSalary || mod.sync) tags.push('E');
                          if (mod.delete || mod.restore) tags.push('D');
                        } else if (user.role === 'Owner') {
                          tags.push('+', 'E', 'D');
                        } else {
                          tags.push('+', 'E');
                        }

                        return (
                          <span
                            key={m.key}
                            className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700"
                          >
                            <span>{m.label}</span>
                            <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-300 px-1 rounded">
                              {tags.join('/')}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {user.notes && (
                    <p className="text-[11px] text-slate-400 mt-3 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      "{user.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCredentials(user)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
                      title="Copy access info to send to team member"
                    >
                      {copiedId === user.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px]">{language === 'EN' ? 'Copy Access' : 'এক্সেস কপি'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditUser(user)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title={language === 'EN' ? 'Edit Permissions' : 'পারমিশন এডিট'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {user.role !== 'Owner' && (
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title={language === 'EN' ? 'Remove User' : 'ইউজার মুছে ফেলুন'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide: How to Share with Managers & Remote Team */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Laptop className="w-4 h-4 text-indigo-400" />
          <span>
            {language === 'EN'
              ? 'How Team Members Access the Software on their PC or Mobile'
              : 'ম্যানেজার ও অন্যরা যেভাবে তাঁদের পিসি বা মোবাইলে সফটওয়্যার ব্যবহার করবেন'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-indigo-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-center leading-5 font-mono">1</span>
              <span>{language === 'EN' ? 'Send Link & PIN' : 'লিংক ও পিন প্রদান করুন'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {language === 'EN'
                ? 'Click "Copy Access" on the user card above and send it to your manager via WhatsApp or Email.'
                : 'উপরের কার্ড থেকে "এক্সেস কপি" বাটনে চাপ দিয়ে লিংক ও ৪ ডিজিটের পিন আপনার ম্যানেজারকে পাঠিয়ে দিন।'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-indigo-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-center leading-5 font-mono">2</span>
              <span>{language === 'EN' ? 'They Switch to their Profile' : 'তাঁরা নিজেদের পিন দিয়ে ঢুকবেন'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {language === 'EN'
                ? 'When they open the link, they select their name and enter their 4-digit PIN to authenticate.'
                : 'অ্যাপ ওপেন করে তাঁরা শুধু তাঁদের নাম সিলেক্ট করবেন এবং ৪ সংখ্যার পিন দিয়ে প্রবেশ করবেন।'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-indigo-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-center leading-5 font-mono">3</span>
              <span>{language === 'EN' ? 'Automatic Access Limits' : 'সীমাবদ্ধতা স্বয়ংক্রিয়ভাবে কার্যকর'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {language === 'EN'
                ? 'They will only see and edit the specific categories you allowed. Restricted areas are locked.'
                : 'আপনার অনুমতি ছাড়া ম্যানেজার কোনো গোপন হিসাব (যেমন স্টাফ স্যালারি বা নিট প্রফিট) দেখতে পারবেন না।'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
