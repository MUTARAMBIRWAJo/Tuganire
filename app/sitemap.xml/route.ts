import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const rawSite = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const siteUrl = rawSite.replace(/\/+$/, '');

const sb = createClient(supabaseUrl, anonKey);

export async function GET() {
  const nowIso = new Date().toISOString();
  const [{ data: articles }, { data: categories }] = await Promise.all([
    sb
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .lte('published_at', nowIso)
      .order('published_at', { ascending: false })
      .limit(2000),
    sb.from('categories').select('slug').order('slug').limit(500)
  ]);

  const pages = [
    { loc: `${siteUrl}/`, lastmod: nowIso, changefreq: 'hourly', priority: '1.0' },
    { loc: `${siteUrl}/articles`, lastmod: nowIso, changefreq: 'hourly', priority: '0.9' }
  ];

  const catUrls = (categories || []).map((c: any) => ({
    loc: `${siteUrl}/category/${c.slug}`,
    lastmod: nowIso,
    changefreq: 'daily',
    priority: '0.7',
  }));
  const artUrls = (articles || []).map((a: any) => ({
    loc: `${siteUrl}/articles/${a.slug}`,
    lastmod: new Date(a.updated_at || a.published_at || nowIso).toISOString(),
    changefreq: 'daily',
    priority: '0.8',
  }));

  const urls = [...pages, ...catUrls, ...artUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u: any) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600'
    }
  });
}


