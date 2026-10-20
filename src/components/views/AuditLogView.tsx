/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  RefreshCw,
  CloudCheck,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  User,
  Layers,
  Clock,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { AuditRecord, AppUser, CompanySettings } from '../../types';
import {
  getDriveSyncUrl,
  getLastSyncTime,
  syncToGoogleDrive,
  pullBackupFromGoogleDrive,
  downloadJsonBackup,
  restoreJsonBackupFile,
  getSharedClientUrl,
} from '../../utils/googleDriveSync';

interface AuditLogViewProps {
  auditLogs: AuditRecord[];
  users: AppUser[];
  settings: CompanySettings;
  fullPayload: any;
  language: 'EN' | 'BN';
  onRestoreFullDatabase: (data: any) => void;
  onClearOldLogs?: () => void;
  onNavigateToCloudSync?: () => void;
}

type SortField = 'timestamp' | 'action' | 'module' | 'recordId' | 'user' | 'summary';
type SortOrder = 'asc' | 'desc';

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  users,
  settings,
  fullPayload,
  language,
  onRestoreFullDatabase,
  onClearOldLogs,
  onNavigateToCloudSync,
}) => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sort states
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Backup & Restore states
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [backupAlert, setBackupAlert] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [copiedClientUrl, setCopiedClientUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique modules and users for filter dropdowns
  const moduleOptions = useMemo(() => {
    const set = new Set<string>([
      'Projects & Tasks',
      'Clients',
      'Materials & Inventory',
      'Labour & Attendance',
      'Payments & Receipts',
      'Daily Costs & Expenses',
      'Office Staff & Payroll',
      'Team & Access Control',
      'Authentication',
      'Company Settings',
      'Cloud Backup & Restore',
    ]);
    auditLogs.forEach((log) => {
      if (log.module) set.add(log.module);
    });
    return Array.from(set);
  }, [auditLogs]);

  const userOptions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => set.add(u.name));
    auditLogs.forEach((log) => {
      if (log.user) set.add(log.user);
    });
    return Array.from(set);
  }, [auditLogs, users]);

  // Quick date presets
  const applyDatePreset = (preset: 'ALL' | 'TODAY' | '7DAYS' | 'MONTH') => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7DAYS') {
      const past = new Date(now);
      past.setDate(now.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  // Filtered and Sorted Audit Logs
  const filteredAndSortedLogs = useMemo(() => {
    const filtered = auditLogs.filter((log) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          log.summary.toLowerCase().includes(q) ||
          log.recordId.toLowerCase().includes(q) ||
          log.module.toLowerCase().includes(q) ||
          log.user.toLowerCase().includes(q) ||
          log.id.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Module filter
      if (selectedModule !== 'ALL' && log.module !== selectedModule) {
        return false;
      }

      // User filter
      if (selectedUser !== 'ALL' && log.user !== selectedUser) {
        return false;
      }

      // Action filter
      if (selectedAction !== 'ALL' && log.action !== selectedAction) {
        return false;
      }

      // Date range filter (comparing YYYY-MM-DD prefix of timestamp)
      const logDate = (log.timestamp || '').slice(0, 10);
      if (startDate && logDate < startDate) {
        return false;
      }
      if (endDate && logDate > endDate) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const valA = String(a[sortField] || '').toLowerCase();
      const valB = String(b[sortField] || '').toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [
    auditLogs,
    searchQuery,
    selectedModule,
    selectedUser,
    selectedAction,
    startDate,
    endDate,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
    );
  };

  // Backup & Restore Handlers
  const handleDownloadBackup = () => {
    downloadJsonBackup(fullPayload, settings.companyName);
    setBackupAlert({
      type: 'success',
      text:
        language === 'EN'
          ? 'Full ERP Backup (.json) downloaded to your device!'
          : 'সম্পূর্ণ ডাটাবেজ ব্যাকআপ ফাইল (.json) আপনার ডিভাইসে ডাউনলোড হয়েছে!',
    });
    setTimeout(() => setBackupAlert(null), 5000);
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const restored = await restoreJsonBackupFile(file);
      onRestoreFullDatabase(restored);
      setBackupAlert({
        type: 'success',
        text:
          language === 'EN'
            ? `Database successfully restored from "${file.name}"!`
            : `"${file.name}" থেকে সম্পূর্ণ ডাটাবেজ সফলভাবে রিস্টোর ও সিঙ্ক করা হয়েছে!`,
      });
    } catch (err: any) {
      setBackupAlert({
        type: 'error',
        text: err.message || 'ব্যাকআপ ফাইল রিস্টোর ব্যর্থ হয়েছে।',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCloudSyncNow = async () => {
    const url = getDriveSyncUrl();
    if (!url) {
      setBackupAlert({
        type: 'error',
        text:
          language === 'EN'
            ? 'Google Drive Web App URL not configured yet. Click "Cloud Settings" to set it up.'
            : 'গুগল ড্রাইভের Web App URL এখনো সেট করা হয়নি। পাশে "ক্লাউড সেটিংস"-এ গিয়ে লিংক দিন।',
      });
      return;
    }

    setIsSyncing(true);
    setBackupAlert(null);
    try {
      const res = await syncToGoogleDrive(fullPayload, url);
      setBackupAlert({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudPullRestore = async () => {
    const url = getDriveSyncUrl();
    if (!url) {
      setBackupAlert({
        type: 'error',
        text:
          language === 'EN'
            ? 'Google Drive Web App URL not configured yet.'
            : 'গুগল ড্রাইভের Web App URL সেট করা নেই।',
      });
      return;
    }

    setIsPulling(true);
    setBackupAlert(null);
    try {
      const res = await pullBackupFromGoogleDrive(url);
      if (res.success && res.data) {
        onRestoreFullDatabase(res.data);
        setBackupAlert({
          type: 'success',
          text: res.message,
        });
      } else {
        setBackupAlert({
          type: 'error',
          text: res.message,
        });
      }
    } finally {
      setIsPulling(false);
    }
  };

  const handleExportAuditCsv = () => {
    const headers = ['Audit ID', 'Timestamp', 'Action', 'Module', 'Record ID', 'User', 'Summary'];
    const rows = filteredAndSortedLogs.map((l) => [
      l.id,
      l.timestamp,
      l.action,
      `"${(l.module || '').replace(/"/g, '""')}"`,
      l.recordId,
      `"${(l.user || '').replace(/"/g, '""')}"`,
      `"${(l.summary || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClientLink = () => {
    const link = getSharedClientUrl();
    navigator.clipboard.writeText(link);
    setCopiedClientUrl(true);
    setTimeout(() => setCopiedClientUrl(false), 3000);
  };

  const actionBadgeStyle = (action: AuditRecord['action']) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'UPDATE':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'DELETE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'ARCHIVE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'RESTORE':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const todayPrefix = new Date().toISOString().slice(0, 10);
  const todayLogsCount = auditLogs.filter((l) => (l.timestamp || '').startsWith(todayPrefix)).length;
  const lastSync = getLastSyncTime();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-extrabold text-white">
                {language === 'EN'
                  ? 'ERP Audit Logs & Data Backup Center'
                  : 'অডিট লগ মনিটরিং ও ডাটা ব্যাকআপ-রিস্টোর সেন্টার'}
              </h1>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                14_Audit_Trail
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'EN'
                ? 'Monitor all data modifications across modules, filter by user & date range, and manage instant backups'
                : 'সকল মডিউলের তথ্য পরিবর্তন, ইউজার অ্যাক্টিভিটি ট্র্যাকিং এবং ওয়ান-ক্লিক ব্যাকআপ ও রিস্টোর টুলস'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyClientLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition cursor-pointer"
            title="Copy live synced Client Link for Managers & Staff"
          >
            {copiedClientUrl ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">
                  {language === 'EN' ? 'Client Link Copied!' : 'ক্লায়েন্ট লিংক কপি হয়েছে!'}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>
                  {language === 'EN' ? 'Copy Client Share Link' : 'ক্লায়েন্ট/ম্যানেজার লিংক কপি'}
                </span>
              </>
            )}
          </button>

          <button
            onClick={handleExportAuditCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{language === 'EN' ? 'Export Logs (.CSV)' : 'অডিট লগ ডাউনলোড (.CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Backup & Restore Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>
                  {language === 'EN'
                    ? 'Instant Backup & Restore Tools'
                    : 'তাৎক্ষণিক ব্যাকআপ ও রিস্টোর টুলস (Local & Google Drive)'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {language === 'EN' ? 'Auto-Sync Active' : 'অটো-সিঙ্ক চালু'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'EN'
                  ? `Download full ERP snapshot (.json), restore from file, or sync with Google Drive. Last Cloud Sync: ${
                      lastSync ? new Date(lastSync).toLocaleString() : 'Ready'
                    }`
                  : `কম্পিউটার বা মোবাইলে সম্পূর্ণ ব্যাকআপ (.json) ডাউনলোড করুন, ফাইল আপলোড করে রিস্টোর করুন অথবা গুগল ড্রাইভে সিঙ্ক করুন।`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Download JSON Backup */}
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {language === 'EN' ? 'Download Backup (.json)' : 'ব্যাকআপ ডাউনলোড (.json)'}
              </span>
            </button>

            {/* 2. Upload & Restore JSON Backup */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileRestore}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>
                {language === 'EN' ? 'Restore from File (.json)' : 'ফাইল থেকে রিস্টোর করুন'}
              </span>
            </button>

            {/* 3. Sync Now to Google Drive */}
            <button
              onClick={handleCloudSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? language === 'EN'
                    ? 'Syncing...'
                    : 'সিঙ্ক হচ্ছে...'
                  : language === 'EN'
                  ? 'Google Drive Backup'
                  : 'গুগল ড্রাইভে ব্যাকআপ'}
              </span>
            </button>

            {/* 4. Restore from Google Drive */}
            <button
              onClick={handleCloudPullRestore}
              disabled={isPulling}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
            >
              <CloudCheck className={`w-4 h-4 ${isPulling ? 'animate-bounce' : ''}`} />
              <span>
                {isPulling
                  ? language === 'EN'
                    ? 'Restoring...'
                    : 'রিস্টোর হচ্ছে...'
                  : language === 'EN'
                  ? 'Restore from Drive'
                  : 'ড্রাইভ থেকে রিস্টোর'}
              </span>
            </button>

            {onNavigateToCloudSync && (
              <button
                onClick={onNavigateToCloudSync}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                {language === 'EN' ? 'Cloud Settings' : 'ক্লাউড সেটিংস'}
              </button>
            )}
          </div>
        </div>

        {backupAlert && (
          <div
            className={`p-3 rounded-xl flex items-center justify-between gap-2 text-xs ${
              backupAlert.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {backupAlert.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{backupAlert.text}</span>
            </div>
            <button
              onClick={() => setBackupAlert(null)}
              className="text-slate-400 hover:text-white px-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {language === 'EN' ? 'Total Audit Records' : 'মোট অডিট লগ সংখ্যা'}
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {auditLogs.length}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {language === 'EN' ? 'Matching Filter Results' : 'ফিল্টারকৃত ফলাফল'}
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            {filteredAndSortedLogs.length}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {language === 'EN' ? 'Today’s Modifications' : 'আজকের পরিবর্তন সমূহ'}
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {todayLogsCount}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold block">
            {language === 'EN' ? 'Active Monitored Users' : 'সক্রিয় মনিটরকৃত ইউজার'}
          </span>
          <span className="text-2xl font-black text-indigo-400 font-mono mt-1 block">
            {userOptions.length}
          </span>
        </div>
      </div>

      {/* Filters Panel: Search, Module, User, Action, Date Range */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'EN'
                ? 'Filter Audit Logs by Date Range, Module & User'
                : 'তারিখ, মডিউল ও ইউজার অনুযায়ী অডিট লগ ফিল্টার করুন'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyDatePreset('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                !startDate && !endDate
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {language === 'EN' ? 'All Time' : 'সব সময়'}
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('TODAY')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
            >
              {language === 'EN' ? 'Today' : 'আজকে'}
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('7DAYS')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
            >
              {language === 'EN' ? 'Last 7 Days' : 'গত ৭ দিন'}
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('MONTH')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
            >
              {language === 'EN' ? 'This Month' : 'চলতি মাস'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedModule('ALL');
                setSelectedUser('ALL');
                setSelectedAction('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'EN' ? 'Reset' : 'রিসেট'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Search */}
          <div className="lg:col-span-1">
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">
              {language === 'EN' ? 'Search Keyword / ID' : 'সার্চ (বিবরণ বা আইডি)'}
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'EN' ? 'Search summary, ID, user...' : 'বিবরণ, আইডি বা নাম খুঁজুন...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 2. Module Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>{language === 'EN' ? 'Module / Section' : 'মডিউল / সেকশন'}</span>
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">
                {language === 'EN' ? 'All Modules' : 'সকল মডিউল (All)'}
              </option>
              {moduleOptions.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {/* 3. User Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" />
              <span>{language === 'EN' ? 'User / Team Member' : 'ব্যবহারকারী (User)'}</span>
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">
                {language === 'EN' ? 'All Users' : 'সকল ইউজার (All)'}
              </option>
              {userOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Action Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">
              {language === 'EN' ? 'Action Type' : 'অ্যাকশন ধরন'}
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{language === 'EN' ? 'All Actions' : 'সব অ্যাকশন'}</option>
              <option value="CREATE">CREATE (নতুন যোগ)</option>
              <option value="UPDATE">UPDATE (আপডেট/এডিট)</option>
              <option value="DELETE">DELETE (ডিলিট)</option>
              <option value="ARCHIVE">ARCHIVE (আর্কাইভ)</option>
              <option value="RESTORE">RESTORE (রিস্টোর)</option>
            </select>
          </div>

          {/* 5. Date Range (From - To) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>{language === 'EN' ? 'From Date' : 'শুরুর তারিখ'}</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-[11px] text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                {language === 'EN' ? 'To Date' : 'শেষের তারিখ'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-[11px] text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sortable Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center gap-1.5 hover:text-white transition cursor-pointer uppercase font-bold"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'EN' ? 'Date & Time' : 'তারিখ ও সময়'}</span>
                    {renderSortIcon('timestamp')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('action')}
                    className="flex items-center gap-1.5 hover:text-white transition cursor-pointer uppercase font-bold"
                  >
                    <span>{language === 'EN' ? 'Action' : 'অ্যাকশন'}</span>
                    {renderSortIcon('action')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('module')}
                    className="flex items-center gap-1.5 hover:text-white transition cursor-pointer uppercase font-bold"
                  >
                    <span>{language === 'EN' ? 'Module' : 'মডিউল'}</span>
                    {renderSortIcon('module')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('recordId')}
                    className="flex items-center gap-1.5 hover:text-white transition cursor-pointer uppercase font-bold"
                  >
                    <span>{language === 'EN' ? 'Record ID' : 'রেকর্ড আইডি'}</span>
                    {renderSortIcon('recordId')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('user')}
                    className="flex items-center gap-1.5 hover:text-white transition cursor-pointer uppercase font-bold"
                  >
                    <span>{language === 'EN' ? 'User' : 'ব্যবহারকারী'}</span>
                    {renderSortIcon('user')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('summary')}
                    className="flex items-center gap-1.5 hover:text-white transition cursor-pointer uppercase font-bold"
                  >
                    <span>
                      {language === 'EN'
                        ? 'Modification Details / Summary'
                        : 'পরিবর্তনের বিস্তারিত বিবরণ'}
                    </span>
                    {renderSortIcon('summary')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAndSortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    {language === 'EN'
                      ? 'No audit log records match the selected filters.'
                      : 'নির্বাচিত ফিল্টারে কোনো অডিট লগ পাওয়া যায়নি।'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-white font-semibold">{log.timestamp}</div>
                      <span className="font-mono text-[10px] text-slate-500">{log.id}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${actionBadgeStyle(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-indigo-300">{log.module}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {log.recordId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {(log.user || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-200">{log.user}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                      {log.summary}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
