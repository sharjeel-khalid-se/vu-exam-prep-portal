import Link from 'next/link';

interface Subject {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string;
}

async function getSubjects(): Promise<Subject[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/subjects`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return data.subjects ?? [];
  } catch {
    return [];
  }
}

const subjectColors: Record<string, string> = {
  cs403: 'from-blue-600 to-cyan-600',
  default: 'from-emerald-600 to-teal-600',
};

const subjectIcons: Record<string, string> = {
  cs403: '🗄️',
  default: '📘',
};

export default async function HomePage() {
  const subjects = await getSubjects();

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          VU Exam Prep Portal
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Lecture-wise MCQs, Short Questions, Math & Code — sab kuch ek jagah 🚀
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Subjects', value: subjects.length, icon: '📚' },
          { label: 'Lectures', value: subjects.length > 0 ? '1+' : '0', icon: '📖' },
          { label: 'Questions', value: subjects.length > 0 ? '13+' : '0', icon: '❓' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <div className="text-center text-slate-500 py-20">
          <div className="text-5xl mb-4">📭</div>
          <p>Loading subjects... (Server starting up)</p>
          <p className="text-sm mt-2">Refresh karein agar data nazar na aaye.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.slug}`}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${subjectColors[subject.slug] ?? subjectColors.default} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="text-4xl mb-3">{subjectIcons[subject.slug] ?? subjectIcons.default}</div>
              <div className="text-xs font-mono text-emerald-400 mb-1">{subject.code}</div>
              <h2 className="text-lg font-bold text-white mb-2">{subject.name}</h2>
              <p className="text-sm text-slate-400 line-clamp-2">{subject.description}</p>
              <div className="mt-4 text-xs text-slate-500 group-hover:text-emerald-400 transition-colors">
                Start Studying →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
