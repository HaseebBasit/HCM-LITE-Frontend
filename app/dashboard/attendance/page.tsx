'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import AttendanceModal from '../../../components/AttendanceModal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  CalendarCheck,
  Clock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Compass,
  FileEdit,
  ShieldCheck,
  Filter,
  Check,
  AlertTriangle,
  History,
  MapPin,
} from 'lucide-react';

export default function AttendanceBoardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isHr = user?.role === 'hr';
  const isEmployee = user?.role === 'employee';
  const canReview = isAdmin || isHr;

  const [activeTab, setActiveTab] = useState<'board' | 'corrections'>('board');
  const [records, setRecords] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );
  const [loading, setLoading] = useState(true);

  // Correction request modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [corrDate, setCorrDate] = useState(new Date().toISOString().split('T')[0]);
  const [corrCheckIn, setCorrCheckIn] = useState('');
  const [corrCheckOut, setCorrCheckOut] = useState('');
  const [corrReason, setCorrReason] = useState('');

  // Review modal
  const [reviewModalRequest, setReviewModalRequest] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState('');

  // Camera modal
  const [showCameraModal, setShowCameraModal] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Today status
      const todayRes = await apiFetch('/attendance/today');
      if (todayRes.success) setTodayRecord(todayRes.attendance);

      // 2. Fetch records for month
      const calRes = await apiFetch(`/attendance/calendar?month=${selectedMonth}`);
      if (calRes.success) setRecords(calRes.records || []);

      // 3. Fetch corrections
      const corrRes = await apiFetch('/attendance/corrections');
      if (corrRes.success) setCorrections(corrRes.requests || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth]);

  // Standard web check-out
  const handleCheckOut = async () => {
    setError(null);
    try {
      const res = await apiFetch('/attendance/check-out', { method: 'POST' });
      if (res.success) {
        setMessage(res.message || 'Checked out successfully.');
        fetchAttendanceData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit correction
  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch('/attendance/corrections', {
        method: 'POST',
        body: JSON.stringify({
          date: corrDate,
          requestedCheckIn: `${corrDate}T${corrCheckIn || '09:00'}:00`,
          requestedCheckOut: corrCheckOut ? `${corrDate}T${corrCheckOut}:00` : null,
          reason: corrReason,
        }),
      });

      if (res.success) {
        setMessage('Correction request submitted for HR review.');
        setShowCorrectionModal(false);
        setCorrReason('');
        fetchAttendanceData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Review correction
  const handleReviewCorrection = async (decision: 'approved' | 'rejected') => {
    if (!reviewModalRequest) return;
    try {
      const res = await apiFetch(`/attendance/corrections/${reviewModalRequest._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          decision,
          reviewComment,
        }),
      });

      if (res.success) {
        setMessage(`Correction request ${decision}.`);
        setReviewModalRequest(null);
        setReviewComment('');
        fetchAttendanceData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isCheckedIn = Boolean(todayRecord?.checkIn);
  const isCheckedOut = Boolean(todayRecord?.checkOut);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Attendance & Punctuality Engine"
        subtitle="Daily shift roster, 09:15 AM grace rule enforcement, camera + GPS verification, and correction workflows."
        badge="Grace 15m Compliant"
        badgeVariant="emerald"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#0D1928] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
            />

            {/* Employee Check-In / Out controls */}
            {isEmployee && (
              <>
                {!isCheckedIn ? (
                  <button
                    onClick={() => setShowCameraModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs shadow-md shadow-emerald-950/40 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Camera Check-In</span>
                  </button>
                ) : !isCheckedOut ? (
                  <button
                    onClick={handleCheckOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#EF4444] to-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-950/40 cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Check Out</span>
                  </button>
                ) : null}

                <button
                  onClick={() => setShowCorrectionModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D1928] hover:bg-[#111E30] text-[#F8FAFC] border border-[#203044] text-xs font-semibold cursor-pointer"
                >
                  <FileEdit className="w-4 h-4 text-emerald-400" />
                  <span>Request Adjustment</span>
                </button>
              </>
            )}
          </div>
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

      {/* Segmented Control Tabs */}
      <div className="flex border-b border-[#203044]">
        <button
          onClick={() => setActiveTab('board')}
          className={`py-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'board'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Attendance Records ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('corrections')}
          className={`py-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'corrections'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>Correction Requests ({corrections.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: ATTENDANCE RECORDS BOARD ================= */}
      {activeTab === 'board' && (
        <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#03101D] text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px] border-b border-[#203044]">
                <tr>
                  <th className="p-3.5">Calendar Date</th>
                  {(isAdmin || isHr) && <th className="p-3.5">Employee</th>}
                  <th className="p-3.5">Check In</th>
                  <th className="p-3.5">Check Out</th>
                  <th className="p-3.5">Hours</th>
                  <th className="p-3.5">Punctuality Status</th>
                  <th className="p-3.5">Verification Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#203044]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#94A3B8] font-mono text-xs">
                      <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading attendance records for {selectedMonth}...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12">
                      <EmptyState
                        icon={Clock}
                        title="No Attendance Logs Found"
                        description={`There are no shift records logged for ${selectedMonth}. Check-ins recorded with camera or web timestamp will stream in here.`}
                      />
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r._id} className="hover:bg-[#111E30]/50 transition">
                      <td className="p-3.5 font-mono text-[#F8FAFC] font-semibold">
                        {r.date}
                      </td>
                      {(isAdmin || isHr) && (
                        <td className="p-3.5">
                          <span className="font-semibold text-[#F8FAFC] block">
                            {r.userId?.name || 'Staff Member'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {r.userId?.employeeCode || r.userId?.employeeId} • {r.userId?.department}
                          </span>
                        </td>
                      )}
                      <td className="p-3.5 font-mono text-[#F8FAFC]">
                        {r.checkIn
                          ? new Date(r.checkIn).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="p-3.5 font-mono text-[#F8FAFC]">
                        {r.checkOut
                          ? new Date(r.checkOut).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-bold">
                        {r.workHours ? `${r.workHours}h` : '—'}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            r.status === 'present'
                              ? 'success'
                              : r.status === 'late'
                              ? 'warning'
                              : r.status === 'half_day'
                              ? 'info'
                              : 'danger'
                          }
                        >
                          {r.status === 'present'
                            ? 'Present (On-Time)'
                            : r.status === 'late'
                            ? 'Late Arrival'
                            : r.status === 'half_day'
                            ? 'Half Day (<5h)'
                            : r.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-[11px] text-[#94A3B8] font-mono">
                        {r.faceVerified ? 'Camera + Geofence' : 'Web Timestamp'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CORRECTION REQUESTS ================= */}
      {activeTab === 'corrections' && (
        <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#03101D] text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px] border-b border-[#203044]">
                <tr>
                  <th className="p-3.5">Date</th>
                  {(isAdmin || isHr) && <th className="p-3.5">Employee</th>}
                  <th className="p-3.5">Requested Timestamps</th>
                  <th className="p-3.5">Justification Reason</th>
                  <th className="p-3.5">Decision Status</th>
                  {canReview && <th className="p-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#203044]">
                {corrections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12">
                      <EmptyState
                        icon={FileEdit}
                        title="No Attendance Correction Requests"
                        description="There are currently no attendance adjustment requests in the review queue."
                      />
                    </td>
                  </tr>
                ) : (
                  corrections.map((req) => (
                    <tr key={req._id} className="hover:bg-[#111E30]/50 transition">
                      <td className="p-3.5 font-mono text-[#F8FAFC] font-semibold">{req.date}</td>
                      {(isAdmin || isHr) && (
                        <td className="p-3.5">
                          <span className="font-semibold text-[#F8FAFC] block">
                            {req.userId?.name || 'Staff'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {req.userId?.employeeCode || req.userId?.employeeId}
                          </span>
                        </td>
                      )}
                      <td className="p-3.5 font-mono text-[#F8FAFC]">
                        In: {req.correctionRequest?.requestedCheckIn?.substring(11, 16) || '—'} | Out: {req.correctionRequest?.requestedCheckOut?.substring(11, 16) || '—'}
                      </td>
                      <td className="p-3.5 text-[#94A3B8] max-w-xs truncate">
                        "{req.correctionRequest?.reason}"
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            req.correctionRequest?.status === 'approved'
                              ? 'success'
                              : req.correctionRequest?.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {req.correctionRequest?.status?.toUpperCase()}
                        </Badge>
                      </td>
                      {canReview && (
                        <td className="p-3.5 text-right">
                          {req.correctionRequest?.status === 'pending' ? (
                            <button
                              onClick={() => setReviewModalRequest(req)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
                            >
                              Review & Decide
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#64748B] font-mono">Completed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= CORRECTION REQUEST MODAL ================= */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D1928] border border-[#203044] rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Request Attendance Adjustment</h3>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestCorrection} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={corrDate}
                  onChange={(e) => setCorrDate(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Check In Time</label>
                  <input
                    type="time"
                    required
                    value={corrCheckIn}
                    onChange={(e) => setCorrCheckIn(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Check Out Time</label>
                  <input
                    type="time"
                    value={corrCheckOut}
                    onChange={(e) => setCorrCheckOut(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Justification Reason</label>
                <textarea
                  required
                  rows={3}
                  value={corrReason}
                  onChange={(e) => setCorrReason(e.target.value)}
                  placeholder="e.g. Field assignment at external campus, biometric sensor malfunction..."
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl p-3 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#111E30] hover:bg-[#203044] text-[#94A3B8] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold shadow-md shadow-emerald-950/40"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= REVIEW CORRECTION MODAL ================= */}
      {reviewModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D1928] border border-[#203044] rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <h3 className="text-base font-bold text-[#F8FAFC]">Review Correction Request</h3>
              <button
                onClick={() => setReviewModalRequest(null)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#020817] border border-[#203044] space-y-1">
                <div><strong>Employee:</strong> {reviewModalRequest.userId?.name}</div>
                <div><strong>Date:</strong> {reviewModalRequest.date}</div>
                <div>
                  <strong>Requested Timestamps:</strong> {reviewModalRequest.correctionRequest?.requestedCheckIn?.substring(11, 16)} to {reviewModalRequest.correctionRequest?.requestedCheckOut?.substring(11, 16)}
                </div>
                <div><strong>Reason:</strong> "{reviewModalRequest.correctionRequest?.reason}"</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                  HR Review Remarks
                </label>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add administrative review notes..."
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl p-3 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => handleReviewCorrection('rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-800/50 font-bold"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewCorrection('approved')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold shadow-md shadow-emerald-950/40"
                >
                  Approve Correction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Attendance Modal */}
      {showCameraModal && (
        <AttendanceModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onSuccess={() => {
            setShowCameraModal(false);
            fetchAttendanceData();
          }}
        />
      )}
    </div>
  );
}
