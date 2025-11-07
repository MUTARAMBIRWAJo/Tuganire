"use client";
import { useState, useMemo } from 'react';
import ArticlesList from '@/components/ArticlesList';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const filters = useMemo(() => ({ q, sort: 'published_at_desc' }), [q]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />
      <main className="space-y-6 pb-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-4 text-2xl font-bold">Search</h1>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to search…"
            className="w-full max-w-xl rounded border px-3 py-2"
          />
        </div>

        <ArticlesList initialFilters={filters} />
      </main>
      <SiteFooter />
    </div>
  );
}


