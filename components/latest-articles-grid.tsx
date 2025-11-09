"use client"

import { useState } from "react"
import useSWRInfinite from "swr/infinite"
import { supabase } from "@/lib/supabaseClient"
import { ArticleCard } from "./article-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const PAGE_SIZE = 12

const fetcher = async (url: string) => {
  const [, pageParam] = url.split("?page=")
  const page = parseInt(pageParam || "1", 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      slug,
      title,
      excerpt,
      featured_image,
      views_count,
      published_at,
      category:categories(id, name, slug),
      author:app_users(id, display_name, avatar_url)
    `)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, to)

  if (error) throw error
  
  // Attach comments_count per article
  const withCounts = await Promise.all(
    (data || []).map(async (a: any) => {
      if (!a?.slug) return { ...a, comments_count: 0 }
      try {
        const { count } = await supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("article_slug", a.slug)
          .eq("status", "approved")
        return { ...a, comments_count: count ?? 0 }
      } catch {
        return { ...a, comments_count: 0 }
      }
    })
  )
  
  return withCounts || []
}

export function LatestArticlesGrid() {
  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite(
    (index) => `/articles?page=${index + 1}`,
    fetcher,
    {
      revalidateFirstPage: false,
    }
  )

  const articles = data ? data.flat() : []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE)

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load articles. Please try again later.</p>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No articles found.</p>
      </div>
    )
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Latest Articles</h2>
            <p className="text-gray-600 dark:text-gray-400">Stay informed with the latest news and updates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {articles.map((article: any) => {
            const author = Array.isArray(article.author) ? article.author[0] : article.author
            const category = Array.isArray(article.category) ? article.category[0] : article.category
            return (
              <ArticleCard
                key={article.id}
                article={{
                  ...article,
                  author: author || undefined,
                  category: category || undefined,
                }}
              />
            )
          })}
        </div>

        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {!isReachingEnd && (
          <div className="flex justify-center">
            <Button
              onClick={() => setSize(size + 1)}
              disabled={isLoadingMore || isValidating}
              size="lg"
              variant="outline"
            >
              {isLoadingMore || isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Articles"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

