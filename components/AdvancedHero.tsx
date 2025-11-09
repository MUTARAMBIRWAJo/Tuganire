import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Eye, MessageCircle, ArrowRight } from 'lucide-react'

interface AdvancedHeroProps {
  item?: {
    slug: string
    title: string
    excerpt: string | null
    featured_image: string | null
    published_at: string | null
    views_count?: number | null
    comments_count?: number | null
    categories?: { name: string; slug: string } | null
    authors?: { display_name: string | null; avatar_url: string | null } | null
  } | null
}

export default function AdvancedHero({ item }: AdvancedHeroProps) {
  if (!item) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
        {/* Featured Image - Left Side */}
        <div className="md:col-span-2 relative h-64 md:h-80 overflow-hidden bg-slate-200 dark:bg-slate-700">
          {item.featured_image ? (
            <Image
              src={item.featured_image}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-slate-400">No Image</div>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          
          {/* Category Badge */}
          {item.categories?.name && (
            <Link
              href={`/category/${item.categories.slug}`}
              className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-sm font-semibold text-slate-900 dark:text-white hover:bg-white transition-colors"
            >
              {item.categories.name}
            </Link>
          )}
        </div>

        {/* Content - Right Side */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-3 leading-tight">
              <Link
                href={`/articles/${item.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.title}
              </Link>
            </h1>

            {/* Excerpt */}
            {item.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {item.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
              {item.authors?.display_name && (
                <div className="flex items-center gap-1.5">
                  {item.authors.avatar_url ? (
                    <Image
                      src={item.authors.avatar_url}
                      alt={item.authors.display_name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  <span>{item.authors.display_name}</span>
                </div>
              )}

              {item.published_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(item.published_at)}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>{item.views_count ?? 0}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{item.comments_count ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Read More Button */}
          <Link
            href={`/articles/${item.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors w-fit"
          >
            Read More
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

