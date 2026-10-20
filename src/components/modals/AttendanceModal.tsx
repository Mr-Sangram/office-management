/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, CalendarCheck, Save, Wallet, Layers } from 'lucide-react';
import { LabourAttendance, Worker, Project } from '../../types';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attendance: LabourAttendance) => void;
  editingAttendance?: LabourAttendance | null;
  preselectedWorkerId?: string | null;
  attendance?: LabourAttendance[];
  workers: Worker[];
  projects: Project[];
  nextId: string;
  language: 'EN' | 'BN';
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAttendance,
  preselectedWorkerId,
  attendance = [],
  workers,
  projects,
  nextId,
  language,
}) => {
  const [entryMode, setEntryMode] = useState<
    'Daily Wage' | 'Monthly Salary' | 'Contract Based' | 'Board Rate'
  >('Daily Wage');

  const [formData, setFormData] = useState<Partial<LabourAttendance>>({
    id: nextId,
    attendanceDate: new Date().toISOString().split('T')[0],
    workerId: workers[0]?.id || '',
    workerName: workers[0]?.name || '',
    skillTrade: workers[0]?.skillTrade || '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.projectName || '',
    status: 'Present',
    paymentMode: 'Daily Wage',
    boardRate: 500,
    boardCount: 0,
    overtimeHours: 0,
    overtimeRate: 150,
    baseRate: workers[0]?.dailyRate || 1200,
    labourCost: workers[0]?.dailyRate || 1200,
    amountPaid: workers[0]?.dailyRate || 1200,
    outstandingSalary: 0,
    notes: '',
  });

  // Additive Project-specific Board history helper (works separately per worker + project)
  // Computes total boards, total bill, total paid, and remaining due across prior entries for this project
  const getProjectBoardStats = (wId: string, pId: string, excludeId?: string) => {
    const allMatchingLogs = attendance.filter(
      (a) =>
        a.workerId === wId &&
        a.projectId === pId &&
        (a.paymentMode === 'Board Rate' || (a.boardCount !== undefined && a.boardCount > 0))
    );

    // If editing an existing log, only count logs that occurred BEFORE (older than) the edited log
    let priorLogs = allMatchingLogs;
    if (excludeId) {
      const idx = allMatchingLogs.findIndex((a) => a.id === excludeId);
      if (idx !== -1) {
        priorLogs = allMatchingLogs.slice(idx + 1); // logs array is newest-first
      } else {
        priorLogs = allMatchingLogs.filter((a) => a.id !== excludeId);
      }
    }

    const latestPriorLog = priorLogs[0];
    const prevBoardCount = priorLogs.reduce(
      (sum, l) => sum + (Number(l.boardCount) || 0),
      0
    );
    const prevBoardRate = Number(
      latestPriorLog?.boardRate || latestPriorLog?.baseRate || 0
    );
    const prevBillTotal = priorLogs.reduce((sum, l) => {
      const lBill =
        Number(l.labourCost) > 0
          ? Number(l.labourCost)
          : Math.round(Number(l.boardCount || 0) * Number(l.boardRate || l.baseRate || 0));
      return sum + lBill;
    }, 0);
    const prevPaidTotal = priorLogs.reduce(
      (sum, l) => sum + (Number(l.amountPaid) || 0),
      0
    );
    const prevDue = Math.max(0, prevBillTotal - prevPaidTotal);

    return {
      hasHistory: priorLogs.length > 0,
      prevBoardCount,
      prevBoardRate,
      prevBillTotal,
      prevPaidTotal,
      prevDue,
      logCount: priorLogs.length,
    };
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editingAttendance) {
      const w = workers.find((x) => x.id === editingAttendance.workerId);
      const mode =
        editingAttendance.paymentMode || w?.paymentType || 'Daily Wage';
      setEntryMode(mode);

      const stats = getProjectBoardStats(
        editingAttendance.workerId,
        editingAttendance.projectId,
        editingAttendance.id
      );
      const bRate =
        editingAttendance.boardRate ??
        (mode === 'Board Rate'
          ? editingAttendance.baseRate
          : w?.boardRate || w?.dailyRate || 500);
      const bCount = Number(editingAttendance.boardCount || 0);
      const bill =
        mode === 'Board Rate'
          ? Math.round(bRate * bCount)
          : Number(editingAttendance.labourCost || 0);
      const paid = Number(editingAttendance.amountPaid || 0);
      const due =
        mode === 'Board Rate'
          ? Math.max(0, stats.prevDue + bill - paid)
          : Math.max(0, bill - paid);

      setFormData({
        ...editingAttendance,
        paymentMode: mode,
        boardRate: bRate,
        boardCount: bCount,
        labourCost: bill,
        outstandingSalary: due,
      });
    } else {
      const targetWorker =
        (preselectedWorkerId && workers.find((w) => w.id === preselectedWorkerId)) ||
        workers[0];
      const mode = targetWorker?.paymentType || 'Daily Wage';
      setEntryMode(mode);

      const assignedProj =
        projects.find(
          (p) =>
            p.id === targetWorker?.assignedProject ||
            p.projectName === targetWorker?.assignedProject
        ) || projects[0];

      const wId = targetWorker?.id || '';
      const pId = assignedProj?.id || '';
      const stats = getProjectBoardStats(wId, pId);

      const bRate =
        stats.hasHistory && stats.prevBoardRate > 0
          ? stats.prevBoardRate
          : targetWorker?.boardRate || targetWorker?.dailyRate || 500;

      const workerHasAnyLogs = attendance.some((a) => a.workerId === wId);
      // If project already has boards logged, default new added boards to 0 so user can either add new boards OR pay previous due
      const bCount = stats.hasHistory
        ? 0
        : !workerHasAnyLogs && targetWorker?.totalBoards && targetWorker.totalBoards > 0
        ? targetWorker.totalBoards
        : 0;

      const defaultRate =
        mode === 'Daily Wage'
          ? targetWorker?.dailyRate || 1200
          : mode === 'Monthly Salary'
          ? Math.round((targetWorker?.monthlySalary || 0) / 30)
          : mode === 'Board Rate'
          ? bRate
          : targetWorker?.monthlySalary || 0;

      const defaultCost =
        mode === 'Board Rate'
          ? Math.round(bRate * bCount)
          : mode === 'Contract Based'
          ? targetWorker?.outstandingSalary || targetWorker?.monthlySalary || 0
          : defaultRate;

      const defaultPaid =
        mode === 'Contract Based' || mode === 'Board Rate' ? 0 : defaultCost;

      const defaultDue =
        mode === 'Board Rate'
          ? Math.max(0, stats.prevDue + defaultCost - defaultPaid)
          : Math.max(0, defaultCost - defaultPaid);

      setFormData({
        id: nextId,
        attendanceDate: new Date().toISOString().split('T')[0],
        workerId: wId,
        workerName: targetWorker?.name || '',
        skillTrade: targetWorker?.skillTrade || '',
        projectId: pId,
        projectName: assignedProj?.projectName || '',
        status: 'Present',
        paymentMode: mode,
        boardRate: bRate,
        boardCount: bCount,
        overtimeHours: 0,
        overtimeRate: 150,
        baseRate: defaultRate,
        labourCost: defaultCost,
        amountPaid: defaultPaid,
        outstandingSalary: defaultDue,
        notes: '',
      });
    }
  }, [editingAttendance, preselectedWorkerId, workers, projects, nextId, isOpen]);

  if (!isOpen) return null;

  const boardStats = getProjectBoardStats(
    formData.workerId || '',
    formData.projectId || '',
    editingAttendance?.id
  );

  const calculateCost = (
    status: 'Present' | 'Absent' | 'Half Day',
    base: number,
    otHours: number,
    otRate: number
  ) => {
    let baseComp = 0;
    if (status === 'Present') baseComp = base;
    else if (status === 'Half Day') baseComp = base / 2;
    const otComp = otHours * otRate;
    return baseComp + otComp;
  };

  const handleModeSwitch = (
    mode: 'Daily Wage' | 'Monthly Salary' | 'Contract Based' | 'Board Rate'
  ) => {
    setEntryMode(mode);
    const worker = workers.find((w) => w.id === formData.workerId);
    const stats = getProjectBoardStats(
      formData.workerId || '',
      formData.projectId || '',
      editingAttendance?.id
    );

    if (mode === 'Board Rate') {
      const bRate =
        stats.hasHistory && stats.prevBoardRate > 0
          ? stats.prevBoardRate
          : Number(formData.boardRate || worker?.boardRate || worker?.dailyRate || 500);
      const bCount = Number(formData.boardCount || 0);
      const bill = Math.round(bRate * bCount);
      const paid = Number(formData.amountPaid || 0);
      setFormData({
        ...formData,
        paymentMode: mode,
        boardRate: bRate,
        boardCount: bCount,
        baseRate: bRate,
        labourCost: bill,
        outstandingSalary: Math.max(0, stats.prevDue + bill - paid),
      });
    } else if (mode === 'Contract Based') {
      const bill = Number(
        formData.labourCost || worker?.outstandingSalary || worker?.monthlySalary || 0
      );
      const paid = Number(formData.amountPaid || 0);
      setFormData({
        ...formData,
        paymentMode: mode,
        baseRate: bill,
        labourCost: bill,
        outstandingSalary: Math.max(0, bill - paid),
      });
    } else {
      const base =
        mode === 'Daily Wage'
          ? worker?.dailyRate || Number(formData.baseRate || 1200)
          : Math.round((worker?.monthlySalary || 30000) / 30);
      const cost = calculateCost(
        (formData.status as any) || 'Present',
        base,
        Number(formData.overtimeHours || 0),
        Number(formData.overtimeRate || 150)
      );
      const paid = Number(formData.amountPaid || 0);
      setFormData({
        ...formData,
        paymentMode: mode,
        baseRate: base,
        labourCost: cost,
        outstandingSalary: Math.max(0, cost - paid),
      });
    }
  };

  const handleWorkerChange = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (worker) {
      const mode = worker.paymentType;
      setEntryMode(mode);
      const isContract = mode === 'Contract Based';
      const isBoard = mode === 'Board Rate';

      const assignedProj =
        projects.find(
          (p) => p.id === worker.assignedProject || p.projectName === worker.assignedProject
        ) ||
        projects.find((p) => p.id === formData.projectId) ||
        projects[0];

      const pId = assignedProj?.id || formData.projectId || '';
      const stats = getProjectBoardStats(worker.id, pId, editingAttendance?.id);

      const bRate =
        stats.hasHistory && stats.prevBoardRate > 0
          ? stats.prevBoardRate
          : worker.boardRate || worker.dailyRate || 500;

      const workerHasAnyLogs = attendance.some((a) => a.workerId === worker.id);
      const bCount = stats.hasHistory
        ? 0
        : !workerHasAnyLogs && worker.totalBoards && worker.totalBoards > 0
        ? worker.totalBoards
        : 0;

      const base =
        mode === 'Daily Wage'
          ? worker.dailyRate
          : mode === 'Monthly Salary'
          ? Math.round(worker.monthlySalary / 30)
          : isBoard
          ? bRate
          : worker.monthlySalary || 0;

      const otHours = isContract || isBoard ? 0 : Number(formData.overtimeHours || 0);
      const otRate = Number(formData.overtimeRate || 150);

      const cost = isBoard
        ? Math.round(bRate * bCount)
        : isContract
        ? worker.outstandingSalary || worker.monthlySalary || 0
        : calculateCost(formData.status as any, base, otHours, otRate);

      const paid = isContract || isBoard ? 0 : cost;
      const due = isBoard
        ? Math.max(0, stats.prevDue + cost - paid)
        : Math.max(0, cost - paid);

      setFormData({
        ...formData,
        workerId: worker.id,
        workerName: worker.name,
        skillTrade: worker.skillTrade,
        projectId: pId,
        projectName: assignedProj?.projectName || formData.projectName || '',
        paymentMode: mode,
        boardRate: bRate,
        boardCount: bCount,
        baseRate: base,
        labourCost: cost,
        amountPaid: paid,
        outstandingSalary: due,
      });
    }
  };

  const handleProjectChange = (newProjectId: string) => {
    const p = projects.find((proj) => proj.id === newProjectId);
    const wId = formData.workerId || '';
    const worker = workers.find((w) => w.id === wId);

    if (entryMode === 'Board Rate') {
      const stats = getProjectBoardStats(wId, newProjectId, editingAttendance?.id);
      const bRate =
        stats.hasHistory && stats.prevBoardRate > 0
          ? stats.prevBoardRate
          : Number(formData.boardRate || worker?.boardRate || worker?.dailyRate || 500);
      const bCount = 0;
      const cost = Math.round(bRate * bCount);
      const paid = Number(formData.amountPaid || 0);
      const due = Math.max(0, stats.prevDue + cost - paid);

      setFormData({
        ...formData,
        projectId: newProjectId,
        projectName: p ? p.projectName : '',
        boardRate: bRate,
        boardCount: bCount,
        baseRate: bRate,
        labourCost: cost,
        outstandingSalary: due,
      });
    } else {
      setFormData({
        ...formData,
        projectId: newProjectId,
        projectName: p ? p.projectName : '',
      });
    }
  };

  const handleStatusChange = (status: 'Present' | 'Absent' | 'Half Day') => {
    if (entryMode === 'Contract Based' || entryMode === 'Board Rate') {
      setFormData({ ...formData, status });
      return;
    }
    const base = Number(formData.baseRate || 0);
    const otHours = Number(formData.overtimeHours || 0);
    const otRate = Number(formData.overtimeRate || 0);
    const cost = calculateCost(status, base, otHours, otRate);
    const paid = Number(formData.amountPaid || 0);

    setFormData({
      ...formData,
      status,
      labourCost: cost,
      outstandingSalary: Math.max(0, cost - paid),
    });
  };

  const handleOtChange = (hours: number, rate: number) => {
    const base = Number(formData.baseRate || 0);
    const status = formData.status as any;
    const cost = calculateCost(status, base, hours, rate);
    const paid = Number(formData.amountPaid || 0);

    setFormData({
      ...formData,
      overtimeHours: hours,
      overtimeRate: rate,
      labourCost: cost,
      outstandingSalary: Math.max(0, cost - paid),
    });
  };

  const handleBoardChange = (newRate: number, newAddedCount: number) => {
    const newBoardBill = Math.round(newRate * newAddedCount);
    const paid = Number(formData.amountPaid || 0);
    const due = Math.max(0, boardStats.prevDue + newBoardBill - paid);
    setFormData({
      ...formData,
      boardRate: newRate,
      boardCount: newAddedCount,
      baseRate: newRate,
      labourCost: newBoardBill,
      outstandingSalary: due,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId || !formData.projectId) return;

    const worker = workers.find((w) => w.id === formData.workerId);
    const project = projects.find((p) => p.id === formData.projectId);
    const paid = Number(formData.amountPaid || 0);
    const bRate = Number(formData.boardRate || 0);
    const bCount = Number(formData.boardCount || 0);

    const cost =
      entryMode === 'Board Rate'
        ? bCount > 0
          ? Math.round(bRate * bCount)
          : Number(formData.labourCost || 0)
        : Number(formData.labourCost || 0) > 0
        ? Number(formData.labourCost || 0)
        : paid;

    const due =
      entryMode === 'Board Rate'
        ? Math.max(0, boardStats.prevDue + cost - paid)
        : Math.max(0, cost - paid);

    const totalProjectBoards = boardStats.prevBoardCount + bCount;

    const defaultNote =
      entryMode === 'Board Rate'
        ? boardStats.hasHistory
          ? bCount > 0
            ? `নতুন বোর্ড: +${bCount} টি (মোট ${totalProjectBoards} টি) | নতুন বিল: ৳${cost} | আগের বকেয়া: ৳${boardStats.prevDue} | পেমেন্ট: ৳${paid} | বকেয়া: ৳${due}`
            : `বকেয়া কিস্তি পেমেন্ট (মোট বোর্ড: ${totalProjectBoards} টি) | আগের বকেয়া: ৳${boardStats.prevDue} | পেমেন্ট: ৳${paid} | বকেয়া: ৳${due}`
          : `বোর্ড: ${bCount} টি × ৳${bRate} = ৳${cost} | পেমেন্ট: ৳${paid} | বকেয়া: ৳${due}`
        : entryMode === 'Contract Based'
        ? 'Contract Payment / Installment'
        : '';

    const record: LabourAttendance = {
      id: formData.id || nextId,
      attendanceDate: formData.attendanceDate || new Date().toISOString().split('T')[0],
      workerId: formData.workerId,
      workerName: worker ? worker.name : formData.workerName || '',
      skillTrade: worker ? worker.skillTrade : formData.skillTrade || '',
      projectId: formData.projectId,
      projectName: project ? project.projectName : formData.projectName || '',
      status: (formData.status as any) || 'Present',
      paymentMode: entryMode,
      boardRate: entryMode === 'Board Rate' ? bRate : undefined,
      boardCount: entryMode === 'Board Rate' ? bCount : undefined,
      overtimeHours: Number(formData.overtimeHours || 0),
      overtimeRate: Number(formData.overtimeRate || 0),
      baseRate:
        entryMode === 'Board Rate'
          ? bRate
          : Number(formData.baseRate || paid || 0),
      labourCost: cost,
      amountPaid: paid,
      outstandingSalary: due,
      notes: formData.notes || defaultNote,
    };

    onSave(record);
    onClose();
  };

  const addedBoards = Number(formData.boardCount || 0);
  const totalBoardsOnProject = boardStats.prevBoardCount + addedBoards;
  const newBoardBillTaka = Math.round(Number(formData.boardRate || 0) * addedBoards);
  const cumulativeProjectBill = boardStats.prevBillTotal + Number(formData.labourCost || 0);
  const currentEntryBill = Number(formData.labourCost || 0);
  const currentPaid = Number(formData.amountPaid || 0);
  const prevDueOnProject = entryMode === 'Board Rate' ? boardStats.prevDue : 0;
  const totalPayableWithPrevDue = prevDueOnProject + currentEntryBill;
  const autoDueRemaining = Math.max(0, totalPayableWithPrevDue - currentPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingAttendance
                  ? language === 'EN'
                    ? 'Edit Attendance & Wage Log'
                    : 'হাজিরা ও মজুরি লগ সম্পাদনা'
                  : language === 'EN'
                  ? 'Daily Attendance & Wage Payment Entry'
                  : 'দৈনিক হাজিরা ও মজুরি প্রদান এন্ট্রি'}
              </h2>
              <span className="text-xs text-red-400 font-mono font-semibold">
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
          {/* Date & Worker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Date *' : 'তারিখ *'}
              </label>
              <input
                type="date"
                required
                value={formData.attendanceDate || ''}
                onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Worker / Craftsman *' : 'মিস্ত্রি / কারিগর *'}
              </label>
              <select
                required
                value={formData.workerId || ''}
                onChange={(e) => handleWorkerChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.skillTrade} - {w.paymentType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Mode Selector inside Log */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Entry Type' : 'এন্ট্রির ধরন'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleModeSwitch('Daily Wage')}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  entryMode === 'Daily Wage'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                📅 Daily (দৈনিক)
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('Monthly Salary')}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  entryMode === 'Monthly Salary'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                💼 Monthly (মাসিক)
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('Contract Based')}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  entryMode === 'Contract Based'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                📜 Contract (চুক্তি)
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('Board Rate')}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  entryMode === 'Board Rate'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                🪵 Board (বোর্ড হিসেবে)
              </button>
            </div>
          </div>

          {/* Project Site */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Project Site *' : 'প্রজেক্ট সাইট *'}
            </label>
            <select
              required
              value={formData.projectId || ''}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Attendance Status */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Status *' : 'হাজিরা স্ট্যাটাস *'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('Present')}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  formData.status === 'Present'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                ✅ Present (উপস্থিত)
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Half Day')}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  formData.status === 'Half Day'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                🌓 Half Day (অর্ধ দিবস)
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Absent')}
                className={`py-2 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  formData.status === 'Absent'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                ❌ Absent (অনুপস্থিত)
              </button>
            </div>
          </div>

          {/* 1. Board Rate Mode: Additive Project Board Calculation */}
          {entryMode === 'Board Rate' && (
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    {language === 'EN'
                      ? 'Project Board Calculation (Cumulative)'
                      : 'বোর্ড হিসাব (আগের বোর্ডের সাথে নতুন বোর্ড ও বকেয়া যোগ)'}
                  </span>
                </div>
              </div>

              {boardStats.hasHistory && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 border border-purple-500/30 p-2.5 rounded-xl text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {language === 'EN' ? 'Prev Boards' : 'আগের বোর্ড'}
                    </span>
                    <span className="font-bold text-purple-300">
                      {boardStats.prevBoardCount} টি
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {language === 'EN' ? 'Prev Bill' : 'আগের মোট বিল'}
                    </span>
                    <span className="font-bold text-amber-300">
                      ৳ {boardStats.prevBillTotal.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {language === 'EN' ? 'Prev Paid' : 'আগের পেমেন্ট'}
                    </span>
                    <span className="font-bold text-emerald-300">
                      ৳ {boardStats.prevPaidTotal.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {language === 'EN' ? 'Prev Due' : 'আগের বকেয়া'}
                    </span>
                    <span className="font-bold text-rose-400">
                      ৳ {boardStats.prevDue.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-purple-300 font-semibold mb-1">
                    {language === 'EN' ? 'Board Rate (৳)' : 'বোর্ড রেট (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.boardRate ?? ''}
                    onChange={(e) =>
                      handleBoardChange(
                        Number(e.target.value),
                        Number(formData.boardCount || 0)
                      )
                    }
                    placeholder="e.g. 500"
                    className="w-full bg-slate-800 border border-purple-500/50 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-amber-300 font-semibold mb-1">
                    {boardStats.hasHistory
                      ? language === 'EN'
                        ? 'New Boards Added'
                        : 'নতুন বোর্ড যোগ'
                      : language === 'EN'
                      ? 'Total Board'
                      : 'মোট বোর্ড'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.boardCount ?? ''}
                    onChange={(e) =>
                      handleBoardChange(
                        Number(formData.boardRate || 0),
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    className="w-full bg-slate-800 border border-amber-500/50 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  {boardStats.hasHistory && (
                    <span className="text-[10px] text-purple-300 font-mono block mt-1">
                      মোট বোর্ড: {boardStats.prevBoardCount} + {addedBoards} ={' '}
                      <strong>{totalBoardsOnProject} টি</strong>
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-emerald-300 font-semibold mb-1">
                    {boardStats.hasHistory
                      ? language === 'EN'
                        ? 'New Board Bill (৳)'
                        : 'নতুন বোর্ড টাকা (৳)'
                      : language === 'EN'
                      ? 'Total Taka (৳)'
                      : 'মোট টাকা (৳)'}
                  </label>
                  <div className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-3 py-2 text-emerald-300 font-mono font-bold text-sm">
                    ৳ {newBoardBillTaka.toLocaleString()}
                  </div>
                  {boardStats.hasHistory && (
                    <span className="text-[10px] text-amber-300 font-mono block mt-1">
                      সর্বমোট বিল: ৳ {cumulativeProjectBill.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. Daily / Monthly Wage Mode: Wage Rate | OT Hours | OT Rate */}
          {(entryMode === 'Daily Wage' || entryMode === 'Monthly Salary') && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  {language === 'EN' ? 'Wage Rate (৳)' : 'আজকের রেট (৳)'}
                </label>
                <input
                  type="number"
                  value={formData.baseRate ?? 0}
                  onChange={(e) => {
                    const base = Number(e.target.value);
                    const cost = calculateCost(
                      formData.status as any,
                      base,
                      Number(formData.overtimeHours || 0),
                      Number(formData.overtimeRate || 0)
                    );
                    const paid = Number(formData.amountPaid || 0);
                    setFormData({
                      ...formData,
                      baseRate: base,
                      labourCost: cost,
                      outstandingSalary: Math.max(0, cost - paid),
                    });
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'EN' ? 'OT Hours' : 'OT (ঘণ্টা)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.overtimeHours || 0}
                  onChange={(e) =>
                    handleOtChange(Number(e.target.value), Number(formData.overtimeRate || 150))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'EN' ? 'OT Rate (৳)' : 'OT রেট (৳)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.overtimeRate || 150}
                  onChange={(e) =>
                    handleOtChange(Number(formData.overtimeHours || 0), Number(e.target.value))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Auto Bill, Payment & Due Summary Box */}
          <div className="p-4 bg-slate-950/90 rounded-xl border border-emerald-500/30 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>
                {language === 'EN'
                  ? '📊 Bill, Payment & Due'
                  : '📊 বিল, পেমেন্ট ও বকেয়া হিসাব'}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {entryMode === 'Board Rate'
                  ? language === 'EN'
                    ? `Total Payable: ৳${totalPayableWithPrevDue.toLocaleString()}`
                    : `মোট পাওনা (আগের বকেয়া + নতুন বিল): ৳${totalPayableWithPrevDue.toLocaleString()}`
                  : 'Auto-Synced'}
              </span>
            </div>

            <div
              className={`grid grid-cols-1 ${
                entryMode === 'Board Rate' && boardStats.hasHistory
                  ? 'sm:grid-cols-4'
                  : 'sm:grid-cols-3'
              } gap-3`}
            >
              {/* 1. Previous Due (if Board Rate has history) */}
              {entryMode === 'Board Rate' && boardStats.hasHistory && (
                <div>
                  <label className="block text-sky-300 font-bold mb-1">
                    {language === 'EN' ? 'Prev Due (৳)' : 'আগের বকেয়া (৳)'}
                  </label>
                  <div className="w-full bg-slate-900 border border-sky-500/40 rounded-lg px-3 py-2 text-sky-300 text-sm font-mono font-bold">
                    ৳ {prevDueOnProject.toLocaleString()}
                  </div>
                </div>
              )}

              {/* 2. New Bill / Total Bill */}
              <div>
                <label className="block text-amber-300 font-bold mb-1">
                  {entryMode === 'Board Rate' && boardStats.hasHistory
                    ? language === 'EN'
                      ? 'New Bill (৳)'
                      : 'নতুন বিল (৳)'
                    : language === 'EN'
                    ? 'Total Bill (৳)'
                    : 'মোট বিল (৳)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.labourCost ?? 0}
                  onChange={(e) => {
                    const cost = Number(e.target.value);
                    const paid = Number(formData.amountPaid || 0);
                    setFormData({
                      ...formData,
                      labourCost: cost,
                      outstandingSalary: Math.max(0, prevDueOnProject + cost - paid),
                    });
                  }}
                  className="w-full bg-slate-800 border border-amber-500/50 rounded-lg px-3 py-2 text-amber-300 text-sm font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 3. Payment Given Today */}
              <div>
                <label className="block text-emerald-300 font-bold mb-1 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{language === 'EN' ? 'Paid (৳)' : 'পেমেন্ট (৳)'}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.amountPaid || ''}
                  onChange={(e) => {
                    const paid = Number(e.target.value);
                    const currentCost = Number(formData.labourCost || 0);
                    const nextCost =
                      entryMode === 'Contract Based' && currentCost === 0
                        ? paid
                        : currentCost;
                    setFormData({
                      ...formData,
                      amountPaid: paid,
                      labourCost: nextCost,
                      outstandingSalary: Math.max(0, prevDueOnProject + nextCost - paid),
                    });
                  }}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-300 text-sm font-mono font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* 4. Remaining Due */}
              <div>
                <label className="block text-rose-300 font-bold mb-1">
                  {language === 'EN' ? 'Total Due (৳)' : 'মোট বকেয়া (৳)'}
                </label>
                <div className="w-full bg-slate-900 border border-rose-500/40 rounded-lg px-3 py-2 text-rose-400 text-sm font-mono font-bold flex items-center justify-between">
                  <span>৳ {autoDueRemaining.toLocaleString()}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300">
                    {autoDueRemaining > 0
                      ? language === 'EN'
                        ? 'Due'
                        : 'বকেয়া'
                      : language === 'EN'
                      ? 'Paid'
                      : 'পরিশোধ'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Notes' : 'কাজের বিবরণ / নোট'}
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={
                language === 'EN'
                  ? 'e.g. 20 boards added / due payment'
                  : 'যেমন: নতুন বোর্ড যোগ বা বকেয়া কিস্তি প্রদান'
              }
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {editingAttendance
                  ? language === 'EN'
                    ? 'Update & Sync'
                    : 'আপডেট করুন'
                  : language === 'EN'
                  ? 'Save & Sync'
                  : 'সেভ করুন'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
