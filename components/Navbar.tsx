'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { apiFetch } from '../lib/api';
import {
  Bell,
  LogOut,
  Building2,
  Calendar,
  X,
  Menu,
  Shield,
  Briefcase,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  mobileSidebarOpen?: boolean;
}

export default function Navbar({ onToggleSidebar, mobileSidebarOpen }: NavbarProps) {
  const { user, logout, companyName } = useAuth();
  const [dateTimeBadge, setDateTimeBadge] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timePart = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setDateTimeBadge(`${datePart}, ${timePart}`);
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiFetch('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Background silent poll
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT' });
      setUnreadCount(0);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role?: string) => {
    const r = String(role || '').toLowerCase();
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 uppercase">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Master Admin</span>
          </span>
        );
      case 'hr':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 uppercase">
            <Briefcase className="w-3 h-3 text-emerald-300" />
            <span>HR Operations</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#111E30] text-[#94A3B8] border border-[#203044] uppercase">
            <User className="w-3 h-3 text-[#94A3B8]" />
            <span>Staff Employee</span>
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-[#203044] bg-[#03101D] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Toggle & Organization Name */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111E30] border border-[#203044] cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white border border-emerald-400/30 shadow-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F8FAFC] text-sm tracking-tight truncate max-w-[160px] sm:max-w-xs">
                {companyName || 'Saylani Enterprises'}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-medium">
                HCM Lite
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-[#94A3B8] font-mono hidden sm:inline-block">
                Zaitoon Ashraf IT Park
              </span>
              <span className="hidden sm:inline-block text-[#203044]">•</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Live Twin Engine
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Clock, Notifications, User Details, Role & Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1928] border border-[#203044] text-xs font-mono text-[#94A3B8]">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{dateTimeBadge}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111E30] border border-[#203044] transition relative cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0D1928] border border-[#203044] shadow-2xl p-4 z-50 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#203044] mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#F8FAFC]">System Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 text-[10px] font-mono border border-emerald-800/50">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-[#94A3B8] font-mono text-[11px]">
                    No unread notifications in feed.
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div
                      key={notif._id}
                      className={`p-3 rounded-xl border text-xs transition ${
                        notif.isRead
                          ? 'bg-[#020817] border-[#203044]/60 text-[#94A3B8]'
                          : 'bg-[#111E30] border-emerald-500/30 text-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-[#F8FAFC]">{notif.title}</span>
                        <span className="text-[10px] text-[#64748B] font-mono shrink-0 ml-2">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Pill & Role Badge */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#203044]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/30">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block font-semibold text-xs text-[#F8FAFC] leading-none truncate max-w-[130px]">
                {user.name}
              </span>
              <div className="mt-1">{getRoleBadge(user.role)}</div>
            </div>

            {/* Logout Action */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-950/20 border border-[#203044] hover:border-rose-900/40 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
