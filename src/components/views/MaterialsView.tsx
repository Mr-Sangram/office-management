/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  ArrowRightLeft,
  Search,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Layers,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { MaterialItem, MaterialTransaction, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';

interface MaterialsViewProps {
  materials: MaterialItem[];
  transactions: MaterialTransaction[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onAddMaterial: () => void;
  onOpenTransactionModal: () => void;
  onEditMaterial: (material: MaterialItem) => void;
  onDeleteMaterial: (material: MaterialItem) => void;
  onDeleteTransaction?: (transaction: MaterialTransaction) => void;
  onImportMaterials?: (records: MaterialItem[]) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  transactions,
  settings,
  language,
  onAddMaterial,
  onOpenTransactionModal,
  onEditMaterial,
  onDeleteMaterial,
  onDeleteTransaction,
  onImportMaterials,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'transactions'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalStockValue = materials.reduce((s, m) => s + m.totalStockValue, 0);
  const lowStockCount = materials.filter((m) => m.stockStatus !== 'In Stock').length;

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN' ? 'Materials Inventory & Site Movement' : 'উপকরণ ইনভেন্টরি ও সাইট মুভমেন্ট'}
            </h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
              05_Materials & 06_Transactions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Real-time stock balance = Purchased - Site Used + Returned. Reorder alerts and project cost tracking'
              : 'রিয়েল-টাইম স্টক = ক্রয় - সাইটে ব্যবহার + ফেরত। কম স্টকের অ্যালার্ট ও প্রজেক্ট খরচের হিসাব'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onImportMaterials && (
            <CategoryImportButton
              category="materials"
              language={language}
              existingIds={materials.map((m) => m.id)}
              onImportRecords={onImportMaterials}
            />
          )}
          <button
            onClick={onOpenTransactionModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md transition cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{language === 'EN' ? 'Issue to Site / Stock In' : 'সাইটে প্রেরণ / স্টক ইন'}</span>
          </button>
          <button
            onClick={onAddMaterial}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'EN' ? 'Add Material' : 'নতুন আইটেম'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Inventory Valuation' : 'বর্তমান মোট স্টক মূল্যায়ন'}
          </span>
          <span className="text-lg font-bold font-mono text-amber-300">
            {formatCurrency(totalStockValue, settings.currencySymbol)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Catalogued Materials' : 'মোট উপকরণের ধরন'}
          </span>
          <span className="text-lg font-bold font-mono text-white">
            {materials.length} Items
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Low Stock Warnings' : 'কম স্টকের আইটেম'}
          </span>
          <span className={`text-lg font-bold font-mono ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {lowStockCount} Items
          </span>
        </div>
      </div>

      {/* Sub Tabs: Inventory vs Movement Log */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'inventory'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          📦 {language === 'EN' ? 'Materials Stock Registry' : 'উপকরণ স্টক তালিকা'}
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'transactions'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          🔄 {language === 'EN' ? 'Site Movement & Issue History' : 'সাইট চালান ও ট্রানজেকশন'}
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'EN' ? 'Search materials, specifications, supplier...' : 'উপকরণের নাম বা বিবরণ দিয়ে খুঁজুন...'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs w-full md:w-auto"
            >
              <option value="ALL">All Categories (সব ক্যাটাগরি)</option>
              {settings.materialCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Materials Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Material ID & Description</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-3 text-right">Purchased</th>
                    <th className="py-3 px-3 text-right">Site Used</th>
                    <th className="py-3 px-3 text-right">Current Stock</th>
                    <th className="py-3 px-3 text-right">Stock Valuation</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredMaterials.map((mat) => {
                    const isLow = mat.stockStatus !== 'In Stock';
                    return (
                      <tr key={mat.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white text-sm">{mat.materialName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            ID: <span className="font-mono text-amber-400 font-semibold">{mat.id}</span> • Supplier: {mat.supplier}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-slate-300">
                          {mat.category}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                          {formatCurrency(mat.unitPurchasePrice, settings.currencySymbol)} / {mat.unit}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                          {mat.totalPurchasedQty} {mat.unit}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono text-amber-400">
                          {mat.totalUsedQty} {mat.unit}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-white text-sm">
                          {mat.currentStock} {mat.unit}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-300">
                          {formatCurrency(mat.totalStockValue, settings.currencySymbol)}
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              mat.stockStatus === 'In Stock'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {mat.stockStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onEditMaterial(mat)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteMaterial(mat)}
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
        </>
      ) : (
        /* Transactions Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Txn ID & Date</th>
                  <th className="py-3 px-3">Material Description</th>
                  <th className="py-3 px-3">Movement Type</th>
                  <th className="py-3 px-3">Destination Project</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Total Cost</th>
                  <th className="py-3 px-3">Chalan / Reference</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-3">
                      <span className="font-mono text-amber-400 font-bold block">{t.id}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(t.date)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white block">{t.materialName}</span>
                      <span className="text-[10px] text-slate-400">{t.materialId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.type === 'SITE_ISSUE'
                            ? 'bg-amber-500/20 text-amber-300'
                            : t.type === 'PURCHASE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-200 block">{t.projectName || 'Warehouse'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.projectId}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      {t.quantity} {t.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {formatCurrency(t.unitPrice, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                      {formatCurrency(t.totalCost, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {t.reference || '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {onDeleteTransaction && (
                        <button
                          onClick={() => onDeleteTransaction(t)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer"
                          title={language === 'EN' ? 'Delete Transaction' : 'ট্রানজেকশন মুছে ফেলুন'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
