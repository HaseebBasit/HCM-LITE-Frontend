'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  CalendarCheck,
  CalendarDays,
  History,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Briefcase,
  Phone,
  Mail,
  Building,
} from 'lucide-react';

export default function EmployeesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isHr = user?.role === 'hr';
  const canManage = isAdmin || isHr;

  const [employees, setEmployees] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('active');
  const [loading, setLoading] = useState(true);

  // Register Employee Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newDesig, setNewDesig] = useState('Associate Engineer');
  const [newPhone, setNewPhone] = useState('');
  const [newBasicSalary, setNewBasicSalary] = useState(80000);
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);

  // Employee 360 Drawer
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [emp360Data, setEmp360Data] = useState<any>(null);
  const [loading360, setLoading360] = useState(false);

  // CSV Import Modal & Dry Run
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvDryReport, setCsvDryReport] = useState<any>(null);
  const [csvRowsToCommit, setCsvRowsToCommit] = useState<any[]>([]);
  const [processingCsv, setProcessingCsv] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: statusFilter,
        ...(search && { search }),
        ...(departmentFilter !== 'All' && { department: departmentFilter }),
      });

      const res = await apiFetch(`/users/employees?${q.toString()}`);
      if (res.success) {
        setEmployees(res.employees || []);
        setTotal(res.total || 0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, departmentFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleRegisterEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch('/users/employees', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          department: newDept,
          designation: newDesig,
          phone: newPhone,
          basicSalary: Number(newBasicSalary),
        }),
      });

      if (res.success) {
        setCreatedTempPassword(res.temporaryPassword);
        setMessage(`Employee registered with ID ${res.employee?.employeeId}. Temporary Password: ${res.temporaryPassword}`);
        fetchEmployees();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpen360 = async (id: string) => {
    setSelectedEmpId(id);
    setLoading360(true);
    try {
      const res = await apiFetch(`/users/employees/${id}`);
      if (res.success) {
        setEmp360Data(res);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading360(false);
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setError('CSV must contain a header and at least one data row.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          if (h.includes('name')) rowObj.name = parts[idx];
          else if (h.includes('email')) rowObj.email = parts[idx];
          else if (h.includes('dept') || h.includes('department')) rowObj.department = parts[idx];
          else if (h.includes('desig') || h.includes('designation')) rowObj.designation = parts[idx];
          else if (h.includes('phone')) rowObj.phone = parts[idx];
          else if (h.includes('salary') || h.includes('basic')) rowObj.basicSalary = Number(parts[idx]);
          else if (h.includes('joining')) rowObj.joiningDate = parts[idx];
          else if (h.includes('employee code') || h.includes('employee id') || h === 'code' || h === 'id') rowObj.employeeCode = parts[idx];
        });
        if (rowObj.name || rowObj.email) {
          rows.push(rowObj);
        }
      }

      setProcessingCsv(true);
      try {
        const res = await apiFetch('/users/employees/csv-dryrun', {
          method: 'POST',
          body: JSON.stringify({ rows }),
        });
        if (res.success) {
          setCsvDryReport(res.report);
          setCsvRowsToCommit(res.report.preview || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setProcessingCsv(false);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitCsv = async () => {
    if (!csvRowsToCommit.length) return;
    setProcessingCsv(true);
    try {
      const res = await apiFetch('/users/employees/csv-commit', {
        method: 'POST',
        body: JSON.stringify({ rows: csvRowsToCommit }),
      });
      if (res.success) {
        setMessage(res.message || 'Import successful.');
        setShowCsvModal(false);
        setCsvDryReport(null);
        setCsvRowsToCommit([]);
        fetchEmployees();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingCsv(false);
    }
  };

  const handleExportCsv = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/employees/csv-export`,
      '_blank'
    );
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Workforce Directory & 360 Intelligence"
        subtitle="Server-side search, filtering, Employee 360 dossiers, registration, and dry-run CSV imports."
        badge="Directory & Roster"
        badgeVariant="emerald"
        actions={
          canManage && (
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => {
                  setCreatedTempPassword(null);
                  setShowRegisterModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs shadow-md shadow-emerald-950/50 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Staff</span>
              </button>

              <button
                onClick={() => setShowCsvModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0D1928] hover:bg-[#111E30] text-[#F8FAFC] border border-[#203044] font-semibold text-xs transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0D1928] hover:bg-[#111E30] text-[#F8FAFC] border border-[#203044] font-semibold text-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>
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

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1928] border border-[#203044] flex flex-col sm:flex-row gap-3 items-center justify-between text-xs shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full bg-[#020817] border border-[#203044] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#16A34A]"
          />
        </form>

        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#020817] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Design">Design</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#020817] border border-[#203044] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
          >
            <option value="active">Active Status</option>
            <option value="inactive">Inactive Status</option>
            <option value="all">All Employment Records</option>
          </select>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="bg-[#0D1928] border border-[#203044] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#03101D] text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px] border-b border-[#203044]">
              <tr>
                <th className="p-3.5">Employee Personnel</th>
                <th className="p-3.5">Designation & Department</th>
                <th className="p-3.5">Gross Salary</th>
                <th className="p-3.5">Leave Balances</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#203044]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#94A3B8] font-mono text-xs">
                    <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying live employee records...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12">
                    <EmptyState
                      icon={Users}
                      title="No Employees Found"
                      description="No employee records match the selected search filters. Try clearing filters or register a new team member."
                      actionText={canManage ? 'Register First Employee' : undefined}
                      onAction={canManage ? () => setShowRegisterModal(true) : undefined}
                    />
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-[#111E30]/50 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-400/30">
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-[#F8FAFC] block">{emp.name}</span>
                          <span className="text-[10px] text-[#94A3B8] font-mono">
                            {emp.employeeId || 'NO-ID'} • {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[#F8FAFC] font-medium block">
                        {emp.designation || 'Staff'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {emp.department || 'General'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400 font-semibold">
                      PKR {(emp.salary?.gross || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-[11px] text-[#94A3B8] font-mono">
                      A: <span className="text-[#F8FAFC] font-semibold">{emp.leaveBalances?.annual ?? 14}</span> | S: <span className="text-[#F8FAFC] font-semibold">{emp.leaveBalances?.sick ?? 8}</span> | C: <span className="text-[#F8FAFC] font-semibold">{emp.leaveBalances?.casual ?? 10}</span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={emp.isActive ? 'success' : 'danger'}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpen360(emp._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111E30] hover:bg-[#203044] text-emerald-400 border border-[#203044] hover:border-emerald-500/40 text-[11px] font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>360 Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {total > 0 && (
          <div className="p-4 bg-[#03101D] border-t border-[#203044] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <span className="font-mono text-[11px]">
              Showing {employees.length} of {total} employees • Page {page} of {totalPages}
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

      {/* ================= REGISTER EMPLOYEE MODAL ================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0D1928] border border-[#203044] rounded-2xl p-6 sm:p-7 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Register New Employee</h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdTempPassword ? (
              <div className="space-y-4 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                  <span>Employee Successfully Registered!</span>
                </div>
                <p className="text-[#94A3B8] leading-relaxed">
                  Please securely share the temporary sign-in credentials with the employee. On first login, the employee will be prompted to set a permanent password.
                </p>
                <div className="p-3.5 rounded-xl bg-[#020817] border border-[#203044] font-mono text-emerald-300 text-xs space-y-1">
                  <div><strong className="text-[#94A3B8]">Email:</strong> {newEmail}</div>
                  <div><strong className="text-[#94A3B8]">Temporary Password:</strong> {createdTempPassword}</div>
                </div>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterEmployee} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Bilal Ahmed"
                      className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="bilal@saylani.com"
                      className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Department</label>
                    <input
                      type="text"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      placeholder="Engineering"
                      className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Designation</label>
                    <input
                      type="text"
                      value={newDesig}
                      onChange={(e) => setNewDesig(e.target.value)}
                      placeholder="Full Stack Engineer"
                      className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Phone (Optional)</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+92 321 0000000"
                      className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Basic Salary (PKR)</label>
                    <input
                      type="number"
                      required
                      value={newBasicSalary}
                      onChange={(e) => setNewBasicSalary(Number(e.target.value))}
                      className="w-full bg-[#020817] border border-[#203044] focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Statutory Calculation Preview */}
                <div className="p-3 rounded-xl bg-[#020817] border border-[#203044] text-[11px] text-[#94A3B8]">
                  <span className="font-bold text-[#F8FAFC] block">Statutory Compensation Architecture:</span>
                  Gross = Basic (PKR {Number(newBasicSalary).toLocaleString()}) × 1.5 = <strong className="text-emerald-400 font-mono">PKR {(Number(newBasicSalary) * 1.5).toLocaleString()}</strong> (HRA 40% + Medical 10%).
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#111E30] hover:bg-[#203044] text-[#94A3B8] hover:text-[#F8FAFC] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold shadow-md shadow-emerald-950/40"
                  >
                    Generate Credentials →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= CSV IMPORT MODAL WITH DRY RUN ================= */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0D1928] border border-[#203044] rounded-2xl p-6 sm:p-7 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Bulk CSV Import & Dry-Run Validation</h3>
              </div>
              <button onClick={() => setShowCsvModal(false)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">
              Upload a workforce CSV file. HCM Lite runs a strict dry-run check verifying duplicates, required fields, and email validity before committing records.
            </p>

            <div className="p-8 border-2 border-dashed border-[#203044] rounded-2xl bg-[#020817] text-center">
              <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <label className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer block">
                Select CSV file from computer
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-[#64748B] mt-1 font-mono">
                Required columns: name, email, department, designation, phone, basicSalary
              </p>
            </div>

            {/* Dry Run Report */}
            {csvDryReport && (
              <div className="mt-4 p-4 rounded-xl bg-[#020817] border border-[#203044] text-xs space-y-3">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-[#F8FAFC]">Dry-Run Pre-Flight Results</span>
                  <div className="flex gap-2 text-[10px] font-mono">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
                      {csvDryReport.validRows} Valid
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-rose-950/70 text-rose-400 border border-rose-800/50">
                      {csvDryReport.invalidRows} Errors
                    </span>
                  </div>
                </div>

                {csvDryReport.errors?.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-[11px] max-h-32 overflow-y-auto">
                    {csvDryReport.errors.map((e: any, i: number) => (
                      <div key={i}>Row {e.row}, {e.field}: {e.reason}</div>
                    ))}
                  </div>
                )}

                {csvDryReport.preview?.length > 0 && (
                  <div className="max-h-36 overflow-y-auto border border-[#203044] rounded-lg">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#03101D] text-[#94A3B8] uppercase text-[10px] p-2">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Dept</th>
                          <th className="p-2">Gross Salary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#203044]">
                        {csvDryReport.preview.map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-[#111E30]/40">
                            <td className="p-2 text-[#F8FAFC] font-semibold">{p.name}</td>
                            <td className="p-2 text-[#94A3B8]">{p.email}</td>
                            <td className="p-2 text-[#94A3B8]">{p.department}</td>
                            <td className="p-2 font-mono text-emerald-400">
                              PKR {p.grossSalary?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={handleCommitCsv}
                    disabled={processingCsv || csvDryReport.validRows === 0}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold text-xs disabled:opacity-40"
                  >
                    {processingCsv ? 'Committing...' : `Commit ${csvDryReport.validRows} Valid Records`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= EMPLOYEE 360 INTELLIGENCE DOSSIER DRAWER ================= */}
      {selectedEmpId && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#0D1928] border-l border-[#203044] shadow-2xl z-50 flex flex-col">
          <div className="p-5 bg-[#03101D] border-b border-[#203044] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-[#F8FAFC]">Employee 360 Intelligence Dossier</h3>
            </div>
            <button
              onClick={() => setSelectedEmpId(null)}
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {loading360 ? (
              <div className="text-center py-16 text-[#94A3B8] font-mono text-xs">
                <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Retrieving 360 dossier records...
              </div>
            ) : emp360Data?.employee ? (
              <>
                {/* Profile Card */}
                <div className="p-4 rounded-2xl bg-[#020817] border border-[#203044] space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white font-bold text-sm flex items-center justify-center border border-emerald-400/30">
                        {emp360Data.employee.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#F8FAFC]">{emp360Data.employee.name}</h2>
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                          {emp360Data.employee.employeeId}
                        </span>
                      </div>
                    </div>
                    <Badge variant={emp360Data.employee.isActive ? 'success' : 'danger'}>
                      {emp360Data.employee.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-[#94A3B8] text-[11px] space-y-1 pt-2 border-t border-[#203044]">
                    <div>{emp360Data.employee.designation} • {emp360Data.employee.department}</div>
                    <div>Email: {emp360Data.employee.email}</div>
                    <div>Phone: {emp360Data.employee.phone || 'Not registered'}</div>
                  </div>
                </div>

                {/* Salary Architecture */}
                <div className="p-4 rounded-2xl bg-[#020817] border border-[#203044] space-y-2">
                  <span className="font-bold text-[#F8FAFC] text-xs flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Compensation Architecture</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>Basic: <strong className="font-mono text-[#F8FAFC]">PKR {emp360Data.employee.salary?.basic?.toLocaleString()}</strong></div>
                    <div>HRA (40%): <strong className="font-mono text-[#F8FAFC]">PKR {emp360Data.employee.salary?.hra?.toLocaleString()}</strong></div>
                    <div>Medical (10%): <strong className="font-mono text-[#F8FAFC]">PKR {emp360Data.employee.salary?.medical?.toLocaleString()}</strong></div>
                    <div>Gross Total: <strong className="font-mono text-emerald-400">PKR {emp360Data.employee.salary?.gross?.toLocaleString()}</strong></div>
                  </div>
                </div>

                {/* Recent Attendances */}
                <div className="p-4 rounded-2xl bg-[#020817] border border-[#203044] space-y-2">
                  <span className="font-bold text-[#F8FAFC] text-xs flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recent Shift Timestamps</span>
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {(emp360Data.attendances || []).length === 0 ? (
                      <div className="text-[#64748B] text-[11px]">No attendance history yet.</div>
                    ) : (
                      emp360Data.attendances.map((a: any) => (
                        <div key={a._id} className="flex justify-between items-center text-[11px] p-2 rounded-lg bg-[#0D1928] border border-[#203044]">
                          <span className="font-mono text-[#94A3B8]">{a.date}</span>
                          <span className="uppercase font-bold text-emerald-400 font-mono">
                            {a.status} ({a.workHours}h)
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="p-4 rounded-2xl bg-[#020817] border border-[#203044] space-y-2">
                  <span className="font-bold text-[#F8FAFC] text-xs flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Forensic Audit Trail</span>
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto text-[10px]">
                    {(emp360Data.auditLogs || []).length === 0 ? (
                      <div className="text-[#64748B]">No specific audit events logged.</div>
                    ) : (
                      emp360Data.auditLogs.map((log: any) => (
                        <div key={log._id} className="p-2.5 rounded-xl bg-[#0D1928] border border-[#203044] text-[#94A3B8]">
                          <span className="font-bold text-[#F8FAFC]">{log.action}</span> by {log.actorName}
                          <div className="text-[9px] text-[#64748B] font-mono mt-0.5">
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
