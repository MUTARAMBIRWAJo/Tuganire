"use client"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ReporterStatsPanel() {
  const { data, error, isLoading } = useSWR("/api/reporter/stats", fetcher, { refreshInterval: 15000 })
  if (isLoading) return <p className="text-sm text-slate-600">Loading stats...</p>
  if (error || !data?.ok) return <p className="text-sm text-red-600">Failed to load stats</p>
  const { total, published, drafts, pending } = data.stats
  return (
    <ul className="text-sm text-slate-700 space-y-1">
      <li>Total: {total}</li>
      <li>Published: {published}</li>
      <li>Pending: {pending}</li>
      <li>Drafts: {drafts}</li>
    </ul>
  )
}
