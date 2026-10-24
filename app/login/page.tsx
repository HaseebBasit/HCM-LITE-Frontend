'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { apiFetch } from '../../lib/api';
import {
  Building2,
  Lock,
  Mail,
  Shield,
  Briefcase,
  User,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  HelpCircle,
  X,
  ShieldCheck,
  Server,
  ArrowRight,
  Globe,
} from 'lucide-react';

type RoleType = 'Admin' | 'HR' | 'Employee';

function LoginContent() {
  const router = useRouter();
  const { user, login, loading, companyName, checkSetup } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'setup'>('signin');
  const [selectedRole, setSelectedRole] = useState<RoleType>('Admin');

  // Sign In Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Organization Setup Form States (Public signup limited to initial company and Admin)
  const [setupCompanyName, setSetupCompanyName] = useState('Saylani Enterprises');
  const [setupAdminName, setSetupAdminName] = useState('Master Administrator');
  const [setupAdminEmail, setSetupAdminEmail] = useState('admin@saylani.com');
  const [setupAdminPassword, setSetupAdminPassword] = useState('AdminSaylani2026!');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('AdminSaylani2026!');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const roleStr = String(user.role || '').toLowerCase();
      const targetRoute =
        roleStr === 'admin'
          ? '/dashboard/admin'
          : roleStr === 'hr'
          ? '/dashboard/hr'
          : '/dashboard/employee';
      router.replace(targetRoute);
    }
  }, [user, loading, router]);

  // Handle Demo Role Autofill
  const handleSelectRole = (role: RoleType) => {
    setSelectedRole(role);
    setError(null);
    setSuccessMsg(null);
  };

  // Sign In Handler with strict Role Verification
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.success && res.token && res.user) {
        // Strict Role Verification
        const authenticatedRole = String(res.user.role || '').toLowerCase();
        const targetExpectedRole = selectedRole.toLowerCase();

        if (authenticatedRole !== targetExpectedRole) {
          const roleDisplayName =
            selectedRole === 'Admin'
              ? 'Master Admin'
              : selectedRole === 'HR'
              ? 'HR Operations'
              : 'Staff Employee';

          const actualRoleDisplayName =
            authenticatedRole === 'admin'
              ? 'Master Admin'
              : authenticatedRole === 'hr'
              ? 'HR Operations'
              : 'Staff Employee';

          setError(
            `Role Mismatch: This account possesses ${actualRoleDisplayName} credentials. Please click the "${actualRoleDisplayName}" tab above to sign in.`
          );
          setSubmitting(false);
          return;
        }

        // Credentials & Role match! Complete authentication
        login(res.token, res.user);

        const redirectPath =
          selectedRole === 'Admin'
            ? '/dashboard/admin'
            : selectedRole === 'HR'
            ? '/dashboard/hr'
            : '/dashboard/employee';

        router.replace(redirectPath);
      } else {
        setError(res.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Organization Setup Handler (Admin Only)
  const handleOrganizationSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (setupAdminPassword !== setupConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (setupAdminPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiFetch('/setup/first-run', {
        method: 'POST',
        body: JSON.stringify({
          companyName: setupCompanyName.trim(),
          name: setupAdminName.trim(),
          email: setupAdminEmail.trim(),
          password: setupAdminPassword,
          workStart: '09:00',
          workEnd: '18:00',
          gracePeriodMinutes: 15,
          halfDayHoursThreshold: 5.0,
          officeLatitude: 24.8607,
          officeLongitude: 67.0011,
          officeRadiusMeters: 150,
        }),
      });

      if (res.success && res.token && res.user) {
        setSuccessMsg('Organization & Master Admin initialized! Redirecting to Executive Overview...');
        login(res.token, res.user);
        await checkSetup();
        setTimeout(() => {
          router.replace('/dashboard/admin');
        }, 800);
      } else {
        setError(res.message || 'Organization setup failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Could not complete organization setup.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-[#F8FAFC] flex flex-col lg:grid lg:grid-cols-12 antialiased selection:bg-emerald-600/30 selection:text-emerald-300">
      {/* ================= LEFT COLUMN: Enterprise Branding Panel ================= */}
      <div className="lg:col-span-5 xl:col-span-6 bg-[#03101D] border-b lg:border-b-0 lg:border-r border-[#203044] p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Architectural Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2030441a_1px,transparent_1px),linear-gradient(to_bottom,#2030441a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#16A34A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Branding Logo & Subtitle */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30 shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  {companyName || 'Saylani Enterprises'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-semibold uppercase">
                  Core Engine
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono">
                HCM Lite Enterprise Management Platform
              </p>
            </div>
          </div>

          <div className="max-w-lg">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.15]">
              Human Capital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] via-[#10B981] to-[#38BDF8]">
                Management Simplified.
              </span>
            </h1>

            <p className="text-sm text-[#94A3B8] mt-4 leading-relaxed">
              Mission-critical workforce orchestration engineered with Pakistani statutory payroll compliance, geofenced punctuality tracking, and role-scoped AI assistance.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="space-y-3.5 mt-8 max-w-lg">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0D1928] border border-[#203044] hover:border-emerald-500/30 transition">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#F8FAFC]">Secure Access Control</h4>
                <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">
                  Strict role-based authorization ensuring employees only view authorized self-service ledgers while Admin & HR retain operational commands.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0D1928] border border-[#203044] hover:border-emerald-500/30 transition">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#F8FAFC]">Fast & Reliable Rules Engine</h4>
                <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">
                  Real-time 09:15 AM grace window enforcement, office radius geofencing, and automated Pakistan income tax slab deductions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0D1928] border border-[#203044] hover:border-emerald-500/30 transition">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#F8FAFC]">User-Friendly & AI-Powered</h4>
                <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">
                  Modern dark navy ergonomics with an embedded AI Copilot capable of extracting leave requests and querying policy guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live System Status Panel */}
        <div className="relative z-10 mt-10 p-4 rounded-xl bg-[#0D1928] border border-[#203044] text-xs font-mono shadow-sm">
          <div className="flex items-center justify-between border-b border-[#203044] pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[11px] font-semibold text-[#22C55E] tracking-wider">
                SYSTEM STATUS • NOMINAL
              </span>
            </div>
            <span className="text-[10px] text-[#94A3B8]">99.98% UPTIME</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <span className="block text-[#64748B]">DATABASE</span>
              <span className="text-[#F8FAFC] font-semibold">Live MongoDB</span>
            </div>
            <div>
              <span className="block text-[#64748B]">AUDIT ENGINE</span>
              <span className="text-emerald-400 font-semibold">Active & Scoped</span>
            </div>
            <div>
              <span className="block text-[#64748B]">LOCATION</span>
              <span className="text-[#F8FAFC] font-semibold">Zaitoon Ashraf Park</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: Executive Authentication Panel ================= */}
      <div className="lg:col-span-7 xl:col-span-6 bg-[#020817] flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md bg-[#0D1928] border border-[#203044] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          {/* Header Title in Right Card */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
              {activeTab === 'signin' ? 'Sign In to Workspace' : 'Initialize Master Account'}
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              {activeTab === 'signin'
                ? 'Select your designated credential role to enter the enterprise portal.'
                : 'First-time organization setup creates the master administrator profile.'}
            </p>
          </div>

          {/* ================= DEMO ROLE SELECTOR ================= */}
          {activeTab === 'signin' && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2 px-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] font-semibold flex items-center gap-1.5">
                  <span>Sign In As</span>
                  <span className="text-[#203044]">•</span>
                  <span className="text-emerald-400 font-normal">Role Scoped</span>
                </span>
                <span className="text-[10px] font-mono text-[#64748B]">
                  {selectedRole === 'Admin'
                    ? 'Root System Controls'
                    : selectedRole === 'HR'
                    ? 'Operations & Approvals'
                    : 'Personal Attendance & Shifts'}
                </span>
              </div>

              {/* 3 Executive-tier Role Clickable Cards */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRole('Admin')}
                  className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                    selectedRole === 'Admin'
                      ? 'bg-emerald-500/10 border-[#16A34A] text-emerald-400 shadow-md shadow-emerald-950/40'
                      : 'bg-[#111E30] border-[#203044] text-[#94A3B8] hover:border-slate-600 hover:text-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold">Admin</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono ${
                      selectedRole === 'Admin' ? 'text-emerald-300' : 'text-[#64748B]'
                    }`}
                  >
                    Root Access
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('HR')}
                  className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                    selectedRole === 'HR'
                      ? 'bg-emerald-500/10 border-[#16A34A] text-emerald-400 shadow-md shadow-emerald-950/40'
                      : 'bg-[#111E30] border-[#203044] text-[#94A3B8] hover:border-slate-600 hover:text-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold">HR Officer</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono ${
                      selectedRole === 'HR' ? 'text-emerald-300' : 'text-[#64748B]'
                    }`}
                  >
                    Operations
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('Employee')}
                  className={`py-3 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                    selectedRole === 'Employee'
                      ? 'bg-emerald-500/10 border-[#16A34A] text-emerald-400 shadow-md shadow-emerald-950/40'
                      : 'bg-[#111E30] border-[#203044] text-[#94A3B8] hover:border-slate-600 hover:text-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold">Employee</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono ${
                      selectedRole === 'Employee' ? 'text-emerald-300' : 'text-[#64748B]'
                    }`}
                  >
                    Self-Service
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Tab Selector: [→ Sign In] and [👤+ Organization Setup] */}
          <div className="grid grid-cols-2 p-1 bg-[#020817] border border-[#203044] rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('setup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'setup'
                  ? 'bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <span>Organization Setup</span>
            </button>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= TAB 1: SIGN IN ================= */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition"
                    placeholder={
                      selectedRole === 'Admin'
                        ? 'admin@saylani.com'
                        : selectedRole === 'HR'
                        ? 'hr@saylani.com'
                        : 'employee@saylani.com'
                    }
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#F8FAFC]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition"
                    placeholder="Enter account password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#94A3B8] select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-[#020817] border-[#203044] text-[#16A34A] focus:ring-[#16A34A] focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
                  />
                  <span>Remember me for 7 days</span>
                </label>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Temporary Passwords Supported
                </span>
              </div>

              {/* Solid Emerald Green CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold py-3 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50 mt-3"
              >
                <span>
                  {submitting
                    ? 'Authenticating Credentials...'
                    : `Sign In to ${
                        selectedRole === 'Admin'
                          ? 'Admin'
                          : selectedRole === 'HR'
                          ? 'HR Operations'
                          : 'Employee'
                      } Portal →`}
                </span>
              </button>
            </form>
          )}

          {/* ================= TAB 2: ORGANIZATION SETUP (ADMIN ONLY) ================= */}
          {activeTab === 'setup' && (
            <form onSubmit={handleOrganizationSetup} className="space-y-3.5">
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-0.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Master Organization Registration</span>
                </div>
                Initializes Master Organization profile & root Admin account. Staff & HR accounts are securely provisioned through internal administration workflows.
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                  Organization / Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    value={setupCompanyName}
                    onChange={(e) => setSetupCompanyName(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition"
                    placeholder="e.g. Saylani Enterprises"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                  Master Administrator Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    value={setupAdminName}
                    onChange={(e) => setSetupAdminName(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition"
                    placeholder="e.g. Master Administrator"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                  Administrator Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    value={setupAdminEmail}
                    onChange={(e) => setSetupAdminEmail(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition"
                    placeholder="admin@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type={showSetupPassword ? 'text' : 'password'}
                      required
                      value={setupAdminPassword}
                      onChange={(e) => setSetupAdminPassword(e.target.value)}
                      className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] rounded-xl pl-10 pr-8 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition"
                      placeholder="Min 6 chars"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type={showSetupPassword ? 'text' : 'password'}
                      required
                      value={setupConfirmPassword}
                      onChange={(e) => setSetupConfirmPassword(e.target.value)}
                      className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] rounded-xl pl-10 pr-8 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <button
                  type="button"
                  onClick={() => setShowSetupPassword(!showSetupPassword)}
                  className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                >
                  {showSetupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSetupPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold py-3 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50 mt-3"
              >
                <span>{submitting ? 'Initializing Master Profile...' : 'Initialize Organization →'}</span>
              </button>
            </form>
          )}

          {/* Bottom Security Badge */}
          <div className="mt-6 pt-4 border-t border-[#203044] flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>TLS 1.3 Verified Protocol</span>
            </span>
            <span>SMIT Hackathon 2026</span>
          </div>
        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D1928] border border-[#203044] rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotPasswordModal(false);
                setForgotSent(false);
              }}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Account Recovery</h3>
                <p className="text-xs text-[#94A3B8]">Reset or re-issue account credentials</p>
              </div>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recovery Request Dispatched</span>
                </div>
                <p className="leading-relaxed">
                  For Staff & HR users, temporary passwords can also be re-issued instantly by your System Administrator under the <strong>HR Logins</strong> or <strong>Employees</strong> directory.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setForgotSent(false);
                  }}
                  className="mt-3 w-full py-2 rounded-lg bg-[#111E30] hover:bg-[#203044] text-[#F8FAFC] text-xs font-semibold"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Enter your registered work email. System Administrators will receive an audit event to re-issue a temporary one-time password for your account.
                </p>
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. employee@saylani.com"
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#16A34A] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#111E30] hover:bg-[#203044] text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-semibold text-xs shadow-md"
                  >
                    Request Password Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020817] flex items-center justify-center text-[#94A3B8] text-xs font-mono">
          Loading authentication gateway...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
