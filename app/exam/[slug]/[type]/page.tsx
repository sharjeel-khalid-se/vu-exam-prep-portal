import ExamClient from './ExamClient';
import { queryOne } from '@/lib/db';

async function getSubjectInfo(slug: string) {
  try {
    const subject = await queryOne<{ code: string; name: string }>('SELECT code, name FROM subjects WHERE slug = ?', [slug]);
    return subject ?? { code: slug.toUpperCase(), name: slug };
  } catch {
    return { code: slug.toUpperCase(), name: slug };
  }
}

export default async function ExamPage({
  params,
}: {
  params: Promise<{ slug: string; type: string }>;
}) {
  const { slug, type } = await params;
  const subject = await getSubjectInfo(slug);

  return (
    <ExamClient
      slug={slug}
      examType={type}
      subjectCode={subject.code}
      subjectName={subject.name}
    />
  );
}
