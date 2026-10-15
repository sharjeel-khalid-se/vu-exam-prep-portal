import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedCS403Lecture1 } from '@/lib/seed';

export async function GET() {
  try {
    seedCS403Lecture1();
    const db = getDb();
    const subjects = db.prepare(`SELECT * FROM subjects ORDER BY name`).all();
    return NextResponse.json({ subjects });
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
      INSERT INTO subjects (name, slug, code, description)
      VALUES (?, ?, ?, ?)
    `).run(body.name, body.slug, body.code, body.description ?? '');
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
