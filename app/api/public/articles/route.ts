import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side: use service role to bypass RLS safely in this API route
const sb = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(0, Number.isFinite(Number(searchParams.get('page'))) ? parseInt(searchParams.get('page') as string, 10) : 0);
  const pageSizeRaw = Number.isFinite(Number(searchParams.get('pageSize'))) ? parseInt(searchParams.get('pageSize') as string, 10) : 12;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), 50);
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const author = searchParams.get('author');
  const q = searchParams.get('q');
  const sort = searchParams.get('sort') || 'published_at_desc';

  let query = sb
    .from('articles')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views_count,
      category:category_id ( id, name, slug ),
      author:author_id ( id, display_name, avatar_url )
    `, { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .not('published_at', 'is', null);

  // ensure slug exists
  query = query.not('slug', 'is', null).neq('slug', '');

  if (category) {
    // filter by category slug
    const { data: cat } = await sb.from('categories').select('id').eq('slug', category).maybeSingle();
    if (cat?.id) query = query.eq('category_id', cat.id);
  }

  if (author) {
    // author is app_users.id or slug-like id; support exact id for now
    query = query.eq('author_id', author);
  }

  if (tag) {
    // join via article_tags: get article ids first
    const { data: tagRow } = await sb.from('tags').select('id').eq('name', tag).maybeSingle();
    if (tagRow?.id) {
      const { data: articleTags } = await sb.from('article_tags').select('article_id').eq('tag_id', tagRow.id);
      if (articleTags?.length) {
        query = query.in('id', articleTags.map((t) => t.article_id));
      } else {
        return NextResponse.json({ items: [], total: 0 }, { status: 200 });
      }
    }
  }

  if (q) {
    const term = q.replace(/%/g, '').trim();
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,excerpt.ilike.%${term}%`
      );
    }
  }

  switch (sort) {
    case 'views_desc':
      query = query.order('views_count', { ascending: false, nullsFirst: false }).order('published_at', { ascending: false });
      break;
    case 'published_at_asc':
      query = query.order('published_at', { ascending: true });
      break;
    default:
      query = query.order('published_at', { ascending: false });
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const baseItems = (data || []).map((a: any) => ({
    ...a,
    author: Array.isArray(a.author) ? a.author[0] : a.author,
    category: Array.isArray(a.category) ? a.category[0] : a.category,
  }));

  // Attach comments_count per article (small N; acceptable for pageSize <= 50)
  const items = await Promise.all(
    baseItems.map(async (a: any) => {
      try {
        const { count: cCount } = await sb
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('article_slug', a.slug)
          .eq('status', 'approved');
        return { ...a, comments_count: cCount ?? 0 };
      } catch {
        return { ...a, comments_count: 0 };
      }
    })
  );

  return NextResponse.json({ items, total: count ?? 0 }, { status: 200 });
}


