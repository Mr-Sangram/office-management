/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Package, Save } from 'lucide-react';
import { MaterialItem, CompanySettings, Supplier } from '../../types';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: MaterialItem) => void;
  editingMaterial?: MaterialItem | null;
  settings: CompanySettings;
  suppliers: Supplier[];
  nextId: string;
  language: 'EN' | 'BN';
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMaterial,
  settings,
  suppliers,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<MaterialItem>>({
    id: nextId,
    materialName: '',
    category: settings.materialCategories[0] || 'Plywood & Boards',
    unit: settings.unitsOfMeasurement[0] || 'sheet',
    supplier: suppliers[0]?.name || 'Star Wood & Plywood Syndicate',
    purchaseDate: new Date().toISOString().split('T')[0],
    unitPurchasePrice: 0,
    totalPurchasedQty: 0,
    totalUsedQty: 0,
    totalReturnedQty: 0,
    currentStock: 0,
    totalStockValue: 0,
    reorderLevel: 10,
    stockStatus: 'In Stock',
    notes: '',
  });

  useEffect(() => {
    if (editingMaterial) {
      setFormData(editingMaterial);
    } else {
      setFormData({
        id: nextId,
        materialName: '',
        category: settings.materialCategories[0] || 'Plywood & Boards',
        unit: settings.unitsOfMeasurement[0] || 'sheet',
        supplier: suppliers[0]?.name || 'Star Wood & Plywood Syndicate',
        purchaseDate: new Date().toISOString().split('T')[0],
        unitPurchasePrice: 0,
        totalPurchasedQty: 0,
        totalUsedQty: 0,
        totalReturnedQty: 0,
        currentStock: 0,
        totalStockValue: 0,
        reorderLevel: 10,
        stockStatus: 'In Stock',
        notes: '',
      });
    }
  }, [editingMaterial, nextId, settings, suppliers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materialName?.trim()) return;

    const unitPrice = Number(formData.unitPurchasePrice || 0);
    const purchased = Number(formData.totalPurchasedQty || 0);
    const used = Number(formData.totalUsedQty || 0);
    const returned = Number(formData.totalReturnedQty || 0);
    const current = purchased - used + returned;
    const reorder = Number(formData.reorderLevel || 10);

    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (current <= 0) status = 'Out of Stock';
    else if (current <= reorder) status = 'Low Stock';

    const materialToSave: MaterialItem = {
      id: formData.id || nextId,
      materialName: formData.materialName.trim(),
      category: formData.category || settings.materialCategories[0],
      unit: formData.unit || 'pcs',
      supplier: formData.supplier || '',
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      unitPurchasePrice: unitPrice,
      totalPurchasedQty: purchased,
      totalUsedQty: used,
      totalReturnedQty: returned,
      currentStock: current,
      totalStockValue: current * unitPrice,
      reorderLevel: reorder,
      stockStatus: status,
      notes: formData.notes || '',
    };

    onSave(materialToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingMaterial
                  ? (language === 'EN' ? 'Edit Material Item' : 'উপকরণের তথ্য পরিবর্তন')
                  : (language === 'EN' ? 'Add Inventory Material' : 'নতুন উপকরণ যুক্ত করুন')}
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
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Material Description / Name *' : 'উপকরণের বিবরণ / নাম *'}
            </label>
            <input
              type="text"
              required
              value={formData.materialName || ''}
              onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
              placeholder="e.g. Gorjon Marine Plywood 18mm (8x4 ft)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Category' : 'ক্যাটাগরি'}
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.materialCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Unit of Measurement' : 'পরিমাপের একক'}
              </label>
              <select
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.unitsOfMeasurement.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Preferred Supplier' : 'সাপ্লায়ার / ভেন্ডর'}
              </label>
              <select
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Unit Purchase Price (৳)' : 'একক ক্রয় মূল্য (৳)'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.unitPurchasePrice || ''}
                onChange={(e) => setFormData({ ...formData, unitPurchasePrice: Number(e.target.value) })}
                placeholder="2850"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Initial / Purchased Qty' : 'ক্রয়কৃত পরিমাণ'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalPurchasedQty || ''}
                onChange={(e) => setFormData({ ...formData, totalPurchasedQty: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Reorder Level (Alert Threshold)' : 'রি-অর্ডার লেভেল (সতর্কবার্তা সীমা)'}
              </label>
              <input
                type="number"
                min="1"
                value={formData.reorderLevel || ''}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Grade / Technical Notes' : 'গ্রেড ও স্পেসিফিকেশন নোট'}
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Boiling waterproof BWP grade, calibrated core..."
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Material' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
