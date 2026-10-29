import Link from 'next/link';
import ReviewClient from './ReviewClient';
import { queryOne } from '@/lib/db';

interface SubjectRow {
  id: number;
  code: string;
  name: string;
}

interface LectureRow {
  id: number;
  number: number;
  title: string;
}

async function getSubjectAndLecture(slug: string, lectureParam: string) {
  try {
    const subject = await queryOne<SubjectRow>(
      'SELECT id, code, name FROM subjects WHERE slug = ?',
      [slug]
    );

    const safeSubject = subject ?? { id: 0, code: slug.toUpperCase(), name: '' };
    const num = Number(lectureParam);

    let lecture: LectureRow | null = null;
    if (!isNaN(num) && safeSubject.id > 0) {
      lecture = await queryOne<LectureRow>(
        'SELECT id, number, title FROM lectures WHERE subject_id = ? AND number = ?',
        [safeSubject.id, num]
      );
      if (!lecture) {
        lecture = await queryOne<LectureRow>(
          'SELECT id, number, title FROM lectures WHERE subject_id = ? AND id = ?',
          [safeSubject.id, num]
        );
      }
    }

    if (!lecture && !isNaN(num)) {
      lecture = await queryOne<LectureRow>(
        'SELECT id, number, title FROM lectures WHERE id = ?',
        [num]
      );
    }

    return { subject: safeSubject, lecture };
  } catch {
    return {
      subject: { id: 0, code: slug.toUpperCase(), name: '' },
      lecture: null,
    };
  }
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string; lectureId: string }>;
}) {
  const { slug, lectureId } = await params;
  const { subject, lecture } = await getSubjectAndLecture(slug, lectureId);

  const num = Number(lectureId);
  const resolvedDbId = lecture ? String(lecture.id) : lectureId;
  const resolvedLectureNumber = lecture ? lecture.number : (isNaN(num) ? 1 : num);

  return (
    <div>
      <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-emerald-400">Home</Link>
        <span>/</span>
        <Link href={`/subjects/${slug}`} className="hover:text-emerald-400 uppercase">{slug}</Link>
        <span>/</span>
        <span className="text-slate-300">
          Lecture {resolvedLectureNumber} Short Q&amp;A Review
        </span>
      </div>
      <ReviewClient
        lectureId={resolvedDbId}
        lectureNumber={resolvedLectureNumber}
        lectureTitle={lecture?.title}
        subjectSlug={slug}
        subjectCode={subject.code}
      />
    </div>
  );
}
