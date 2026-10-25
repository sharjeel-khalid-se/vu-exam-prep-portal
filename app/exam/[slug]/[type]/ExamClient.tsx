'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Trophy, ThumbsUp, BookOpen, FileText, RotateCcw,
  Flag, ChevronsLeft, ChevronsRight, ArrowLeft, ArrowRight,
  Save, Check, X, Lightbulb, User, GraduationCap, ClipboardList,
  AlertTriangle, CheckCircle2, Undo, Redo, Clock,
} from 'lucide-react';
import MathText from '@/app/MathText';

/* ─── Types ──────────────────────────────────────────────── */
interface MCQ {
  id: number; stem: string; options: string; correct: string;
  explanation: string | null; urdu_answer: string | null;
  marks: number; time_minutes: number;
}
interface SubjQ {
  id: number; type: string; stem: string; correct: string;
  explanation: string | null; urdu_answer: string | null;
  marks: number; time_minutes: number;
}
interface ExamConfig {
  mcqTotal: number; mcqCount: number;
  shortTotal: number; shortCount: number;
  longTotal: number; longCount: number;
  duration: number; totalMarks: number; label: string;
}
type Section = 'mcq' | 'short' | 'long';

/* ─── Rich Text Toolbar ───────────────────────────────────── */
function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
    <div className="border border-gray-300 rounded">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 bg-gray-100 border-b border-gray-300 p-1">
        {[
          { icon: <Undo className="w-3.5 h-3.5" />, cmd: 'undo', title: 'Undo' },
          { icon: <Redo className="w-3.5 h-3.5" />, cmd: 'redo', title: 'Redo' },
        ].map(b => (
          <button key={b.cmd} onMouseDown={e => { e.preventDefault(); exec(b.cmd); }}
            title={b.title} className="p-1.5 hover:bg-gray-200 rounded text-slate-700 flex items-center justify-center">{b.icon}</button>
        ))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {[
          { icon: <strong>B</strong>, cmd: 'bold', title: 'Bold' },
          { icon: <em>I</em>, cmd: 'italic', title: 'Italic' },
          { icon: <u>U</u>, cmd: 'underline', title: 'Underline' },
          { icon: <s>S</s>, cmd: 'strikeThrough', title: 'Strikethrough' },
        ].map((b, i) => (
          <button key={i} onMouseDown={e => { e.preventDefault(); exec(b.cmd); }}
            title={b.title} className="px-2 py-1 text-sm hover:bg-gray-200 rounded">{b.icon}</button>
        ))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {[
          { icon: '≡', cmd: 'justifyLeft', title: 'Align Left' },
          { icon: '≡', cmd: 'justifyCenter', title: 'Center' },
          { icon: '≡', cmd: 'justifyRight', title: 'Align Right' },
          { icon: '≡', cmd: 'justifyFull', title: 'Justify' },
        ].map((b, i) => (
          <button key={i} onMouseDown={e => { e.preventDefault(); exec(b.cmd); }}
            title={b.title} className="px-2 py-1 text-xs hover:bg-gray-200 rounded">{b.icon}</button>
        ))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {[
          { icon: '• ', cmd: 'insertUnorderedList', title: 'Bullet List' },
          { icon: '1.', cmd: 'insertOrderedList', title: 'Numbered List' },
        ].map((b, i) => (
          <button key={i} onMouseDown={e => { e.preventDefault(); exec(b.cmd); }}
            title={b.title} className="px-2 py-1 text-xs hover:bg-gray-200 rounded">{b.icon}</button>
        ))}
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault();
            if (editorRef.current) {
              editorRef.current.innerHTML = '';
            }
            onChange('');
          }}
          title="Clear content"
          className="p-1 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded flex items-center gap-1 ml-auto text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? '')}
        className="min-h-[160px] p-3 text-sm text-gray-800 focus:outline-none"
        style={{ fontFamily: 'sans-serif', lineHeight: '1.6' }}
      />
    </div>
  );
}

/* ─── Circular Timer (Overall Paper Timer) ─────────────────── */
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
      title={`Overall Paper Time Remaining: ${timeFormatted} (Total: ${Math.round(totalSeconds / 60)} Min)`}
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

/* ─── Main Component ─────────────────────────────────────── */
export default function ExamClient({
  slug, examType, subjectCode, subjectName,
}: {
  slug: string; examType: string; subjectCode: string; subjectName: string;
}) {
  const [loading,  setLoading]  = useState(true);
  const [mcqs,     setMcqs]     = useState<MCQ[]>([]);
  const [shorts,   setShorts]   = useState<SubjQ[]>([]);
  const [longs,    setLongs]    = useState<SubjQ[]>([]);
  const [config,   setConfig]   = useState<ExamConfig | null>(null);

  const [section,      setSection]      = useState<Section>('mcq');
  const [currentMcq,  setCurrentMcq]   = useState(0);
  const [currentSubj, setCurrentSubj]  = useState(0);

  // MCQ: staged (user selected) and saved (explicitly saved via Save button)
  const [stagedMcq, setStagedMcq] = useState<Record<number, string>>({});
  const [savedMcq,  setSavedMcq]  = useState<Record<number, string>>({});

  // Subjective: staged typed answer text and saved typed answer text
  const [stagedSubj, setStagedSubj] = useState<Record<string, string>>({});
  const [savedSubj,  setSavedSubj]  = useState<Record<string, string>>({});

  // Subjective: revealed model answer + self-score
  const [subjRevealed, setSubjRevealed] = useState<Record<string, boolean>>({});
  const [subjKnew,     setSubjKnew]     = useState<Record<string, boolean | null>>({});

  // User notification & warning alerts
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Results review filter: 'all' | 'incorrect' | 'correct'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [reviewSectionTab, setReviewSectionTab] = useState<'all' | 'mcq' | 'short' | 'long'>('all');

  const [flagged,   setFlagged]   = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  // Overall paper timer in seconds (60 min = 3600s, 90 min = 5400s)
  const [totalPaperSeconds, setTotalPaperSeconds] = useState(3600);
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Syllabus out-of-range message (e.g. finalterm with no Lecture 21+ data yet)
  const [emptyReason, setEmptyReason] = useState<string | null>(null);
  // Syllabus label from API config
  const [syllabusLabel, setSyllabusLabel] = useState<string>('');

  const now = new Date();

  /* ── Fetch exam data ── */
  const fetchExam = useCallback(async () => {
    setLoading(true);
    setEmptyReason(null);
    try {
      const res  = await fetch(`/api/exam/${slug}?type=${examType}`, { cache: 'no-store' });
      const data = await res.json();
      setMcqs(data.mcqs   ?? []);
      setShorts(data.shorts ?? []);
      setLongs(data.longs  ?? []);
      setConfig(data.config ?? null);
      setSyllabusLabel(data.config?.syllabus ?? '');
      if (data.emptyReason) setEmptyReason(data.emptyReason);

      const paperSecs = (data.config?.duration ?? 60) * 60;
      setTotalPaperSeconds(paperSecs);
      setRemainingSeconds(paperSecs);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [slug, examType]);

  useEffect(() => { fetchExam(); }, [fetchExam]);

  /* ── Overall paper countdown ── */
  useEffect(() => {
    if (submitted || loading) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submitted, loading]);

  const finishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Commit currently active staged answer if present
    setSavedMcq(prev => ({
      ...prev,
      ...(stagedMcq[currentMcq] !== undefined ? { [currentMcq]: stagedMcq[currentMcq] } : {})
    }));
    const subjKey = `${section}-${currentSubj}`;
    if (section !== 'mcq' && stagedSubj[subjKey]) {
      setSavedSubj(prev => ({ ...prev, [subjKey]: stagedSubj[subjKey] }));
    }
    setSubmitted(true);
  };

  /* ── Current key helpers ── */
  const currentKey = section === 'mcq'
    ? `mcq-${currentMcq}`
    : `${section}-${currentSubj}`;

  /* ── Unsaved Status & Save Validation ── */
  const isCurrentUnsaved = useCallback((): boolean => {
    if (section === 'mcq') {
      const staged = stagedMcq[currentMcq];
      const saved  = savedMcq[currentMcq];
      return staged !== undefined && staged !== saved;
    } else {
      const subjKey = `${section}-${currentSubj}`;
      const staged = (stagedSubj[subjKey] ?? '').trim();
      const saved  = (savedSubj[subjKey] ?? '').trim();
      const hasTyped = staged !== '' && staged !== '<p></p>' && staged !== '<br>';
      return hasTyped && staged !== saved;
    }
  }, [section, currentMcq, currentSubj, stagedMcq, savedMcq, stagedSubj, savedSubj]);

  const canNavigate = (): boolean => {
    if (isCurrentUnsaved()) {
      setSaveWarning('Please click "Save" to save your answer before proceeding to the next question!');
      return false;
    }
    setSaveWarning(null);
    return true;
  };

  const handleSave = () => {
    if (section === 'mcq') {
      const staged = stagedMcq[currentMcq];
      if (staged !== undefined) {
        setSavedMcq(prev => ({ ...prev, [currentMcq]: staged }));
        setSaveWarning(null);
        setSaveNotification('Answer saved successfully!');
        setTimeout(() => setSaveNotification(null), 3000);
      }
    } else {
      const subjKey = `${section}-${currentSubj}`;
      const text = stagedSubj[subjKey] ?? '';
      setSavedSubj(prev => ({ ...prev, [subjKey]: text }));
      setSaveWarning(null);
      setSaveNotification('Answer saved successfully!');
      setTimeout(() => setSaveNotification(null), 3000);
    }
  };

  /* ── Navigation Handlers (Guarded by canNavigate) ── */
  const goNext = () => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    if (section === 'mcq') {
      if (currentMcq < mcqs.length - 1) setCurrentMcq(c => c + 1);
      else if (shorts.length) { setSection('short'); setCurrentSubj(0); }
      else if (longs.length)  { setSection('long');  setCurrentSubj(0); }
    } else {
      const list = section === 'short' ? shorts : longs;
      if (currentSubj < list.length - 1) setCurrentSubj(c => c + 1);
      else if (section === 'short' && longs.length) { setSection('long'); setCurrentSubj(0); }
    }
  };

  const goPrev = () => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    if (section === 'mcq') {
      if (currentMcq > 0) setCurrentMcq(c => c - 1);
    } else if (section === 'short') {
      if (currentSubj > 0) setCurrentSubj(c => c - 1);
      else { setSection('mcq'); setCurrentMcq(mcqs.length - 1); }
    } else {
      if (currentSubj > 0) setCurrentSubj(c => c - 1);
      else if (shorts.length) { setSection('short'); setCurrentSubj(shorts.length - 1); }
      else { setSection('mcq'); setCurrentMcq(mcqs.length - 1); }
    }
  };

  const handleFirst = () => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    setSection('mcq');
    setCurrentMcq(0);
  };

  const handleLast = () => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    if (longs.length) { setSection('long'); setCurrentSubj(longs.length - 1); }
    else if (shorts.length) { setSection('short'); setCurrentSubj(shorts.length - 1); }
    else { setSection('mcq'); setCurrentMcq(mcqs.length - 1); }
  };

  const handleSelectSidebarQuestion = (sec: Section, index: number) => {
    if (!canNavigate()) return;
    setSaveWarning(null);
    setSection(sec);
    if (sec === 'mcq') setCurrentMcq(index);
    else setCurrentSubj(index);
  };

  /* ── Results ── */
  const calcResults = () => {
    if (!config) return { mcqMarks: 0, shortMarks: 0, longMarks: 0, total: 0, mcqCorrect: 0, shortKnew: 0, longKnew: 0 };
    const mcqCorrect  = mcqs.filter((q, i) => savedMcq[i] === q.correct).length;
    const mcqMarks    = Math.min(mcqCorrect, config.mcqCount);
    const shortKnew   = shorts.filter((_, i) => subjKnew[`short-${i}`] === true).length;
    const shortMarks  = Math.min(shortKnew, config.shortCount) * 3;
    const longKnew    = longs.filter((_, i) => subjKnew[`long-${i}`] === true).length;
    const longMarks   = Math.min(longKnew, config.longCount) * 5;
    return { mcqMarks, shortMarks, longMarks, total: mcqMarks + shortMarks + longMarks, mcqCorrect, shortKnew, longKnew };
  };

  /* ── Stats ── */
  const mcqAttempted   = Object.keys(savedMcq).length;
  const shortAttempted = shorts.filter((_, i) => !!savedSubj[`short-${i}`] || subjRevealed[`short-${i}`]).length;
  const longAttempted  = longs.filter((_, i)  => !!savedSubj[`long-${i}`]  || subjRevealed[`long-${i}`]).length;
  const totalAttempted = mcqAttempted + shortAttempted + longAttempted;
  const totalQ         = mcqs.length + shorts.length + longs.length;

  /* ══════════════════════════════════════════════════════════
     LOADING
  ══════════════════════════════════════════════════════════ */
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0f172a]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-300 font-medium">Preparing your exam paper...</p>
        <p className="text-slate-500 text-sm mt-1">Shuffling questions...</p>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     EMPTY SYLLABUS SCREEN (no lectures in range for this exam type)
  ══════════════════════════════════════════════════════════ */
  if (!loading && emptyReason) return (
    <div className="flex items-center justify-center h-screen bg-[#0f172a] p-6">
      <div className="bg-[#1e1b4b] border border-amber-600 rounded-2xl p-8 w-full max-w-lg text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center mx-auto mb-4 text-purple-300">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {examType === 'finalterm' ? 'Final-Term' : 'Mid-Term'} Content Not Yet Available
        </h2>
        <p className="text-amber-300 font-semibold text-sm mb-4">
          {subjectCode} — {syllabusLabel || (examType === 'finalterm' ? 'Lectures 21 to 45' : 'Lectures 1 to 20')}
        </p>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">{emptyReason}</p>
        <div className="bg-slate-800 rounded-xl p-4 text-left text-xs text-slate-400 mb-6 space-y-1">
          <div className="text-slate-300 font-semibold mb-2">VU Exam Syllabus:</div>
          <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-purple-400" /> <span className="text-purple-300 font-medium">Mid-Term Exam</span> — Lectures 1 to 20</div>
          <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> <span className="text-cyan-300 font-medium">Final-Term Exam</span> — Lectures 21 to 45</div>
          <div className="pt-2 text-slate-500 italic">Feed questions lecture by lecture to unlock this exam mode.</div>
        </div>
        <Link href={`/subjects/${slug}`} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold transition-colors inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {subjectCode}</span>
        </Link>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     RESULTS SCREEN
  ══════════════════════════════════════════════════════════ */
  if (submitted && config) {
    const r   = calcResults();
    const pct = config.totalMarks ? Math.round((r.total / config.totalMarks) * 100) : 0;
    const grade = pct >= 80 ? { Icon: Trophy,     iconCls: 'text-cyan-400',   label: 'Outstanding Performance!',       desc: 'Exceptional mastery! You demonstrated a comprehensive command of the course material.',                                   badge: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' }
                : pct >= 60 ? { Icon: ThumbsUp,   iconCls: 'text-emerald-400',label: 'Good Effort!',                     desc: 'Solid foundation! Review the questions you missed below to elevate your score to an A grade.',                        badge: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' }
                : pct >= 40 ? { Icon: BookOpen,   iconCls: 'text-amber-400',  label: 'Needs More Practice',              desc: 'A fair attempt, but focused practice on past examination questions is recommended.',                                  badge: 'bg-amber-500/10 border-amber-500/40 text-amber-300' }
                :             { Icon: ClipboardList, iconCls: 'text-rose-400', label: 'Comprehensive Review Required',   desc: 'Carefully review the verified solutions and model answers below before re-attempting.',                               badge: 'bg-rose-500/10 border-rose-500/40 text-rose-300' };

    type ReviewItem = {
      id: string;
      section: 'mcq' | 'short' | 'long';
      number: number;
      stem: string;
      marks: number;
      isCorrect: boolean;
      userAnswerText: string | null;
      userOptionKey?: string;
      correctOptionKey?: string;
      options?: Record<string, string>;
      modelAnswer: string;
      explanation?: string | null;
      urdu_answer?: string | null;
    };

    const reviewItems: ReviewItem[] = [
      ...mcqs.map((q, i) => {
        const opts: Record<string, string> = q.options ? JSON.parse(q.options) : {};
        const ua = savedMcq[i];
        const ok = ua === q.correct;
        return {
          id: `mcq-${i}`,
          section: 'mcq' as const,
          number: i + 1,
          stem: q.stem,
          marks: 1,
          isCorrect: ok,
          userAnswerText: ua ? (opts[ua] || ua) : null,
          userOptionKey: ua,
          correctOptionKey: q.correct,
          options: opts,
          modelAnswer: opts[q.correct] || q.correct,
          explanation: q.explanation,
          urdu_answer: q.urdu_answer,
        };
      }),
      ...shorts.map((q, i) => {
        const key = `short-${i}`;
        const knew = subjKnew[key] === true;
        const text = savedSubj[key] || null;
        return {
          id: key,
          section: 'short' as const,
          number: mcqs.length + i + 1,
          stem: q.stem,
          marks: 3,
          isCorrect: knew,
          userAnswerText: text,
          modelAnswer: q.correct,
          explanation: q.explanation,
          urdu_answer: q.urdu_answer,
        };
      }),
      ...longs.map((q, i) => {
        const key = `long-${i}`;
        const knew = subjKnew[key] === true;
        const text = savedSubj[key] || null;
        return {
          id: key,
          section: 'long' as const,
          number: mcqs.length + shorts.length + i + 1,
          stem: q.stem,
          marks: 5,
          isCorrect: knew,
          userAnswerText: text,
          modelAnswer: q.correct,
          explanation: q.explanation,
          urdu_answer: q.urdu_answer,
        };
      }),
    ];

    const totalIncorrect = reviewItems.filter(item => !item.isCorrect).length;
    const totalCorrect = reviewItems.filter(item => item.isCorrect).length;

    const filteredReviewItems = reviewItems.filter(item => {
      if (reviewSectionTab !== 'all' && item.section !== reviewSectionTab) return false;
      if (reviewFilter === 'incorrect' && item.isCorrect) return false;
      if (reviewFilter === 'correct' && !item.isCorrect) return false;
      return true;
    });

    return (
      <div className="min-h-screen w-full bg-[#0b0f19] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Top Bar / Navigation Breadcrumb */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
            <Link
              href={`/subjects/${slug}`}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800"
            >
              <span>←</span>
              <span>Back to Course Portal</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-700/60 text-purple-300 uppercase tracking-wider">
                {subjectCode}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {config.label} Examination Results
              </span>
            </div>
          </div>

          {/* Hero Result Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#131b2e] to-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl">
            {/* Background glow effects */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              {/* Score Circular Badge */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 rounded-full bg-slate-950/80 border-4 border-slate-800 shadow-inner relative">
                <grade.Icon className={`w-8 h-8 ${grade.iconCls}`} />
                <span className="text-3xl font-extrabold tracking-tight mt-1 text-white">
                  {pct}%
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {r.total} / {config.totalMarks} Marks
                </span>
              </div>

              {/* Title & Description */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${grade.badge}`}>
                  <span>{grade.label}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {examType === 'finalterm' ? 'Final-Term Examination Completed' : 'Mid-Term Examination Completed'}
                </h1>
                <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                  {grade.desc}
                </p>
                <p className="text-xs text-purple-300 font-medium">
                  {subjectCode} — {subjectName} • Syllabus: {syllabusLabel || (examType === 'finalterm' ? 'Lectures 21–45' : 'Lectures 1–20')}
                </p>
              </div>

              {/* Action Buttons in Hero */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setStagedMcq({});
                    setSavedMcq({});
                    setStagedSubj({});
                    setSavedSubj({});
                    setSubjRevealed({});
                    setSubjKnew({});
                    setFlagged(new Set());
                    setSaveWarning(null);
                    setSaveNotification(null);
                    setSubmitted(false);
                    setSection('mcq');
                    setCurrentMcq(0);
                    setCurrentSubj(0);
                    fetchExam();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all text-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Exam</span>
                </button>
                <Link
                  href={`/subjects/${slug}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700 transition-all text-sm text-center"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Course Portal</span>
                </Link>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Score</div>
                <div className="text-xl font-extrabold text-cyan-400 mt-0.5">
                  {r.total} <span className="text-xs font-normal text-slate-500">/ {config.totalMarks}</span>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">MCQ Marks</div>
                <div className="text-xl font-extrabold text-cyan-400 mt-0.5">
                  {r.mcqMarks} <span className="text-xs font-normal text-slate-500">/ {config.mcqCount}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{r.mcqCorrect} correct (best {config.mcqCount} counted)</div>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Short Q Marks</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  {r.shortMarks} <span className="text-xs font-normal text-slate-500">/ {config.shortCount * 3}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{r.shortKnew} knew (best {config.shortCount} × 3)</div>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Long Q Marks</div>
                <div className="text-xl font-extrabold text-purple-400 mt-0.5">
                  {r.longMarks} <span className="text-xs font-normal text-slate-500">/ {config.longCount * 5}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{r.longKnew} knew (best {config.longCount} × 5)</div>
              </div>
            </div>
          </div>

          {/* Question-by-Question Review Header & Filters */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-400" />
                  <span>Question-by-Question Examination Review</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review your answers alongside official solutions, marking criteria, and past paper answers
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-sm flex-wrap">
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reviewFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  All ({reviewItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('incorrect')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    reviewFilter === 'incorrect'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Needs Review ({totalIncorrect})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    reviewFilter === 'correct'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Correct ({totalCorrect})</span>
                </button>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setReviewSectionTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  reviewSectionTab === 'all'
                    ? 'bg-purple-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Sections ({reviewItems.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewSectionTab('mcq')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  reviewSectionTab === 'mcq'
                    ? 'bg-purple-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                MCQs ({mcqs.length})
              </button>
              {shorts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReviewSectionTab('short')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    reviewSectionTab === 'short'
                      ? 'bg-purple-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Short Questions ({shorts.length})
                </button>
              )}
              {longs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReviewSectionTab('long')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    reviewSectionTab === 'long'
                      ? 'bg-purple-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Long Questions ({longs.length})
                </button>
              )}
            </div>
          </div>

          {/* Question List (Smooth full-page scroll) */}
          <div className="space-y-4">
            {filteredReviewItems.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-900/50 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200">No questions match this filter</h3>
                <p className="text-xs text-slate-400">
                  {reviewFilter === 'incorrect'
                    ? 'Outstanding! You answered every question correctly in this section.'
                    : `No questions found for the current filter settings.`}
                </p>
                <button
                  type="button"
                  onClick={() => { setReviewFilter('all'); setReviewSectionTab('all'); }}
                  className="mt-3 inline-block text-xs font-bold text-purple-400 hover:text-purple-300 underline cursor-pointer"
                >
                  Show all questions
                </button>
              </div>
            ) : (
              filteredReviewItems.map(item => {
                const isMcq = item.section === 'mcq';
                const isCorrect = item.isCorrect;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-md ${
                      isCorrect
                        ? 'bg-gradient-to-r from-slate-900/90 via-[#0d1f1c] to-slate-900/90 border-emerald-800/40'
                        : 'bg-gradient-to-r from-slate-900/90 via-[#261218] to-slate-900/90 border-rose-800/40'
                    }`}
                  >
                    {/* Header Row: Q# / Type Badge / Status Badge */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-3 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                          Q{item.number}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {item.section === 'mcq' ? 'Multiple Choice Question (1 Mark)' : item.section === 'short' ? 'Short Question (3 Marks)' : 'Long Question (5 Marks)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span>{item.section === 'mcq' ? 'Correct' : `${item.marks} Marks Credited`}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/40 text-rose-400">
                            <X className="w-3.5 h-3.5" />
                            <span>Needs Review</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Stem */}
                    <div className="text-base font-medium text-slate-100 leading-relaxed mb-4">
                      <MathText text={item.stem} />
                    </div>

                    {/* MCQ Options Display */}
                    {isMcq && item.options && (
                      <div className="space-y-2 mb-4">
                        {Object.entries(item.options).map(([k, val]) => {
                          const isOptionCorrect = k === item.correctOptionKey;
                          const isOptionSelected = k === item.userOptionKey;

                          let rowClass = 'border-slate-800/80 bg-slate-950/40 text-slate-300';
                          if (isOptionCorrect) {
                            rowClass = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200 font-semibold shadow-xs';
                          } else if (isOptionSelected && !isOptionCorrect) {
                            rowClass = 'border-rose-500/80 bg-rose-950/40 text-rose-200 font-semibold shadow-xs';
                          }

                          return (
                            <div
                              key={k}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-all ${rowClass}`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                                  isOptionCorrect
                                    ? 'border-emerald-400 bg-emerald-500 text-black'
                                    : isOptionSelected
                                    ? 'border-rose-400 bg-rose-500 text-white'
                                    : 'border-slate-700 bg-slate-800 text-slate-400'
                                }`}
                              >
                                {k.toUpperCase()}
                              </div>
                              <div className="flex-1 leading-snug">
                                <MathText text={val} />
                              </div>
                              <div className="flex-shrink-0 text-xs font-bold">
                                {isOptionCorrect && (
                                  <span className="text-emerald-400 inline-flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> <span>Correct Answer</span>
                                  </span>
                                )}
                                {isOptionSelected && !isOptionCorrect && (
                                  <span className="text-rose-400 inline-flex items-center gap-1">
                                    <X className="w-3.5 h-3.5" /> <span>Your Choice</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {!item.userOptionKey && (
                          <div className="text-xs text-slate-400 italic mt-1 px-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full border border-slate-500 inline-block" />
                            <span>Not Attempted</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Short / Long Subjective Display */}
                    {!isMcq && (
                      <div className="space-y-3 mb-4">
                        {/* Student Typed Answer */}
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs">
                          <span className="font-semibold text-slate-400 block mb-1">Your Written Answer:</span>
                          {item.userAnswerText ? (
                            <div
                              className="text-slate-200 text-sm leading-relaxed prose prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: item.userAnswerText }}
                            />
                          ) : (
                            <span className="text-slate-500 italic">No written answer saved for this question.</span>
                          )}
                        </div>

                        {/* Verified Model Answer */}
                        <div className="p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/30 text-emerald-200 text-sm leading-relaxed">
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Official Model Answer:</span>
                          </div>
                          <div><MathText text={item.modelAnswer} /></div>
                        </div>
                      </div>
                    )}

                    {/* Explanatory Notes / Takeaways */}
                    {item.explanation && (
                      <div className="mt-3 p-3 rounded-xl border border-blue-900/50 bg-blue-950/30 text-xs text-blue-200 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="font-bold text-blue-300">Key Takeaway: </span>
                          <MathText text={item.explanation} />
                        </div>
                      </div>
                    )}

                    {/* Urdu Translation if available */}
                    {item.urdu_answer && (
                      <div
                        className="mt-2 p-3 rounded-xl border border-amber-900/40 bg-amber-950/20 text-xs text-amber-200 text-right leading-relaxed font-sans"
                        dir="rtl"
                      >
                        <span className="font-bold text-amber-300 block mb-1 text-[11px]">خلاصہ / اردو تشریح:</span>
                        {item.urdu_answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href={`/subjects/${slug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold transition-all text-sm text-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course Portal</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setStagedMcq({});
                setSavedMcq({});
                setStagedSubj({});
                setSavedSubj({});
                setSubjRevealed({});
                setSubjKnew({});
                setFlagged(new Set());
                setSaveWarning(null);
                setSaveNotification(null);
                setSubmitted(false);
                setSection('mcq');
                setCurrentMcq(0);
                setCurrentSubj(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                fetchExam();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all text-sm shadow-lg shadow-purple-900/30 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Examination</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     MAIN EXAM UI
  ══════════════════════════════════════════════════════════ */
  const mcqQ = mcqs[currentMcq];
  const mcqOpts: Record<string, string> = mcqQ?.options ? JSON.parse(mcqQ.options) : {};
  const subjList = section === 'short' ? shorts : longs;
  const subjQ    = subjList[currentSubj];
  const subjKey  = `${section}-${currentSubj}`;
  const isRevealed = subjRevealed[subjKey];
  const knewAnswer = subjKnew[subjKey];

  const qNumber = section === 'mcq'
    ? currentMcq + 1
    : (section === 'short' ? mcqs.length : mcqs.length + shorts.length) + currentSubj + 1;

  const totalQAll = mcqs.length + shorts.length + longs.length;
  const currentMarks = section === 'mcq' ? (mcqQ?.marks ?? 1) : (subjQ?.marks ?? (section === 'short' ? 3 : 5));
  const currentTime  = section === 'mcq' ? (mcqQ?.time_minutes ?? 1) : (subjQ?.time_minutes ?? (section === 'short' ? 3 : 4));

  const pctAttempted = totalQ ? Math.round((totalAttempted / totalQ) * 100) : 0;

  return (
    <div className="h-screen w-screen bg-[#0f172a] flex flex-col select-none overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>

      {/* ══ TOP HEADER ══════════════════════════════════════════ */}
      <header className="bg-[#1a1a2e] border-b border-slate-700 h-14 flex items-center px-4 flex-shrink-0">
        <div className="text-white font-bold text-sm flex-1 truncate">
          <div>{subjectCode} ({subjectName})</div>
          <div className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
            {examType === 'finalterm'
              ? <><GraduationCap className="w-3 h-3" /> Final-Term</>
              : <><FileText className="w-3 h-3" /> Mid-Term</>
            } — Syllabus: {syllabusLabel || (examType === 'finalterm' ? 'Lectures 21–45' : 'Lectures 1–20')}
          </div>
        </div>
        {/* Circular Overall Paper Timer (centered) */}
        <div className="flex justify-center flex-1">
          <CircularTimer remainingSeconds={remainingSeconds} totalSeconds={totalPaperSeconds} />
        </div>
        {/* User info */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-right text-xs text-slate-400">
            Login Time {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs font-bold text-white leading-tight text-right">
            <div>GUEST</div><div>GUEST</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-600 border-2 border-slate-500 flex items-center justify-center overflow-hidden">
            <User className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      </header>


      {/* ══ QUESTION INFO BAR ════════════════════════════════════ */}
      <div className="bg-[#6d28d9] flex items-center justify-between px-4 py-2">
        <span className="text-white font-semibold text-sm">
          Question No : {qNumber} of {totalQAll}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-white text-sm">
            Marks: {currentMarks} &nbsp;
            <span className="text-yellow-300">(Time {currentTime} Min)</span>
          </span>
          <button
            onClick={() => setFlagged(f => { const n = new Set(f); n.has(currentKey) ? n.delete(currentKey) : n.add(currentKey); return n; })}
            className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-sm transition-colors ${flagged.has(currentKey) ? 'bg-yellow-400 text-black' : 'bg-yellow-500/40 text-yellow-300 hover:bg-yellow-400 hover:text-black'}`}
          >!</button>
        </div>
      </div>

      {/* ══ BODY ════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT: Question Area ─────────────────────────────── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-white">

          {/* Question text */}
          <div className="p-4 text-gray-900 text-sm leading-relaxed max-h-[42vh] min-h-[140px] overflow-y-auto border-b-2 border-purple-200 shrink-0">
            {mcqQ && section === 'mcq' && <MathText text={mcqQ.stem} as="div" />}
            {subjQ && section !== 'mcq' && <MathText text={subjQ.stem} as="div" />}
            {section !== 'mcq' && !subjQ && (
              <span className="text-gray-400 italic">No questions available in this section.</span>
            )}
          </div>

          {/* Answer label */}
          <div className="bg-[#6d28d9] px-4 py-1.5 shrink-0 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Answer</span>
            {section !== 'mcq' && (
              <button
                type="button"
                onClick={() => {
                  setStagedSubj(t => ({ ...t, [subjKey]: '' }));
                  setSavedSubj(t => ({ ...t, [subjKey]: '' }));
                }}
                className="text-xs text-purple-200 hover:text-white flex items-center gap-1 font-medium transition-colors"
                title="Clear answer text"
              >
                <RotateCcw className="w-3 h-3" /> Clear Answer
              </button>
            )}
          </div>

          {/* ── MCQ Options ── */}
          {section === 'mcq' && mcqQ && (
            <div className="flex-1 divide-y divide-gray-200 bg-white">
              {Object.entries(mcqOpts).map(([key, val]) => {
                const currentVal = stagedMcq[currentMcq] ?? savedMcq[currentMcq];
                const isSelected = currentVal === key;
                return (
                  <label
                    key={key}
                    onClick={() => {
                      setStagedMcq(a => ({ ...a, [currentMcq]: key }));
                      setSaveWarning(null);
                    }}
                    className={`flex items-start gap-3 px-4 cursor-pointer transition-colors group ${isSelected ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'hover:bg-purple-50 border-l-4 border-transparent'}`}
                  >
                    {/* Radio */}
                    <div className={`mt-3.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'border-purple-600' : 'border-gray-400 bg-white'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                    </div>
                    {/* Option text in box */}
                    <div className={`flex-1 text-sm text-gray-800 py-2 min-h-[52px] flex items-center border-b border-gray-100 ${isSelected ? 'text-gray-900 font-medium' : ''}`}>
                      <MathText text={val} />
                    </div>
                  </label>
                );
              })}

              {/* Status & Save Banner for MCQ */}
              {saveWarning && (
                <div className="p-3 bg-amber-100 border-t border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{saveWarning}</span>
                  </div>
                  <button
                    onClick={handleSave}
                    className="ml-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-extrabold shadow-xs inline-flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Now</span>
                  </button>
                </div>
              )}
              {saveNotification && (
                <div className="p-2.5 bg-emerald-100 border-t border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveNotification}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Subjective Answer Area ── */}
          {section !== 'mcq' && subjQ && (
            <div className="flex-1 p-3 bg-white">
              {/* Rich text area for typing answer */}
              <RichTextEditor
                key={subjKey}
                value={stagedSubj[subjKey] ?? savedSubj[subjKey] ?? ''}
                onChange={v => {
                  setStagedSubj(t => ({ ...t, [subjKey]: v }));
                  setSaveWarning(null);
                }}
              />

              {/* Status & Save Banner for Subjective */}
              {saveWarning && (
                <div className="mt-3 p-3 bg-amber-100 border border-amber-400 rounded-lg text-amber-900 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{saveWarning}</span>
                  </div>
                  <button
                    onClick={handleSave}
                    className="ml-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-extrabold shadow-xs inline-flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Now</span>
                  </button>
                </div>
              )}
              {saveNotification && (
                <div className="mt-3 p-2.5 bg-emerald-100 border border-emerald-400 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveNotification}</span>
                </div>
              )}

              {/* Reveal model answer */}
              {!isRevealed ? (
                <button
                  onClick={() => setSubjRevealed(r => ({ ...r, [subjKey]: true }))}
                  className="mt-3 w-full py-2 rounded-lg border-2 border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Reveal Model Answer
                </button>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-emerald-900 text-sm leading-relaxed whitespace-pre-line">
                    <strong className="text-emerald-700 flex items-center gap-1 mb-2"><Check className="w-4 h-4" /> Model Answer:</strong>
                    <MathText text={subjQ.correct} />
                  </div>
                  {subjQ.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-xs flex gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span><MathText text={subjQ.explanation} /></span>
                    </div>
                  )}
                  {subjQ.urdu_answer && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-sm text-right leading-relaxed" dir="rtl">
                      {subjQ.urdu_answer}
                    </div>
                  )}
                  {/* Self-assessment */}
                  {knewAnswer === undefined || knewAnswer === null ? (
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-gray-700 font-semibold text-sm mb-2">Self-Assessment: Did you answer this question accurately?</p>
                      <div className="flex gap-3">
                        <button onClick={() => setSubjKnew(k => ({ ...k, [subjKey]: true }))}
                          className="flex-1 py-2 rounded-lg bg-emerald-100 border-2 border-emerald-400 text-emerald-800 font-bold text-sm hover:bg-emerald-200 transition-colors inline-flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>Yes, Correct ({section === 'short' ? 3 : 5} marks)</span>
                        </button>
                        <button onClick={() => setSubjKnew(k => ({ ...k, [subjKey]: false }))}
                          className="flex-1 py-2 rounded-lg bg-red-100 border-2 border-red-400 text-red-800 font-bold text-sm hover:bg-red-200 transition-colors inline-flex items-center justify-center gap-1.5">
                          <X className="w-4 h-4" />
                          <span>No, Needs Review (0 marks)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-lg p-3 text-sm font-bold text-center flex items-center justify-center gap-1.5 ${knewAnswer ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {knewAnswer
                        ? <><Check className="w-4 h-4" /> {section === 'short' ? 3 : 5} marks awarded</>
                        : <><X className="w-4 h-4" /> 0 marks — Further study recommended</>
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {section !== 'mcq' && !subjQ && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic p-8 text-center bg-white">
              No questions are currently available in this section.
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ───────────────────────────────────── */}
        <div className="w-44 min-h-0 bg-[#1e1b4b] border-l border-purple-900 flex flex-col text-xs flex-shrink-0">
          <div className="bg-[#4c1d95] px-3 py-2 text-white font-semibold text-sm">Summary</div>

          {/* Question grid — MCQs */}
          <div className="overflow-y-auto flex-1 p-2">
            {mcqs.length > 0 && (
              <div className="mb-2">
                <div className="text-purple-400 font-bold text-[10px] uppercase mb-1">MCQ</div>
                <div className="grid grid-cols-3 gap-1">
                  {mcqs.map((_, i) => {
                    const k = `mcq-${i}`;
                    const isCur    = section === 'mcq' && currentMcq === i;
                    const isSaved  = i in savedMcq;
                    const isStaged = i in stagedMcq && stagedMcq[i] !== savedMcq[i];
                    const isFlag   = flagged.has(k);
                    return (
                      <button key={i}
                        onClick={() => handleSelectSidebarQuestion('mcq', i)}
                        className={`rounded-full w-9 h-9 font-bold transition-all border-2 text-[11px] ${
                          isCur    ? 'bg-teal-500 border-teal-400 text-white scale-110 shadow-md' :
                          isFlag   ? 'bg-yellow-400 border-yellow-300 text-black' :
                          isSaved  ? 'bg-emerald-600 border-emerald-500 text-white' :
                          isStaged ? 'bg-amber-500 border-amber-400 text-black animate-pulse' :
                                     'bg-[#312e81] border-purple-600 text-purple-200 hover:bg-purple-700'
                        }`}>
                        {String(i + 1).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Short Qs */}
            {shorts.length > 0 && (
              <div className="mb-2">
                <div className="text-emerald-400 font-bold text-[10px] uppercase mb-1">Short Q</div>
                <div className="grid grid-cols-3 gap-1">
                  {shorts.map((_, i) => {
                    const k = `short-${i}`;
                    const isCur    = section === 'short' && currentSubj === i;
                    const isSaved  = !!savedSubj[k] || subjRevealed[k];
                    const isStaged = !!stagedSubj[k] && stagedSubj[k] !== (savedSubj[k] ?? '');
                    const isFlag   = flagged.has(k);
                    return (
                      <button key={i}
                        onClick={() => handleSelectSidebarQuestion('short', i)}
                        className={`rounded-full w-9 h-9 font-bold transition-all border-2 text-[11px] ${
                          isCur    ? 'bg-teal-500 border-teal-400 text-white scale-110 shadow-md' :
                          isFlag   ? 'bg-yellow-400 border-yellow-300 text-black' :
                          isSaved  ? 'bg-emerald-600 border-emerald-500 text-white' :
                          isStaged ? 'bg-amber-500 border-amber-400 text-black animate-pulse' :
                                     'bg-[#312e81] border-purple-600 text-purple-200 hover:bg-purple-700'
                        }`}>
                        {String(mcqs.length + i + 1).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Long Qs */}
            {longs.length > 0 && (
              <div className="mb-2">
                <div className="text-cyan-400 font-bold text-[10px] uppercase mb-1">Long Q</div>
                <div className="grid grid-cols-3 gap-1">
                  {longs.map((_, i) => {
                    const k = `long-${i}`;
                    const isCur    = section === 'long' && currentSubj === i;
                    const isSaved  = !!savedSubj[k] || subjRevealed[k];
                    const isStaged = !!stagedSubj[k] && stagedSubj[k] !== (savedSubj[k] ?? '');
                    const isFlag   = flagged.has(k);
                    return (
                      <button key={i}
                        onClick={() => handleSelectSidebarQuestion('long', i)}
                        className={`rounded-full w-9 h-9 font-bold transition-all border-2 text-[11px] ${
                          isCur    ? 'bg-teal-500 border-teal-400 text-white scale-110 shadow-md' :
                          isFlag   ? 'bg-yellow-400 border-yellow-300 text-black' :
                          isSaved  ? 'bg-emerald-600 border-emerald-500 text-white' :
                          isStaged ? 'bg-amber-500 border-amber-400 text-black animate-pulse' :
                                     'bg-[#312e81] border-purple-600 text-purple-200 hover:bg-purple-700'
                        }`}>
                        {String(mcqs.length + shorts.length + i + 1).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ► Scroll arrow */}
            <button className="w-full mt-1 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-sm transition-colors">►</button>
          </div>

          {/* Stats */}
          <div className="border-t border-purple-800 p-3 space-y-1">
            <div className="text-xl font-extrabold text-white mb-1">{pctAttempted}%</div>
            {pctAttempted > 0 && (
              <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pctAttempted}%` }} />
              </div>
            )}
            <div className="flex justify-between text-slate-300"><span>Attempted</span><span className="text-cyan-400 font-bold">{totalAttempted}</span></div>
            <div className="flex justify-between text-slate-300"><span>Flagged</span><span className="text-yellow-400 font-bold">{flagged.size}</span></div>
            <div className="flex justify-between text-slate-300"><span>Total</span><span className="text-white font-bold">{totalQ}</span></div>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM BAR ══════════════════════════════════════════ */}
      <div className="bg-[#1a1a2e] border-t border-slate-700 h-14 px-4 flex items-center justify-between gap-2 flex-shrink-0 z-20">
        <button onClick={finishExam}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-semibold text-sm transition-colors">
          <ClipboardList className="w-4 h-4" />
          Finish Exam
        </button>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFlagged(f => { const n = new Set(f); n.has(currentKey) ? n.delete(currentKey) : n.add(currentKey); return n; })}
            className={`flex items-center gap-1 px-3 py-2 rounded font-semibold text-sm transition-colors ${flagged.has(currentKey) ? 'bg-yellow-400 text-black' : 'bg-[#6d28d9] hover:bg-purple-600 text-white'}`}>
            <Flag className="w-4 h-4" />
            Flag
          </button>
          <button onClick={handleFirst}
            className="flex items-center gap-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-semibold text-sm transition-colors">
            <ChevronsLeft className="w-4 h-4" />
            First
          </button>
          <button onClick={handleLast}
            className="flex items-center gap-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-semibold text-sm transition-colors">
            Last
            <ChevronsRight className="w-4 h-4" />
          </button>
          <button onClick={goPrev}
            className="flex items-center gap-1 px-3 py-2 bg-[#6d28d9] hover:bg-purple-600 text-white rounded font-semibold text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <button onClick={goNext}
            className="flex items-center gap-1 px-3 py-2 bg-[#6d28d9] hover:bg-purple-600 text-white rounded font-semibold text-sm transition-colors">
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleSave}
          className={`px-5 py-2 rounded font-bold text-sm transition-all shadow-xs flex items-center gap-1.5 ${
            isCurrentUnsaved()
              ? 'bg-amber-500 hover:bg-amber-400 text-black animate-pulse ring-2 ring-amber-300 ring-offset-1 ring-offset-[#1a1a2e]'
              : 'bg-teal-600 hover:bg-teal-500 text-white'
          }`}
          title="Save your answer"
        >
          <Save className="w-4 h-4" />
          {isCurrentUnsaved() ? 'Save Answer *' : 'Save'}
        </button>
      </div>
    </div>
  );
}
