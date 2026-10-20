/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Save } from 'lucide-react';
import { MaterialItem, Project, MaterialTransaction } from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: MaterialTransaction) => void;
  materials: MaterialItem[];
  projects: Project[];
  nextId: string;
  language: 'EN' | 'BN';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  materials,
  projects,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<MaterialTransaction>>({
    id: nextId,
    date: new Date().toISOString().split('T')[0],
    materialId: materials[0]?.id || '',
    materialName: materials[0]?.materialName || '',
    type: 'SITE_ISSUE',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.projectName || '',
    quantity: 1,
    unit: materials[0]?.unit || 'pcs',
    unitPrice: materials[0]?.unitPurchasePrice || 0,
    totalCost: materials[0]?.unitPurchasePrice || 0,
    reference: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: nextId,
        date: new Date().toISOString().split('T')[0],
        materialId: materials[0]?.id || '',
        materialName: materials[0]?.materialName || '',
        type: 'SITE_ISSUE',
        projectId: projects[0]?.id || '',
        projectName: projects[0]?.projectName || '',
        quantity: 1,
        unit: materials[0]?.unit || 'pcs',
        unitPrice: materials[0]?.unitPurchasePrice || 0,
        totalCost: materials[0]?.unitPurchasePrice || 0,
        reference: '',
        notes: '',
      });
    }
  }, [isOpen, nextId, materials, projects]);

  if (!isOpen) return null;

  const handleMaterialChange = (matId: string) => {
    const mat = materials.find((m) => m.id === matId);
    if (mat) {
      const qty = Number(formData.quantity || 1);
      setFormData({
        ...formData,
        materialId: mat.id,
        materialName: mat.materialName,
        unit: mat.unit,
        unitPrice: mat.unitPurchasePrice,
        totalCost: qty * mat.unitPurchasePrice,
      });
    }
  };

  const handleProjectChange = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    setFormData({
      ...formData,
      projectId: projId,
      projectName: proj ? proj.projectName : 'General Warehouse',
    });
  };

  const handleQtyChange = (qty: number) => {
    const price = Number(formData.unitPrice || 0);
    setFormData({
      ...formData,
      quantity: qty,
      totalCost: qty * price,
    });
  };

  const handlePriceChange = (price: number) => {
    const qty = Number(formData.quantity || 0);
    setFormData({
      ...formData,
      unitPrice: price,
      totalCost: qty * price,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materialId || !formData.quantity) return;

    const selectedMat = materials.find((m) => m.id === formData.materialId);
    const selectedProj = projects.find((p) => p.id === formData.projectId);

    const transaction: MaterialTransaction = {
      id: formData.id || nextId,
      date: formData.date || new Date().toISOString().split('T')[0],
      materialId: formData.materialId,
      materialName: selectedMat ? selectedMat.materialName : formData.materialName || '',
      type: formData.type as any,
      projectId: formData.projectId || '',
      projectName: selectedProj ? selectedProj.projectName : 'General Stock',
      quantity: Number(formData.quantity),
      unit: formData.unit || 'pcs',
      unitPrice: Number(formData.unitPrice || 0),
      totalCost: Number(formData.totalCost || 0),
      reference: formData.reference || '',
      notes: formData.notes || '',
    };

    onSave(transaction);
    onClose();
  };

  const selectedMaterial = materials.find((m) => m.id === formData.materialId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-300">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'EN' ? 'Record Material Movement / Site Issue' : 'উপকরণ লেনদেন / সাইটে প্রেরণ'}
              </h2>
              <span className="text-xs text-amber-400 font-mono font-semibold">
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
          {/* Movement Type */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Movement Type *' : 'লেনদেনের ধরন *'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'SITE_ISSUE' })}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition ${
                  formData.type === 'SITE_ISSUE'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                📤 Site Issue (সাইটে প্রদান)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'PURCHASE' })}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition ${
                  formData.type === 'PURCHASE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                📥 Purchase (ক্রয়/স্টক ইন)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'SITE_RETURN' })}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition ${
                  formData.type === 'SITE_RETURN'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                ↩️ Site Return (ফেরত)
              </button>
            </div>
          </div>

          {/* Date & Material */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Date *' : 'তারিখ *'}
              </label>
              <input
                type="date"
                required
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Select Material *' : 'উপকরণ নির্বাচন করুন *'}
              </label>
              <select
                required
                value={formData.materialId || ''}
                onChange={(e) => handleMaterialChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.materialName} (Stock: {m.currentStock} {m.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedMaterial && (
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750 flex items-center justify-between text-xs">
              <span className="text-slate-400">Available Stock:</span>
              <span className="font-mono font-bold text-amber-300">
                {selectedMaterial.currentStock} {selectedMaterial.unit}
              </span>
            </div>
          )}

          {/* Project Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Destination Project *' : 'গন্তব্য প্রজেক্ট *'}
            </label>
            <select
              value={formData.projectId || ''}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="WAREHOUSE">Warehouse Stock (No Direct Project)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.projectName} ({p.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity, Unit Price, Total Cost */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Quantity *' : 'পরিমাণ *'}
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={formData.quantity || ''}
                onChange={(e) => handleQtyChange(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Unit Price (৳)' : 'দর (৳)'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.unitPrice || ''}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Total Cost (৳)' : 'মোট মূল্য (৳)'}
              </label>
              <input
                type="number"
                readOnly
                value={formData.totalCost || 0}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-bold font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Reference (Chalan / PO / Gate Pass)' : 'রেফারেন্স / চালান নং'}
              </label>
              <input
                type="text"
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="e.g. CHALAN-SITE-118"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Site Location / Room' : 'সাইটের স্থান / কক্ষ'}
              </label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Master Bedroom Wardrobe"
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Record Movement' : 'রেকর্ড সংরক্ষণ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
