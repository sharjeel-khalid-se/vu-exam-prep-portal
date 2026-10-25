import Link from 'next/link';
import HomeSearch from './HomeSearch';
import { Check } from 'lucide-react';

interface Subject {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string;
}

async function getSubjects(): Promise<Subject[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/subjects`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return data.subjects ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const subjects = await getSubjects();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Hero & Metrics Row (2-column layout matching design) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left Column: Hero Copy & Search Input */}
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" /> Official VU exam pattern
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Virtual University Exam Portal
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            Comprehensive preparation platform featuring lecture-wise practice, timed MCQ quizzes, subjective questions with rich text input, and full Mid-Term & Final-Term exam simulations.
          </p>
        </div>

        {/* Right Column: Clean Stat Badges Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900">{subjects.length}</span>
            <div>
              <div className="text-sm font-bold text-slate-800">Courses</div>
              <div className="text-xs text-slate-400">Open in guest mode</div>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900">{subjects.length > 0 ? '6+' : '0'}</span>
            <div>
              <div className="text-sm font-bold text-slate-800">Lectures</div>
              <div className="text-xs text-slate-400">Modular topic breakdowns</div>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900">30+</span>
            <div>
              <div className="text-sm font-bold text-slate-800">Question bank</div>
              <div className="text-xs text-slate-400">MCQs, short & long questions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Search & Course Catalog */}
      <HomeSearch initialSubjects={subjects} />
    </div>
  );
}
