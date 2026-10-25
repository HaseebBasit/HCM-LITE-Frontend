'use client';

import React from 'react';
import {
  Printer,
  X,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: any;
  companyName?: string;
}

export default function PayslipModal({
  isOpen,
  onClose,
  payslip,
  companyName = 'Saylani Enterprises',
}: PayslipModalProps) {
  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  // Normalization for inconsistent property names
  const name = payslip.employeeName || payslip.name || 'Staff Member';
  const empCode = payslip.employeeId || payslip.employeeCode || 'EMP-ID';
  const dept = payslip.department || 'General';
  const desig = payslip.designation || 'Staff';
  const month = payslip.month || 'Current Period';
  const isFinalized = payslip.isFinalized === true || payslip.status === 'finalized';
  const totalWorkingDays = Number(payslip.totalWorkingDays || 0);
  const eligibleWorkingDays = Number(payslip.eligibleWorkingDays || 0);

  const basic = payslip.basicSalary ?? payslip.basic ?? 0;
  const hra = payslip.hra ?? 0;
  const medical = payslip.medical ?? 0;
  const gross = payslip.grossSalary ?? payslip.gross ?? basic + hra + medical;

  const dailyRate = payslip.dailyRate ?? Math.round(gross / 22);
  const deductions = payslip.attendanceDeduction ?? payslip.deductions ?? 0;
  const tax = payslip.taxDeduction ?? payslip.monthlyTax ?? 0;
  const totalDeductions = deductions + tax;
  const netPay = payslip.netSalary ?? payslip.netPay ?? Math.max(0, gross - totalDeductions);
  const annualGross = Number(payslip.annualGross ?? gross * 12);
  const annualTax = Number(payslip.annualTax ?? tax * 12);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Toolbar (hidden on print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Official Salary Slip
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              {isFinalized ? 'Finalized & Locked' : 'Draft Preview'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <span className="block text-[9px] uppercase font-bold tracking-wide text-slate-400">Annualized gross for tax</span>
              <span className="mt-1 block font-mono text-sm font-bold text-slate-800">PKR {annualGross.toLocaleString()}</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
              <span className="block text-[9px] uppercase font-bold tracking-wide text-slate-400">Annual tax liability</span>
              <span className="mt-1 block font-mono text-sm font-bold text-rose-700">PKR {annualTax.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 print:p-0 space-y-6 text-xs" id="printable-payslip">
          {/* Company Branding Header */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center shadow-md">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{companyName}</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                  Human Capital Management & Payroll Division
                </p>
                <p className="text-[11px] text-slate-400">Karachi, Pakistan</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pay Period</div>
              <div className="text-xl font-black text-emerald-700 tracking-tight font-mono">
                {month}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                Status: {isFinalized ? 'Finalized & Locked' : 'Draft · Awaiting Admin Approval'}
              </div>
            </div>
          </div>

          <section aria-label="Attendance and payroll days" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['Working days', totalWorkingDays || '—'],
              ['Eligible days', eligibleWorkingDays || 0],
              ['Absent days', Number(payslip.absentDays || 0)],
              ['Unpaid leave days', Number(payslip.unpaidLeaveDays || 0)],
              ['Half days', Number(payslip.halfDays || 0)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <span className="block text-[9px] uppercase font-bold tracking-wide text-slate-400">{label}</span>
                <span className="mt-1 block font-mono text-sm font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </section>

          {/* Employee Info Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Employee Name</span>
              <span className="font-bold text-slate-900 text-sm">{name}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Employee ID</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{empCode}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Department</span>
              <span className="font-semibold text-slate-800">{dept}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Designation</span>
              <span className="font-semibold text-slate-800">{desig}</span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 text-emerald-900 px-4 py-2 font-bold text-xs uppercase tracking-wider border-b border-emerald-200">
                Earnings (PKR)
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-mono font-semibold">PKR {Number(basic).toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-slate-600">House Rent Allowance (HRA 40%)</span>
                  <span className="font-mono font-semibold">PKR {Number(hra).toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-slate-600">Medical Allowance (10%)</span>
                  <span className="font-mono font-semibold">PKR {Number(medical).toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 bg-slate-50 font-bold text-slate-900">
                  <span>Gross Salary</span>
                  <span className="font-mono text-emerald-700">PKR {Number(gross).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions & Tax */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50 text-rose-900 px-4 py-2 font-bold text-xs uppercase tracking-wider border-b border-rose-200">
                Deductions & Statutory Tax (PKR)
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">Daily Rate Base</span>
                  <span className="font-mono text-slate-700">PKR {Number(dailyRate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">Attendance & Unpaid Cutoffs</span>
                  <span className="font-mono font-semibold text-rose-600">
                    - PKR {Number(deductions).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-slate-600">Pakistan Income Tax Withholding</span>
                  <span className="font-mono font-semibold text-rose-600">
                    - PKR {Number(tax).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2.5 bg-slate-50 font-bold text-slate-900">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-700">
                    - PKR {Number(totalDeductions).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Reference Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800">Tax & Payroll Ledger Rules:</span> Evaluated against Section 4.C Pakistan statutory income tax slabs. Attendance deductions computed on working days basis.
          </div>

          {/* Net Disbursed Salary Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white flex justify-between items-center shadow-lg">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-100 block">
                {isFinalized ? 'Net Disbursed Take-Home Salary' : 'Estimated Net Take-Home Salary'}
              </span>
              <span className="text-[11px] text-emerald-100">
                Gross Salary - Attendance Deductions - Monthly Statutory Tax
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black font-mono tracking-tight block">
                PKR {Number(netPay).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-100 font-semibold flex items-center gap-1 justify-end mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {isFinalized ? 'Finalized for Transfer' : 'Pending Admin Finalization'}
              </span>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="pt-8 flex justify-between items-end text-slate-400 text-[10px] border-t border-slate-200">
            <div>
              <p>Generated by Saylani Enterprises HCM Lite Core Engine.</p>
              <p>Confidential document intended solely for the designated employee.</p>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span>Authorized Payroll Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
