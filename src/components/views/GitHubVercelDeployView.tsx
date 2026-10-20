/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GitBranch,
  Download,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Globe,
  RefreshCw,
  Terminal,
  FolderArchive,
  Layers,
  Sparkles,
  ExternalLink,
  Rocket,
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { getProjectSourceFiles, triggerZipDownload } from '../../utils/zipBuilder';

interface GitHubVercelDeployViewProps {
  settings: CompanySettings;
  language: 'EN' | 'BN';
  liveAppUrl: string;
  clientViewUrl: string;
  totalRecordsCount: number;
}

export const GitHubVercelDeployView: React.FC<GitHubVercelDeployViewProps> = ({
  settings,
  language,
  liveAppUrl,
  clientViewUrl,
  totalRecordsCount,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadZip = () => {
    setIsDownloading(true);
    try {
      // Trigger browser download of pre-bundled comprehensive zip
      const link = document.createElement('a');
      link.href = '/advance-erp-github-ready.zip';
      link.download = 'advance-erp-github-ready.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch {
      // Fallback to client-side zip builder if needed
      const sourceFiles = getProjectSourceFiles();
      triggerZipDownload(sourceFiles, 'advance-erp-github-ready.zip');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  const vercelJsonContent = `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const gitCommands = `# ১. আপনার পিসিতে আনজিপ করা ফোল্ডারের ভেতর টার্মিনাল ওপেন করুন
git init
git add .
git commit -m "Initial commit for Vercel 24/7 Deployment"
git branch -M main
# আপনার গিটহাব রিপোজিটোরি লিংক বসান (নিচের লিংকের জায়গায় আপনার আসল গিটহাব লিংক দিন):
git remote add origin https://github.com/আপনার_ইউজারনেম/আপনার_রিপো_নাম.git
git push -u origin main --force`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub & Vercel 24/7 Deployment Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {language === 'EN'
                ? 'GitHub & Vercel 24/7 Cloud Deployment'
                : 'গিটহাব ও Vercel ২৪/৭ ক্লাউড ডিপ্লয়মেন্ট সেন্টার'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'EN'
                ? 'Download the 100% complete GitHub-ready ZIP archive with proper src/ structure and vercel.json. Eliminates the "Failed to resolve /src/main.tsx" error and runs 24/7 on Vercel with Google Drive/Sheets sync and role permissions.'
                : 'গিটহাব ও ভার্সেলের জন্য প্রয়োজনীয় ১০০% ফাইল এবং সঠিক ফোল্ডার স্ট্রাকচারসহ জিপ ফাইল। এটি আপনার "Failed to resolve /src/main.tsx" এরর পুরোপুরি সমাধান করে Vercel-এ ২৪/৭ নিরবচ্ছিন্নভাবে লাইভ রাখবে।'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>
                {isDownloading
                  ? 'জিপ প্রস্তুত হচ্ছে...'
                  : 'সম্পূর্ণ ZIP ডাউনলোড করুন (এক ক্লিকে)'}
              </span>
            </button>
            {downloadSuccess && (
              <div className="text-center text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 py-1.5 px-3 rounded-xl">
                ✓ জিপ সফলভাবে ডাউনলোড হচ্ছে!
              </div>
            )}
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>vercel.json</strong> কনফিগারেশন যুক্ত (SPA 404 ফিক্সড)
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Google Drive / Sheets Sync</strong> ২৪/৭ ব্রাউজার অটো সিঙ্ক
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>ক্লায়েন্ট ভিউ ও পারমিশন</strong> ১০০% সুরক্ষিত ও অপরিবর্তিত
            </span>
          </div>
        </div>
      </div>

      {/* The Error Diagnosis & Solution Box (Screenshots Reference) */}
      <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/40 space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-rose-300">
              আপনার স্ক্রিনশটের এরর: কেন "Failed to resolve /src/main.tsx" হয়েছিল?
            </h2>
            <p className="text-xs text-slate-300">
              নিচে আপনার স্ক্রিনশটের হুবহু এরর লগ ও তার মূল কারণ ব্যাখ্যা করা হলো:
            </p>
          </div>
        </div>

        {/* Exact Error Terminal Mockup */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 font-mono text-xs text-rose-300 space-y-1 overflow-x-auto">
          <div className="text-slate-500">// Vercel Build Logs</div>
          <div className="text-rose-400">[plugin vite:build-html] /vercel/path0/index.html</div>
          <div className="text-white font-bold">
            Error: Failed to resolve /src/main.tsx from /vercel/path0/index.html
          </div>
          <div className="text-slate-400">
            Command &quot;npm run build&quot; exited with 1
          </div>
        </div>

        {/* Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <span>⚠️ এররের মূল কারণ:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              আপনি GitHub ওয়েবসাইটে <strong>&quot;Add files via upload&quot;</strong> দিয়ে ব্রাউজারের মাধ্যমে ফাইল ড্রপ করেছিলেন। 
              গিটহাবের ওয়েব আপলোডার ফোল্ডার ডিরেক্টরি (যেমন <code>src/</code>) ঠিকমতো আপলোড করতে পারে না এবং ফাইলগুলো ভেঙে যায় বা রুট ফোল্ডারে এলোমেলো হয়ে যায়। 
              ফলে Vercel বিল্ড করার সময় <code>index.html</code>-এর দরকারি <code>/src/main.tsx</code> ফাইলটি নির্দিষ্ট ফোল্ডারে খুঁজে পায়নি।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="font-extrabold text-emerald-300 flex items-center gap-1.5">
              <span>✓ এর সমাধান:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              আমরা পুরো প্রজেক্টের প্রতিটি ফাইল ও ফোল্ডার একদম নিখুঁত স্ট্রাকচারে সাজিয়ে <strong>`advance-erp-github-ready.zip`</strong> ফাইলে তৈরি করে দিয়েছি। 
              এটি ডাউনলোড করে আনজিপ (Extract) করে গিটহাবে পুশ করলেই <code>src/main.tsx</code> সহ সব ফাইল সঠিক জায়গায় থাকবে এবং Vercel একবারে পাস করবে!
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step 4-Step Easy Deployment Guide */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-amber-400" />
              <span>সহজ ৪ ধাপে GitHub ও Vercel-এ ২৪/৭ চালু করার নিয়ম</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              এই নিয়ম অনুসরণ করলে কোনো এরর ছাড়াই আপনার অ্যাপটি ২৪/৭ লাইভ থাকবে।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-black">
                ধাপ ১
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Download & Extract</span>
            </div>
            <h3 className="font-bold text-white text-sm">জিপ ফাইল ডাউনলোড ও আনজিপ করুন</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              উপরের সবুজ <strong>&quot;সম্পূর্ণ ZIP ডাউনলোড করুন&quot;</strong> বাটনে ক্লিক করে জিপ ফাইলটি নামিয়ে নিন। 
              এরপর আপনার কম্পিউটারে ফাইলটির উপর রাইট ক্লিক করে <strong>Extract All (আনজিপ)</strong> করুন। 
              দেখবেন ভেতরে <code>src/</code>, <code>public/</code>, <code>vercel.json</code>, <code>package.json</code> ইত্যাদি সব রয়েছে।
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-black">
                ধাপ ২
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Upload to GitHub</span>
            </div>
            <h3 className="font-bold text-white text-sm">GitHub রিপোজিটরিতে ফাইল আপলোড করুন</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              আনজিপ করা ফোল্ডারের ফাইলগুলো <strong>GitHub Desktop</strong> বা <strong>VS Code Terminal</strong> দিয়ে এক ক্লিকে গিটহাবে পুশ করুন (নিচে কমান্ড দেওয়া আছে)। 
              এতে ফোল্ডার স্ট্রাকচার ১০০% অক্ষত থাকবে।
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-black">
                ধাপ ৩
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Vercel Import</span>
            </div>
            <h3 className="font-bold text-white text-sm">Vercel-এ প্রজেক্ট ইমপোর্ট করুন</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="text-amber-300 underline font-semibold"
              >
                vercel.com
              </a>{' '}
              এ গিয়ে <strong>&quot;Add New... Project&quot;</strong> চাপুন। আপনার GitHub রিপোজিটরি সিলেক্ট করুন। 
              Framework Preset: <strong>Vite</strong> স্বয়ংক্রিয়ভাবে থাকবে।
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-black">
                ধাপ ৪
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Deploy & Live 24/7</span>
            </div>
            <h3 className="font-bold text-white text-sm">Deploy বাটনে ক্লিক করুন</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              সরাসরি <strong>&quot;Deploy&quot;</strong> চাপুন। <code>vercel.json</code> এবং <code>vite.config.ts</code> থাকায় 
              ১ মিনিটের মধ্যে বিল্ড সাকসেস হবে এবং আপনার কাস্টম Vercel ডোমেইন পেয়ে যাবেন যা <strong>২৪/৭ লাইভ</strong> থাকবে!
            </p>
          </div>
        </div>
      </div>

      {/* Git Terminal Commands Helper */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              এক ক্লিকে Git Push করার কমান্ড (VS Code / Terminal):
            </h3>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(gitCommands, 'git')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer border border-slate-700"
          >
            {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'git' ? 'কপি হয়েছে' : 'কমান্ড কপি'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {gitCommands}
        </pre>
      </div>

      {/* Vercel.json Preview */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-white text-sm">vercel.json (ইতিমধ্যে জিপে যুক্ত আছে)</h3>
              <p className="text-[11px] text-slate-400">
                এই কনফিগারেশন থাকার কারণে Vercel-এ রিফ্রেশ দিলে কখনো 404 এরর আসবে না।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(vercelJsonContent, 'vercel')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer border border-slate-700"
          >
            {copiedKey === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'vercel' ? 'কপি হয়েছে' : 'কপি vercel.json'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-sky-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {vercelJsonContent}
        </pre>
      </div>

      {/* Google Drive & Permissions 100% Protection Card */}
      <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-indigo-300">
              Vercel-এ ডিপ্লয় হওয়ার পর Google Sync ও পারমিশনের অবস্থা:
            </h3>
            <p className="text-xs text-slate-300">
              আপনার প্রজেক্টের গুগল সিঙ্ক ও সিকিউরিটি কীভাবে ২৪/৭ কাজ করবে:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Google Drive & Sheets Sync</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Vercel-এ আপনার অ্যাপ চলাকালীন ব্রাউজার থেকে সরাসরি Google Apps Script Web App-এর মাধ্যমে গুগল ড্রাইভ ও শিটে অটো-ব্যাকআপ হবে। কোনো ডেটা বাদ পড়বে না।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>ইউজার পারমিশন ও পিন</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Owner, Manager, Site Supervisor, Accountant এবং Custom পারমিশন ও ৬-ডিজিট পিন কোড Vercel সাইটেও হুবহু একই রকম বজায় থাকবে।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>ক্লায়েন্ট ভিউ সিকিউরিটি</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              ক্লায়েন্ট বা বাইরের কেউ লিংকে ঢুকলে লগইন ছাড়া কোনো আর্থিক অংক (ব্যয়, জমা, বকেয়া) দেখতে পারবে না; ক্যাটাগরি ফাঁকা শো করবে এবং সুরক্ষিত থাকবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
