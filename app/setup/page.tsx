'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { apiFetch } from '../../lib/api';
import {
  Building2,
  Clock,
  ShieldCheck,
  MapPin,
  CalendarDays,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Shield,
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
  const [officeLatitude, setOfficeLatitude] = useState(24.8607);
  const [officeLongitude, setOfficeLongitude] = useState(67.0011);
  const [officeRadiusMeters, setOfficeRadiusMeters] = useState(150);

  const [annualLeaveQuota, setAnnualLeaveQuota] = useState(14);
  const [sickLeaveQuota, setSickLeaveQuota] = useState(8);
  const [casualLeaveQuota, setCasualLeaveQuota] = useState(10);

  const [adminName, setAdminName] = useState('Master Administrator');
  const [adminEmail, setAdminEmail] = useState('admin@saylani.com');
  const [adminPassword, setAdminPassword] = useState('AdminSaylani2026!');

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
          officeLatitude,
          officeLongitude,
          officeRadiusMeters,
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
    <div className="min-h-screen bg-[#020817] text-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-10 antialiased selection:bg-emerald-600/30 selection:text-emerald-300">
      <div className="w-full max-w-3xl bg-[#0D1928] border border-[#203044] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[#203044] bg-[#03101D]">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 uppercase">
              First-Run Protocol
            </span>
            <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-semibold bg-[#111E30] text-[#94A3B8] border border-[#203044]">
              Clean Slate Provisioning
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-3">
            <span>Initialize Master Enterprise Organization</span>
          </h1>
          <p className="mt-1.5 text-xs text-[#94A3B8] leading-relaxed max-w-2xl">
            Configure baseline office working hours (09:00–18:00), 15-minute grace parameters, Zaitoon Ashraf IT Park geofence coordinates, statutory leave quotas, and master administrator credentials.
          </p>
        </div>

        {error && (
          <div className="m-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/70 text-rose-300 flex items-center gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="m-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Setup verified successfully! Redirecting to Executive Overview...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Section 1: Company Profile */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>1. Organization Information</span>
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
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>2. Official Shift & Punctuality Engine</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

          {/* Section 3: Geofence Office Boundary */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>3. Geofence Perimeter (Zaitoon Ashraf IT Park)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Office Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={officeLatitude}
                  onChange={(e) => setOfficeLatitude(Number(e.target.value))}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Office Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={officeLongitude}
                  onChange={(e) => setOfficeLongitude(Number(e.target.value))}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Allowed Radius (Meters)
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  max={5000}
                  value={officeRadiusMeters}
                  onChange={(e) => setOfficeRadiusMeters(Number(e.target.value))}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Annual Leave Quotas */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <span>4. Annual Statutory Leave Quotas</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#203044]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>5. Root Master Administrator Account (ADM-001)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#203044] flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs transition duration-150 flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Initializing Workspace...' : 'Initialize Organization & Admin Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
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
