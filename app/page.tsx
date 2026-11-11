import Link from 'next/link';
import HomeSearch from './HomeSearch';
import { CheckCircle2, BookOpen, GraduationCap, FileText, Sparkles, ShieldCheck } from 'lucide-react';
import { queryAll, queryOne } from '@/lib/db';

export interface SubjectWithStats {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string;
  lecture_count: number;
  question_count: number;
}

interface DBStats {
  total_lectures: number;
  total_questions: number;
}

async function getSubjectsWithStats(): Promise<SubjectWithStats[]> {
  try {
    return await queryAll<SubjectWithStats>(`
      SELECT 
        s.id, s.name, s.slug, s.code, s.description,
        (SELECT COUNT(*) FROM lectures l WHERE l.subject_id = s.id) as lecture_count,
        (SELECT COUNT(*) FROM questions q JOIN lectures l ON q.lecture_id = l.id WHERE l.subject_id = s.id) as question_count
      FROM subjects s
      ORDER BY s.code
    `);
  } catch {
    return [];
  }
}

async function getPortalStats(): Promise<DBStats> {
  try {
    const lecRow = await queryOne<{ c: number }>('SELECT COUNT(*) as c FROM lectures');
    const qRow = await queryOne<{ c: number }>('SELECT COUNT(*) as c FROM questions');
    return {
      total_lectures: lecRow?.c ?? 117,
      total_questions: qRow?.c ?? 1966,
    };
  } catch {
    return { total_lectures: 117, total_questions: 1966 };
  }
}

export default async function HomePage() {
  const [subjects, stats] = await Promise.all([
    getSubjectsWithStats(),
    getPortalStats(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      {/* ─── Hero Section with Visual Hierarchy ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 sm:p-10 lg:p-12 text-white shadow-xl mb-12 border border-slate-700/50">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official VU Examination Software (VUSoft) Pattern</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
              Virtual University <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                Exam Preparation Portal
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              Master your coursework with verified past paper questions, timed Midterm &amp; Finalterm examination simulations, rich-text subjective answer practice, and complete bilingual Urdu solutions.
            </p>

            {/* Feature Badges */}
            <div className="pt-2 flex items-center gap-2.5 sm:gap-4 flex-wrap text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Past Papers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Accurate Exam Timers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Urdu Explanations</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Statistics Card */}
          <div className="lg:col-span-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/70 pb-3 flex items-center justify-between">
              <span>Live Portal Metrics</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex items-baseline gap-3.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{subjects.length}</span>
              <div>
                <div className="text-sm font-bold text-slate-200">Active Courses</div>
                <div className="text-xs text-slate-400">CS, Math, Stats, Business &amp; English</div>
              </div>
            </div>

            <div className="flex items-baseline gap-3.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-400 tracking-tight">{stats.total_lectures}</span>
              <div>
                <div className="text-sm font-bold text-slate-200">Total Lectures</div>
                <div className="text-xs text-slate-400">Lecture-wise modular quizzes</div>
              </div>
            </div>

            <div className="flex items-baseline gap-3.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
                {stats.total_questions.toLocaleString()}+
              </span>
              <div>
                <div className="text-sm font-bold text-slate-200">Exam Question Bank</div>
                <div className="text-xs text-slate-400">MCQs, Short (3m) &amp; Long (5m) questions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Search, Filter Tabs & Course Catalog ─── */}
      <HomeSearch initialSubjects={subjects} />
    </div>
  );
}
