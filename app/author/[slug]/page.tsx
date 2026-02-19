import { createClient } from '@supabase/supabase-js';
import ArticlesList from '@/components/ArticlesList';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb = createClient(supabaseUrl, anonKey);

export const revalidate = 120;

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  // Author id is UUID. Support /author/[id]
  const { data: author } = await sb
    .from('app_users')
    .select('id, display_name, avatar_url')
    .eq('id', params.slug)
    .maybeSingle();

  return (
    <main className="space-y-6 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold">{author?.display_name ?? 'Author'}</h1>
      </div>
      <ArticlesList initialFilters={{ author: author?.id ?? params.slug }} />
    </main>
  );
}


