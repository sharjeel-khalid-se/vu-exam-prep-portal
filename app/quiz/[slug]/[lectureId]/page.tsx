import Link from 'next/link';
import QuizClient from './QuizClient';

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lectureId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { slug, lectureId } = await params;
  const { type = 'mcq' } = await searchParams;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/subjects/${slug}`} className="hover:text-emerald-400 transition-colors uppercase">{slug}</Link>
        <span>/</span>
        <span className="text-slate-300 capitalize">{type === 'all' ? 'Mixed Mode' : type.toUpperCase() + ' Quiz'}</span>
      </div>

      <QuizClient lectureId={lectureId} subjectSlug={slug} typeFilter={type} />
    </div>
  );
}
