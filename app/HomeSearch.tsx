'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, X, BookOpen, Clock, FileText, Edit3, ArrowRight,
  Layers, Loader2, Sparkles, Filter, CheckCircle2, GraduationCap
} from 'lucide-react';
import type { SubjectWithStats } from './page';

interface LectureResult {
  id: number;
  number: number;
  title: string;
  subject_name: string;
  subject_code: string;
  subject_slug: string;
  question_count: number;
}

type FacultyCategory = 'all' | 'cs' | 'math' | 'mgmt' | 'lang';

function getFaculty(code: string): FacultyCategory {
  const upper = code.toUpperCase();
  if (upper.startsWith('CS')) return 'cs';
  if (upper.startsWith('STA') || upper.startsWith('MTH')) return 'math';
  if (upper.startsWith('MGT')) return 'mgmt';
  if (upper.startsWith('ENG')) return 'lang';
  return 'cs';
}

function getFacultyBadge(category: FacultyCategory) {
  switch (category) {
    case 'cs':
      return { label: 'Computer Science & IT', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'math':
      return { label: 'Mathematics & Stats', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'mgmt':
      return { label: 'Management Sciences', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'lang':
      return { label: 'Languages & Humanities', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    default:
      return { label: 'Academic Course', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export default function HomeSearch({ initialSubjects }: { initialSubjects: SubjectWithStats[] }) {
  const [query, setQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyCategory>('all');
  const [subjects, setSubjects] = useState<SubjectWithStats[]>(initialSubjects);
  const [lectures, setLectures] = useState<LectureResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navigateTo = (href: string) => {
    setNavigatingTo(href);
    router.push(href);
  };

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setSubjects(initialSubjects);
      setLectures([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setSubjects(data.subjects ?? []);
        setLectures(data.lectures ?? []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, initialSubjects]);

  // Filter courses by faculty
  const filteredSubjects = useMemo(() => {
    if (selectedFaculty === 'all') return subjects;
    return subjects.filter((s) => getFaculty(s.code) === selectedFaculty);
  }, [subjects, selectedFaculty]);

  const quickPills = [
    { label: 'CS403', query: 'CS403' },
    { label: 'CS101', query: 'CS101' },
    { label: 'STA301', query: 'STA301' },
    { label: 'CS504', query: 'CS504' },
    { label: 'MTH202', query: 'MTH202' },
    { label: 'MGT501', query: 'MGT501' },
    { label: 'Normalization', query: 'Normalization' },
    { label: 'Binary Search', query: 'Binary Search' },
  ];

  return (
    <div className="space-y-10">
      {/* ─── Search & Quick Action Controls ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <label htmlFor="course-search-input" className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>Search Courses, Topics &amp; Lecture Numbers</span>
          </label>
          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600 font-mono text-[10px]">/</kbd> to focus
          </span>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            id="course-search-input"
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code (CS403, STA301) or topic (Normalization, SDLC, Probability)..."
            className="w-full pl-10 pr-10 py-3 bg-slate-50/70 border border-slate-300/80 focus:border-blue-600 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 text-sm shadow-xs focus:ring-4 focus:ring-blue-100 transition-all outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-slate-500 font-semibold text-[11px] mr-1">Popular:</span>
          {quickPills.map((pill) => (
            <button
              key={pill.label}
              onClick={() => setQuery(pill.query)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                query.toLowerCase() === pill.query.toLowerCase()
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {pill.label}
            </button>
          ))}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="px-2 py-1 text-rose-600 hover:text-rose-700 hover:underline transition-colors ml-auto text-xs font-semibold cursor-pointer"
            >
              Reset Search
            </button>
          )}
        </div>
      </div>

      {/* ─── Faculty Category Tabs (when not searching specific text) ─── */}
      {!query && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80">
          {[
            { id: 'all', label: 'All Courses', count: initialSubjects.length },
            { id: 'cs', label: 'Computer Science & IT', count: initialSubjects.filter(s => getFaculty(s.code) === 'cs').length },
            { id: 'math', label: 'Mathematics & Statistics', count: initialSubjects.filter(s => getFaculty(s.code) === 'math').length },
            { id: 'mgmt', label: 'Business & Management', count: initialSubjects.filter(s => getFaculty(s.code) === 'mgmt').length },
            { id: 'lang', label: 'Languages', count: initialSubjects.filter(s => getFaculty(s.code) === 'lang').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFaculty(tab.id as FacultyCategory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedFaculty === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedFaculty === tab.id ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ─── Matching Lectures Live Results (Search Mode) ─── */}
      {query && lectures.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Matching Lectures &amp; Topics</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {lectures.length} Result{lectures.length !== 1 ? 's' : ''}
              </span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lectures.map((lec) => (
              <div
                key={lec.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                      {lec.subject_code} &bull; Lec {lec.number}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">
                      {lec.subject_name}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-2 leading-snug">
                    {lec.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {lec.question_count > 0 ? `${lec.question_count} practice questions available` : 'Curriculum topic'}
                    </span>
                  </p>
                </div>

                {/* Instant Quiz Modes */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => navigateTo(`/quiz/${lec.subject_slug}/${lec.number}?type=mcq`)}
                      disabled={navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=mcq`}
                      className="py-2 px-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=mcq` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>MCQs Quiz</span>
                    </button>
                    <button
                      onClick={() => navigateTo(`/quiz/${lec.subject_slug}/${lec.number}?type=short`)}
                      disabled={navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=short`}
                      className="py-2 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=short` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      ) : (
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>Short (3m)</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => navigateTo(`/quiz/${lec.subject_slug}/${lec.number}?type=long`)}
                      disabled={navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=long`}
                      className="py-2 px-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=long` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>Long (5m)</span>
                    </button>
                    <button
                      onClick={() => navigateTo(`/quiz/${lec.subject_slug}/${lec.number}?type=all`)}
                      disabled={navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=all`}
                      className="py-2 px-2 bg-slate-900 hover:bg-blue-900 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=all` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Layers className="w-3.5 h-3.5" />
                      )}
                      <span>Full Set</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Courses Grid Section ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {query ? 'Matching Courses' : 'Accredited Degree Courses'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select any course to access modular lecture quizzes, timed exam simulations, and verified past papers.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            Showing {filteredSubjects.length} course{filteredSubjects.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Empty State */}
        {filteredSubjects.length === 0 && (!query || lectures.length === 0) ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No courses match "{query}"</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              We couldn't find any courses matching your keywords. Try searching by course code (e.g., <strong>CS403</strong>, <strong>CS101</strong>, <strong>STA301</strong>) or select "All Courses".
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => { setQuery(''); setSelectedFaculty('all'); }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          /* Bento Course Cards Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => {
              const faculty = getFaculty(subject.code);
              const badge = getFacultyBadge(faculty);
              const isSta301 = subject.slug === 'sta301';
              const midtermScope = isSta301 ? 'Lec 1 to 21' : 'Lec 1 to 22';

              return (
                <div
                  key={subject.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs card-hover flex flex-col justify-between"
                >
                  <div>
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold tracking-wide text-white bg-slate-950 px-2.5 py-1 rounded-lg shadow-xs">
                          {subject.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {midtermScope}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                      {subject.name}
                    </h3>

                    {/* Course Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 mb-5 leading-relaxed">
                      {subject.description.replace(/ — Virtual University$/, '')}.
                    </p>

                    {/* Stats Strip */}
                    <div className="flex items-center gap-4 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 mb-5 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span><strong>{subject.lecture_count ?? 22}</strong> Lectures</span>
                      </div>
                      <div className="w-px h-3.5 bg-slate-200" />
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span><strong>{subject.question_count ? subject.question_count.toLocaleString() : '300+'}</strong> Questions</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary & Secondary Action Buttons */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => navigateTo(`/subjects/${subject.slug}`)}
                      disabled={navigatingTo === `/subjects/${subject.slug}`}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98] ${
                        navigatingTo === `/subjects/${subject.slug}` ? 'opacity-75 cursor-wait' : ''
                      }`}
                    >
                      {navigatingTo === `/subjects/${subject.slug}` ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Opening Course Portal...</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 text-slate-300" />
                          <span>View Lectures &amp; Topics</span>
                          <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                        </>
                      )}
                    </button>

                    {/* Midterm & Finalterm Simulation Quick Launch */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                      <button
                        onClick={() => navigateTo(`/exam/${subject.slug}/midterm`)}
                        disabled={navigatingTo === `/exam/${subject.slug}/midterm`}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 rounded-xl border border-slate-200 transition-colors cursor-pointer active:scale-[0.98] ${
                          navigatingTo === `/exam/${subject.slug}/midterm` ? 'opacity-75 cursor-wait' : ''
                        }`}
                        title="Start full simulated Midterm Exam (60 min)"
                      >
                        {navigatingTo === `/exam/${subject.slug}/midterm` ? (
                          <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3 text-blue-600" />
                        )}
                        <span>Midterm (60m)</span>
                      </button>

                      <button
                        onClick={() => navigateTo(`/exam/${subject.slug}/finalterm`)}
                        disabled={navigatingTo === `/exam/${subject.slug}/finalterm`}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 rounded-xl border border-slate-200 transition-colors cursor-pointer active:scale-[0.98] ${
                          navigatingTo === `/exam/${subject.slug}/finalterm` ? 'opacity-75 cursor-wait' : ''
                        }`}
                        title="Start full simulated Finalterm Exam (90 min)"
                      >
                        {navigatingTo === `/exam/${subject.slug}/finalterm` ? (
                          <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>Finalterm (90m)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
