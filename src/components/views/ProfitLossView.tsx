/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Project, CompanySettings } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ProfitLossViewProps {
  projects: Project[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
}

export const ProfitLossView: React.FC<ProfitLossViewProps> = ({
  projects,
  settings,
  language,
}) => {
  const totalAgreedContract = projects.reduce((s, p) => s + p.contractValue, 0);
  const totalMaterial = projects.reduce((s, p) => s + p.actualMaterialCost, 0);
  const totalLabour = projects.reduce((s, p) => s + p.actualLabourCost, 0);
  const totalSubcontract = projects.reduce((s, p) => s + p.subcontractorCost, 0);
  const totalOther = projects.reduce((s, p) => s + p.otherDirectCosts, 0);
  const totalOverhead = projects.reduce((s, p) => s + p.allocatedOverhead, 0);
  const totalProjectCost = totalMaterial + totalLabour + totalSubcontract + totalOther + totalOverhead;
  const totalActualProfit = totalAgreedContract - totalProjectCost;
  const overallMargin = totalAgreedContract > 0 ? (totalActualProfit / totalAgreedContract) * 100 : 0;

  const totalCashReceived = projects.reduce((s, p) => s + p.amountReceived, 0);
  const totalOutstandingDue = projects.reduce((s, p) => s + p.outstandingDue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-bold text-white">
            {language === 'EN' ? 'Project Profit & Loss Audit (Sheet 11)' : 'প্রজেক্টভিত্তিক লাভ ও ক্ষতি বিবরণী'}
          </h2>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
            11_Project_Profit_Loss
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {language === 'EN'
            ? 'Contract Value − Direct Material − Direct Labour − Subcontractor − Direct Costs − Overhead = Net Profit. Revenue and Cash Inflow are strictly segregated.'
            : 'চুক্তি মূল্য − উপাদান খরচ − মিস্ত্রি খরচ − সাবকন্ট্রাক্টর − ওভারহেড = নিট লাভ। রেভিনিউ এবং নগদ টাকা আলাদা সংরক্ষিত।'}
        </p>
      </div>

      {/* Aggregate Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            {language === 'EN' ? 'Total Contract Revenue' : 'মোট চুক্তি আয় (Revenue)'}
          </span>
          <span className="text-2xl font-black text-white font-mono block">
            {formatCurrency(totalAgreedContract, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Excluding discounts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            {language === 'EN' ? 'Total Project Costs' : 'মোট সর্বমোট প্রজেক্ট খরচ'}
          </span>
          <span className="text-2xl font-black text-rose-300 font-mono block">
            {formatCurrency(totalProjectCost, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Material + Labour + Overhead</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 shadow-lg">
          <span className="text-xs text-amber-300 font-semibold block mb-1 flex items-center justify-between">
            <span>{language === 'EN' ? 'Net Project Profit' : 'মোট নিট লাভ (Profit)'}</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
              {overallMargin.toFixed(1)}%
            </span>
          </span>
          <span className="text-2xl font-black text-amber-300 font-mono block">
            {formatCurrency(totalActualProfit, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Firm cumulative margin</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-emerald-400 font-semibold block mb-1 flex items-center justify-between">
            <span>{language === 'EN' ? 'Cash Received vs Due' : 'নগদ জমা বনাম বকেয়া'}</span>
          </span>
          <span className="text-lg font-black text-emerald-400 font-mono block">
            {formatCurrency(totalCashReceived, settings.currencySymbol)} <span className="text-xs text-slate-400 font-normal">Cash</span>
          </span>
          <span className="text-xs text-rose-400 font-mono font-bold block mt-0.5">
            {formatCurrency(totalOutstandingDue, settings.currencySymbol)} <span className="text-xs text-slate-400 font-normal">Due</span>
          </span>
        </div>
      </div>

      {/* Itemized Project Profit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{language === 'EN' ? 'Project-Wise Profitability & Cost Ledger' : 'প্রজেক্টভিত্তিক আয়-ব্যয় ও মুনাফা বিবরণী'}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            SUM(Material + Labour + Sub + Overhead) = Cost
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Project Title & Client</th>
                <th className="py-3 px-2 text-right">Contract Rev</th>
                <th className="py-3 px-2 text-right">Direct Material</th>
                <th className="py-3 px-2 text-right">Direct Labour</th>
                <th className="py-3 px-2 text-right">Subcontractor</th>
                <th className="py-3 px-2 text-right">Overhead</th>
                <th className="py-3 px-2 text-right">Total Cost</th>
                <th className="py-3 px-2 text-right">Net Profit</th>
                <th className="py-3 px-2 text-right">Margin %</th>
                <th className="py-3 px-3 text-right">Cash Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {projects.map((p) => {
                const isHealthy = p.actualProfit > 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white text-sm">{p.projectName}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.clientName} • <span className="text-teal-400 font-mono font-semibold">{p.id}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-2 text-right font-mono font-semibold text-white">
                      {formatCurrency(p.contractValue, settings.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-2 text-right font-mono text-slate-300">
                      {formatCurrency(p.actualMaterialCost, settings.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-2 text-right font-mono text-slate-300">
                      {formatCurrency(p.actualLabourCost, settings.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-2 text-right font-mono text-slate-300">
                      {formatCurrency(p.subcontractorCost, settings.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-2 text-right font-mono text-slate-400">
                      {formatCurrency(p.allocatedOverhead, settings.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-2 text-right font-mono font-bold text-rose-300">
                      {formatCurrency(p.totalProjectCost, settings.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-2 text-right font-mono font-black text-sm">
                      <span className={isHealthy ? 'text-amber-300' : 'text-rose-400'}>
                        {formatCurrency(p.actualProfit, settings.currencySymbol)}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-right font-mono font-bold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          p.profitMargin >= 30
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : p.profitMargin > 15
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {p.profitMargin.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-emerald-400">
                      {formatCurrency(p.amountReceived, settings.currencySymbol)}
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
