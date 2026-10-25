import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedCS403Lecture1, seedCS403Exam, seedAllCourses } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const EXAM_CONFIG = {
  midterm: {
    mcqTotal: 27, mcqCount: 22,
    shortTotal: 3,  shortCount: 2,
    longTotal: 3,   longCount: 2,
    duration: 60, totalMarks: 38,
    label: 'Mid-Term Exam',
    syllabus: 'Lectures 1 to 20',
    minLecture: 1,
    maxLecture: 20,
  },
  finalterm: {
    mcqTotal: 40, mcqCount: 33,
    shortTotal: 6,  shortCount: 4,
    longTotal: 4,   longCount: 3,
    duration: 90, totalMarks: 60,
    label: 'Final-Term Exam',
    syllabus: 'Lectures 21 to 45',
    minLecture: 21,
    maxLecture: 45,
  },
} as const;

export type ExamType = keyof typeof EXAM_CONFIG;

const SUBJECT_EXAM_OVERRIDES: Record<string, {
  midterm?: { minLecture: number; maxLecture: number; syllabus: string };
  finalterm?: { minLecture: number; maxLecture: number; syllabus: string };
}> = {
  sta301: {
    midterm: { minLecture: 1, maxLecture: 21, syllabus: 'Lectures 1 to 21' },
    finalterm: { minLecture: 22, maxLecture: 45, syllabus: 'Lectures 22 to 45' },
  },
};

// Fisher-Yates array shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Randomize option order (a, b, c, d) for an MCQ while preserving correct answer mapping
function shuffleMcqOptions(mcq: { id: number; stem: string; options: string; correct: string; [key: string]: unknown }) {
  try {
    const opts = JSON.parse(mcq.options) as Record<string, string>;
    const correctText = opts[mcq.correct];
    if (!correctText) return mcq;

    const values = Object.values(opts);
    const shuffledValues = shuffleArray(values);
    const alphabet = ['a', 'b', 'c', 'd', 'e', 'f'];

    const newOpts: Record<string, string> = {};
    let newCorrect = mcq.correct;

    shuffledValues.forEach((val, idx) => {
      const key = alphabet[idx] ?? String(idx);
      newOpts[key] = val;
      if (val === correctText) {
        newCorrect = key;
      }
    });

    return {
      ...mcq,
      options: JSON.stringify(newOpts),
      correct: newCorrect,
    };
  } catch {
    return mcq;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as ExamType;

    if (!EXAM_CONFIG[type]) {
      return NextResponse.json({ error: 'Invalid type. Use: midterm or finalterm' }, { status: 400 });
    }

    seedAllCourses();
    seedCS403Lecture1();
    seedCS403Exam();

    const db = getDb();
    const baseConfig = EXAM_CONFIG[type];
    const subjectOverride = SUBJECT_EXAM_OVERRIDES[slug]?.[type];
    const minLecture = subjectOverride?.minLecture ?? baseConfig.minLecture;
    const maxLecture = subjectOverride?.maxLecture ?? baseConfig.maxLecture;
    const syllabus = subjectOverride?.syllabus ?? baseConfig.syllabus;

    const config = {
      ...baseConfig,
      minLecture,
      maxLecture,
      syllabus,
    };

    const subject = db.prepare('SELECT * FROM subjects WHERE slug = ?').get(slug) as { id: number } | undefined;
    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    // Strict lecture scope based on VU exam syllabus:
    const lectures = db.prepare(`
      SELECT id FROM lectures 
      WHERE subject_id = ? AND number >= ? AND number <= ?
      ORDER BY number
    `).all(subject.id, minLecture, maxLecture) as { id: number }[];

    const lectureIds = lectures.map(l => l.id);

    if (!lectureIds.length) {
      return NextResponse.json(
        {
          mcqs: [],
          shorts: [],
          longs: [],
          config,
          type,
          emptyReason: `${config.label} syllabus covers ${config.syllabus}. No lectures in this range are currently registered for this course.`,
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
    }

    const ph = lectureIds.map(() => '?').join(',');
    const ids: (number | string)[] = lectureIds;

    // Pull from database with RANDOM() ordering
    const rawMcqs = db.prepare(
      `SELECT * FROM questions WHERE lecture_id IN (${ph}) AND type='mcq' ORDER BY RANDOM() LIMIT ?`
    ).all(...ids, config.mcqTotal) as { id: number; stem: string; options: string; correct: string }[];

    const rawShorts = db.prepare(
      `SELECT * FROM questions WHERE lecture_id IN (${ph}) AND type='short' ORDER BY RANDOM() LIMIT ?`
    ).all(...ids, config.shortTotal) as { id: number; stem: string; correct: string; [key: string]: unknown }[];

    const rawLongs = db.prepare(
      `SELECT * FROM questions WHERE lecture_id IN (${ph}) AND type='long' ORDER BY RANDOM() LIMIT ?`
    ).all(...ids, config.longTotal) as { id: number; stem: string; correct: string; [key: string]: unknown }[];

    // Secondary in-memory shuffle to guarantee a uniquely randomized paper on every invocation
    const mcqs = shuffleArray(rawMcqs).map(shuffleMcqOptions);
    const shorts = shuffleArray(rawShorts);
    const longs = shuffleArray(rawLongs);

    return NextResponse.json(
      { mcqs, shorts, longs, config, type },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
