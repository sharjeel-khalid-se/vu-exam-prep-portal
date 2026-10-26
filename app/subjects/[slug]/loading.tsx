export default function SubjectLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-6">
        <div className="h-3 w-10 bg-slate-200 rounded" />
        <div className="h-3 w-3 bg-slate-200 rounded" />
        <div className="h-3 w-14 bg-slate-300 rounded" />
      </div>
      {/* Banner */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-slate-900/10 rounded" />
          <div className="h-3 w-32 bg-slate-200 rounded" />
        </div>
        <div className="h-9 w-2/3 bg-slate-200 rounded-lg" />
        <div className="h-4 w-full max-w-3xl bg-slate-100 rounded" />
      </div>
      {/* Exam cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="h-5 w-24 bg-slate-200 rounded" />
            <div className="h-4 w-40 bg-slate-100 rounded" />
            <div className="h-9 w-full bg-slate-900/10 rounded-lg" />
          </div>
        ))}
      </div>
      {/* Lecture rows skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-200 rounded-full" />
              <div className="space-y-1.5">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-16 bg-slate-100 rounded" />
              <div className="h-7 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
