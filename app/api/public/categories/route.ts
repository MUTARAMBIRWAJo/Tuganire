import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

export const revalidate = 300

function normalizeArticle(a: any) {
  if (!a) return null
  const author = (Array.isArray(a.author) ? a.author[0] : a.author) || null
  const category = (Array.isArray(a.category) ? a.category[0] : a.category) || null
  return {
    id: a.id,
    slug: a.slug,
    title: a.title || '',
    excerpt: a.excerpt || '',
    featured_image: a.featured_image || a.image_url || null,
    published_at: a.published_at || a.created_at || null,
    views_count: a.views_count || 0,
    author: author && (author.display_name || author.full_name || author.name) ? author : null,
    category: category && (category.name || category.slug) ? category : (a.category ? { name: String(a.category), slug: String(a.category).toLowerCase().replace(/\s+/g, '-') } : null),
  }
}

export async function GET() {
  // get all categories
  const { data: categories, error } = await sb.from('categories').select('id, name, slug').order('name', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // for each category, fetch up to 4 latest published articles
  const results = [] as any[]
  for (const c of categories || []) {
    const { data: arts } = await sb
      .from('articles')
      .select('id, slug, title, excerpt, featured_image, published_at, views_count, author:app_users(display_name, avatar_url), category:categories(name, slug)')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .eq('category_id', c.id)
      .order('published_at', { ascending: false })
      .limit(4)

    results.push({
      id: c.id,
      name: c.name,
      slug: c.slug,
      articles: (arts || []).map(normalizeArticle),
    })
  }

  return NextResponse.json({ categories: results }, { status: 200 })
}
