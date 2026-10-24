'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  History,
  Shield,
  Search,
  Eye,
  X,
  FileCode,
  Calendar,
  User,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function AuditLogPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Inspector modal
  const [inspectedLog, setInspectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(actionFilter !== 'all' && { action: actionFilter }),
      });
      const res = await apiFetch(`/audit?${q.toString()}`);
      if (res.success) {
        setLogs(res.logs || []);
        setTotal(res.total || 0);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-xs text-rose-400 bg-rose-950/20 rounded-2xl border border-rose-500/30 max-w-xl mx-auto my-12">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <h3 className="font-bold text-sm">Access Denied</h3>
        <p className="mt-1">
          The forensic audit trail is strictly restricted to System Administrators.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit) || 1;

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('REJECT') || action.includes('CANCEL')) return 'danger';
    if (action.includes('FINALIZE') || action.includes('APPROVE') || action.includes('SETUP'))
      return 'success';
    if (action.includes('CHECKIN') || action.includes('CHECKOUT') || action.includes('DRAFT'))
      return 'emerald';
    return 'info';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Forensic Audit Trail & Ledger"
        subtitle="Immutable forensic audit log capturing actors, actions, entities, before/after state diffs, and client IP signatures."
        badge="Admin Forensic Ledger"
        badgeVariant="emerald"
        actions={
          <div className="flex items-center gap-2.5">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#0D1928] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
            >
              <option value="all">All Audit Actions ({total})</option>
              <option value="FIRST_RUN_SETUP">FIRST_RUN_SETUP</option>
              <option value="REGISTER_EMPLOYEE">REGISTER_EMPLOYEE</option>
              <option value="UPDATE_EMPLOYEE">UPDATE_EMPLOYEE</option>
              <option value="ATTENDANCE_CHECKIN">ATTENDANCE_CHECKIN</option>
              <option value="ATTENDANCE_CHECKOUT">ATTENDANCE_CHECKOUT</option>
              <option value="APPLY_LEAVE">APPLY_LEAVE</option>
              <option value="REVIEW_LEAVE_APPROVED">REVIEW_LEAVE_APPROVED</option>
              <option value="REVIEW_LEAVE_REJECTED">REVIEW_LEAVE_REJECTED</option>
              <option value="GENERATE_PAYROLL_DRAFT">GENERATE_PAYROLL_DRAFT</option>
              <option value="FINALIZE_PAYROLL">FINALIZE_PAYROLL</option>
            </select>
          </div>
        }
      />

      {/* Audit Log Table */}
      <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#03101D] text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px] border-b border-[#203044]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor Profile</th>
                <th className="p-3.5">Forensic Action</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">IP Signature</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#203044]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#94A3B8] font-mono text-xs">
                    <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying immutable audit ledger...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12">
                    <EmptyState
                      icon={History}
                      title="No Audit Logs Recorded"
                      description="No administrative or operational events match the selected criteria."
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#111E30]/50 transition">
                    <td className="p-3.5 font-mono text-[#F8FAFC]">
                      {new Date(log.createdAt).toLocaleString([], {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-[#F8FAFC] block">
                        {log.actorName || 'System'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {log.actorRole?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-[#94A3B8] font-mono text-[11px]">
                      {log.targetEntity || 'System Ledger'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#64748B]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setInspectedLog(log)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111E30] hover:bg-[#203044] text-emerald-400 border border-[#203044] text-[11px] font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Payload</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="p-4 bg-[#03101D] border-t border-[#203044] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <span className="font-mono text-[11px]">
              Showing {logs.length} of {total} audit records • Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-[#0D1928] hover:bg-[#111E30] border border-[#203044] text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-mono text-[11px] text-emerald-400 font-bold">{page}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-[#0D1928] hover:bg-[#111E30] border border-[#203044] text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= INSPECT LOG MODAL ================= */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0D1928] border border-[#203044] rounded-2xl p-6 sm:p-7 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Audit Record Forensics</h3>
              </div>
              <button
                onClick={() => setInspectedLog(null)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#020817] border border-[#203044]">
                <div>
                  <span className="text-[#94A3B8] block">Action:</span>
                  <span className="font-bold text-[#F8FAFC] font-mono">{inspectedLog.action}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block">Timestamp:</span>
                  <span className="font-mono text-[#F8FAFC]">
                    {new Date(inspectedLog.createdAt).toISOString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block">Actor:</span>
                  <span className="font-semibold text-[#F8FAFC]">
                    {inspectedLog.actorName} ({inspectedLog.actorRole})
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block">Target Entity:</span>
                  <span className="font-mono text-emerald-400">{inspectedLog.targetEntity}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5 font-mono">
                  State Mutation Diff / Payload JSON:
                </label>
                <div className="p-4 rounded-xl bg-[#020817] border border-[#203044] font-mono text-[11px] text-emerald-300 max-h-60 overflow-y-auto">
                  <pre>{JSON.stringify(inspectedLog.details || inspectedLog.diff || inspectedLog, null, 2)}</pre>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectedLog(null)}
                  className="px-5 py-2 rounded-xl bg-[#111E30] hover:bg-[#203044] text-[#F8FAFC] font-semibold text-xs"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
