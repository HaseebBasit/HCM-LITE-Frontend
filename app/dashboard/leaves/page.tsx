'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Ban,
  Clock,
  UserCheck,
  Check,
  Calendar,
  User,
  Shield,
  Briefcase,
} from 'lucide-react';

function LeaveContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isAdmin = user?.role === 'admin';
  const isHr = user?.role === 'hr';
  const isEmployee = user?.role === 'employee';
  const canApprove = isAdmin || isHr;

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply leave form
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [type, setType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Review modal
  const [reviewLeaveItem, setReviewLeaveItem] = useState<any>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [reviewComment, setReviewComment] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from URL params (from Smart Leave)
  useEffect(() => {
    const qType = searchParams.get('type');
    const qStart = searchParams.get('startDate');
    const qEnd = searchParams.get('endDate');
    const qReason = searchParams.get('reason');

    if (qStart && qEnd) {
      if (qType) setType(qType);
      setStartDate(qStart);
      setEndDate(qEnd);
      if (qReason) setReason(decodeURIComponent(qReason));
      setShowApplyModal(true);
    }
  }, [searchParams]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/leaves');
      if (res.success) {
        setLeaves(res.leaves || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await apiFetch('/leaves', {
        method: 'POST',
        body: JSON.stringify({ type, startDate, endDate, reason }),
      });

      if (res.success) {
        setMessage(res.message || 'Leave applied successfully.');
        setShowApplyModal(false);
        setReason('');
        fetchLeaves();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveId: string) => {
    if (!confirm('Are you sure you want to cancel this pending leave?')) return;
    try {
      const res = await apiFetch(`/leaves/${leaveId}/cancel`, { method: 'POST' });
      if (res.success) {
        setMessage('Leave request cancelled.');
        fetchLeaves();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewLeaveItem) return;
    if (reviewComment.trim().length < 2) {
      setError('Please add at least 2 characters of review remarks.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch(`/leaves/${reviewLeaveItem._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          decision: reviewDecision,
          reviewComment: reviewComment.trim(),
        }),
      });

      if (res.success) {
        setMessage(`Leave application ${reviewDecision}.`);
        setReviewLeaveItem(null);
        setReviewComment('');
        fetchLeaves();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Leave Management & Quota Ledger"
        subtitle="Apply for statutory paid leaves, track approval queues, enforce quotas, and review team absences."
        badge={canApprove ? 'Review Queue Active' : 'Self-Service Leaves'}
        badgeVariant="emerald"
        actions={
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Leave</span>
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

      {/* Leave Balances Strip (For Employee View) */}
      {isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0D1928] border border-[#203044] shadow-sm">
            <span className="text-xs font-medium text-[#94A3B8]">Annual Leave Quota</span>
            <div className="text-2xl font-bold text-[#F8FAFC] font-mono mt-1">
              {user?.leaveBalances?.annual ?? 14} <span className="text-xs font-normal text-[#64748B]">days</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0D1928] border border-[#203044] shadow-sm">
            <span className="text-xs font-medium text-[#94A3B8]">Sick Leave Quota</span>
            <div className="text-2xl font-bold text-[#F8FAFC] font-mono mt-1">
              {user?.leaveBalances?.sick ?? 8} <span className="text-xs font-normal text-[#64748B]">days</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0D1928] border border-[#203044] shadow-sm">
            <span className="text-xs font-medium text-[#94A3B8]">Casual Leave Quota</span>
            <div className="text-2xl font-bold text-[#F8FAFC] font-mono mt-1">
              {user?.leaveBalances?.casual ?? 10} <span className="text-xs font-normal text-[#64748B]">days</span>
            </div>
          </div>
        </div>
      )}

      {/* Leave Applications Table */}
      <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#03101D] text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px] border-b border-[#203044]">
              <tr>
                {canApprove && <th className="p-3.5">Employee</th>}
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5">Duration Dates</th>
                <th className="p-3.5">Days</th>
                <th className="p-3.5">Reason & Purpose</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#203044]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#94A3B8] font-mono text-xs">
                    <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Syncing leave records...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12">
                    <EmptyState
                      icon={CalendarDays}
                      title="No Leave Records Found"
                      description="No leave applications are currently active in this ledger. Use 'Apply for Leave' to submit a request."
                      actionText="Apply for Leave"
                      onAction={() => setShowApplyModal(true)}
                    />
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-[#111E30]/50 transition">
                    {canApprove && (
                      <td className="p-3.5">
                        <span className="font-semibold text-[#F8FAFC] block">
                          {l.userId?.name || 'Staff Member'}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {l.userId?.employeeCode || l.userId?.employeeId} • {l.userId?.department}
                        </span>
                      </td>
                    )}
                    <td className="p-3.5">
                      <span className="font-mono text-xs font-bold text-[#F8FAFC] uppercase">
                        {l.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[#F8FAFC]">
                      {l.startDate} → {l.endDate}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      {l.daysCount} {l.daysCount === 1 ? 'day' : 'days'}
                    </td>
                    <td className="p-3.5 text-[#94A3B8] max-w-xs truncate">
                      "{l.reason}"
                      {l.reviewComment && (
                        <span className="block text-[10px] text-[#64748B] font-mono mt-0.5">
                          HR Note: {l.reviewComment}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          l.status === 'approved'
                            ? 'success'
                            : l.status === 'rejected'
                            ? 'danger'
                            : l.status === 'cancelled'
                            ? 'neutral'
                            : 'warning'
                        }
                      >
                        {l.status?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {/* HR Review Action */}
                      {canApprove && l.status === 'pending' && (
                        <button
                          onClick={() => {
                            setReviewLeaveItem(l);
                            setReviewDecision('approved');
                            setReviewComment('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Review & Decide
                        </button>
                      )}

                      {/* Employee Cancel Action */}
                      {isEmployee && l.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(l._id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-800/50 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}

                      {l.status !== 'pending' && (
                        <span className="text-[10px] text-[#64748B] font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= APPLY FOR LEAVE MODAL ================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D1928] border border-[#203044] rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Apply for Leave</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Leave Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                >
                  <option value="casual">Casual Leave (Short Personal)</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="annual">Annual Paid Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Reason for Absence</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the purpose of leave for administrative record..."
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl p-3 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#111E30] hover:bg-[#203044] text-[#94A3B8] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold shadow-md shadow-emerald-950/40 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= REVIEW LEAVE MODAL ================= */}
      {reviewLeaveItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D1928] border border-[#203044] rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <h3 className="text-base font-bold text-[#F8FAFC]">Review Leave Application</h3>
              <button
                onClick={() => setReviewLeaveItem(null)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReview} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#020817] border border-[#203044] space-y-1">
                <div><strong>Employee:</strong> {reviewLeaveItem.userId?.name} ({reviewLeaveItem.userId?.employeeCode || reviewLeaveItem.userId?.employeeId})</div>
                <div><strong>Type:</strong> <span className="uppercase text-emerald-400 font-mono font-bold">{reviewLeaveItem.type}</span> ({reviewLeaveItem.daysCount} days)</div>
                <div><strong>Dates:</strong> {reviewLeaveItem.startDate} to {reviewLeaveItem.endDate}</div>
                <div><strong>Reason:</strong> "{reviewLeaveItem.reason}"</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('approved')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      reviewDecision === 'approved'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-[#020817] border-[#203044] text-[#94A3B8]'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('rejected')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      reviewDecision === 'rejected'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-[#020817] border-[#203044] text-[#94A3B8]'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                  Mandatory Review Remarks
                </label>
                <textarea
                  required
                  minLength={2}
                  maxLength={1000}
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="State decision justification..."
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl p-3 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReviewLeaveItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#111E30] hover:bg-[#203044] text-[#94A3B8] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold shadow-md shadow-emerald-950/40 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeavesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-xs font-mono text-[#94A3B8]">
          Loading leaves...
        </div>
      }
    >
      <LeaveContent />
    </Suspense>
  );
}
