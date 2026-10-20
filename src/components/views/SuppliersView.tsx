/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  MapPin,
  BadgeDollarSign,
  Receipt,
  Edit2,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { Supplier, PurchaseOrder, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';

interface SuppliersViewProps {
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onAddSupplier: () => void;
  onEditSupplier?: (supplier: Supplier) => void;
  onDeleteSupplier?: (supplier: Supplier) => void;
  onAddPurchaseOrder?: () => void;
  onEditPurchaseOrder?: (po: PurchaseOrder) => void;
  onDeletePurchaseOrder?: (po: PurchaseOrder) => void;
  onImportSuppliers?: (records: Supplier[]) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  purchases,
  settings,
  language,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onAddPurchaseOrder,
  onEditPurchaseOrder,
  onDeletePurchaseOrder,
  onImportSuppliers,
}) => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'purchases'>('suppliers');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.materialSupplied.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
  );

  const filteredPurchases = purchases.filter(
    (po) =>
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.materialItemsSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.projectName && po.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalBilled = suppliers.reduce((s, sup) => s + sup.totalBilled, 0);
  const totalPaid = suppliers.reduce((s, sup) => s + sup.totalPaid, 0);
  const totalDue = suppliers.reduce((s, sup) => s + sup.outstandingDue, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN' ? 'Supplier & Purchase Order Management' : 'সাপ্লায়ার ও ক্রয় ব্যবস্থাপনা'}
            </h2>
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-mono">
              07_Suppliers_Purchases
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Vendor directory, materials supplied, purchase orders, billed vs paid, and outstanding dues'
              : 'ভেন্ডর তালিকা, সরবরাহকৃত উপকরণ, পারচেজ অর্ডার এবং বকেয়া বিল পরিশোধ'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onImportSuppliers && (
            <CategoryImportButton
              category="suppliers"
              language={language}
              existingIds={suppliers.map((s) => s.id)}
              onImportRecords={onImportSuppliers}
            />
          )}

          {onAddPurchaseOrder && (
            <button
              onClick={onAddPurchaseOrder}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{language === 'EN' ? 'New Purchase Order' : 'নতুন পারচেজ অর্ডার (PO)'}</span>
            </button>
          )}

          <button
            onClick={onAddSupplier}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'EN' ? 'Add Supplier' : 'নতুন সাপ্লায়ার যোগ করুন'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Supplier Bills' : 'মোট ভেন্ডর বিল'}
          </span>
          <span className="text-lg font-bold font-mono text-white">
            {formatCurrency(totalBilled, settings.currencySymbol)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Paid to Suppliers' : 'পরিশোধিত অর্থ'}
          </span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {formatCurrency(totalPaid, settings.currencySymbol)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Outstanding Supplier Dues' : 'সাপ্লায়ার বাকি বকেয়া'}
          </span>
          <span className="text-lg font-bold font-mono text-rose-400">
            {formatCurrency(totalDue, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🚚 {language === 'EN' ? `Registered Suppliers (${suppliers.length})` : `সাপ্লায়ার তালিকা (${suppliers.length})`}
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📑 {language === 'EN' ? `Purchase Orders (${purchases.length})` : `পারচেজ অর্ডার লগ (${purchases.length})`}
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              language === 'EN'
                ? 'Search supplier, phone, project...'
                : 'সাপ্লায়ার নাম, ফোন বা প্রজেক্ট খুঁজুন...'
            }
            className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-full sm:w-64"
          />
        </div>
      </div>

      {activeTab === 'suppliers' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Supplier Name & ID</th>
                  <th className="py-3 px-3">Contact & Address</th>
                  <th className="py-3 px-3">Materials Supplied</th>
                  <th className="py-3 px-3 text-right">Total Billed</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Due Balance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white text-sm">{s.name}</div>
                      <span className="font-mono text-[10px] text-purple-400 font-semibold">{s.id}</span>
                    </td>
                    <td className="py-3.5 px-3 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{s.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{s.address}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      {s.materialSupplied}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                      {formatCurrency(s.totalBilled, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(s.totalPaid, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold">
                      <span className={s.outstandingDue > 0 ? 'text-rose-400' : 'text-slate-400'}>
                        {formatCurrency(s.outstandingDue, settings.currencySymbol)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onEditSupplier && (
                          <button
                            onClick={() => onEditSupplier(s)}
                            title={language === 'EN' ? 'Edit Supplier' : 'সাপ্লায়ার তথ্য পরিবর্তন'}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteSupplier && (
                          <button
                            onClick={() => onDeleteSupplier(s)}
                            title={language === 'EN' ? 'Delete Supplier' : 'সাপ্লায়ার মুছে ফেলুন'}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">PO Number & Date</th>
                  <th className="py-3 px-3">Supplier Name</th>
                  <th className="py-3 px-3">Project Site</th>
                  <th className="py-3 px-3">Material Summary</th>
                  <th className="py-3 px-3 text-right">Total Bill</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Outstanding Due</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-3">
                      <span className="font-mono text-purple-400 font-bold block">{po.id}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(po.date)}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">{po.supplierName}</td>
                    <td className="py-3 px-3 text-slate-300">{po.projectName || 'Warehouse'}</td>
                    <td className="py-3 px-3 text-slate-300">{po.materialItemsSummary}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200">
                      {formatCurrency(po.totalBill, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                      {formatCurrency(po.amountPaid, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                      {formatCurrency(po.outstandingSupplierDue, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          po.paymentStatus === 'Fully Paid'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {po.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onEditPurchaseOrder && (
                          <button
                            onClick={() => onEditPurchaseOrder(po)}
                            title={language === 'EN' ? 'Edit PO' : 'পারচেজ অর্ডার এডিট করুন'}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeletePurchaseOrder && (
                          <button
                            onClick={() => onDeletePurchaseOrder(po)}
                            title={language === 'EN' ? 'Delete PO' : 'পারচেজ অর্ডার মুছে ফেলুন'}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
