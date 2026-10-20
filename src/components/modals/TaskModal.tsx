/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, CalendarCheck, Save } from 'lucide-react';
import { TaskItem, Project, CompanySettings } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
  editingTask?: TaskItem | null;
  projects: Project[];
  settings: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  projects,
  settings,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<TaskItem>>({
    id: nextId,
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.projectName || '',
    taskName: '',
    assignedPerson: settings.employees[0] || 'Kamrul Hassan',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    priority: 'High',
    status: 'In Progress',
    completionPercentage: 0,
    notes: '',
  });

  useEffect(() => {
    if (editingTask) {
      setFormData(editingTask);
    } else {
      setFormData({
        id: nextId,
        projectId: projects[0]?.id || '',
        projectName: projects[0]?.projectName || '',
        taskName: '',
        assignedPerson: settings.employees[0] || 'Kamrul Hassan',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        priority: 'High',
        status: 'In Progress',
        completionPercentage: 0,
        notes: '',
      });
    }
  }, [editingTask, nextId, projects, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskName?.trim() || !formData.projectId) return;

    const project = projects.find((p) => p.id === formData.projectId);

    const task: TaskItem = {
      id: formData.id || nextId,
      projectId: formData.projectId,
      projectName: project ? project.projectName : formData.projectName || '',
      taskName: formData.taskName.trim(),
      assignedPerson: formData.assignedPerson || '',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || '',
      priority: formData.priority as any,
      status: formData.status as any,
      completionPercentage: Number(formData.completionPercentage || 0),
      notes: formData.notes || '',
    };

    onSave(task);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingTask
                  ? (language === 'EN' ? 'Edit Project Task' : 'টাস্ক সম্পাদন')
                  : (language === 'EN' ? 'Add New Project Task / Milestone' : 'নতুন টাস্ক বা মাইলস্টোন যুক্ত করুন')}
              </h2>
              <span className="text-xs text-orange-400 font-mono font-semibold">
                ID: {formData.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Project Site *' : 'প্রজেক্ট সাইট *'}
            </label>
            <select
              required
              value={formData.projectId || ''}
              onChange={(e) => {
                const proj = projects.find((p) => p.id === e.target.value);
                setFormData({
                  ...formData,
                  projectId: e.target.value,
                  projectName: proj ? proj.projectName : '',
                });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.projectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Task Name / Milestone *' : 'কাজের নাম / মাইলস্টোন *'}
            </label>
            <input
              type="text"
              required
              value={formData.taskName || ''}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              placeholder="e.g. Master Bedroom Quartz Countertop Template & Cut"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Assigned Person' : 'দায়িত্বপ্রাপ্ত ব্যক্তি'}
              </label>
              <select
                value={formData.assignedPerson || ''}
                onChange={(e) => setFormData({ ...formData, assignedPerson: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.employees.map((emp) => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Priority' : 'অগ্রাধিকার'}
              </label>
              <select
                value={formData.priority || 'High'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Start Date' : 'শুরুর তারিখ'}
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Due Date *' : 'শেষের সময়সীমা *'}
              </label>
              <input
                type="date"
                required
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Status' : 'স্ট্যাটাস'}
              </label>
              <select
                value={formData.status || 'In Progress'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">
                  {language === 'EN' ? 'Completion %' : 'সম্পন্নতার হার'}
                </label>
                <span className="font-mono text-orange-400 font-bold">
                  {formData.completionPercentage || 0}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.completionPercentage || 0}
                onChange={(e) => setFormData({ ...formData, completionPercentage: Number(e.target.value) })}
                className="w-full accent-orange-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Execution Details & Snag Notes' : 'কাজের বিস্তারিত ও বিশেষ নির্দেশনা'}
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Inspect under spotlight for undulations before primer coat"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {language === 'EN' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Task' : 'টাস্ক সংরক্ষণ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
