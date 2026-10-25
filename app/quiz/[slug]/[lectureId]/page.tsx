import QuizClient from './QuizClient';

async function getSubjectInfo(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/subjects/${slug}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    return data.subject ?? { code: slug.toUpperCase(), name: '' };
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
