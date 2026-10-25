import ExamClient from './ExamClient';

async function getSubjectInfo(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/subjects/${slug}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return { code: slug.toUpperCase(), name: slug };
    const data = await res.json();
    return data.subject ?? { code: slug.toUpperCase(), name: slug };
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
