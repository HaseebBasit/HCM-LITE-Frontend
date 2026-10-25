'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import {
  Building2,
  Clock,
  CalendarDays,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export default function CompanySettingsClient() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'quotas'>('profile');

  // Form Fields
  const [name, setName] = useState('');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [halfDayHoursThreshold, setHalfDayHoursThreshold] = useState(5.0);
  const [annualQuota, setAnnualQuota] = useState(14);
  const [sickQuota, setSickQuota] = useState(8);
  const [casualQuota, setCasualQuota] = useState(10);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/company');
      if (res.success && res.company) {
        const c = res.company;
        setName(c.name || '');
        setWorkStart(c.workHours?.start || '09:00');
        setWorkEnd(c.workHours?.end || '18:00');
        setGracePeriodMinutes(c.gracePeriodMinutes ?? 15);
        setHalfDayHoursThreshold(c.halfDayHoursThreshold ?? 5.0);
        setAnnualQuota(c.leaveQuotas?.annual ?? 14);
        setSickQuota(c.leaveQuotas?.sick ?? 8);
        setCasualQuota(c.leaveQuotas?.casual ?? 10);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await apiFetch('/company', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          workHours: { start: workStart, end: workEnd },
          gracePeriodMinutes,
          halfDayHoursThreshold,
          leaveQuotas: { annual: annualQuota, sick: sickQuota, casual: casualQuota },
        }),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.message || 'Update failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-xs text-rose-400 bg-rose-950/20 rounded-2xl border border-rose-500/30">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <h3 className="font-bold text-sm">Access Denied</h3>
        <p className="mt-1">Company settings are strictly restricted to Master Administrators.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-xs font-mono text-[#94A3B8]">
        <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mr-2" />
        Loading organization parameters...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Company Settings & Enterprise Parameters"
        subtitle="Manage organization profile, working hours, attendance grace rules, and statutory leave quotas."
        badge="Master Admin Protected"
        badgeVariant="emerald"
        actions={
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        }
      />

      {/* Messages */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Company settings and global policy parameters updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[#203044] text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'profile'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'hours'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Shift Timings & Grace</span>
        </button>

        <button
          onClick={() => setActiveTab('quotas')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'quotas'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Statutory Quotas</span>
        </button>
      </div>

      {/* ================= TAB 1: COMPANY PROFILE ================= */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#203044]">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-[#F8FAFC]">Legal Organization Details</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                Company Legal Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full sm:w-2/3 bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
              />
              <p className="text-[11px] text-[#64748B] mt-1.5">
                Displays on official payslips, top navigation headers, and automated communication.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SHIFT TIMINGS & GRACE ================= */}
      {activeTab === 'hours' && (
        <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#203044]">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-[#F8FAFC]">Office Shift Hours & Grace Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                Official Shift Start Time
              </label>
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                Official Shift End Time
              </label>
              <input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                Punctuality Grace Period (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={gracePeriodMinutes}
                onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
              />
              <p className="text-[11px] text-[#64748B] mt-1 font-mono">
                Arrivals up to 09:15 AM are categorized as On-Time.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                Half-Day Minimum Hours Threshold
              </label>
              <input
                type="number"
                step="0.5"
                min={1}
                max={12}
                value={halfDayHoursThreshold}
                onChange={(e) => setHalfDayHoursThreshold(Number(e.target.value))}
                className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
              />
              <p className="text-[11px] text-[#64748B] mt-1 font-mono">
                Shifts with &lt; 5.0 hours are classified as Half Day.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: STATUTORY QUOTAS ================= */}
      {activeTab === 'quotas' && (
        <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#203044]">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-[#F8FAFC]">Annual Statutory Leave Quotas</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                Annual Paid Allocation
              </label>
              <input
                type="number"
                min={0}
                value={annualQuota}
                onChange={(e) => setAnnualQuota(Number(e.target.value))}
                className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
              />
              <span className="text-[10px] text-[#64748B] font-mono mt-1 block">Baseline: 14 days</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                Sick / Medical Allocation
              </label>
              <input
                type="number"
                min={0}
                value={sickQuota}
                onChange={(e) => setSickQuota(Number(e.target.value))}
                className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
              />
              <span className="text-[10px] text-[#64748B] font-mono mt-1 block">Baseline: 8 days</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                Casual / Personal Allocation
              </label>
              <input
                type="number"
                min={0}
                value={casualQuota}
                onChange={(e) => setCasualQuota(Number(e.target.value))}
                className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
              />
              <span className="text-[10px] text-[#64748B] font-mono mt-1 block">Baseline: 10 days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
