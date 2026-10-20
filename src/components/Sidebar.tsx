import React from 'react';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Package,
  Truck,
  HardHat,
  BadgeDollarSign,
  Receipt,
  TrendingUp,
  CalendarCheck,
  Building,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Printer,
  ChevronRight,
  Cloud,
  Car,
  Filter,
  ShieldCheck,
  Lock,
  LogOut,
  History,
  FolderArchive,
  GitBranch,
  Rocket,
} from 'lucide-react';
import { AppUser } from '../types';
import { hasModulePermission } from '../utils/permissions';

export type TabType =
  | 'dashboard'
  | 'clients'
  | 'projects'
  | 'materials'
  | 'suppliers'
  | 'labour'
  | 'payments'
  | 'dailycosts'
  | 'expenses'
  | 'profitloss'
  | 'tasks'
  | 'office'
  | 'smartfilter'
  | 'reports'
  | 'printables'
  | 'cloudsync'
  | 'googleguide'
  | 'settings'
  | 'users'
  | 'auditlogs'
  | 'ownerstudio'
  | 'githubdeploy';


interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: 'EN' | 'BN';
  counts: {
    clients: number;
    projects: number;
    lowStock: number;
    pendingTasks: number;
  };
  currentUser?: AppUser;
  isClientViewMode?: boolean;
  isLoggedIn?: boolean;
  onOpenSwitchUser?: () => void;
  onLockSession?: () => void;
  onLogoutToClientView?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  language,
  counts,
  currentUser,
  isClientViewMode = false,
  isLoggedIn = false,
  onOpenSwitchUser,
  onLockSession,
  onLogoutToClientView,
}) => {
  const navSections = [
    {
      group: language === 'EN' ? 'OVERVIEW' : 'প্রধান ড্যাশবোর্ড',
      items: [
        {
          id: 'dashboard' as TabType,
          label: language === 'EN' ? 'Main Dashboard' : 'মেইন ড্যাশবোর্ড',
          sub: language === 'EN' ? 'All live metrics' : 'সার্বিক তথ্য',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      group: language === 'EN' ? 'PROJECT OPERATIONS' : 'প্রজেক্ট ও ক্লায়েন্ট',
      items: [
        {
          id: 'clients' as TabType,
          label: language === 'EN' ? 'Client Management' : 'ক্লায়েন্ট ব্যবস্থাপনা',
          sub: language === 'EN' ? 'Contracts & dues' : 'চুক্তি ও বকেয়া',
          icon: Users,
          badge: counts.clients,
        },
        {
          id: 'projects' as TabType,
          label: language === 'EN' ? 'Project Management' : 'প্রজেক্ট ট্র্যাকিং',
          sub: language === 'EN' ? 'Sites, stages & costs' : 'সাইট ও প্রজেক্ট অগ্রগতি',
          icon: FolderKanban,
          badge: counts.projects,
        },
        {
          id: 'tasks' as TabType,
          label: language === 'EN' ? 'Tasks & Timeline' : 'টাস্ক ও সময়সীমা',
          sub: language === 'EN' ? 'Deadlines & milestones' : 'ডেডলাইন ও কাজ',
          icon: CalendarCheck,
          badge: counts.pendingTasks > 0 ? counts.pendingTasks : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300',
        },
      ],
    },
    {
      group: language === 'EN' ? 'FINANCIALS & ACCOUNTS' : 'আয়-ব্যয় ও লাভ-ক্ষতি',
      items: [
        {
          id: 'payments' as TabType,
          label: language === 'EN' ? 'Payments Received' : 'টাকা গ্রহণ / পেমেন্ট',
          sub: language === 'EN' ? 'Client installments' : 'ক্যাশ ও ব্যাংক জমা',
          icon: BadgeDollarSign,
        },
        {
          id: 'dailycosts' as TabType,
          label: language === 'EN' ? 'Daily Costs & Conveyance' : 'দৈনিক খরচ ও কনভেয়েন্স',
          sub: language === 'EN' ? 'Site visits, tea & petty cash' : 'যাতায়াত, সাইট ভিজিট ও চা-নাস্তা',
          icon: Car,
        },
        {
          id: 'expenses' as TabType,
          label: language === 'EN' ? 'Expense Management' : 'খরচ / ব্যয় হিসাব',
          sub: language === 'EN' ? 'Project direct vs office' : 'সাইট ও অফিস খরচ',
          icon: Receipt,
        },
        {
          id: 'profitloss' as TabType,
          label: language === 'EN' ? 'Project Profit & Loss' : 'প্রজেক্ট লাভ-ক্ষতি',
          sub: language === 'EN' ? 'Margin & cost audit' : 'নিট প্রফিট ও মার্জিন',
          icon: TrendingUp,
        },
      ],
    },
    {
      group: language === 'EN' ? 'INVENTORY & SITE TEAMS' : 'উপকরণ, সাপ্লায়ার ও মিস্ত্রি',
      items: [
        {
          id: 'materials' as TabType,
          label: language === 'EN' ? 'Materials & Inventory' : 'উপকরণ ও ইনভেন্টরি',
          sub: language === 'EN' ? 'Stock & site usage' : 'স্টক ও সাইট ব্যবহার',
          icon: Package,
          badge: counts.lowStock > 0 ? counts.lowStock : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300',
        },
        {
          id: 'suppliers' as TabType,
          label: language === 'EN' ? 'Suppliers & Purchases' : 'সাপ্লায়ার ও ক্রয়',
          sub: language === 'EN' ? 'Vendors & PO dues' : 'ভেন্ডর বিল ও বাকি',
          icon: Truck,
        },
        {
          id: 'labour' as TabType,
          label: language === 'EN' ? 'Labour & Staff Logs' : 'মিস্ত্রি ও হাজিরা',
          sub: language === 'EN' ? 'Wages & daily attendance' : 'দৈনিক হাজিরা ও মজুরি',
          icon: HardHat,
        },
      ],
    },
    {
      group: language === 'EN' ? 'OFFICE & AUTOMATION' : 'অফিস ও অটোমেশন',
      items: [
        {
          id: 'office' as TabType,
          label: language === 'EN' ? 'Office Management' : 'অফিস ব্যবস্থাপনা',
          sub: language === 'EN' ? 'Staff, assets & bills' : 'স্টাফ, সম্পদ ও ইউটিলিটি',
          icon: Building,
        },
        {
          id: 'smartfilter' as TabType,
          label: language === 'EN' ? 'Smart Filter & Audit' : 'স্মার্ট ফিল্টার ও কস্ট অডিট',
          sub: language === 'EN' ? 'Worker, staff, bills & conveyance' : 'লেবার, বেতন, বিল ও যাতায়াত',
          icon: Filter,
        },
        {
          id: 'reports' as TabType,
          label: language === 'EN' ? 'Financial Reports' : 'আর্থিক রিপোর্ট',
          sub: language === 'EN' ? 'Statements & audit' : 'মাসিক ও বাৎসরিক বিবরণী',
          icon: BarChart3,
        },
        {
          id: 'printables' as TabType,
          label: language === 'EN' ? 'Invoices & Receipts' : 'প্রিন্ট রশিদ ও ইনভয়েস',
          sub: language === 'EN' ? 'Client print-ready docs' : 'প্রিন্ট উপযোগী ভাউচার',
          icon: Printer,
        },
        {
          id: 'cloudsync' as TabType,
          label: language === 'EN' ? 'Cloud & Drive Backup' : 'ক্লাউড ও ড্রাইভ ব্যাকআপ',
          sub: language === 'EN' ? '24/7 Auto-sync & Google Drive' : '২৪/৭ অটো ব্যাকআপ ও ড্রাইভ',
          icon: Cloud,
        },
        {
          id: 'googleguide' as TabType,
          label: language === 'EN' ? 'Google Sheets Setup' : 'গুগল শিট গাইড ও ফর্মুলা',
          sub: language === 'EN' ? '14 Sheets & Formulas' : 'সম্পূর্ণ শিট স্ট্রাকচার',
          icon: FileSpreadsheet,
        },
        {
          id: 'settings' as TabType,
          label: language === 'EN' ? 'Company Settings' : 'কোম্পানি সেটিংস',
          sub: language === 'EN' ? 'Categories & dropdowns' : 'ক্যাটাগরি ও ড্রপডাউন',
          icon: Settings,
        },
        {
          id: 'users' as TabType,
          label: language === 'EN' ? 'Team & Access Control' : 'টিম পারমিশন ও এক্সেস',
          sub: language === 'EN' ? 'Manager limits & PINs' : 'ম্যানেজার রোল ও সীমিত এক্সেস',
          icon: ShieldCheck,
        },
        {
          id: 'auditlogs' as TabType,
          label: language === 'EN' ? 'Audit Logs & Backup' : 'অডিট লগ ও ব্যাকআপ টুলস',
          sub: language === 'EN' ? 'Activity log & restore' : 'সকল কাজের রেকর্ড ও রিস্টোর',
          icon: History,
        },
        {
          id: 'githubdeploy' as TabType,
          label:
            language === 'EN'
              ? 'GitHub & Vercel 24/7 (ZIP)'
              : 'GitHub ও Vercel ডিপ্লয় (ZIP)',
          sub:
            language === 'EN'
              ? '24/7 Live Hosting & Complete Zip'
              : '২৪/৭ লাইভ হোস্টিং ও সম্পূর্ণ জিপ',
          icon: GitBranch,
          badge: '24/7 LIVE',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
        },
        {
          id: 'ownerstudio' as TabType,
          label:
            language === 'EN'
              ? 'Owner ZIP, Play Store & Domain'
              : 'ওনার ZIP, Play Store ও আপডেট',
          sub:
            language === 'EN'
              ? 'ZIP, Play Store, Domain & Staging'
              : 'সব ফাইল ZIP, ডোমেইন ও টেস্ট রিলিজ',
          icon: FolderArchive,
          badge: 'OWNER',
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
        },
      ],
    },
  ];

  // Helper to check if a tab is allowed by current user's permissions
  const isTabAllowed = (tabId: TabType): boolean => {
    if (isClientViewMode) {
      // In Client View / Unauthenticated mode, allow standard categories so visitor can view category structure
      if (['ownerstudio', 'githubdeploy', 'settings', 'users', 'auditlogs', 'cloudsync', 'googleguide'].includes(tabId)) {
        return false;
      }
      return true;
    }

    if (!currentUser) return tabId !== 'ownerstudio' && tabId !== 'githubdeploy';
    if (tabId === 'ownerstudio' || tabId === 'githubdeploy') {
      return currentUser.role === 'Owner';
    }
    if (currentUser.role === 'Owner') return true;
    switch (tabId) {
      case 'dashboard':
        return hasModulePermission(currentUser, 'dashboard', 'view');
      case 'clients':
        return hasModulePermission(currentUser, 'clients', 'view');
      case 'projects':
      case 'tasks':
        return hasModulePermission(currentUser, 'projects', 'view');
      case 'payments':
        return (
          hasModulePermission(currentUser, 'clients', 'view') ||
          hasModulePermission(currentUser, 'reports', 'view')
        );
      case 'dailycosts':
        return hasModulePermission(currentUser, 'dailyCosts', 'view');
      case 'expenses':
        return hasModulePermission(currentUser, 'expenses', 'view');
      case 'profitloss':
        return hasModulePermission(currentUser, 'reports', 'view');
      case 'materials':
      case 'suppliers':
        return hasModulePermission(currentUser, 'inventory', 'view');
      case 'labour':
        return hasModulePermission(currentUser, 'labour', 'view');
      case 'office':
        return hasModulePermission(currentUser, 'staff', 'view');
      case 'smartfilter':
      case 'reports':
        return hasModulePermission(currentUser, 'reports', 'view');
      case 'printables':
        return (
          hasModulePermission(currentUser, 'clients', 'view') ||
          hasModulePermission(currentUser, 'reports', 'view')
        );
      case 'cloudsync':
      case 'googleguide':
        return hasModulePermission(currentUser, 'cloudSync', 'view');
      case 'settings':
        return hasModulePermission(currentUser, 'settings', 'view');
      case 'users':
        return hasModulePermission(currentUser, 'users', 'view');
      case 'auditlogs':
        return (
          hasModulePermission(currentUser, 'cloudSync', 'view') ||
          hasModulePermission(currentUser, 'users', 'view')
        );
      default:
        return true;
    }
  };


  return (
    <aside className="w-full lg:w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      <div className="p-3 space-y-6 flex-1 overflow-y-auto">
        {navSections.map((section, idx) => {
          const allowedItems = section.items.filter((item) => isTabAllowed(item.id));
          if (allowedItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.group}
              </h3>
              <div className="space-y-0.5">
                {allowedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const showBadge = !isClientViewMode && item.badge !== undefined;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/15 to-amber-600/5 text-amber-300 font-semibold border border-amber-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isActive
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="truncate flex items-center gap-1.5">
                            <span>{item.label}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-normal">
                            {item.sub}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {showBadge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.badgeColor || 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Session Profile Card & Quick Switcher */}
      <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
              {isClientViewMode ? '👁️' : currentUser?.avatar || '👤'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {isClientViewMode
                  ? language === 'EN' ? 'Client View' : 'ক্লায়েন্ট ভিউ'
                  : currentUser?.name || 'User'}
              </div>
              <div className="text-[10px] text-indigo-400 font-semibold truncate">
                {isClientViewMode
                  ? language === 'EN' ? 'Protected Data' : 'ডাটা গোপন রয়েছে'
                  : currentUser?.role || 'Staff'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isClientViewMode ? (
              onOpenSwitchUser && (
                <button
                  onClick={onOpenSwitchUser}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition cursor-pointer"
                  title="পাসওয়ার্ড বা পিন দিয়ে লগইন করুন"
                >
                  {language === 'EN' ? 'Login' : 'লগইন'}
                </button>
              )
            ) : (
              <>
                {onOpenSwitchUser && (
                  <button
                    onClick={onOpenSwitchUser}
                    className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-semibold transition cursor-pointer"
                    title="Switch user account"
                  >
                    {language === 'EN' ? 'Switch' : 'সুইচ'}
                  </button>
                )}
                {onLogoutToClientView ? (
                  <button
                    onClick={onLogoutToClientView}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                    title={language === 'EN' ? 'Switch to Client View / Logout' : 'ক্লায়েন্ট ভিউতে সুইচ / লগআউট'}
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                ) : onLockSession && (
                  <button
                    onClick={onLockSession}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                    title={language === 'EN' ? 'Lock Screen' : 'স্ক্রিন লক'}
                  >
                    <Lock className="w-3 h-3" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>{isClientViewMode ? (language === 'EN' ? 'Privacy Shield' : 'ব্যবসায়িক গোপনীয়তা') : (language === 'EN' ? 'Cloud & Drive Sync' : 'ক্লাউড ও ড্রাইভ সিঙ্ক')}</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isClientViewMode ? (language === 'EN' ? 'Protected' : 'সুরক্ষিত') : (language === 'EN' ? 'Active' : 'সক্রিয়')}</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
