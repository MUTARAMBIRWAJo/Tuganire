import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sb = createClient(supabaseUrl, anonKey);

export async function getBreaking(limit = 10) {
  let { data, error } = await sb
    .from('v_breaking')
    .select('*')
    .limit(limit);
  if (error) throw error;

  if (!data || data.length === 0) {
    const { data: latest } = await sb
      .from('articles')
      .select(`id, slug, title, excerpt, featured_image, published_at,
        category:category_id ( name, slug )`)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    data = (latest || []).map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      featured_image: a.featured_image,
      published_at: a.published_at,
      category_name: Array.isArray(a.category) ? a.category[0]?.name : a.category?.name,
      category_slug: Array.isArray(a.category) ? a.category[0]?.slug : a.category?.slug,
    }));
  }

  return data ?? [];
}

export async function getFeaturedHero() {
  const { data: initialArticle, error } = await sb
    .from('articles')
    .select('id, slug, title, excerpt, featured_image, published_at, is_featured, is_editor_pick, author_id, category_id')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .or('is_editor_pick.eq.true,is_featured.eq.true')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  let article = initialArticle as any | null;
  if (!article) {
    // fallback to most recent published
    const { data: fallback } = await sb
      .from('articles')
      .select('id, slug, title, excerpt, featured_image, published_at, author_id, category_id')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!fallback) return null;
    article = fallback as any;
  }

  if (!article) return null;

  const [{ data: author }, { data: category }] = await Promise.all([
    article.author_id
      ? sb.from('app_users').select('display_name, avatar_url').eq('id', article.author_id).maybeSingle()
      : Promise.resolve({ data: null } as any),
    article.category_id
      ? sb.from('categories').select('name, slug').eq('id', article.category_id).maybeSingle()
      : Promise.resolve({ data: null } as any)
  ]);

  return {
    ...article,
    categories: category,
    authors: author
  } as any;
}

export async function getTrending(limit = 10) {
  let { data, error } = await sb
    .from('v_trending')
    .select('*')
    .limit(limit);
  if (error) throw error;
  if (!data || data.length === 0) {
    // fallback to latest published
    const { data: latest } = await sb
      .from('articles')
      .select(`id, slug, title, excerpt, featured_image, published_at,
        category:category_id ( name, slug )`)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);
    data = (latest || []).map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      featured_image: a.featured_image,
      published_at: a.published_at,
      views_count: null,
      category_name: Array.isArray(a.category) ? a.category[0]?.name : a.category?.name,
      category_slug: Array.isArray(a.category) ? a.category[0]?.slug : a.category?.slug,
    }));
  }
  return data ?? [];
}

export async function getLatestByCategoryRows() {
  const { data, error } = await sb
    .from('v_latest4_by_category')
    .select('*');
  if (error) throw error;
  return data ?? [];
}

export async function getHomepageCategories(limit = 8) {
  const { data, error } = await sb
    .from('categories')
    .select('id, name, slug')
    .order('name')
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}


