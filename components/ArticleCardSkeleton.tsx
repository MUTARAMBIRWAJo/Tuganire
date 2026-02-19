export default function ArticleCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="animate-pulse bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
        <div className="p-3 space-y-2">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="flex items-center justify-between pt-1">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="animate-pulse bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-6 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-10/12 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  )
}
