import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Shuffle, Clock, BookOpen, ArrowRight, FileText, Edit3,
  Layers, Info, ShieldCheck, CheckCircle2, ChevronRight, Home, Sparkles, HelpCircle
} from 'lucide-react';
import { queryOne, queryAll } from '@/lib/db';

interface Lecture {
  id: number;
  number: number;
  title: string;
  question_count: number;
}

interface Subject {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string;
}

async function getSubjectData(slug: string): Promise<{ subject: Subject; lectures: Lecture[] } | null> {
  try {
    const subject = await queryOne<Subject>('SELECT * FROM subjects WHERE slug = ?', [slug]);
    if (!subject) return null;
    const lectures = await queryAll<Lecture>(`
      SELECT l.*, 
        (SELECT COUNT(*) FROM questions q WHERE q.lecture_id = l.id) as question_count
      FROM lectures l
      WHERE l.subject_id = ?
      ORDER BY l.number
    `, [subject.id]);
    return { subject, lectures };
  } catch {
    return null;
  }
}

export default async function SubjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSubjectData(slug);
  if (!data) notFound();
  const { subject, lectures } = data;

  const isSta301 = subject.slug === 'sta301';
  const isCs403 = subject.slug === 'cs403';
  const isCs403p = subject.slug === 'cs403p';
  const isCs304p = subject.slug === 'cs304p';
  const isCs504 = subject.slug === 'cs504';
  const isMgt501 = subject.slug === 'mgt501';

  const midtermSyllabus = isSta301 ? 'Lectures 1 to 21' : 'Lectures 1 to 22';
  const finaltermSyllabus = isSta301 ? 'Lectures 22 to 45' : 'Lectures 23 to 45';
  const totalQuestions = lectures.reduce((acc, l) => acc + (l.question_count || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      {/* ─── Breadcrumb Navigation ─── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-blue-700 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/" className="hover:text-blue-700 transition-colors">
          Courses
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold px-2 py-0.5 bg-slate-100 rounded-md">
          {subject.code}
        </span>
      </nav>

      {/* ─── Course Hero Banner ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-black text-white bg-slate-900 px-3 py-1 rounded-lg tracking-wider">
                {subject.code}
              </span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                Virtual University of Pakistan
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Midterm Scope: {midtermSyllabus}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {subject.name}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {subject.description.replace(/ — Virtual University$/, '')}.
            </p>

            {/* Quick Metadata Strip */}
            <div className="flex items-center gap-4 sm:gap-6 pt-1 text-xs text-slate-500 font-semibold flex-wrap">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>{lectures.length} Total Lectures</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{totalQuestions.toLocaleString()}+ Past Paper Questions</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>VUSoft Simulation Ready</span>
              </div>
            </div>
          </div>

          {/* Quick Exam Launch Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-64 shrink-0">
            <Link
              href={`/exam/${subject.slug}/midterm`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs active:scale-[0.98]"
            >
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Launch Mid-Term Exam (60m)</span>
            </Link>
            <Link
              href={`/exam/${subject.slug}/finalterm`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors border border-slate-200 active:scale-[0.98]"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Launch Final-Term Exam (90m)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Official Examination Guidelines Alert ─── */}
      {isSta301 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-950">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Official Examination Guidelines (STA301 — Fall 2026)</span>
          </div>
          <p className="leading-relaxed">
            <strong>Midterm Scope:</strong> Lectures 1 to 21 &nbsp;&bull;&nbsp; <strong>Final Term Scope:</strong> Lectures 22 to 45.
          </p>
          <p className="text-blue-800 leading-relaxed">
            <strong>Paper Structure:</strong> Objective Type (MCQs), <strong>3-Mark Questions</strong> (short theoretical answers, statistical formulas, and simple calculations), and <strong>5-Mark Questions</strong> (multi-step calculations and numerical data analysis).
          </p>
        </div>
      )}

      {isCs403 && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 text-xs text-indigo-950 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Official Course Information &amp; Grading Scheme (CS403 — Fall 2026)</span>
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">Instructor: Rizwan Riaz Mir (CS403@vu.edu.pk)</span>
          </div>
          <p className="leading-relaxed">
            <strong>Weightage Breakdown:</strong> Midterm Exams (20%) &nbsp;&bull;&nbsp; Final Term Exams (60%) &nbsp;&bull;&nbsp; Assignments (10%) &nbsp;&bull;&nbsp; Quizzes (5%) &nbsp;&bull;&nbsp; Graded Discussion Board / GDB (5%).
          </p>
          <p className="text-indigo-800 leading-relaxed">
            <strong>Mandatory 20% Passing Rule:</strong> To qualify for the Final Term exam, students must obtain at least 20% marks in their cumulative Semester Work (Assignments + Quizzes + GDB + Midterm). Furthermore, scoring at least 20% in the Final Term exam is strictly required to clear the course.
          </p>
        </div>
      )}

      {isCs403p && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-xs text-emerald-950 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Practical Course Guidelines &amp; Grading Scheme (CS403P — Fall 2026)</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Instructor: Rizwan Riaz Mir (CS403p@vu.edu.pk)</span>
          </div>
          <p className="leading-relaxed">
            <strong>Practical Assessment Breakdown:</strong> Quizzes (25%) &nbsp;&bull;&nbsp; Assignments (15%) &nbsp;&bull;&nbsp; Final Term Practical Exam (60%) &nbsp;&bull;&nbsp; <em>No Midterm Exam in Practical Lab Courses</em>.
          </p>
          <p className="text-emerald-800 leading-relaxed">
            <strong>Mandatory 20% Passing Rule:</strong> Students must obtain at least 20% marks in cumulative Semester Work to appear in the Final Term Exam, and must score at least 20% in the Final Term Practical Exam to pass the course.
          </p>
        </div>
      )}

      {isCs304p && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-5 text-xs text-teal-950 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-teal-950">
              <Info className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Official Practical Course Guidelines &amp; Grading Scheme (CS304P — Fall 2026)</span>
            </div>
            <span className="text-[11px] text-teal-700 font-medium">Team CS304P (cs304p@vu.edu.pk)</span>
          </div>
          <p className="leading-relaxed">
            <strong>Grading Scheme:</strong> Assignments (25%) &nbsp;&bull;&nbsp; General Quizzes (15%) &nbsp;&bull;&nbsp; Final Term Practical Exam (60%) &nbsp;&bull;&nbsp; <em>No Mid-Term Exam for CS304P</em>.
          </p>
          <p className="text-teal-800 leading-relaxed">
            <strong>Exam Environment Note:</strong> Dev-C++ IDE will NOT be available during exams; write and practice code without IDE autocompletion.
          </p>
        </div>
      )}

      {isCs504 && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5 text-xs text-sky-950 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-sky-950">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Official Course Information &amp; Grading Scheme (CS504 — Fall 2026)</span>
            </div>
            <span className="text-[11px] text-sky-700 font-medium">Team CS504 (cs504@vu.edu.pk)</span>
          </div>
          <p className="leading-relaxed">
            <strong>Tentative Grading Scheme:</strong> Midterm Exams (20–30%) &nbsp;&bull;&nbsp; Final Term Exams (50–60%) &nbsp;&bull;&nbsp; Assignments (10–15%) &nbsp;&bull;&nbsp; GDB / Viva (5–10%) &nbsp;&bull;&nbsp; Quizzes (5%).
          </p>
          <p className="text-sky-800 leading-relaxed">
            <strong>Mandatory 20% Passing Rule:</strong> Semester Work is calculated based on Assignments, Quizzes, GDB &amp; Midterm Exams. If a student fails to obtain a minimum 20% in Semester Work, they will <strong>NOT</strong> be allowed to appear in Final Term Exams.
          </p>
        </div>
      )}

      {isMgt501 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-xs text-rose-950 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-950">
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Official Course Information &amp; Guidelines (MGT501 — Fall 2026)</span>
            </div>
            <span className="text-[11px] text-rose-700 font-medium">Team MGT501 (mgt501@vu.edu.pk)</span>
          </div>
          <p className="leading-relaxed">
            <strong>Assessment Instruments:</strong> Evaluated through Graded Discussion Boards (GDB), Assignments, Quizzes, Mid-Term and Final-Term Examinations.
          </p>
        </div>
      )}

      {/* ─── Official Exam Simulations Comparison ─── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Full Examination Simulations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete simulation of the official Virtual University VUSoft environment with automated timers and section navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mid-Term Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-blue-600 text-white font-extrabold px-3 py-1 rounded-lg text-xs shadow-xs">
                  Mid-Term Exam
                </span>
                <span className="text-slate-600 font-semibold text-xs flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>60 Minutes</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Mid-Term Examination Simulation</h3>
                <p className="text-xs text-slate-500 mt-1">Total Marks: 38 &nbsp;&bull;&nbsp; Best attempt selection rule applies</p>
                <div className="text-xs text-blue-700 font-semibold mt-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Syllabus: {midtermSyllabus}</span>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3">Given</th>
                      <th className="py-2.5 px-3">Counted</th>
                      <th className="py-2.5 px-3 text-right">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">MCQs</td>
                      <td className="py-2.5 px-3">27</td>
                      <td className="py-2.5 px-3">Best 22</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">22</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Short Questions (3m)</td>
                      <td className="py-2.5 px-3">3</td>
                      <td className="py-2.5 px-3">Best 2 &times; 3</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">6</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Long Questions (5m)</td>
                      <td className="py-2.5 px-3">3</td>
                      <td className="py-2.5 px-3">Best 2 &times; 5</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">10</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="py-2.5 px-3 text-slate-900">Total Paper Marks</td>
                      <td className="py-2.5 px-3 text-right text-blue-700 font-extrabold">38 Marks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Link
              href={`/exam/${subject.slug}/midterm`}
              className="mt-6 w-full text-center py-3 bg-slate-900 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Start Mid-Term Exam Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Final-Term Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-amber-600 text-white font-extrabold px-3 py-1 rounded-lg text-xs shadow-xs">
                  Final-Term Exam
                </span>
                <span className="text-slate-600 font-semibold text-xs flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>90 Minutes</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Final-Term Examination Simulation</h3>
                <p className="text-xs text-slate-500 mt-1">Total Marks: 60 &nbsp;&bull;&nbsp; Comprehensive whole-syllabus coverage</p>
                <div className="text-xs text-amber-800 font-semibold mt-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Syllabus: {finaltermSyllabus}</span>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3">Given</th>
                      <th className="py-2.5 px-3">Counted</th>
                      <th className="py-2.5 px-3 text-right">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">MCQs</td>
                      <td className="py-2.5 px-3">40</td>
                      <td className="py-2.5 px-3">Best 33</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">33</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Short Questions (3m)</td>
                      <td className="py-2.5 px-3">6</td>
                      <td className="py-2.5 px-3">Best 4 &times; 3</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">12</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Long Questions (5m)</td>
                      <td className="py-2.5 px-3">4</td>
                      <td className="py-2.5 px-3">Best 3 &times; 5</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">15</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="py-2.5 px-3 text-slate-900">Total Paper Marks</td>
                      <td className="py-2.5 px-3 text-right text-amber-700 font-extrabold">60 Marks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Link
              href={`/exam/${subject.slug}/finalterm`}
              className="mt-6 w-full text-center py-3 bg-slate-900 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Start Final-Term Exam Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Lecture-by-Lecture Modular Practice ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lecture-by-Lecture Practice</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Practice each lecture individually with timed quizzes or study verified solutions and Urdu answers.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
            {lectures.length} Lectures Available
          </span>
        </div>

        <div className="space-y-4">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                    {lecture.number}
                  </span>
                  <div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Lecture {lecture.number}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {lecture.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {lecture.question_count} Questions
                  </span>
                  <Link
                    href={`/review/${subject.slug}/${lecture.number}`}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Study / Urdu</span>
                  </Link>
                </div>
              </div>

              {/* 4 Practice Mode Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
                {/* MCQs Quiz */}
                <Link
                  href={`/quiz/${subject.slug}/${lecture.number}?type=mcq`}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-start gap-2.5 group cursor-pointer active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">MCQs Quiz</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Timed &bull; 1 min/q</div>
                  </div>
                </Link>

                {/* Short Questions */}
                <Link
                  href={`/quiz/${subject.slug}/${lecture.number}?type=short`}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-start gap-2.5 group cursor-pointer active:scale-[0.98]"
                >
                  <Edit3 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Short (3 Marks)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Text editor answer</div>
                  </div>
                </Link>

                {/* Long Questions */}
                <Link
                  href={`/quiz/${subject.slug}/${lecture.number}?type=long`}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50 hover:border-amber-200 transition-all flex items-start gap-2.5 group cursor-pointer active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">Long (5 Marks)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Rich formatted input</div>
                  </div>
                </Link>

                {/* Mixed Mode */}
                <Link
                  href={`/quiz/${subject.slug}/${lecture.number}?type=all`}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-start gap-2.5 group cursor-pointer active:scale-[0.98]"
                >
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Full Mixed</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">All question types</div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
