/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  CalendarCheck,
  Search,
  Edit2,
  Trash2,
  Wallet,
} from 'lucide-react';
import { Worker, LabourAttendance, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';

interface LabourViewProps {
  workers: Worker[];
  attendance: LabourAttendance[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onAddWorker: () => void;
  onLogAttendance: () => void;
  onLogAttendanceForWorker?: (worker: Worker) => void;
  onEditWorker: (worker: Worker) => void;
  onDeleteWorker: (worker: Worker) => void;
  onEditAttendance?: (record: LabourAttendance) => void;
  onDeleteAttendance?: (recordId: string) => void;
  onImportWorkers?: (records: Worker[]) => void;
}

export const LabourView: React.FC<LabourViewProps> = ({
  workers,
  attendance,
  settings,
  language,
  onAddWorker,
  onLogAttendance,
  onLogAttendanceForWorker,
  onEditWorker,
  onDeleteWorker,
  onEditAttendance,
  onDeleteAttendance,
  onImportWorkers,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'workers'>('attendance');
  const [searchTerm, setSearchTerm] = useState('');

  const totalLabourCost = attendance.reduce((s, a) => s + a.labourCost, 0);
  const totalPaid = attendance.reduce((s, a) => s + a.amountPaid, 0);
  const totalUnpaid = Math.max(0, totalLabourCost - totalPaid);

  const filteredAttendance = attendance.filter(
    (att) =>
      att.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.skillTrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.notes && att.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.skillTrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.paymentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute cumulative running stats per Board Rate log (oldest to newest per worker + project)
  // so every log row displays its own added boards, its own bill, its own payment, AND the running total!
  const boardRunningMeta = new Map<
    string,
    {
      cumBoards: number;
      cumBill: number;
      cumPaid: number;
      runningDue: number;
      isMultiEntry: boolean;
    }
  >();

  const boardGroups = new Map<string, LabourAttendance[]>();
  for (const att of attendance) {
    if (att.paymentMode === 'Board Rate') {
      const key = `${att.workerId}__${att.projectId}`;
      if (!boardGroups.has(key)) {
        boardGroups.set(key, []);
      }
      boardGroups.get(key)!.push(att);
    }
  }

  boardGroups.forEach((groupLogs) => {
    // groupLogs is newest-first; reverse to process oldest-first
    const chronological = [...groupLogs].reverse();
    let cumBoards = 0;
    let cumBill = 0;
    let cumPaid = 0;
    for (const log of chronological) {
      cumBoards += Number(log.boardCount || 0);
      cumBill += Number(log.labourCost || 0);
      cumPaid += Number(log.amountPaid || 0);
      boardRunningMeta.set(log.id, {
        cumBoards,
        cumBill,
        cumPaid,
        runningDue: Math.max(0, cumBill - cumPaid),
        isMultiEntry: chronological.length > 1,
      });
    }
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN'
                ? 'Labour, Craftsman & Contract Payment Logs'
                : 'মিস্ত্রি, কারিগর ও পেমেন্ট ব্যবস্থাপনা'}
            </h2>
            <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-mono">
              08_Labour_Attendance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Daily wages, monthly salaries, contracts, and cumulative project board calculations'
              : 'দৈনিক মজুরি, মাসিক বেতন, চুক্তি ও প্রজেক্ট অনুযায়ী ক্রমযোজিত বোর্ড হিসাব'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onImportWorkers && (
            <CategoryImportButton
              category="workers"
              language={language}
              existingIds={workers.map((w) => w.id)}
              onImportRecords={onImportWorkers}
            />
          )}
          <button
            onClick={onLogAttendance}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>
              {language === 'EN'
                ? 'Log Attendance / Payment'
                : 'হাজিরা ও পেমেন্ট এন্ট্রি'}
            </span>
          </button>
          <button
            onClick={onAddWorker}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'EN' ? 'Register Craftsman' : 'নতুন কারিগর যুক্ত'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Bill' : 'মোট বিল (লেবার ও চুক্তি)'}
          </span>
          <span className="text-lg font-bold font-mono text-white">
            {formatCurrency(totalLabourCost, settings.currencySymbol)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Paid' : 'মোট পেমেন্ট'}
          </span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {formatCurrency(totalPaid, settings.currencySymbol)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Due' : 'মোট বকেয়া'}
          </span>
          <span className="text-lg font-bold font-mono text-rose-400">
            {formatCurrency(totalUnpaid, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📋{' '}
            {language === 'EN'
              ? `Attendance & Payment Logs (${attendance.length})`
              : `হাজিরা ও পেমেন্ট লগ (${attendance.length})`}
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'workers'
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            👷{' '}
            {language === 'EN'
              ? `Craftsmen Directory (${workers.length})`
              : `মিস্ত্রি ও কারিগর তালিকা (${workers.length})`}
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
                ? 'Search worker, project, trade...'
                : 'মিস্ত্রির নাম, প্রজেক্ট বা কাজ খুঁজুন...'
            }
            className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 w-full sm:w-64"
          />
        </div>
      </div>

      {activeTab === 'attendance' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Date & ID</th>
                  <th className="py-3 px-3">Worker</th>
                  <th className="py-3 px-3">Skill / Mode</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Status & Notes</th>
                  <th className="py-3 px-3 text-right">
                    {language === 'EN' ? 'Rate' : 'রেট'}
                  </th>
                  <th className="py-3 px-3 text-right">
                    {language === 'EN' ? 'Board / OT' : 'বোর্ড / OT'}
                  </th>
                  <th className="py-3 px-3 text-right">
                    {language === 'EN' ? 'Total Bill' : 'মোট বিল'}
                  </th>
                  <th className="py-3 px-3 text-right text-emerald-400">
                    {language === 'EN' ? 'Paid' : 'পেমেন্ট'}
                  </th>
                  <th className="py-3 px-3 text-right">
                    {language === 'EN' ? 'Due' : 'বকেয়া'}
                  </th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAttendance.map((att) => {
                  const workerObj = workers.find((w) => w.id === att.workerId);
                  const mode = att.paymentMode || workerObj?.paymentType || 'Daily Wage';
                  const isBoardMode = mode === 'Board Rate';
                  const bMeta = isBoardMode ? boardRunningMeta.get(att.id) : undefined;

                  return (
                    <tr key={att.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-white block">
                          {formatDate(att.attendanceDate)}
                        </span>
                        <span className="font-mono text-[10px] text-red-400">{att.id}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">{att.workerName}</td>
                      <td className="py-3 px-3">
                        <div className="text-slate-200">{att.skillTrade}</div>
                        <span
                          className={`text-[10px] font-semibold ${
                            mode === 'Board Rate'
                              ? 'text-purple-400'
                              : mode === 'Contract Based'
                              ? 'text-teal-400'
                              : mode === 'Monthly Salary'
                              ? 'text-indigo-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {mode === 'Board Rate'
                            ? language === 'EN'
                              ? '🪵 Board Rate'
                              : '🪵 বোর্ড হিসেবে'
                            : mode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{att.projectName}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            att.status === 'Present'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : att.status === 'Half Day'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {att.status}
                        </span>
                        {att.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] truncate">
                            {att.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {mode === 'Board Rate'
                          ? `${formatCurrency(
                              att.boardRate || att.baseRate,
                              settings.currencySymbol
                            )} / বোর্ড`
                          : formatCurrency(att.baseRate, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {mode === 'Board Rate' ? (
                          <div>
                            <span className="font-bold text-purple-300">
                              {Number(att.boardCount || 0) > 0
                                ? `+${att.boardCount} বোর্ড`
                                : '০ বোর্ড (কিস্তি)'}
                            </span>
                            {bMeta && bMeta.isMultiEntry && (
                              <span className="text-[10px] text-slate-400 block">
                                মোট: {bMeta.cumBoards} বোর্ড
                              </span>
                            )}
                          </div>
                        ) : att.overtimeHours > 0 ? (
                          `${att.overtimeHours} hrs`
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                        <div>{formatCurrency(att.labourCost, settings.currencySymbol)}</div>
                        {bMeta && bMeta.isMultiEntry && (
                          <span className="text-[10px] text-slate-400 font-normal block">
                            মোট বিল: {formatCurrency(bMeta.cumBill, settings.currencySymbol)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                        <div>{formatCurrency(att.amountPaid, settings.currencySymbol)}</div>
                        {bMeta && bMeta.isMultiEntry && (
                          <span className="text-[10px] text-sky-300 font-normal block">
                            মোট পেমেন্ট: {formatCurrency(bMeta.cumPaid, settings.currencySymbol)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                        {formatCurrency(
                          bMeta ? bMeta.runningDue : att.outstandingSalary,
                          settings.currencySymbol
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {onEditAttendance && (
                            <button
                              onClick={() => onEditAttendance(att)}
                              title={language === 'EN' ? 'Edit Log' : 'লগ এডিট করুন'}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteAttendance && (
                            <button
                              onClick={() => onDeleteAttendance(att.id)}
                              title={language === 'EN' ? 'Delete Log' : 'লগ মুছে ফেলুন'}
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                  <th className="py-3 px-3">Worker ID & Name</th>
                  <th className="py-3 px-3">Skill / Trade</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Structure</th>
                  <th className="py-3 px-3 text-right">
                    {language === 'EN' ? 'Rate / Bill' : 'রেট / মোট বিল'}
                  </th>
                  <th className="py-3 px-3 text-right text-emerald-400">
                    {language === 'EN' ? 'Total Paid' : 'মোট পেমেন্ট'}
                  </th>
                  <th className="py-3 px-3 text-right text-rose-400">
                    {language === 'EN' ? 'Due' : 'বকেয়া'}
                  </th>
                  <th className="py-3 px-3">Assigned Site</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredWorkers.map((w) => {
                  const workerLogs = attendance.filter((a) => a.workerId === w.id);
                  const logsEarned = workerLogs.reduce((s, a) => s + a.labourCost, 0);
                  const logsPaid = workerLogs.reduce((s, a) => s + a.amountPaid, 0);
                  const displayEarned =
                    workerLogs.length > 0 ? logsEarned : w.totalEarned || 0;
                  const displayPaid =
                    workerLogs.length > 0 ? logsPaid : w.totalPaid || 0;
                  const displayDue = Math.max(0, displayEarned - displayPaid);

                  // Per-project cumulative board summary for Board Rate workers
                  const projectBoardBreakdown: {
                    projectId: string;
                    projectName: string;
                    boards: number;
                    bill: number;
                    paid: number;
                    due: number;
                  }[] = [];

                  if (w.paymentType === 'Board Rate') {
                    const seenProj = new Set<string>();
                    for (const log of workerLogs) {
                      if (log.paymentMode === 'Board Rate' && !seenProj.has(log.projectId)) {
                        seenProj.add(log.projectId);
                        const projLogs = workerLogs.filter(
                          (l) => l.projectId === log.projectId && l.paymentMode === 'Board Rate'
                        );
                        const boards = projLogs.reduce(
                          (s, l) => s + (Number(l.boardCount) || 0),
                          0
                        );
                        const bill = projLogs.reduce(
                          (s, l) => s + (Number(l.labourCost) || 0),
                          0
                        );
                        const paid = projLogs.reduce(
                          (s, l) => s + (Number(l.amountPaid) || 0),
                          0
                        );
                        projectBoardBreakdown.push({
                          projectId: log.projectId,
                          projectName: log.projectName,
                          boards,
                          bill,
                          paid,
                          due: Math.max(0, bill - paid),
                        });
                      }
                    }
                  }

                  return (
                    <tr key={w.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">{w.name}</div>
                        <span className="font-mono text-[10px] text-amber-400 font-semibold">
                          {w.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-medium">{w.skillTrade}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-400">{w.phone}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            w.paymentType === 'Daily Wage'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : w.paymentType === 'Monthly Salary'
                              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              : w.paymentType === 'Board Rate'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                          }`}
                        >
                          {w.paymentType === 'Daily Wage'
                            ? language === 'EN'
                              ? 'Daily Wage'
                              : 'দৈনিক (Daily)'
                            : w.paymentType === 'Monthly Salary'
                            ? language === 'EN'
                              ? 'Monthly Salary'
                              : 'মাসিক (Monthly)'
                            : w.paymentType === 'Board Rate'
                            ? language === 'EN'
                              ? 'Board Rate'
                              : 'বোর্ড হিসেবে (Board)'
                            : language === 'EN'
                            ? 'Contract Based'
                            : 'চুক্তি (Contract)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                        <div>
                          {w.paymentType === 'Daily Wage'
                            ? `${formatCurrency(w.dailyRate, settings.currencySymbol)} / দিন`
                            : w.paymentType === 'Monthly Salary'
                            ? `${formatCurrency(w.monthlySalary, settings.currencySymbol)} / মাস`
                            : w.paymentType === 'Board Rate'
                            ? `${formatCurrency(
                                w.boardRate || w.dailyRate,
                                settings.currencySymbol
                              )} / বোর্ড`
                            : `${formatCurrency(
                                w.monthlySalary || displayEarned || displayPaid,
                                settings.currencySymbol
                              )} (চুক্তি)`}
                        </div>
                        {w.paymentType === 'Board Rate' && displayEarned > 0 && (
                          <div className="text-[10px] text-amber-300 font-normal">
                            {language === 'EN'
                              ? `Total Bill: ${formatCurrency(displayEarned, settings.currencySymbol)}`
                              : `মোট বিল: ${formatCurrency(displayEarned, settings.currencySymbol)}`}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(displayPaid, settings.currencySymbol)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-400">
                        {formatCurrency(displayDue, settings.currencySymbol)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {projectBoardBreakdown.length > 0 ? (
                          <div className="space-y-1">
                            {projectBoardBreakdown.map((pb) => (
                              <div
                                key={pb.projectId}
                                className="text-[10px] bg-slate-950/80 border border-slate-800 rounded px-2 py-1 font-mono"
                              >
                                <span className="text-purple-300 font-semibold">
                                  {pb.projectName}:
                                </span>{' '}
                                <span className="text-amber-300">মোট {pb.boards} বোর্ড</span> |{' '}
                                <span className="text-emerald-300">
                                  বিল ৳{pb.bill.toLocaleString()}
                                </span>{' '}
                                |{' '}
                                <span className="text-rose-400">
                                  বকেয়া ৳{pb.due.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          w.assignedProject || 'Floating'
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              onLogAttendanceForWorker
                                ? onLogAttendanceForWorker(w)
                                : onLogAttendance()
                            }
                            title={
                              language === 'EN'
                                ? 'Log Attendance / Payment'
                                : 'হাজিরা বা পেমেন্ট এন্ট্রি'
                            }
                            className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 transition cursor-pointer"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditWorker(w)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteWorker(w)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer"
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
      )}
    </div>
  );
};
