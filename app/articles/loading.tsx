export default function LoadingArticles() {
  return (
    <main className="space-y-6 md:space-y-8 pb-16 max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8">
      <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/3] w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-5 w-5/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        ))}
      </div>
    </main>
  )
}
