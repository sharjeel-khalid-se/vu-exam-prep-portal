'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Check,
  X,
  RotateCcw,
  BookOpen,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Flag,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  User,
  PartyPopper,
  FileText,
  Clock,
} from 'lucide-react';
import MathText from '@/app/MathText';

/* ─── Interfaces ─────────────────────────────────────────── */
interface Question {
  id: number;
  type: 'mcq' | 'short' | 'long';
  stem: string;
  options: string | null;
  correct: string;
  explanation: string | null;
  urdu_answer?: string | null;
  marks?: number;
  time_minutes?: number;
}

interface ParsedOptions {
  [key: string]: string;
}

/* ─── Rich Text Editor for Subjective Questions ──────────── */
function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? '');
  };

  return (
    <div className="border border-slate-300 rounded-md overflow-hidden bg-white shadow-xs">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-100 border-b border-slate-200 px-2 py-1.5 text-xs text-slate-700">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('undo'); }}
          title="Undo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('redo'); }}
          title="Redo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}
          title="Bold (Ctrl+B)"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 font-bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
          title="Italic (Ctrl+I)"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('underline'); }}
          title="Underline (Ctrl+U)"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('strikeThrough'); }}
          title="Strikethrough"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft'); }}
          title="Align Left"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter'); }}
          title="Align Center"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('justifyRight'); }}
          title="Align Right"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}
          title="Bullet List"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }}
          title="Numbered List"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            if (editorRef.current) {
              editorRef.current.innerHTML = '';
            }
            onChange('');
          }}
          title="Clear text"
          className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded flex items-center gap-1 ml-auto text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? '')}
        className="min-h-[180px] p-4 text-sm text-slate-800 focus:outline-none leading-relaxed"
        style={{ fontFamily: 'Arial, sans-serif' }}
        data-placeholder={placeholder ?? 'Type your answer here using formatting tools above...'}
      />
    </div>
  );
}

/* ─── Circular SVG Timer (Overall Session Timer) ──────────── */
function CircularTimer({
  remainingSeconds,
  totalSeconds,
}: {
  remainingSeconds: number;
  totalSeconds: number;
}) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const safeTotal = Math.max(1, totalSeconds);
  const pct = Math.max(0, remainingSeconds / safeTotal);
  const dash = circ * pct;
  const color =
    remainingSeconds > safeTotal * 0.4
      ? '#22d3ee'
      : remainingSeconds > safeTotal * 0.15
      ? '#f59e0b'
      : '#ef4444';

  const minutes = Math.ceil(remainingSeconds / 60);
  const isCritical = remainingSeconds < 60;
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  const timeFormatted = `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <div
      className="relative w-12 h-12 flex items-center justify-center cursor-pointer group"
      title={`Overall Time Remaining: ${timeFormatted} (Total: ${Math.round(totalSeconds / 60)} Min)`}
    >
      <svg className="absolute inset-0 -rotate-90" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#1e293b" strokeWidth="4.5" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.5s' }}
        />
      </svg>
      <div className="z-10 flex flex-col items-center justify-center select-none text-center">
        <Clock className="w-3 h-3 text-slate-300 mb-0.5" />
        <span
          className={`font-black text-sm leading-tight text-white ${
            isCritical ? 'text-red-400 animate-pulse text-xs' : ''
          }`}
        >
          {isCritical ? `${remainingSeconds}s` : minutes}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Lecture Practice Component ────────────────────── */
export default function QuizClient({
  lectureId,
  subjectSlug,
  typeFilter,
  subjectCode,
  subjectName,
}: {
  lectureId: string;
  subjectSlug: string;
  typeFilter: string;
  subjectCode: string;
  subjectName: string;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // User answers
  // MCQ: staged (user selected) and saved (explicitly saved via Save button)
  const [stagedMcq, setStagedMcq] = useState<Record<number, string>>({});
  const [savedMcq,  setSavedMcq]  = useState<Record<number, string>>({});

  // Subjective: staged typed HTML text and saved typed HTML text
  const [stagedSubj, setStagedSubj] = useState<Record<number, string>>({});
  const [savedSubj,  setSavedSubj]  = useState<Record<number, string>>({});

  // Subjective: revealed model answer status
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  // Subjective: self-assessment (true = correct, false = incorrect)
  const [selfScore, setSelfScore] = useState<Record<number, boolean | null>>({});

  // Alerts
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Results review filter: 'all' | 'incorrect' | 'correct'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [hiddenExplanations, setHiddenExplanations] = useState<Set<number>>(new Set());

  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  // Overall session timer in seconds
  const [totalSessionSeconds, setTotalSessionSeconds] = useState(1800);
  const [remainingSeconds, setRemainingSeconds] = useState(1800);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const now = new Date();

  /* ── Load Questions ── */
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const typeParam = typeFilter === 'all' ? '' : `&type=${typeFilter}`;
    try {
      const res = await fetch(`/api/questions?lecture_id=${lectureId}${typeParam}`);
      const data = await res.json();
      const qs: Question[] = data.questions ?? [];
      setQuestions(qs);

      // Total session time: at least 15 min, or ~1.5 min per MCQ, 3 min per short, 5 min per long
      const computedSecs = qs.reduce((acc: number, item: Question) => {
        if (item.type === 'long') return acc + 300;
        if (item.type === 'short') return acc + 180;
        return acc + 90;
      }, 0);
      const sessionSecs = Math.max(900, Math.ceil(computedSecs / 60) * 60);
      setTotalSessionSeconds(sessionSecs);
      setRemainingSeconds(sessionSecs);
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
    setLoading(false);
  }, [lectureId, typeFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* ── Overall Session Countdown Timer ── */
  useEffect(() => {
    if (submitted || loading || questions.length === 0) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submitted, loading, questions.length]);

  const q = questions[current];
  const parsedOptions: ParsedOptions = q?.options ? JSON.parse(q.options) : {};
  const optionKeys = Object.keys(parsedOptions);

  /* ── Save Validation & Handlers ── */
  const isCurrentUnsaved = useCallback((): boolean => {
    if (!q) return false;
    if (q.type === 'mcq') {
      const staged = stagedMcq[current];
      const saved  = savedMcq[current];
      return staged !== undefined && staged !== saved;
    } else {
      const staged = (stagedSubj[current] ?? '').trim();
      const saved  = (savedSubj[current] ?? '').trim();
      const hasTyped = staged !== '' && staged !== '<p></p>' && staged !== '<br>';
      return hasTyped && staged !== saved;
    }
  }, [q, current, stagedMcq, savedMcq, stagedSubj, savedSubj]);

  const canNavigate = (): boolean => {
    if (isCurrentUnsaved()) {
      setSaveWarning('Please click "Save" to save your answer before proceeding to the next question!');
      return false;
    }
    setSaveWarning(null);
    return true;
  };

  const handleSave = () => {
    if (!q) return;
    if (q.type === 'mcq') {
      const staged = stagedMcq[current];
      if (staged !== undefined) {
        setSavedMcq(prev => ({ ...prev, [current]: staged }));
        setSaveWarning(null);
        setSaveNotification('Answer saved successfully!');
        setTimeout(() => setSaveNotification(null), 3000);
      }
    } else {
      const text = stagedSubj[current] ?? '';
      setSavedSubj(prev => ({ ...prev, [current]: text }));
      setSaveWarning(null);
      setSaveNotification('Answer saved successfully!');
      setTimeout(() => setSaveNotification(null), 3000);
    }
  };

  const handleNext = () => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    if (current < questions.length - 1) setCurrent(c => c + 1);
    else handleFinish();
  };

  const handlePrev = () => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    if (current > 0) setCurrent(c => c - 1);
  };

  const handleFirst = () => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    setCurrent(0);
  };

  const handleLast = () => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    setCurrent(questions.length - 1);
  };

  const handleSelectQuestion = (i: number) => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    setCurrent(i);
  };

  const handleRevealAnswer = () => {
    setRevealed((prev) => ({ ...prev, [current]: true }));
  };

  const handleSelfEvaluate = (knew: boolean) => {
    setSelfScore((prev) => ({ ...prev, [current]: knew }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (q) {
      if (q.type === 'mcq' && stagedMcq[current] !== undefined) {
        setSavedMcq(prev => ({ ...prev, [current]: stagedMcq[current] }));
      } else if (q.type !== 'mcq' && stagedSubj[current]) {
        setSavedSubj(prev => ({ ...prev, [current]: stagedSubj[current] }));
      }
    }
    setSubmitted(true);
  };

  /* ── Stats Calculation ── */
  const mcqCount = questions.filter((item) => item.type === 'mcq').length;
  const subjCount = questions.length - mcqCount;

  const attemptedCount = questions.reduce((acc, item, i) => {
    if (item.type === 'mcq') return acc + (i in savedMcq ? 1 : 0);
    return acc + (savedSubj[i] || revealed[i] ? 1 : 0);
  }, 0);

  const correctMcqs = questions.reduce((acc, item, i) => {
    if (item.type === 'mcq' && savedMcq[i] === item.correct) return acc + 1;
    return acc;
  }, 0);

  const correctSubjs = questions.reduce((acc, item, i) => {
    if (item.type !== 'mcq' && selfScore[i] === true) return acc + 1;
    return acc;
  }, 0);

  const totalScore =
    correctMcqs * 1 +
    questions.reduce((acc, item, i) => {
      if (item.type === 'short' && selfScore[i] === true) return acc + 3;
      if (item.type === 'long' && selfScore[i] === true) return acc + 5;
      return acc;
    }, 0);

  const maxPossibleScore = questions.reduce((acc, item) => {
    if (item.type === 'mcq') return acc + 1;
    if (item.type === 'short') return acc + 3;
    if (item.type === 'long') return acc + 5;
    return acc + 1;
  }, 0);

  const pct = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  /* ── Loading View ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-[#0f172a]">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-slate-300 font-medium">Loading Examination Questions...</p>
      </div>
    );
  }

  /* ── Empty State View ── */
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Questions Found</h2>
        <p className="text-slate-500 text-sm max-w-md mb-6">
          There are currently no questions configured for this question type in Lecture {lectureId}.
        </p>
        <Link
          href={`/subjects/${subjectSlug}`}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-sm transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Course Portal</span>
        </Link>
      </div>
    );
  }

  /* ── Results Summary View ── */
  if (submitted) {
    const isQuestionCorrect = (idx: number) => {
      const item = questions[idx];
      if (item.type === 'mcq') return savedMcq[idx] === item.correct;
      return selfScore[idx] === true;
    };

    const totalIncorrect = questions.filter((_, idx) => !isQuestionCorrect(idx)).length;
    const totalCorrect = questions.filter((_, idx) => isQuestionCorrect(idx)).length;

    // Helper to derive clean topic per question
    const getTopic = (stem: string) => {
      const s = stem.toLowerCase();
      if (s.includes('scale') || s.includes('nominal') || s.includes('ordinal') || s.includes('interval') || s.includes('ratio') || s.includes('zero point')) {
        return 'Measurement scales';
      }
      if (s.includes('variable') || s.includes('continuous') || s.includes('discrete') || s.includes('qualitative') || s.includes('quantitative') || s.includes('zip-code') || s.includes('height')) {
        return 'Variables and data types';
      }
      if (s.includes('error') || s.includes('bias') || s.includes('mistake') || s.includes('rounding')) {
        return 'Types of errors';
      }
      if (s.includes('bar chart') || s.includes('pie chart') || s.includes('histogram') || s.includes('polygon') || s.includes('ogive') || s.includes('historigram') || s.includes('stem and leaf') || s.includes('stem-and-leaf') || s.includes('diagram') || s.includes('sector')) {
        return 'Graphical representation of data';
      }
      if (s.includes('mean') || s.includes('median') || s.includes('mode') || s.includes('average') || s.includes('central tendency')) {
        return 'Measures of central tendency';
      }
      if (s.includes('sample') || s.includes('population') || s.includes('sampling frame') || s.includes('census')) {
        return 'Sampling and population';
      }
      if (s.includes('plural') || s.includes('singular') || s.includes('definition of statistics') || s.includes('branch') || s.includes('descriptive') || s.includes('inferential')) {
        return 'Basics and branches of statistics';
      }
      if (s.includes('requirement') || s.includes('srs') || s.includes('specification') || s.includes('functional')) {
        return 'Requirement engineering';
      }
      if (s.includes('stakeholder') || s.includes('user') || s.includes('client')) {
        return 'Stakeholders & user roles';
      }
      if (s.includes('dbms') || s.includes('database') || s.includes('ansi') || s.includes('schema') || s.includes('sparc')) {
        return 'Database architecture & models';
      }
      if (s.includes('time value') || s.includes('compounding') || s.includes('discounting') || s.includes('present value') || s.includes('future value') || s.includes('apr') || s.includes('ear')) {
        return 'Time value of money';
      }
      if (s.includes('truth table') || s.includes('conjunction') || s.includes('disjunction') || s.includes('tautology') || s.includes('contradiction') || s.includes('de morgan') || s.includes('conditional')) {
        return 'Propositional logic & truth tables';
      }
      return 'Core lecture concepts';
    };

    // Calculate topics breakdown
    const topicMap: Record<string, { total: number; correct: number; missed: number }> = {};
    questions.forEach((q, idx) => {
      const t = getTopic(q.stem);
      if (!topicMap[t]) topicMap[t] = { total: 0, correct: 0, missed: 0 };
      topicMap[t].total += 1;
      if (isQuestionCorrect(idx)) {
        topicMap[t].correct += 1;
      } else {
        topicMap[t].missed += 1;
      }
    });

    const topicEntries = Object.entries(topicMap).map(([name, stats]) => ({
      name,
      ...stats,
    })).sort((a, b) => b.missed - a.missed || b.total - a.total);

    const topMissed = topicEntries.find(t => t.missed > 0);

    const filteredQuestions = questions
      .map((item, idx) => ({ item, idx, topic: getTopic(item.stem) }))
      .filter(({ idx, topic }) => {
        if (selectedTopic && topic !== selectedTopic) return false;
        if (reviewFilter === 'incorrect') return !isQuestionCorrect(idx);
        if (reviewFilter === 'correct') return isQuestionCorrect(idx);
        return true;
      });

    // Duo-Tone Circular Progress Ring Calculations
    const r = 44;
    const circ = 2 * Math.PI * r;
    const totalQCount = Math.max(1, questions.length);
    const correctRatio = totalCorrect / totalQCount;
    const missedRatio = totalIncorrect / totalQCount;
    const blueDash = circ * correctRatio;
    const orangeDash = circ * missedRatio;

    const toggleExplanation = (idx: number) => {
      setHiddenExplanations(prev => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
    };

    const resetQuiz = () => {
      setCurrent(0);
      setStagedMcq({});
      setSavedMcq({});
      setStagedSubj({});
      setSavedSubj({});
      setRevealed({});
      setSelfScore({});
      setFlagged(new Set());
      setSaveWarning(null);
      setSaveNotification(null);
      setReviewFilter('all');
      setSelectedTopic(null);
      setSubmitted(false);
      fetchQuestions();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToQuestions = () => {
      setReviewFilter('incorrect');
      document.getElementById('review-questions')?.scrollIntoView({ behavior: 'smooth' });
    };

    const feedbackText = pct >= 80
      ? 'Outstanding performance! You have a solid grasp of this lecture.'
      : pct >= 50
      ? 'Good effort! Solid foundation, but reviewing the missed questions will push you to an A grade.'
      : 'Keep practicing! Reviewing these missed questions will help you prepare for exams.';

    return (
      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Top Bar / Navigation Header */}
          <div className="flex items-center justify-between pb-1 text-xs">
            <Link
              href={`/subjects/${subjectSlug}`}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course Lectures</span>
            </Link>
            <div className="font-semibold text-slate-500 uppercase tracking-wide text-xs">
              {subjectCode} · {subjectName}
            </div>
          </div>

          {/* Main Results Hero Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              
              {/* Circular Duo-Tone Gauge */}
              <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 112 112">
                  <circle
                    cx="56"
                    cy="56"
                    r={r}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="9"
                  />
                  {/* Blue arc for correct answers */}
                  <circle
                    cx="56"
                    cy="56"
                    r={r}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="9"
                    strokeDasharray={`${blueDash} ${circ}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                  {/* Orange arc for missed answers */}
                  {orangeDash > 0 && (
                    <circle
                      cx="56"
                      cy="56"
                      r={r}
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="9"
                      strokeDasharray={`${orangeDash} ${circ}`}
                      strokeDashoffset={-blueDash}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.8s ease' }}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {pct}%
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1">
                    {totalScore} / {maxPossibleScore} marks
                  </div>
                </div>
              </div>

              {/* Title & Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs font-semibold text-blue-600 flex items-center justify-center sm:justify-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Practice session completed</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                  Lecture {lectureId} Practice Results
                </h1>
                <p className="text-slate-600 text-sm leading-relaxed mt-2 max-w-xl">
                  {feedbackText}
                </p>

                {/* Actions row */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap mt-5">
                  {totalIncorrect > 0 && (
                    <button
                      type="button"
                      onClick={scrollToQuestions}
                      className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <span>Review {totalIncorrect} missed questions</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake practice</span>
                  </button>
                  <Link
                    href={`/subjects/${subjectSlug}`}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all text-center"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Course portal</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Metrics 3-column row */}
            <div className="border-t border-slate-100 mt-6 pt-5 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5">Attempted</div>
                <div className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {attemptedCount} / {questions.length}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-blue-600 inline-block" />
                  <span>Correct MCQs</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {correctMcqs} / {mcqCount}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium mb-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#ea580c] inline-block" />
                  <span>Needs review</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {totalIncorrect} questions
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Where you lost marks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Where you lost marks</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Questions grouped by topic. Select a topic to filter the review below.
              </p>
            </div>

            {/* Alert banner */}
            {totalIncorrect > 0 && topMissed && (
              <div className="bg-[#ffedd5] border border-[#fed7aa] text-[#9a3412] px-4 py-2.5 rounded-xl text-xs font-medium">
                {topMissed.missed} of your {totalIncorrect} misses are in {topMissed.name}. Start there.
              </div>
            )}
            {totalIncorrect === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-medium">
                Excellent! You mastered all topics in this practice session.
              </div>
            )}

            {/* Topic Bars */}
            <div className="space-y-3 pt-1">
              {topicEntries.map((topic) => {
                const isSelected = selectedTopic === topic.name;
                return (
                  <div
                    key={topic.name}
                    onClick={() => setSelectedTopic(isSelected ? null : topic.name)}
                    className={`p-2 -mx-2 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 ring-1 ring-blue-300' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {topic.name}
                        {isSelected && <span className="text-[10px] text-blue-600 font-bold">(Filtered)</span>}
                      </span>
                      <span className="font-medium text-slate-500">
                        {topic.correct} / {topic.total} correct ·{' '}
                        {topic.missed === 0 ? 'none missed' : `${topic.missed} missed`}
                      </span>
                    </div>
                    {/* Two-tone Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full flex overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all"
                        style={{ width: `${(topic.correct / topic.total) * 100}%` }}
                      />
                      <div
                        className="bg-[#ea580c] h-full transition-all"
                        style={{ width: `${(topic.missed / topic.total) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Question-by-question review */}
          <div id="review-questions" className="space-y-4 pt-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Question-by-question review</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your submitted answers alongside verified correct past-paper solutions and explanations.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => { setReviewFilter('all'); setSelectedTopic(null); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'all' && !selectedTopic
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All {questions.length}
              </button>
              <button
                type="button"
                onClick={() => { setReviewFilter('incorrect'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'incorrect' && !selectedTopic
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Needs review {totalIncorrect}
              </button>
              <button
                type="button"
                onClick={() => { setReviewFilter('correct'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'correct' && !selectedTopic
                    ? 'bg-[#0f172a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Correct {totalCorrect}
              </button>

              {selectedTopic && (
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Topic: {selectedTopic}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Showing Count */}
            <div className="text-xs font-medium text-slate-500">
              Showing {filteredQuestions.length} questions
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2 text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No questions match this filter</h3>
                  <button
                    type="button"
                    onClick={() => { setReviewFilter('all'); setSelectedTopic(null); }}
                    className="mt-3 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredQuestions.map(({ item, idx }) => {
                  const isMcq = item.type === 'mcq';
                  const opts: ParsedOptions = item.options ? JSON.parse(item.options) : {};
                  const userAns = isMcq ? savedMcq[idx] : null;
                  const isCorrect = isQuestionCorrect(idx);
                  const isExplanationHidden = hiddenExplanations.has(idx);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
                    >
                      {/* Top Meta Row */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#0f172a] text-white font-extrabold text-xs px-2.5 py-0.5 rounded">
                            Q{idx + 1}
                          </span>
                          {isCorrect ? (
                            <span className="text-blue-600 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Correct</span>
                            </span>
                          ) : (
                            <span className="text-[#ea580c] font-semibold flex items-center gap-1">
                              <X className="w-3.5 h-3.5" />
                              <span>Needs review</span>
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 font-normal">
                          {isMcq ? 'Multiple choice · 1 mark' : item.type === 'short' ? 'Short question · 3 marks' : 'Long question · 5 marks'}
                        </div>
                      </div>

                      {/* Question Stem */}
                      <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                        <MathText text={item.stem} />
                      </div>

                      {/* Options (MCQ) */}
                      {isMcq ? (
                        <div className="space-y-2">
                          {Object.entries(opts).map(([key, label]) => {
                            const isUserSelected = userAns?.toLowerCase() === key.toLowerCase();
                            const isCorrectOption = item.correct.toLowerCase() === key.toLowerCase();

                            let cardClasses = 'border-slate-200 bg-white text-slate-700';
                            let circleClasses = 'border border-slate-300 text-slate-600';
                            let badge = null;

                            if (isCorrectOption) {
                              cardClasses = 'border-blue-500 bg-[#eff6ff] text-slate-900 font-medium';
                              circleClasses = 'bg-blue-600 text-white font-bold';
                              badge = (
                                <span className="text-xs font-semibold text-blue-700 ml-auto flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Correct answer</span>
                                </span>
                              );
                            } else if (isUserSelected) {
                              cardClasses = 'border-[#fdba74] bg-[#fff7ed] text-slate-900 font-medium';
                              circleClasses = 'bg-[#ea580c] text-white font-bold';
                              badge = (
                                <span className="text-xs font-semibold text-[#ea580c] ml-auto flex items-center gap-1">
                                  <X className="w-3.5 h-3.5" />
                                  <span>Your answer</span>
                                </span>
                              );
                            }

                            return (
                              <div
                                key={key}
                                className={`rounded-xl p-3 flex items-center gap-3 border text-sm transition-all ${cardClasses}`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 uppercase ${circleClasses}`}
                                >
                                  {key}
                                </span>
                                <span className="flex-1"><MathText text={label} /></span>
                                {badge}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Subjective Question Review */
                        <div className="space-y-3">
                          {savedSubj[idx] && (
                            <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-200">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Your Submitted Response:
                              </div>
                              <div
                                className="text-sm text-slate-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: savedSubj[idx] }}
                              />
                            </div>
                          )}

                          <div className="bg-[#eff6ff] rounded-xl p-4 border border-blue-200">
                            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                              <span>Model Answer:</span>
                            </div>
                            <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                              <MathText text={item.correct} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Explanation toggle & content */}
                      {item.explanation && (
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleExplanation(idx)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 pt-1"
                          >
                            {isExplanationHidden ? (
                              <ChevronRight className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                            <span>{isExplanationHidden ? 'Show explanation' : 'Hide explanation'}</span>
                          </button>

                          {!isExplanationHidden && (
                            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 mt-2">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                CONCEPT / PAST PAPER REFERENCE
                              </div>
                              <div className="text-xs text-slate-700 leading-relaxed font-sans">
                                <MathText text={item.explanation} />
                              </div>
                              {item.urdu_answer && (
                                <div className="bg-amber-50/70 border border-amber-200/70 rounded-lg p-2.5 text-xs text-amber-900 text-right mt-2.5 font-serif leading-relaxed" dir="rtl">
                                  {item.urdu_answer}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Done Reviewing Card */}
            <div className="bg-[#0f172a] text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 shadow-md">
              <div className="text-sm font-bold text-white text-center sm:text-left">
                Done reviewing? Try the full practice again.
              </div>
              <div className="flex items-center gap-2.5 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake full practice</span>
                </button>
                <Link
                  href={`/subjects/${subjectSlug}`}
                  className="border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all text-center flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Course Lectures</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     DARK VU EXAM PORTAL INTERFACE (MATCHING SCREENSHOT)
  ══════════════════════════════════════════════════════════ */
  const qMarks = q.marks ?? (q.type === 'mcq' ? 1 : q.type === 'short' ? 3 : 5);
  const qTime = q.time_minutes ?? (q.type === 'mcq' ? 1 : q.type === 'short' ? 3 : 4);
  const isSubjective = q.type === 'short' || q.type === 'long';
  const hasRevealed = !!revealed[current];
  const currentSelfScore = selfScore[current];

  // Calculate circular timer stroke for the teal ring in header
  const rCircle = 18;
  const circCircle = 2 * Math.PI * rCircle;
  const timeFraction = totalSessionSeconds > 0 ? remainingSeconds / totalSessionSeconds : 0;
  const strokeDash = circCircle * timeFraction;
  const minsRemaining = Math.floor(remainingSeconds / 60);
  const secsRemaining = remainingSeconds % 60;
  const timeStr = `${minsRemaining}:${secsRemaining.toString().padStart(2, '0')}`;

  return (
    <div className="h-screen w-screen bg-[#0f172a] flex flex-col select-none overflow-hidden">
      {/* ── 1. TOP HEADER ── */}
      <header className="bg-[#1a1a2e] text-white px-4 py-2 flex items-center justify-between border-b border-slate-700 shrink-0">
        <div>
          <div className="text-xs text-slate-400 font-medium">{subjectCode} · {subjectName}</div>
          <div className="text-sm font-bold text-white">Lecture {lectureId}</div>
        </div>

        {/* Circular Timer Ring in Center */}
        <div className="flex items-center justify-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r={rCircle} fill="none" stroke="#1e293b" strokeWidth="4" />
              <circle
                cx="24"
                cy="24"
                r={rCircle}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="4"
                strokeDasharray={`${strokeDash} ${circCircle}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s linear' }}
              />
            </svg>
            <span className="text-xs font-mono font-bold text-white z-10">{timeStr}</span>
          </div>
        </div>

        {/* User Info (Right) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-white">GUEST GUEST</div>
            <div className="text-[11px] text-slate-400">
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-600 border-2 border-slate-500 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </header>

      {/* ── 2. PURPLE QUESTION INFO BAR ── */}
      <div className="bg-[#6d28d9] px-4 py-2 flex items-center justify-between shrink-0">
        <span className="text-white font-semibold text-sm">
          Question No: {current + 1} of {questions.length}
          <span className="ml-2 text-xs bg-purple-900/60 px-2 py-0.5 rounded uppercase">{q.type}</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-white text-sm">Marks: {qMarks} (Time {qTime} Min)</span>
          <button
            onClick={toggleFlag}
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              flagged.has(current) ? 'bg-yellow-400 text-black' : 'bg-yellow-500/40 text-yellow-200 hover:bg-yellow-400 hover:text-black'
            }`}
          >!</button>
        </div>
      </div>

      {/* ── 3. BODY (LEFT QUESTION + RIGHT SIDEBAR) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Question + Answer area */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* Question Stem */}
          <div className="p-4 sm:p-5 bg-white text-gray-900 max-h-[42vh] min-h-[140px] overflow-y-auto border-b-2 border-purple-200 shrink-0">
            <div className="text-sm leading-relaxed font-medium"><MathText text={q.stem} as="div" /></div>
          </div>

          {/* Answer Banner */}
          <div className="bg-[#6d28d9] px-4 py-1.5 shrink-0 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Answer</span>
            {isSubjective && (
              <button
                type="button"
                onClick={() => {
                  setStagedSubj((prev) => ({ ...prev, [current]: '' }));
                  setSavedSubj((prev) => ({ ...prev, [current]: '' }));
                }}
                className="text-xs text-purple-200 hover:text-white flex items-center gap-1 font-medium transition-colors"
                title="Clear answer text"
              >
                <RotateCcw className="w-3 h-3" /> Clear Answer
              </button>
            )}
          </div>

          {/* MCQ Options */}
          {!isSubjective && (
            <div className="bg-white divide-y divide-gray-200 flex-1">
              {optionKeys.map((key, optIdx) => {
                const currentVal = stagedMcq[current] ?? savedMcq[current];
                const isSelected = currentVal === key;
                const letter = String.fromCharCode(65 + optIdx);
                return (
                  <label
                    key={key}
                    onClick={() => {
                      setStagedMcq((prev) => ({ ...prev, [current]: key }));
                      setSaveWarning(null);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-50' : 'hover:bg-purple-50'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-400 bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-gray-800 text-sm flex-1 min-h-[2.5rem] flex items-center">
                      <span className="font-semibold text-gray-500 mr-2">{letter}.</span>
                      <MathText text={parsedOptions[key]} />
                    </span>
                  </label>
                );
              })}
              {saveWarning && (
                <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
                  <span>{saveWarning}</span>
                  <button onClick={handleSave} className="px-2 py-1 bg-amber-600 text-white rounded text-xs font-bold">Save</button>
                </div>
              )}
              {saveNotification && (
                <div className="p-2 bg-emerald-50 border-t border-emerald-200 text-emerald-800 text-xs font-semibold">{saveNotification}</div>
              )}
            </div>
          )}

          {/* Subjective Area */}
          {isSubjective && (
            <div className="bg-white flex-1 p-4">
              <div className="text-xs text-gray-500 font-medium mb-2">
                {q.type === 'short' ? '3 Marks Question' : '5 Marks Question'} — Write your answer:
              </div>
              <RichTextEditor
                key={`editor-${current}`}
                value={stagedSubj[current] ?? savedSubj[current] ?? ''}
                onChange={(val) => {
                  setStagedSubj((prev) => ({ ...prev, [current]: val }));
                  setSaveWarning(null);
                }}
                placeholder="Type your answer here..."
              />

              {!hasRevealed ? (
                <button
                  onClick={handleRevealAnswer}
                  className="mt-3 w-full py-2.5 rounded-lg border-2 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Reveal Model Answer</span>
                </button>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-emerald-900 text-sm leading-relaxed">
                    <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>Model Answer:</span>
                    </div>
                    <div className="whitespace-pre-line"><MathText text={q.correct} /></div>
                  </div>
                  {q.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-xs">
                      <strong>Key Concept:</strong> <MathText text={q.explanation} />
                    </div>
                  )}
                  {currentSelfScore === undefined || currentSelfScore === null ? (
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-gray-700 font-semibold text-sm mb-2">Did your answer match?</p>
                      <div className="flex gap-3">
                        <button onClick={() => handleSelfEvaluate(true)}
                          className="flex-1 py-2 rounded-lg bg-emerald-100 border-2 border-emerald-400 text-emerald-800 font-bold text-sm hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" />
                          <span>Correct ({qMarks} Marks)</span>
                        </button>
                        <button onClick={() => handleSelfEvaluate(false)}
                          className="flex-1 py-2 rounded-lg bg-red-100 border-2 border-red-400 text-red-800 font-bold text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1">
                          <X className="w-4 h-4" />
                          <span>Review (0 Marks)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-lg p-3 text-sm font-semibold text-center flex items-center justify-center gap-1.5 ${
                      currentSelfScore ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {currentSelfScore ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{qMarks} Marks Awarded</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          <span>0 Marks — Review recommended</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {saveWarning && (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-xs font-semibold flex items-center justify-between">
                  <span>{saveWarning}</span>
                  <button onClick={handleSave} className="px-2 py-1 bg-amber-600 text-white rounded text-xs font-bold">Save</button>
                </div>
              )}
              {saveNotification && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs font-semibold">{saveNotification}</div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-48 bg-[#1e1b4b] border-l border-purple-900 flex flex-col text-xs shrink-0">
          <div className="bg-[#4c1d95] px-3 py-2 text-white font-semibold shrink-0">Summary</div>

          <div className="overflow-y-auto flex-1 p-2">
            <div className="grid grid-cols-3 gap-1.5">
              {questions.map((item, i) => {
                const isCur = i === current;
                const isFlag = flagged.has(i);
                const isSaved = item.type === 'mcq' ? i in savedMcq : !!savedSubj[i] || revealed[i];
                const isStaged = item.type === 'mcq'
                  ? (i in stagedMcq && !(i in savedMcq))
                  : (i in stagedSubj && !revealed[i]);

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectQuestion(i)}
                    className={`rounded-full w-full aspect-square font-bold transition-all border-2 text-[11px] ${
                      isCur
                        ? 'bg-teal-500 border-teal-400 text-white scale-110'
                        : isFlag
                        ? 'bg-yellow-500 border-yellow-400 text-black'
                        : isSaved
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : isStaged
                        ? 'bg-amber-500 border-amber-400 text-black animate-pulse'
                        : 'bg-[#312e81] border-purple-600 text-purple-200 hover:bg-purple-700'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="bg-[#17133f] border-t border-purple-800 p-3 space-y-1.5 shrink-0">
            <div className="text-xl font-extrabold text-white">
              {questions.length ? Math.round((attemptedCount / questions.length) * 100) : 0}%
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Attempted</span>
              <span className="text-cyan-400 font-bold">{attemptedCount}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Flagged</span>
              <span className="text-yellow-400 font-bold">{flagged.size}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total</span>
              <span className="text-white font-bold">{questions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM ACTION BAR ── */}
      <footer className="bg-[#1a1a2e] border-t border-slate-700 h-14 flex items-center px-4 gap-2 shrink-0">
        <button
          onClick={handleFinish}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Finish Session</span>
        </button>

        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={toggleFlag}
            className={`px-3 py-2 rounded font-bold text-xs transition-colors flex items-center gap-1 ${
              flagged.has(current) ? 'bg-yellow-400 text-black' : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Flag</span>
          </button>
          <button onClick={handleFirst} className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-bold text-xs flex items-center gap-1">
            <ChevronsLeft className="w-3.5 h-3.5" />
            <span>First</span>
          </button>
          <button onClick={handlePrev} disabled={current === 0}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded font-bold text-xs">
            Previous
          </button>
          <button onClick={handleNext}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs flex items-center gap-1">
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleLast} className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-bold text-xs flex items-center gap-1">
            <span>Last</span>
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="ml-auto">
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded font-bold text-xs transition-all flex items-center gap-1.5 ${
              isCurrentUnsaved()
                ? 'bg-amber-500 text-black animate-pulse'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isCurrentUnsaved() ? 'Save *' : 'Save'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

