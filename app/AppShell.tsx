'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExamOrQuiz = pathname.startsWith('/quiz') || pathname.startsWith('/exam');

  // Full-screen dedicated exam mode: No external navigation or website footer
  if (isExamOrQuiz) {
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    );
  }

  // Standard web portal mode
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-lg text-slate-900 hover:text-purple-700 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm">
              VU
            </div>
            <div>
              <div className="font-bold text-base leading-tight">Virtual University</div>
              <div className="text-xs font-normal text-slate-500">Exam Preparation Portal</div>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
            >
              Courses
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs shadow-xs">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Guest mode</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">{children}</main>

      {/* Website Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          <p className="font-medium text-slate-700">
            Virtual University of Pakistan — Online Exam Simulation & Study Portal
          </p>
          <p className="mt-1 text-slate-400">
            Pattern compliant with official VU Mid-Term and Final-Term examination guidelines.
          </p>
        </div>
      </footer>
    </div>
  );
}
