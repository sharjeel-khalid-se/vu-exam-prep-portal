export default function QuizLoading() {
  return (
    <div className="h-screen w-screen bg-[#0f172a] flex flex-col overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-[#1a1a2e] px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="space-y-1.5">
          <div className="h-3 w-28 bg-slate-600 rounded" />
          <div className="h-4 w-20 bg-slate-500 rounded" />
        </div>
        <div className="w-11 h-11 rounded-full bg-slate-700 border-2 border-slate-600" />
        <div className="w-8 h-8 rounded-full bg-slate-600" />
      </div>
      {/* Purple bar */}
      <div className="bg-[#6d28d9] px-4 py-2.5 flex items-center justify-between">
        <div className="h-4 w-20 bg-purple-500 rounded" />
        <div className="h-4 w-16 bg-purple-500 rounded" />
      </div>
      {/* Question area */}
      <div className="flex-1 flex flex-col">
        <div className="p-5 bg-white space-y-3 border-b-2 border-purple-200">
          <div className="h-5 w-3/4 bg-slate-200 rounded" />
          <div className="h-4 w-1/2 bg-slate-100 rounded" />
        </div>
        <div className="flex-1 bg-slate-100 p-5 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full bg-white rounded-lg border border-slate-200" />
          ))}
        </div>
      </div>
      {/* Bottom bar */}
      <div className="bg-[#1a1a2e] border-t border-slate-700 h-14 px-4 flex items-center justify-between">
        <div className="h-8 w-20 bg-red-900/50 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-purple-900/50 rounded" />
          <div className="h-8 w-16 bg-purple-900/50 rounded" />
        </div>
        <div className="h-8 w-16 bg-teal-900/50 rounded" />
      </div>
    </div>
  );
}
