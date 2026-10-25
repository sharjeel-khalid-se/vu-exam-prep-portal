import { NextResponse } from 'next/server';
import { queryAll, isTurso } from '@/lib/db';
import { seedAllCourses } from '@/lib/seed';

export async function GET(req: Request) {
  try {
    if (!isTurso()) seedAllCourses();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();

    if (!q) {
      const subjects = await queryAll(`SELECT * FROM subjects ORDER BY code`);
      return NextResponse.json({ subjects, lectures: [] });
    }

    const pattern = `%${q}%`;

    // Matching subjects
    const subjects = await queryAll(`
      SELECT * FROM subjects
      WHERE code LIKE ? OR name LIKE ? OR description LIKE ?
      ORDER BY code
    `, [pattern, pattern, pattern]);

    // Matching lectures (with subject info and question count)
    const lectures = await queryAll(`
      SELECT 
        l.id,
        l.number,
        l.title,
        s.name AS subject_name,
        s.code AS subject_code,
        s.slug AS subject_slug,
        COUNT(q.id) AS question_count
      FROM lectures l
      JOIN subjects s ON l.subject_id = s.id
      LEFT JOIN questions q ON q.lecture_id = l.id
      WHERE l.title LIKE ? 
         OR ('Lecture ' || CAST(l.number AS TEXT)) LIKE ?
         OR CAST(l.number AS TEXT) = ?
         OR s.code LIKE ? 
         OR s.name LIKE ?
      GROUP BY l.id
      ORDER BY s.code, l.number
    `, [pattern, pattern, q, pattern, pattern]);

    return NextResponse.json({ subjects, lectures });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
