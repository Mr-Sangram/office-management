/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  UserCheck
} from 'lucide-react';
import { TaskItem, CompanySettings } from '../../types';
import { formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';

interface TasksTimelineViewProps {
  tasks: TaskItem[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onAddTask: () => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onImportTasks?: (records: TaskItem[]) => void;
}

export const TasksTimelineView: React.FC<TasksTimelineViewProps> = ({
  tasks,
  settings,
  language,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskComplete,
  onImportTasks,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && t.dueDate < todayStr);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN' ? 'Tasks & Project Timeline Milestones' : 'টাস্ক ও প্রজেক্ট টাইমলাইন'}
            </h2>
            <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded-full font-mono">
              13_Tasks_Timeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Site execution milestones, snag lists, upcoming deadlines, priority tasks and responsible person'
              : 'সাইট কাজের মাইলস্টোন, স্ন্যাগ লিস্ট, ডেডলাইন ও দায়িত্বপ্রাপ্ত কর্মকর্তা'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onImportTasks && (
            <CategoryImportButton
              category="tasks"
              language={language}
              existingIds={tasks.map((t) => t.id)}
              onImportRecords={onImportTasks}
            />
          )}
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'EN' ? 'Add Task / Milestone' : 'নতুন টাস্ক যুক্ত করুন'}</span>
          </button>
        </div>
      </div>

      {/* Overdue Alert Strip if any */}
      {overdueTasks.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>{overdueTasks.length} {language === 'EN' ? 'overdue task(s) detected' : 'টি কাজের ডেডলাইন পার হয়েছে'}</strong>. {language === 'EN' ? 'Immediate site coordination required.' : 'দ্রুত সাইট পরিদর্শন প্রয়োজন।'}
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search task, project, assigned person..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs w-full md:w-auto"
        >
          <option value="ALL">All Statuses (সব স্ট্যাটাস)</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Under Review">Under Review</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Task ID & Milestone</th>
                <th className="py-3 px-3">Project Site</th>
                <th className="py-3 px-3">Assigned Person</th>
                <th className="py-3 px-3">Timeline & Due Date</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Progress</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTasks.map((t) => {
                const isOverdue = t.status !== 'Completed' && t.dueDate < todayStr;
                return (
                  <tr key={t.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => onToggleTaskComplete(t.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600 hover:border-amber-500'
                        }`}
                      >
                        {t.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className={`font-bold text-sm ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {t.taskName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        <span className="font-mono text-orange-400 font-semibold">{t.id}</span>
                        {t.notes && <span> • {t.notes}</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-slate-200 block font-medium">{t.projectName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.projectId}</span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {t.assignedPerson}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-200 font-mono font-medium">
                        Due: {formatDate(t.dueDate)}
                      </div>
                      {isOverdue && (
                        <span className="text-[10px] text-rose-400 font-bold block">
                          ⚠️ Overdue
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-300'
                            : t.priority === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="w-16">
                        <div className="text-[10px] text-slate-400 font-mono mb-0.5">
                          {t.completionPercentage}%
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-orange-500 h-full rounded-full"
                            style={{ width: `${t.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditTask(t)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(t)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
