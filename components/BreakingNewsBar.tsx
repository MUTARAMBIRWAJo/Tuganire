import Link from "next/link"

interface BreakingNewsItem {
  slug: string
  title: string
}

interface BreakingNewsBarProps {
  items: BreakingNewsItem[]
}

export default function BreakingNewsBar({ items }: BreakingNewsBarProps) {
  if (!items || items.length === 0) return null

  const joinedTitles = items

  return (
    <section className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center gap-4 p-2 overflow-hidden">
        <div className="bg-white text-blue-600 font-bold px-2 py-1 rounded-sm text-xs md:text-sm uppercase flex-shrink-0">
          Breaking
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="inline-flex whitespace-nowrap animate-marquee text-xs md:text-sm font-medium gap-6">
            {joinedTitles.map((item, idx) => (
              <span key={item.slug + idx} className="inline-flex items-center gap-2">
                <Link href={`/articles/${item.slug}`} className="hover:underline">
                  {item.title}
                </Link>
                {idx < joinedTitles.length - 1 && <span className="opacity-60">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
