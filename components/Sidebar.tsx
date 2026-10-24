'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import {
  LayoutDashboard,
  Settings,
  Building,
  UserCheck,
  Users,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Megaphone,
  History,
  UserCircle,
  Shield,
  Briefcase,
  User,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = String(user.role || '').toLowerCase();

  const adminNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Company Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Org Structure', href: '/dashboard/org', icon: Building },
    { name: 'HR Logins', href: '/dashboard/hr-users', icon: UserCheck },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck },
    { name: 'Leaves', href: '/dashboard/leaves', icon: CalendarDays },
    { name: 'Payroll', href: '/dashboard/payroll', icon: CreditCard },
    { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
    { name: 'Audit Log', href: '/dashboard/audit', icon: History },
  ];

  const hrNav = [
    { name: 'HR Operations Hub', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employee Roster', href: '/dashboard/employees', icon: Users },
    { name: 'Attendance & Adjustments', href: '/dashboard/attendance', icon: CalendarCheck },
    { name: 'Leave Approvals', href: '/dashboard/leaves', icon: CalendarDays },
    { name: 'Payroll Runs', href: '/dashboard/payroll', icon: CreditCard },
    { name: 'Org Structure', href: '/dashboard/org', icon: Building },
    { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
  ];

  const employeeNav = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck },
    { name: 'My Leaves', href: '/dashboard/leaves', icon: CalendarDays },
    { name: 'My Payslips', href: '/dashboard/payroll', icon: CreditCard },
    { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
    { name: 'My Profile', href: '/dashboard/profile', icon: UserCircle },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'hr' ? hrNav : employeeNav;

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-3.5 sm:p-4 text-xs">
      <div className="space-y-4">
        {/* Mobile Header in Drawer */}
        <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#203044]">
          <span className="font-bold text-sm text-[#F8FAFC]">Navigation Menu</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111E30] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-2.5 py-1 text-[10px] font-mono font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center justify-between">
          <span>
            {role === 'admin'
              ? 'Administration Hub'
              : role === 'hr'
              ? 'People Operations'
              : 'Self-Service Portal'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Match exact or child routes
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard' ||
                  pathname === '/dashboard/admin' ||
                  pathname === '/dashboard/hr' ||
                  pathname === '/dashboard/employee'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white shadow-md shadow-emerald-950/50 font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0D1928]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-emerald-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile section at the bottom */}
      <div className="mt-6 pt-4 border-t border-[#203044] space-y-3">
        <div className="p-3 bg-[#0D1928] border border-[#203044] rounded-xl text-[11px] text-[#94A3B8]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              RBAC SCOPED
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">SMIT-2026</span>
          </div>
          <div className="mt-2 flex items-center justify-between pt-2 border-t border-[#203044]/60">
            <div>
              <span className="text-[#F8FAFC] font-semibold block truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[10px] text-[#94A3B8] font-mono">
                {user.employeeCode || user.employeeId || role.toUpperCase()}
              </span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-950/20 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#03101D] border-r border-[#203044] shrink-0 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (with backdrop) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <aside className="relative w-72 max-w-[80vw] bg-[#03101D] border-r border-[#203044] h-full shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
