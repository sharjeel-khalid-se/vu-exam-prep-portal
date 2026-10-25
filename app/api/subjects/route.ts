import { NextResponse } from 'next/server';
import { queryAll, execute, isTurso } from '@/lib/db';
import { seedAllCourses } from '@/lib/seed';

export async function GET() {
  try {
    if (!isTurso()) seedAllCourses();
    const subjects = await queryAll(`SELECT * FROM subjects ORDER BY code`);
    return NextResponse.json({ subjects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await execute(`
      INSERT INTO subjects (name, slug, code, description)
      VALUES (?, ?, ?, ?)
    `, [body.name, body.slug, body.code, body.description ?? '']);
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
