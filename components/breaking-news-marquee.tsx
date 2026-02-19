"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import { supabase } from "@/lib/supabaseClient"

const fetcher = async () => {
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, is_breaking")
    .eq("status", "published")
    .eq("is_breaking", true)
    .order("published_at", { ascending: false })
    .limit(5)
  
  if (error) throw error
  return data || []
}

export function BreakingNewsMarquee() {
  const { data: breakingNews, error } = useSWR("breaking-news", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  if (error || !breakingNews || breakingNews.length === 0) {
    return null
  }

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden relative">
      <div className="flex items-center gap-4 animate-scroll">
        <div className="flex items-center gap-2 shrink-0 px-4">
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <span className="font-bold text-sm uppercase tracking-wider">Breaking News</span>
        </div>
        <div className="flex gap-8 shrink-0">
          {breakingNews.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="hover:underline whitespace-nowrap text-sm font-medium"
            >
              {article.title}
            </Link>
          ))}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex gap-8 shrink-0">
          {breakingNews.map((article) => (
            <Link
              key={`dup-${article.id}`}
              href={`/articles/${article.slug}`}
              className="hover:underline whitespace-nowrap text-sm font-medium"
            >
              {article.title}
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  )
}

