'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Building2, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

type Role = 'Admin' | 'HR' | 'Employee';

const roles: { name: Role; label: string; icon: typeof ShieldCheck }[] = [
  { name: 'Admin', label: 'Admin', icon: ShieldCheck },
  { name: 'HR', label: 'HR', icon: BriefcaseBusiness },
  { name: 'Employee', label: 'Employee', icon: UsersRound },
];

const roleRoutes: Record<string, string> = {
  admin: '/dashboard/admin',
  hr: '/dashboard/hr',
  employee: '/dashboard/employee',
};

function LoginForm() {
  const router = useRouter();
  const { user, login, loading, companyName, isSetup } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace(roleRoutes[String(user.role).toLowerCase()] || '/dashboard');
  }, [loading, user, router]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!result.success || !result.token || !result.user) {
        setError(result.message || 'We could not sign you in. Check your details and try again.');
        return;
      }
      const actualRole = String(result.user.role || '').toLowerCase();
      if (actualRole !== selectedRole.toLowerCase()) {
        setError(`This account has ${actualRole.toUpperCase()} access. Select that role and try again.`);
        return;
      }
      login(result.token, result.user);
      router.replace(roleRoutes[actualRole] || '/dashboard');
    } catch (cause: any) {
      setError(cause.message || 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f6f4] text-slate-900 lg:grid lg:grid-cols-[minmax(410px,46%)_1fr]">
      <section className="relative isolate flex min-h-[310px] flex-col overflow-hidden bg-[#030b11] px-6 py-7 text-white sm:px-10 lg:min-h-screen lg:px-12 lg:py-10 xl:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_8%_15%,rgba(22,163,74,.22),transparent_36%),linear-gradient(145deg,#07131d_10%,#02070b_58%,#03140f)]" />
        <div className="absolute inset-0 -z-10 opacity-[.16] [background-image:linear-gradient(rgba(148,163,184,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.2)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
        <div className="absolute -bottom-28 -right-24 -z-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-[90px]" />

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-950/40">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">{companyName || 'Saylani Enterprises'}</div>
            <div className="text-xs tracking-wide text-slate-400">HCM Lite Core</div>
          </div>
        </div>

        <div className="mt-12 max-w-xl lg:mt-[clamp(3rem,10vh,7rem)]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[.14em] text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> People, managed with clarity
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl xl:text-[46px]">
            A better way to support <span className="text-emerald-400">your people.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
            Bring attendance, leave, and payroll into one clear view for every team.
          </p>
        </div>

        <div className="relative mt-9 hidden h-[250px] overflow-hidden rounded-2xl border border-white/10 bg-[#07121a]/80 shadow-2xl sm:block lg:mt-12 lg:h-[290px]">
          <div className="absolute inset-x-0 top-0 flex h-10 items-center gap-1.5 border-b border-white/10 px-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="h-2 w-2 rounded-full bg-slate-600" /><span className="h-2 w-2 rounded-full bg-slate-700" />
            <span className="ml-3 text-[10px] uppercase tracking-[.16em] text-slate-500">Workforce overview</span>
          </div>
          <div className="grid h-full grid-cols-3 gap-3 p-5 pt-14">
            <div className="rounded-xl border border-white/10 bg-white/[.035] p-3.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Headcount</div>
              <div className="mt-2 text-sm font-medium text-slate-200">Team overview</div>
              <div className="mt-4 h-1.5 rounded-full bg-slate-800"><div className="h-full w-2/3 rounded-full bg-emerald-600/70" /></div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.035] p-3.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Attendance</div>
              <div className="mt-2 text-sm font-medium text-slate-200">Daily visibility</div>
              <div className="mt-4 flex h-3 items-end gap-1.5"><span className="h-2 w-3 rounded-sm bg-emerald-900" /><span className="h-3 w-3 rounded-sm bg-emerald-800" /><span className="h-2 w-3 rounded-sm bg-emerald-700" /><span className="h-3 w-3 rounded-sm bg-emerald-600/80" /><span className="h-2 w-3 rounded-sm bg-emerald-500/70" /></div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.035] p-3.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">People ops</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-300"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400"><Check className="h-4 w-4" /></span>Approvals</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-300"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300"><UsersRound className="h-4 w-4" /></span>Reports</div>
            </div>
          </div>
          <div className="absolute -bottom-12 left-0 right-0 h-24 bg-gradient-to-t from-emerald-900/20 to-transparent" />
        </div>

        <div className="mt-auto hidden gap-5 pt-8 text-xs text-slate-400 sm:grid sm:grid-cols-3 lg:pt-10">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure access</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Clear workflows</div>
          <div className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-emerald-400" /> Built for teams</div>
        </div>
        <p className="mt-8 hidden text-[11px] text-slate-500 sm:block">© {new Date().getFullYear()} Saylani Enterprises</p>
      </section>

      <section className="flex min-h-[calc(100vh-310px)] items-center justify-center px-4 py-10 sm:px-8 lg:min-h-screen lg:px-10 xl:px-16">
        <div className="w-full max-w-[520px]">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div className="text-xs font-medium text-slate-500">HCM Lite <span className="mx-1 text-slate-300">/</span> Secure access</div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Your workspace is protected
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.08)] sm:p-9">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-emerald-700">Welcome back</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">Sign in to your workspace</h2>
              <p className="mt-2 text-sm text-slate-500">Use your work account to continue.</p>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Choose your role</span>
                <span className="text-[11px] text-slate-400">Select the account type</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(({ name, label, icon: Icon }) => {
                  const active = selectedRole === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => { setSelectedRole(name); setError(''); }}
                      className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <form onSubmit={signIn} className="mt-6 space-y-4">
              <div>
                <label htmlFor="work-email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Work email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input id="work-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-600">Password</label>
                  <span className="text-[11px] text-slate-400">Contact your administrator if you need help</span>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={submitting || loading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-green-600 disabled:cursor-wait disabled:opacity-60">
                {submitting ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />Secure HCM Lite access<span className="h-px flex-1 bg-slate-200" /></div>
            <p className="mt-5 text-center text-xs text-slate-500">
              {isSetup === false ? <>Setting up for the first time? <Link href="/setup" className="font-semibold text-emerald-700 hover:text-emerald-800">Configure your organization</Link></> : 'Need an account? Contact your HR administrator.'}
            </p>
          </div>
          <p className="mt-5 text-center text-[11px] text-slate-400">By signing in, you agree to follow your organization’s access policies.</p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
