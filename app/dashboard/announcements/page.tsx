'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/authContext';
import { apiFetch } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  Megaphone,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  BellRing,
  X,
  Sparkles,
  Calendar,
  User,
  ShieldAlert,
} from 'lucide-react';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isHr = user?.role === 'hr';
  const canPost = isAdmin || isHr;

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/announcements');
      if (res.success) setList(res.announcements || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch('/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, content, priority }),
      });

      if (res.success) {
        setMessage('Announcement broadcasted to all employees.');
        setShowModal(false);
        setTitle('');
        setContent('');
        fetchAnnouncements();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this announcement?')) return;
    try {
      await apiFetch(`/announcements/${id}`, { method: 'DELETE' });
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Company Announcements & Memos"
        subtitle="Broadcast executive notices, holiday schedules, compliance memos, and corporate bulletins."
        badge={canPost ? 'Broadcasting Active' : 'All-Staff Feed'}
        badgeVariant="emerald"
        actions={
          canPost && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
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

      {/* Announcements Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-[#94A3B8] font-mono text-xs">
            <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Syncing corporate announcements...
          </div>
        ) : list.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Megaphone}
              title="No Announcements Broadcasted"
              description="There are currently no active corporate memos or bulletins. Announcements created by Admin or HR will stream in here for all staff."
              actionText={canPost ? 'Post First Announcement' : undefined}
              onAction={canPost ? () => setShowModal(true) : undefined}
            />
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item._id}
              className={`p-6 rounded-2xl border transition duration-200 shadow-sm relative overflow-hidden ${
                item.priority === 'urgent'
                  ? 'bg-[#0D1928] border-rose-600/40'
                  : item.priority === 'high'
                  ? 'bg-[#0D1928] border-amber-600/40'
                  : 'bg-[#0D1928] border-[#203044]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      item.priority === 'urgent'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : item.priority === 'high'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-[#22C55E]'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#94A3B8]">
                      <span>By {item.authorName || 'Administration'}</span>
                      <span className="text-[#203044]">•</span>
                      <span className="font-mono text-[10px]">
                        {new Date(item.createdAt).toLocaleDateString([], {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge
                    variant={
                      item.priority === 'urgent'
                        ? 'danger'
                        : item.priority === 'high'
                        ? 'warning'
                        : 'emerald'
                    }
                  >
                    {item.priority?.toUpperCase()} PRIORITY
                  </Badge>

                  {canPost && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      title="Delete Announcement"
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-950/20 cursor-pointer transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap pl-12">
                {item.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= CREATE ANNOUNCEMENT MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0D1928] border border-[#203044] rounded-2xl p-6 sm:p-7 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#203044]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Broadcast Company Announcement</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Eid-ul-Fitr Public Holiday Notification"
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Priority Classification</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#16A34A]"
                >
                  <option value="normal">Normal (Standard Bulletin)</option>
                  <option value="high">High (Time-Sensitive Policy)</option>
                  <option value="urgent">Urgent (Immediate Compliance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F8FAFC] mb-1">Announcement Body Content</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write official company memo details..."
                  className="w-full bg-[#020817] border border-[#203044] rounded-xl p-3.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#16A34A] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#111E30] hover:bg-[#203044] text-[#94A3B8] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white font-bold shadow-md shadow-emerald-950/40 disabled:opacity-50"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
