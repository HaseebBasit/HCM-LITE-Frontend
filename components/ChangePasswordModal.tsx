'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { apiFetch } from '../lib/api';
import { KeyRound, ShieldAlert, CheckCircle2, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordModal() {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user || (!user.mustChangePassword && !user.isTemporaryPassword)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(async () => {
          await refreshUser();
        }, 1000);
      } else {
        setError(res.message || 'Failed to update password');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while changing password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D1928] border border-[#203044] rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#203044]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center border border-amber-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Initial Password Change Mandatory</h3>
            <p className="text-[11px] text-[#94A3B8]">Your account is using a temporary security credential.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Permanent password set! Refreshing workspace session...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
              Current Temporary Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter temporary password"
                className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
              New Permanent Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Setting Permanent Password...' : 'Save & Enter Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
