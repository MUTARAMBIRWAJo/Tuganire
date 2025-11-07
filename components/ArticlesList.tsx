"use client";
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import ArticleCardSkeleton from '@/components/ArticleCardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Filters = {
  category?: string;
  tag?: string;
  author?: string;
  q?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  if (typeof filters.page === 'number') params.set('page', String(filters.page));
  if (typeof filters.pageSize === 'number') params.set('pageSize', String(filters.pageSize));
  if (filters.category) params.set('category', filters.category);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.author) params.set('author', filters.author);
  if (filters.q) params.set('q', filters.q);
  if (filters.sort) params.set('sort', filters.sort);
  return params.toString();
}

export default function ArticlesList({ initialFilters, pageSize = 12, infinite = true }: { initialFilters?: Filters; pageSize?: number; infinite?: boolean }) {
  const controlled = typeof initialFilters?.page === 'number' && typeof initialFilters?.pageSize === 'number';

  // Controlled single-page mode (respects page & pageSize from parent)
  const singleKey = useMemo(() => {
    if (!controlled) return null;
    const qs = buildQuery({ ...initialFilters! });
    return `/api/public/articles?${qs}`;
  }, [controlled, initialFilters]);

  const { data: singleData, isLoading: singleLoading, error: singleError } = useSWR(controlled ? singleKey : null, fetcher, { revalidateOnFocus: false });

  // Infinite mode (fallback)
  const getKey = (pageIndex: number, prev: any) => {
    if (controlled) return null; // disabled
    if (prev && prev.items && prev.items.length === 0) return null;
    const qs = buildQuery({ ...initialFilters, page: pageIndex, pageSize });
    return `/api/public/articles?${qs}`;
  };
  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, { revalidateOnFocus: false });

  const items = controlled
    ? ((singleData?.items ?? []) as Array<any>)
    : (((data?.flatMap((d) => d?.items ?? []) ?? []) as Array<any>).filter(Boolean));
  const total = controlled ? (singleData?.total ?? 0) : (data?.[0]?.total ?? 0);
  const isLoading = controlled ? singleLoading : (isValidating && (data?.length ?? 0) === 0);
  const isLoadingMore = !controlled && isValidating && size > 0;
  const isEnd = controlled ? items.length >= total : items.length >= total;

  // Infinite scroll with sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (controlled || !infinite) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && !isLoadingMore && !isEnd) {
        setSize((s) => s + 1);
      }
    }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [controlled, infinite, isLoadingMore, isEnd, setSize]);

  if ((controlled && singleError) || (!controlled && error)) return <div className="px-4">Failed to load.</div>;

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-3 text-sm text-neutral-600">{total ? `${items.length} of ${total}` : null}</div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: pageSize }).map((_, i) => <ArticleCardSkeleton key={i} />)
          : items.map((a, idx) => (
              <Link key={a?.id ?? idx} href={a?.slug ? `/articles/${a.slug}` : '#'} className="group">
                <div className="relative h-48 w-full overflow-hidden rounded bg-neutral-200">
                  {a?.featured_image ? (
                    <Image src={a.featured_image} alt={a?.title ?? ''} fill className="object-cover transition-transform group-hover:scale-[1.03]" />
                  ) : null}
                </div>
                <div className="mt-2 text-sm text-neutral-500">{a?.category?.name}</div>
                <h3 className="line-clamp-2 font-semibold">{a?.title ?? ''}</h3>
                {a?.author?.display_name ? (
                  <div className="mt-1 text-sm text-neutral-500">By {a.author.display_name}</div>
                ) : null}
              </Link>
            ))}
      </div>
      {/* Controls */}
      {!controlled && (
        <div className="mt-6 flex flex-col items-center gap-3">
          {!isEnd && !infinite && (
            <button
              type="button"
              onClick={() => setSize(size + 1)}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
          {infinite && <div ref={sentinelRef} className="h-10" />}
          {isEnd && <div className="text-sm text-neutral-500">You reached the end.</div>}
        </div>
      )}
    </section>
  );
}


