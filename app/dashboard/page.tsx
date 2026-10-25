'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';
import { apiFetch } from '../../lib/api';
import AttendanceModal from '../../components/AttendanceModal';
import PayslipModal from '../../components/PayslipModal';
import { StatCard } from '../../components/ui/StatCard';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Sparkles,
  CalendarDays,
  Camera,
  ShieldCheck,
  FileText,
  Building,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  DollarSign,
  Search,
} from 'lucide-react';

function DashboardOverviewContent() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string[] | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Modals
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  // Quick check-out action
  const [checkingOut, setCheckingOut] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Roster filter
  const [rosterFilter, setRosterFilter] = useState<'all' | 'present' | 'late'>('all');
  const [rosterSearch, setRosterSearch] = useState('');

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const endpoint =
        user.role === 'admin'
          ? '/analytics/admin'
          : user.role === 'hr'
          ? '/analytics/hr'
          : '/analytics/employee';

      const res = await apiFetch(endpoint);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        // Safe Zero-State Fallback (No Mock Data)
        setData({
          kpis: {
            totalEmployees: 0,
            attendanceRate: 0,
            latePercentage: 0,
            monthlyPayrollCost: 0,
            attritionRate: 0,
          },
          monthlyMetrics: {
            workingDaysInMonth: 22,
            present: 0,
            late: 0,
            halfDay: 0,
            totalApprovedLeaveDays: 0,
            attendanceRate: 0,
          },
          todayAttendance: {
            checkedInCount: 0,
            present: 0,
            late: 0,
            attendanceList: [],
          },
          departmentDistribution: [],
          pendingLeaves: [],
          lateComers: [],
          stats: {
            leaveBalances: { annual: 14, sick: 8, casual: 10 },
            monthlySummary: { present: 0, late: 0, totalHoursWorked: 0 },
            lastPayslip: null,
          },
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // AI Dashboard Summary
  const handleGenerateAiSummary = async () => {
    if (!data) return;
    setGeneratingAi(true);
    try {
      const kpis = user?.role === 'admin' ? data.kpis : data.monthlyMetrics;
      const res = await apiFetch('/ai/summary', {
        method: 'POST',
        body: JSON.stringify({ kpis }),
      });
      if (res.success && res.summary) {
        setAiSummary(res.summary);
      }
    } catch (err) {
      console.error('AI summary error:', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Quick standard web check-out
  const handleQuickCheckOut = async () => {
    setCheckingOut(true);
    setActionMessage(null);
    try {
      const res = await apiFetch('/attendance/check-out', { method: 'POST' });
      if (res.success) {
        setActionMessage(res.message || 'Checked out successfully.');
        fetchDashboardData();
      }
    } catch (err: any) {
      setActionMessage(err.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="w-8 h-8 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#94A3B8]">Syncing Live Workforce Ledger...</span>
      </div>
    );
  }

  // =========================================================================
  // 1. ADMIN EXECUTIVE OVERVIEW
  // =========================================================================
  if (user?.role === 'admin') {
    const kpis = data.kpis || {};
    const monthly = data.monthlyMetrics || {};
    const latestPayroll = data.latestPayroll;
    const avgSalary =
      kpis.totalEmployees > 0 && latestPayroll?.totalGross
        ? Math.round(latestPayroll.totalGross / kpis.totalEmployees)
        : 0;

    const rosterList = (data.todayAttendance?.attendanceList || []).filter((item: any) => {
      const matchesFilter =
        rosterFilter === 'all' ||
        (rosterFilter === 'present' && item.status === 'present') ||
        (rosterFilter === 'late' && item.status === 'late');

      const matchesSearch =
        !rosterSearch ||
        (item.userId?.name && item.userId.name.toLowerCase().includes(rosterSearch.toLowerCase())) ||
        (item.userId?.employeeCode &&
          item.userId.employeeCode.toLowerCase().includes(rosterSearch.toLowerCase()));

      return matchesFilter && matchesSearch;
    });

    return (
      <div className="dashboard-overview space-y-6 max-w-[1480px] mx-auto">
        {/* Top Header & AI Summary Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#203044] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                Executive Overview
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-semibold uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Live organizational metrics, punctuality ratios, payroll disbursements, and workforce ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateAiSummary}
              disabled={generatingAi}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs transition duration-150 shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generatingAi ? 'Synthesizing...' : 'Generate AI KPI Briefing'}</span>
            </button>
          </div>
        </div>

        {/* AI Synthesis Card */}
        {aiSummary && (
          <div className="p-5 rounded-2xl bg-[#0D1928] border border-emerald-600/40 text-xs shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#203044] pb-3 mb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                <span>Executive AI Synthesis</span>
              </div>
              <button
                onClick={() => setAiSummary(null)}
                className="text-[10px] text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                Dismiss
              </button>
            </div>
            <ul className="space-y-2 text-[#94A3B8]">
              {aiSummary.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mt-1.5 shrink-0" />
                  <span className="leading-relaxed text-[#F8FAFC]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Zero Dummy Data Protocol Banner */}
        {kpis.totalEmployees === 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1928] border border-[#203044] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-[#F8FAFC]">
                    Clean Slate Protocol Active (Zero Dummy Data Standard)
                  </h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
                    REAL MONGODB TWIN
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  The database has zero pre-seeded mock employees. All KPI widgets, rosters, and salary bars compute dynamically as staff accounts are provisioned.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/dashboard/hr-users"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create HR Account</span>
              </Link>
            </div>
          </div>
        )}

        {/* 6 EXECUTIVE KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Headcount"
            value={kpis.totalEmployees || 0}
            subtitle="Active Personnel"
            tag="Live Query"
            icon={Users}
            variant="emerald"
          />

          <StatCard
            title="Attendance Rate"
            value={`${kpis.attendanceRate || 0}%`}
            subtitle="Formula 4.D Rate"
            tag="Working Days"
            icon={CheckCircle2}
            variant="emerald"
            chart={
              <div className="w-14 h-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#111E30]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#22C55E]"
                    strokeDasharray={`${kpis.attendanceRate || 0}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            }
          />

          <StatCard
            title="Late Ratio"
            value={`${kpis.latePercentage || 0}%`}
            subtitle="09:15 AM Grace"
            tag={Number(kpis.latePercentage) > 0 ? 'Warning' : 'Optimal'}
            icon={Clock}
            variant={Number(kpis.latePercentage) > 0 ? 'amber' : 'emerald'}
            chart={
              <div className="h-14 w-14">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path stroke="#142435" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke={Number(kpis.latePercentage) > 0 ? '#f59e0b' : '#22c55e'} strokeDasharray={`${Math.min(Number(kpis.latePercentage) || 0, 100)}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
            }
          />

          <StatCard
            title="Monthly Payroll"
            value={`PKR ${(kpis.monthlyPayrollCost || 0).toLocaleString()}`}
            subtitle="Net Disbursed"
            tag="Pakistan Slabs"
            icon={CreditCard}
            variant="emerald"
          />

        </div>

        {/* CHARTS & BREAKDOWN ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Department Distribution (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0D1928] border border-[#203044] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-[#203044] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-[#F8FAFC]">Department Distribution</h3>
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  {(data.departmentDistribution || []).length} Departments
                </span>
              </div>

              <div className="space-y-3.5">
                {(data.departmentDistribution || []).length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#111E30] border border-[#203044] text-[#94A3B8] flex items-center justify-center mx-auto mb-2.5">
                      <Building className="w-5 h-5 text-[#64748B]" />
                    </div>
                    <p className="text-xs font-semibold text-[#F8FAFC]">No Department Records</p>
                    <p className="text-[11px] text-[#94A3B8] mt-1 max-w-xs mx-auto">
                      Staff registrations will dynamically compute headcount bars and distribution percentages here.
                    </p>
                  </div>
                ) : (
                  data.departmentDistribution.map((d: any, idx: number) => {
                    const total = kpis.totalEmployees || 1;
                    const pct = Math.round((d.count / total) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#F8FAFC]">{d.department}</span>
                          <span className="font-mono text-[11px] text-emerald-400 font-medium">
                            {d.count} staff ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#020817] border border-[#203044] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#203044] mt-5">
              <Link
                href="/dashboard/org"
                className="w-full py-2.5 px-3 rounded-xl bg-[#111E30] hover:bg-[#203044] border border-[#203044] text-xs font-semibold text-[#F8FAFC] transition flex items-center justify-center gap-1.5"
              >
                <span>Manage Organization Hierarchy</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </Link>
            </div>
          </div>

          {/* Monthly Attendance Trends (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0D1928] border border-[#203044] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-[#203044] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-[#F8FAFC]">Attendance Overview & Ratios</h3>
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  Working Days: {monthly.workingDaysInMonth || 22} Days
                </span>
              </div>

              {/* Status Indicator Chips */}
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-[#020817] border border-[#203044]">
                  <span className="text-[11px] text-[#94A3B8] block">Present Shifts</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                    {monthly.present || 0}
                  </span>
                  <span className="text-[9px] text-[#64748B] font-mono">On-Time Checkins</span>
                </div>

                <div className="p-3 rounded-xl bg-[#020817] border border-[#203044]">
                  <span className="text-[11px] text-[#94A3B8] block">Late Arrivals</span>
                  <span className="text-lg font-bold text-amber-400 font-mono mt-0.5 block">
                    {monthly.late || 0}
                  </span>
                  <span className="text-[9px] text-[#64748B] font-mono">Post 09:15 AM</span>
                </div>

                <div className="p-3 rounded-xl bg-[#020817] border border-[#203044]">
                  <span className="text-[11px] text-[#94A3B8] block">Half-Day Records</span>
                  <span className="text-lg font-bold text-sky-400 font-mono mt-0.5 block">
                    {monthly.halfDay || 0}
                  </span>
                  <span className="text-[9px] text-[#64748B] font-mono">&lt; 5.0h Duration</span>
                </div>

                <div className="p-3 rounded-xl bg-[#020817] border border-[#203044]">
                  <span className="text-[11px] text-[#94A3B8] block">Approved Leaves</span>
                  <span className="text-lg font-bold text-indigo-400 font-mono mt-0.5 block">
                    {monthly.totalApprovedLeaveDays || 0}d
                  </span>
                  <span className="text-[9px] text-[#64748B] font-mono">Paid Deductions</span>
                </div>

                <div className="p-3 rounded-xl bg-[#020817] border border-[#203044]">
                  <span className="text-[11px] text-[#94A3B8] block">Average Salary</span>
                  <span className="text-lg font-bold text-sky-400 font-mono mt-0.5 block">PKR {avgSalary.toLocaleString()}</span>
                  <span className="text-[9px] text-[#64748B] font-mono">Per Active Employee</span>
                </div>

                <div className="p-3 rounded-xl bg-[#020817] border border-[#203044]">
                  <span className="text-[11px] text-[#94A3B8] block">Attrition YTD</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{kpis.attritionRate || 0}%</span>
                  <span className="text-[9px] text-[#64748B] font-mono">Exits ÷ Avg. Headcount</span>
                </div>
              </div>

              {/* Attendance Composition Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#F8FAFC]">Monthly Attendance Ratio</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {monthly.attendanceRate || 0}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#020817] border border-[#203044] overflow-hidden flex">
                  <div
                    className="bg-[#22C55E] h-full"
                    style={{ width: `${monthly.attendanceRate || 0}%` }}
                    title="Present / Working Days"
                  />
                  <div
                    className="bg-[#EF4444] h-full"
                    style={{ width: `${Math.max(0, 100 - (monthly.attendanceRate || 0))}%` }}
                    title="Absent / Unlogged"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    Effective Attendance ({monthly.attendanceRate || 0}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    Absence Gap ({Math.max(0, 100 - (monthly.attendanceRate || 0))}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#203044] mt-5">
              <Link
                href="/dashboard/attendance"
                className="w-full py-2.5 px-3 rounded-xl bg-[#111E30] hover:bg-[#203044] border border-[#203044] text-xs font-semibold text-[#F8FAFC] transition flex items-center justify-center gap-1.5"
              >
                <span>Open Detailed Attendance Board</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </Link>
            </div>
          </div>
        </div>

        {/* TODAY'S ATTENDANCE ROSTER */}
        <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#203044] pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-[#F8FAFC]">Today's Attendance Roster</h3>
              </div>
              <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                Calendar Date: {data.todayAttendance?.date || 'Today'} • {data.todayAttendance?.checkedInCount || 0} Checked In
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Filter by name/code..."
                  className="bg-[#020817] border border-[#203044] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#16A34A] focus:outline-none"
                />
              </div>

              <div className="flex items-center p-0.5 bg-[#020817] border border-[#203044] rounded-lg text-[11px] font-mono">
                <button
                  onClick={() => setRosterFilter('all')}
                  className={`px-2.5 py-1 rounded transition ${
                    rosterFilter === 'all'
                      ? 'bg-[#111E30] text-[#F8FAFC] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  All ({data.todayAttendance?.checkedInCount || 0})
                </button>
                <button
                  onClick={() => setRosterFilter('present')}
                  className={`px-2.5 py-1 rounded transition ${
                    rosterFilter === 'present'
                      ? 'bg-emerald-950/70 text-emerald-400 font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Present ({data.todayAttendance?.present || 0})
                </button>
                <button
                  onClick={() => setRosterFilter('late')}
                  className={`px-2.5 py-1 rounded transition ${
                    rosterFilter === 'late'
                      ? 'bg-amber-950/70 text-amber-400 font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Late ({data.todayAttendance?.late || 0})
                </button>
              </div>
            </div>
          </div>

          {/* Roster Table or Clean Empty State */}
          {rosterList.length === 0 ? (
            <div className="py-14 px-4 text-center border border-dashed border-[#203044] rounded-xl bg-[#020817]/40">
              <div className="w-12 h-12 rounded-xl bg-[#111E30] border border-[#203044] text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-[#F8FAFC]">No Check-Ins Matching Filter</h4>
              <p className="text-xs text-[#94A3B8] mt-1.5 max-w-sm mx-auto leading-relaxed">
                As employees record daily shifts via camera or self-service, check-in timestamps and verification badges will populate here in real-time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#203044] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#03101D] text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px] border-b border-[#203044]">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Check In</th>
                    <th className="p-3">Check Out</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#203044]">
                  {rosterList.map((att: any) => (
                    <tr key={att._id} className="hover:bg-[#111E30]/50 transition">
                      <td className="p-3 font-semibold text-[#F8FAFC]">
                        {att.userId?.name || 'Staff Member'}
                        <span className="block text-[10px] text-emerald-400 font-mono font-normal">
                          {att.userId?.employeeCode || att.userId?.employeeId || 'EMP-ID'}
                        </span>
                      </td>
                      <td className="p-3 text-[#94A3B8]">
                        {att.userId?.department || 'Operations'}
                      </td>
                      <td className="p-3 font-mono text-[#F8FAFC]">
                        {att.checkIn
                          ? new Date(att.checkIn).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="p-3 font-mono text-[#F8FAFC]">
                        {att.checkOut
                          ? new Date(att.checkOut).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            att.status === 'present'
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                              : att.status === 'late'
                              ? 'bg-amber-950/70 text-amber-400 border border-amber-800/60'
                              : 'bg-rose-950/70 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-[#94A3B8] font-mono">
                        {att.faceVerified ? 'Face verified' : 'Web Timestamp'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. HR OPERATIONS HUB
  // =========================================================================
  if (user?.role === 'hr') {
    const today = data.todayAttendance || {};

    return (
      <div className="dashboard-overview space-y-6 max-w-[1480px] mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#203044] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                HR People Operations Hub
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 font-semibold uppercase">
                HR Officer
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Workforce registration, leave approvals queue, daily roster reconciliation, and payroll drafting.
            </p>
          </div>

          <button
            onClick={handleGenerateAiSummary}
            disabled={generatingAi}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs transition duration-150 shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generatingAi ? 'Generating...' : 'AI Operational Synthesis'}</span>
          </button>
        </div>

        {/* AI HR Summary */}
        {aiSummary && (
          <div className="p-5 rounded-2xl bg-[#0D1928] border border-emerald-600/40 text-xs shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#203044] pb-3 mb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                <span>Operational Briefing</span>
              </div>
              <button
                onClick={() => setAiSummary(null)}
                className="text-[10px] text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                Dismiss
              </button>
            </div>
            <ul className="space-y-2 text-[#94A3B8]">
              {aiSummary.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mt-1.5 shrink-0" />
                  <span className="leading-relaxed text-[#F8FAFC]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* HR KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={today.totalEmployees || 0}
            subtitle="Registered Roster"
            tag="Active"
            icon={Users}
            variant="emerald"
          />

          <StatCard
            title="Present Today"
            value={today.present || 0}
            subtitle="On-Time Arrivals"
            tag="Today"
            icon={CheckCircle2}
            variant="emerald"
          />

          <StatCard
            title="Late Arrivals"
            value={today.late || 0}
            subtitle="Past 09:15 AM Grace"
            tag="Review"
            icon={Clock}
            variant="amber"
          />

          <StatCard
            title="Pending Approvals"
            value={(data.pendingLeaves || []).length + (data.pendingCorrections || []).length}
            subtitle="Action Items"
            tag="Queue"
            icon={CalendarDays}
            variant="blue"
          />
        </div>

        {/* HR Quick Actions Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard/employees"
            className="p-4 rounded-2xl bg-[#0D1928] hover:bg-[#111E30] border border-[#203044] hover:border-emerald-500/40 transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-[#F8FAFC]">Register Staff</span>
              <span className="block text-[10px] text-[#94A3B8]">Add Employee & Salary</span>
            </div>
          </Link>

          <Link
            href="/dashboard/leaves"
            className="p-4 rounded-2xl bg-[#0D1928] hover:bg-[#111E30] border border-[#203044] hover:border-emerald-500/40 transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-[#F8FAFC]">Leave Inbox</span>
              <span className="block text-[10px] text-[#94A3B8]">Review & Decision</span>
            </div>
          </Link>

          <Link
            href="/dashboard/attendance"
            className="p-4 rounded-2xl bg-[#0D1928] hover:bg-[#111E30] border border-[#203044] hover:border-amber-500/40 transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-[#F8FAFC]">Daily Board</span>
              <span className="block text-[10px] text-[#94A3B8]">Grace & Corrections</span>
            </div>
          </Link>

          <Link
            href="/dashboard/payroll"
            className="p-4 rounded-2xl bg-[#0D1928] hover:bg-[#111E30] border border-[#203044] hover:border-emerald-500/40 transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-[#F8FAFC]">Generate Payroll</span>
              <span className="block text-[10px] text-[#94A3B8]">Calculate Month Run</span>
            </div>
          </Link>
        </div>

        {/* Queues: Pending Leaves & Late Comers Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pending Leaves Queue */}
          <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-[#F8FAFC]">Pending Leave Applications</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111E30] text-[#94A3B8] border border-[#203044]">
                  {(data.pendingLeaves || []).length} Awaiting
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {(data.pendingLeaves || []).length === 0 ? (
                  <div className="text-xs text-[#94A3B8] text-center py-12 font-mono">
                    No pending leave applications. Backlog is clear!
                  </div>
                ) : (
                  data.pendingLeaves.map((l: any) => (
                    <div
                      key={l._id}
                      className="p-3.5 rounded-xl bg-[#020817] border border-[#203044] text-xs space-y-1.5 hover:border-emerald-500/30 transition"
                    >
                      <div className="flex justify-between items-start font-semibold text-[#F8FAFC]">
                        <span>
                          {l.userId?.name} ({l.userId?.employeeCode || l.userId?.employeeId})
                        </span>
                        <span className="uppercase text-[10px] text-amber-400 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          {l.type} ({l.daysCount}d)
                        </span>
                      </div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {l.startDate} to {l.endDate} • Reason: "{l.reason}"
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#203044] mt-4">
              <Link
                href="/dashboard/leaves"
                className="w-full py-2 px-3 rounded-xl bg-[#111E30] hover:bg-[#203044] border border-[#203044] text-xs font-semibold text-[#F8FAFC] transition flex items-center justify-center gap-1.5"
              >
                <span>Process Leave Queue</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </Link>
            </div>
          </div>

          {/* Late Comers Alert */}
          <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-[#F8FAFC]">Recurring Late Comers Alert</h3>
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8]">This Month</span>
              </div>

              <div className="space-y-2.5">
                {(data.lateComers || []).length === 0 ? (
                  <div className="text-xs text-[#94A3B8] text-center py-12 font-mono">
                    Zero recurring late arrivals. Perfect punctuality recorded!
                  </div>
                ) : (
                  data.lateComers.map((c: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3.5 rounded-xl bg-[#020817] border border-[#203044] text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#F8FAFC] block">{c.name}</span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          {c.department} • {c.employeeCode || c.employeeId}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-amber-950/70 text-amber-400 border border-amber-800/50 font-mono text-[10px] font-bold">
                        {c.lateCount} late arrivals
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#203044] mt-4">
              <Link
                href="/dashboard/attendance"
                className="w-full py-2 px-3 rounded-xl bg-[#111E30] hover:bg-[#203044] border border-[#203044] text-xs font-semibold text-[#F8FAFC] transition flex items-center justify-center gap-1.5"
              >
                <span>View Attendance Logs</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. EMPLOYEE PERSONAL OVERVIEW
  // =========================================================================
  const stats = data.stats || {};
  const todayRecord = data.todayRecord;
  const isCheckedIn = Boolean(todayRecord?.checkIn);
  const isCheckedOut = Boolean(todayRecord?.checkOut);

  // Live 09:15 Grace Status calculation
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const graceMinutes = 9 * 60 + 15; // 09:15 AM
  const isGraceActive = currentMinutes <= graceMinutes;

  return (
    <div className="dashboard-overview space-y-6 max-w-[1480px] mx-auto">
      {/* Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#203044] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
              Welcome, {user?.name}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111E30] text-[#94A3B8] border border-[#203044] font-semibold uppercase">
              Staff Portal
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1 font-mono">
            {user?.designation} • {user?.department} • ID: {user?.employeeCode || user?.employeeId}
          </p>
        </div>

        <Link
          href="/dashboard/leaves"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs transition duration-150 shadow-md shadow-emerald-950/50 self-start sm:self-auto cursor-pointer"
        >
          <CalendarDays className="w-4 h-4" />
          <span>Apply for Leave</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Shift & 09:15 Grace Status Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1928] border border-[#203044] flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#F8FAFC]">
              Official Shift: 09:00 AM – 06:00 PM (9.0h)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#020817] text-[#94A3B8] border border-[#203044]">
              Grace Cutoff: 09:15 AM
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isCheckedIn ? (
              todayRecord?.status === 'present' ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-3 py-1.5 rounded-xl font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    On-Time Arrival (Checked in at{' '}
                    {new Date(todayRecord.checkIn).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    )
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/70 border border-amber-800/50 px-3 py-1.5 rounded-xl font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Late Arrival (Checked in at{' '}
                    {new Date(todayRecord.checkIn).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    )
                  </span>
                </div>
              )
            ) : isGraceActive ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-3 py-1.5 rounded-xl font-medium">
                <Clock className="w-4 h-4" />
                <span>Grace Window Active (Arrivals before 09:15 AM are On-Time)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/70 border border-amber-800/50 px-3 py-1.5 rounded-xl font-medium">
                <AlertTriangle className="w-4 h-4" />
                <span>Past 09:15 AM Grace Threshold (Check-in logged as Late)</span>
              </div>
            )}

            {isCheckedIn && (
              <span className="text-[10px] text-[#94A3B8] font-mono">
                • {todayRecord?.faceVerified ? 'Face verified' : 'Web Timestamp'}
              </span>
            )}
          </div>
        </div>

        {/* Check-In / Check-Out Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isCheckedIn ? (
            <button
              onClick={() => setShowCameraModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Face Verification Check-In</span>
            </button>
          ) : !isCheckedOut ? (
            <button
              onClick={handleQuickCheckOut}
              disabled={checkingOut}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EF4444] to-rose-600 hover:from-rose-700 hover:to-rose-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 transition cursor-pointer disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
              <span>{checkingOut ? 'Checking Out...' : 'Check Out Now'}</span>
            </button>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-[#020817] border border-[#203044] text-[#94A3B8] text-xs font-mono">
              ✓ Day Completed ({todayRecord?.workHours || 0} hrs logged)
            </span>
          )}
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
          <span className="text-xs font-medium text-[#94A3B8]">Annual Leave Quota</span>
          <div className="text-3xl font-bold text-[#F8FAFC] mt-2 font-mono">
            {stats.leaveBalances?.annual ?? 14}{' '}
            <span className="text-xs font-normal text-[#64748B]">days remaining</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1.5 block">
            Statutory Paid Annual Allocation
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
          <span className="text-xs font-medium text-[#94A3B8]">Sick Leave Quota</span>
          <div className="text-3xl font-bold text-[#F8FAFC] mt-2 font-mono">
            {stats.leaveBalances?.sick ?? 8}{' '}
            <span className="text-xs font-normal text-[#64748B]">days remaining</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1.5 block">
            Medical & Emergency Leaves
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
          <span className="text-xs font-medium text-[#94A3B8]">Casual Leave Quota</span>
          <div className="text-3xl font-bold text-[#F8FAFC] mt-2 font-mono">
            {stats.leaveBalances?.casual ?? 10}{' '}
            <span className="text-xs font-normal text-[#64748B]">days remaining</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1.5 block">
            Personal & Short Absence
          </span>
        </div>
      </div>

      {/* Attendance & Payslip Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly Attendance Summary (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-[#F8FAFC]">Monthly Shift Attendance Summary</h3>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8]">This Month</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-[#020817] border border-[#203044]">
                <span className="text-[11px] text-[#94A3B8] block">Days Present</span>
                <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
                  {stats.monthlySummary?.present || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#020817] border border-[#203044]">
                <span className="text-[11px] text-[#94A3B8] block">Days Late</span>
                <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
                  {stats.monthlySummary?.late || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#020817] border border-[#203044]">
                <span className="text-[11px] text-[#94A3B8] block">Hours Logged</span>
                <span className="text-xl font-bold text-[#F8FAFC] font-mono mt-1 block">
                  {stats.monthlySummary?.totalHoursWorked || 0}h
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Weekly 40-Hour Benchmark</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {Math.min(100, Math.round(((stats.monthlySummary?.totalHoursWorked || 0) / 40) * 100))}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#020817] border border-[#203044] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((stats.monthlySummary?.totalHoursWorked || 0) / 40) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#203044] mt-5">
            <Link
              href="/dashboard/attendance"
              className="w-full py-2.5 px-3 rounded-xl bg-[#111E30] hover:bg-[#203044] border border-[#203044] text-xs font-semibold text-[#F8FAFC] transition flex items-center justify-center gap-1.5"
            >
              <span>View Attendance Log & Request Corrections</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            </Link>
          </div>
        </div>

        {/* Latest Payslip Summary (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-[#F8FAFC]">Latest Official Payslip</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
                Verified
              </span>
            </div>

            {stats.lastPayslip ? (
              <div className="p-4 rounded-xl bg-[#020817] border border-[#203044] space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#94A3B8]">Period</span>
                  <span className="font-mono text-xs font-bold text-[#F8FAFC]">
                    {stats.lastPayslip.month}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#94A3B8]">Gross Salary</span>
                  <span className="font-mono text-xs text-[#F8FAFC]">
                    PKR {(stats.lastPayslip.grossSalary || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#94A3B8]">Tax & Deductions</span>
                  <span className="font-mono text-xs text-rose-400">
                    - PKR{' '}
                    {(
                      (stats.lastPayslip.taxDeduction || 0) +
                      (stats.lastPayslip.attendanceDeduction || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#203044] flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[#F8FAFC]">Net Disbursed</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    PKR {(stats.lastPayslip.netSalary || 0).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedPayslip(stats.lastPayslip);
                    setShowPayslipModal(true);
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Printable Slip</span>
                </button>
              </div>
            ) : (
              <div className="py-12 px-4 text-center border border-dashed border-[#203044] rounded-xl bg-[#020817]/40">
                <FileText className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#F8FAFC]">No Payslip Disbursed Yet</p>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Once monthly payroll is finalized by Administration, your locked payslip will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#203044] mt-5">
            <Link
              href="/dashboard/payroll"
              className="w-full py-2.5 px-3 rounded-xl bg-[#111E30] hover:bg-[#203044] border border-[#203044] text-xs font-semibold text-[#F8FAFC] transition flex items-center justify-center gap-1.5"
            >
              <span>View All Payslips Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Attendance Modal */}
      {showCameraModal && (
        <AttendanceModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onSuccess={() => {
            setShowCameraModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* Payslip Modal */}
      {showPayslipModal && selectedPayslip && (
        <PayslipModal
          isOpen={showPayslipModal}
          onClose={() => setShowPayslipModal(false)}
          payslip={selectedPayslip}
        />
      )}
    </div>
  );
}

export default function DashboardOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-xs font-mono text-[#94A3B8]">
          Loading workforce dashboard...
        </div>
      }
    >
      <DashboardOverviewContent />
    </Suspense>
  );
}
