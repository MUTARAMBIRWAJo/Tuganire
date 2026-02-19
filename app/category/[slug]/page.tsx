import { createClient } from '@supabase/supabase-js';
import ArticlesList from '@/components/ArticlesList';
import AdSenseFluid from '@/components/AdSenseFluid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb = createClient(supabaseUrl, anonKey);

export const revalidate = 120;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { data: cat } = await sb.from('categories').select('id, name, slug').eq('slug', params.slug).maybeSingle();

  return (
    <main className="space-y-6 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold">{cat?.name ?? 'Category'}</h1>
      </div>
      
      {/* First Ad - After Category Header */}
      <div className="mx-auto max-w-7xl px-4">
        <AdSenseFluid adSlot="5121245254" />
      </div>
      
      <ArticlesList initialFilters={{ category: params.slug }} />
      
      {/* Second Ad - After Articles List */}
      <div className="mx-auto max-w-7xl px-4">
        <AdSenseFluid adSlot="5121245254" />
      </div>
    </main>
  );
}


