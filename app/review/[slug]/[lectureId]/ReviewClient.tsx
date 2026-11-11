'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen, CheckCircle2, RotateCcw, ArrowLeft, ArrowRight,
  Lightbulb, Eye, HelpCircle, Layers, Sparkles, ChevronRight
} from 'lucide-react';
import MathText from '@/app/MathText';

interface Question {
  id: number;
  type: string;
  stem: string;
  options?: string | null;
  correct: string;
  explanation: string | null;
  urdu_answer: string | null;
  marks?: number;
}

export default function ReviewClient({
  lectureId,
  lectureNumber,
  lectureTitle,
  subjectSlug,
  subjectCode,
}: {
  lectureId: string;
  lectureNumber?: number;
  lectureTitle?: string;
  subjectSlug: string;
  subjectCode?: string;
}) {
  const displayLectureNum = lectureNumber ?? lectureId;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showUrdu, setShowUrdu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const typeParam = filterType === 'all' ? '' : `&type=${filterType}`;
    const res = await fetch(`/api/questions?lecture_id=${lectureId}&subject=${subjectSlug}&lecture_num=${displayLectureNum}${typeParam}`);
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setCurrent(0);
    setRevealed(false);
    setShowUrdu(false);
    setDone(false);
    setLoading(false);
  }, [lectureId, subjectSlug, displayLectureNum, filterType]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Keyboard navigation: Space to reveal, Left/Right arrows to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setRevealed(r => !r);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const q = questions[current];

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setRevealed(false);
      setShowUrdu(false);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(c => c - 1);
      setRevealed(false);
      setShowUrdu(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading lecture questions &amp; solutions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Questions Found</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          No questions are available for Lecture {displayLectureNum} under the selected filter "{filterType}".
        </p>
        <div className="pt-2 flex justify-center gap-2">
          {filterType !== 'all' && (
            <button
              onClick={() => setFilterType('all')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Show All Questions
            </button>
          )}
          <Link
            href={`/subjects/${subjectSlug}`}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course</span>
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Completed!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have successfully reviewed all {questions.length} questions for Lecture {displayLectureNum} ({lectureTitle || subjectCode}).
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => { setCurrent(0); setRevealed(false); setDone(false); }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Review Again</span>
          </button>
          <Link
            href={`/subjects/${subjectSlug}`}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold text-xs inline-flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Course Outline</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ─── Navigation Header ─── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/subjects/${subjectSlug}`}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{subjectCode || 'Course'}</span>
            </Link>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs font-extrabold text-slate-900">Lecture {displayLectureNum} Study &amp; Review</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 mt-0.5">{lectureTitle}</h1>
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'mcq', label: 'MCQs' },
            { id: 'short', label: 'Short' },
            { id: 'long', label: 'Long' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Question Card & Progress ─── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Question {current + 1} of {questions.length}</span>
            <span className="uppercase text-[10px] tracking-wider font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {q?.type === 'mcq' ? 'MCQ (1 Mark)' : q?.type === 'short' ? 'Short Question (3 Marks)' : 'Long Question (5 Marks)'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Statement */}
        <div className="space-y-4 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Statement</div>
          <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
            <MathText text={q?.stem || ''} />
          </div>

          {/* MCQ Options (if question is an MCQ) */}
          {q?.type === 'mcq' && q?.options && (
            <div className="space-y-2 pt-2">
              {(() => {
                try {
                  const opts = JSON.parse(q.options) as Record<string, string>;
                  return Object.entries(opts).map(([key, val]) => {
                    const isCorrect = revealed && key.toLowerCase() === q.correct?.toLowerCase();
                    return (
                      <div
                        key={key}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm transition-all ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
                        }`}>
                          {key}
                        </span>
                        <div className="flex-1 pt-0.5">
                          <MathText text={val} />
                        </div>
                      </div>
                    );
                  });
                } catch {
                  return null;
                }
              })()}
            </div>
          )}
        </div>

        {/* ─── Reveal Answer Section ─── */}
        {!revealed ? (
          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setRevealed(true)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Eye className="w-4 h-4" />
              <span>Reveal Verified Solution &amp; Key</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              Click button or press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600 font-mono text-[10px]">Space</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600 font-mono text-[10px]">Enter</kbd>
            </p>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            {/* Verified Answer Card */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-950 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Solution / Key</span>
              </div>
              <div className="text-sm font-semibold leading-relaxed text-emerald-900">
                <MathText text={q?.correct || ''} />
              </div>
            </div>

            {/* In-Depth Explanation */}
            {q?.explanation && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 text-slate-800 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold text-blue-900 text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span>Comprehensive Past Paper Explanation</span>
                </div>
                <div className="math-content leading-relaxed text-slate-700">
                  <MathText text={q.explanation} />
                </div>
              </div>
            )}

            {/* Bilingual Urdu Answer Toggle */}
            {q?.urdu_answer && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowUrdu(u => !u)}
                  className="px-3.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{showUrdu ? 'اردو تشریح چھپائیں (Hide Urdu)' : 'اردو تشریح دیکھیں (View Urdu Explanation)'}</span>
                </button>

                {showUrdu && (
                  <div
                    className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 text-slate-900 font-urdu text-base sm:text-lg leading-[2.4] text-right shadow-xs"
                    dir="rtl"
                  >
                    <div className="text-xs font-sans font-bold text-amber-800 mb-1 text-right" dir="rtl">
                      اردو خلاصہ و وضاحت:
                    </div>
                    {q.urdu_answer}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Prev / Next Footer Controls ─── */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <span>{current + 1 >= questions.length ? 'Finish Review' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
