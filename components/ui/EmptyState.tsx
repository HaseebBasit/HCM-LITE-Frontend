'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  badge?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  badge,
}: EmptyStateProps) {
  return (
    <div className="py-12 sm:py-16 px-4 text-center border border-dashed border-[#203044] rounded-2xl bg-[#0D1928]/40">
      <div className="w-12 h-12 rounded-xl bg-[#111E30] border border-[#203044] text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      {badge && (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 mb-2">
          {badge}
        </span>
      )}
      <h4 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">{title}</h4>
      <p className="text-xs text-[#94A3B8] mt-1.5 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <button
            onClick={onAction}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-semibold text-xs transition duration-150 shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}

