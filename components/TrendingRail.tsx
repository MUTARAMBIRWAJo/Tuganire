import { ArticleCard } from '@/components/article-card';

export default function TrendingRail({ items }: { items: Array<{ id: string; slug: string; title: string; featured_image: string | null; category_slug: string; category_name: string; views_count?: number | null; author?: { display_name?: string; avatar_url?: string } | null; author_display_name?: string | null; author_avatar_url?: string | null; published_at?: string | null }> }) {
  if (!items?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">Trending</h2>
        <a href="/articles?sort=views_desc" className="text-sm text-blue-600 hover:underline">View all trending</a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((a) => {
          const img = (a as any).featured_image || (a as any).image_url || (a as any).cover_image || (a as any).image || null;
          if (!img) {
            console.warn('[TrendingRail] Missing image for item', { id: (a as any).id, slug: (a as any).slug, title: (a as any).title });
          }
          return (
          <div key={a.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
            <ArticleCard
              compact
              article={{
                id: a.id as any,
                slug: a.slug,
                title: a.title,
                excerpt: '',
                featured_image: img,
                published_at: (a as any).published_at ?? null,
                views_count: a.views_count ?? 0,
                author: (a as any).author ?? ((a as any).author_display_name ? { display_name: (a as any).author_display_name, avatar_url: (a as any).author_avatar_url } : undefined),
                category: { name: a.category_name, slug: a.category_slug } as any,
              } as any}
            />
          </div>
          )
        })}
      </div>
    </section>
  );
}


