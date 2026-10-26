'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, Clock, FileText, Edit3, ArrowRight, Layers, Loader2 } from 'lucide-react';

interface Subject {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string;
}

interface LectureResult {
  id: number;
  number: number;
  title: string;
  subject_name: string;
  subject_code: string;
  subject_slug: string;
  question_count: number;
}

export default function HomeSearch({ initialSubjects }: { initialSubjects: Subject[] }) {
  const [query, setQuery] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [lectures, setLectures] = useState<LectureResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const router = useRouter();

  const navigateTo = (href: string) => {
    setNavigatingTo(href);
    router.push(href);
  };

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

  const quickPills = ['CS403', 'CS504', 'MGT501', 'STA301', 'MTH202', 'Lecture 1'];

  return (
    <div>
      {/* ── Search Bar Section ── */}
      <div className="mb-10 max-w-xl">
        <label className="block text-xs font-bold text-slate-700 mb-2">
          Search courses and topics
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try CS403, Normalization, Lecture 1"
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 focus:border-slate-800 rounded-lg text-slate-900 placeholder:text-slate-400 text-sm shadow-xs focus:outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap text-xs">
          <span className="text-slate-500 font-medium text-[11px]">Quick search:</span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              onClick={() => setQuery(pill)}
              className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                query.toLowerCase() === pill.toLowerCase()
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {pill}
            </button>
          ))}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="px-2 py-0.5 text-slate-400 hover:text-red-500 transition-colors ml-auto text-xs"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Search Results or Default Catalog ── */}

      {/* When searching and results exist for Lectures */}
      {query && lectures.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Matching Lectures</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {lectures.length} Found
              </span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lectures.map((lec) => (
              <div
                key={lec.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.97] transition-transform flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {lec.subject_code} • Lecture {lec.number}
                    </span>
                    <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
                      {lec.subject_name}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{lec.title}</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {lec.question_count > 0 ? `${lec.question_count} practice questions available` : 'Standard VU curriculum lecture'}
                  </p>
                </div>

                {/* 1-Click Practice Buttons */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                    <button
                      onClick={() => navigateTo(`/quiz/${lec.subject_slug}/${lec.number}?type=mcq`)}
                      disabled={navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=mcq`}
                      className={`text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 transition-colors active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5 ${navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=mcq` ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=mcq` ? (
                        <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>MCQs Quiz</span>
                    </button>
                    <button
                      onClick={() => navigateTo(`/quiz/${lec.subject_slug}/${lec.number}?type=short`)}
                      disabled={navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=short`}
                      className={`text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 transition-colors active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5 ${navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=short` ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=short` ? (
                        <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                      ) : (
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>Short (3m)</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                    <button
                      onClick={() => navigateTo(`/quiz/${lec.subject_slug}/${lec.number}?type=long`)}
                      disabled={navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=long`}
                      className={`text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 transition-colors active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5 ${navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=long` ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=long` ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      <span>Long (5m)</span>
                    </button>
                    <button
                      onClick={() => navigateTo(`/quiz/${lec.subject_slug}/${lec.number}?type=all`)}
                      disabled={navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=all`}
                      className={`text-center py-2 bg-[#0f172a] hover:bg-slate-800 text-white rounded-lg transition-colors active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5 ${navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=all` ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {navigatingTo === `/quiz/${lec.subject_slug}/${lec.number}?type=all` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Layers className="w-3.5 h-3.5" />
                      )}
                      <span>Mixed</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses / Subjects Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {query ? 'Matching courses' : 'Available courses'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {query ? 'Courses matching your search criteria' : 'Select a course to start topic practice or full examination.'}
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Showing {subjects.length} of {initialSubjects.length} courses
          </span>
        </div>

        {subjects.length === 0 && (!query || lectures.length === 0) ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No courses or lectures matched "{query}"</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Try searching for course codes like <strong>CS403</strong>, <strong>CS504</strong>, <strong>CS201</strong>, <strong>CS301</strong>, or keywords like <strong>Database</strong> or <strong>Lecture 1</strong>.
            </p>
            <button
              onClick={() => setQuery('')}
              className="mt-4 px-4 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="mb-3">
                    <span className="text-xs font-bold text-white bg-[#0f172a] px-2 py-0.5 rounded">
                      {subject.code}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{subject.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                    {subject.description.replace(/ — Virtual University$/, '')}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => navigateTo(`/subjects/${subject.slug}`)}
                    disabled={navigatingTo === `/subjects/${subject.slug}`}
                    className={`w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs active:scale-[0.97] transition-transform ${
                      navigatingTo === `/subjects/${subject.slug}` ? 'opacity-75 cursor-wait' : ''
                    }`}
                  >
                    {navigatingTo === `/subjects/${subject.slug}` ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Opening portal...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter course portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateTo(`/exam/${subject.slug}/midterm`)}
                      disabled={navigatingTo === `/exam/${subject.slug}/midterm`}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors active:scale-[0.97] transition-transform ${
                        navigatingTo === `/exam/${subject.slug}/midterm` ? 'opacity-75 cursor-wait' : ''
                      }`}
                    >
                      {navigatingTo === `/exam/${subject.slug}/midterm` ? (
                        <Loader2 className="w-3 h-3 text-slate-600 animate-spin" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-400" />
                      )}
                      <span>Mid-term · 60 min</span>
                    </button>
                    <button
                      onClick={() => navigateTo(`/exam/${subject.slug}/finalterm`)}
                      disabled={navigatingTo === `/exam/${subject.slug}/finalterm`}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors active:scale-[0.97] transition-transform ${
                        navigatingTo === `/exam/${subject.slug}/finalterm` ? 'opacity-75 cursor-wait' : ''
                      }`}
                    >
                      {navigatingTo === `/exam/${subject.slug}/finalterm` ? (
                        <Loader2 className="w-3 h-3 text-slate-600 animate-spin" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-400" />
                      )}
                      <span>Final-term · 90 min</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
