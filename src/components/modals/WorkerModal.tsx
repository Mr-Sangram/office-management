/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, HardHat, Save, Wallet, Layers } from 'lucide-react';
import { Worker, CompanySettings, Project } from '../../types';

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (worker: Worker, newlyPaidAmount?: number) => void;
  editingWorker?: Worker | null;
  settings: CompanySettings;
  projects: Project[];
  nextId: string;
  language: 'EN' | 'BN';
}

export const WorkerModal: React.FC<WorkerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingWorker,
  settings,
  projects,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<Worker>>({
    id: nextId,
    name: '',
    phone: '',
    skillTrade: settings.labourTypes[0] || 'Master Carpenter',
    paymentType: 'Daily Wage',
    dailyRate: 1200,
    monthlySalary: 0,
    boardRate: 500,
    totalBoards: 0,
    assignedProject: projects[0]?.id || '',
    totalEarned: 0,
    totalPaid: 0,
    outstandingSalary: 0,
    status: 'Active',
    notes: '',
  });

  // Tracks how much money is being paid right now during registration/edit ("কত টাকা দেওয়া হলো" - optional)
  const [paidNowAmount, setPaidNowAmount] = useState<number>(0);

  useEffect(() => {
    if (editingWorker) {
      setFormData({
        ...editingWorker,
        boardRate: editingWorker.boardRate ?? (editingWorker.paymentType === 'Board Rate' ? editingWorker.dailyRate : 500),
        totalBoards: editingWorker.totalBoards ?? 0,
      });
      setPaidNowAmount(editingWorker.totalPaid || 0);
    } else {
      setFormData({
        id: nextId,
        name: '',
        phone: '',
        skillTrade: settings.labourTypes[0] || 'Master Carpenter',
        paymentType: 'Daily Wage',
        dailyRate: 1200,
        monthlySalary: 0,
        boardRate: 500,
        totalBoards: 0,
        assignedProject: projects[0]?.id || '',
        totalEarned: 0,
        totalPaid: 0,
        outstandingSalary: 0,
        status: 'Active',
        notes: '',
      });
      setPaidNowAmount(0);
    }
  }, [editingWorker, nextId, settings, projects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const isContract = formData.paymentType === 'Contract Based';
    const isDaily = formData.paymentType === 'Daily Wage';
    const isBoard = formData.paymentType === 'Board Rate';

    const boardRateVal = isBoard ? Number(formData.boardRate || 0) : 0;
    const totalBoardsVal = isBoard ? Number(formData.totalBoards || 0) : 0;
    const boardTotalBill = isBoard ? boardRateVal * totalBoardsVal : 0;

    const dailyRateVal = isDaily
      ? Number(formData.dailyRate || 0)
      : isBoard
      ? boardRateVal
      : 0;
    const contractOrMonthlyVal = isBoard
      ? boardTotalBill
      : Number(formData.monthlySalary || 0);
    const totalPaidVal = Number(paidNowAmount || 0);

    // Calculate totalEarned automatically based on mode
    let earnedVal = Number(formData.totalEarned || 0);
    if (isContract) {
      earnedVal = Math.max(earnedVal, contractOrMonthlyVal, totalPaidVal);
    } else if (isBoard) {
      earnedVal = Math.max(boardTotalBill, totalPaidVal);
    } else if (!editingWorker && totalPaidVal > 0 && earnedVal === 0) {
      earnedVal = isDaily
        ? Math.max(dailyRateVal, totalPaidVal)
        : Math.max(contractOrMonthlyVal, totalPaidVal);
    }

    const previousPaid = editingWorker ? Number(editingWorker.totalPaid || 0) : 0;
    const deltaPaid = Math.max(0, totalPaidVal - previousPaid);

    const worker: Worker = {
      id: formData.id || nextId,
      name: formData.name.trim(),
      phone: formData.phone || '',
      skillTrade: formData.skillTrade || settings.labourTypes[0],
      paymentType: formData.paymentType as any,
      dailyRate: dailyRateVal,
      monthlySalary: isContract
        ? contractOrMonthlyVal || totalPaidVal
        : isBoard
        ? boardTotalBill
        : contractOrMonthlyVal,
      boardRate: isBoard ? boardRateVal : formData.boardRate,
      totalBoards: isBoard ? totalBoardsVal : formData.totalBoards,
      assignedProject: formData.assignedProject || projects[0]?.id || '',
      totalEarned: earnedVal,
      totalPaid: totalPaidVal,
      outstandingSalary: Math.max(0, earnedVal - totalPaidVal),
      status: (formData.status as any) || 'Active',
      notes: formData.notes || '',
    };

    onSave(worker, deltaPaid);
    onClose();
  };

  const boardCalculatedTotal =
    Number(formData.boardRate || 0) * Number(formData.totalBoards || 0);
  const boardDueBalance = Math.max(0, boardCalculatedTotal - Number(paidNowAmount || 0));
  const contractTotalBill = Number(formData.monthlySalary || 0);
  const contractDueBalance = Math.max(0, contractTotalBill - Number(paidNowAmount || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingWorker
                  ? language === 'EN'
                    ? 'Edit Worker & Payment Info'
                    : 'মিস্ত্রি/কর্মী প্রোফাইল ও পেমেন্ট সম্পাদনা'
                  : language === 'EN'
                  ? 'Register Worker / Craftsman'
                  : 'নতুন মিস্ত্রি/কারিগর ও মজুরি যুক্ত করুন'}
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
              {language === 'EN' ? 'Worker Full Name *' : 'মিস্ত্রি / কর্মীর পূর্ণ নাম *'}
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Md. Dulal Hossain"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Trade / Skill *' : 'কাজের পেশা / দক্ষতা *'}
              </label>
              <select
                value={formData.skillTrade || ''}
                onChange={(e) => setFormData({ ...formData, skillTrade: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.labourTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Phone Number' : 'ফোন নম্বর'}
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 1712-XXXXXX"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Payment Structure */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              {language === 'EN'
                ? 'Payment Structure *'
                : 'মজুরি কাঠামো (দৈনিক / মাসিক / চুক্তি / বোর্ড হিসেবে) *'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'Daily Wage' })}
                className={`py-2.5 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  formData.paymentType === 'Daily Wage'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                📅 Daily (দৈনিক)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'Monthly Salary' })}
                className={`py-2.5 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  formData.paymentType === 'Monthly Salary'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                💼 Monthly (মাসিক)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'Contract Based' })}
                className={`py-2.5 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  formData.paymentType === 'Contract Based'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                📜 Contract (চুক্তি)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: 'Board Rate' })}
                className={`py-2.5 px-2 rounded-lg text-center font-semibold border transition cursor-pointer ${
                  formData.paymentType === 'Board Rate'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                🪵 Board (বোর্ড হিসেবে)
              </button>
            </div>
          </div>

          {/* Dynamic Payment Fields based on Daily / Monthly / Contract / Board Rate */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            {formData.paymentType === 'Daily Wage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">
                    {language === 'EN' ? 'Daily Wage Rate (৳) *' : 'দৈনিক রেট (৳) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.dailyRate ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyRate: Number(e.target.value) })
                    }
                    placeholder="e.g. 1200"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>
                      {language === 'EN' ? 'Paid (৳) (Optional)' : 'পেমেন্ট (৳) (ঐচ্ছিক)'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidNowAmount || ''}
                    onChange={(e) => setPaidNowAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-800 border border-emerald-500/40 rounded-lg px-3 py-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {formData.paymentType === 'Monthly Salary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-indigo-300 font-semibold mb-1">
                    {language === 'EN' ? 'Monthly Salary (৳) *' : 'মাসিক বেতন (৳) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.monthlySalary ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlySalary: Number(e.target.value) })
                    }
                    placeholder="e.g. 25000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>
                      {language === 'EN' ? 'Paid (৳) (Optional)' : 'পেমেন্ট (৳) (ঐচ্ছিক)'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidNowAmount || ''}
                    onChange={(e) => setPaidNowAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-800 border border-emerald-500/40 rounded-lg px-3 py-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {formData.paymentType === 'Contract Based' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-teal-300 font-semibold mb-1">
                      {language === 'EN' ? 'Contract Bill (৳)' : 'চুক্তির মোট বিল (৳)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.monthlySalary || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData({
                          ...formData,
                          monthlySalary: val,
                          totalEarned: val,
                        });
                      }}
                      placeholder="e.g. 50000"
                      className="w-full bg-slate-800 border border-teal-500/50 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-300 font-bold mb-1 flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>
                        {language === 'EN' ? 'Paid (৳) (Optional)' : 'পেমেন্ট (৳) (ঐচ্ছিক)'}
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={paidNowAmount || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPaidNowAmount(val);
                      }}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-300 font-semibold mb-1">
                      {language === 'EN' ? 'Due (৳)' : 'বকেয়া (৳)'}
                    </label>
                    <div className="w-full bg-slate-900 border border-rose-500/40 rounded-lg px-3 py-2 text-rose-400 font-mono font-bold">
                      ৳ {contractDueBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.paymentType === 'Board Rate' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-purple-300 font-semibold mb-1 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>
                        {language === 'EN' ? 'Board Rate (৳) *' : 'বোর্ড রেট (৳) *'}
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.boardRate ?? ''}
                      onChange={(e) => {
                        const rate = Number(e.target.value);
                        const boards = Number(formData.totalBoards || 0);
                        setFormData({
                          ...formData,
                          boardRate: rate,
                          dailyRate: rate,
                          totalEarned: rate * boards,
                        });
                      }}
                      placeholder="e.g. 500"
                      className="w-full bg-slate-800 border border-purple-500/50 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-semibold mb-1">
                      {language === 'EN' ? 'Boards (Optional)' : 'মোট বোর্ড (ঐচ্ছিক)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.totalBoards || ''}
                      onChange={(e) => {
                        const boards = Number(e.target.value);
                        const rate = Number(formData.boardRate || 0);
                        setFormData({
                          ...formData,
                          totalBoards: boards,
                          totalEarned: rate * boards,
                        });
                      }}
                      placeholder="0 (পরে লগে দেওয়া যাবে)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-semibold mb-1">
                      {language === 'EN' ? 'Total Bill (৳)' : 'মোট বিল (৳)'}
                    </label>
                    <div className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-2 text-amber-300 font-mono font-bold">
                      ৳ {boardCalculatedTotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                  <div>
                    <label className="block text-emerald-300 font-bold mb-1 flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>
                        {language === 'EN' ? 'Paid (৳) (Optional)' : 'পেমেন্ট (৳) (ঐচ্ছিক)'}
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={paidNowAmount || ''}
                      onChange={(e) => setPaidNowAmount(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-300 font-semibold mb-1">
                      {language === 'EN' ? 'Due (৳)' : 'বকেয়া (৳)'}
                    </label>
                    <div className="w-full bg-slate-900 border border-rose-500/40 rounded-lg px-3 py-2 text-rose-400 font-mono font-bold">
                      ৳ {boardDueBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Assigned Project Site *' : 'নিযুক্ত প্রজেক্ট সাইট *'}
              </label>
              <select
                value={formData.assignedProject || ''}
                onChange={(e) => setFormData({ ...formData, assignedProject: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Floating / Multiple Sites --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Status' : 'স্ট্যাটাস'}
              </label>
              <select
                value={formData.status || 'Active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Active">{language === 'EN' ? 'Active' : 'সক্রিয়'}</option>
                <option value="Inactive">{language === 'EN' ? 'Inactive' : 'নিষ্ক্রিয়'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Work Details & Notes' : 'কাজের বিবরণ ও নোট'}
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={
                language === 'EN'
                  ? 'e.g. Master carpenter for kitchen cabinet contract / board work'
                  : 'যেমন: কিচেন ক্যাবিনেট বোর্ড হিসেবে কাজ বা চুক্তি'
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save & Sync Log' : 'সেভ ও লগে সিঙ্ক করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
