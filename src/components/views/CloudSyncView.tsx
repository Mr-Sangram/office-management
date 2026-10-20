/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudCheck,
  RefreshCw,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Laptop,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Info,
  Database
} from 'lucide-react';
import {
  getDriveSyncUrl,
  setDriveSyncUrl,
  getAutoSyncEnabled,
  setAutoSyncEnabled,
  getLastSyncTime,
  syncToGoogleDrive,
  pullBackupFromGoogleDrive,
  testGoogleDriveConnection,
  downloadJsonBackup,
  restoreJsonBackupFile,
  getLocalStorageMetrics,
  getSharedClientUrl,
  getLiveWorkUrl,
  LIVE_WORK_SHORT_LINK,
  CLIENT_VIEW_SHORT_LINK,
  fetchDynamicShortLinks,
} from '../../utils/googleDriveSync';
import { exportCompleteWorkbook } from '../../utils/exportToExcel';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  CompanySettings,
  Client,
  Project,
  MaterialItem,
  MaterialTransaction,
  Supplier,
  PurchaseOrder,
  Worker,
  LabourAttendance,
  PaymentReceived,
  ExpenseItem,
  OfficeStaff,
  OfficeAsset,
  OfficeBill,
  TaskItem,
  AuditRecord,
} from '../../types';

interface CloudSyncViewProps {
  settings: CompanySettings;
  clients: Client[];
  projects: Project[];
  materials: MaterialItem[];
  transactions: MaterialTransaction[];
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  workers: Worker[];
  attendance: LabourAttendance[];
  payments: PaymentReceived[];
  expenses: ExpenseItem[];
  staff: OfficeStaff[];
  assets: OfficeAsset[];
  bills: OfficeBill[];
  tasks: TaskItem[];
  auditLogs: AuditRecord[];
  language: 'EN' | 'BN';
  onRestoreFullDatabase: (restoredData: any) => void;
  onOpenAppsScriptModal: () => void;
  onSetClientViewMode?: (isClient: boolean) => void;
}

export const CloudSyncView: React.FC<CloudSyncViewProps> = ({
  settings,
  clients,
  projects,
  materials,
  transactions,
  suppliers,
  purchases,
  workers,
  attendance,
  payments,
  expenses,
  staff,
  assets,
  bills,
  tasks,
  auditLogs,
  language,
  onRestoreFullDatabase,
  onOpenAppsScriptModal,
  onSetClientViewMode,
}) => {
  const isOnline = useOnlineStatus();
  const [webAppUrl, setWebAppUrlState] = useState<string>(getDriveSyncUrl());
  const [autoSync, setAutoSyncState] = useState<boolean>(getAutoSyncEnabled());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncTime());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [storageMetrics, setStorageMetrics] = useState(getLocalStorageMetrics());
  const [copiedUrlGuide, setCopiedUrlGuide] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [workShortLink, setWorkShortLink] = useState(LIVE_WORK_SHORT_LINK);
  const [clientShortLink, setClientShortLink] = useState(CLIENT_VIEW_SHORT_LINK);

  useEffect(() => {
    fetchDynamicShortLinks().then((links) => {
      setWorkShortLink(links.workShortLink);
      setClientShortLink(links.clientShortLink);
    });
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compile full master payload
  const getFullPayload = () => ({
    settings,
    clients,
    projects,
    materials,
    transactions,
    suppliers,
    purchases,
    workers,
    attendance,
    payments,
    expenses,
    staff,
    assets,
    bills,
    tasks,
    auditLogs,
  });

  const totalRecordCount =
    clients.length +
    projects.length +
    materials.length +
    transactions.length +
    suppliers.length +
    purchases.length +
    workers.length +
    attendance.length +
    payments.length +
    expenses.length +
    staff.length +
    assets.length +
    bills.length +
    tasks.length;

  const handleSaveUrl = () => {
    setDriveSyncUrl(webAppUrl);
    setStatusMessage({
      type: 'success',
      text: language === 'EN' ? 'Google Apps Script URL saved successfully!' : 'গুগল ড্রাইভ স্ক্রিপ্ট URL সফলভাবে সংরক্ষণ করা হয়েছে!',
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleTestConnection = async () => {
    if (!webAppUrl) {
      setStatusMessage({
        type: 'error',
        text: language === 'EN' ? 'Please paste your Google Apps Script Web App URL first.' : 'দয়া করে প্রথমে আপনার Google Apps Script URL টি পেস্ট করুন।',
      });
      return;
    }

    setIsTesting(true);
    setStatusMessage({
      type: 'info',
      text: language === 'EN' ? 'Pinging Google Apps Script endpoint...' : 'গুগল ড্রাইভ স্ক্রিপ্ট কানেকশন টেস্ট করা হচ্ছে...',
    });

    try {
      const res = await testGoogleDriveConnection(webAppUrl);
      setStatusMessage({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e.message || 'কানেকশন টেস্টে ত্রুটি দেখা দিয়েছে।',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleAutoSync = () => {
    const nextVal = !autoSync;
    setAutoSyncState(nextVal);
    setAutoSyncEnabled(nextVal);
  };

  const handleManualSync = async () => {
    if (!webAppUrl) {
      setStatusMessage({
        type: 'error',
        text: language === 'EN' ? 'Please paste your Google Apps Script Web App URL first.' : 'দয়া করে প্রথমে আপনার Google Apps Script Web App URL টি সেট করুন।',
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage({
      type: 'info',
      text: language === 'EN' ? 'Syncing data to Google Drive...' : 'গুগল ড্রাইভে ডাটা ব্যাকআপ পাঠানো হচ্ছে...',
    });

    try {
      const res = await syncToGoogleDrive(getFullPayload(), webAppUrl);
      if (res.success) {
        setLastSync(new Date().toISOString());
        setStatusMessage({
          type: 'success',
          text:
            res.message ||
            (language === 'EN'
              ? 'Success! All ERP data safely backed up to Google Drive.'
              : 'অসাধারণ! আপনার গুগল ড্রাইভ ও শিটে সমস্ত ডাটা সফলভাবে ব্যাকআপ হয়ে গেছে!'),
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message,
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e.message || 'সিঙ্ক করতে ত্রুটি দেখা দিয়েছে।',
      });
    } finally {
      setIsSyncing(false);
      setStorageMetrics(getLocalStorageMetrics());
    }
  };

  const handleDownloadBackup = () => {
    downloadJsonBackup(getFullPayload(), settings.companyName);
    setStatusMessage({
      type: 'success',
      text: language === 'EN' ? 'Backup JSON downloaded to your device!' : 'সম্পূর্ণ ডাটাবেজ ব্যাকআপ ফাইল (.json) আপনার ডিভাইসে ডাউনলোড হয়েছে!',
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await restoreJsonBackupFile(file);
      const confirmText = language === 'EN'
        ? `Are you sure you want to restore? This will replace your current ${totalRecordCount} records with the data from the backup file.`
        : `আপনি কি নিশ্চিতভাবে এই ব্যাকআপটি রিস্টোর করতে চান? এটি বর্তমান ${totalRecordCount} টি রেকর্ডের সাথে ব্যাকআপ ফাইলের ডাটা দিয়ে প্রতিস্থাপন করবে।`;
      
      if (window.confirm(confirmText)) {
        onRestoreFullDatabase(parsedData);
        setStatusMessage({
          type: 'success',
          text: language === 'EN' ? 'Database successfully restored from backup!' : 'অভিনন্দন! ব্যাকআপ থেকে সম্পূর্ণ ডাটাবেজ সফলভাবে রিস্টোর হয়েছে!',
        });
        setStorageMetrics(getLocalStorageMetrics());
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message,
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportExcelClick = () => {
    exportCompleteWorkbook(
      settings,
      clients,
      projects,
      materials,
      transactions,
      suppliers,
      purchases,
      workers,
      attendance,
      payments,
      expenses,
      staff,
      assets,
      bills,
      tasks,
      auditLogs
    );
  };

  const formatLastSyncString = (dateIso: string | null) => {
    if (!dateIso) return language === 'EN' ? 'Never' : 'এখনো সিঙ্ক হয়নি';
    try {
      const d = new Date(dateIso);
      return d.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    } catch {
      return dateIso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Cloud className="w-6 h-6" />
              </div>
              <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
                {language === 'EN' ? '24/7 Cloud Backup & Google Drive Sync' : '২৪/৭ ক্লাউড ব্যাকআপ ও গুগল ড্রাইভ অটো-সিঙ্ক'}
              </h2>
            </div>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl">
              {language === 'EN'
                ? 'Your system runs seamlessly 24/7 both online and offline. With Google Apps Script integration, all your clients, projects, finances, and material inventory auto-backup directly to your personal Google Drive for 100% free forever.'
                : 'আপনার এই সফটওয়্যারটি যেকোনো পিসি বা মোবাইলে ২৪/৭ অনলাইন ও সম্পূর্ণ অফলাইনে নিরবচ্ছিন্নভাবে চলবে। গুগল ড্রাইভের সাথে কানেক্ট করলে আপনার সমস্ত ক্লায়েন্ট, প্রজেক্ট, খরচ ও ইনভেন্টরি অটো-ব্যাকআপ হয়ে যাবে সম্পূর্ণ ফ্রিতে।'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-900/40 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing 
                  ? (language === 'EN' ? 'Syncing to Drive...' : 'সিঙ্ক হচ্ছে...') 
                  : (language === 'EN' ? 'Sync to Google Drive Now' : 'গুগল ড্রাইভে এখনই সিঙ্ক করুন')}
              </span>
            </button>

            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Download offline JSON file"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{language === 'EN' ? 'Download Backup (.json)' : 'ব্যাকআপ ডাউনলোড'}</span>
            </button>
          </div>
        </div>

        {/* Live Status Message Alert */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                : 'bg-sky-500/20 border border-sky-500/40 text-sky-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-sky-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* KPI & Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connectivity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'EN' ? 'Internet Connection' : 'ইন্টারনেট কানেকশন'}</span>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'
              }`}
            />
            <span className="font-bold text-sm text-white">
              {isOnline
                ? language === 'EN'
                  ? 'Online (Connected)'
                  : 'অনলাইন (কানেক্টেড)'
                : language === 'EN'
                ? 'Offline (Local Safe)'
                : 'অফলাইন (লোকাল মোড)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {isOnline
              ? language === 'EN'
                ? 'Can sync directly to Google Drive.'
                : 'সরাসরি গুগল ড্রাইভে সিঙ্ক সম্ভব।'
              : language === 'EN'
              ? 'Changes saved to browser storage.'
              : 'সকল কাজ মেমোরিতে নিরাপদে সংরক্ষিত আছে।'}
          </p>
        </div>

        {/* Google Drive Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'EN' ? 'Google Drive Sync' : 'গুগল ড্রাইভ সিঙ্ক'}</span>
            <CloudCheck className={`w-4 h-4 ${webAppUrl ? 'text-indigo-400' : 'text-slate-600'}`} />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                webAppUrl ? 'bg-indigo-500' : 'bg-slate-600'
              }`}
            />
            <span className="font-bold text-sm text-white">
              {webAppUrl
                ? language === 'EN'
                  ? 'Connected'
                  : 'সংযুক্ত (Connected)'
                : language === 'EN'
                ? 'Not Configured'
                : 'কনফিগার বাকি'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {language === 'EN' ? 'Last synced:' : 'সর্বশেষ সিঙ্ক:'}{' '}
            <span className="text-slate-200 font-medium">{formatLastSyncString(lastSync)}</span>
          </p>
        </div>

        {/* Total Database Records */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'EN' ? 'Active Records' : 'মোট সংরক্ষিত ডাটা'}</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-extrabold text-xl text-emerald-400">
            {totalRecordCount} <span className="text-xs text-slate-400 font-normal">Records</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {clients.length} Clients, {projects.length} Projects, {materials.length} Materials
          </p>
        </div>

        {/* Storage Size & Cost */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'EN' ? 'Hosting & Cloud Cost' : 'হোস্টিং ও ক্লাউড খরচ'}</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-extrabold text-xl text-amber-400">
            {language === 'EN' ? '100% Free' : 'সম্পূর্ণ ফ্রি (৳ 0)'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {language === 'EN'
              ? 'Uses your free 15GB Google Drive'
              : 'আপনার নিজস্ব ফ্রি ১৫ জিবি ড্রাইভ ব্যবহার করে'}
          </p>
        </div>
      </div>

      {/* Main Configuration & Manual Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Google Drive Web App URL & Auto-Sync Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {language === 'EN' ? 'Google Apps Script Web App Integration' : 'গুগল ড্রাইভ অটো-ব্যাকআপ কানেকশন'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'EN'
                      ? 'Paste your deployed Apps Script Web App URL below to enable automated 24/7 sync'
                      : 'আপনার গুগল শিটের Apps Script Web App URL টি নিচে পেস্ট করে সেভ করুন'}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenAppsScriptModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
              >
                <span>{language === 'EN' ? 'View Code.gs' : 'স্ক্রিপ্ট কোড দেখুন'}</span>
              </button>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                {language === 'EN' ? 'Google Apps Script Web App URL:' : 'গুগল অ্যাপস স্ক্রিপ্ট ওয়েব অ্যাপ URL:'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrlState(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  onClick={handleSaveUrl}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition shrink-0 cursor-pointer"
                >
                  {language === 'EN' ? 'Save URL' : 'URL সেভ করুন'}
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !webAppUrl}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs rounded-xl shadow-md transition shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{language === 'EN' ? 'Test Connection' : 'টেস্ট কানেকশন'}</span>
                </button>
              </div>
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
                <p className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'EN' ? 'Crucial Deployment Settings Checklist:' : 'গুগল অ্যাপস স্ক্রিপ্ট কানেকশন চেকলিস্ট:'}</span>
                </p>
                <p>
                  1. <strong className="text-white">Execute as:</strong> "Me (your email)"
                </p>
                <p>
                  2. <strong className="text-white">Who has access:</strong> "Anyone"
                </p>
                <p>
                  3. <strong className="text-amber-300">URL Ending:</strong> লিংকের শেষে অবশ্যই <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono">/exec</code> থাকতে হবে (কখনোই <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300 font-mono">/dev</code> নয়)।
                </p>
                <p>
                  4. কোড পেস্ট করার পর প্রতিবার <strong className="text-white">Deploy &gt; Manage deployments &gt; Edit &gt; New version &gt; Deploy</strong> চাপতে হবে।
                </p>
              </div>
            </div>

            {/* Auto-Sync Toggle */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-xs text-white">
                  {language === 'EN' ? 'Real-Time Auto Backup to Google Drive' : 'স্বয়ংক্রিয় ক্লাউড ব্যাকআপ (Auto-Sync)'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'EN'
                    ? 'When active and online, every project, client, or financial transaction auto-syncs to Drive.'
                    : 'চালু থাকলে নতুন প্রজেক্ট, খরচ বা পেমেন্ট যোগ করার সাথে সাথে ড্রাইভে অটো-সেভ হবে।'}
                </div>
              </div>

              <button
                onClick={handleToggleAutoSync}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoSync ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoSync ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <button
                onClick={handleManualSync}
                disabled={isSyncing || !webAppUrl}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{language === 'EN' ? 'Test & Sync Now' : 'টেস্ট ও এখনই সিঙ্ক করুন'}</span>
              </button>

              <button
                onClick={async () => {
                  if (!webAppUrl) return;
                  setIsSyncing(true);
                  const res = await pullBackupFromGoogleDrive(webAppUrl);
                  setIsSyncing(false);
                  if (res.success && res.data) {
                    onRestoreFullDatabase(res.data);
                    setStatusMessage({ type: 'success', text: res.message });
                  } else {
                    setStatusMessage({ type: 'error', text: res.message });
                  }
                }}
                disabled={isSyncing || !webAppUrl}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 disabled:opacity-50 transition cursor-pointer"
              >
                <CloudCheck className="w-3.5 h-3.5" />
                <span>
                  {language === 'EN'
                    ? 'Restore from Google Drive'
                    : 'গুগল ড্রাইভ থেকে রিস্টোর'}
                </span>
              </button>

              <button
                onClick={handleExportExcelClick}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>
                  {language === 'EN'
                    ? 'Export 14-Sheet Workbook (.xlsx)'
                    : 'গুগল শিট এক্সেল ফাইল (.xlsx)'}
                </span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(workShortLink);
                  if (onSetClientViewMode) onSetClientViewMode(false);
                  setStatusMessage({
                    type: 'success',
                    text:
                      language === 'EN'
                        ? `Everyday Work Short Link copied & activated: ${workShortLink}`
                        : `প্রতিদিন কাজ করার শর্ট লিংক কপি ও চালু হয়েছে: ${workShortLink}`,
                  });
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>
                  {language === 'EN'
                    ? `Work Short Link (${workShortLink})`
                    : `কাজের শর্ট লিংক (${workShortLink})`}
                </span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(clientShortLink);
                  if (onSetClientViewMode) onSetClientViewMode(true);
                  setStatusMessage({
                    type: 'success',
                    text:
                      language === 'EN'
                        ? `Client View Short Link copied & activated: ${clientShortLink}`
                        : `ক্লায়েন্ট ভিউ শর্ট লিংক কপি হয়েছে: ${clientShortLink} (পাসওয়ার্ড/পিন থাকলে লগইন করা যাবে)`,
                  });
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>
                  {language === 'EN'
                    ? `Client Short Link (${clientShortLink})`
                    : `ক্লায়েন্ট ভিউ শর্ট লিংক (${clientShortLink})`}
                </span>
              </button>
            </div>
          </div>

          {/* 3-Step Setup Instructions Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">
                {language === 'EN'
                  ? 'How to Set Up Free Google Drive Auto-Backup in 2 Minutes'
                  : 'মাত্র ২ মিনিটে ১০০% ফ্রি গুগল ড্রাইভ অটো-ব্যাকআপ সেটআপ করুন:'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  ১
                </div>
                <div className="font-bold text-white">গুগল শিট খুলুন ও কোড পেস্ট করুন</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  ব্রাউজারে <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-amber-300 underline font-mono">sheets.new</a> ওপেন করুন। <strong>Extensions &gt; Apps Script</strong> এ গিয়ে আমাদের সম্পূর্ণ <strong>Code.gs</strong> কোডটি পেস্ট করুন।
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  ২
                </div>
                <div className="font-bold text-white">Deploy as Web App করুন</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  উপরে <strong>Deploy &gt; New deployment</strong> চাপুন। Type সিলেক্ট করুন <strong>Web app</strong>। <strong>Execute as: Me</strong> এবং <strong>Who has access: Anyone</strong> দিন এবং Deploy চাপুন।
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  ৩
                </div>
                <div className="font-bold text-white">URL বসিয়ে সিঙ্ক চালু করুন</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Deployment সফল হলে যে <strong>Web app URL</strong> পাবেন, সেটি কপি করে উপরের বক্সে বসিয়ে "URL সেভ করুন" চাপুন। আপনার কাজ শেষ!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {language === 'EN'
                  ? 'Your Google Drive will automatically create a folder named "InteriorCraft_ERP_Backups" where all your versioned backups and latest state are safely archived forever.'
                  : 'আপনার গুগল ড্রাইভের ভেতরে স্বয়ংক্রিয়ভাবে "InteriorCraft_ERP_Backups" ফোল্ডার তৈরি হবে এবং সেখানে তারিখ অনুযায়ী ভার্সন ব্যাকআপ ও লেটেস্ট ডাটা সবসময় সংরক্ষিত থাকবে।'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Manual Backup, Restore & Offline Guide */}
        <div className="space-y-6">
          {/* Manual JSON Backup & Restore Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                {language === 'EN' ? 'Device Backup & Restore' : 'ডিভাইস ব্যাকআপ ও রিস্টোর'}
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'EN'
                ? 'Download an offline snapshot file (.json) to your computer or pendrive, or restore previous data on any new computer.'
                : 'আপনার কম্পিউটার বা পেনড্রাইভে সম্পূর্ণ ডাটাবেজের একটি ব্যাকআপ ফাইল (.json) সেভ রাখুন, অথবা নতুন কোনো কম্পিউটারে সহজে রিস্টোর করুন।'}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleDownloadBackup}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>{language === 'EN' ? 'Download Full Backup (.json)' : 'সম্পূর্ণ ডাটাবেজ ডাউনলোড (.json)'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>{language === 'EN' ? 'Restore / Upload Backup (.json)' : 'ব্যাকআপ আপলোড ও রিস্টোর (.json)'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>{language === 'EN' ? 'Local Storage Keys:' : 'মেমোরি কি (Keys):'}</span>
                <span className="font-mono text-slate-200">{storageMetrics.totalKeys} keys</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'EN' ? 'Estimated Size:' : 'মোট সাইজ:'}</span>
                <span className="font-mono text-slate-200">~{storageMetrics.estimatedSizeKb} KB</span>
              </div>
            </div>
          </div>

          {/* 24/7 Offline & Online Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-white text-sm">
                {language === 'EN' ? '24/7 Online & Offline Reliability' : '২৪/৭ অনলাইন ও অফলাইন নিরাপত্তা'}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ইন্টারনেট ছাড়াও চলবে:</strong> সাইটে নেটওয়ার্ক না থাকলেও আপনি প্রজেক্ট, খরচ, বা মিস্ত্রির হাজিরা এন্ট্রি করতে পারবেন।
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>অটো-লোকাল সেভ:</strong> প্রতিটি অক্ষর টাইপ করার সাথে সাথে ব্রাউজারের লোকাল মেমোরিতে ১০০% নিরাপদে সেভ হয়।
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>নেট আসলেই অটো-সিঙ্ক:</strong> ইন্টারনেট কানেকশন ফেরত আসা মাত্রই ক্লাউড ব্যাকআপ স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে যায়।
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-3">
              {/* Everyday Work Short Link */}
              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300">
                    🛠️ প্রতিদিন কাজ করার শর্ট লিংক (Everyday Work Link):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(workShortLink);
                      setStatusMessage({
                        type: 'success',
                        text: `প্রতিদিন কাজ করার শর্ট লিংক কপি হয়েছে: ${workShortLink}`,
                      });
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> কপি করুন
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={getLiveWorkUrl()}
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(workShortLink);
                      if (onSetClientViewMode) onSetClientViewMode(false);
                      setStatusMessage({
                        type: 'success',
                        text: `প্রতিদিন কাজ করার মোড চালু ও শর্ট লিংক কপি হয়েছে: ${workShortLink}`,
                      });
                    }}
                    className="block font-mono text-xs font-bold text-white hover:text-amber-300 underline break-all cursor-pointer"
                  >
                    {workShortLink}
                  </a>
                  <a
                    href={workShortLink}
                    target="_blank"
                    rel="noreferrer"
                    title="নতুন ট্যাবে ওপেন করুন"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-[10px] text-slate-500 font-mono break-all">
                  Full: {getLiveWorkUrl()}
                </div>
              </div>

              {/* Client View Short Link */}
              <div className="bg-slate-950 p-3 rounded-xl border border-sky-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-sky-300">
                    👁️ ক্লায়েন্ট ভিউ শর্ট লিংক (Client View + Login):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(clientShortLink);
                      setStatusMessage({
                        type: 'success',
                        text: `ক্লায়েন্ট ভিউ শর্ট লিংক কপি হয়েছে: ${clientShortLink}`,
                      });
                    }}
                    className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> কপি করুন
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={getSharedClientUrl()}
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(clientShortLink);
                      if (onSetClientViewMode) onSetClientViewMode(true);
                      setStatusMessage({
                        type: 'success',
                        text: `ক্লায়েন্ট ভিউ মোড চালু ও শর্ট লিংক কপি হয়েছে: ${clientShortLink}`,
                      });
                    }}
                    className="block font-mono text-xs font-bold text-white hover:text-sky-300 underline break-all cursor-pointer"
                  >
                    {clientShortLink}
                  </a>
                  <a
                    href={clientShortLink}
                    target="_blank"
                    rel="noreferrer"
                    title="নতুন ট্যাবে ওপেন করুন"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-[10px] text-slate-400">
                  * ক্লায়েন্ট এই লিংকে শুধু দেখতে পারবেন, আর কারো কাছে লগইন পাসওয়ার্ড/পিন (যেমন: 1234) থাকলে লগইন করে ফুল অ্যাক্সেস নিতে পারবেন।
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
