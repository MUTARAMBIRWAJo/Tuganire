import { createClient } from "@/lib/supabase/server"
import { ArticleCard } from "./article-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface CategoryHighlightsProps {
  categories?: string[]
}

export async function CategoryHighlights({ categories }: CategoryHighlightsProps) {
  const supabase = await createClient()

  // Get top categories if not specified
  let categorySlugs = categories
  if (!categorySlugs || categorySlugs.length === 0) {
    const { data: topCategories } = await supabase
      .from("categories")
      .select("slug")
      .limit(4)
    
    categorySlugs = topCategories?.map((c) => c.slug) || []
  }

  // Fetch articles for each category
  const categoryData = await Promise.all(
    categorySlugs.map(async (slug) => {
      const { data: category } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", slug)
        .single()

      if (!category) return null

      const { data: articles } = await supabase
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
        .eq("category_id", category.id)
        .not("published_at", "is", null)
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .limit(3)

      return {
        category,
        articles: articles || [],
      }
    })
  )

  const validCategories = categoryData.filter((c) => c !== null && c.articles.length > 0)

  if (validCategories.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Category Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {validCategories.map(({ category, articles }: any) => (
            <div key={category.id}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.name}</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/category/${category.slug}`}>
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-4">
                {articles.map((article: any) => {
                  const author = Array.isArray(article.author) ? article.author[0] : article.author
                  const articleCategory = Array.isArray(article.category) ? article.category[0] : article.category
                  return (
                    <ArticleCard
                      key={article.id}
                      article={{
                        ...article,
                        author: author || undefined,
                        category: articleCategory || undefined,
                      }}
                      compact
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

