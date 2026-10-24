'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  Building,
  Briefcase,
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Calendar,
} from 'lucide-react';

export default function OrgSetupPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'depts' | 'desigs' | 'holidays'>('depts');
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [desigTitle, setDesigTitle] = useState('');
  const [desigDept, setDesigDept] = useState('');
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, desigRes, holRes] = await Promise.all([
        apiFetch('/org/departments'),
        apiFetch('/org/designations'),
        apiFetch('/org/holidays'),
      ]);

      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (desigRes.success) setDesignations(desigRes.designations || []);
      if (holRes.success) setHolidays(holRes.holidays || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch('/org/departments', {
        method: 'POST',
        body: JSON.stringify({ name: deptName, code: deptCode }),
      });
      if (res.success) {
        setMessage(`Department "${deptName}" added successfully.`);
        setDeptName('');
        setDeptCode('');
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigTitle) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch('/org/designations', {
        method: 'POST',
        body: JSON.stringify({ title: desigTitle, department: desigDept }),
      });
      if (res.success) {
        setMessage(`Designation "${desigTitle}" added successfully.`);
        setDesigTitle('');
        setDesigDept('');
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayTitle || !holidayDate) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch('/org/holidays', {
        method: 'POST',
        body: JSON.stringify({ title: holidayTitle, date: holidayDate }),
      });
      if (res.success) {
        setMessage(`Holiday "${holidayTitle}" logged for ${holidayDate}.`);
        setHolidayTitle('');
        setHolidayDate('');
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type: 'departments' | 'designations' | 'holidays', id: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to remove this record?')) return;
    try {
      const res = await apiFetch(`/org/${type}/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Organization Structure & Calendar"
        subtitle="Configure enterprise departments, job designations, and official public holiday calendar."
        badge={isAdmin ? 'Admin Authoring' : 'Org Directory'}
        badgeVariant="emerald"
      />

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

      {/* Tabs */}
      <div className="flex border-b border-[#203044] text-xs font-bold">
        <button
          onClick={() => setActiveTab('depts')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'depts'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('desigs')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'desigs'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Designations ({designations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'holidays'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Public Holidays ({holidays.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: DEPARTMENTS ================= */}
      {activeTab === 'depts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {isAdmin && (
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
              <h3 className="text-xs font-bold text-[#F8FAFC] mb-4 flex items-center gap-2 pb-2 border-b border-[#203044]">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Create Department</span>
              </h3>

              <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Engineering, Operations"
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. ENG, OPS"
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold text-xs shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Add Department'}
                </button>
              </form>
            </div>
          )}

          <div className={isAdmin ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-[#03101D] border-b border-[#203044]">
                <h3 className="text-xs font-bold text-[#F8FAFC]">Active Departments</h3>
              </div>

              <div className="divide-y divide-[#203044]">
                {departments.length === 0 ? (
                  <div className="p-8 text-center text-[#94A3B8] text-xs font-mono">
                    No departments created yet.
                  </div>
                ) : (
                  departments.map((d) => (
                    <div
                      key={d._id}
                      className="p-4 flex items-center justify-between hover:bg-[#111E30]/50 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#F8FAFC] block">{d.name}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {d.code || 'NO-CODE'}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete('departments', d._id)}
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-950/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DESIGNATIONS ================= */}
      {activeTab === 'desigs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {isAdmin && (
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
              <h3 className="text-xs font-bold text-[#F8FAFC] mb-4 flex items-center gap-2 pb-2 border-b border-[#203044]">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Create Job Designation</span>
              </h3>

              <form onSubmit={handleAddDesignation} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Designation Title
                  </label>
                  <input
                    type="text"
                    required
                    value={desigTitle}
                    onChange={(e) => setDesigTitle(e.target.value)}
                    placeholder="e.g. Lead Full Stack Engineer"
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={desigDept}
                    onChange={(e) => setDesigDept(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold text-xs shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Add Designation'}
                </button>
              </form>
            </div>
          )}

          <div className={isAdmin ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-[#03101D] border-b border-[#203044]">
                <h3 className="text-xs font-bold text-[#F8FAFC]">Active Designations</h3>
              </div>

              <div className="divide-y divide-[#203044]">
                {designations.length === 0 ? (
                  <div className="p-8 text-center text-[#94A3B8] text-xs font-mono">
                    No designations registered.
                  </div>
                ) : (
                  designations.map((des) => (
                    <div
                      key={des._id}
                      className="p-4 flex items-center justify-between hover:bg-[#111E30]/50 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#F8FAFC] block">{des.title}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {des.department || 'All Departments'}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete('designations', des._id)}
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-950/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: HOLIDAYS ================= */}
      {activeTab === 'holidays' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {isAdmin && (
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-sm">
              <h3 className="text-xs font-bold text-[#F8FAFC] mb-4 flex items-center gap-2 pb-2 border-b border-[#203044]">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Official Public Holiday</span>
              </h3>

              <form onSubmit={handleAddHoliday} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Holiday Title
                  </label>
                  <input
                    type="text"
                    required
                    value={holidayTitle}
                    onChange={(e) => setHolidayTitle(e.target.value)}
                    placeholder="e.g. Eid-ul-Fitr, Pakistan Day"
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F8FAFC] mb-1">
                    Holiday Date
                  </label>
                  <input
                    type="date"
                    required
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold text-xs shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Public Holiday'}
                </button>
              </form>
            </div>
          )}

          <div className={isAdmin ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-[#03101D] border-b border-[#203044]">
                <h3 className="text-xs font-bold text-[#F8FAFC]">Company Holiday Calendar</h3>
              </div>

              <div className="divide-y divide-[#203044]">
                {holidays.length === 0 ? (
                  <div className="p-8 text-center text-[#94A3B8] text-xs font-mono">
                    No public holidays scheduled.
                  </div>
                ) : (
                  holidays.map((h) => (
                    <div
                      key={h._id}
                      className="p-4 flex items-center justify-between hover:bg-[#111E30]/50 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#F8FAFC] block">{h.title}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {h.date}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete('holidays', h._id)}
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-950/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
