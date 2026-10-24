'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import {
  UserCircle,
  Phone,
  MapPin,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  CalendarDays,
  Lock,
  Building,
  Briefcase,
  KeyRound,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Self-service password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await apiFetch(`/users/employees/${user.id || user._id}`, {
        method: 'PUT',
        body: JSON.stringify({ phone, address }),
      });

      if (res.success) {
        setMessage('Personal contact details updated successfully.');
        await refreshUser();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.success) {
        setPasswordMessage('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
      } else {
        setPasswordError(res.message || 'Password update failed.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error occurred while updating password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="My Profile & Self-Service Account"
        subtitle="Review your employment profile, update residential & contact information, and manage credentials."
        badge="Self-Service Portal"
        badgeVariant="emerald"
      />

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Identity Card (4 cols) */}
        <div className="md:col-span-4 p-6 rounded-2xl bg-[#0D1928] border border-[#203044] text-center flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white font-black text-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">{user?.name}</h2>
          <span className="text-xs font-mono text-emerald-400 mt-1 font-semibold">
            {user?.employeeCode || user?.employeeId || 'EMP-ID'}
          </span>
          <span className="text-xs text-[#94A3B8] mt-1">
            {user?.designation} • {user?.department}
          </span>

          <div className="mt-6 w-full pt-4 border-t border-[#203044] space-y-2.5 text-left text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Official Email:</span>
              <span className="text-[#F8FAFC] font-mono text-[11px] truncate max-w-[140px]">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Account Role:</span>
              <Badge variant="emerald">
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Security Level:</span>
              <span className="text-emerald-400 font-mono text-[11px] font-semibold">RBAC Verified</span>
            </div>
          </div>

          <div className="mt-6 w-full pt-4 border-t border-[#203044]">
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#111E30] hover:bg-[#203044] text-xs font-semibold text-[#F8FAFC] border border-[#203044] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showPasswordChange ? 'Hide Password Change' : 'Change Password'}</span>
            </button>
          </div>
        </div>

        {/* Right: Contact Form & Salary Card (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          {/* Password Change Form (Conditional) */}
          {showPasswordChange && (
            <div className="p-6 rounded-2xl bg-[#0D1928] border border-emerald-600/40 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Update Account Password</span>
              </h3>

              {passwordMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{passwordMessage}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold text-xs shadow-md shadow-emerald-950/40 disabled:opacity-50 cursor-pointer"
                  >
                    {passwordSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Editable Contact Information */}
          <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Contact & Residential Information</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Primary Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 321 0000000"
                    className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Residential Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete residential address for corporate and emergency records..."
                    className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : 'Save Contact Details'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Read-Only Employment & Compensation Guard */}
          <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#94A3B8] font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Protected Employment Ledger (Read-Only)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#020817] border border-[#203044]">
                <span className="text-[11px] text-[#94A3B8] block">Basic Salary</span>
                <span className="text-base font-bold text-[#F8FAFC] font-mono mt-1 block">
                  PKR {(user?.salary?.basic || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-[#64748B] font-mono">Base Statutory Rate</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#020817] border border-[#203044]">
                <span className="text-[11px] text-[#94A3B8] block">Gross Monthly Compensation</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
                  PKR {(user?.salary?.gross || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-[#64748B] font-mono">Includes HRA (40%) & Medical (10%)</span>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Compensation, designations, and role permissions are protected under zero-trust enterprise security. To request adjustments, contact your designated HR Operations officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
