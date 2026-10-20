/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Users, Save } from 'lucide-react';
import { Client, CompanySettings } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  editingClient?: Client | null;
  settings?: CompanySettings;
  nextId: string;
  language: 'EN' | 'BN';
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClient,
  settings,
  nextId,
  language,
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    id: nextId,
    name: '',
    phone: '',
    email: '',
    address: '',
    clientType: 'Residential',
    projectName: '',
    contractDate: new Date().toISOString().split('T')[0],
    totalContractAmount: 0,
    advancePayment: 0,
    totalReceived: 0,
    totalDue: 0,
    clientStatus: 'Active',
    notes: '',
  });

  useEffect(() => {
    if (editingClient) {
      setFormData(editingClient);
    } else {
      setFormData({
        id: nextId,
        name: '',
        phone: '',
        email: '',
        address: '',
        clientType: 'Residential',
        projectName: '',
        contractDate: new Date().toISOString().split('T')[0],
        totalContractAmount: 0,
        advancePayment: 0,
        totalReceived: 0,
        totalDue: 0,
        clientStatus: 'Active',
        notes: '',
      });
    }
  }, [editingClient, nextId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const totalContract = Number(formData.totalContractAmount || 0);
    const advance = Number(formData.advancePayment || 0);
    const received = editingClient ? (formData.totalReceived || advance) : advance;
    const due = totalContract - received;

    const clientToSave: Client = {
      id: formData.id || nextId,
      name: formData.name.trim(),
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || '',
      clientType: formData.clientType as any,
      projectName: formData.projectName || '',
      contractDate: formData.contractDate || new Date().toISOString().split('T')[0],
      totalContractAmount: totalContract,
      advancePayment: advance,
      totalReceived: received,
      totalDue: due > 0 ? due : 0,
      clientStatus: formData.clientStatus as any,
      notes: formData.notes || '',
    };

    onSave(clientToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingClient
                  ? (language === 'EN' ? 'Edit Client Profile' : 'ক্লায়েন্টের তথ্য পরিবর্তন')
                  : (language === 'EN' ? 'Add New Client' : 'নতুন ক্লায়েন্ট যোগ করুন')}
              </h2>
              <span className="text-xs text-sky-400 font-mono font-semibold">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Client Name *' : 'ক্লায়েন্টের নাম *'}
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Tariqul Islam"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Client Type' : 'ক্লায়েন্ট টাইপ'}
              </label>
              <select
                value={formData.clientType || 'Residential'}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {(settings?.clientTypes && settings.clientTypes.length > 0
                  ? settings.clientTypes
                  : [
                      'Residential',
                      'Duplex / Penthouse',
                      'Commercial',
                      'Corporate',
                      'Hospitality',
                      'Retail',
                    ]
                ).map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Phone Number *' : 'ফোন নম্বর *'}
              </label>
              <input
                type="text"
                required
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 1712-XXXXXX"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Email Address' : 'ইমেইল অ্যাড্রেস'}
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@gmail.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Site / Residential Address' : 'ঠিকানা / সাইট লোকেশন'}
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Apt 11B, Road 72, Gulshan-2, Dhaka"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Assigned Project Name' : 'প্রজেক্টের নাম'}
              </label>
              <input
                type="text"
                value={formData.projectName || ''}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g. Gulshan Sky Duplex Penthouse"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Contract Signing Date' : 'চুক্তি স্বাক্ষরের তারিখ'}
              </label>
              <input
                type="date"
                value={formData.contractDate || ''}
                onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Total Contract Value (৳) *' : 'মোট চুক্তি মূল্য (৳) *'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.totalContractAmount || ''}
                onChange={(e) => setFormData({ ...formData, totalContractAmount: Number(e.target.value) })}
                placeholder="3850000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Advance Payment (৳)' : 'অগ্রিম জমা (৳)'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.advancePayment || ''}
                onChange={(e) => setFormData({ ...formData, advancePayment: Number(e.target.value) })}
                placeholder="1000000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Client Status' : 'ক্লায়েন্ট স্ট্যাটাস'}
              </label>
              <select
                value={formData.clientStatus || 'Active'}
                onChange={(e) => setFormData({ ...formData, clientStatus: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Active">Active</option>
                <option value="Prospective">Prospective</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'EN' ? 'Interior Specifications & Scope Notes' : 'ইন্টেরিয়র স্পেসিফিকেশন ও নোট'}
              </label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Master bed walk-in wardrobe, fluted teak wall panelling, ambient cove lighting..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'EN' ? 'Save Client' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
