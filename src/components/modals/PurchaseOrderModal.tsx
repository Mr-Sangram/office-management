/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Receipt, Save, DollarSign } from 'lucide-react';
import { PurchaseOrder, Supplier, Project, CompanySettings } from '../../types';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (po: PurchaseOrder) => void;
  editingPO?: PurchaseOrder | null;
  suppliers: Supplier[];
  projects: Project[];
  settings: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPO,
  suppliers,
  projects,
  settings,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    id: nextId,
    supplierId: suppliers[0]?.id || 'SUP-001',
    supplierName: suppliers[0]?.name || 'General Supplier',
    projectId: projects[0]?.id || 'WAREHOUSE',
    projectName: projects[0]?.projectName || 'Warehouse / Stock',
    date: new Date().toISOString().split('T')[0],
    materialItemsSummary: 'Hardware & Materials',
    totalBill: 0,
    amountPaid: 0,
    outstandingSupplierDue: 0,
    paymentStatus: 'Unpaid',
  });

  useEffect(() => {
    if (editingPO) {
      setFormData(editingPO);
    } else {
      const sup = suppliers[0];
      const proj = projects[0];
      setFormData({
        id: nextId,
        supplierId: sup?.id || 'SUP-001',
        supplierName: sup?.name || 'General Supplier',
        projectId: proj?.id || 'WAREHOUSE',
        projectName: proj?.projectName || 'Warehouse / Stock',
        date: new Date().toISOString().split('T')[0],
        materialItemsSummary: 'Hardware & Materials',
        totalBill: 0,
        amountPaid: 0,
        outstandingSupplierDue: 0,
        paymentStatus: 'Unpaid',
      });
    }
  }, [editingPO, nextId, suppliers, projects, isOpen]);

  const handleSupplierChange = (supId: string) => {
    const selected = suppliers.find((s) => s.id === supId);
    setFormData((prev) => ({
      ...prev,
      supplierId: supId,
      supplierName: selected?.name || prev.supplierName,
    }));
  };

  const handleProjectChange = (projId: string) => {
    if (projId === 'WAREHOUSE') {
      setFormData((prev) => ({
        ...prev,
        projectId: 'WAREHOUSE',
        projectName: 'Warehouse / Central Stock',
      }));
      return;
    }
    const selected = projects.find((p) => p.id === projId);
    setFormData((prev) => ({
      ...prev,
      projectId: projId,
      projectName: selected?.projectName || prev.projectName,
    }));
  };

  const handleBillChange = (bill: number) => {
    const paid = Number(formData.amountPaid || 0);
    const due = Math.max(0, bill - paid);
    let status: PurchaseOrder['paymentStatus'] = 'Unpaid';
    if (paid >= bill && bill > 0) status = 'Fully Paid';
    else if (paid > 0) status = 'Partially Paid';

    setFormData((prev) => ({
      ...prev,
      totalBill: bill,
      outstandingSupplierDue: due,
      paymentStatus: status,
    }));
  };

  const handlePaidChange = (paid: number) => {
    const bill = Number(formData.totalBill || 0);
    const due = Math.max(0, bill - paid);
    let status: PurchaseOrder['paymentStatus'] = 'Unpaid';
    if (paid >= bill && bill > 0) status = 'Fully Paid';
    else if (paid > 0) status = 'Partially Paid';

    setFormData((prev) => ({
      ...prev,
      amountPaid: paid,
      outstandingSupplierDue: due,
      paymentStatus: status,
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bill = Number(formData.totalBill || 0);
    const paid = Number(formData.amountPaid || 0);
    const due = Number(formData.outstandingSupplierDue ?? Math.max(0, bill - paid));

    onSave({
      id: formData.id || nextId,
      supplierId: formData.supplierId || suppliers[0]?.id || 'SUP-001',
      supplierName: formData.supplierName || 'General Supplier',
      projectId: formData.projectId || 'WAREHOUSE',
      projectName: formData.projectName || 'Warehouse / Stock',
      date: formData.date || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || formData.date || new Date().toISOString().split('T')[0],
      materialItemsSummary: formData.materialItemsSummary?.trim() || 'General Materials',
      totalBill: bill,
      amountPaid: paid,
      outstandingSupplierDue: due,
      paymentStatus: formData.paymentStatus || 'Unpaid',
      notes: formData.notes || '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {editingPO
                  ? language === 'EN'
                    ? 'Edit Purchase Order'
                    : 'পারচেজ অর্ডার পরিবর্তন করুন'
                  : language === 'EN'
                  ? 'Create Purchase Order (PO)'
                  : 'নতুন পারচেজ অর্ডার এন্ট্রি'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'EN'
                  ? 'Record supplier invoice, destination project, and payment'
                  : 'সাপ্লায়ার ইনভয়েস, মেটেরিয়াল ও বিল সংক্রান্ত তথ্য এন্ট্রি করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">PO Number</label>
              <input
                type="text"
                disabled
                value={formData.id || nextId}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-purple-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Date' : 'তারিখ'}
              </label>
              <input
                type="date"
                required
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Supplier Name' : 'সাপ্লায়ার এর নাম'}
              </label>
              {suppliers.length > 0 ? (
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.id})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={formData.supplierName || ''}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="Supplier Name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Destination Site' : 'গন্তব্য প্রজেক্ট বা গুদাম'}
              </label>
              <select
                value={formData.projectId || 'WAREHOUSE'}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="WAREHOUSE">🏢 Warehouse / Central Stock</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    🏛️ {proj.projectName} ({proj.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Material Description Summary' : 'মালামালের বিবরণ সংক্ষেপ'}
            </label>
            <input
              type="text"
              required
              value={formData.materialItemsSummary || ''}
              onChange={(e) => setFormData({ ...formData, materialItemsSummary: e.target.value })}
              placeholder="e.g. 50 Sheets Plywood, 20 Pcs Glass, Hardware..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Payment breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{language === 'EN' ? 'Bill & Payment Amounts' : 'বিল ও পরিশোধের পরিমাণ'}</span>
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Total Bill</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalBill || 0}
                  onChange={(e) => handleBillChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Amount Paid</label>
                <input
                  type="number"
                  min="0"
                  value={formData.amountPaid || 0}
                  onChange={(e) => handlePaidChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Due Amount</label>
                <input
                  type="number"
                  disabled
                  value={formData.outstandingSupplierDue || 0}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-rose-400 font-mono text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              {language === 'EN' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save PO' : 'পারচেজ অর্ডার সেভ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
