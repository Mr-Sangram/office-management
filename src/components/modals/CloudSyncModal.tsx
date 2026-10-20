/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Cloud,
  CloudCheck,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Wifi,
  WifiOff
} from 'lucide-react';
import {
  getDriveSyncUrl,
  getLastSyncTime,
  syncToGoogleDrive,
  downloadJsonBackup,
} from '../../utils/googleDriveSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'EN' | 'BN';
  onNavigateToCloudSyncView: () => void;
  fullPayload: any;
  companyName: string;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigateToCloudSyncView,
  fullPayload,
  companyName,
}) => {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const webAppUrl = getDriveSyncUrl();
  const lastSync = getLastSyncTime();

  const handleSyncNow = async () => {
    if (!webAppUrl) {
      setResultMessage({
        type: 'error',
        text: language === 'EN'
          ? 'Google Apps Script URL is not set yet. Click "Configure Cloud Sync" below.'
          : 'গুগল ড্রাইভ স্ক্রিপ্ট URL এখনো সেট করা হয়নি। নিচে "ক্লাউড সিঙ্ক সেটিংস"-এ ক্লিক করুন।',
      });
      return;
    }

    setIsSyncing(true);
    setResultMessage(null);

    try {
      const res = await syncToGoogleDrive(fullPayload, webAppUrl);
      if (res.success) {
        setResultMessage({
          type: 'success',
          text: language === 'EN'
            ? 'Successfully backed up to your personal Google Drive!'
            : 'আপনার গুগল ড্রাইভের ব্যাকআপ ফোল্ডারে সফলভাবে সেভ হয়েছে!',
        });
      } else {
        setResultMessage({
          type: 'error',
          text: res.message,
        });
      }
    } catch (e: any) {
      setResultMessage({
        type: 'error',
        text: e.message || 'সিঙ্ক ব্যর্থ হয়েছে।',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownload = () => {
    downloadJsonBackup(fullPayload, companyName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              {language === 'EN' ? 'Google Drive Cloud Sync' : 'গুগল ড্রাইভ ক্লাউড ব্যাকআপ'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === 'EN' ? 'Automated 24/7 backup to personal Drive' : 'ব্যক্তিগত গুগল ড্রাইভে ২৪/৭ অটো-ব্যাকআপ'}
            </p>
          </div>
        </div>

        {/* Status Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{language === 'EN' ? 'Connection Status:' : 'ইন্টারনেট স্ট্যাটাস:'}</span>
            <div className="flex items-center gap-1.5 font-bold">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400">{language === 'EN' ? 'Online' : 'অনলাইন'}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400">{language === 'EN' ? 'Offline (Saved Locally)' : 'অফলাইন (লোকাল সেভ)'}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">{language === 'EN' ? 'Google Drive Link:' : 'ড্রাইভ স্ক্রিপ্ট লিংক:'}</span>
            <span className="font-semibold text-slate-200">
              {webAppUrl ? (
                <span className="text-indigo-400 flex items-center gap-1">
                  <CloudCheck className="w-3.5 h-3.5" />
                  {language === 'EN' ? 'Configured' : 'সংযুক্ত'}
                </span>
              ) : (
                <span className="text-slate-500">{language === 'EN' ? 'Not connected' : 'সংযোগ নেই'}</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">{language === 'EN' ? 'Last Cloud Backup:' : 'সর্বশেষ ব্যাকআপ:'}</span>
            <span className="font-medium text-slate-300">
              {lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (language === 'EN' ? 'Never' : 'এখনো হয়নি')}
            </span>
          </div>
        </div>

        {/* Result Message */}
        {resultMessage && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
              resultMessage.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
            }`}
          >
            {resultMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{resultMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing || !isOnline}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-950/50 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing
                ? (language === 'EN' ? 'Syncing to Drive...' : 'ড্রাইভে ব্যাকআপ পাঠানো হচ্ছে...')
                : (language === 'EN' ? 'Sync Now to Google Drive' : 'গুগল ড্রাইভে এখনই সেভ করুন')}
            </span>
          </button>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'EN' ? 'Download Offline Backup (.json)' : 'অফলাইন ব্যাকআপ ডাউনলোড (.json)'}</span>
          </button>
        </div>

        {/* Footer Link to Full Cloud Settings */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onNavigateToCloudSyncView();
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition"
          >
            <span>{language === 'EN' ? 'Open Full Cloud Sync Settings' : 'সম্পূর্ণ ক্লাউড ব্যাকআপ সেটিংস ও গাইড'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            100% Free
          </span>
        </div>
      </div>
    </div>
  );
};
