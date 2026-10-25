import { NextResponse } from 'next/server';
import { queryOne, queryAll, isTurso } from '@/lib/db';
import { seedAllCourses } from '@/lib/seed';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!isTurso()) seedAllCourses();
    const subject = await queryOne(`SELECT * FROM subjects WHERE slug = ?`, [slug]);
    if (!subject) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const lectures = await queryAll(`
      SELECT l.*, 
        (SELECT COUNT(*) FROM questions q WHERE q.lecture_id = l.id) as question_count
      FROM lectures l
      WHERE l.subject_id = (SELECT id FROM subjects WHERE slug = ?)
      ORDER BY l.number
    `, [slug]);

    return NextResponse.json({ subject, lectures });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
