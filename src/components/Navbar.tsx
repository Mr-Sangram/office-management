/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertTriangle,
  DollarSign,
  Layers,
  Globe,
  Cloud,
  CloudCheck,
  KeyRound,
  LogOut,
  Download,
} from 'lucide-react';
import { CompanySettings, AppUser, ReleaseNotification } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface NavbarProps {
  settings: CompanySettings;
  runningProjectsCount: number;
  totalReceived: number;
  totalDue: number;
  lowStockCount: number;
  language: 'EN' | 'BN';
  isDriveConnected?: boolean;
  isClientViewMode?: boolean;
  isLoggedIn?: boolean;
  currentUser?: AppUser;
  releaseNotifications?: ReleaseNotification[];
  onNavigateToOwnerStudio?: () => void;
  onNavigateToGitHubDeploy?: () => void;
  onOpenSwitchUser?: () => void;
  onLogoutToClientView?: () => void;
  onToggleClientViewMode?: () => void;
  onSetClientViewMode?: (isClient: boolean) => void;
  onToggleLanguage: () => void;
  onExportExcel: () => void;
  onOpenAppsScriptModal: () => void;
  onNavigateToPrintables: () => void;
  onOpenCloudSyncModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  runningProjectsCount,
  totalReceived,
  totalDue,
  lowStockCount,
  language,
  isDriveConnected = false,
  isClientViewMode = false,
  isLoggedIn = false,
  currentUser,
  onOpenSwitchUser,
  onLogoutToClientView,
  onToggleLanguage,
  onExportExcel,
  onOpenCloudSyncModal,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-2.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-extrabold text-xl shrink-0">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base lg:text-lg tracking-tight text-white flex items-center gap-1.5">
                {settings.companyName}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ERP & Sheets
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xs md:max-w-md">
              {language === 'EN' ? settings.tagline : 'ইন্টেরিয়র ডিজাইন ও ডেকোরেশন ম্যানেজমেন্ট সিস্টেম'}
            </p>
          </div>
        </div>

        {/* Live Top Indicators */}
        <div className="hidden xl:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">{language === 'EN' ? 'Running:' : 'চলতি প্রজেক্ট:'}</span>
            <span className="font-bold text-sky-300">
              {isClientViewMode ? '---' : runningProjectsCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">{language === 'EN' ? 'Received:' : 'জমা:'}</span>
            <span className="font-bold text-emerald-300">
              {isClientViewMode ? '৳ ---' : formatCurrency(totalReceived, settings.currencySymbol)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">{language === 'EN' ? 'Due:' : 'বকেয়া:'}</span>
            <span className="font-bold text-rose-300">
              {isClientViewMode ? '৳ ---' : formatCurrency(totalDue, settings.currencySymbol)}
            </span>
          </div>

          {!isClientViewMode && lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/15 px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-semibold">{lowStockCount} {language === 'EN' ? 'Low Stock' : 'কম স্টক'}</span>
            </div>
          )}
        </div>

        {/* Clean, Streamlined Action Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Drive Backup Button (Short, Bangla/EN) */}
          <button
            type="button"
            onClick={onOpenCloudSyncModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer shrink-0 ${
              !isOnline
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : isDriveConnected
                ? 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-700/60 text-indigo-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Google Drive 24/7 Cloud Sync"
          >
            {isDriveConnected ? (
              <CloudCheck className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>
              {!isOnline
                ? language === 'EN' ? 'Offline' : 'অফলাইন'
                : language === 'EN' ? 'Drive Sync' : 'ড্রাইভ ব্যাকআপ'}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer shrink-0"
            title="Toggle Language / ভাষা পরিবর্তন করুন"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'EN' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Compact Excel Export */}
          <button
            type="button"
            onClick={onExportExcel}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 transition cursor-pointer shrink-0"
            title={language === 'EN' ? 'Export 14-Sheet Workbook' : 'সম্পূর্ণ এক্সেল শিট ডাউনলোড'}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'EN' ? 'Excel' : 'এক্সেল'}</span>
          </button>

          {/* Login vs Logged In Profile + Logout */}
          {!isLoggedIn || isClientViewMode ? (
            /* When in Client View / Not Logged In: Prominent Login Button */
            <button
              type="button"
              onClick={onOpenSwitchUser}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0 animate-pulse"
              title="পাসওয়ার্ড বা পিন দিয়ে লগইন করে সম্পূর্ণ ডাটা দেখুন"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === 'EN' ? 'Login (PIN)' : 'লগইন (PIN)'}</span>
            </button>
          ) : (
            /* When Logged In: Login button disappears; User Profile Badge and Logout Button appear */
            <div className="flex items-center gap-1.5 shrink-0">
              {currentUser && (
                <button
                  type="button"
                  onClick={onOpenSwitchUser}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs transition cursor-pointer"
                  title={language === 'EN' ? 'Switch User / Profile' : 'ইউজার অ্যাকাউন্ট বা পিন পরিবর্তন'}
                >
                  <span className="text-sm">{currentUser.avatar || '👤'}</span>
                  <div className="hidden sm:flex flex-col text-left leading-none">
                    <span className="font-bold text-white text-[11px] truncate max-w-[85px]">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-amber-400 font-semibold">
                      {currentUser.role}
                    </span>
                  </div>
                </button>
              )}

              {onLogoutToClientView && (
                <button
                  type="button"
                  onClick={onLogoutToClientView}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition cursor-pointer shadow-sm"
                  title={language === 'EN' ? 'Logout to Client View' : 'লগআউট করুন (অটোমেটিক ক্লায়েন্ট ভিউতে যাবে)'}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'EN' ? 'Logout' : 'লগআউট'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
