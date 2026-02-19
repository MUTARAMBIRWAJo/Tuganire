"use client"

import React from "react"

type MetricItem = {
  slug: string
  title: string
  views: number
  likes: number
  comments: number
}

interface ReporterArticleMetricsChartsProps {
  items: MetricItem[]
}

function MetricColumn({ title, metricKey, items }: { title: string; metricKey: "views" | "likes" | "comments"; items: MetricItem[] }) {
  const max = Math.max(1, ...items.map((i) => i[metricKey]))

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <div className="space-y-2 text-xs">
        {items.length === 0 ? (
          <p className="text-slate-500">No data yet.</p>
        ) : (
          items.map((item) => {
            const value = item[metricKey]
            const pct = Math.max(5, Math.round((value / max) * 100))
            return (
              <div key={item.slug} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-medium text-slate-800 dark:text-slate-100" title={item.title}>
                    {item.title}
                  </div>
                  <span className="tabular-nums text-slate-600 dark:text-slate-300">{value}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 dark:bg-orange-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function ReporterArticleMetricsCharts({ items }: ReporterArticleMetricsChartsProps) {
  const topByViews = [...items].sort((a, b) => b.views - a.views).slice(0, 5)
  const topByLikes = [...items].sort((a, b) => b.likes - a.likes).slice(0, 5)
  const topByComments = [...items].sort((a, b) => b.comments - a.comments).slice(0, 5)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <MetricColumn title="Top by Views" metricKey="views" items={topByViews} />
      <MetricColumn title="Top by Likes" metricKey="likes" items={topByLikes} />
      <MetricColumn title="Top by Comments" metricKey="comments" items={topByComments} />
    </div>
  )
}
