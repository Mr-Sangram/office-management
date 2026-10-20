/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  BadgeDollarSign,
  Printer,
  Archive,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { Client, CompanySettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryImportButton } from '../CategoryImportButton';

interface ClientsViewProps {
  clients: Client[];
  settings: CompanySettings;
  language: 'EN' | 'BN';
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onReceivePaymentForClient: (client: Client) => void;
  onPrintClientInvoice: (client: Client) => void;
  onImportClients?: (records: Client[]) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  settings,
  language,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onReceivePaymentForClient,
  onPrintClientInvoice,
  onImportClients,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || c.clientType === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || c.clientStatus === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalContract = clients.reduce((s, c) => s + c.totalContractAmount, 0);
  const totalReceived = clients.reduce((s, c) => s + c.totalReceived, 0);
  const totalDue = clients.reduce((s, c) => s + c.totalDue, 0);

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {language === 'EN' ? 'Client Directory & Contract Management' : 'ক্লায়েন্ট ব্যবস্থাপনা ও চুক্তি'}
            </h2>
            <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full font-mono">
              03_Clients
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'EN'
              ? 'Automated client IDs, multiple projects tracking, advance and running installment balances'
              : 'অটো-জেনারেটেড ক্লায়েন্ট আইডি, চুক্তির পরিমাণ, প্রাপ্ত টাকা এবং বকেয়া হিসাব'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onImportClients && (
            <CategoryImportButton
              category="clients"
              language={language}
              existingIds={clients.map((c) => c.id)}
              onImportRecords={onImportClients}
            />
          )}
          <button
            onClick={onAddClient}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'EN' ? 'Add New Client' : 'নতুন ক্লায়েন্ট যোগ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Agreed Contracts' : 'মোট চুক্তিকৃত মূল্য'}
          </span>
          <span className="text-lg font-bold font-mono text-white">
            {formatCurrency(totalContract, settings.currencySymbol)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Collected' : 'মোট সংগৃহীত পেমেন্ট'}
          </span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {formatCurrency(totalReceived, settings.currencySymbol)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
            {language === 'EN' ? 'Total Outstanding Client Due' : 'মোট বকেয়া পাওনা'}
          </span>
          <span className="text-lg font-bold font-mono text-rose-400">
            {formatCurrency(totalDue, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'EN' ? 'Search by client name, ID, phone, project...' : 'ক্লায়েন্টের নাম, ফোন বা প্রজেক্ট দিয়ে খুঁজুন...'}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
          >
            <option value="ALL">All Types (সব ধরন)</option>
            <option value="Residential">Residential</option>
            <option value="Duplex / Penthouse">Duplex / Penthouse</option>
            <option value="Commercial">Commercial</option>
            <option value="Corporate">Corporate</option>
            <option value="Hospitality">Hospitality</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
          >
            <option value="ALL">All Status (সব স্ট্যাটাস)</option>
            <option value="Active">Active</option>
            <option value="Prospective">Prospective</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Client ID & Name</th>
                <th className="py-3 px-3">Contact Details</th>
                <th className="py-3 px-3">Project / Site</th>
                <th className="py-3 px-3 text-right">Contract Value</th>
                <th className="py-3 px-3 text-right">Received</th>
                <th className="py-3 px-3 text-right">Due Balance</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-xl text-slate-400">
                        🔒
                      </div>
                      <div className="text-sm font-bold text-white">
                        {language === 'EN' ? 'No Client Records Available' : 'কোনো ক্লায়েন্টের তথ্য প্রদর্শিত হচ্ছে না'}
                      </div>
                      <p className="text-xs text-slate-400">
                        {language === 'EN'
                          ? 'Client and contract records are confidential. Log in with your authorized PIN to view full details.'
                          : 'ক্লায়েন্ট ভিউতে গোপনীয়তা রক্ষার জন্য তথ্য গোপন রাখা হয়েছে। বিস্তারিত দেখতে আপনার পিন দিয়ে লগইন করুন।'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const hasDue = client.totalDue > 0;
                  return (
                    <tr key={client.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">{client.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded font-semibold">
                          {client.id}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {client.clientType}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">{client.email}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{client.address}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-200">{client.projectName}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(client.contractDate)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-200">
                      {formatCurrency(client.totalContractAmount, settings.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(client.totalReceived, settings.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold">
                      <span className={hasDue ? 'text-rose-400' : 'text-slate-400'}>
                        {formatCurrency(client.totalDue, settings.currencySymbol)}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          client.clientStatus === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : client.clientStatus === 'Completed'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {client.clientStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onReceivePaymentForClient(client)}
                          title="Record Payment Voucher"
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 transition"
                        >
                          <BadgeDollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPrintClientInvoice(client)}
                          title="Generate Printable Quotation / Invoice"
                          className="p-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditClient(client)}
                          title="Edit Client"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClient(client)}
                          title="Archive or Delete"
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
