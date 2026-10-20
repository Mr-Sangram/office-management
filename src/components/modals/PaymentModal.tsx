/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, BadgeDollarSign, Save } from 'lucide-react';
import { PaymentReceived, Client, Project, CompanySettings } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentReceived) => void;
  editingPayment?: PaymentReceived | null;
  clients: Client[];
  projects: Project[];
  settings: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPayment,
  clients,
  projects,
  settings,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<PaymentReceived>>({
    id: nextId,
    date: new Date().toISOString().split('T')[0],
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.name || '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.projectName || '',
    installmentName: 'Running Installment',
    paymentMethod: settings.paymentMethods[0] || 'Bank Wire / BEFTN',
    paymentReference: '',
    amountReceived: 0,
    receivedBy: settings.employees[0] || 'Farhana Akhter',
    notes: '',
  });

  useEffect(() => {
    if (editingPayment) {
      setFormData(editingPayment);
    } else if (clients.length > 0 && projects.length > 0) {
      const firstClient = clients[0];
      const clientProject = projects.find((p) => p.clientId === firstClient.id) || projects[0];
      setFormData((prev) => ({
        ...prev,
        id: nextId,
        clientId: firstClient.id,
        clientName: firstClient.name,
        projectId: clientProject?.id || '',
        projectName: clientProject?.projectName || '',
      }));
    }
  }, [editingPayment, clients, projects, nextId]);

  if (!isOpen) return null;

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    const clientProjects = projects.filter((p) => p.clientId === clientId);
    const activeProject = clientProjects[0] || projects[0];

    setFormData({
      ...formData,
      clientId,
      clientName: client ? client.name : '',
      projectId: activeProject ? activeProject.id : '',
      projectName: activeProject ? activeProject.projectName : '',
    });
  };

  const handleProjectChange = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    setFormData({
      ...formData,
      projectId: projId,
      projectName: proj ? proj.projectName : '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amountReceived || Number(formData.amountReceived) <= 0) return;

    const payment: PaymentReceived = {
      id: formData.id || nextId,
      date: formData.date || new Date().toISOString().split('T')[0],
      clientId: formData.clientId || '',
      clientName: formData.clientName || '',
      projectId: formData.projectId || '',
      projectName: formData.projectName || '',
      installmentName: formData.installmentName || 'Installment',
      paymentMethod: formData.paymentMethod || 'Bank Wire',
      paymentReference: formData.paymentReference || '',
      amountReceived: Number(formData.amountReceived),
      receivedBy: formData.receivedBy || 'Accounts',
      notes: formData.notes || '',
    };

    onSave(payment);
    onClose();
  };

  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const selectedProject = projects.find((p) => p.id === formData.projectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'EN' ? 'Record Client Payment Received' : 'ক্লায়েন্ট পেমেন্ট এন্ট্রি'}
              </h2>
              <span className="text-xs text-emerald-400 font-mono font-semibold">
                Voucher ID: {formData.id}
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
          {/* Client & Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Client *' : 'ক্লায়েন্ট *'}
              </label>
              <select
                required
                value={formData.clientId || ''}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Project *' : 'প্রজেক্ট *'}
              </label>
              <select
                required
                value={formData.projectId || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProject && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Contract Value</span>
                <span className="font-mono font-bold text-slate-200">
                  {settings.currencySymbol} {selectedProject.contractValue.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Already Received</span>
                <span className="font-mono font-bold text-emerald-400">
                  {settings.currencySymbol} {selectedProject.amountReceived.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Outstanding Due</span>
                <span className="font-mono font-bold text-rose-400">
                  {settings.currencySymbol} {selectedProject.outstandingDue.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Date & Installment Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Payment Date *' : 'পেমেন্টের তারিখ *'}
              </label>
              <input
                type="date"
                required
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Installment / Stage Name' : 'কিস্তির বিবরণ'}
              </label>
              <input
                type="text"
                list="installment-stage-options"
                value={formData.installmentName || ''}
                onChange={(e) => setFormData({ ...formData, installmentName: e.target.value })}
                placeholder="e.g. 2nd Installment (Civil & Framing)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
              <datalist id="installment-stage-options">
                {(settings.installmentNames || []).map((inst) => (
                  <option key={inst} value={inst} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Amount & Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Amount Received (৳) *' : 'প্রাপ্ত টাকার পরিমাণ (৳) *'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.amountReceived || ''}
                onChange={(e) => setFormData({ ...formData, amountReceived: Number(e.target.value) })}
                placeholder="1000000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-bold font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Payment Method' : 'পেমেন্ট মাধ্যম'}
              </label>
              <select
                value={formData.paymentMethod || ''}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {settings.paymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference & Received By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Transaction / Cheque Reference' : 'চেক নং / ট্রানজেকশন আইডি'}
              </label>
              <input
                type="text"
                value={formData.paymentReference || ''}
                onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                placeholder="e.g. CHQ-99104 Standard Chartered"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Received By (Official)' : 'গ্রহণকারী কর্মকর্তা'}
              </label>
              <input
                type="text"
                value={formData.receivedBy || ''}
                onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                placeholder="Farhana Akhter (Accountant)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'EN' ? 'Notes / Bank Deposit Remarks' : 'নোট / ডিপোজিট বিবরণ'}
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Deposited into Eastern Bank corporate account"
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Payment' : 'পেমেন্ট নিশ্চিত করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
