'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { apiFetch } from '../../lib/api';
import {
  Building2,
  Clock,
  ShieldCheck,
  CalendarDays,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Sparkles,
} from 'lucide-react';

function SetupContent() {
  const router = useRouter();
  const { isSetup, login, checkSetup } = useAuth();

  const [companyName, setCompanyName] = useState('Saylani Enterprises');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [halfDayHoursThreshold, setHalfDayHoursThreshold] = useState(5.0);

  const [annualLeaveQuota, setAnnualLeaveQuota] = useState(14);
  const [sickLeaveQuota, setSickLeaveQuota] = useState(8);
  const [casualLeaveQuota, setCasualLeaveQuota] = useState(10);

  const [adminName, setAdminName] = useState('Master Administrator');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isSetup === true) {
      router.replace('/login');
    }
  }, [isSetup, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await apiFetch('/auth/setup', {
        method: 'POST',
        body: JSON.stringify({
          companyName,
          workStart,
          workEnd,
          gracePeriodMinutes,
          halfDayHoursThreshold,
          annualLeaveQuota,
          sickLeaveQuota,
          casualLeaveQuota,
          adminName,
          adminEmail,
          adminPassword,
        }),
      });

      if (res.success && res.token && res.user) {
        setSuccess(true);
        login(res.token, res.user);
        await checkSetup();
        setTimeout(() => {
          router.replace('/dashboard/admin');
        }, 1000);
      } else {
        setError(res.message || 'Setup failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during initial setup');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="setup-shell min-h-screen bg-[#f3f6f4] px-4 py-6 text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-950 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-[1320px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,.12)]">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-[#06131d] via-[#081a24] to-[#092319] px-6 py-7 text-white sm:px-9 sm:py-9 lg:px-12">
          <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-5 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-emerald-300">
                  <Building2 className="h-3.5 w-3.5" /> First-time setup
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-300">
                  About 3 minutes
                </span>
              </div>
              <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[34px]">
                <span>Create your workspace</span>
              </h1>
              <p className="mt-2.5 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                Set your organization profile, work rules, leave quotas, and primary administrator.
              </p>
            </div>
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-xs text-slate-300 lg:min-w-[230px]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-5 w-5" /></span>
              <span><strong className="block text-sm font-semibold text-white">Secure setup</strong><span className="mt-0.5 block text-slate-400">Credentials are protected</span></span>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="setup-notice setup-error mx-5 mt-5 flex items-center gap-2.5 rounded-xl border p-4 text-sm sm:mx-9 lg:mx-12">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div role="status" className="setup-notice setup-success mx-5 mt-5 flex items-center gap-2.5 rounded-xl border p-4 text-sm sm:mx-9 lg:mx-12">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Setup verified successfully! Redirecting to Executive Overview...</span>
          </div>
        )}

        <nav aria-label="Setup sections" className="setup-steps grid grid-cols-2 gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:grid-cols-2 sm:px-9 lg:grid-cols-4 lg:px-12">
          <a href="#organization" className="setup-step"><span>01</span> Organization</a>
          <a href="#schedule" className="setup-step"><span>02</span> Work schedule</a>
          <a href="#leave-quotas" className="setup-step"><span>03</span> Leave quotas</a>
          <a href="#administrator" className="setup-step"><span>04</span> Administrator</a>
        </nav>

        <form onSubmit={handleSubmit} className="setup-form space-y-5 px-5 py-6 sm:px-9 sm:py-8 lg:px-12 lg:py-10">
          {/* Section 1: Company Profile */}
          <div id="organization" className="setup-section">
            <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Organization information</span>
            </h2>
            <div>
              <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                Company Legal Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition"
                placeholder="e.g. Saylani Enterprises"
              />
            </div>
          </div>

          {/* Section 2: Shift Timings & Grace Rules */}
          <div id="schedule" className="setup-section">
            <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Work schedule & attendance rules</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Work Day Start
                </label>
                <input
                  type="time"
                  required
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Work Day End
                </label>
                <input
                  type="time"
                  required
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={60}
                  value={gracePeriodMinutes}
                  onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Half-Day Threshold (Hrs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  min={1}
                  max={12}
                  value={halfDayHoursThreshold}
                  onChange={(e) => setHalfDayHoursThreshold(Number(e.target.value))}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Annual Leave Quotas */}
          <div id="leave-quotas" className="setup-section">
            <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <span>Annual leave quotas</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Annual Paid Leaves
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={annualLeaveQuota}
                  onChange={(e) => setAnnualLeaveQuota(Number(e.target.value))}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Sick Leaves
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={sickLeaveQuota}
                  onChange={(e) => setSickLeaveQuota(Number(e.target.value))}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Casual Leaves
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={casualLeaveQuota}
                  onChange={(e) => setCasualLeaveQuota(Number(e.target.value))}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Master Admin Credentials */}
          <div id="administrator" className="setup-section">
            <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Primary administrator</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  minLength={12}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-[#94A3B8]">Use at least 12 characters.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="setup-submit flex flex-col-reverse items-stretch justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-slate-500">You can update organization settings later from Company Settings.</p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:from-emerald-700 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-wait disabled:opacity-50"
            >
              <span>{submitting ? 'Creating your workspace…' : 'Create workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020817] flex items-center justify-center text-[#94A3B8] text-xs font-mono">
          Loading system setup...
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
