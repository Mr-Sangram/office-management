/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, Download, ExternalLink, Sparkles, Terminal } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../utils/googleAppsScriptCode';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'EN' | 'BN';
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'InteriorCraft_GoogleAppsScript_Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {language === 'EN' ? 'Google Apps Script Automation Engine' : 'গুগল অ্যাপস স্ক্রিপ্ট অটোমেশন ইঞ্জিন'}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                  Code.gs
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'EN'
                  ? 'Automatically builds and formats all 14 sheets in Google Sheets with 1 click'
                  : 'গুগল শিটে ১-ক্লিকে ১৪টি শিট, ফর্মুলা ও মেনু স্বয়ংক্রিয়ভাবে তৈরি করার সম্পূর্ণ কোড'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setup Steps Guide */}
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-slate-850 to-slate-900 border-b border-slate-800 text-xs">
          <h3 className="font-semibold text-amber-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4" />
            {language === 'EN' ? 'How to install this in Google Sheets (Takes 30 seconds):' : 'গুগল শিটে যেভাবে যুক্ত করবেন (মাত্র ৩০ সেকেন্ড):'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-slate-300">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="inline-block w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-center leading-5 mr-1.5">1</span>
              <span>
                {language === 'EN' ? 'Open ' : ''}
                <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-sky-400 underline font-mono">
                  sheets.new
                </a>
                {language === 'EN' ? ' in your browser' : ' ব্রাউজারে একটি নতুন শিট খুলুন'}
              </span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="inline-block w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-center leading-5 mr-1.5">2</span>
              <span>{language === 'EN' ? 'Click Extensions > Apps Script' : 'মেনু থেকে Extensions > Apps Script-এ যান'}</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="inline-block w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-center leading-5 mr-1.5">3</span>
              <span>{language === 'EN' ? 'Paste this code into Code.gs and Save' : 'পুরোনো কোড মুছে এই কোড পেস্ট করে Save করুন'}</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="inline-block w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-center leading-5 mr-1.5">4</span>
              <span>{language === 'EN' ? 'Select "setupInteriorCraftWorkbook" & Run' : 'ড্রপডাউন থেকে setup ফাংশন সিলেক্ট করে Run চাপুন'}</span>
            </div>
          </div>
        </div>

        {/* Code View Area */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col bg-slate-950">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-400">
            <span className="font-mono text-slate-300">Code.gs ({GOOGLE_APPS_SCRIPT_CODE.split('\n').length} lines)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'EN' ? 'Download .gs' : 'ডাউনলোড .gs'}</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'EN' ? 'Copied!' : 'কপি হয়েছে!') : (language === 'EN' ? 'Copy Full Code' : 'সম্পূর্ণ কোড কপি করুন')}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs text-amber-200/90 leading-relaxed select-all">
            <pre className="whitespace-pre-wrap">{GOOGLE_APPS_SCRIPT_CODE}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Google Apps Script V8 Engine • Multi-tab formulas • Real-time alerts</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
          >
            {language === 'EN' ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
