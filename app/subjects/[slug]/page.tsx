import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Lecture {
  id: number;
  number: number;
  title: string;
  question_count: number;
}
interface Subject {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string;
}

async function getSubjectData(slug: string): Promise<{ subject: Subject; lectures: Lecture[] } | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/subjects/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SubjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSubjectData(slug);
  if (!data) notFound();
  const { subject, lectures } = data;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{subject.code}</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="text-xs font-mono text-emerald-400 mb-1">{subject.code}</div>
        <h1 className="text-3xl font-extrabold text-white mb-2">{subject.name}</h1>
        <p className="text-slate-400">{subject.description}</p>
      </div>

      {/* Lectures */}
      <h2 className="text-xl font-bold text-slate-200 mb-4">📖 Lectures</h2>
      <div className="space-y-3">
        {lectures.map((lecture) => (
          <div
            key={lecture.id}
            className="rounded-xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-mono text-slate-500 mr-2">Lecture {lecture.number}</span>
                <h3 className="text-white font-semibold inline">{lecture.title}</h3>
              </div>
              <span className="text-xs bg-slate-800 text-slate-400 rounded-full px-3 py-1">
                {lecture.question_count} questions
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/quiz/${subject.slug}/${lecture.id}?type=mcq`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                🧠 MCQ Quiz
              </Link>
              <Link
                href={`/review/${subject.slug}/${lecture.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
              >
                📖 Short Q&amp;A
              </Link>
              <Link
                href={`/quiz/${subject.slug}/${lecture.id}?type=all`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
              >
                🔀 Mixed Mode
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
