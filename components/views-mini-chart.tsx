"use client"

import { useEffect, useMemo, useState } from "react"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type Point = { date: string; views: number }

type Props = {
  articleId?: string | null
  defaultRange?: "7d" | "30d" | "90d"
  scope?: "admin" | "reporter"
}

export default function ViewsMiniChart({ articleId = null, defaultRange = "30d", scope = "admin" }: Props) {
  const [range, setRange] = useState<"7d"|"30d"|"90d">(defaultRange)
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ range })
        if (articleId) params.set("articleId", articleId)
        const basePath = scope === "reporter" ? "/api/reporter/analytics/views-daily" : "/api/admin/analytics/views-daily"
        const res = await fetch(`${basePath}?${params.toString()}`)
        const data = await res.json()
        setPoints(data.points || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [range, articleId])

  const maxY = useMemo(() => Math.max(10, ...points.map(p => p.views)), [points])
  const pathD = useMemo(() => {
    if (!points.length) return ""
    const w = 400, h = 120
    const stepX = w / Math.max(1, points.length - 1)
    const toX = (i: number) => i * stepX
    const toY = (v: number) => h - (v / maxY) * h
    return points.map((p, i) => `${i===0?"M":"L"}${toX(i)},${toY(p.views)}`).join(" ")
  }, [points, maxY])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>Views</Label>
        <select className="ml-auto border rounded px-2 py-1 text-sm" value={range} onChange={(e)=>setRange(e.target.value as any)}>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
          <option value="90d">90d</option>
        </select>
      </div>
      <div className="border rounded p-3 bg-white">
        {loading ? (
          <div className="text-sm text-slate-600">Loading...</div>
        ) : points.length === 0 ? (
          <div className="text-sm text-slate-600">No data</div>
        ) : (
          <svg viewBox="0 0 400 120" className="w-full h-28">
            <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={2} />
            {/* small circles */}
            {points.map((p,i)=>{
              const w=400,h=120; const stepX=w/Math.max(1,points.length-1)
              const x=i*stepX; const y=h-(p.views/Math.max(10,...points.map(pp=>pp.views)))*h
              return <circle key={p.date} cx={x} cy={y} r={2} fill="#2563eb" />
            })}
          </svg>
        )}
      </div>
    </div>
  )
}
