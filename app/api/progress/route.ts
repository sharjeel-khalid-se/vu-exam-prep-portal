import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { session_id, question_id, answered, is_correct } = await req.json();
    const db = getDb();
    db.prepare(`
      INSERT INTO progress (session_id, question_id, answered, is_correct)
      VALUES (?, ?, ?, ?)
    `).run(session_id, question_id, answered, is_correct ? 1 : 0);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');
    const db = getDb();
    const rows = db.prepare(`
      SELECT p.*, q.stem, q.type FROM progress p
      JOIN questions q ON q.id = p.question_id
      WHERE p.session_id = ?
      ORDER BY p.attempted_at DESC
    `).all(session_id ?? '');
    return NextResponse.json({ progress: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
