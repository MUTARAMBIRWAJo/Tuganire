"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Loader2 } from "lucide-react"
import { formatDateUTC } from "@/lib/format"

export type ReporterRecentItem = {
  id: string
  title: string
  status: string
  created_at: string
  category?: { name?: string } | null
}

export function ReporterRecentList({ items }: { items: ReporterRecentItem[] }) {
  const router = useRouter()
  const [navigatingId, setNavigatingId] = useState<string>("")

  if (!items?.length) return null

  // Deterministic date formatter (shared util)
  const formatDate = (iso: string) => formatDateUTC(iso, "en-GB")

  return (
    <div className="space-y-4">
      {items.map((article) => {
        const cat = Array.isArray(article.category) ? (article.category as any[])[0] : (article.category as any)
        const isPublished = String(article.status).toLowerCase() === "published"
        return (
          <div key={article.id} className="flex items-center justify-between border-b pb-4 last:border-0">
            <div className="flex-1">
              <h3 className="font-medium">{article.title}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                <span>{cat?.name || "Uncategorized"}</span>
                <span>•</span>
                <span suppressHydrationWarning>{formatDate(article.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isPublished
                    ? "bg-green-100 text-green-700"
                    : String(article.status).toLowerCase() === "pending"
                    ? "bg-blue-100 text-blue-700"
                    : String(article.status).toLowerCase() === "draft"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {article.status}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNavigatingId(article.id)
                  router.push(`/dashboard/reporter/articles/${article.id}/edit`)
                }}
                disabled={navigatingId === article.id}
              >
                {navigatingId === article.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Edit
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
              {!isPublished && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNavigatingId(article.id)
                    router.push(`/dashboard/reporter/articles/${article.id}/edit`)
                  }}
                  disabled={navigatingId === article.id}
                >
                  {navigatingId === article.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Modify
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Modify
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
