'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  tag?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'blue' | 'rose' | 'neutral';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  chart?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  tag,
  icon: Icon,
  variant = 'emerald',
  chart,
}: StatCardProps) {
  const iconBgStyles = {
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-[#22C55E]',
    amber: 'bg-amber-500/10 border-amber-500/25 text-[#F59E0B]',
    blue: 'bg-sky-500/10 border-sky-500/25 text-[#38BDF8]',
    rose: 'bg-rose-500/10 border-rose-500/25 text-[#EF4444]',
    neutral: 'bg-slate-800/50 border-slate-700/50 text-[#94A3B8]',
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#0D1928] border border-[#203044] hover:border-[#16A34A]/40 transition duration-200 relative overflow-hidden group shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-[#94A3B8] tracking-wide">{title}</span>
        <div
          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition ${iconBgStyles[variant]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-3 mt-3">
        <span className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] font-mono tracking-tight">
          {value}
        </span>
        {chart && <div className="ml-auto">{chart}</div>}
      </div>

      {(subtitle || tag) && (
        <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mt-3 pt-2.5 border-t border-[#203044]/70">
          <span>{subtitle}</span>
          {tag && <span className="font-mono text-emerald-400 font-medium">{tag}</span>}
        </div>
      )}
    </div>
  );
}

