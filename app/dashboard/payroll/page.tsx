'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import PayslipModal from '../../../components/PayslipModal';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  CreditCard,
  Lock,
  FileText,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

export default function PayrollPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isHr = user?.role === 'hr';
  const isEmployee = user?.role === 'employee';

  const [runs, setRuns] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );
  const [currentPayroll, setCurrentPayroll] = useState<any>(null);
  const payrollRecords = currentPayroll?.records || currentPayroll?.slips || currentPayroll?.employees || [];
  const [myPayslips, setMyPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Payslip modal
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      if (isAdmin || isHr) {
        // Fetch runs
        const runsRes = await apiFetch('/payroll');
        if (runsRes.success) setRuns(runsRes.payrollRuns || []);

        // Fetch current month detail if exists
        try {
          const detailRes = await apiFetch(`/payroll/${selectedMonth}`);
          if (detailRes.success) setCurrentPayroll(detailRes.payroll);
          else setCurrentPayroll(null);
        } catch {
          setCurrentPayroll(null);
        }
      }

      if (isEmployee) {
        const payslipsRes = await apiFetch('/payroll/my-payslips');
        if (payslipsRes.success) setMyPayslips(payslipsRes.payslips || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth]);

  // HR or Admin generates draft
  const handleGenerateDraft = async () => {
    setGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch('/payroll/draft', {
        method: 'POST',
        body: JSON.stringify({ month: selectedMonth }),
      });
      if (res.success) {
        setMessage(res.message || 'Payroll draft calculated successfully.');
        setCurrentPayroll(res.payrollRun);
        fetchPayrollData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Admin finalizes and permanently locks payroll run
  const handleFinalize = async () => {
    if (!isAdmin) return;
    if (
      !confirm(
        `Finalize and permanently lock payroll for ${selectedMonth}? This locks all records and generates official locked payslips for all staff.`
      )
    )
      return;

    setFinalizing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch('/payroll/finalize', {
        method: 'POST',
        body: JSON.stringify({ month: selectedMonth }),
      });
      if (res.success) {
        setMessage(res.message || 'Payroll permanently finalized and locked.');
        fetchPayrollData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Enterprise Payroll & Statutory Ledger"
        subtitle="Automated Pakistan statutory tax slabs, attendance deductions, draft calculation, and master finalization locks."
        badge={
          currentPayroll?.status === 'finalized'
            ? 'Locked & Disbursed'
            : currentPayroll?.status === 'draft'
            ? 'Draft In Review'
            : 'Pakistan Slabs Active'
        }
        badgeVariant={currentPayroll?.status === 'finalized' ? 'emerald' : 'amber'}
        actions={
          (isAdmin || isHr) && (
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[#0D1928] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
              />

              {/* Generate Draft (Allowed for HR & Admin) */}
              {(!currentPayroll || currentPayroll.status === 'draft') && (
                <button
                  onClick={handleGenerateDraft}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D1928] hover:bg-[#111E30] text-[#F8FAFC] border border-[#203044] hover:border-emerald-500/40 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>{generating ? 'Calculating...' : currentPayroll ? 'Recalculate Draft' : 'Calculate Draft'}</span>
                </button>
              )}

              {/* Master Admin Finalization Lock Button */}
              {isAdmin && currentPayroll && currentPayroll.status === 'draft' && (
                <button
                  onClick={handleFinalize}
                  disabled={finalizing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{finalizing ? 'Finalizing...' : 'Finalize & Lock Payroll'}</span>
                </button>
              )}

              {currentPayroll && currentPayroll.status === 'finalized' && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked & Immutable</span>
                </span>
              )}
            </div>
          )
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

      {/* ================= ADMIN & HR OPERATIONS ================= */}
      {(isAdmin || isHr) && (
        <div className="space-y-6">
          {/* Month Financial KPI Cards (When Run exists) */}
          {currentPayroll ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
                <span className="text-xs font-medium text-[#94A3B8]">Gross Salaries Total</span>
                <div className="text-2xl font-bold text-[#F8FAFC] font-mono mt-2">
                  PKR {(currentPayroll.totalGross || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-[#64748B] font-mono mt-1 block">Basic + Allowances</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
                <span className="text-xs font-medium text-[#94A3B8]">Attendance Deductions</span>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-2">
                  PKR {(currentPayroll.totalDeductions || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-[#64748B] font-mono mt-1 block">Unpaid Absences & Cutoffs</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
                <span className="text-xs font-medium text-[#94A3B8]">Pakistan Income Tax</span>
                <div className="text-2xl font-bold text-rose-400 font-mono mt-2">
                  PKR {(currentPayroll.totalTax || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-[#64748B] font-mono mt-1 block">FBR Statutory Slabs</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
                <span className="text-xs font-medium text-[#94A3B8]">
                  {currentPayroll.status === 'finalized' ? 'Total Net Disbursed' : 'Estimated Net Pay'}
                </span>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">
                  PKR {(currentPayroll.totalNet || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                  {currentPayroll.status === 'finalized' ? '✓ Locked & Finalized' : 'Draft · Not yet disbursed'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#203044] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">No Payroll Generated for {selectedMonth}</h3>
                <p className="text-xs text-[#94A3B8] mt-1 max-w-xl leading-relaxed">
                  Generate a draft run to aggregate basic salaries, compute Pakistan income tax slabs, evaluate unpaid leave deductions, and review payslips.
                </p>
              </div>
              <button
                onClick={handleGenerateDraft}
                disabled={generating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer shrink-0"
              >
                {generating ? 'Calculating...' : `Calculate Draft for ${selectedMonth}`}
              </button>
            </div>
          )}

          {/* Employee Breakdown Table in Current Run */}
          {currentPayroll && (
            <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-[#03101D] border-b border-[#203044] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#F8FAFC]">
                    Staff Payroll Breakdown — {selectedMonth}
                  </h3>
                  <span className="text-[10px] text-[#94A3B8] font-mono">
                    {payrollRecords.length} Staff {payrollRecords.length === 1 ? 'Account' : 'Accounts'} Included
                    {currentPayroll.totalWorkingDays ? ` · ${currentPayroll.totalWorkingDays} working days` : ''}
                  </span>
                </div>
                <Badge variant={currentPayroll.status === 'finalized' ? 'success' : 'warning'}>
                  {currentPayroll.status?.toUpperCase()}
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#020817] text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px] border-b border-[#203044]">
                    <tr>
                      <th className="p-3.5">Employee</th>
                      <th className="p-3.5">Basic</th>
                      <th className="p-3.5">HRA (40%)</th>
                      <th className="p-3.5">Medical (10%)</th>
                      <th className="p-3.5">Gross</th>
                      <th className="p-3.5">Daily Rate</th>
                      <th className="p-3.5">Eligible Days</th>
                      <th className="p-3.5">Absent</th>
                      <th className="p-3.5">Unpaid Leave</th>
                      <th className="p-3.5">Half Days</th>
                      <th className="p-3.5">Attendance Ded.</th>
                      <th className="p-3.5">Pakistan Tax</th>
                      <th className="p-3.5">Net Pay</th>
                      <th className="p-3.5 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#203044]">
                    {payrollRecords.map((emp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#111E30]/50 transition">
                        <td className="p-3.5">
                          <span className="font-semibold text-[#F8FAFC] block">{emp.employeeName || emp.name || 'Staff member'}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {emp.employeeId || emp.employeeCode || 'ID-PENDING'}
                          </span>
                          <span className="block text-[10px] text-[#64748B]">{emp.department || 'General'} · {emp.designation || 'Staff'}</span>
                        </td>
                        <td className="p-3.5 font-mono text-[#F8FAFC]">
                          PKR {Number(emp.basic ?? emp.basicSalary ?? 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-[#94A3B8]">
                          PKR {(emp.hra || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-[#94A3B8]">
                          PKR {(emp.medical || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-[#F8FAFC] font-semibold">
                          PKR {Number(emp.gross ?? emp.grossSalary ?? 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-[#94A3B8]">PKR {Number(emp.dailyRate ?? 0).toLocaleString()}</td>
                        <td className="p-3.5 font-mono text-[#94A3B8]">{Number(emp.eligibleWorkingDays ?? 0)} / {Number(currentPayroll.totalWorkingDays ?? 0)}</td>
                        <td className="p-3.5 font-mono text-amber-400">{Number(emp.absentDays ?? 0)}</td>
                        <td className="p-3.5 font-mono text-amber-400">{Number(emp.unpaidLeaveDays ?? 0)}</td>
                        <td className="p-3.5 font-mono text-amber-400">{Number(emp.halfDays ?? 0)}</td>
                        <td className="p-3.5 font-mono text-amber-400">
                          - PKR {Number(emp.deductions ?? emp.attendanceDeduction ?? 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-rose-400">
                          - PKR {Number(emp.monthlyTax ?? emp.taxDeduction ?? 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">
                          PKR {Number(emp.netPay ?? emp.netSalary ?? 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedPayslip({
                                ...emp,
                                month: currentPayroll.month,
                                totalWorkingDays: currentPayroll.totalWorkingDays,
                                status: currentPayroll.status,
                                isFinalized: currentPayroll.isFinalized || currentPayroll.status === 'finalized',
                              });
                              setShowPayslipModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111E30] hover:bg-[#203044] text-emerald-400 border border-[#203044] text-[11px] font-semibold cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {payrollRecords.length === 0 && (
                      <tr>
                        <td colSpan={14} className="p-10 text-center text-sm text-[#94A3B8]">
                          No eligible staff records were saved in this run. Recalculate the draft after confirming staff have valid salaries and joining dates.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Historical Payroll Runs List */}
          <div className="bg-[#0D1928] border border-[#203044] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#F8FAFC] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Historical Payroll Disbursement Ledger</span>
            </h3>

            {runs.length === 0 ? (
              <p className="text-xs text-[#94A3B8] font-mono py-4">No prior payroll runs on record.</p>
            ) : (
              <div className="space-y-2">
                {runs.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => setSelectedMonth(r.month)}
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                      selectedMonth === r.month
                        ? 'bg-[#111E30] border-emerald-500/50 shadow-sm'
                        : 'bg-[#020817] border-[#203044] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-bold text-[#F8FAFC] block">{r.month} Run</span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          PKR {(r.totalNet ?? r.totalNetPaid ?? 0).toLocaleString()} {r.status === 'finalized' ? 'Net Disbursed' : 'Estimated Net Pay'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={r.status === 'finalized' ? 'success' : 'warning'}>
                        {r.status?.toUpperCase()}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-[#64748B]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= EMPLOYEE MY PAYSLIPS VIEW ================= */}
      {isEmployee && (
        <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-[#03101D] border-b border-[#203044]">
            <h3 className="text-xs font-bold text-[#F8FAFC]">My Official Salary Payslips</h3>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Verified payslips issued and locked by Saylani Enterprises Administration.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#020817] text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px] border-b border-[#203044]">
                <tr>
                  <th className="p-3.5">Pay Period</th>
                  <th className="p-3.5">Gross Pay</th>
                  <th className="p-3.5">Attendance Deductions</th>
                  <th className="p-3.5">Tax Withholding</th>
                  <th className="p-3.5">Net Disbursed</th>
                  <th className="p-3.5 text-right">Payslip Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#203044]">
                {myPayslips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12">
                      <EmptyState
                        icon={CreditCard}
                        title="No Payslips Issued Yet"
                        description="Once the administration finalizes monthly payroll runs, your official locked salary slips will appear here for download."
                      />
                    </td>
                  </tr>
                ) : (
                  myPayslips.map((ps, i) => (
                    <tr key={i} className="hover:bg-[#111E30]/50 transition">
                      <td className="p-3.5 font-mono text-[#F8FAFC] font-semibold">{ps.month}</td>
                      <td className="p-3.5 font-mono text-[#F8FAFC]">
                        PKR {Number(ps.gross ?? ps.grossSalary ?? 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono text-amber-400">
                        - PKR {Number(ps.deductions ?? ps.attendanceDeduction ?? 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono text-rose-400">
                        - PKR {Number(ps.monthlyTax ?? ps.taxDeduction ?? 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-bold">
                        PKR {Number(ps.netPay ?? ps.netSalary ?? 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedPayslip({ ...ps, status: 'finalized', isFinalized: true });
                            setShowPayslipModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View & Print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {showPayslipModal && selectedPayslip && (
        <PayslipModal
          isOpen={showPayslipModal}
          onClose={() => setShowPayslipModal(false)}
          payslip={selectedPayslip}
          companyName={user?.company?.name || user?.company?.companyName || 'Saylani Enterprises'}
        />
      )}
    </div>
  );
}
