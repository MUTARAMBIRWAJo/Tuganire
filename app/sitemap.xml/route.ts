import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

const sb = createClient(supabaseUrl, anonKey);

export async function GET() {
  const [{ data: articles }, { data: categories }] = await Promise.all([
    sb
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(1000),
    sb.from('categories').select('slug').order('slug')
  ]);

  const pages = [
    { loc: `${siteUrl}/`, lastmod: new Date().toISOString() },
    { loc: `${siteUrl}/articles`, lastmod: new Date().toISOString() }
  ];

  const catUrls = (categories || []).map((c: any) => ({ loc: `${siteUrl}/category/${c.slug}`, lastmod: new Date().toISOString() }));
  const artUrls = (articles || []).map((a: any) => ({ loc: `${siteUrl}/articles/${a.slug}`, lastmod: (a.updated_at || a.published_at || new Date()).toString() }));

  const urls = [...pages, ...catUrls, ...artUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}


