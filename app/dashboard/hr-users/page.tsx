'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  UserCheck,
  Plus,
  Shield,
  KeyRound,
  Power,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Mail,
  User,
  Phone,
  ShieldAlert,
} from 'lucide-react';

export default function HrUsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [hrList, setHrList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('SaylaniHR2026!');
  const [phone, setPhone] = useState('');

  // Password reset modal
  const [resetModalUserId, setResetModalUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHrUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/users/hr');
      if (res.success) {
        setHrList(res.hrUsers || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHrUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await apiFetch('/users/hr', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone }),
      });

      if (res.success) {
        setMessage(`HR user ${name} provisioned successfully!`);
        setShowCreateModal(false);
        setName('');
        setEmail('');
        setPhone('');
        fetchHrUsers();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await apiFetch(`/users/hr/${id}/status`, { method: 'PUT' });
      if (res.success) {
        fetchHrUsers();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUserId || !newPassword) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/users/hr/${resetModalUserId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });

      if (res.success) {
        setMessage('Temporary password re-issued for HR account.');
        setResetModalUserId(null);
        setNewPassword('');
        fetchHrUsers();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-xs text-rose-400 bg-rose-950/20 rounded-2xl border border-rose-500/30 max-w-xl mx-auto my-12">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <h3 className="font-bold text-sm">Access Denied</h3>
        <p className="mt-1">HR User Management is strictly restricted to Master Administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <PageHeader
        title="HR Accounts & Access Management"
        subtitle="Provision dedicated HR operational accounts, manage active/inactive permissions, and reset access passwords."
        badge="Master Admin Only"
        badgeVariant="emerald"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision HR Login</span>
          </button>
        }
      />

      {/* Messages */}
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

      {/* HR Accounts Table */}
      <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#03101D] text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px] border-b border-[#203044]">
              <tr>
                <th className="p-3.5">HR Officer</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Contact Phone</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Temporary Pwd</th>
                <th className="p-3.5 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#203044]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#94A3B8] font-mono text-xs">
                    <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying HR accounts...
                  </td>
                </tr>
              ) : hrList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12">
                    <EmptyState
                      icon={UserCheck}
                      title="No HR Logins Provisioned"
                      description="Create dedicated HR officer accounts to delegate employee onboarding, leave review, and payroll drafting."
                      actionText="Provision First HR Account"
                      onAction={() => setShowCreateModal(true)}
                    />
                  </td>
                </tr>
              ) : (
                hrList.map((hr) => (
                  <tr key={hr._id} className="hover:bg-[#111E30]/50 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] font-bold text-xs flex items-center justify-center shrink-0">
                          {hr.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-[#F8FAFC] block">{hr.name}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {hr.employeeCode || 'HR-USER'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#F8FAFC]">{hr.email}</td>
                    <td className="p-3.5 font-mono text-[#94A3B8]">{hr.phone || '—'}</td>
                    <td className="p-3.5">
                      <Badge variant={hr.isActive ? 'success' : 'danger'}>
                        {hr.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      {hr.isTemporaryPassword ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/70 text-amber-400 border border-amber-800/50">
                          Pending First Change
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#64748B] font-mono">Permanent</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setResetModalUserId(hr._id);
                            setNewPassword('SaylaniHR2026!');
                          }}
                          title="Reset Password"
                          className="px-2.5 py-1.5 rounded-lg bg-[#111E30] hover:bg-[#203044] text-[#F8FAFC] border border-[#203044] text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Reset Pwd</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(hr._id)}
                          title={hr.isActive ? 'Deactivate Account' : 'Activate Account'}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            hr.isActive
                              ? 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border-rose-900/40'
                              : 'bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CREATE HR MODAL ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D1928] border border-[#203044] rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Provision HR Operations Account</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">HR Officer Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ayesha.hr@saylani.com"
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 321 0000000"
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Initial Temporary Password</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
                />
                <p className="text-[10px] text-[#64748B] mt-1 font-mono">
                  The user will be prompted to change this on their initial sign-in.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#111E30] hover:bg-[#203044] text-[#94A3B8] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold shadow-md shadow-emerald-950/40 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= RESET PASSWORD MODAL ================= */}
      {resetModalUserId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D1928] border border-[#203044] rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Re-Issue Temporary Password</h3>
              </div>
              <button
                onClick={() => setResetModalUserId(null)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                  New Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResetModalUserId(null)}
                  className="px-4 py-2 rounded-xl bg-[#111E30] hover:bg-[#203044] text-[#94A3B8] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold shadow-md shadow-emerald-950/40 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Set Temporary Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
