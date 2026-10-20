/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  language: 'EN' | 'BN';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 text-white px-4 py-2.5 shadow-2xl border border-amber-400/40 backdrop-blur text-xs animate-bounce">
      <WifiOff className="w-4 h-4 text-white shrink-0 animate-pulse" />
      <div>
        <div className="font-bold">
          {language === 'EN' ? 'Offline Mode Active' : 'অফলাইন মোড সক্রিয়'}
        </div>
        <div className="text-[10px] text-amber-100">
          {language === 'EN'
            ? 'All changes are stored locally on your device.'
            : 'ইন্টারনেট ছাড়াই ডাটা আপনার ডিভাইসে নিরাপদে সেভ হচ্ছে।'}
        </div>
      </div>
    </div>
  );
};
