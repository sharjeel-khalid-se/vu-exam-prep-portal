import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get('lecture_id');
    const type = searchParams.get('type');

    const db = getDb();
    let query = `SELECT * FROM questions WHERE 1=1`;
    const args: (string | number)[] = [];

    if (lectureId) { query += ` AND lecture_id = ?`; args.push(Number(lectureId)); }
    if (type)      { query += ` AND type = ?`;       args.push(type); }
    query += ` ORDER BY id`;

    const questions = db.prepare(query).all(...args);
    return NextResponse.json({ questions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO questions (lecture_id, type, stem, options, correct, explanation, urdu_answer, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.lecture_id, body.type, body.stem,
      body.options ? JSON.stringify(body.options) : null,
      body.correct, body.explanation ?? null,
      body.urdu_answer ?? null, body.image_url ?? null
    );
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
