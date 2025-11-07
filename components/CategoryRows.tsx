import Link from 'next/link';
import { ArticleCard } from '@/components/article-card';

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
};

export default function CategoryRows({ rows, categoryOrder }: { rows: Row[]; categoryOrder?: string[] }) {
  if (!rows?.length) return null;

  const grouped = rows.reduce<Record<string, Row[]>>((acc, r) => {
    const key = r.category_slug ?? 'uncategorized';
    acc[key] ||= [];
    acc[key].push(r);
    return acc;
  }, {});

  const keys = categoryOrder?.length ? categoryOrder.filter((k) => grouped[k]) : Object.keys(grouped);

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="space-y-10">
        {keys.map((slug) => {
          const articles = grouped[slug]!.slice(0, 4);
          const categoryName = articles[0]?.category_name ?? 'Uncategorized';
          return (
            <div key={slug}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold">{categoryName}</h2>
                <Link href={`/category/${slug}`} className="text-sm text-blue-600 hover:underline">
                  Read more
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {articles.map((a) => (
                  <ArticleCard
                    key={a.id}
                    compact
                    article={{
                      id: a.id as any,
                      slug: a.slug as any,
                      title: a.title,
                      excerpt: a.excerpt || '',
                      featured_image: a.featured_image,
                      published_at: a.published_at,
                      views_count: 0,
                      author: a.author_display_name ? { display_name: a.author_display_name, avatar_url: a.author_avatar_url } as any : undefined,
                      category: a.category_slug ? { name: a.category_name || 'Category', slug: a.category_slug } as any : undefined,
                    } as any}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


