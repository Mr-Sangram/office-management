/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  FileText,
  BadgeDollarSign,
  TrendingUp,
  Download,
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Client, Project, PaymentReceived, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PrintablesViewProps {
  clients: Client[];
  projects: Project[];
  payments: PaymentReceived[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
}

export const PrintablesView: React.FC<PrintablesViewProps> = ({
  clients,
  projects,
  payments,
  settings,
  language,
}) => {
  const [docType, setDocType] = useState<'invoice' | 'receipt' | 'cost_sheet'>('invoice');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(payments[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const activePayment = payments.find((p) => p.id === selectedPaymentId) || payments[0];
  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handlePrint = () => {
    window.print();
  };

  if (clients.length === 0 && projects.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-3 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto text-2xl">
          🔒
        </div>
        <h3 className="text-base font-bold text-white">
          {language === 'EN' ? 'Documents Protected in Client View' : 'ক্লায়েন্ট ভিউতে ইনভয়েস ও ভাউচার গোপন রয়েছে'}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {language === 'EN'
            ? 'Official money receipts, invoices, and quotations contain confidential financial data and cannot be printed or downloaded in Client View.'
            : 'অফিসিয়াল মানি রিসিট, ইনভয়েস ও বিলের মধ্যে ক্লায়েন্টের গোপন লেনদেন থাকে। এগুলো প্রিন্ট বা ডাউনলোড করতে অনুমোদিত পিন দিয়ে লগইন করুন।'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls (Hidden on Print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-sky-400" />
              <span>{language === 'EN' ? 'Printable Document Generator' : 'প্রিন্ট উপযোগী ইনভয়েস ও ভাউচার'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'EN'
                ? 'Generate client quotations, formal invoices, official money receipts, and cost audit sheets'
                : 'ক্লায়েন্ট ইনভয়েস, অফিসিয়াল মানি রিসিট ও প্রজেক্ট খরচের প্রিন্ট ভিউ'}
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'EN' ? 'Print / Save as PDF' : 'প্রিন্ট / পিডিএফ সেভ'}</span>
          </button>
        </div>

        {/* Document Selector Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Document Format</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-800 p-1">
              <button
                onClick={() => setDocType('invoice')}
                className={`flex-1 py-1.5 px-2 rounded-md font-semibold transition ${
                  docType === 'invoice' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                📄 Client Invoice
              </button>
              <button
                onClick={() => setDocType('receipt')}
                className={`flex-1 py-1.5 px-2 rounded-md font-semibold transition ${
                  docType === 'receipt' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                💵 Money Receipt
              </button>
              <button
                onClick={() => setDocType('cost_sheet')}
                className={`flex-1 py-1.5 px-2 rounded-md font-semibold transition ${
                  docType === 'cost_sheet' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                📊 Cost Sheet
              </button>
            </div>
          </div>

          {docType === 'invoice' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none text-xs"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {docType === 'receipt' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Payment Voucher</label>
              <select
                value={selectedPaymentId}
                onChange={(e) => setSelectedPaymentId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none text-xs"
              >
                {payments.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.clientName} ({formatCurrency(p.amountReceived, settings.currencySymbol)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {docType === 'cost_sheet' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none text-xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (Styled for A4 White Paper) */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-8 md:p-12 print-card font-sans">
        {/* Document 1: Formal Client Invoice */}
        {docType === 'invoice' && activeClient && (
          <div className="space-y-6">
            {/* Header Letterhead */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                    {settings.companyName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{settings.tagline}</p>
                <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                  <p>{settings.address}</p>
                  <p>Hotline: {settings.phone} • Email: {settings.email}</p>
                  <p>Web: {settings.website}</p>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 bg-slate-900 text-white rounded">
                  TAX INVOICE / BILL
                </span>
                <div className="mt-3 text-xs space-y-1">
                  <p><strong>Invoice No:</strong> <span className="font-mono">INV-2026-{activeClient.id}</span></p>
                  <p><strong>Date:</strong> {formatDate(new Date().toISOString().split('T')[0])}</p>
                  <p><strong>Contract Date:</strong> {formatDate(activeClient.contractDate)}</p>
                </div>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  BILLED TO CLIENT:
                </span>
                <div className="font-bold text-sm text-slate-900">{activeClient.name}</div>
                <div className="text-slate-600 mt-1 space-y-0.5">
                  <p>Phone: {activeClient.phone}</p>
                  <p>Email: {activeClient.email || 'N/A'}</p>
                  <p>Address: {activeClient.address}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  PROJECT & SCOPE:
                </span>
                <div className="font-bold text-slate-900">{activeClient.projectName}</div>
                <p className="text-slate-600 mt-1">Client Category: {activeClient.clientType}</p>
                <p className="text-slate-500 text-[11px] mt-1 leading-snug">
                  {activeClient.notes}
                </p>
              </div>
            </div>

            {/* Scope / Itemized Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Description of Architectural Services & Fitout</th>
                  <th className="py-2.5 px-2 text-right">Amount ({settings.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-2 font-mono">01</td>
                  <td className="py-3 px-2">
                    <strong className="block text-slate-900 font-semibold">{activeClient.projectName} - Full Turnkey Fitout</strong>
                    <span className="text-[11px] text-slate-600 block">
                      Architectural 2D drawings, 3D walkthrough, false ceiling, bespoke cabinetry, lighting, finishing & handover.
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(activeClient.totalContractAmount, settings.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Financial Summary Box */}
            <div className="flex justify-end pt-4">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Total Contract Value:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(activeClient.totalContractAmount, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700">
                  <span>Less: Advance & Payments Received:</span>
                  <span className="font-mono font-bold">({formatCurrency(activeClient.totalReceived, settings.currencySymbol)})</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-rose-700">
                  <span>TOTAL BALANCE DUE:</span>
                  <span className="font-mono">{formatCurrency(activeClient.totalDue, settings.currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* Payment Bank Details & Signature */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-200 text-xs">
              <div className="space-y-1 text-slate-600">
                <span className="font-bold text-slate-900 block text-[11px] uppercase">Bank Account Details for Wire:</span>
                <p>Bank: Eastern Bank PLC, Gulshan Branch</p>
                <p>Account Name: Studio ArchVista Interior & Decor</p>
                <p>Account No: 104-102-9988221</p>
                <p>Routing No: 090271881</p>
              </div>

              <div className="flex flex-col justify-end items-end text-center">
                <div className="w-48 border-b border-slate-900 pb-1 font-bold text-xs">
                  Authorized Signatory
                </div>
                <span className="text-[10px] text-slate-500 mt-1">{settings.companyName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Document 2: Official Money Receipt (Payment Voucher) */}
        {docType === 'receipt' && activePayment && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-950 uppercase">{settings.companyName}</h3>
                <p className="text-xs text-slate-600">{settings.address} • Tel: {settings.phone}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-800 text-white font-bold text-xs uppercase rounded">
                  MONEY RECEIPT
                </span>
                <div className="text-xs text-slate-500 mt-1 font-mono">Receipt No: {activePayment.id}</div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Received with thanks from:</span>
                <strong className="text-slate-900 font-bold text-sm">{activePayment.clientName}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">On account of Project:</span>
                <strong className="text-slate-900">{activePayment.projectName}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Payment Stage / Installment:</span>
                <span className="text-slate-800 font-semibold">{activePayment.installmentName}</span>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Payment Mode & Trx Reference:</span>
                <span className="font-mono text-slate-900">{activePayment.paymentMethod} ({activePayment.paymentReference})</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-300 rounded-xl">
                <span className="text-sm font-bold text-emerald-950">AMOUNT RECEIVED:</span>
                <span className="text-xl font-black text-emerald-800 font-mono">
                  {formatCurrency(activePayment.amountReceived, settings.currencySymbol)}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Notes: {activePayment.notes || 'Payment confirmed and credited to company corporate bank account.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-12 border-t border-slate-200 text-xs">
              <div className="text-left text-slate-500">
                <p>Received by: <strong>{activePayment.receivedBy}</strong></p>
                <p>Date: {formatDate(activePayment.date)}</p>
              </div>
              <div className="flex flex-col items-end text-center">
                <div className="w-44 border-b border-slate-900 pb-1 font-bold">
                  Accounts Signature
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document 3: Project Cost & Profit Sheet */}
        {docType === 'cost_sheet' && activeProject && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-950 uppercase">{settings.companyName}</h3>
                <h4 className="text-xs font-bold text-slate-600">PROJECT COST AUDIT & PROFITABILITY SHEET</h4>
              </div>
              <span className="font-mono text-xs bg-slate-100 border border-slate-300 px-2.5 py-1 rounded font-bold">
                {activeProject.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p><strong>Project Title:</strong> {activeProject.projectName}</p>
                <p><strong>Client:</strong> {activeProject.clientName}</p>
                <p><strong>Project Manager:</strong> {activeProject.projectManager}</p>
              </div>
              <div>
                <p><strong>Site Location:</strong> {activeProject.siteAddress}</p>
                <p><strong>Status:</strong> {activeProject.projectStatus} ({activeProject.progressPercentage}% done)</p>
                <p><strong>Timeline:</strong> {formatDate(activeProject.startDate)} to {formatDate(activeProject.expectedCompletionDate)}</p>
              </div>
            </div>

            {/* Cost Breakdown Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 font-bold">
                  <th className="py-2 px-2">Cost Center Item</th>
                  <th className="py-2 px-2 text-right">Actual Cost ({settings.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-2">1. Direct Materials Issued to Site</td>
                  <td className="py-2 px-2 text-right font-mono font-semibold">{formatCurrency(activeProject.actualMaterialCost, settings.currencySymbol)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">2. Direct Craftsmen & Labour Wages</td>
                  <td className="py-2 px-2 text-right font-mono font-semibold">{formatCurrency(activeProject.actualLabourCost, settings.currencySymbol)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">3. Specialist Subcontractor Fee</td>
                  <td className="py-2 px-2 text-right font-mono font-semibold">{formatCurrency(activeProject.subcontractorCost, settings.currencySymbol)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">4. Transport, Logistics & Site Travel</td>
                  <td className="py-2 px-2 text-right font-mono font-semibold">{formatCurrency(activeProject.otherDirectCosts, settings.currencySymbol)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2">5. Studio Overhead Allocated</td>
                  <td className="py-2 px-2 text-right font-mono font-semibold">{formatCurrency(activeProject.allocatedOverhead, settings.currencySymbol)}</td>
                </tr>
                <tr className="font-bold bg-slate-100">
                  <td className="py-2 px-2">TOTAL ACTUAL PROJECT COST</td>
                  <td className="py-2 px-2 text-right font-mono text-rose-700">{formatCurrency(activeProject.totalProjectCost, settings.currencySymbol)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2 px-2">TOTAL CONTRACT REVENUE</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-900">{formatCurrency(activeProject.contractValue, settings.currencySymbol)}</td>
                </tr>
                <tr className="font-black bg-emerald-50 text-emerald-950 text-sm">
                  <td className="py-3 px-2">NET PROJECT PROFIT (Margin: {activeProject.profitMargin.toFixed(1)}%)</td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-700">{formatCurrency(activeProject.actualProfit, settings.currencySymbol)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
