import Link from 'next/link';
import ReviewClient from './ReviewClient';

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string; lectureId: string }>;
}) {
  const { slug, lectureId } = await params;

  return (
    <div>
      <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-emerald-400">Home</Link>
        <span>/</span>
        <Link href={`/subjects/${slug}`} className="hover:text-emerald-400 uppercase">{slug}</Link>
        <span>/</span>
        <span className="text-slate-300">Short Q&amp;A Review</span>
      </div>
      <ReviewClient lectureId={lectureId} subjectSlug={slug} />
    </div>
  );
}
