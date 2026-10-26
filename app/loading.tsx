export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 animate-pulse">
      {/* Hero skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="h-6 w-40 bg-slate-200 rounded-full" />
          <div className="h-12 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-5 w-full max-w-2xl bg-slate-100 rounded" />
          <div className="h-5 w-2/3 bg-slate-100 rounded" />
        </div>
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div className="h-10 w-24 bg-slate-200 rounded" />
          <div className="h-10 w-24 bg-slate-200 rounded" />
          <div className="h-10 w-24 bg-slate-200 rounded" />
        </div>
      </div>
      {/* Search skeleton */}
      <div className="mb-10 max-w-xl">
        <div className="h-4 w-40 bg-slate-200 rounded mb-2" />
        <div className="h-10 w-full bg-slate-100 rounded-lg border border-slate-200" />
      </div>
      {/* Course cards skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="h-5 w-16 bg-slate-900/10 rounded" />
            <div className="h-6 w-3/4 bg-slate-200 rounded" />
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-2/3 bg-slate-100 rounded" />
            </div>
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="h-9 w-full bg-slate-900/10 rounded-lg" />
              <div className="flex gap-2">
                <div className="h-8 flex-1 bg-slate-100 rounded-lg" />
                <div className="h-8 flex-1 bg-slate-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
