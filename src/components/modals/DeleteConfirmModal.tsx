/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, Archive, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArchive: () => void;
  onPermanentDelete: () => void;
  title: string;
  itemName: string;
  canArchive?: boolean;
  language: 'EN' | 'BN';
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onArchive,
  onPermanentDelete,
  title,
  itemName,
  canArchive = true,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-slate-300">
          <p>
            {language === 'EN' ? 'Are you sure you want to remove' : 'আপনি কি নিশ্চিত যে আপনি'} <strong className="text-white font-semibold">{itemName}</strong> {language === 'EN' ? '?' : 'মুছে ফেলতে চান?'}
          </p>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-[11px] leading-relaxed">
            <strong className="block font-semibold mb-0.5 text-amber-300">
              🛡️ {language === 'EN' ? 'Financial Integrity Notice:' : 'আর্থিক নিরাপত্তা বার্তা:'}
            </strong>
            {language === 'EN'
              ? 'Archiving hides the item from active views while safely preserving financial transactions, historical cost audit trails, and Google Sheets formula references.'
              : 'আর্কাইভ (Archive) করলে রেকর্ডটি সাধারণ ভিউ থেকে লুকিয়ে যাবে কিন্তু পূর্বের আর্থিক লেনদেন ও গুগল শিটের ফর্মুলা অক্ষুণ্ণ থাকবে।'}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {canArchive && (
              <button
                type="button"
                onClick={() => {
                  onArchive();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40 transition"
              >
                <Archive className="w-4 h-4" />
                <span>{language === 'EN' ? 'Safely Archive / Deactivate (Recommended)' : 'নিরাপদে আর্কাইভ / নিষ্ক্রিয় করুন (সুপারিশকৃত)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onPermanentDelete();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold border border-rose-500/30 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'EN' ? 'Permanent Delete (Cannot be undone)' : 'স্থায়ীভাবে ডিলিট করুন'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            {language === 'EN' ? 'Cancel' : 'বাতিল'}
          </button>
        </div>
      </div>
    </div>
  );
};
