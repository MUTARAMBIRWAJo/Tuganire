import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"
import AdvancedHero from "@/components/AdvancedHero"
import BreakingNewsBar from "@/components/BreakingNewsBar"
import TrendingRail from "@/components/TrendingRail"
import CategoryRows from "@/components/CategoryRows"
import { getBreaking, getFeaturedHero, getTrending, getLatestByCategoryRows, getEditorsPicks, getMostPopular, getMostLiked, getMostCommented, getPhotoGallery } from "@/lib/homeQueries"
import HomeLatestGrid from "@/components/HomeLatestGrid"
import EditorsPicksSection from "@/components/EditorsPicksSection"
import MostPopularSection from "@/components/MostPopularSection"
import MostLikedSection from "@/components/MostLikedSection"
import MostCommentedSection from "@/components/MostCommentedSection"
import NewsletterSignup from "@/components/NewsletterSignup"
import PhotoGallery from "@/components/PhotoGallery"
import WeatherWidget from "@/components/WeatherWidget"
import StockTicker from "@/components/StockTicker"
import AdvertisementMarquee from "@/components/AdvertisementMarquee"

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
  const [breaking, hero, trending, rows, editorsPicks, mostPopular, mostLiked, mostCommented, photoGallery] = await Promise.all([
    getBreaking(10),
    getFeaturedHero(),
    getTrending(12),
    getLatestByCategoryRows(),
    getEditorsPicks(6),
    getMostPopular(6, 7), // Last 7 days
    getMostLiked(6),
    getMostCommented(6, 30),
    getPhotoGallery(8)
  ])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <BreakingNewsBar
        items={(breaking as any[]).map((b: any) => ({
          slug: b.slug,
          title: b.title,
        }))}
      />
      {/* Site Header */}
      <SiteHeader />

      <main className="max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8 space-y-6 md:space-y-8">
        <AdvancedHero item={hero as any} />
        <TrendingRail items={trending as any} />
        
        {/* Sidebar widgets row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <EditorsPicksSection items={editorsPicks as any} />
            <CategoryRows rows={rows as any} />
            <MostPopularSection items={mostPopular as any} period="week" />
            <MostLikedSection items={mostLiked as any} />
            <MostCommentedSection items={mostCommented as any} />
            <PhotoGallery items={photoGallery as any} />
            <HomeLatestGrid title="Latest" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <WeatherWidget defaultLocation="Kigali" />
            <StockTicker symbols={["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"]} />
            <AdvertisementMarquee />
          </div>
        </div>
        
        <NewsletterSignup />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
