'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'emerald' | 'amber' | 'blue' | 'rose' | 'neutral';
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeVariant = 'emerald',
  actions,
}: PageHeaderProps) {
  const badgeStyles = {
    emerald: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50',
    amber: 'bg-amber-950/70 text-amber-400 border-amber-800/50',
    blue: 'bg-sky-950/70 text-sky-400 border-sky-800/50',
    rose: 'bg-rose-950/70 text-rose-400 border-rose-800/50',
    neutral: 'bg-[#111E30] text-[#94A3B8] border-[#203044]',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#203044] pb-4 mb-6">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">{title}</h1>
          {badge && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${badgeStyles[badgeVariant]}`}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}

