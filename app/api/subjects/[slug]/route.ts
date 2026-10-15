import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();
    const subject = db.prepare(`SELECT * FROM subjects WHERE slug = ?`).get(slug);
    if (!subject) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const lectures = db.prepare(`
      SELECT l.*, 
        (SELECT COUNT(*) FROM questions q WHERE q.lecture_id = l.id) as question_count
      FROM lectures l
      WHERE l.subject_id = (SELECT id FROM subjects WHERE slug = ?)
      ORDER BY l.number
    `).all(slug);

    return NextResponse.json({ subject, lectures });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
