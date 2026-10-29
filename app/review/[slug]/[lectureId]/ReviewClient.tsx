'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, RotateCcw, ArrowLeft, ArrowRight, Lightbulb, Eye, HelpCircle } from 'lucide-react';
import MathText from '@/app/MathText';

interface Question {
  id: number;
  type: string;
  stem: string;
  correct: string;
  explanation: string | null;
  urdu_answer: string | null;
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
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showUrdu, setShowUrdu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/questions?lecture_id=${lectureId}&subject=${subjectSlug}&lecture_num=${displayLectureNum}&type=short`);
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setLoading(false);
  }, [lectureId]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const q = questions[current];

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setFlipped(false);
      setShowUrdu(false);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(c => c - 1);
      setFlipped(false);
      setShowUrdu(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center text-slate-400 py-20">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <p>Lecture {displayLectureNum} mein short questions nahi hain abhi.</p>
        <Link href={`/subjects/${subjectSlug}`} className="mt-4 inline-flex items-center gap-1.5 text-emerald-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Review Complete!</h2>
        <p className="text-slate-400 mb-8">Tamam {questions.length} short questions review ho gaye.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setCurrent(0); setFlipped(false); setDone(false); }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Again</span>
          </button>
          <Link href={`/subjects/${subjectSlug}`} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex justify-between text-sm text-slate-500 mb-2">
        <span>Card {current + 1} / {questions.length}</span>
        <span className="text-slate-400 flex items-center gap-1">
          {flipped ? (
            <>
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Jawab</span>
            </>
          ) : (
            <>
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Sawal</span>
            </>
          )}
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${((current + (flipped ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Flip Card */}
      <div
        className="relative cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          className="relative transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '220px',
          }}
        >
          {/* Front — Question */}
          <div
            className="absolute inset-0 rounded-2xl bg-slate-900 border border-slate-700 p-8 flex flex-col justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-xs text-slate-500 mb-3 uppercase font-mono">Question (tap to flip)</div>
            <div className="text-white text-xl font-semibold leading-relaxed">
              <MathText text={q?.stem || ''} />
            </div>
          </div>

          {/* Back — Answer */}
          <div
            className="absolute inset-0 rounded-2xl bg-emerald-950 border border-emerald-700/50 p-8 flex flex-col justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-xs text-emerald-500 mb-3 uppercase font-mono">Answer</div>
            <div className="text-emerald-100 text-base leading-relaxed">
              <MathText text={q?.correct || ''} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-600 mt-2 mb-4">Tap the card to flip it</p>

      {/* Extras when flipped */}
      {flipped && (
        <div className="space-y-3 mb-4">
          {q.explanation && (
            <div className="rounded-xl border border-blue-700/50 bg-blue-900/20 p-4 text-blue-200 text-sm flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-400">Note:</strong> <MathText text={q.explanation} />
              </div>
            </div>
          )}
          {q.urdu_answer && (
            <div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowUrdu(u => !u); }}
                className="text-xs text-amber-400 hover:text-amber-300 underline transition-colors"
              >
                {showUrdu ? 'اردو چھپائیں' : 'اردو میں دیکھیں'}
              </button>
              {showUrdu && (
                <div className="mt-2 rounded-xl border border-amber-700/50 bg-amber-900/20 p-4 text-amber-200 text-sm text-right font-serif leading-relaxed" dir="rtl">
                  {q.urdu_answer}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <span>{current + 1 >= questions.length ? 'Done' : 'Next'}</span>
          {current + 1 >= questions.length ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
