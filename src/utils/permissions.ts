/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppUser, ModuleKey, ActionType } from '../types';
import { ROLE_PRESET_PERMISSIONS } from '../data/initialData';

/**
 * Checks whether a user has permission for a specific module and action (View / Add / Edit / Delete / etc.)
 * Falls back gracefully to legacy boolean flags if granular modules are not set in older localStorage records.
 */
export function hasModulePermission(
  user: AppUser | null | undefined,
  module: ModuleKey,
  action: ActionType = 'view'
): boolean {
  if (!user) return false;
  if (user.role === 'Owner') return true;

  const perms = user.permissions;
  if (!perms) return false;

  // Check granular module permissions first if present
  if (perms.modules && perms.modules[module]) {
    const modPerm = perms.modules[module] as any;
    if (typeof modPerm[action] === 'boolean') {
      return modPerm[action];
    }
    // If action is not explicitly defined on this module (e.g. 'add' on 'dashboard'), fall back to 'view'
    if (typeof modPerm.view === 'boolean') {
      return modPerm.view;
    }
  }

  // Fallback to legacy boolean flags
  switch (module) {
    case 'dashboard':
      return !!perms.viewDashboard;
    case 'projects':
      return action === 'delete' ? false : !!perms.manageProjects;
    case 'clients':
      return action === 'delete' ? false : !!perms.manageClients;
    case 'dailyCosts':
    case 'expenses':
      return action === 'delete' ? false : !!perms.manageDailyCosts;
    case 'inventory':
      return action === 'delete' ? false : !!perms.manageInventory;
    case 'labour':
      return action === 'delete' ? false : !!perms.manageLabour;
    case 'staff':
      return action === 'delete' ? false : !!perms.manageStaffAndPayroll;
    case 'reports':
      return !!perms.viewFinancialReports;
    case 'settings':
      return !!perms.manageCompanySettings;
    case 'cloudSync':
      return !!perms.manageCloudBackup;
    case 'users':
      return !!perms.manageUsers;
    default:
      return false;
  }
}

/**
 * Normalizes a UserPermissions object so both `modules` and top-level boolean flags are in sync.
 */
export function normalizePermissions(role: string, existingPerms?: any): any {
  const preset = ROLE_PRESET_PERMISSIONS[role] || ROLE_PRESET_PERMISSIONS['Manager'];
  const baseModules = JSON.parse(JSON.stringify(preset.modules));

  if (existingPerms && existingPerms.modules) {
    Object.keys(baseModules).forEach((k) => {
      if (existingPerms.modules[k]) {
        baseModules[k] = { ...baseModules[k], ...existingPerms.modules[k] };
      }
    });
  } else if (existingPerms) {
    // Sync from legacy flags if modules didn't exist
    if (typeof existingPerms.viewDashboard === 'boolean') baseModules.dashboard.view = existingPerms.viewDashboard;
    if (typeof existingPerms.manageProjects === 'boolean') {
      baseModules.projects.view = existingPerms.manageProjects;
      baseModules.projects.add = existingPerms.manageProjects;
      baseModules.projects.edit = existingPerms.manageProjects;
    }
    if (typeof existingPerms.manageClients === 'boolean') {
      baseModules.clients.view = existingPerms.manageClients;
      baseModules.clients.add = existingPerms.manageClients;
      baseModules.clients.edit = existingPerms.manageClients;
    }
    if (typeof existingPerms.manageDailyCosts === 'boolean') {
      baseModules.dailyCosts.view = existingPerms.manageDailyCosts;
      baseModules.dailyCosts.add = existingPerms.manageDailyCosts;
      baseModules.dailyCosts.edit = existingPerms.manageDailyCosts;
    }
    if (typeof existingPerms.manageInventory === 'boolean') {
      baseModules.inventory.view = existingPerms.manageInventory;
      baseModules.inventory.add = existingPerms.manageInventory;
      baseModules.inventory.edit = existingPerms.manageInventory;
    }
    if (typeof existingPerms.manageLabour === 'boolean') {
      baseModules.labour.view = existingPerms.manageLabour;
      baseModules.labour.add = existingPerms.manageLabour;
      baseModules.labour.edit = existingPerms.manageLabour;
    }
    if (typeof existingPerms.manageStaffAndPayroll === 'boolean') {
      baseModules.staff.view = existingPerms.manageStaffAndPayroll;
      baseModules.staff.add = existingPerms.manageStaffAndPayroll;
      baseModules.staff.edit = existingPerms.manageStaffAndPayroll;
      baseModules.staff.disburseSalary = existingPerms.manageStaffAndPayroll;
    }
    if (typeof existingPerms.viewFinancialReports === 'boolean') {
      baseModules.reports.view = existingPerms.viewFinancialReports;
      baseModules.reports.export = existingPerms.viewFinancialReports;
    }
    if (typeof existingPerms.manageCompanySettings === 'boolean') {
      baseModules.settings.view = existingPerms.manageCompanySettings;
      baseModules.settings.edit = existingPerms.manageCompanySettings;
    }
    if (typeof existingPerms.manageCloudBackup === 'boolean') {
      baseModules.cloudSync.view = existingPerms.manageCloudBackup;
      baseModules.cloudSync.sync = existingPerms.manageCloudBackup;
    }
    if (typeof existingPerms.manageUsers === 'boolean') {
      baseModules.users.view = existingPerms.manageUsers;
      baseModules.users.add = existingPerms.manageUsers;
      baseModules.users.edit = existingPerms.manageUsers;
    }
  }

  return {
    viewDashboard: !!baseModules.dashboard.view,
    manageProjects: !!baseModules.projects.view,
    manageClients: !!baseModules.clients.view,
    manageInventory: !!baseModules.inventory.view,
    manageDailyCosts: !!baseModules.dailyCosts.view,
    manageLabour: !!baseModules.labour.view,
    manageStaffAndPayroll: !!baseModules.staff.view,
    viewFinancialReports: !!baseModules.reports.view,
    manageCompanySettings: !!baseModules.settings.view,
    manageCloudBackup: !!baseModules.cloudSync.view,
    manageUsers: !!baseModules.users.view,
    modules: baseModules,
  };
}
