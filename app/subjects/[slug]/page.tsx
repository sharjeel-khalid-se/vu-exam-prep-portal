import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shuffle, Clock, BookOpen, ArrowRight, FileText, Edit3, Layers, Info } from 'lucide-react';
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
  const isPractical = subject.code.endsWith('P');
  const midtermSyllabus = isSta301 ? 'Lectures 1 to 21' : 'Lectures 1 to 22';
  const finaltermSyllabus = isSta301 ? 'Lectures 22 to 45' : 'Lectures 23 to 45';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-900 font-medium transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-semibold">{subject.code}</span>
      </nav>

      {/* Course Banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-white bg-[#0f172a] px-2 py-0.5 rounded">
            {subject.code}
          </span>
          <span className="text-xs text-slate-400 font-medium">Virtual University of Pakistan</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">{subject.name}</h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          {subject.description.replace(/ — Virtual University$/, '')}.
        </p>
      </div>

      {/* Official Guidelines Alert (Course Specific) */}
      {isSta301 && (
        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-950 mb-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Official Examination Guidelines (Team STA301)</span>
          </div>
          <div className="space-y-1.5 text-blue-900 leading-relaxed">
            <p>
              <strong>Midterm Scope:</strong> Lectures 1 to 21 &nbsp;·&nbsp; <strong>Final Term Scope:</strong> Lectures 22 to 45
            </p>
            <p className="text-blue-800">
              <strong>Paper Structure:</strong> Objective Type (MCQs), <strong>3-Mark Questions</strong> (short theoretical answers, writing formulas, and simple calculations using given data), and <strong>5-Mark Questions</strong> (applying statistical formulas, multi-step calculations, and numerical data analysis).
            </p>
          </div>
        </div>
      )}

      {isCs403 && (
        <div className="mb-8 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-950">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Official Course Information & Grading Scheme (CS403 - Fall 2026)</span>
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">Instructor: Rizwan Riaz Mir (CS403@vu.edu.pk)</span>
          </div>
          <div className="space-y-2 text-indigo-900 leading-relaxed">
            <p>
              <strong>Weightage Breakdown:</strong> Midterm Exams (20%) &nbsp;·&nbsp; Final Term Exams (60%) &nbsp;·&nbsp; Assignments (10%) &nbsp;·&nbsp; Quizzes (5%) &nbsp;·&nbsp; Graded Discussion Board / GDB (5%).
            </p>
            <p className="text-indigo-800">
              <strong>Mandatory 20% Passing Rule:</strong> To qualify for the Final Term exam, students must obtain at least 20% marks in their Semester Work (Assignments + Quizzes + GDB + Midterm). Furthermore, scoring at least 20% in the Final Term exam is required to clear the course.
            </p>
          </div>
        </div>
      )}

      {isCs403p && (
        <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Practical Course Guidelines & Grading Scheme (CS403P - Fall 2026)</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Instructor: Rizwan Riaz Mir (CS403p@vu.edu.pk)</span>
          </div>
          <div className="space-y-2 text-emerald-900 leading-relaxed">
            <p>
              <strong>Practical Assessment Breakdown:</strong> Quizzes (25%) &nbsp;·&nbsp; Assignments (15%) &nbsp;·&nbsp; Final Term Practical Exam (60%) &nbsp;·&nbsp; <em>No Midterm Exam in Practical Lab Courses</em>.
            </p>
            <p className="text-emerald-800">
              <strong>Mandatory 20% Passing Rule:</strong> Students must obtain at least 20% marks in cumulative Semester Work (Quizzes + Assignments = 40% pool) to sit/appear in the Final Term Exam, and must score at least 20% in the Final Term Practical Exam to pass the course.
            </p>
          </div>
        </div>
      )}

      {isCs304p && (
        <div className="mb-8 rounded-xl border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-950">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-teal-950">
              <Info className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Official Practical Course Guidelines & Grading Scheme (CS304P - Fall 2026)</span>
            </div>
            <span className="text-[11px] text-teal-700 font-medium">Team CS304P (cs304p@vu.edu.pk)</span>
          </div>
          <div className="space-y-2 text-teal-900 leading-relaxed">
            <p>
              <strong>Grading Scheme:</strong> Assignments (25%) &nbsp;·&nbsp; General Quizzes (15%) &nbsp;·&nbsp; Final Term Practical Exam (60%) &nbsp;·&nbsp; <em>No Mid-Term Exam for CS304P</em>.
            </p>
            <p className="text-teal-800">
              <strong>Final Exam Pre-requisites:</strong> (1) Minimum 20% in Semester Work (Assignments & General Quizzes), and (2) <strong>At least 70% attendance/attempt in mandatory Lab Quizzes</strong>.
            </p>
            <p className="text-teal-700 font-medium">
              <strong>Exam Environment Note:</strong> Dev-C++ IDE will NOT be available during exams; write and practice code without IDE autocompletion (notepad / paper style).
            </p>
          </div>
        </div>
      )}

      {isCs504 && (
        <div className="mb-8 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-950">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-sky-950">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Official Course Information & Grading Scheme (CS504 - Fall 2026)</span>
            </div>
            <span className="text-[11px] text-sky-700 font-medium">Team CS504 (cs504@vu.edu.pk)</span>
          </div>
          <div className="space-y-2 text-sky-900 leading-relaxed">
            <p>
              <strong>Tentative Grading Scheme:</strong> Midterm Exams (20–30%) &nbsp;·&nbsp; Final Term Exams (50–60%) &nbsp;·&nbsp; Assignments (10–15%) &nbsp;·&nbsp; GDB / Viva (5–10%) &nbsp;·&nbsp; Quizzes (5%).
            </p>
            <p className="text-sky-800">
              <strong>Mandatory 20% Passing Rule:</strong> Semester Work is calculated based on Assignments, Quizzes, GDB & Midterm Exams. If a student fails to obtain a minimum 20% in Semester Work, they will <strong>NOT</strong> be allowed to appear in Final Term Exams.
            </p>
          </div>
        </div>
      )}

      {isMgt501 && (
        <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-950">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-950">
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Official Course Information & Guidelines (MGT501 - Fall 2026)</span>
            </div>
            <span className="text-[11px] text-rose-700 font-medium">Team MGT501 (mgt501@vu.edu.pk)</span>
          </div>
          <div className="space-y-2 text-rose-900 leading-relaxed">
            <p>
              <strong>Assessment Instruments:</strong> Evaluated through Graded Discussion Boards (GDB), Assignments, Quizzes, Mid-Term and Final-Term Examinations.
            </p>
            <p className="text-rose-800">
              <strong>Support & Queries:</strong> Post lecture-specific problems on the Moderated Discussion Board (MDB). For other queries and comments, email <em>mgt501@vu.edu.pk</em> or use the VU Support System (<a href="https://www.vu.edu.pk/SupportSystem/" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-rose-950">vu.edu.pk/SupportSystem</a>).
            </p>
          </div>
        </div>
      )}

      {/* ── Official Exam Modes ── */}
      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Official exam simulations</h2>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Shuffle className="w-3.5 h-3.5 text-slate-400" />
            <span>Full VU exam interface. Questions and options are shuffled on every attempt.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mid-Term Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs mb-3">
                <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                  Mid-term
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> 60 minutes
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Mid-Term Examination Simulation</h3>
              <p className="text-xs text-slate-500 mb-2">Total marks: 38 · Best attempt rule</p>
              <div className="text-xs text-slate-700 flex items-center gap-1.5 mb-5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Syllabus: {midtermSyllabus}</span>
              </div>

              {/* Table */}
              <div className="border border-slate-100 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-3">SECTION</th>
                      <th className="py-2 px-3">GIVEN</th>
                      <th className="py-2 px-3">COUNTED</th>
                      <th className="py-2 px-3 text-right">MARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">MCQs</td>
                      <td className="py-2.5 px-3">27</td>
                      <td className="py-2.5 px-3">Best 22</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">22</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Short questions</td>
                      <td className="py-2.5 px-3">3</td>
                      <td className="py-2.5 px-3">Best 2 × 3</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">6</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Long questions</td>
                      <td className="py-2.5 px-3">3</td>
                      <td className="py-2.5 px-3">Best 2 × 5</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">10</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="py-2.5 px-3 text-slate-900">Total</td>
                      <td className="py-2.5 px-3 text-right text-slate-900">38 marks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Link
              href={`/exam/${subject.slug}/midterm`}
              className="w-full text-center py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs transition-all text-xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>Start Mid-Term Exam Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Final-Term Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs mb-3">
                <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                  Final-term
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> 90 minutes
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Final-Term Examination Simulation</h3>
              <p className="text-xs text-slate-500 mb-2">Total marks: 60 · Comprehensive syllabus</p>
              <div className="text-xs text-slate-700 flex items-center gap-1.5 mb-5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Syllabus: {finaltermSyllabus}</span>
              </div>

              {/* Table */}
              <div className="border border-slate-100 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-3">SECTION</th>
                      <th className="py-2 px-3">GIVEN</th>
                      <th className="py-2 px-3">COUNTED</th>
                      <th className="py-2 px-3 text-right">MARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">MCQs</td>
                      <td className="py-2.5 px-3">40</td>
                      <td className="py-2.5 px-3">Best 33</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">33</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Short questions</td>
                      <td className="py-2.5 px-3">6</td>
                      <td className="py-2.5 px-3">Best 4 × 3</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">12</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Long questions</td>
                      <td className="py-2.5 px-3">4</td>
                      <td className="py-2.5 px-3">Best 3 × 5</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">15</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="py-2.5 px-3 text-slate-900">Total</td>
                      <td className="py-2.5 px-3 text-right text-slate-900">60 marks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Link
              href={`/exam/${subject.slug}/finalterm`}
              className="w-full text-center py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs transition-all text-xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>Start Final-Term Exam Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lecture-by-Lecture Practice ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Lecture-by-lecture practice</h2>
          <p className="text-xs text-slate-500">Practice topic-wise with dedicated question types and answer inputs.</p>
        </div>

        <div className="space-y-4">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                    LECTURE {lecture.number}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{lecture.title}</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {lecture.question_count} questions
                </span>
              </div>

              {/* 4 Practice Mode Cards matching design */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* MCQs Quiz */}
                <Link
                  href={`/quiz/${subject.slug}/${lecture.id}?type=mcq`}
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-start gap-2.5 group active:scale-[0.97]"
                >
                  <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">MCQs quiz</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Timed, 1 min per question</div>
                  </div>
                </Link>

                {/* Short Questions */}
                <Link
                  href={`/quiz/${subject.slug}/${lecture.id}?type=short`}
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-start gap-2.5 group active:scale-[0.97]"
                >
                  <Edit3 className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Short questions</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">3 marks · Text input</div>
                  </div>
                </Link>

                {/* Long Questions */}
                <Link
                  href={`/quiz/${subject.slug}/${lecture.id}?type=long`}
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-start gap-2.5 group active:scale-[0.97]"
                >
                  <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Long questions</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">5 marks · Rich editor</div>
                  </div>
                </Link>

                {/* Mixed Mode */}
                <Link
                  href={`/quiz/${subject.slug}/${lecture.id}?type=all`}
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-start gap-2.5 group active:scale-[0.97]"
                >
                  <Layers className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Mixed practice</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">All types combined</div>
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
