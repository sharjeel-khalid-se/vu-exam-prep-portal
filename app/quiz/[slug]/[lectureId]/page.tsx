import QuizClient from './QuizClient';
import { queryOne } from '@/lib/db';

async function getSubjectInfo(slug: string) {
  try {
    const subject = await queryOne<{ code: string; name: string }>('SELECT code, name FROM subjects WHERE slug = ?', [slug]);
    return subject ?? { code: slug.toUpperCase(), name: '' };
  } catch {
    return { code: slug.toUpperCase(), name: '' };
  }
}

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lectureId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { slug, lectureId } = await params;
  const { type = 'mcq' } = await searchParams;
  const subject = await getSubjectInfo(slug);

  return (
    <QuizClient
      lectureId={lectureId}
      subjectSlug={slug}
      typeFilter={type}
      subjectCode={subject.code}
      subjectName={subject.name}
    />
  );
}
