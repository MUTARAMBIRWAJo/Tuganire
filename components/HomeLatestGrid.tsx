"use client"
import { useEffect, useState } from "react"
import { ArticleCard } from "@/components/article-card"
import ArticleCardSkeleton from "@/components/ArticleCardSkeleton"

type Article = any

export default function HomeLatestGrid({ title = "Latest" }: { title?: string }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Article[]>([])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/public/articles?page=0&pageSize=8`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => setItems(json.items || []))
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ArticleCardSkeleton key={i} compact />)
          : items.map((a: any) => (
              <ArticleCard key={a.id} article={{ ...a, author: a.author || undefined, category: a.category || undefined }} compact />
            ))}
      </div>
    </section>
  )
}
