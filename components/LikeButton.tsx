"use client"

import { useEffect, useState, useTransition } from "react"
import { Heart } from "lucide-react"

interface LikeButtonProps {
  slug: string
  initialCount?: number
}

export function LikeButton({ slug, initialCount = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let canceled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/public/articles/${encodeURIComponent(slug)}/like`, {
          method: "GET",
        })
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        if (!data || canceled) return
        if (typeof data.likes_count === "number") {
          setCount(data.likes_count)
        }
        if (typeof data.liked === "boolean") {
          setLiked(data.liked)
        }
      } catch {
        // ignore
      }
    })()
    return () => {
      canceled = true
    }
  }, [slug])

  const toggle = () => {
    if (isPending) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/public/articles/${encodeURIComponent(slug)}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle" }),
        })
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        if (!data) return
        setLiked(!!data.liked)
        if (typeof data.likes_count === "number") {
          setCount(data.likes_count)
        }
      } catch {
        // ignore
      }
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={liked}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs sm:text-sm border transition-colors ${
        liked
          ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-300"
          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      <Heart
        className={liked ? "fill-rose-500 text-rose-500 h-3 w-3 sm:h-4 sm:w-4" : "h-3 w-3 sm:h-4 sm:w-4"}
      />
      <span className="tabular-nums">{count}</span>
    </button>
  )
}
