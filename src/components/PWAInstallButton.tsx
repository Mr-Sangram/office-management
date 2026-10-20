/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  language: 'EN' | 'BN';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running standalone, suppress
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
        title="Install as offline app on Mobile & Desktop"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{language === 'EN' ? 'Install App (Offline)' : 'অ্যাপ ইন্সটল করুন (অফলাইন)'}</span>
      </button>

      {/* Installation Guide Modal (For iOS and Desktop browsers when prompt is deferred) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm text-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {language === 'EN' ? 'Install as Native 24/7 App' : 'মোবাইল ও কম্পিউটারে অ্যাপ হিসেবে চালান'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'EN' ? 'Runs 100% offline with zero internet needed' : 'ইন্টারনেট ছাড়াই সাইটে সম্পূর্ণ অফলাইনে কাজ করবে'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-slate-300 bg-slate-850 p-4 rounded-xl border border-slate-800 text-xs">
              {isIOS ? (
                <>
                  <div className="font-semibold text-amber-300">📱 iPhone / iPad (Safari):</div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
                    <li>সাফারির নিচের <strong className="text-white">Share (শেয়ার)</strong> আইকনে চাপুন।</li>
                    <li>নিচে স্ক্রোল করে <strong className="text-amber-300">"Add to Home Screen"</strong> নির্বাচন করুন।</li>
                    <li><strong className="text-white">Add</strong> চাপলে আপনার হোম স্ক্রিনে অ্যাপ আইকন চলে আসবে!</li>
                  </ol>
                </>
              ) : (
                <>
                  <div className="font-semibold text-amber-300">📱 Android / 💻 Chrome / Edge:</div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
                    <li>ব্রাউজারের ডানপাশের <strong className="text-white">৩-ডট (Menu)</strong> আইকনে চাপুন।</li>
                    <li><strong className="text-amber-300">"Install app"</strong> অথবা <strong className="text-amber-300">"Add to Home screen"</strong> নির্বাচন করুন।</li>
                    <li>কনফার্ম করলেই এটি কোনো ব্রাউজার বার ছাড়া ফুল-স্ক্রিন অ্যাপ হিসেবে চালু হবে!</li>
                  </ol>
                </>
              )}
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px]">
              ✅ <strong>সম্পূর্ণ ফ্রি ও আনলিমিটেড:</strong> কোনো ডোমেইন বা পেইড হোস্টিং কিনতে হবে না। সকল ডাটা আপনার ডিভাইসের মেমোরিতে নিরাপদে সংরক্ষিত থাকে।
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition"
            >
              {language === 'EN' ? 'Got it' : 'ঠিক আছে'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
