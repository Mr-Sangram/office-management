/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Terminal,
  Download,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../utils/googleAppsScriptCode';

interface GoogleSheetsGuideViewProps {
  language: 'EN' | 'BN';
  onOpenAppsScriptModal: () => void;
  onExportExcel: () => void;
}

export const GoogleSheetsGuideView: React.FC<GoogleSheetsGuideViewProps> = ({
  language,
  onOpenAppsScriptModal,
  onExportExcel,
}) => {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const sheetsArchitecture = [
    {
      tab: '01_Dashboard',
      title: 'Main Executive Dashboard',
      color: 'bg-slate-900 border-slate-700 text-white',
      purpose: 'Master KPIs, total clients, contract value, payments received, project costs, low stock alerts, and client dues.',
      formulas: [
        { label: 'Total Clients', formula: "=COUNTA('03_Clients'!A2:A)" },
        { label: 'Total Projects', formula: "=COUNTA('04_Projects'!A2:A)" },
        { label: 'Running Sites', formula: '=COUNTIF(\'04_Projects\'!L2:L, "In Progress*") + COUNTIF(\'04_Projects\'!L2:L, "Finishing")' },
        { label: 'Total Contract Value', formula: "=SUM('04_Projects'!K2:K)" },
        { label: 'Total Money Received', formula: "=SUM('09_Payments_Received'!H2:H)" },
        { label: 'Outstanding Client Due', formula: '=E4-E5' },
        { label: 'Total Material Cost', formula: "=SUM('06_Material_Transactions'!H2:H)" },
        { label: 'Total Labour Wages', formula: "=SUM('08_Labour_Attendance'!K2:K)" },
        { label: 'Office Overhead', formula: '=SUMIF(\'10_Expenses\'!B2:B, "OFFICE_OVERHEAD", \'10_Expenses\'!I2:I)' },
        { label: 'Estimated Net Profit', formula: '=E5-(E7+E8+E9)' },
      ],
    },
    {
      tab: '02_Settings',
      title: 'Company Settings & Dropdowns',
      color: 'bg-slate-800 border-slate-700 text-slate-200',
      purpose: 'Source columns for dropdown lists: Project Types, Statuses, Expense Categories, Material Categories, Labour Types, Payment Methods, Units.',
      formulas: [
        { label: 'Data Validation Range', formula: "='02_Settings'!$A$2:$A$20" },
      ],
    },
    {
      tab: '03_Clients',
      title: 'Client Management',
      color: 'bg-sky-950 border-sky-800 text-sky-200',
      purpose: 'Client directory, contracts, advance, and auto-calculated received & outstanding due balances.',
      formulas: [
        { label: 'Total Received per Client', formula: "=SUMIF('09_Payments_Received'!C:C, A2, '09_Payments_Received'!H:H)" },
        { label: 'Outstanding Client Due', formula: '=I2-K2' },
      ],
    },
    {
      tab: '04_Projects',
      title: 'Project Tracking & Cost Ledger',
      color: 'bg-teal-950 border-teal-800 text-teal-200',
      purpose: 'Project master data, client auto-lookup, material cost, labour cost, subcontractor cost, total cost, and profit.',
      formulas: [
        { label: 'Client Name Auto-Lookup', formula: '=IFERROR(VLOOKUP(C2, \'03_Clients\'!A:B, 2, FALSE), "")' },
        { label: 'Actual Material Cost', formula: '=SUMIFS(\'06_Material_Transactions\'!H:H, \'06_Material_Transactions\'!E:E, A2, \'06_Material_Transactions\'!D:D, "SITE_ISSUE")' },
        { label: 'Actual Labour Wages', formula: "=SUMIF('08_Labour_Attendance'!E:E, A2, '08_Labour_Attendance'!K:K)" },
        { label: 'Direct Subcontractor Expense', formula: '=SUMIFS(\'10_Expenses\'!I:I, \'10_Expenses\'!E:E, A2, \'10_Expenses\'!B:B, "PROJECT_DIRECT")' },
        { label: 'Total Project Cost', formula: '=N2+O2+P2+Q2' },
        { label: 'Project Net Profit', formula: '=K2-R2' },
        { label: 'Profit Margin %', formula: '=IFERROR((U2/K2)*100, 0)' },
      ],
    },
    {
      tab: '05_Materials_Inventory',
      title: 'Materials Inventory & Stock',
      color: 'bg-amber-950 border-amber-800 text-amber-200',
      purpose: 'Tracks purchased stock, site usage, return to warehouse, and triggers low stock alert when stock <= reorder level.',
      formulas: [
        { label: 'Current Stock Balance', formula: '=G2-H2+I2' },
        { label: 'Stock Valuation', formula: '=J2*F2' },
        { label: 'Stock Status Alert', formula: '=IF(J2<=0, "Out of Stock", IF(J2<=L2, "Low Stock", "In Stock"))' },
      ],
    },
    {
      tab: '08_Labour_Attendance',
      title: 'Labour & Overtime Calculations',
      color: 'bg-red-950 border-red-800 text-red-200',
      purpose: 'Daily attendance with regular base wage and overtime calculation.',
      formulas: [
        { label: 'Calculated Labour Cost', formula: '=IF(G2="Present", I2+(H2*J2), IF(G2="Half Day", (I2/2)+(H2*J2), 0))' },
        { label: 'Outstanding Salary Due', formula: '=K2-L2' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN' ? 'Google Sheets Architecture & Formula Manual' : 'গুগল শিট আর্কিটেকচার ও ফর্মুলা গাইড'}
            </h2>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
              Complete Structure
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Complete cell-by-cell formula guide, data validation ranges, and automated Google Apps Script deployment'
              : '১৪টি শিটের ফর্মুলা রেফারেন্স, ড্রপডাউন ডাটা ভ্যালিডেশন এবং অ্যাপস স্ক্রিপ্ট ইনস্টলেশন নির্দেশিকা'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAppsScriptModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
          >
            <Terminal className="w-4 h-4" />
            <span>{language === 'EN' ? 'View Apps Script (Code.gs)' : 'অ্যাপস স্ক্রিপ্ট কোড দেখুন'}</span>
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'EN' ? 'Download .xlsx Workbook' : 'শিট ডাউনলোড (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* 3-Minute Quick Setup Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-500/15 border border-amber-500/30 rounded-2xl p-5 text-xs text-slate-300 space-y-3">
        <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{language === 'EN' ? 'How to launch your Google Sheets system in 3 steps:' : 'কীভাবে ৩ ধাপে গুগল শিটে চালু করবেন:'}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400 text-xs block mb-1">
              {language === 'EN' ? 'Method 1 (Instant): Download .xlsx' : 'পদ্ধতি ১ (তাত্ক্ষণিক): এক্সেল ডাউনলোড'}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'EN'
                ? 'Click "Download .xlsx Workbook" above. Open Google Drive (drive.google.com), upload the file, and click "Open with Google Sheets". All 14 sheets and tables will be ready!'
                : 'উপরে "শিট ডাউনলোড (.xlsx)" বাটনে ক্লিক করুন। ফাইলটি গুগল ড্রাইভে আপলোড করে "Open with Google Sheets" করুন।'}
            </p>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-indigo-400 text-xs block mb-1">
              {language === 'EN' ? 'Method 2: Google Apps Script (Auto)' : 'পদ্ধতি ২: অ্যাপস স্ক্রিপ্ট (স্বয়ংক্রিয়)'}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'EN'
                ? 'Open a new sheet (sheets.new) > Extensions > Apps Script. Paste our Code.gs and run setupInteriorCraftWorkbook(). It creates all tabs, formats, colors, and menus in 5 seconds!'
                : 'sheets.new এ যান > Extensions > Apps Script-এ কোড পেস্ট করে Run করুন। ৫ সেকেন্ডে পুরো সিস্টেম তৈরি হয়ে যাবে!'}
            </p>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-emerald-400 text-xs block mb-1">
              {language === 'EN' ? 'Protection & Permissions' : 'শিট প্রটেকশন ও নিরাপত্তা'}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'EN'
                ? 'Protect Formula columns (highlighted in grey) by right clicking > Protect Range. Allow your site supervisors to only edit Quantity and Attendance columns.'
                : 'ফর্মুলা সেলগুলো প্রটেক্ট করে রাখুন যাতে কেউ ভুলে মুছে না ফেলে। সাইট কর্মীদের শুধুমাত্র হাজিরা ও পরিমাণ এন্ট্রির অনুমতি দিন।'}
            </p>
          </div>
        </div>
      </div>

      {/* Sheets Breakdown Cards with Real Formulas */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span>{language === 'EN' ? 'Exact Formula Blueprint by Sheet' : 'শিটভিত্তিক ফর্মুলা ব্লুপ্রিন্ট ও রেফারেন্স'}</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sheetsArchitecture.map((s, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded">
                    {s.tab}
                  </span>
                  <h4 className="font-bold text-white text-sm">{s.title}</h4>
                </div>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                {s.purpose}
              </p>

              <div className="space-y-2 pt-1">
                <span className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 block">
                  Key Dynamic Formulas:
                </span>
                {s.formulas.map((f, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-2 rounded-lg bg-slate-850 border border-slate-750 flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <span className="text-slate-300 block text-[11px] font-semibold">{f.label}</span>
                      <code className="text-amber-300 font-mono text-[10px] truncate block select-all">
                        {f.formula}
                      </code>
                    </div>
                    <button
                      onClick={() => copyFormula(f.formula)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition"
                      title="Copy formula"
                    >
                      {copiedFormula === f.formula ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
