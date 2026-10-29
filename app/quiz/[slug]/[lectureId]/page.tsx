import QuizClient from './QuizClient';
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
      // 1. Try matching by actual lecture number (e.g. number = 13)
      lecture = await queryOne<LectureRow>(
        'SELECT id, number, title FROM lectures WHERE subject_id = ? AND number = ?',
        [safeSubject.id, num]
      );

      // 2. Fallback: if not matched by number, check if it was passed as primary key id (e.g. id = 54)
      if (!lecture) {
        lecture = await queryOne<LectureRow>(
          'SELECT id, number, title FROM lectures WHERE subject_id = ? AND id = ?',
          [safeSubject.id, num]
        );
      }
    }

    // 3. Fallback: check by id regardless of subject
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

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lectureId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { slug, lectureId } = await params;
  const { type = 'mcq' } = await searchParams;
  const { subject, lecture } = await getSubjectAndLecture(slug, lectureId);

  const num = Number(lectureId);
  const resolvedDbId = lecture ? String(lecture.id) : lectureId;
  const resolvedLectureNumber = lecture ? lecture.number : (isNaN(num) ? 1 : num);
  const resolvedLectureTitle = lecture ? lecture.title : '';

  return (
    <QuizClient
      lectureId={resolvedDbId}
      lectureNumber={resolvedLectureNumber}
      lectureTitle={resolvedLectureTitle}
      subjectSlug={slug}
      typeFilter={type}
      subjectCode={subject.code}
      subjectName={subject.name}
    />
  );
}
