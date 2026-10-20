/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  UserCheck,
  TrendingUp,
  MapPin,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Project, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';

interface ProjectsViewProps {
  projects: Project[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onQuickUpdateProgress: (projectId: string, newProgress: number) => void;
  onImportProjects?: (records: Project[]) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  settings,
  language,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onQuickUpdateProgress,
  onImportProjects,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectManager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || p.projectStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN' ? 'Project Management & Execution Tracker' : 'প্রজেক্ট ব্যবস্থাপনা ও সাইট ট্র্যাকিং'}
            </h2>
            <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-mono">
              04_Projects
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Site address, milestones, progress %, automated material & labour costs from transaction logs'
              : 'সাইট লোকেশন, সময়সীমা, অগ্রগতি %, উপকরণ ও মিস্ত্রি খরচের স্বয়ংক্রিয় হিসাব'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onImportProjects && (
            <CategoryImportButton
              category="projects"
              language={language}
              existingIds={projects.map((p) => p.id)}
              onImportRecords={onImportProjects}
            />
          )}
          <button
            onClick={onAddProject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'EN' ? 'Create New Project' : 'নতুন প্রজেক্ট তৈরি করুন'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'EN' ? 'Search by project title, ID, client, engineer...' : 'প্রজেক্ট নাম, ক্লায়েন্ট বা ইঞ্জিনিয়ার দিয়ে খুঁজুন...'}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
          >
            <option value="ALL">All Statuses (সব স্ট্যাটাস)</option>
            {settings.projectStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-6 space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-xl text-slate-400">
            🔒
          </div>
          <h3 className="text-sm font-bold text-white">
            {language === 'EN' ? 'No Projects Visible' : 'কোনো প্রজেক্টের তথ্য প্রদর্শিত হচ্ছে না'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'EN'
              ? 'Site progress, budgets, and cost metrics are protected in Client View. Log in with your authorized PIN to view projects.'
              : 'ক্লায়েন্ট ভিউতে গোপনীয়তা রক্ষার জন্য প্রজেক্টের বাজেট ও খরচের হিসাব গোপন রয়েছে। বিস্তারিত দেখতে আপনার পিন দিয়ে লগইন করুন।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const isProfitable = project.actualProfit >= 0;
            return (
              <div
                key={project.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition space-y-4"
            >
              {/* Top Row: Title, ID & Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-slate-800 text-teal-400 font-bold px-2 py-0.5 rounded">
                      {project.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {project.projectType}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {project.projectName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                    <span className="font-semibold text-amber-400">Client:</span>
                    <span>{project.clientName}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                      project.projectStatus === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : project.projectStatus === 'Finishing'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {project.projectStatus}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Manager: <strong className="text-slate-300">{project.projectManager}</strong>
                  </div>
                </div>
              </div>

              {/* Site Address & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-850/60 p-2.5 rounded-xl border border-slate-750">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{project.siteAddress || 'No site address'}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {formatDate(project.startDate)} → <strong className="text-white">{formatDate(project.expectedCompletionDate)}</strong>
                  </span>
                </div>
              </div>

              {/* Execution Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">
                    {language === 'EN' ? 'Execution Progress' : 'সাইট কাজের অগ্রগতি'}
                  </span>
                  <span className="font-mono font-bold text-teal-400">
                    {project.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${project.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Financial Dashboard for this Project */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="p-2 bg-slate-850 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Contract Value</span>
                  <span className="font-mono font-bold text-slate-100 block">
                    {formatCurrency(project.contractValue, settings.currencySymbol)}
                  </span>
                </div>

                <div className="p-2 bg-slate-850 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Actual Total Cost</span>
                  <span className="font-mono font-bold text-slate-300 block">
                    {formatCurrency(project.totalProjectCost, settings.currencySymbol)}
                  </span>
                </div>

                <div className="p-2 bg-slate-850 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Amount Received</span>
                  <span className="font-mono font-bold text-emerald-400 block">
                    {formatCurrency(project.amountReceived, settings.currencySymbol)}
                  </span>
                </div>

                <div className="p-2 bg-slate-850 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Net Est. Profit</span>
                  <span
                    className={`font-mono font-bold block ${
                      isProfitable ? 'text-amber-300' : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(project.actualProfit, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Itemized Cost Breakdown Pills */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-750">
                  🪵 Material: <strong className="text-slate-200">{formatCurrency(project.actualMaterialCost, settings.currencySymbol)}</strong>
                </span>
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-750">
                  👷 Labour: <strong className="text-slate-200">{formatCurrency(project.actualLabourCost, settings.currencySymbol)}</strong>
                </span>
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-750">
                  📐 Subcontract: <strong className="text-slate-200">{formatCurrency(project.subcontractorCost, settings.currencySymbol)}</strong>
                </span>
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-750">
                  🏢 Overhead: <strong className="text-slate-200">{formatCurrency(project.allocatedOverhead, settings.currencySymbol)}</strong>
                </span>
                <span className="ml-auto font-semibold text-amber-300">
                  Margin: {project.profitMargin.toFixed(1)}%
                </span>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 truncate max-w-xs">
                  {project.remarks || 'No remarks added'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditProject(project)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{language === 'EN' ? 'Edit' : 'এডিট'}</span>
                  </button>
                  <button
                    onClick={() => onDeleteProject(project)}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
