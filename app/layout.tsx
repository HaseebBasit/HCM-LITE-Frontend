import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/authContext';

export const metadata: Metadata = {
  title: 'Saylani Enterprises | HCM Lite Core Engine',
  description: 'Mission-critical AI-assisted Human Capital Management System for Saylani Mass IT Training (SMIT)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#020817] text-slate-100 antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-[#020817] text-[#F8FAFC] selection:bg-emerald-600/30 selection:text-emerald-300">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
