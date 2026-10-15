'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Question {
  id: number;
  type: string;
  stem: string;
  options: string | null;
  correct: string;
  explanation: string | null;
  urdu_answer: string | null;
}

interface ParsedOptions {
  [key: string]: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('vu_session');
  if (!sid) {
    sid = Math.random().toString(36).slice(2);
    localStorage.setItem('vu_session', sid);
  }
  return sid;
}

export default function QuizClient({
  lectureId,
  subjectSlug,
  typeFilter,
}: {
  lectureId: string;
  subjectSlug: string;
  typeFilter: string;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUrdu, setShowUrdu] = useState(false);
  const [startTime] = useState(Date.now());

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const typeParam = typeFilter === 'all' ? '' : `&type=${typeFilter}`;
    const res = await fetch(`/api/questions?lecture_id=${lectureId}${typeParam}`);
    const data = await res.json();
    setQuestions(shuffle(data.questions ?? []));
    setLoading(false);
  }, [lectureId, typeFilter]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const q = questions[current];
  const parsedOptions: ParsedOptions = q?.options ? JSON.parse(q.options) : {};
  const optionKeys = Object.keys(parsedOptions);

  const handleSelect = async (key: string) => {
    if (showResult) return;
    setSelected(key);
    setShowResult(true);
    const isCorrect = key === q.correct;
    if (isCorrect) setScore(s => s + 1);

    // Save progress
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: getSessionId(),
          question_id: q.id,
          answered: key,
          is_correct: isCorrect,
        }),
      });
    } catch { /* non-critical */ }
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowResult(false);
      setShowUrdu(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-slate-400">Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center text-slate-400 py-20">
        <div className="text-5xl mb-4">🤷</div>
        <p>Is lecture mein MCQ questions nahi hain abhi.</p>
        <Link href={`/subjects/${subjectSlug}`} className="mt-4 inline-block text-emerald-400 hover:underline">← Back</Link>
      </div>
    );
  }

  if (done) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚'}</div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Quiz Complete!</h2>
        <p className="text-slate-400 mb-8">
          {elapsed}s mein {questions.length} questions complete kiye
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
          <div className="text-6xl font-extrabold mb-2" style={{
            color: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
          }}>
            {pct}%
          </div>
          <div className="text-slate-400 text-sm">
            {score} correct out of {questions.length}
          </div>
          <div className="mt-4 w-full bg-slate-800 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setCurrent(0); setScore(0); setDone(false);
              setSelected(null); setShowResult(false);
              setQuestions(q => shuffle(q));
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold transition-colors"
          >
            🔄 Retry
          </button>
          <Link
            href={`/subjects/${subjectSlug}`}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((current) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <span>Question {current + 1} / {questions.length}</span>
        <span className="text-emerald-400 font-semibold">Score: {score}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4">
        <div className="text-xs font-mono text-slate-500 mb-3 uppercase">{q.type}</div>
        <p className="text-white text-lg font-medium leading-relaxed mb-6">{q.stem}</p>

        {/* MCQ Options */}
        {q.type === 'mcq' && (
          <div className="space-y-3">
            {optionKeys.map((key) => {
              let cls =
                'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ';
              if (!showResult) {
                cls += 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-700 text-slate-200 cursor-pointer';
              } else if (key === q.correct) {
                cls += 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
              } else if (key === selected && key !== q.correct) {
                cls += 'border-red-500 bg-red-500/20 text-red-300';
              } else {
                cls += 'border-slate-800 bg-slate-800/50 text-slate-500';
              }
              return (
                <button key={key} className={cls} onClick={() => handleSelect(key)}>
                  <span className="inline-block w-6 h-6 rounded-full border border-current mr-3 text-center text-xs leading-6">
                    {key.toUpperCase()}
                  </span>
                  {parsedOptions[key]}
                  {showResult && key === q.correct && <span className="ml-2">✓</span>}
                  {showResult && key === selected && key !== q.correct && <span className="ml-2">✗</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Short question answer display */}
        {q.type === 'short' && (
          <div>
            {!showResult ? (
              <button
                onClick={() => { setShowResult(true); setScore(s => s + 1); }}
                className="w-full py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
              >
                Jawab Dekhein 👁️
              </button>
            ) : (
              <div className="rounded-xl border border-emerald-700/50 bg-emerald-900/20 p-4 text-emerald-200 text-sm leading-relaxed">
                {q.correct}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanation & Urdu */}
      {showResult && (
        <div className="space-y-3 mb-4">
          {q.explanation && (
            <div className="rounded-xl border border-blue-700/50 bg-blue-900/20 p-4 text-blue-200 text-sm">
              <strong className="text-blue-400">💡 Explanation:</strong> {q.explanation}
            </div>
          )}
          {q.urdu_answer && (
            <div>
              <button
                onClick={() => setShowUrdu(u => !u)}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors underline"
              >
                {showUrdu ? 'اردو چھپائیں' : 'اردو میں دیکھیں 🇵🇰'}
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

      {/* Next Button */}
      {showResult && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg transition-colors"
        >
          {current + 1 >= questions.length ? '🏁 Finish' : 'Next →'}
        </button>
      )}
    </div>
  );
}
