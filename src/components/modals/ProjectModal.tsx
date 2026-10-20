/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, FolderKanban, Save } from 'lucide-react';
import { Project, Client, CompanySettings } from '../../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  editingProject?: Project | null;
  clients: Client[];
  settings: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProject,
  clients,
  settings,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    id: nextId,
    projectName: '',
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.name || '',
    siteAddress: clients[0]?.address || '',
    projectType: settings.projectTypes[0] || 'Residential Apartment',
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: '',
    actualCompletionDate: '',
    projectManager: settings.employees[0] || 'Kamrul Hassan',
    contractValue: 0,
    vatRate: settings.taxVatRate || 7.5,
    discount: 0,
    netContractValue: 0,
    projectStatus: 'In Progress / Execution',
    progressPercentage: 10,
    estimatedMaterialCost: 0,
    estimatedLabourCost: 0,
    estimatedOtherCost: 0,
    estimatedProfit: 0,
    actualMaterialCost: 0,
    actualLabourCost: 0,
    subcontractorCost: 0,
    otherDirectCosts: 0,
    allocatedOverhead: 0,
    totalProjectCost: 0,
    amountReceived: 0,
    outstandingDue: 0,
    actualProfit: 0,
    profitMargin: 0,
    remarks: '',
  });

  useEffect(() => {
    if (editingProject) {
      setFormData(editingProject);
    } else {
      const defaultClient = clients[0];
      setFormData({
        id: nextId,
        projectName: defaultClient ? `${defaultClient.name} Residence` : '',
        clientId: defaultClient?.id || '',
        clientName: defaultClient?.name || '',
        siteAddress: defaultClient?.address || '',
        projectType: settings.projectTypes[0] || 'Residential Apartment',
        startDate: new Date().toISOString().split('T')[0],
        expectedCompletionDate: '',
        actualCompletionDate: '',
        projectManager: settings.employees[0] || 'Kamrul Hassan',
        contractValue: 0,
        vatRate: settings.taxVatRate || 7.5,
        discount: 0,
        netContractValue: 0,
        projectStatus: 'In Progress / Execution',
        progressPercentage: 10,
        estimatedMaterialCost: 0,
        estimatedLabourCost: 0,
        estimatedOtherCost: 0,
        estimatedProfit: 0,
        actualMaterialCost: 0,
        actualLabourCost: 0,
        subcontractorCost: 0,
        otherDirectCosts: 0,
        allocatedOverhead: 0,
        totalProjectCost: 0,
        amountReceived: 0,
        outstandingDue: 0,
        actualProfit: 0,
        profitMargin: 0,
        remarks: '',
      });
    }
  }, [editingProject, nextId, clients, settings]);

  if (!isOpen) return null;

  const handleClientChange = (clientId: string) => {
    const selected = clients.find((c) => c.id === clientId);
    if (selected) {
      setFormData({
        ...formData,
        clientId: selected.id,
        clientName: selected.name,
        siteAddress: selected.address,
        projectName: formData.projectName || selected.projectName || `${selected.name} Project`,
        contractValue: formData.contractValue || selected.totalContractAmount || 0,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName?.trim()) return;

    const contract = Number(formData.contractValue || 0);
    const discount = Number(formData.discount || 0);
    const netContract = contract - discount;
    const overhead = Number(formData.allocatedOverhead || (netContract * (settings.defaultOverheadPercentage / 100)));

    const matCost = Number(formData.actualMaterialCost || 0);
    const labCost = Number(formData.actualLabourCost || 0);
    const subCost = Number(formData.subcontractorCost || 0);
    const otherCost = Number(formData.otherDirectCosts || 0);
    const totalCost = matCost + labCost + subCost + otherCost + overhead;

    const received = Number(formData.amountReceived || 0);
    const due = netContract - received;
    const profit = netContract - totalCost;
    const margin = netContract > 0 ? (profit / netContract) * 100 : 0;

    const projectToSave: Project = {
      id: formData.id || nextId,
      projectName: formData.projectName.trim(),
      clientId: formData.clientId || '',
      clientName: formData.clientName || '',
      siteAddress: formData.siteAddress || '',
      projectType: formData.projectType || settings.projectTypes[0],
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      expectedCompletionDate: formData.expectedCompletionDate || '',
      actualCompletionDate: formData.actualCompletionDate || '',
      projectManager: formData.projectManager || 'Kamrul Hassan',
      contractValue: contract,
      vatRate: Number(formData.vatRate || 0),
      discount: discount,
      netContractValue: netContract,
      projectStatus: formData.projectStatus as any,
      progressPercentage: Number(formData.progressPercentage || 0),
      estimatedMaterialCost: Number(formData.estimatedMaterialCost || 0),
      estimatedLabourCost: Number(formData.estimatedLabourCost || 0),
      estimatedOtherCost: Number(formData.estimatedOtherCost || 0),
      estimatedProfit: Number(formData.estimatedProfit || 0),
      actualMaterialCost: matCost,
      actualLabourCost: labCost,
      subcontractorCost: subCost,
      otherDirectCosts: otherCost,
      allocatedOverhead: overhead,
      totalProjectCost: totalCost,
      amountReceived: received,
      outstandingDue: due > 0 ? due : 0,
      actualProfit: profit,
      profitMargin: Number(margin.toFixed(2)),
      remarks: formData.remarks || '',
    };

    onSave(projectToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingProject
                  ? (language === 'EN' ? 'Edit Project Master Record' : 'প্রজেক্ট তথ্য আপডেট')
                  : (language === 'EN' ? 'Create New Interior Project' : 'নতুন ইন্টেরিয়র প্রজেক্ট তৈরি করুন')}
              </h2>
              <span className="text-xs text-teal-400 font-mono font-semibold">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Select or Enter Client *' : 'ক্লায়েন্ট নির্বাচন বা নাম লিখুন *'}
              </label>
              {clients.length > 0 ? (
                <select
                  value={formData.clientId || ''}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.name} ({c.clientType})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={formData.clientName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clientName: e.target.value,
                      clientId: 'CLI-001',
                    })
                  }
                  placeholder={language === 'EN' ? 'Type Client Name...' : 'ক্লায়েন্টের নাম লিখুন...'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              )}
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Project Title *' : 'প্রজেক্টের নাম *'}
              </label>
              <input
                type="text"
                required
                value={formData.projectName || ''}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g. Gulshan Sky Duplex Penthouse"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Site Address */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Site Location / Address' : 'সাইটের ঠিকানা'}
              </label>
              <input
                type="text"
                value={formData.siteAddress || ''}
                onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
                placeholder="e.g. Apt 11B, Road 72, Gulshan-2, Dhaka"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Project Type' : 'প্রজেক্টের ধরন'}
              </label>
              <select
                value={formData.projectType || settings.projectTypes[0]}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.projectTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Manager */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Assigned Project Engineer / Architect' : 'দায়িত্বপ্রাপ্ত প্রজেক্ট ইঞ্জিনিয়ার / আর্কিটেক্ট'}
              </label>
              {settings.employees.length > 0 ? (
                <select
                  value={formData.projectManager || ''}
                  onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {settings.employees.map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.projectManager || ''}
                  onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                  placeholder={language === 'EN' ? 'Engineer / Manager Name' : 'প্রজেক্ট ইঞ্জিনিয়ার বা ম্যানেজারের নাম'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Project Start Date' : 'শুরুর তারিখ'}
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Expected Completion */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Expected Handover Date' : 'হ্যান্ডওভারের সম্ভাব্য তারিখ'}
              </label>
              <input
                type="date"
                value={formData.expectedCompletionDate || ''}
                onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Contract Value */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Total Contract Value (৳) *' : 'মোট চুক্তি মূল্য (৳) *'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.contractValue || ''}
                onChange={(e) => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Discount / VAT */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Discount Given (৳)' : 'ডিসকাউন্ট (৳)'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.discount || ''}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Project Status */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Current Project Status' : 'বর্তমান অগ্রগতি স্ট্যাটাস'}
              </label>
              <select
                value={formData.projectStatus || 'In Progress / Execution'}
                onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.projectStatuses.map((ps) => (
                  <option key={ps} value={ps}>
                    {ps}
                  </option>
                ))}
              </select>
            </div>

            {/* Progress Percentage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">
                  {language === 'EN' ? 'Execution Progress' : 'অগ্রগতির হার'}
                </label>
                <span className="font-mono text-teal-400 font-bold">
                  {formData.progressPercentage || 0}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progressPercentage || 0}
                onChange={(e) => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
                className="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Engineering & Site Execution Remarks' : 'সাইট নোট ও বিবরণী'}
              </label>
              <textarea
                rows={2}
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="e.g. Master wardrobe completed, living room false ceiling primer done..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Project' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
