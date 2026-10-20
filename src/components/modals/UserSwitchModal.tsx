/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  KeyRound,
  User,
  ArrowRight,
  AlertCircle,
  Lock,
  Sparkles,
  Mail,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { AppUser } from '../../types';

interface UserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  currentUserId: string;
  onSwitchUser: (userId: string, pin: string) => boolean;
  language: 'EN' | 'BN';
  isLockedMode?: boolean;
}

export const UserSwitchModal: React.FC<UserSwitchModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onSwitchUser,
  language,
  isLockedMode = false,
}) => {
  const [loginMode, setLoginMode] = useState<'PROFILE' | 'EMAIL'>('PROFILE');
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId || (users[0]?.id ?? ''));
  const [emailInput, setEmailInput] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeUsers = users.filter((u) => u.status === 'Active');

  const handleSelectUser = (uId: string) => {
    setSelectedUserId(uId);
    setPin('');
    setError(null);
  };

  const handleDigitClick = (digit: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handleDeleteDigit = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let targetId = selectedUserId;

    if (loginMode === 'EMAIL') {
      if (!emailInput.trim()) {
        setError(language === 'EN' ? 'Please enter your Email or Name' : 'দয়া করে ইমেইল বা নাম লিখুন');
        return;
      }
      const matched = users.find(
        (u) =>
          u.email.toLowerCase() === emailInput.trim().toLowerCase() ||
          u.name.toLowerCase().includes(emailInput.trim().toLowerCase())
      );
      if (!matched) {
        setError(
          language === 'EN'
            ? 'No user found with that Email or Name'
            : 'এই ইমেইল বা নামে কোনো ইউজার পাওয়া যায়নি'
        );
        return;
      }
      if (matched.status !== 'Active') {
        setError(
          language === 'EN'
            ? 'This user account is currently suspended.'
            : 'এই অ্যাকাউন্টটি বর্তমানে স্থগিত রয়েছে।'
        );
        return;
      }
      targetId = matched.id;
    }

    if (!pin) {
      setError(language === 'EN' ? 'Please enter your 4-digit PIN' : 'দয়া করে আপনার পিন নম্বর দিন');
      return;
    }

    const success = onSwitchUser(targetId, pin);
    if (success) {
      setPin('');
      setEmailInput('');
      setError(null);
      onClose();
    } else {
      setError(
        language === 'EN'
          ? 'Incorrect PIN. Please try again or contact the Owner.'
          : 'ভুল পিন নম্বর! আবার চেষ্টা করুন অথবা ওনারের সাথে যোগাযোগ করুন।'
      );
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-lg shadow-inner">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'EN' ? 'User Login & Access Portal' : 'ইউজার লগইন ও প্রোফাইল পোর্টাল'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'EN'
                  ? 'Sign in with your assigned role and security PIN'
                  : 'আপনার নির্ধারিত রোল ও পিন দিয়ে সফটওয়্যারে লগইন করুন'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
            title={language === 'EN' ? 'Close and return to Client View' : 'বন্ধ করুন এবং ক্লায়েন্ট ভিউতে ফিরে যান'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setLoginMode('PROFILE');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'PROFILE'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{language === 'EN' ? 'Select Profile' : 'প্রোফাইল লিস্ট'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('EMAIL');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'EMAIL'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{language === 'EN' ? 'Email / Username Login' : 'ইমেইল বা নাম দিয়ে লগইন'}</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {loginMode === 'PROFILE' ? (
            <>
              {/* User Selection Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  {language === 'EN' ? 'Choose Your Account:' : 'আপনার অ্যাকাউন্ট নির্বাচন করুন:'}
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {activeUsers.map((user) => {
                    const isSelected = user.id === selectedUserId;
                    const isCurrentUser = user.id === currentUserId;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user.id)}
                        className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/15 shadow-sm ring-1 ring-indigo-500/50'
                            : 'border-slate-800 bg-slate-950/70 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-base shrink-0 border border-slate-700">
                          {user.avatar || '👤'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                            <span>{user.name.split(' ')[0]}</span>
                            {isCurrentUser && !isLockedMode && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">
                                {language === 'EN' ? 'Active' : 'সক্রিয়'}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{user.role}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected User Summary */}
              {selectedUser && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedUser.avatar || '👤'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedUser.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {selectedUser.email} •{' '}
                        <span className="text-indigo-400 font-semibold">{selectedUser.role}</span>
                      </p>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              )}
            </>
          ) : (
            /* Direct Email / Username Input */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'EN' ? 'Email Address or User Name' : 'ইমেইল অথবা আপনার নাম'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setError(null);
                    }}
                    placeholder={language === 'EN' ? 'e.g. kamrul.manager@interiorcraft.com' : 'যেমন: kamrul.manager@interiorcraft.com'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PIN Input & Keypad */}
          <div className="space-y-3">
            <div className="text-center">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {language === 'EN' ? 'Enter Security PIN' : 'সিকিউরিটি পিন নম্বর দিন'}
              </label>

              {/* Direct PIN Input + Dots */}
              <div className="max-w-[180px] mx-auto relative">
                <input
                  type="password"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-center text-lg font-mono tracking-[0.4em] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {error && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 mt-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitClick(digit)}
                  className="h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm transition active:scale-95 shadow-sm cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleDeleteDigit}
                className="h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                {language === 'EN' ? 'Clear' : 'মুছুন'}
              </button>
              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                className="h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm transition active:scale-95 shadow-sm cursor-pointer"
              >
                0
              </button>
              <button
                type="submit"
                className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1 shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <span>{language === 'EN' ? 'Login' : 'প্রবেশ'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {language === 'EN'
                ? `Default PIN: Owner (1234) | Selected: `
                : `ডিফল্ট পিন: ওনার (1234) | পিন: `}
            </span>
            <button
              type="button"
              onClick={() => {
                if (selectedUser?.pin) {
                  setPin(selectedUser.pin);
                  setError(null);
                }
              }}
              className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-mono font-bold text-[10px] border border-indigo-500/30 cursor-pointer"
              title="Click to autofill PIN"
            >
              {selectedUser?.pin || '1234'} ({language === 'EN' ? 'Autofill' : 'অটোফিল'})
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'EN' ? 'Cancel / Back' : 'বন্ধ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
