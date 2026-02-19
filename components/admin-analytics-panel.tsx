"use client"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function AdminAnalyticsPanel() {
  const { data, error, isLoading } = useSWR("/api/admin/analytics", fetcher, { refreshInterval: 15000 })
  if (isLoading) return <p className="text-sm text-slate-600">Loading analytics...</p>
  if (error || !data?.ok) return <p className="text-sm text-red-600">Failed to load analytics</p>
  const { metrics } = data
  return (
    <ul className="text-sm text-slate-700 space-y-1">
      <li>Articles: {metrics.articles}</li>
      <li>Published: {metrics.published}</li>
      <li>Pending: {metrics.pending}</li>
      <li>Draft: {metrics.draft}</li>
      <li>Reporters: {metrics.reporters}</li>
      <li>Comments: {metrics.comments}</li>
    </ul>
  )
}
