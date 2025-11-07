import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"
import BreakingNewsMarquee from "@/components/BreakingNewsMarquee"
import FeaturedHero from "@/components/FeaturedHero"
import TrendingRail from "@/components/TrendingRail"
import CategoryRows from "@/components/CategoryRows"
import { getBreaking, getFeaturedHero, getTrending, getLatestByCategoryRows } from "@/lib/homeQueries"
import HomeLatestGrid from "@/components/HomeLatestGrid"

export const revalidate = 120 // Revalidate every 2 minutes

export const metadata: Metadata = {
  title: "Tuganire News - Latest Breaking News, Stories & Analysis",
  description: "Stay informed with the latest breaking news, in-depth analysis, and exclusive stories from Tuganire News. Your trusted source for world news, politics, technology, sports, and culture.",
  keywords: ["news", "breaking news", "latest news", "world news", "politics", "technology", "sports", "culture"],
  openGraph: {
    title: "Tuganire News - Latest Breaking News & Stories",
    description: "Stay informed with the latest breaking news, in-depth analysis, and exclusive stories.",
    type: "website",
    locale: "en_US",
    siteName: "Tuganire News",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuganire News - Latest Breaking News",
    description: "Stay informed with the latest breaking news and stories.",
  },
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
}

export default async function HomePage() {
  const [breaking, hero, trending, rows] = await Promise.all([
    getBreaking(12),
    getFeaturedHero(),
    getTrending(12),
    getLatestByCategoryRows()
  ])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <BreakingNewsMarquee
        sticky
        top={0}
        labelSingle="Breaking News"
        labelAll="Headlines"
        tickerIntervalMs={4000}
        marqueeSpeedMs={26000}
        className="mb-2"
        items={(breaking as any[]).map((b: any) => ({
          slug: b.slug,
          title: b.title,
          category_slug: b.category_slug,
          category_name: b.category_name,
        }))}
      />

      {/* Site Header */}
      <SiteHeader />

      <main className="max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8 space-y-6 md:space-y-8">
        <FeaturedHero item={hero as any} />
        <TrendingRail items={trending as any} />
        <CategoryRows rows={rows as any} />
        <HomeLatestGrid title="Latest" />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
