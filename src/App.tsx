/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { ClientsView } from './components/views/ClientsView';
import { ProjectsView } from './components/views/ProjectsView';
import { MaterialsView } from './components/views/MaterialsView';
import { SuppliersView } from './components/views/SuppliersView';
import { LabourView } from './components/views/LabourView';
import { PaymentsView } from './components/views/PaymentsView';
import { DailyCostsView } from './components/views/DailyCostsView';
import { ExpensesView } from './components/views/ExpensesView';
import { ProfitLossView } from './components/views/ProfitLossView';
import { TasksTimelineView } from './components/views/TasksTimelineView';
import { OfficeManagementView } from './components/views/OfficeManagementView';
import { SmartFilterReportView } from './components/views/SmartFilterReportView';
import { ReportsView } from './components/views/ReportsView';
import { PrintablesView } from './components/views/PrintablesView';
import { CloudSyncView } from './components/views/CloudSyncView';
import { GoogleSheetsGuideView } from './components/views/GoogleSheetsGuideView';
import { SettingsView } from './components/views/SettingsView';
import { UserManagementView } from './components/views/UserManagementView';
import { AuditLogView } from './components/views/AuditLogView';
import { OwnerDeploymentStudioView } from './components/views/OwnerDeploymentStudioView';
import { GitHubVercelDeployView } from './components/views/GitHubVercelDeployView';

import { ClientModal } from './components/modals/ClientModal';
import { ProjectModal } from './components/modals/ProjectModal';
import { MaterialModal } from './components/modals/MaterialModal';
import { TransactionModal } from './components/modals/TransactionModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { DailyCostModal } from './components/modals/DailyCostModal';
import { WorkerModal } from './components/modals/WorkerModal';
import { AttendanceModal } from './components/modals/AttendanceModal';
import { TaskModal } from './components/modals/TaskModal';
import { StaffModal } from './components/modals/StaffModal';
import { AssetModal } from './components/modals/AssetModal';
import { BillModal } from './components/modals/BillModal';
import { SalaryPaymentModal, SalaryPaymentData } from './components/modals/SalaryPaymentModal';
import { UserModal } from './components/modals/UserModal';
import { SupplierModal } from './components/modals/SupplierModal';
import { PurchaseOrderModal } from './components/modals/PurchaseOrderModal';
import { UserSwitchModal } from './components/modals/UserSwitchModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { GoogleAppsScriptModal } from './components/modals/GoogleAppsScriptModal';
import { CloudSyncModal } from './components/modals/CloudSyncModal';
import { GeminiAiAssistant } from './components/GeminiAiAssistant';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  getDriveSyncUrl,
  getAutoSyncEnabled,
  syncToGoogleDrive,
  pushToLiveServerDb,
  pullFromLiveServerDb,
  getLiveWorkUrl,
  getSharedClientUrl,
} from './utils/googleDriveSync';
import { Lock, ShieldAlert, Bell, FlaskConical, CheckCircle2, ShieldCheck } from 'lucide-react';

import {
  initialSettings,
  initialClients,
  initialProjects,
  initialMaterials,
  initialTransactions,
  initialSuppliers,
  initialPurchases,
  initialWorkers,
  initialAttendance,
  initialPayments,
  initialExpenses,
  initialOfficeStaff,
  initialOfficeAssets,
  initialOfficeBills,
  initialTasks,
  initialAuditLogs,
  initialPettyCashFund,
  initialUsers,
} from './data/initialData';

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
  PettyCashFund,
  OfficeStaff,
  OfficeAsset,
  OfficeBill,
  TaskItem,
  AuditRecord,
  AppUser,
  ModuleKey,
  ActionType,
  ReleaseNotification,
  DataSnapshotBackup,
} from './types';

import { generateNextId } from './utils/formatters';
import { exportCompleteWorkbook } from './utils/exportToExcel';
import { hasModulePermission } from './utils/permissions';

export default function App() {
  // Seed 1 synced entry per category (with Paid & Due balances) if not seeded yet
  if (typeof window !== 'undefined' && localStorage.getItem('ic_seed_v3_one_per_category') !== 'true') {
    const keysToClear = [
      'ic_settings',
      'ic_clients',
      'ic_projects',
      'ic_materials',
      'ic_transactions',
      'ic_suppliers',
      'ic_purchases',
      'ic_workers',
      'ic_attendance',
      'ic_payments',
      'ic_expenses',
      'ic_staff',
      'ic_assets',
      'ic_bills',
      'ic_tasks',
      'ic_auditLogs',
      'ic_pettyCash',
      'ic_users',
      'ic_current_user_id',
    ];
    keysToClear.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem('ic_seed_v3_one_per_category', 'true');
  }

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [language, setLanguage] = useState<'EN' | 'BN'>('BN'); // Default to Bangla as user instructed
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'client' || params.get('mode') === 'client') {
      return false;
    }
    const savedLogin = localStorage.getItem('ic_is_logged_in');
    return savedLogin === 'true';
  });

  const [isClientViewMode, setIsClientViewMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'client' || params.get('mode') === 'client') {
      return true;
    }
    const savedLogin = localStorage.getItem('ic_is_logged_in');
    return savedLogin !== 'true';
  });

  // Master State with LocalStorage Persistence & Company Name Migration
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('ic_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          !parsed.companyName ||
          parsed.companyName === 'Studio ArchVista Interior & Decor' ||
          parsed.companyName === 'InteriorCraft Studio'
        ) {
          parsed.companyName = 'Advance System Company Management';
        }
        return parsed;
      } catch {
        return initialSettings;
      }
    }
    return initialSettings;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('ic_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ic_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem('ic_materials');
    return saved ? JSON.parse(saved) : initialMaterials;
  });

  const [transactions, setTransactions] = useState<MaterialTransaction[]>(() => {
    const saved = localStorage.getItem('ic_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('ic_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('ic_purchases');
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('ic_workers');
    return saved ? JSON.parse(saved) : initialWorkers;
  });

  const [attendance, setAttendance] = useState<LabourAttendance[]>(() => {
    const saved = localStorage.getItem('ic_attendance');
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [payments, setPayments] = useState<PaymentReceived[]>(() => {
    const saved = localStorage.getItem('ic_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('ic_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [staff, setStaff] = useState<OfficeStaff[]>(() => {
    const saved = localStorage.getItem('ic_staff');
    return saved ? JSON.parse(saved) : initialOfficeStaff;
  });

  const [assets, setAssets] = useState<OfficeAsset[]>(() => {
    const saved = localStorage.getItem('ic_assets');
    return saved ? JSON.parse(saved) : initialOfficeAssets;
  });

  const [bills, setBills] = useState<OfficeBill[]>(() => {
    const saved = localStorage.getItem('ic_bills');
    return saved ? JSON.parse(saved) : initialOfficeBills;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('ic_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem('ic_auditLogs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('ic_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('ic_current_user_id');
    return saved || (initialUsers[0]?.id ?? 'USR-001');
  });

  const [pettyCashFund, setPettyCashFund] = useState<PettyCashFund>(() => {
    const saved = localStorage.getItem('ic_pettyCash');
    return saved ? JSON.parse(saved) : initialPettyCashFund;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('ic_settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('ic_clients', JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    localStorage.setItem('ic_projects', JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem('ic_materials', JSON.stringify(materials));
  }, [materials]);
  useEffect(() => {
    localStorage.setItem('ic_transactions', JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem('ic_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem('ic_purchases', JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    localStorage.setItem('ic_workers', JSON.stringify(workers));
  }, [workers]);
  useEffect(() => {
    localStorage.setItem('ic_attendance', JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem('ic_payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem('ic_expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('ic_staff', JSON.stringify(staff));
  }, [staff]);
  useEffect(() => {
    localStorage.setItem('ic_assets', JSON.stringify(assets));
  }, [assets]);
  useEffect(() => {
    localStorage.setItem('ic_bills', JSON.stringify(bills));
  }, [bills]);
  useEffect(() => {
    localStorage.setItem('ic_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('ic_auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('ic_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('ic_current_user_id', currentUserId);
  }, [currentUserId]);
  useEffect(() => {
    localStorage.setItem('ic_pettyCash', JSON.stringify(pettyCashFund));
  }, [pettyCashFund]);

  // Owner Staging Mode, Release Notifications & Zero-Data-Loss Snapshots
  const [isStagingMode, setIsStagingMode] = useState<boolean>(false);
  const [releaseNotifications, setReleaseNotifications] = useState<ReleaseNotification[]>(() => {
    try {
      const saved = localStorage.getItem('ic_release_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [snapshots, setSnapshots] = useState<DataSnapshotBackup[]>(() => {
    try {
      const saved = localStorage.getItem('ic_data_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [dismissedReleaseId, setDismissedReleaseId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('ic_release_notifications', JSON.stringify(releaseNotifications));
  }, [releaseNotifications]);

  useEffect(() => {
    localStorage.setItem('ic_data_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  const isLoggedInUser = isLoggedIn && !isClientViewMode;

  const clientGuestUser: AppUser = {
    id: 'CLIENT-GUEST',
    name: language === 'EN' ? 'Client Guest' : 'সম্মানিত ক্লায়েন্ট / ভিজিটর',
    email: 'guest@portal.local',
    phone: '',
    role: 'Client',
    pin: '',
    avatar: '👁️',
    status: 'Active',
    permissions: {
      viewDashboard: true,
      manageProjects: false,
      manageClients: false,
      manageInventory: false,
      manageDailyCosts: false,
      manageLabour: false,
      manageStaffAndPayroll: false,
      viewFinancialReports: false,
      manageCompanySettings: false,
      manageCloudBackup: false,
      manageUsers: false,
      modules: {
        dashboard: { view: true },
        projects: { view: true, add: false, edit: false, delete: false },
        clients: { view: true, add: false, edit: false, delete: false },
        dailyCosts: { view: true, add: false, edit: false, delete: false },
        expenses: { view: true, add: false, edit: false, delete: false },
        inventory: { view: true, add: false, edit: false, delete: false },
        labour: { view: true, add: false, edit: false, delete: false },
        staff: { view: true, add: false, edit: false, delete: false, disburseSalary: false },
        reports: { view: true, export: false },
        cloudSync: { view: false, sync: false, restore: false },
        settings: { view: false, edit: false },
        users: { view: false, add: false, edit: false, delete: false },
      },
    },
    createdAt: '2026-01-01',
  };

  const currentUser: AppUser = isLoggedInUser
    ? (users.find((u) => u.id === currentUserId) || users[0] || initialUsers[0])
    : clientGuestUser;

  // Masked data arrays for Client View vs. Authenticated view:
  // "ad client view te login na kora porjonto kono data imput dekhte parbe na just catagory gula show hobe koto tak khoroch koto taka dewa ei sob thakbe na, tader samne sob kichu empty dekhabe,
  // ekhon login korle oii user er j j permition ache tokhon se oii gular sob kichu dekhte parbe."
  const displayClients = isLoggedInUser ? clients : [];
  const displayProjects = isLoggedInUser ? projects : [];
  const displayMaterials = isLoggedInUser ? materials : [];
  const displayTransactions = isLoggedInUser ? transactions : [];
  const displaySuppliers = isLoggedInUser ? suppliers : [];
  const displayPurchases = isLoggedInUser ? purchases : [];
  const displayWorkers = isLoggedInUser ? workers : [];
  const displayAttendance = isLoggedInUser ? attendance : [];
  const displayPayments = isLoggedInUser ? payments : [];
  const displayExpenses = isLoggedInUser ? expenses : [];
  const displayStaff = isLoggedInUser ? staff : [];
  const displayAssets = isLoggedInUser ? assets : [];
  const displayBills = isLoggedInUser ? bills : [];
  const displayTasks = isLoggedInUser ? tasks : [];
  const displayPettyCashFund = isLoggedInUser
    ? pettyCashFund
    : {
        ...pettyCashFund,
        currentBalance: 0,
        initialAmount: 0,
        totalAdded: 0,
        totalSpent: 0,
        transactions: [],
      };

  // Helper to append an Audit Log entry
  const logAuditAction = (
    action: AuditRecord['action'],
    moduleName: string,
    recordId: string,
    summary: string
  ) => {
    setAuditLogs((prev) => [
      {
        id: generateNextId('AUD', prev.map((a) => a.id)),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action,
        module: moduleName,
        recordId,
        summary,
        user: currentUser?.name || 'System Admin',
      },
      ...prev,
    ]);
  };

  // User Management Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [isUserSwitchModalOpen, setIsUserSwitchModalOpen] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  // Modal States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentReceived | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDailyCostModalOpen, setIsDailyCostModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<LabourAttendance | null>(null);
  const [preselectedAttendanceWorkerId, setPreselectedAttendanceWorkerId] = useState<
    string | null
  >(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Supplier & Purchase Order Modals
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);

  // Office Management Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<OfficeStaff | null>(null);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<OfficeAsset | null>(null);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<OfficeBill | null>(null);

  const [isSalaryPaymentModalOpen, setIsSalaryPaymentModalOpen] = useState(false);
  const [salaryTargetStaff, setSalaryTargetStaff] = useState<OfficeStaff | null>(null);
  const [isSalaryBulkMode, setIsSalaryBulkMode] = useState(false);

  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(() => !!getDriveSyncUrl());

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDriveConnected(!!getDriveSyncUrl());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRestoreFullDatabase = (restored: any, skipAudit?: boolean) => {
    if (restored.settings) {
      const nextSettings = { ...restored.settings };
      if (
        !nextSettings.companyName ||
        nextSettings.companyName === 'Studio ArchVista Interior & Decor'
      ) {
        nextSettings.companyName = 'Advance System Company Management';
      }
      setSettings(nextSettings);
    }
    if (restored.clients) setClients(restored.clients);
    if (restored.projects) setProjects(restored.projects);
    if (restored.materials) setMaterials(restored.materials);
    if (restored.transactions) setTransactions(restored.transactions);
    if (restored.suppliers) setSuppliers(restored.suppliers);
    if (restored.purchases) setPurchases(restored.purchases);
    if (restored.workers) setWorkers(restored.workers);
    if (restored.attendance) setAttendance(restored.attendance);
    if (restored.payments) setPayments(restored.payments);
    if (restored.expenses) setExpenses(restored.expenses);
    if (restored.staff) setStaff(restored.staff);
    if (restored.assets) setAssets(restored.assets);
    if (restored.bills) setBills(restored.bills);
    if (restored.tasks) setTasks(restored.tasks);
    if (restored.auditLogs) setAuditLogs(restored.auditLogs);
    if (restored.pettyCashFund) setPettyCashFund(restored.pettyCashFund);
    if (restored.users) setUsers(restored.users);

    if (!skipAudit) {
      logAuditAction(
        'RESTORE',
        'Cloud Backup & Restore',
        'DB-FULL',
        'Restored full ERP database state from backup'
      );
    }
  };

  // Initial fetch from server live DB so Shared Client Link (ais-pre) and other devices stay synced
  const hasHydratedFromServer = useRef(false);
  useEffect(() => {
    let mounted = true;
    pullFromLiveServerDb().then((serverDb: any) => {
      if (!mounted) return;
      if (serverDb && serverDb.cleanSlateVersion === 'v3' && serverDb.settings) {
        const localAuditCount = auditLogs.length;
        const serverAuditCount = Array.isArray(serverDb.auditLogs) ? serverDb.auditLogs.length : 0;
        if (serverAuditCount > localAuditCount) {
          handleRestoreFullDatabase(serverDb, true);
        }
      }
      hasHydratedFromServer.current = true;
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-sync to Server Live DB (for Client Link) & Google Drive (when Auto-Sync is enabled)
  useEffect(() => {
    if (!hasHydratedFromServer.current) return;

    const fullPayload = {
      cleanSlateVersion: 'v3',
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
      pettyCashFund,
      users,
    };

    const timer = setTimeout(() => {
      pushToLiveServerDb(fullPayload);
      const url = getDriveSyncUrl();
      if (url && getAutoSyncEnabled()) {
        syncToGoogleDrive(fullPayload, url).catch(() => {});
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
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
    pettyCashFund,
    users,
  ]);

  // Additive Board Rate normalization per (workerId, projectId):
  // Every entry keeps its own added boardCount, its own labourCost (bill for those added boards), and its own amountPaid.
  // Running project due (outstandingSalary) is calculated chronologically (oldest to newest) as (Prev Due + New Bill - Paid).
  const normalizeBoardAttendanceLogs = (
    logs: LabourAttendance[]
  ): LabourAttendance[] => {
    const groupMap = new Map<string, LabourAttendance[]>();
    for (const log of logs) {
      if (log.paymentMode === 'Board Rate') {
        const key = `${log.workerId}__${log.projectId}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, []);
        }
        groupMap.get(key)!.push(log);
      }
    }

    const calculatedMap = new Map<
      string,
      { labourCost: number; outstandingSalary: number }
    >();

    groupMap.forEach((groupLogs) => {
      if (groupLogs.length === 0) return;
      // groupLogs is newest-first; process oldest-first to accumulate running bill, paid, and due
      const chronological = [...groupLogs].reverse();
      let runningBill = 0;
      let runningPaid = 0;

      for (const item of chronological) {
        const bRate = Number(item.boardRate || item.baseRate || 0);
        const bCount = Number(item.boardCount || 0);
        const itemBill =
          bCount > 0 && bRate > 0
            ? Math.round(bRate * bCount)
            : Number(item.labourCost || 0);
        const itemPaid = Number(item.amountPaid || 0);

        runningBill += itemBill;
        runningPaid += itemPaid;
        const runningDue = Math.max(0, runningBill - runningPaid);

        calculatedMap.set(item.id, {
          labourCost: itemBill,
          outstandingSalary: runningDue,
        });
      }
    });

    return logs.map((log) => {
      if (log.paymentMode !== 'Board Rate') return log;
      const calc = calculatedMap.get(log.id);
      if (!calc) return log;
      return {
        ...log,
        labourCost: calc.labourCost,
        outstandingSalary: calc.outstandingSalary,
      };
    });
  };

  // Recalculate Worker Totals from Attendance Logs & Contract/Base Amounts
  const syncWorkersWithAttendance = (
    currentWorkers: Worker[],
    currentAttendance: LabourAttendance[]
  ): Worker[] => {
    return currentWorkers.map((w) => {
      const workerLogs = currentAttendance.filter((a) => a.workerId === w.id);
      if (workerLogs.length === 0) {
        const due = Math.max(0, w.totalEarned - w.totalPaid);
        return {
          ...w,
          outstandingSalary: due,
        };
      }

      const loggedEarned = workerLogs.reduce(
        (sum, l) => sum + (Number(l.labourCost) || 0),
        0
      );
      const loggedPaid = workerLogs.reduce(
        (sum, l) => sum + (Number(l.amountPaid) || 0),
        0
      );

      let totalActiveBoards = w.totalBoards;
      let latestBoardRate = w.boardRate;
      if (w.paymentType === 'Board Rate') {
        const boardLogs = workerLogs.filter((l) => l.paymentMode === 'Board Rate');
        if (boardLogs.length > 0) {
          totalActiveBoards = boardLogs.reduce(
            (sum, l) => sum + (Number(l.boardCount) || 0),
            0
          );
          if (boardLogs[0]?.boardRate) {
            latestBoardRate = boardLogs[0].boardRate;
          }
        }
      }

      const effectiveEarned =
        w.paymentType === 'Contract Based' && w.monthlySalary > loggedEarned
          ? w.monthlySalary
          : w.paymentType === 'Board Rate'
          ? loggedEarned
          : loggedEarned > 0
          ? loggedEarned
          : w.totalEarned;

      const effectivePaid = loggedPaid;

      return {
        ...w,
        boardRate: latestBoardRate,
        totalBoards: totalActiveBoards,
        totalEarned: effectiveEarned,
        totalPaid: effectivePaid,
        outstandingSalary: Math.max(0, effectiveEarned - effectivePaid),
      };
    });
  };

  // Recalculate Project Financials whenever transactions, attendance, payments, or expenses change
  const refreshProjectTotals = (
    currentProjects: Project[],
    currentTransactions: MaterialTransaction[],
    currentAttendance: LabourAttendance[],
    currentPayments: PaymentReceived[],
    currentExpenses: ExpenseItem[]
  ) => {
    return currentProjects.map((proj) => {
      // 1. Material cost
      const matCost = currentTransactions
        .filter((t) => t.projectId === proj.id && t.type === 'SITE_ISSUE')
        .reduce((sum, t) => sum + t.totalCost, 0);

      // 2. Labour cost
      const labCost = currentAttendance
        .filter((a) => a.projectId === proj.id)
        .reduce((sum, a) => sum + a.labourCost, 0);

      // 3. Subcontractor & direct expense
      const subCost = currentExpenses
        .filter((e) => e.projectId === proj.id && e.expenseType === 'PROJECT_DIRECT')
        .reduce((sum, e) => sum + e.amount, 0);

      // 4. Amount received
      const received = currentPayments
        .filter((p) => p.projectId === proj.id)
        .reduce((sum, p) => sum + p.amountReceived, 0);

      const netContract = proj.contractValue - (proj.discount || 0);
      const overhead =
        proj.allocatedOverhead || netContract * (settings.defaultOverheadPercentage / 100);
      const totalCost = matCost + labCost + subCost + proj.otherDirectCosts + overhead;
      const profit = netContract - totalCost;
      const margin = netContract > 0 ? (profit / netContract) * 100 : 0;
      const due = Math.max(0, netContract - received);

      return {
        ...proj,
        actualMaterialCost: matCost > 0 ? matCost : proj.actualMaterialCost,
        actualLabourCost: labCost > 0 ? labCost : proj.actualLabourCost,
        subcontractorCost: subCost > 0 ? subCost : proj.subcontractorCost,
        totalProjectCost: totalCost,
        amountReceived: received > 0 ? received : proj.amountReceived,
        outstandingDue: due,
        actualProfit: profit,
        profitMargin: Number(margin.toFixed(2)),
      };
    });
  };

  // Office Staff & Bills Handlers
  const handleSaveStaff = (staffMember: OfficeStaff, newlyPaidAmount?: number) => {
    const isEdit = !!editingStaff;
    if (isEdit) {
      setStaff(staff.map((s) => (s.id === staffMember.id ? staffMember : s)));
    } else {
      setStaff([...staff, staffMember]);
    }
    setEditingStaff(null);

    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Office Staff & Payroll',
      staffMember.id,
      `${isEdit ? 'Updated' : 'Registered'} staff ${staffMember.name} (${staffMember.paymentType || 'Monthly Salary'}) - Paid: ৳${staffMember.totalSalaryPaid || 0}`
    );

    if (newlyPaidAmount && newlyPaidAmount > 0) {
      const nextExpId = generateNextId('EXP', expenses.map((e) => e.id));
      const newExp: ExpenseItem = {
        id: nextExpId,
        date: new Date().toISOString().split('T')[0],
        expenseCategory: 'Staff Salaries & Advances',
        expenseType: 'OFFICE_OVERHEAD',
        description: `${staffMember.paymentType || 'Salary'} payment to ${staffMember.name} (${staffMember.role})`,
        projectId: 'OFFICE_GENERAL',
        projectName: 'Studio Office Payroll',
        supplierPayee: staffMember.name,
        paymentMethod: staffMember.paymentMethod || 'Cash in Hand (হাতে নগদ)',
        billInvoiceNumber: `STF-PAY-${Date.now().toString().slice(-4)}`,
        amount: newlyPaidAmount,
        paymentStatus: 'Paid',
        approvedBy: currentUser.name,
        notes: `Auto-synced from Staff Registration/Update (${staffMember.paymentType || 'Monthly Salary'})`,
      };
      setExpenses((prev) => [newExp, ...prev]);
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    const target = staff.find((s) => s.id === staffId);
    setStaff(staff.filter((s) => s.id !== staffId));
    if (target) {
      logAuditAction(
        'DELETE',
        'Office Staff & Payroll',
        staffId,
        `Removed staff member ${target.name} (${target.role})`
      );
    }
  };

  const handleSaveAsset = (assetItem: OfficeAsset) => {
    const isEdit = !!editingAsset;
    if (isEdit) {
      setAssets(assets.map((a) => (a.id === assetItem.id ? assetItem : a)));
    } else {
      setAssets([...assets, assetItem]);
    }
    setEditingAsset(null);
    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Office Staff & Payroll',
      assetItem.id,
      `${isEdit ? 'Updated' : 'Registered'} office asset ${assetItem.assetName} (৳${assetItem.purchaseCost})`
    );
  };

  const handleDeleteAsset = (assetId: string) => {
    const target = assets.find((a) => a.id === assetId);
    setAssets(assets.filter((a) => a.id !== assetId));
    if (target) {
      logAuditAction(
        'DELETE',
        'Office Staff & Payroll',
        assetId,
        `Deleted office asset ${target.assetName}`
      );
    }
  };

  const handleSaveBill = (billItem: OfficeBill) => {
    const isEdit = !!editingBill;
    if (isEdit) {
      setBills(bills.map((b) => (b.id === billItem.id ? billItem : b)));
    } else {
      setBills([...bills, billItem]);
    }
    setEditingBill(null);
    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Office Staff & Payroll',
      billItem.id,
      `${isEdit ? 'Updated' : 'Recorded'} office bill ${billItem.billType} (${billItem.billingMonth}) - ৳${billItem.amount}`
    );
  };

  const handleDeleteBill = (billId: string) => {
    const target = bills.find((b) => b.id === billId);
    setBills(bills.filter((b) => b.id !== billId));
    if (target) {
      logAuditAction(
        'DELETE',
        'Office Staff & Payroll',
        billId,
        `Deleted office bill ${target.billType} (${target.billingMonth})`
      );
    }
  };

  const handleSaveSalaryPayment = (pay: SalaryPaymentData) => {
    setStaff((prevStaff) =>
      prevStaff.map((s) => {
        if (s.id === pay.staffId) {
          if (pay.paymentType === 'Salary Advance') {
            return {
              ...s,
              totalAdvancePaid: (s.totalAdvancePaid || 0) + pay.amount,
            };
          } else {
            return {
              ...s,
              totalSalaryPaid: (s.totalSalaryPaid || 0) + pay.amount,
            };
          }
        }
        return s;
      })
    );

    const nextExpId = generateNextId('EXP', expenses.map((e) => e.id));
    const newExp: ExpenseItem = {
      id: nextExpId,
      date: pay.paymentDate,
      expenseCategory:
        pay.paymentType === 'Mobile Bill Allowance'
          ? 'Mobile Bill Allowance'
          : 'Staff Salaries & Advances',
      expenseType: 'OFFICE_OVERHEAD',
      description: `${pay.paymentType} for ${pay.staffName} (${pay.month})`,
      projectId: 'OFFICE_GENERAL',
      projectName: 'Studio Office Payroll',
      supplierPayee: pay.staffName,
      paymentMethod: pay.paymentMethod,
      billInvoiceNumber: pay.referenceNo || `SAL-${Date.now().toString().slice(-4)}`,
      amount: pay.amount,
      paymentStatus: 'Paid',
      approvedBy: currentUser.name,
      notes: pay.notes || `Disbursed for ${pay.month}`,
      staffId: pay.staffId,
      salaryMonth: pay.month,
      salaryPaymentType: pay.paymentType,
    };
    setExpenses((prev) => [newExp, ...prev]);

    logAuditAction(
      'CREATE',
      'Office Staff & Payroll',
      nextExpId,
      `Disbursed ${pay.paymentType} of ৳${pay.amount} to ${pay.staffName} (${pay.month})`
    );
  };

  const handleSaveBulkSalaryPayments = (paymentsList: SalaryPaymentData[]) => {
    if (paymentsList.length === 0) return;

    setStaff((prevStaff) =>
      prevStaff.map((s) => {
        const matchingPays = paymentsList.filter((p) => p.staffId === s.id);
        if (matchingPays.length === 0) return s;
        let advAdd = 0;
        let salAdd = 0;
        for (const p of matchingPays) {
          if (p.paymentType === 'Salary Advance') advAdd += p.amount;
          else salAdd += p.amount;
        }
        return {
          ...s,
          totalAdvancePaid: (s.totalAdvancePaid || 0) + advAdd,
          totalSalaryPaid: (s.totalSalaryPaid || 0) + salAdd,
        };
      })
    );

    let currentExpIds = expenses.map((e) => e.id);
    const newExpenseItems: ExpenseItem[] = [];
    for (const pay of paymentsList) {
      const nextExpId = generateNextId('EXP', currentExpIds);
      currentExpIds = [nextExpId, ...currentExpIds];
      newExpenseItems.push({
        id: nextExpId,
        date: pay.paymentDate,
        expenseCategory:
          pay.paymentType === 'Mobile Bill Allowance'
            ? 'Mobile Bill Allowance'
            : 'Staff Salaries & Advances',
        expenseType: 'OFFICE_OVERHEAD',
        description: `${pay.paymentType} for ${pay.staffName} (${pay.month})`,
        projectId: 'OFFICE_GENERAL',
        projectName: 'Studio Office Payroll',
        supplierPayee: pay.staffName,
        paymentMethod: pay.paymentMethod,
        billInvoiceNumber: pay.referenceNo || `SAL-${Date.now().toString().slice(-4)}`,
        amount: pay.amount,
        paymentStatus: 'Paid',
        approvedBy: currentUser.name,
        notes: pay.notes || `Bulk salary disbursed for ${pay.month}`,
        staffId: pay.staffId,
        salaryMonth: pay.month,
        salaryPaymentType: pay.paymentType,
      });
    }
    setExpenses((prev) => [...newExpenseItems, ...prev]);

    const totalBulkAmt = paymentsList.reduce((s, p) => s + p.amount, 0);
    logAuditAction(
      'CREATE',
      'Office Staff & Payroll',
      newExpenseItems[0]?.id || 'SAL-BULK',
      `Bulk disbursed salaries for ${paymentsList.length} staff members (${paymentsList[0]?.month}) - Total: ৳${totalBulkAmt}`
    );
  };

  // Delete / Archive Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type:
      | 'client'
      | 'project'
      | 'material'
      | 'worker'
      | 'task'
      | 'transaction'
      | 'supplier'
      | 'purchaseOrder'
      | 'payment'
      | 'expense';
    id: string;
    name: string;
  } | null>(null);

  // Handlers for Save
  const handleSaveClient = (client: Client) => {
    const isEdit = !!editingClient;
    if (isEdit) {
      setClients(clients.map((c) => (c.id === client.id ? client : c)));
    } else {
      setClients([client, ...clients]);

      // Auto-create linked Project if client has a projectName and no matching project exists yet
      if (client.projectName && client.projectName.trim()) {
        const existsProj = projects.some(
          (p) => p.clientId === client.id || p.projectName === client.projectName
        );
        const newProjId = generateNextId('PRJ', projects.map((p) => p.id));
        if (!existsProj) {
          const contract = Number(client.totalContractAmount) || 0;
          const adv = Number(client.advancePayment) || 0;
          const newProj: Project = {
            id: newProjId,
            projectName: client.projectName.trim(),
            clientId: client.id,
            clientName: client.name,
            siteAddress: client.address || '',
            projectType: settings.projectTypes[0] || 'Residential Apartment',
            startDate: client.contractDate || new Date().toISOString().split('T')[0],
            expectedCompletionDate: '',
            projectManager: currentUser.name,
            contractValue: contract,
            vatRate: settings.taxVatRate || 0,
            discount: 0,
            netContractValue: contract,
            projectStatus: 'In Progress / Execution',
            progressPercentage: 5,
            estimatedMaterialCost: 0,
            estimatedLabourCost: 0,
            estimatedOtherCost: 0,
            estimatedProfit: contract,
            actualMaterialCost: 0,
            actualLabourCost: 0,
            subcontractorCost: 0,
            otherDirectCosts: 0,
            allocatedOverhead: 0,
            totalProjectCost: 0,
            amountReceived: adv,
            outstandingDue: Math.max(0, contract - adv),
            actualProfit: contract,
            profitMargin: contract > 0 ? 100 : 0,
            remarks: client.notes || '',
          };
          setProjects((prev) => [newProj, ...prev]);
        }

        // Auto-record Advance Payment in Payments Received if advancePayment > 0
        if (client.advancePayment > 0) {
          const nextPayId = generateNextId('PAY', payments.map((p) => p.id));
          const targetProj = projects.find((p) => p.clientId === client.id);
          const autoPay: PaymentReceived = {
            id: nextPayId,
            date: client.contractDate || new Date().toISOString().split('T')[0],
            clientId: client.id,
            clientName: client.name,
            projectId: targetProj ? targetProj.id : newProjId,
            projectName: client.projectName.trim(),
            installmentName: 'Booking / Advance Payment',
            paymentMethod: settings.paymentMethods[0] || 'Cash in Hand (হাতে নগদ)',
            paymentReference: `ADV-${client.id}`,
            amountReceived: client.advancePayment,
            receivedBy: currentUser.name,
            notes: `Auto-synced advance payment from client registration (${client.name})`,
          };
          setPayments((prev) => [autoPay, ...prev]);
        }
      }
    }
    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Clients',
      client.id,
      `${isEdit ? 'Updated' : 'Created'} client ${client.name} (Contract: ৳${client.totalContractAmount})`
    );
  };

  const handleSaveProject = (project: Project) => {
    const isEdit = !!editingProject;
    if (isEdit) {
      setProjects(projects.map((p) => (p.id === project.id ? project : p)));
    } else {
      setProjects([project, ...projects]);

      // If no client exists with project.clientId yet and clientName is provided, auto-create the Client record
      if (project.clientName && !clients.some((c) => c.id === project.clientId)) {
        const nextCliId = generateNextId('CLI', clients.map((c) => c.id));
        const newClient: Client = {
          id: project.clientId || nextCliId,
          name: project.clientName,
          phone: '',
          email: '',
          address: project.siteAddress || '',
          clientType: 'Residential',
          projectName: project.projectName,
          contractDate: project.startDate || new Date().toISOString().split('T')[0],
          totalContractAmount: project.contractValue,
          advancePayment: project.amountReceived || 0,
          totalReceived: project.amountReceived || 0,
          totalDue: Math.max(0, project.contractValue - (project.amountReceived || 0)),
          clientStatus: 'Active',
          notes: project.remarks || '',
        };
        setClients((prev) => [newClient, ...prev]);
      }
    }
    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Projects & Tasks',
      project.id,
      `${isEdit ? 'Updated' : 'Created'} project ${project.projectName} (${project.projectStatus})`
    );
  };

  const handleSaveMaterial = (material: MaterialItem) => {
    const isEdit = !!editingMaterial;
    if (isEdit) {
      setMaterials(materials.map((m) => (m.id === material.id ? material : m)));
    } else {
      setMaterials([material, ...materials]);
    }
    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Materials & Inventory',
      material.id,
      `${isEdit ? 'Updated' : 'Added'} material ${material.materialName} (Stock: ${material.currentStock} ${material.unit})`
    );
  };

  const handleSaveTransaction = (txn: MaterialTransaction) => {
    const updatedTxns = [txn, ...transactions];
    setTransactions(updatedTxns);

    setMaterials(
      materials.map((m) => {
        if (m.id === txn.materialId) {
          let pQty = m.totalPurchasedQty;
          let uQty = m.totalUsedQty;
          let rQty = m.totalReturnedQty;

          if (txn.type === 'PURCHASE') pQty += txn.quantity;
          else if (txn.type === 'SITE_ISSUE') uQty += txn.quantity;
          else if (txn.type === 'SITE_RETURN') rQty += txn.quantity;

          const currentStock = pQty - uQty + rQty;
          let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (currentStock <= 0) status = 'Out of Stock';
          else if (currentStock <= m.reorderLevel) status = 'Low Stock';

          return {
            ...m,
            totalPurchasedQty: pQty,
            totalUsedQty: uQty,
            totalReturnedQty: rQty,
            currentStock,
            totalStockValue: currentStock * m.unitPurchasePrice,
            stockStatus: status,
          };
        }
        return m;
      })
    );

    if (txn.projectId && txn.projectId !== 'WAREHOUSE') {
      setProjects(refreshProjectTotals(projects, updatedTxns, attendance, payments, expenses));
    }

    logAuditAction(
      'CREATE',
      'Materials & Inventory',
      txn.id,
      `Logged ${txn.type} for ${txn.materialName} (${txn.quantity} units - ৳${txn.totalCost})`
    );
  };

  const handleSavePayment = (payment: PaymentReceived) => {
    const exists = payments.some((p) => p.id === payment.id);
    const updatedPayments = exists
      ? payments.map((p) => (p.id === payment.id ? payment : p))
      : [payment, ...payments];
    setPayments(updatedPayments);

    setClients(
      clients.map((c) => {
        const clientPaymentsSum = updatedPayments
          .filter((p) => p.clientId === c.id)
          .reduce((sum, p) => sum + p.amountReceived, 0);
        return {
          ...c,
          totalReceived: clientPaymentsSum,
          totalDue: Math.max(0, c.totalContractAmount - clientPaymentsSum),
        };
      })
    );

    setProjects(refreshProjectTotals(projects, transactions, attendance, updatedPayments, expenses));

    logAuditAction(
      exists ? 'UPDATE' : 'CREATE',
      'Payments & Receipts',
      payment.id,
      `${exists ? 'Updated' : 'Received'} payment ৳${payment.amountReceived} from ${payment.clientName} for ${payment.projectName}`
    );
    setEditingPayment(null);
  };

  const handleSaveExpense = (expense: ExpenseItem) => {
    const exists = expenses.some((e) => e.id === expense.id);
    const updatedExpenses = exists
      ? expenses.map((e) => (e.id === expense.id ? expense : e))
      : [expense, ...expenses];
    setExpenses(updatedExpenses);

    if (
      !exists &&
      (expense.paymentMethod.toLowerCase().includes('petty') ||
        expense.paymentMethod.includes('পেটি ক্যাশ'))
    ) {
      setPettyCashFund((prev) => ({
        ...prev,
        currentBalance: Math.max(0, prev.currentBalance - expense.amount),
      }));
    }

    setProjects(refreshProjectTotals(projects, transactions, attendance, payments, updatedExpenses));

    logAuditAction(
      exists ? 'UPDATE' : 'CREATE',
      'Daily Costs & Expenses',
      expense.id,
      `${exists ? 'Updated' : 'Recorded'} expense ৳${expense.amount} (${expense.expenseCategory}) - ${expense.description}`
    );
    setEditingExpense(null);
  };

  const handleSaveWorker = (worker: Worker, newlyPaidAmount?: number) => {
    const isEdit = !!editingWorker;
    const updatedWorkersBase = isEdit
      ? workers.map((w) => (w.id === worker.id ? worker : w))
      : [worker, ...workers];

    let updatedAttendance = [...attendance];
    const paidAmt = Number(newlyPaidAmount || 0);

    // If a payment was made OR a new Contract / Board Rate worker was registered with a bill (even with 0 initial payment), create a synced Attendance/Wage Ledger entry
    if (paidAmt > 0 || (!isEdit && worker.totalEarned > 0)) {
      const targetProj =
        projects.find(
          (p) => p.projectName === worker.assignedProject || p.id === worker.assignedProject
        ) || projects[0];
      const targetProjId = targetProj?.id || 'PRJ-001';
      const nextAttId = generateNextId('ATT', attendance.map((a) => a.id));
      const isBoard = worker.paymentType === 'Board Rate';

      const prevBoardLogs = attendance.filter(
        (a) =>
          a.workerId === worker.id &&
          a.projectId === targetProjId &&
          a.paymentMode === 'Board Rate'
      );
      const boardCountForLog = isBoard
        ? !isEdit
          ? Number(worker.totalBoards || 0)
          : 0
        : undefined;
      const boardRateForLog = isBoard
        ? worker.boardRate || worker.dailyRate || prevBoardLogs[0]?.boardRate || 0
        : undefined;

      const earnedForLog = isBoard
        ? Math.round((boardCountForLog || 0) * (boardRateForLog || 0))
        : !isEdit && worker.totalEarned > 0
        ? worker.totalEarned
        : paidAmt;

      const autoLog: LabourAttendance = {
        id: nextAttId,
        attendanceDate: new Date().toISOString().split('T')[0],
        workerId: worker.id,
        workerName: worker.name,
        skillTrade: worker.skillTrade,
        projectId: targetProjId,
        projectName: targetProj?.projectName || worker.assignedProject || 'General Project',
        status: 'Present',
        paymentMode: worker.paymentType,
        boardRate: boardRateForLog,
        boardCount: boardCountForLog,
        overtimeHours: 0,
        overtimeRate: 0,
        baseRate:
          worker.paymentType === 'Daily Wage'
            ? worker.dailyRate
            : isBoard
            ? boardRateForLog || 0
            : earnedForLog,
        labourCost: earnedForLog,
        amountPaid: paidAmt,
        outstandingSalary: Math.max(0, earnedForLog - paidAmt),
        notes: isBoard
          ? `বোর্ড: ${boardCountForLog || 0} টি × ৳${boardRateForLog || 0} = ৳${earnedForLog} | পেমেন্ট: ৳${paidAmt}`
          : `${worker.paymentType} (মোট বিল: ৳${earnedForLog} | পেমেন্ট: ৳${paidAmt} | বকেয়া: ৳${Math.max(0, earnedForLog - paidAmt)})`,
      };
      updatedAttendance = normalizeBoardAttendanceLogs([autoLog, ...attendance]);
      setAttendance(updatedAttendance);
    } else if (isEdit && worker.paymentType === 'Board Rate') {
      updatedAttendance = normalizeBoardAttendanceLogs(updatedAttendance);
      setAttendance(updatedAttendance);
    }

    const syncedWorkers = syncWorkersWithAttendance(updatedWorkersBase, updatedAttendance);
    setWorkers(syncedWorkers);
    setProjects(refreshProjectTotals(projects, transactions, updatedAttendance, payments, expenses));

    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Labour & Attendance',
      worker.id,
      `${isEdit ? 'Updated' : 'Registered'} worker ${worker.name} (${worker.paymentType}) - Earned: ৳${worker.totalEarned}, Paid: ৳${worker.totalPaid}`
    );
  };

  const handleSaveAttendance = (record: LabourAttendance) => {
    const exists = attendance.some((a) => a.id === record.id);
    const rawUpdated = exists
      ? attendance.map((a) => (a.id === record.id ? record : a))
      : [record, ...attendance];

    const updatedAttendance = normalizeBoardAttendanceLogs(rawUpdated);

    setAttendance(updatedAttendance);
    setEditingAttendance(null);
    setPreselectedAttendanceWorkerId(null);

    // Sync worker totals and project labour costs automatically
    const syncedWorkers = syncWorkersWithAttendance(workers, updatedAttendance);
    setWorkers(syncedWorkers);

    if (record.projectId) {
      setProjects(refreshProjectTotals(projects, transactions, updatedAttendance, payments, expenses));
    }

    logAuditAction(
      exists ? 'UPDATE' : 'CREATE',
      'Labour & Attendance',
      record.id,
      `${exists ? 'Updated' : 'Logged'} wage/attendance for ${record.workerName} on ${record.attendanceDate} (Earned: ৳${record.labourCost}, Paid: ৳${record.amountPaid})`
    );
  };

  const handleDeleteAttendance = (attId: string) => {
    const target = attendance.find((a) => a.id === attId);
    const rawUpdated = attendance.filter((a) => a.id !== attId);
    const updatedAttendance = normalizeBoardAttendanceLogs(rawUpdated);
    setAttendance(updatedAttendance);

    const syncedWorkers = syncWorkersWithAttendance(workers, updatedAttendance);
    setWorkers(syncedWorkers);
    setProjects(refreshProjectTotals(projects, transactions, updatedAttendance, payments, expenses));

    if (target) {
      logAuditAction(
        'DELETE',
        'Labour & Attendance',
        target.id,
        `Deleted attendance/payment log for ${target.workerName} (${target.attendanceDate} - Paid: ৳${target.amountPaid})`
      );
    }
  };

  const handleSaveTask = (task: TaskItem) => {
    const isEdit = !!editingTask;
    if (isEdit) {
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    } else {
      setTasks([task, ...tasks]);
    }
    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Projects & Tasks',
      task.id,
      `${isEdit ? 'Updated' : 'Created'} task "${task.taskName}" for ${task.projectName}`
    );
  };

  const handleToggleTaskComplete = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'Completed';
          return {
            ...t,
            status: isDone ? 'In Progress' : 'Completed',
            completionPercentage: isDone ? 50 : 100,
          };
        }
        return t;
      })
    );
    if (target) {
      logAuditAction(
        'UPDATE',
        'Projects & Tasks',
        taskId,
        `Toggled task status for "${target.taskName}"`
      );
    }
  };

  // Archive / Delete Handler
  const handleArchiveTarget = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'client') {
      setClients(
        clients.map((c) =>
          c.id === deleteTarget.id ? { ...c, clientStatus: 'Archived', isArchived: true } : c
        )
      );
    } else if (deleteTarget.type === 'project') {
      setProjects(
        projects.map((p) =>
          p.id === deleteTarget.id ? { ...p, projectStatus: 'On Hold', isArchived: true } : p
        )
      );
    } else if (deleteTarget.type === 'worker') {
      setWorkers(
        workers.map((w) => (w.id === deleteTarget.id ? { ...w, status: 'Inactive' } : w))
      );
    }
    logAuditAction(
      'ARCHIVE',
      deleteTarget.type.toUpperCase(),
      deleteTarget.id,
      `Archived ${deleteTarget.type}: ${deleteTarget.name}`
    );
    setDeleteTarget(null);
  };

  const handlePermanentDeleteTarget = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'client') {
      setClients(clients.filter((c) => c.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'project') {
      setProjects(projects.filter((p) => p.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'material') {
      setMaterials(materials.filter((m) => m.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'worker') {
      setWorkers(workers.filter((w) => w.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'task') {
      setTasks(tasks.filter((t) => t.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'supplier') {
      setSuppliers(suppliers.filter((s) => s.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'purchaseOrder') {
      setPurchases(purchases.filter((po) => po.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'payment') {
      const updated = payments.filter((p) => p.id !== deleteTarget.id);
      setPayments(updated);
      setProjects(refreshProjectTotals(projects, transactions, attendance, updated, expenses));
    } else if (deleteTarget.type === 'expense') {
      const updated = expenses.filter((e) => e.id !== deleteTarget.id);
      setExpenses(updated);
      setProjects(refreshProjectTotals(projects, transactions, attendance, payments, updated));
    } else if (deleteTarget.type === 'transaction') {
      const updated = transactions.filter((t) => t.id !== deleteTarget.id);
      setTransactions(updated);
      setProjects(refreshProjectTotals(projects, updated, attendance, payments, expenses));
    }
    logAuditAction(
      'DELETE',
      deleteTarget.type.toUpperCase(),
      deleteTarget.id,
      `Permanently deleted ${deleteTarget.type}: ${deleteTarget.name}`
    );
    setDeleteTarget(null);
  };

  // Supplier & PO Handlers
  const handleSaveSupplier = (supplier: Supplier) => {
    const isEdit = suppliers.some((s) => s.id === supplier.id);
    if (isEdit) {
      setSuppliers(suppliers.map((s) => (s.id === supplier.id ? supplier : s)));
    } else {
      setSuppliers([supplier, ...suppliers]);
    }
    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Materials & Inventory',
      supplier.id,
      `${isEdit ? 'Updated' : 'Added'} supplier ${supplier.name}`
    );
  };

  const handleSavePurchaseOrder = (po: PurchaseOrder) => {
    const isEdit = purchases.some((p) => p.id === po.id);
    if (isEdit) {
      setPurchases(purchases.map((p) => (p.id === po.id ? po : p)));
    } else {
      setPurchases([po, ...purchases]);
    }
    logAuditAction(
      isEdit ? 'UPDATE' : 'CREATE',
      'Materials & Inventory',
      po.id,
      `${isEdit ? 'Updated' : 'Created'} purchase order ${po.id} for ${po.supplierName} (৳${po.totalBill})`
    );
  };

  const [permissionAlert, setPermissionAlert] = useState<string | null>(null);

  const guardAction = (module: ModuleKey, action: ActionType, callback: () => void) => {
    if (!isLoggedInUser) {
      setPermissionAlert(
        language === 'EN'
          ? 'Client View Mode is read-only. Please log in with your PIN/Password to perform actions.'
          : 'আপনি বর্তমানে ক্লায়েন্ট ভিউ মোডে আছেন (শুধুমাত্র দেখার জন্য)। নতুন এন্ট্রি বা পরিবর্তন করতে আপনার লগইন পাসওয়ার্ড/পিন (যেমন: 1234) দিয়ে লগইন করুন।'
      );
      setIsUserSwitchModalOpen(true);
      setTimeout(() => setPermissionAlert(null), 6000);
      return;
    }

    if (!hasModulePermission(currentUser, module, action)) {
      const actionLabel =
        action === 'add'
          ? language === 'EN'
            ? 'Add / Create'
            : 'নতুন তথ্য যোগ (Add)'
          : action === 'edit'
          ? language === 'EN'
            ? 'Edit / Modify'
            : 'তথ্য সম্পাদনা (Edit)'
          : action === 'delete'
          ? language === 'EN'
            ? 'Delete'
            : 'মুছে ফেলা (Delete)'
          : action === 'disburseSalary'
          ? language === 'EN'
            ? 'Disburse Salary'
            : 'বেতন প্রদান'
          : action;

      setPermissionAlert(
        language === 'EN'
          ? `Permission Denied: Your account (${currentUser.name} - ${currentUser.role}) is not permitted to [${actionLabel}] in this module.`
          : `পারমিশন নেই: আপনার অ্যাকাউন্ট (${currentUser.name} - ${currentUser.role}) এ এই সেকশনে [${actionLabel}] করার অনুমতি দেওয়া হয়নি।`
      );
      setTimeout(() => setPermissionAlert(null), 5000);
      return;
    }
    callback();
  };

  // User Management Handlers
  const handleAddUser = () => {
    guardAction('users', 'add', () => {
      setEditingUser(null);
      setIsUserModalOpen(true);
    });
  };

  const handleEditUser = (user: AppUser) => {
    guardAction('users', 'edit', () => {
      setEditingUser(user);
      setIsUserModalOpen(true);
    });
  };

  const handleSaveUser = (user: AppUser) => {
    const exists = users.some((u) => u.id === user.id);
    setUsers((prev) => {
      if (exists) {
        return prev.map((u) => (u.id === user.id ? user : u));
      }
      return [...prev, user];
    });

    logAuditAction(
      exists ? 'UPDATE' : 'CREATE',
      'Team & Access Control',
      user.id,
      `${exists ? 'Updated' : 'Added'} team member ${user.name} (${user.role})`
    );
  };

  const handleDeleteUser = (userId: string) => {
    guardAction('users', 'delete', () => {
      if (userId === currentUserId) {
        setPermissionAlert(
          language === 'EN'
            ? 'Cannot delete the active logged-in user!'
            : 'বর্তমান লগইনকৃত ইউজার ডিলিট করা যাবে না!'
        );
        setTimeout(() => setPermissionAlert(null), 4000);
        return;
      }
      const target = users.find((u) => u.id === userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (target) {
        logAuditAction(
          'DELETE',
          'Team & Access Control',
          userId,
          `Removed team member ${target.name}`
        );
      }
    });
  };

  const checkTabPermittedForUser = (user: AppUser | undefined, tab: TabType): boolean => {
    if (!user) return tab !== 'ownerstudio' && tab !== 'githubdeploy';
    if (tab === 'ownerstudio' || tab === 'githubdeploy') {
      return user.role === 'Owner';
    }
    if (user.role === 'Owner') return true;
    switch (tab) {
      case 'dashboard':
        return hasModulePermission(user, 'dashboard', 'view');
      case 'clients':
        return hasModulePermission(user, 'clients', 'view');
      case 'projects':
      case 'tasks':
        return hasModulePermission(user, 'projects', 'view');
      case 'payments':
        return (
          hasModulePermission(user, 'clients', 'view') ||
          hasModulePermission(user, 'reports', 'view')
        );
      case 'dailycosts':
        return hasModulePermission(user, 'dailyCosts', 'view');
      case 'expenses':
        return hasModulePermission(user, 'expenses', 'view');
      case 'profitloss':
        return hasModulePermission(user, 'reports', 'view');
      case 'materials':
      case 'suppliers':
        return hasModulePermission(user, 'inventory', 'view');
      case 'labour':
        return hasModulePermission(user, 'labour', 'view');
      case 'office':
        return hasModulePermission(user, 'staff', 'view');
      case 'smartfilter':
      case 'reports':
        return hasModulePermission(user, 'reports', 'view');
      case 'printables':
        return (
          hasModulePermission(user, 'clients', 'view') ||
          hasModulePermission(user, 'reports', 'view')
        );
      case 'cloudsync':
      case 'googleguide':
        return hasModulePermission(user, 'cloudSync', 'view');
      case 'settings':
        return hasModulePermission(user, 'settings', 'view');
      case 'users':
        return hasModulePermission(user, 'users', 'view');
      case 'auditlogs':
        return (
          hasModulePermission(user, 'cloudSync', 'view') ||
          hasModulePermission(user, 'users', 'view')
        );
      default:
        return true;
    }
  };

  const isCurrentTabPermitted = (tab: TabType): boolean => {
    if (!isLoggedInUser) {
      // In Client View / Unauthenticated mode, allow standard categories so visitor can view category structure
      if (['ownerstudio', 'githubdeploy', 'settings', 'users', 'auditlogs', 'cloudsync', 'googleguide'].includes(tab)) {
        return false;
      }
      return true;
    }
    return checkTabPermittedForUser(currentUser, tab);
  };

  const handleLogoutToClientView = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('ic_is_logged_in');
    setIsClientViewMode(true);
    setIsSessionLocked(false);
    setActiveTab('dashboard');
    if (
      typeof window !== 'undefined' &&
      !window.location.href.includes('aistudio.google.com') &&
      !window.location.href.includes('applet-auth-bridge')
    ) {
      window.history.replaceState({}, '', '/?view=client');
    }
    logAuditAction(
      'UPDATE',
      'Authentication',
      currentUser.id,
      `User ${currentUser.name} logged out to protected Client View`
    );
  };

  const handleSwitchUser = (userId: string, pin: string): boolean => {
    const target = users.find((u) => u.id === userId);
    if (!target) return false;
    if (target.pin.trim() !== pin.trim()) return false;

    setCurrentUserId(userId);
    setIsLoggedIn(true);
    localStorage.setItem('ic_is_logged_in', 'true');
    setIsSessionLocked(false);
    setIsClientViewMode(false);
    setPermissionAlert(null);
    if (
      typeof window !== 'undefined' &&
      !window.location.href.includes('aistudio.google.com') &&
      !window.location.href.includes('applet-auth-bridge')
    ) {
      window.history.replaceState({}, '', '/');
    }

    // If current tab is not permitted for the newly logged-in user, navigate to their first permitted tab
    if (!checkTabPermittedForUser(target, activeTab)) {
      const candidateTabs: TabType[] = [
        'dashboard',
        'projects',
        'clients',
        'dailycosts',
        'expenses',
        'materials',
        'labour',
        'office',
        'reports',
      ];
      const firstAllowed = candidateTabs.find((t) => checkTabPermittedForUser(target, t));
      if (firstAllowed) {
        setActiveTab(firstAllowed);
      }
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, lastLoginAt: new Date().toISOString().replace('T', ' ').slice(0, 16) }
          : u
      )
    );

    setAuditLogs((prev) => [
      {
        id: generateNextId('AUD', prev.map((a) => a.id)),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'UPDATE',
        module: 'Authentication',
        recordId: userId,
        summary: `User logged in: ${target.name} (${target.role})`,
        user: target.name,
      },
      ...prev,
    ]);

    return true;
  };

  // Export to Excel trigger
  const handleExportExcel = () => {
    if (!isLoggedInUser) {
      setPermissionAlert(
        language === 'EN'
          ? 'File download is disabled in Client View. Please login with your PIN to download files.'
          : 'ক্লায়েন্ট ভিউতে ফাইল ডাউনলোড নিষিদ্ধ। এক্সেল ফাইল ডাউনলোড করতে দয়া করে আপনার পিন দিয়ে লগইন করুন।'
      );
      setIsUserSwitchModalOpen(true);
      return;
    }

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

  const fullPayload = {
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
    pettyCashFund,
    users,
  };

  const handleCreateSnapshot = (label: string, version: string) => {
    const newSnapshot: DataSnapshotBackup = {
      id: `SNAP-${Date.now()}`,
      label,
      createdAt: new Date().toLocaleString(),
      version,
      recordCounts: {
        projects: projects.length,
        clients: clients.length,
        payments: payments.length,
        expenses: expenses.length,
        workers: workers.length,
        attendance: attendance.length,
        materials: materials.length,
        staff: staff.length,
      },
      payloadJson: JSON.stringify(fullPayload),
    };
    setSnapshots((prev) => [newSnapshot, ...prev.slice(0, 14)]);
    logAuditAction(
      'CREATE',
      'Owner Studio Snapshot',
      newSnapshot.id,
      `Created zero-data-loss snapshot: ${label}`
    );
  };

  const handleRestoreSnapshot = (snapshot: DataSnapshotBackup) => {
    try {
      const parsed = JSON.parse(snapshot.payloadJson);
      handleRestoreFullDatabase(parsed);
    } catch (e) {
      console.error('Failed to restore snapshot:', e);
    }
  };

  const handlePublishRelease = (
    releaseInput: Omit<ReleaseNotification, 'id' | 'publishedAt' | 'dataPreservedCount'>
  ) => {
    const totalPreserved =
      projects.length +
      clients.length +
      payments.length +
      expenses.length +
      workers.length +
      attendance.length +
      materials.length +
      staff.length;

    const newRelease: ReleaseNotification = {
      ...releaseInput,
      id: `REL-${Date.now()}`,
      publishedAt: new Date().toLocaleString(),
      dataPreservedCount: totalPreserved,
    };

    setReleaseNotifications((prev) => [newRelease, ...prev]);
    setDismissedReleaseId(null);
    logAuditAction(
      'CREATE',
      'Public Release & Notification',
      newRelease.version,
      `Published update ${newRelease.version}: ${newRelease.title} (${newRelease.changes.length} changes, ${totalPreserved} records preserved)`
    );
  };

  const handleDeleteRelease = (id: string) => {
    setReleaseNotifications((prev) => prev.filter((r) => r.id !== id));
  };

  const latestVisibleRelease = releaseNotifications.find((rel) => {
    if (rel.id === dismissedReleaseId) return false;
    if (isClientViewMode) {
      return rel.audience === 'All' || rel.audience === 'ClientPortal';
    }
    return true;
  });

  // Key stats for sidebar badges and top navigation (zeroed in Client View)
  const runningProjectsCount = displayProjects.filter(
    (p) => p.projectStatus.includes('Progress') || p.projectStatus === 'Finishing'
  ).length;
  const totalReceivedSum = displayPayments.reduce((s, p) => s + p.amountReceived, 0);
  const totalDueSum = displayProjects.reduce((s, p) => s + p.outstandingDue, 0);
  const lowStockCount = displayMaterials.filter((m) => m.stockStatus !== 'In Stock').length;
  const pendingTasksCount = displayTasks.filter((t) => t.status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        settings={settings}
        runningProjectsCount={runningProjectsCount}
        totalReceived={totalReceivedSum}
        totalDue={totalDueSum}
        lowStockCount={lowStockCount}
        language={language}
        isDriveConnected={isDriveConnected}
        isClientViewMode={!isLoggedInUser}
        isLoggedIn={isLoggedInUser}
        currentUser={currentUser}
        releaseNotifications={releaseNotifications}
        onNavigateToOwnerStudio={() => setActiveTab('ownerstudio')}
        onNavigateToGitHubDeploy={() => setActiveTab('githubdeploy')}
        onOpenSwitchUser={() => setIsUserSwitchModalOpen(true)}
        onLogoutToClientView={handleLogoutToClientView}
        onToggleClientViewMode={() => {
          if (isLoggedInUser) {
            handleLogoutToClientView();
          } else {
            setIsUserSwitchModalOpen(true);
          }
        }}
        onSetClientViewMode={(isClient) => {
          if (isClient) {
            handleLogoutToClientView();
          } else {
            setIsUserSwitchModalOpen(true);
          }
        }}
        onToggleLanguage={() => setLanguage(language === 'EN' ? 'BN' : 'EN')}
        onExportExcel={handleExportExcel}
        onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
        onNavigateToPrintables={() => setActiveTab('printables')}
        onOpenCloudSyncModal={() => setIsCloudSyncModalOpen(true)}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          language={language}
          counts={{
            clients: displayClients.length,
            projects: displayProjects.length,
            lowStock: lowStockCount,
            pendingTasks: pendingTasksCount,
          }}
          currentUser={currentUser}
          isClientViewMode={!isLoggedInUser}
          isLoggedIn={isLoggedInUser}
          onOpenSwitchUser={() => setIsUserSwitchModalOpen(true)}
          onLogoutToClientView={handleLogoutToClientView}
          onLockSession={() => {
            setIsSessionLocked(true);
            setIsUserSwitchModalOpen(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[1600px] w-full">
          {/* Staging / Test Mode Banner (Owner Only) */}
          {isStagingMode && currentUser?.role === 'Owner' && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 text-xs">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-amber-300 text-sm">
                    🧪 টেস্ট / স্টেজিং মোড চালু আছে (Owner Staging &amp; Test Mode Active)
                  </div>
                  <p className="text-slate-300">
                    আপনি এখন নিরাপদে যেকোনো পরিবর্তন টেস্ট করতে পারেন। আগের কোনো ডাটা ডিলিট হবে না। টেস্ট শেষ হলে ওনার স্টুডিও থেকে পাবলিক রিলিজ করুন।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('ownerstudio')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer"
                >
                  পাবলিক রিলিজ সেক্টরে যান
                </button>
                <button
                  onClick={() => setIsStagingMode(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                >
                  টেস্ট মোড বন্ধ করুন
                </button>
              </div>
            </div>
          )}

          {/* Latest Public Update Notification Banner (Shown to Client Site & Users when Owner publishes an update) */}
          {latestVisibleRelease && (
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/40 text-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
                    <Bell className="w-3 h-3" />
                    <span>নতুন আপডেট নোটিফিকেশন ({latestVisibleRelease.version})</span>
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {latestVisibleRelease.title}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>আগের সকল ডাটা ({latestVisibleRelease.dataPreservedCount}টি এন্ট্রি) ১০০% সুরক্ষিত</span>
                  </span>
                </div>
                <p className="text-slate-300">{latestVisibleRelease.summary}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {latestVisibleRelease.changes.map((chg, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{chg}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setDismissedReleaseId(latestVisibleRelease.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer"
                >
                  ঠিক আছে (Dismiss)
                </button>
              </div>
            </div>
          )}

          {/* Client View Mode Banner (Data Protected) */}
          {!isLoggedInUser && (
            <div className="mb-5 p-5 rounded-3xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/40 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 text-xl shadow-inner">
                  🔒
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-sky-300 text-sm flex items-center gap-2">
                    <span>{language === 'EN' ? 'Client View Mode (Confidential Data Protected)' : 'ক্লায়েন্ট ভিউ মোড — ব্যবসায়িক গোপনীয়তা সুরক্ষিত'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                      {language === 'EN' ? 'Protected' : 'ডাটা গোপন'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed max-w-3xl">
                    {language === 'EN'
                      ? 'No expense amounts, money received, or private financial records are shown in Client View (everything is displayed empty). Only category layouts are visible. Log in with your authorized PIN to view full live records.'
                      : 'ব্যবসায়িক গোপনীয়তার স্বার্থে লগইন না করা পর্যন্ত কোনো খরচ, পেমেন্ট বা প্রজেক্টের আর্থিক ডাটা দেখা যাবে না (সবকিছু খালি দেখাবে)। শুধুমাত্র ক্যাটাগরিগুলো ব্রাউজ করা যাবে। অনুমোদিত পিন (যেমন ওনার: 1234) দিয়ে লগইন করে সম্পূর্ণ ডাটা দেখুন।'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsUserSwitchModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  🔐 {language === 'EN' ? 'Login with PIN' : 'পাসওয়ার্ড / পিন দিয়ে লগইন করুন'}
                </button>
              </div>
            </div>
          )}

          {/* Permission Denied Alert Banner */}
          {permissionAlert && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{permissionAlert}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsUserSwitchModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-white text-[11px] font-bold border border-rose-500/40 transition cursor-pointer"
                >
                  {language === 'EN' ? 'Switch User' : 'ইউজার পরিবর্তন'}
                </button>
                <button
                  onClick={() => setPermissionAlert(null)}
                  className="text-rose-300 hover:text-white text-xs px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {!isCurrentTabPermitted(activeTab) ? (
            <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {language === 'EN' ? 'Access Restricted' : 'প্রবেশাধিকার সীমিত'}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {language === 'EN'
                    ? `Your account (${currentUser.name} - ${currentUser.role}) does not have permission to access this section.`
                    : `আপনার অ্যাকাউন্ট (${currentUser.name} - ${currentUser.role}) এ এই সেকশনটি দেখার অনুমতি নেই। কোম্পানির ওনারের সাথে যোগাযোগ করুন।`}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsUserSwitchModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  {language === 'EN' ? 'User Login / Switch Account' : 'অন্য অ্যাকাউন্টে লগইন করুন'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  settings={settings}
                  clients={displayClients}
                  projects={displayProjects}
                  materials={displayMaterials}
                  transactions={displayTransactions}
                  workers={displayWorkers}
                  attendance={displayAttendance}
                  payments={displayPayments}
                  expenses={displayExpenses}
                  tasks={displayTasks}
                  language={language}
                  onNavigateTab={setActiveTab}
                  onOpenAppsScript={() => setIsAppsScriptModalOpen(true)}
                  onExportExcel={handleExportExcel}
                  onOpenNewProject={() =>
                    guardAction('projects', 'add', () => {
                      setEditingProject(null);
                      setIsProjectModalOpen(true);
                    })
                  }
                  onOpenNewPayment={() =>
                    guardAction('dailyCosts', 'add', () => setIsPaymentModalOpen(true))
                  }
                  onOpenNewExpense={() =>
                    guardAction('expenses', 'add', () => setIsExpenseModalOpen(true))
                  }
                />
              )}

              {activeTab === 'clients' && (
                <ClientsView
                  clients={displayClients}
                  settings={settings}
                  language={language}
                  onAddClient={() =>
                    guardAction('clients', 'add', () => {
                      setEditingClient(null);
                      setIsClientModalOpen(true);
                    })
                  }
                  onEditClient={(client) =>
                    guardAction('clients', 'edit', () => {
                      setEditingClient(client);
                      setIsClientModalOpen(true);
                    })
                  }
                  onDeleteClient={(client) =>
                    guardAction('clients', 'delete', () => {
                      setDeleteTarget({ type: 'client', id: client.id, name: client.name });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onReceivePaymentForClient={() =>
                    guardAction('dailyCosts', 'add', () => {
                      setIsPaymentModalOpen(true);
                    })
                  }
                  onPrintClientInvoice={() => {
                    setActiveTab('printables');
                  }}
                  onImportClients={(records) =>
                    guardAction('clients', 'add', () => {
                      setClients((prev) => [...records, ...prev]);
                      logAuditAction(
                        'CREATE',
                        'Clients',
                        records[0]?.id || 'CLI-IMP',
                        `Imported ${records.length} client(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsView
                  projects={displayProjects}
                  settings={settings}
                  language={language}
                  onAddProject={() =>
                    guardAction('projects', 'add', () => {
                      setEditingProject(null);
                      setIsProjectModalOpen(true);
                    })
                  }
                  onEditProject={(project) =>
                    guardAction('projects', 'edit', () => {
                      setEditingProject(project);
                      setIsProjectModalOpen(true);
                    })
                  }
                  onDeleteProject={(project) =>
                    guardAction('projects', 'delete', () => {
                      setDeleteTarget({
                        type: 'project',
                        id: project.id,
                        name: project.projectName,
                      });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onQuickUpdateProgress={(projId, progress) =>
                    guardAction('projects', 'edit', () => {
                      setProjects(
                        projects.map((p) =>
                          p.id === projId ? { ...p, progressPercentage: progress } : p
                        )
                      );
                    })
                  }
                  onImportProjects={(records) =>
                    guardAction('projects', 'add', () => {
                      setProjects((prev) => [...records, ...prev]);
                      logAuditAction(
                        'CREATE',
                        'Projects & Tasks',
                        records[0]?.id || 'PRJ-IMP',
                        `Imported ${records.length} project(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'materials' && (
                <MaterialsView
                  materials={displayMaterials}
                  transactions={displayTransactions}
                  settings={settings}
                  language={language}
                  onAddMaterial={() =>
                    guardAction('inventory', 'add', () => {
                      setEditingMaterial(null);
                      setIsMaterialModalOpen(true);
                    })
                  }
                  onOpenTransactionModal={() =>
                    guardAction('inventory', 'add', () => setIsTransactionModalOpen(true))
                  }
                  onEditMaterial={(mat) =>
                    guardAction('inventory', 'edit', () => {
                      setEditingMaterial(mat);
                      setIsMaterialModalOpen(true);
                    })
                  }
                  onDeleteMaterial={(mat) =>
                    guardAction('inventory', 'delete', () => {
                      setDeleteTarget({
                        type: 'material',
                        id: mat.id,
                        name: mat.materialName,
                      });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onDeleteTransaction={(tx) =>
                    guardAction('inventory', 'delete', () => {
                      setDeleteTarget({
                        type: 'transaction',
                        id: tx.id,
                        name: `${tx.id} (${tx.materialName})`,
                      });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onImportMaterials={(records) =>
                    guardAction('inventory', 'add', () => {
                      setMaterials((prev) => [...records, ...prev]);
                      logAuditAction(
                        'CREATE',
                        'Materials & Inventory',
                        records[0]?.id || 'MAT-IMP',
                        `Imported ${records.length} material item(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'suppliers' && (
                <SuppliersView
                  suppliers={displaySuppliers}
                  purchases={displayPurchases}
                  settings={settings}
                  language={language}
                  onAddSupplier={() =>
                    guardAction('inventory', 'add', () => {
                      setEditingSupplier(null);
                      setIsSupplierModalOpen(true);
                    })
                  }
                  onEditSupplier={(sup) =>
                    guardAction('inventory', 'edit', () => {
                      setEditingSupplier(sup);
                      setIsSupplierModalOpen(true);
                    })
                  }
                  onDeleteSupplier={(sup) =>
                    guardAction('inventory', 'delete', () => {
                      setDeleteTarget({
                        type: 'supplier',
                        id: sup.id,
                        name: sup.name,
                      });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onAddPurchaseOrder={() =>
                    guardAction('inventory', 'add', () => {
                      setEditingPurchaseOrder(null);
                      setIsPurchaseOrderModalOpen(true);
                    })
                  }
                  onEditPurchaseOrder={(po) =>
                    guardAction('inventory', 'edit', () => {
                      setEditingPurchaseOrder(po);
                      setIsPurchaseOrderModalOpen(true);
                    })
                  }
                  onDeletePurchaseOrder={(po) =>
                    guardAction('inventory', 'delete', () => {
                      setDeleteTarget({
                        type: 'purchaseOrder',
                        id: po.id,
                        name: `${po.id} (${po.supplierName})`,
                      });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onImportSuppliers={(records) =>
                    guardAction('inventory', 'add', () => {
                      setSuppliers((prev) => [...records, ...prev]);
                      logAuditAction(
                        'CREATE',
                        'Materials & Inventory',
                        records[0]?.id || 'SUP-IMP',
                        `Imported ${records.length} supplier(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'labour' && (
                <LabourView
                  workers={displayWorkers}
                  attendance={displayAttendance}
                  settings={settings}
                  language={language}
                  onAddWorker={() =>
                    guardAction('labour', 'add', () => {
                      setEditingWorker(null);
                      setIsWorkerModalOpen(true);
                    })
                  }
                  onLogAttendance={() =>
                    guardAction('labour', 'add', () => {
                      setEditingAttendance(null);
                      setPreselectedAttendanceWorkerId(null);
                      setIsAttendanceModalOpen(true);
                    })
                  }
                  onLogAttendanceForWorker={(w) =>
                    guardAction('labour', 'add', () => {
                      setEditingAttendance(null);
                      setPreselectedAttendanceWorkerId(w.id);
                      setIsAttendanceModalOpen(true);
                    })
                  }
                  onEditAttendance={(att) =>
                    guardAction('labour', 'edit', () => {
                      setEditingAttendance(att);
                      setPreselectedAttendanceWorkerId(null);
                      setIsAttendanceModalOpen(true);
                    })
                  }
                  onDeleteAttendance={(attId) =>
                    guardAction('labour', 'delete', () => handleDeleteAttendance(attId))
                  }
                  onEditWorker={(w) =>
                    guardAction('labour', 'edit', () => {
                      setEditingWorker(w);
                      setIsWorkerModalOpen(true);
                    })
                  }
                  onDeleteWorker={(w) =>
                    guardAction('labour', 'delete', () => {
                      setDeleteTarget({ type: 'worker', id: w.id, name: w.name });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onImportWorkers={(records) =>
                    guardAction('labour', 'add', () => {
                      setWorkers((prev) => [...records, ...prev]);
                      logAuditAction(
                        'CREATE',
                        'Labour & Attendance',
                        records[0]?.id || 'WRK-IMP',
                        `Imported ${records.length} worker(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'payments' && (
                <PaymentsView
                  payments={displayPayments}
                  settings={settings}
                  language={language}
                  onAddPayment={() =>
                    guardAction('dailyCosts', 'add', () => {
                      setEditingPayment(null);
                      setIsPaymentModalOpen(true);
                    })
                  }
                  onEditPayment={(p) =>
                    guardAction('dailyCosts', 'edit', () => {
                      setEditingPayment(p);
                      setIsPaymentModalOpen(true);
                    })
                  }
                  onDeletePayment={(p) =>
                    guardAction('dailyCosts', 'delete', () => {
                      setDeleteTarget({
                        type: 'payment',
                        id: p.id,
                        name: `${p.id} (${p.clientName})`,
                      });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onPrintReceipt={() => setActiveTab('printables')}
                  onImportPayments={(records) =>
                    guardAction('dailyCosts', 'add', () => {
                      const updated = [...records, ...payments];
                      setPayments(updated);
                      setProjects(
                        refreshProjectTotals(projects, transactions, attendance, updated, expenses)
                      );
                      logAuditAction(
                        'CREATE',
                        'Payments & Receipts',
                        records[0]?.id || 'PAY-IMP',
                        `Imported ${records.length} payment receipt(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'dailycosts' && (
                <DailyCostsView
                  expenses={displayExpenses}
                  projects={displayProjects}
                  settings={settings}
                  pettyCashFund={displayPettyCashFund}
                  language={language}
                  onAddDailyCost={() =>
                    guardAction('dailyCosts', 'add', () => {
                      setEditingExpense(null);
                      setIsDailyCostModalOpen(true);
                    })
                  }
                  onUpdatePettyCash={(newFund) =>
                    guardAction('dailyCosts', 'edit', () => {
                      setPettyCashFund(newFund);
                      logAuditAction(
                        'UPDATE',
                        'Daily Costs & Expenses',
                        'PETTY-CASH',
                        `Updated petty cash balance to ৳${newFund.currentBalance}`
                      );
                    })
                  }
                  onEditExpense={(exp) =>
                    guardAction('dailyCosts', 'edit', () => {
                      setEditingExpense(exp);
                      setIsDailyCostModalOpen(true);
                    })
                  }
                  onDeleteExpense={(exp) =>
                    guardAction('dailyCosts', 'delete', () => {
                      setDeleteTarget({
                        type: 'expense',
                        id: exp.id,
                        name: `${exp.id} (${exp.description})`,
                      });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onImportDailyCosts={(records) =>
                    guardAction('dailyCosts', 'add', () => {
                      const updated = [...records, ...expenses];
                      setExpenses(updated);
                      logAuditAction(
                        'CREATE',
                        'Daily Costs & Expenses',
                        records[0]?.id || 'DC-IMP',
                        `Imported ${records.length} daily cost record(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesView
                  expenses={displayExpenses}
                  settings={settings}
                  language={language}
                  onAddExpense={() =>
                    guardAction('expenses', 'add', () => {
                      setEditingExpense(null);
                      setIsExpenseModalOpen(true);
                    })
                  }
                  onEditExpense={(exp) =>
                    guardAction('expenses', 'edit', () => {
                      setEditingExpense(exp);
                      setIsExpenseModalOpen(true);
                    })
                  }
                  onDeleteExpense={(exp) =>
                    guardAction('expenses', 'delete', () => {
                      setDeleteTarget({
                        type: 'expense',
                        id: exp.id,
                        name: `${exp.id} (${exp.description})`,
                      });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onImportExpenses={(records) =>
                    guardAction('expenses', 'add', () => {
                      const updated = [...records, ...expenses];
                      setExpenses(updated);
                      setProjects(
                        refreshProjectTotals(projects, transactions, attendance, payments, updated)
                      );
                      logAuditAction(
                        'CREATE',
                        'Daily Costs & Expenses',
                        records[0]?.id || 'EXP-IMP',
                        `Imported ${records.length} expense record(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'profitloss' && (
                <ProfitLossView
                  projects={displayProjects}
                  settings={settings}
                  language={language}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksTimelineView
                  tasks={displayTasks}
                  settings={settings}
                  language={language}
                  onAddTask={() =>
                    guardAction('projects', 'add', () => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    })
                  }
                  onEditTask={(t) =>
                    guardAction('projects', 'edit', () => {
                      setEditingTask(t);
                      setIsTaskModalOpen(true);
                    })
                  }
                  onDeleteTask={(t) =>
                    guardAction('projects', 'delete', () => {
                      setDeleteTarget({ type: 'task', id: t.id, name: t.taskName });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onToggleTaskComplete={(taskId) =>
                    guardAction('projects', 'edit', () => handleToggleTaskComplete(taskId))
                  }
                  onImportTasks={(records) =>
                    guardAction('projects', 'add', () => {
                      setTasks((prev) => [...records, ...prev]);
                      logAuditAction(
                        'CREATE',
                        'Projects & Tasks',
                        records[0]?.id || 'TSK-IMP',
                        `Imported ${records.length} task(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'office' && (
                <OfficeManagementView
                  staff={displayStaff}
                  assets={displayAssets}
                  bills={displayBills}
                  expenses={displayExpenses}
                  settings={settings}
                  language={language}
                  onAddStaff={() =>
                    guardAction('staff', 'add', () => {
                      setEditingStaff(null);
                      setIsStaffModalOpen(true);
                    })
                  }
                  onEditStaff={(s) =>
                    guardAction('staff', 'edit', () => {
                      setEditingStaff(s);
                      setIsStaffModalOpen(true);
                    })
                  }
                  onDeleteStaff={(staffId) =>
                    guardAction('staff', 'delete', () => handleDeleteStaff(staffId))
                  }
                  onOpenSalaryPayment={(s, bulkMode) =>
                    guardAction('staff', 'disburseSalary', () => {
                      setSalaryTargetStaff(s || null);
                      setIsSalaryBulkMode(Boolean(bulkMode));
                      setIsSalaryPaymentModalOpen(true);
                    })
                  }
                  onAddAsset={() =>
                    guardAction('staff', 'add', () => {
                      setEditingAsset(null);
                      setIsAssetModalOpen(true);
                    })
                  }
                  onEditAsset={(a) =>
                    guardAction('staff', 'edit', () => {
                      setEditingAsset(a);
                      setIsAssetModalOpen(true);
                    })
                  }
                  onDeleteAsset={(assetId) =>
                    guardAction('staff', 'delete', () => handleDeleteAsset(assetId))
                  }
                  onAddBill={() =>
                    guardAction('staff', 'add', () => {
                      setEditingBill(null);
                      setIsBillModalOpen(true);
                    })
                  }
                  onEditBill={(b) =>
                    guardAction('staff', 'edit', () => {
                      setEditingBill(b);
                      setIsBillModalOpen(true);
                    })
                  }
                  onDeleteBill={(billId) =>
                    guardAction('staff', 'delete', () => handleDeleteBill(billId))
                  }
                  onToggleBillStatus={(billId) =>
                    guardAction('staff', 'edit', () => {
                      setBills(
                        bills.map((b) =>
                          b.id === billId
                            ? {
                                ...b,
                                status: b.status === 'Paid' ? 'Unpaid' : 'Paid',
                                paidDate:
                                  b.status === 'Paid'
                                    ? undefined
                                    : new Date().toISOString().split('T')[0],
                              }
                            : b
                        )
                      );
                      logAuditAction(
                        'UPDATE',
                        'Office Staff & Payroll',
                        billId,
                        `Toggled payment status for bill ${billId}`
                      );
                    })
                  }
                  onEditExpense={(exp) =>
                    guardAction('staff', 'edit', () => {
                      setEditingExpense(exp);
                      setIsExpenseModalOpen(true);
                    })
                  }
                  onDeleteExpense={(exp) =>
                    guardAction('staff', 'delete', () => {
                      setDeleteTarget({
                        type: 'expense',
                        id: exp.id,
                        name: `${exp.id} (${exp.description})`,
                      });
                      setIsDeleteModalOpen(true);
                    })
                  }
                  onImportStaff={(records) =>
                    guardAction('staff', 'add', () => {
                      setStaff((prev) => [...records, ...prev]);
                      logAuditAction(
                        'CREATE',
                        'Office Staff & Payroll',
                        records[0]?.id || 'STF-IMP',
                        `Imported ${records.length} staff member(s)`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'smartfilter' && (
                <SmartFilterReportView
                  workers={displayWorkers}
                  attendance={displayAttendance}
                  staff={displayStaff}
                  expenses={displayExpenses}
                  bills={displayBills}
                  projects={displayProjects}
                  settings={settings}
                  language={language}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  projects={displayProjects}
                  clients={displayClients}
                  suppliers={displaySuppliers}
                  materials={displayMaterials}
                  transactions={displayTransactions}
                  attendance={displayAttendance}
                  payments={displayPayments}
                  expenses={displayExpenses}
                  settings={settings}
                  language={language}
                  onExportExcel={() =>
                    guardAction('reports', 'export', () => handleExportExcel())
                  }
                />
              )}

              {activeTab === 'printables' && (
                <PrintablesView
                  clients={displayClients}
                  projects={displayProjects}
                  payments={displayPayments}
                  settings={settings}
                  language={language}
                />
              )}

              {activeTab === 'cloudsync' && (
                <CloudSyncView
                  settings={settings}
                  clients={clients}
                  projects={projects}
                  materials={materials}
                  transactions={transactions}
                  suppliers={suppliers}
                  purchases={purchases}
                  workers={workers}
                  attendance={attendance}
                  payments={payments}
                  expenses={expenses}
                  staff={staff}
                  assets={assets}
                  bills={bills}
                  tasks={tasks}
                  auditLogs={auditLogs}
                  language={language}
                  onRestoreFullDatabase={(data) =>
                    guardAction('cloudSync', 'restore', () => handleRestoreFullDatabase(data))
                  }
                  onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
                  onSetClientViewMode={(isClient) => {
                    setIsClientViewMode(isClient);
                    if (typeof window !== 'undefined') {
                      window.history.replaceState({}, '', isClient ? '/?view=client' : '/');
                    }
                  }}
                />
              )}

              {activeTab === 'googleguide' && (
                <GoogleSheetsGuideView
                  language={language}
                  onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
                  onExportExcel={handleExportExcel}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  language={language}
                  onSaveSettings={(newSettings) =>
                    guardAction('settings', 'edit', () => {
                      setSettings(newSettings);
                      logAuditAction(
                        'UPDATE',
                        'Company Settings',
                        'SETTINGS',
                        `Updated company settings (${newSettings.companyName})`
                      );
                    })
                  }
                />
              )}

              {activeTab === 'users' && (
                <UserManagementView
                  users={users}
                  currentUserId={currentUserId}
                  onAddUser={handleAddUser}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  onOpenSwitchModal={() => setIsUserSwitchModalOpen(true)}
                  language={language}
                />
              )}

              {activeTab === 'auditlogs' && (
                <AuditLogView
                  auditLogs={auditLogs}
                  users={users}
                  settings={settings}
                  fullPayload={fullPayload}
                  language={language}
                  onRestoreFullDatabase={(data) =>
                    guardAction('cloudSync', 'restore', () => handleRestoreFullDatabase(data))
                  }
                  onClearOldLogs={() =>
                    guardAction('users', 'delete', () => {
                      setAuditLogs((prev) => prev.slice(0, 10));
                    })
                  }
                  onNavigateToCloudSync={() => setActiveTab('cloudsync')}
                />
              )}

              {activeTab === 'ownerstudio' && currentUser?.role === 'Owner' && (
                <OwnerDeploymentStudioView
                  settings={settings}
                  onSaveSettings={(newSettings) => {
                    setSettings(newSettings);
                    logAuditAction(
                      'UPDATE',
                      'Owner Studio Settings',
                      'SETTINGS',
                      `Updated company settings via Owner Studio`
                    );
                  }}
                  language={language}
                  liveAppUrl={getLiveWorkUrl()}
                  clientViewUrl={getSharedClientUrl()}
                  recordCounts={{
                    projects: projects.length,
                    clients: clients.length,
                    payments: payments.length,
                    expenses: expenses.length,
                    workers: workers.length,
                    attendance: attendance.length,
                    materials: materials.length,
                    staff: staff.length,
                  }}
                  fullDatabaseJson={JSON.stringify(fullPayload, null, 2)}
                  isStagingMode={isStagingMode}
                  onToggleStagingMode={setIsStagingMode}
                  releaseNotifications={releaseNotifications}
                  onPublishRelease={handlePublishRelease}
                  onDeleteRelease={handleDeleteRelease}
                  snapshots={snapshots}
                  onCreateSnapshot={handleCreateSnapshot}
                  onRestoreSnapshot={handleRestoreSnapshot}
                  currentUserName={currentUser.name}
                />
              )}

              {activeTab === 'githubdeploy' && currentUser?.role === 'Owner' && (
                <GitHubVercelDeployView
                  settings={settings}
                  language={language}
                  liveAppUrl={getLiveWorkUrl()}
                  clientViewUrl={getSharedClientUrl()}
                  totalRecordsCount={
                    projects.length +
                    clients.length +
                    payments.length +
                    expenses.length +
                    workers.length +
                    attendance.length +
                    materials.length +
                    staff.length
                  }
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* CRUD Modals */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
        settings={settings}
        nextId={generateNextId('CLI', clients.map((c) => c.id))}
        language={language}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        editingProject={editingProject}
        clients={clients}
        settings={settings}
        nextId={generateNextId('PRJ', projects.map((p) => p.id))}
        language={language}
      />

      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSave={handleSaveMaterial}
        editingMaterial={editingMaterial}
        settings={settings}
        suppliers={suppliers}
        nextId={generateNextId('MAT', materials.map((m) => m.id))}
        language={language}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        materials={materials}
        projects={projects}
        nextId={generateNextId('MTX', transactions.map((t) => t.id))}
        language={language}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setEditingPayment(null);
        }}
        onSave={handleSavePayment}
        editingPayment={editingPayment}
        clients={clients}
        projects={projects}
        settings={settings}
        nextId={generateNextId('PAY', payments.map((p) => p.id))}
        language={language}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        projects={projects}
        settings={settings}
        nextId={generateNextId('EXP', expenses.map((e) => e.id))}
        language={language}
      />

      <DailyCostModal
        isOpen={isDailyCostModalOpen}
        onClose={() => {
          setIsDailyCostModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        projects={projects}
        settings={settings}
        nextId={generateNextId('EXP', expenses.map((e) => e.id))}
        language={language}
      />

      <WorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        onSave={handleSaveWorker}
        editingWorker={editingWorker}
        settings={settings}
        projects={projects}
        nextId={generateNextId('WRK', workers.map((w) => w.id))}
        language={language}
      />

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setEditingAttendance(null);
          setPreselectedAttendanceWorkerId(null);
        }}
        onSave={handleSaveAttendance}
        editingAttendance={editingAttendance}
        preselectedWorkerId={preselectedAttendanceWorkerId}
        attendance={attendance}
        workers={workers}
        projects={projects}
        nextId={generateNextId('ATT', attendance.map((a) => a.id))}
        language={language}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        projects={projects}
        settings={settings}
        nextId={generateNextId('TSK', tasks.map((t) => t.id))}
        language={language}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onArchive={handleArchiveTarget}
        onPermanentDelete={handlePermanentDeleteTarget}
        title={language === 'EN' ? 'Confirm Record Removal' : 'রেকর্ড মোছার নিশ্চিতকরণ'}
        itemName={deleteTarget?.name || 'this item'}
        language={language}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setEditingSupplier(null);
        }}
        onSave={handleSaveSupplier}
        editingSupplier={editingSupplier}
        settings={settings}
        nextId={generateNextId('SUP', suppliers.map((s) => s.id))}
        language={language}
      />

      <PurchaseOrderModal
        isOpen={isPurchaseOrderModalOpen}
        onClose={() => {
          setIsPurchaseOrderModalOpen(false);
          setEditingPurchaseOrder(null);
        }}
        onSave={handleSavePurchaseOrder}
        editingPO={editingPurchaseOrder}
        suppliers={suppliers}
        projects={projects}
        settings={settings}
        nextId={generateNextId('PO', purchases.map((p) => p.id))}
        language={language}
      />

      <GoogleAppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
        language={language}
      />

      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => {
          setIsCloudSyncModalOpen(false);
          setIsDriveConnected(!!getDriveSyncUrl());
        }}
        language={language}
        onNavigateToCloudSyncView={() => setActiveTab('cloudsync')}
        fullPayload={fullPayload}
        companyName={settings.companyName}
      />

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
        onSave={handleSaveStaff}
        editingStaff={editingStaff}
        settings={settings}
        nextId={generateNextId('STF', staff.map((s) => s.id))}
        language={language}
      />

      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        settings={settings}
        staff={staff}
        nextId={generateNextId('AST', assets.map((a) => a.id))}
        language={language}
      />

      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setEditingBill(null);
        }}
        onSave={handleSaveBill}
        editingBill={editingBill}
        settings={settings}
        nextId={generateNextId('BIL', bills.map((b) => b.id))}
        language={language}
      />

      <SalaryPaymentModal
        isOpen={isSalaryPaymentModalOpen}
        onClose={() => {
          setIsSalaryPaymentModalOpen(false);
          setSalaryTargetStaff(null);
          setIsSalaryBulkMode(false);
        }}
        onSave={handleSaveSalaryPayment}
        onSaveBulk={handleSaveBulkSalaryPayments}
        staffList={staff}
        expenses={expenses}
        selectedStaff={salaryTargetStaff}
        initialBulkMode={isSalaryBulkMode}
        settings={settings}
        language={language}
      />

      {/* User & Access Control Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        editingUser={editingUser}
        nextId={generateNextId('USR', users.map((u) => u.id))}
        language={language}
      />

      <UserSwitchModal
        isOpen={isUserSwitchModalOpen || isSessionLocked}
        onClose={() => {
          setIsUserSwitchModalOpen(false);
          setIsSessionLocked(false);
        }}
        users={users}
        currentUserId={currentUserId}
        onSwitchUser={handleSwitchUser}
        language={language}
        isLockedMode={isSessionLocked}
      />

      {/* Gemini AI Copilot Assistant */}
      <GeminiAiAssistant
        language={language}
        settings={settings}
        clients={clients}
        projects={projects}
        materials={materials}
        workers={workers}
        attendance={attendance}
        payments={payments}
        expenses={expenses}
        staff={staff}
        bills={bills}
        pettyCashFund={pettyCashFund}
        onAddExpense={(newExp) => setExpenses((prev) => [...prev, newExp])}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Offline Mode Indicator */}
      <OfflineIndicator language={language} />
    </div>
  );
}
