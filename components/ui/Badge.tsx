'use client';

import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'emerald';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({ children, variant = 'neutral', className = '', icon }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50',
    emerald: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
    warning: 'bg-amber-950/70 text-amber-400 border-amber-800/50',
    danger: 'bg-rose-950/70 text-rose-400 border-rose-800/50',
    info: 'bg-sky-950/70 text-sky-400 border-sky-800/50',
    neutral: 'bg-[#111E30] text-[#94A3B8] border-[#203044]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium border ${styles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

