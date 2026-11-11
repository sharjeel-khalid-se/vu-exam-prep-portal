'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, BookOpen, GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * Slim top-of-viewport progress bar shown during Next.js route transitions.
 * Coordinates with the new institutional navy-to-blue theme.
 */
function NavigationProgress() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    if (pathname === prevPathname) return;

    setNavigating(true);
    setFinishing(false);
    setVisible(true);

    const finishTimer = setTimeout(() => {
      setNavigating(false);
      setFinishing(true);
    }, 150);

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
      <div
        className="h-[3px] bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500 shadow-[0_0_10px_rgba(37,99,235,0.6)]"
        style={{
          animation: finishing
            ? 'nav-progress-finish 400ms ease-out forwards'
            : 'nav-progress 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        }}
      />
      {navigating && (
        <div className="absolute right-3 top-0.5 nav-spinner">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExamOrQuiz = pathname.startsWith('/quiz') || pathname.startsWith('/exam');

  // Full-screen dedicated exam mode: Focus view without website chrome
  if (isExamOrQuiz) {
    return (
      <div className="min-h-screen w-full bg-slate-100">
        <NavigationProgress />
        {children}
      </div>
    );
  }

  // Standard web portal layout
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <NavigationProgress />

      {/* Main App Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo & Portal Identity */}
          <Link
            href="/"
            className="group flex items-center gap-3.5 transition-opacity hover:opacity-95"
            aria-label="VU Exam Preparation Portal Home"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 flex items-center justify-center text-white font-extrabold text-base shadow-md group-hover:scale-105 transition-transform duration-200">
              <span>VU</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-xs" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 leading-tight flex items-center gap-1.5">
                <span>Virtual University</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Prep Portal
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">Online Examination & Practice Platform</div>
            </div>
          </Link>

          {/* Nav Links & Status Badges */}
          <nav className="flex items-center gap-2.5 sm:gap-3 text-xs font-semibold">
            <Link
              href="/"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-colors shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>All Courses</span>
            </Link>

            {/* Official Pattern Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="font-medium text-[11px]">VU Exam Pattern Verified</span>
            </div>

            {/* Guest Mode Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">Guest Mode</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Modern Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white pt-10 pb-8 text-xs text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
            {/* Col 1: Mission */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                  VU
                </div>
                <span className="font-bold text-sm text-slate-900">Virtual University Exam Preparation Portal</span>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-md">
                An advanced academic practice and examination simulation platform for Virtual University of Pakistan students. Designed with exact paper patterns, time controls, rich-text subjective answer inputs, and verified bilingual solutions.
              </p>
              <div className="flex items-center gap-2 text-emerald-700 font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Over 1,960+ verified past paper questions cataloged across 117+ lectures.</span>
              </div>
            </div>

            {/* Col 2: Academic Faculties */}
            <div className="space-y-2.5">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Course Faculties</div>
              <ul className="space-y-1.5 text-slate-500">
                <li>Computer Science &amp; IT (CS101, CS403, CS504)</li>
                <li>Programming Practicals (CS304P, CS403P)</li>
                <li>Statistics &amp; Data (STA301)</li>
                <li>Discrete Mathematics (MTH202)</li>
                <li>Management Sciences (MGT501)</li>
              </ul>
            </div>

            {/* Col 3: Examination Modes */}
            <div className="space-y-2.5">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Exam Modes</div>
              <ul className="space-y-1.5 text-slate-500">
                <li>Timed Midterm Full Exam (40 Marks)</li>
                <li>Timed Finalterm Full Exam (60 Marks)</li>
                <li>Lecture-Wise 10-Question Quizzes</li>
                <li>Complete Answer Keys &amp; Urdu Explanations</li>
                <li>Mathematical &amp; KaTeX Formula Support</li>
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <p>
              &copy; {new Date().getFullYear()} Virtual University Exam Preparation Portal. Independent student study resource.
            </p>
            <p className="text-center sm:text-right">
              Aligned with official VUSoft / VU Midterm &amp; Finalterm exam guidelines.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
