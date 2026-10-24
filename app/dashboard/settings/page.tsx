import React, { Suspense } from 'react';
import CompanySettingsClient from './CompanySettingsClient';

export const dynamic = 'force-dynamic';

export default function CompanySettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      }
    >
      <CompanySettingsClient />
    </Suspense>
  );
}
