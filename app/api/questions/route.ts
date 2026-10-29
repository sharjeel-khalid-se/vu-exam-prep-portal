import { NextResponse } from 'next/server';
import { queryAll, queryOne, execute, isTurso } from '@/lib/db';
import { seedAllCourses } from '@/lib/seed';

export async function GET(req: Request) {
  try {
    if (!isTurso()) seedAllCourses();
    const { searchParams } = new URL(req.url);
    const lectureIdParam = searchParams.get('lecture_id');
    const subjectParam = searchParams.get('subject') || searchParams.get('slug');
    const lectureNumParam = searchParams.get('lecture') || searchParams.get('lecture_num');
    const type = searchParams.get('type');

    let resolvedLectureId: number | null = null;

    if (lectureIdParam) {
      const num = Number(lectureIdParam);
      if (!isNaN(num)) {
        resolvedLectureId = num;
        // If subject is also provided, verify if lectureIdParam was meant as lecture number or db id!
        if (subjectParam) {
          const matched = await queryOne<{ id: number }>(`
            SELECT l.id FROM lectures l
            JOIN subjects s ON l.subject_id = s.id
            WHERE (s.slug = ? OR s.code = ?) AND (l.number = ? OR l.id = ?)
            ORDER BY (CASE WHEN l.number = ? THEN 1 ELSE 2 END)
            LIMIT 1
          `, [subjectParam, subjectParam.toUpperCase(), num, num, num]);
          if (matched) {
            resolvedLectureId = matched.id;
          }
        }
      }
    } else if (subjectParam && lectureNumParam) {
      const num = Number(lectureNumParam);
      if (!isNaN(num)) {
        const matched = await queryOne<{ id: number }>(`
          SELECT l.id FROM lectures l
          JOIN subjects s ON l.subject_id = s.id
          WHERE (s.slug = ? OR s.code = ?) AND (l.number = ? OR l.id = ?)
          LIMIT 1
        `, [subjectParam, subjectParam.toUpperCase(), num, num]);
        if (matched) {
          resolvedLectureId = matched.id;
        }
      }
    }

    let query = `SELECT * FROM questions WHERE 1=1`;
    const args: (string | number)[] = [];

    if (resolvedLectureId !== null) {
      query += ` AND lecture_id = ?`;
      args.push(resolvedLectureId);
    }
    if (type) {
      query += ` AND type = ?`;
      args.push(type);
    }
    query += ` ORDER BY id`;

    const questions = await queryAll(query, args);
    return NextResponse.json({ questions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await execute(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.lecture_id, body.type, body.stem,
      body.options ? JSON.stringify(body.options) : null,
      body.correct, body.explanation ?? null,
      body.urdu_answer ?? null, body.image_url ?? null
    ]);
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
