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
    <div className="relative min-h-[188px] overflow-hidden rounded-2xl border border-[#203044] bg-gradient-to-br from-[#0e1d2a] to-[#07121e] p-5 shadow-[0_14px_32px_rgba(0,0,0,.12)] transition duration-200 hover:border-emerald-500/40">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium tracking-wide text-slate-300">{title}</span>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${iconBgStyles[variant]}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>

      <div className="flex items-baseline gap-3 mt-3">
        <span className="text-3xl font-semibold tracking-tight text-[#F8FAFC] sm:text-[34px]">
          {value}
        </span>
        {chart && <div className="ml-auto">{chart}</div>}
      </div>

      {(subtitle || tag) && (
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[#94A3B8]">
          <span>{subtitle}</span>
          {tag && <span className="rounded-full border border-emerald-800/50 bg-emerald-950/50 px-2 py-1 text-[10px] font-medium text-emerald-300">{tag}</span>}
        </div>
      )}
    </div>
  );
}

