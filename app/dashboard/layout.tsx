'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import AIAssistant from '../../components/AIAssistant';
import ChangePasswordModal from '../../components/ChangePasswordModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isSetup, loading } = useAuth();
  const [smartLeaveData, setSmartLeaveData] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (isSetup === false) {
        router.replace('/setup');
      } else if (!user) {
        router.replace('/login');
      }
    }
  }, [user, isSetup, loading, router]);

  const handlePreFillLeave = (leaveData: any) => {
    setSmartLeaveData(leaveData);
    router.push(
      `/dashboard/leaves?type=${leaveData.type}&startDate=${leaveData.startDate}&endDate=${leaveData.endDate}&reason=${encodeURIComponent(
        leaveData.reason
      )}`
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#94A3B8] font-mono">Initializing Workspace...</span>
        </div>
      </div>
    );
  }

  // The API intentionally blocks all normal endpoints until a temporary
  // password is changed. Keep protected dashboard pages unmounted meanwhile
  // so they do not issue requests that are guaranteed to receive HTTP 403.
  if (user.mustChangePassword || user.isTemporaryPassword) {
    return (
      <div className="min-h-screen bg-[#020817] text-[#F8FAFC]">
        <ChangePasswordModal />
      </div>
    );
  }

  return (
    <div className="dashboard-shell min-h-screen flex flex-col bg-[#020817] text-[#F8FAFC] font-sans antialiased selection:bg-emerald-600/30 selection:text-emerald-300">
      <Navbar
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        mobileSidebarOpen={mobileSidebarOpen}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <main className="dashboard-main min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Enterprise AI Assistant Copilot */}
      <AIAssistant onPreFillLeave={handlePreFillLeave} />

      {/* Mandatory Password Change Modal for new employees */}
      <ChangePasswordModal />
    </div>
  );
}
