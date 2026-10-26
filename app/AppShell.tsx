'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { User } from 'lucide-react';

/**
 * Slim top-of-viewport progress bar shown during Next.js route transitions.
 * Uses pure CSS keyframe animations -- no external packages.
 */
function NavigationProgress() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [visible, setVisible] = useState(false);

  // Ref-like value to track the previous pathname without triggering extra renders
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    if (pathname === prevPathname) return;

    // New navigation detected -- start the progress animation
    setNavigating(true);
    setFinishing(false);
    setVisible(true);

    // After a brief delay simulate the "finish" phase
    const finishTimer = setTimeout(() => {
      setNavigating(false);
      setFinishing(true);
    }, 150);

    // After the finish animation completes, hide the bar entirely
    const hideTimer = setTimeout(() => {
      setFinishing(false);
      setVisible(false);
    }, 650);

    setPrevPathname(pathname);

    return () => {
      clearTimeout(finishTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname, prevPathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
      {/* Progress track */}
      <div
        className="h-[2.5px] bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]"
        style={{
          animation: finishing
            ? 'nav-progress-finish 400ms ease-out forwards'
            : 'nav-progress 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        }}
      />
      {/* Spinning indicator at the leading edge */}
      {navigating && (
        <div className="absolute right-2 top-0 nav-spinner">
          <div className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExamOrQuiz = pathname.startsWith('/quiz') || pathname.startsWith('/exam');

  // Full-screen dedicated exam mode: No external navigation or website footer
  if (isExamOrQuiz) {
    return (
      <div className="min-h-screen w-full">
        <NavigationProgress />
        {children}
      </div>
    );
  }

  // Standard web portal mode
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Navigation progress bar -- above everything */}
      <NavigationProgress />

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
            Virtual University of Pakistan — Online Exam Simulation &amp; Study Portal
          </p>
          <p className="mt-1 text-slate-400">
            Pattern compliant with official VU Mid-Term and Final-Term examination guidelines.
          </p>
        </div>
      </footer>
    </div>
  );
}
