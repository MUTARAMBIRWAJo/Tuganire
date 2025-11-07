import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

const sb = createClient(supabaseUrl, anonKey);

export async function GET() {
  const { data, error } = await sb
    .from('articles')
    .select('slug,title,excerpt,published_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) return new NextResponse(error.message, { status: 500 });

  const items = data ?? [];
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tuganire</title>
    <link>${siteUrl}</link>
    <description>Latest news from Tuganire</description>
    ${items
      .map(
        (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteUrl}/articles/${a.slug}</link>
      <guid>${siteUrl}/articles/${a.slug}</guid>
      <pubDate>${a.published_at ? new Date(a.published_at).toUTCString() : ''}</pubDate>
      <description><![CDATA[${a.excerpt ?? ''}]]></description>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
}


