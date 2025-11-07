import ArticlesList from '@/components/ArticlesList';

export const revalidate = 120;

export default async function TagPage({ params }: { params: { slug: string } }) {
  return (
    <main className="space-y-6 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold">Tag: {params.slug}</h1>
      </div>
      <ArticlesList initialFilters={{ tag: params.slug }} />
    </main>
  );
}


