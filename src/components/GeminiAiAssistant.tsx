/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Car,
  HardHat,
  Receipt,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import {
  CompanySettings,
  Client,
  Project,
  MaterialItem,
  Worker,
  LabourAttendance,
  PaymentReceived,
  ExpenseItem,
  OfficeStaff,
  OfficeBill,
  PettyCashFund
} from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ProposedExpenseAction {
  id: string;
  amount: number;
  description: string;
  category: string;
  projectId?: string;
  projectName?: string;
  conveyanceMode?: string;
  expenseType: 'PROJECT_DIRECT' | 'OFFICE_OVERHEAD';
  isDailyCost?: boolean;
  date: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  proposedAction?: ProposedExpenseAction;
  actionExecuted?: boolean;
}

interface GeminiAiAssistantProps {
  language: 'EN' | 'BN';
  settings: CompanySettings;
  clients: Client[];
  projects: Project[];
  materials: MaterialItem[];
  workers: Worker[];
  attendance: LabourAttendance[];
  payments: PaymentReceived[];
  expenses: ExpenseItem[];
  staff: OfficeStaff[];
  bills: OfficeBill[];
  pettyCashFund: PettyCashFund;
  onAddExpense: (expense: ExpenseItem) => void;
  onNavigateTab: (tab: any) => void;
}

export const GeminiAiAssistant: React.FC<GeminiAiAssistantProps> = ({
  language,
  settings,
  clients,
  projects,
  materials,
  workers,
  attendance,
  payments,
  expenses,
  staff,
  bills,
  pettyCashFund,
  onAddExpense,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text:
        language === 'EN'
          ? `Hello! I am your DEV Assistant for ${settings.companyName}. You can ask me any question about daily costs, worker wages, staff salaries, project conveyance, or command me to add new expenses in plain Bengali or English!`
          : `আসসালামু আলাইকুম! আমি আপনার ${settings.companyName}-এর DEV Assistant। আপনি আমাকে যেকোনো প্রশ্ন করতে পারেন—যেমন আজকের মোট খরচ, মিস্ত্রির বকেয়া মজুরি, কর্মকর্তার বেতন বা প্রজেক্ট যাতায়াত। এমনকি আপনি আমাকে খরচ যোগ করতে বললে আমি তাৎক্ষণিক তা তৈরি করে সিস্টেমে যোগ করে দেব!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Suggested Prompts
  const quickPrompts = [
    {
      label: language === 'EN' ? 'Today\'s Total Cost' : '📊 আজকের মোট খরচ কত?',
      prompt: language === 'EN' ? 'What is today\'s total cost breakdown?' : 'আজকে আমাদের মোট কত টাকা খরচ হয়েছে এবং কোন কোন খাতে?',
    },
    {
      label: language === 'EN' ? 'Worker Dues' : '👷 কোন মিস্ত্রির কত পাওনা বাকি?',
      prompt: language === 'EN' ? 'Which workers have outstanding wages due?' : 'কোন কোন লেবার বা মিস্ত্রির কত টাকা মজুরি বাকি আছে এবং তাদের কাজের বিবরণ কী?',
    },
    {
      label: language === 'EN' ? 'Site Conveyance' : '🚗 প্রজেক্ট যাতায়াত খরচ কত?',
      prompt: language === 'EN' ? 'Show conveyance and site visit transport summary.' : 'চলতি মাসে প্রজেক্টে যাতায়াত ও সাইট ভিজিটে মোট কত টাকা খরচ হয়েছে?',
    },
    {
      label: language === 'EN' ? 'Unpaid Office Bills' : '🧾 বাকি অফিস বিল সমূহ',
      prompt: language === 'EN' ? 'What are the unpaid office bills?' : 'অফিসের কোন কোন বিল (ভাড়া, বিদ্যুৎ, ইন্টারনেট ইত্যাদি) এখনো বাকি আছে?',
    },
    {
      label: language === 'EN' ? 'Add Rickshaw Fare' : '➕ রিকশা ভাড়া ১২০ টাকা যোগ করো',
      prompt: language === 'EN' ? 'Add a conveyance expense: Rickshaw fare 120 BDT for site visit.' : 'সাইট ভিজিটের জন্য রিকশা ভাড়া ১২০ টাকা খরচ এন্ট্রি করো',
    },
  ];

  // Helper to compile ERP context snapshot for Gemini
  const buildErpContext = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = expenses.filter((e) => e.date === today);
    const totalTodayExpense = todayExpenses.reduce((s, e) => s + e.amount, 0);

    const totalMoneyReceived = payments.reduce((s, p) => s + p.amountReceived, 0);
    const totalContractValue = projects.reduce((s, p) => s + p.contractValue, 0);

    const pendingBills = bills.filter((b) => b.status === 'Unpaid');
    const totalLabourDue = attendance.reduce((s, a) => s + a.outstandingSalary, 0);

    const activeProjectsList = projects.map((p) => `${p.projectName} (ID: ${p.id}, Value: ৳${p.contractValue})`).join('; ');
    const staffListSummary = staff.map((s) => `${s.name} (${s.role}, Monthly: ৳${s.monthlySalary}, Adv: ৳${s.totalAdvancePaid || 0})`).join('; ');
    const workersDueSummary = workers.map((w) => `${w.name} (${w.skillTrade}, Due: ৳${w.outstandingSalary})`).join('; ');

    return `
You are the DEV Assistant for "${settings.companyName}" (Enterprise Interior Design & Architectural Fitout ERP).
Today's Date: ${today}. Currency: ${settings.currencySymbol} BDT.

CURRENT SYSTEM METRICS SNAPSHOT:
- Total Projects: ${projects.length} (Running/Active: ${projects.filter((p) => p.projectStatus !== 'Completed').length})
- Active Projects: ${activeProjectsList}
- Total Contract Revenue: ৳${totalContractValue}
- Total Money Received to date: ৳${totalMoneyReceived}
- Today's Total Expenses (${today}): ৳${totalTodayExpense} across ${todayExpenses.length} transactions
- Petty Cash Fund Balance: ৳${pettyCashFund.currentBalance}
- Total Worker/Labour Outstanding Due: ৳${totalLabourDue}
- Workers list & dues: ${workersDueSummary}
- Staff payroll & Advances: ${staffListSummary}
- Pending Unpaid Office Bills: ${pendingBills.map((b) => `${b.billType} (৳${b.amount}, Month: ${b.billingMonth}, Due: ${b.dueDate})`).join('; ') || 'None'}

INSTRUCTIONS:
1. Always respond respectfully in Bengali (or English if prompted in English). Keep tone executive, professional, and clear.
2. If the user asks questions about expenses, workers, staff salaries, bills, conveyance, or projects, calculate from the metrics snapshot above and provide accurate, precise figures.
3. If the user asks you to ADD or RECORD an expense, conveyance, tea cost, or bill (e.g. "মিরপুর প্রজেক্টে রিকশা ভাড়া ১২০ টাকা অ্যাড করো" or "চা নাস্তা ৮০ টাকা খরচ যোগ করো"), respond with confirmation in Bengali AND include a JSON action block at the very end of your response inside triple backticks with tag \`action_json\`:
\`\`\`action_json
{
  "action": "ADD_EXPENSE",
  "amount": 120,
  "description": "মিরপুর প্রজেক্ট সাইট ভিজিট রিকশা ভাড়া",
  "category": "Conveyance & Transport",
  "conveyanceMode": "Rickshaw",
  "projectId": "PRJ-001",
  "expenseType": "PROJECT_DIRECT",
  "isDailyCost": true
}
\`\`\`
Match the closest project ID from active projects. If it's general office tea or snacks, set expenseType to "OFFICE_OVERHEAD", category "Office Tea & Refreshments", and projectId to "OFFICE_GENERAL".
`;
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      let replyText = '';
      let proposedAction: ProposedExpenseAction | undefined;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = buildErpContext();

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUSER INQUIRY / COMMAND:\n${userText}` }],
            },
          ],
        });

        replyText = response.text || '';

        // Extract action_json if present
        const jsonMatch = replyText.match(/```action_json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.action === 'ADD_EXPENSE') {
              const matchedProj = projects.find((p) => p.id === parsed.projectId) || projects[0];
              proposedAction = {
                id: `EXP-${Date.now().toString().slice(-4)}`,
                amount: Number(parsed.amount) || 0,
                description: parsed.description || userText,
                category: parsed.category || 'Conveyance & Transport',
                conveyanceMode: parsed.conveyanceMode || 'Rickshaw',
                projectId: parsed.projectId || (matchedProj ? matchedProj.id : 'OFFICE_GENERAL'),
                projectName: matchedProj ? matchedProj.projectName : 'General Office',
                expenseType: parsed.expenseType || 'PROJECT_DIRECT',
                isDailyCost: parsed.isDailyCost ?? true,
                date: new Date().toISOString().split('T')[0],
              };
            }
          } catch (e) {
            console.error('Failed to parse action json', e);
          }
          // Remove raw code block from user-visible text
          replyText = replyText.replace(/```action_json[\s\S]*?```/, '').trim();
        }
      } else {
        // Built-in intelligent local fallback rule engine
        const lower = userText.toLowerCase();
        const today = new Date().toISOString().split('T')[0];

        if (lower.includes('আজকে') || lower.includes('today')) {
          const todayExp = expenses.filter((e) => e.date === today);
          const totalToday = todayExp.reduce((s, e) => s + e.amount, 0);
          replyText = `আজকে (${formatDate(today)}) মোট খরচ হয়েছে ${formatCurrency(totalToday, settings.currencySymbol)} (মোট ${todayExp.length}টি এন্ট্রি)। পেটি ক্যাশে বর্তমান ব্যালেন্স আছে ${formatCurrency(pettyCashFund.currentBalance, settings.currencySymbol)}।`;
        } else if (lower.includes('মিস্ত্রি') || lower.includes('লেবার') || lower.includes('worker')) {
          const totalDue = attendance.reduce((s, a) => s + a.outstandingSalary, 0);
          replyText = `বর্তমান সিস্টেমে মোট ${workers.length} জন মিস্ত্রি নিবন্ধিত আছেন। তাদের মোট বকেয়া মজুরির পরিমাণ ${formatCurrency(totalDue, settings.currencySymbol)}। আপনি 'স্মার্ট অডিট ও ফিল্টার' ট্যাবে গিয়ে যেকোনো নির্দিষ্ট মিস্ত্রির তারিখভিত্তিক পূর্ণ স্টেটমেন্ট দেখতে পারেন।`;
        } else if (lower.includes('বিল') || lower.includes('bill') || lower.includes('rent') || lower.includes('ভাড়া')) {
          const unpaid = bills.filter((b) => b.status === 'Unpaid');
          const unpaidSum = unpaid.reduce((s, b) => s + b.amount, 0);
          replyText = `বর্তমানে বকেয়া বিলের সংখ্যা ${unpaid.length}টি, যার মোট পরিমাণ ${formatCurrency(unpaidSum, settings.currencySymbol)}। এর মধ্যে রয়েছে: ${unpaid.map((b) => `${b.billType} (${formatCurrency(b.amount, settings.currencySymbol)})`).join(', ')}।`;
        } else if (lower.includes('যোগ') || lower.includes('add') || lower.includes('ভাড়া') || lower.includes('cost')) {
          // Parse amount from text
          const numbers = userText.match(/\d+/g);
          const amount = numbers ? parseInt(numbers[0], 10) : 150;
          const matchedProj = projects[0];

          proposedAction = {
            id: `EXP-${Date.now().toString().slice(-4)}`,
            amount,
            description: userText,
            category: lower.includes('চা') || lower.includes('নাস্তা') ? 'Office Tea & Refreshments' : 'Conveyance & Transport',
            conveyanceMode: lower.includes('সিএনজি') ? 'CNG' : lower.includes('উবার') ? 'Uber / Pathao' : 'Rickshaw',
            projectId: matchedProj ? matchedProj.id : 'OFFICE_GENERAL',
            projectName: matchedProj ? matchedProj.projectName : 'Studio Office',
            expenseType: lower.includes('চা') ? 'OFFICE_OVERHEAD' : 'PROJECT_DIRECT',
            isDailyCost: true,
            date: today,
          };

          replyText = `আমি আপনার জন্য ${formatCurrency(amount, settings.currencySymbol)}-এর খরচের ভাউচার প্রস্তুত করেছি। নিচের বাটনে চাপ দিয়ে সরাসরি সিস্টেমে যুক্ত করতে পারেন:`;
        } else {
          replyText = `আমি আপনার প্রশ্নটি পেয়েছি। আপনার বর্তমানে ${projects.length}টি প্রজেক্ট চলছে এবং মোট চুক্তি মূল্য ${formatCurrency(projects.reduce((s, p) => s + p.contractValue, 0), settings.currencySymbol)}। আপনি আমাকে যেকোনো প্রজেক্টের যাতায়াত খরচ, কর্মকর্তা বেতন বা দৈনিক খরচ যোগ করার নির্দেশ দিতে পারেন।`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          proposedAction,
        },
      ]);
    } catch (err: any) {
      console.error('Gemini Assistant Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'EN'
              ? 'I encountered an issue processing your request. Please try asking again.'
              : 'দুঃখিত, অনুরোধটি প্রসেস করতে সাময়িক সমস্যা হয়েছে। আপনি আবার চেষ্টা করতে পারেন অথবা নিচের কুইক প্রম্পটগুলো ব্যবহার করতে পারেন।',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (msgId: string, action: ProposedExpenseAction) => {
    const newExpense: ExpenseItem = {
      id: action.id,
      date: action.date,
      expenseCategory: action.category,
      expenseType: action.expenseType,
      description: action.description,
      projectId: action.projectId || 'OFFICE_GENERAL',
      projectName: action.projectName,
      supplierPayee: 'Staff / Site Traveler',
      paymentMethod: 'Petty Cash (পেটি ক্যাশ)',
      billInvoiceNumber: `VCH-${Date.now().toString().slice(-4)}`,
      amount: action.amount,
      paymentStatus: 'Paid',
      approvedBy: 'DEV Assistant',
      notes: `Auto-recorded via DEV Assistant`,
      isDailyCost: action.isDailyCost,
      conveyanceMode: action.conveyanceMode,
    };

    onAddExpense(newExpense);

    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, actionExecuted: true } : m))
    );
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-2xl shadow-indigo-500/40 border border-indigo-400/30 transition-transform active:scale-95 group cursor-pointer"
        aria-label="Open DEV Assistant"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
        </div>
        <span className="tracking-wide">DEV Assistant</span>
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-6 z-50 w-[94vw] sm:w-[460px] h-[580px] max-h-[82vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    DEV Assistant
                  </h3>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {language === 'EN' ? 'Natural language cost auditor & action assistant' : 'প্রজেক্ট খরচ, লেবার অডিট ও কমান্ড এক্সিকিউশন'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: `welcome-${Date.now()}`,
                      sender: 'assistant',
                      text:
                        language === 'EN'
                          ? 'Chat reset. How can I help you with your interior projects or expenses today?'
                          : 'চ্যাট হিস্ট্রি রিসেট করা হয়েছে। আজ আপনার প্রজেক্ট বা খরচের বিষয়ে কী জানতে চান?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                title="Reset Chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-slate-850 hover:bg-indigo-600/30 border border-slate-750 hover:border-indigo-500/40 text-slate-300 hover:text-white whitespace-nowrap transition text-[11px]"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-900/90 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-850 text-slate-200 border border-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Proposed Action Card */}
                  {msg.proposedAction && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'EN' ? 'Proposed Expense Entry' : 'প্রস্তাবিত খরচ ভাউচার'}</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {formatCurrency(msg.proposedAction.amount, settings.currencySymbol)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        <div>
                          <strong className="text-white">Project:</strong> {msg.proposedAction.projectName}
                        </div>
                        <div>
                          <strong className="text-white">Category:</strong> {msg.proposedAction.category}
                        </div>
                        {msg.proposedAction.conveyanceMode && (
                          <div>
                            <strong className="text-white">Vehicle:</strong> {msg.proposedAction.conveyanceMode}
                          </div>
                        )}
                        <div className="text-slate-400 text-[10px] italic">
                          "{msg.proposedAction.description}"
                        </div>
                      </div>

                      {msg.actionExecuted ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold pt-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{language === 'EN' ? 'Added to ERP System successfully!' : 'সফলভাবে সিস্টেমে যোগ করা হয়েছে!'}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExecuteAction(msg.id, msg.proposedAction!)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'EN' ? 'Approve & Add to ERP' : 'অনুমোদন ও সিস্টেমে যোগ করুন'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  <span className="block text-[9px] text-slate-400 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="p-2.5 bg-slate-850 rounded-2xl border border-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  <span className="text-[11px]">
                    {language === 'EN' ? 'DEV Assistant is analyzing ERP metrics...' : 'DEV Assistant হিসাব বিশ্লেষণ করছে...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                language === 'EN'
                  ? 'Ask about costs, dues or command: "Add rickshaw fare 120 BDT"...'
                  : 'খরচ বা মিস্ত্রির বকেয়া জানতে লিখুন বা কমান্ড দিন: "রিকশা ভাড়া ১২০ টাকা যোগ করো"...'
              }
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
