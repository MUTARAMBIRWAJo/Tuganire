"use client";
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type BreakingItem = { slug: string; title: string; category_slug: string; category_name: string };

export default function BreakingNewsMarquee({
  items,
  sticky = false,
  top = 0,
  labelSingle = "Breaking",
  labelAll = "All",
  tickerIntervalMs = 4000,
  marqueeSpeedMs = 25000,
  className = "",
  pauseOnHover = true,
}: {
  items: Array<BreakingItem>;
  sticky?: boolean;
  top?: number;
  labelSingle?: string;
  labelAll?: string;
  tickerIntervalMs?: number;
  marqueeSpeedMs?: number;
  className?: string;
  pauseOnHover?: boolean;
}) {
  if (!items?.length) return null;

  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setIdx((i) => (i + 1) % items.length);
    }, tickerIntervalMs);
    return () => clearInterval(id);
  }, [items.length, tickerIntervalMs]);

  const duplicated = useMemo(() => [...items, ...items], [items]);

  const current = items[idx];

  const rootClasses = `${sticky ? 'sticky z-50' : ''} w-full bg-brand-700 text-white border-b border-brand-600/40 ${className}`.trim();

  return (
    <div className={rootClasses} style={sticky ? { top } as React.CSSProperties : undefined}>
      {/* Single-item ticker */}
      <div
        className="mx-auto flex items-center gap-3 px-4 py-2 max-w-7xl"
        onMouseEnter={() => { if (pauseOnHover) pausedRef.current = true; }}
        onMouseLeave={() => { if (pauseOnHover) pausedRef.current = false; }}
      >
        <span className="font-semibold uppercase tracking-wide text-xs sm:text-sm text-brand-100">{labelSingle}</span>
        <div className="relative flex-1" aria-live="polite">
          <div key={current.slug} className="flex items-start animate-ticker-enter">
            <Link href={`/articles/${current.slug}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40">
              <span className="text-sm sm:text-base leading-snug">{current.title}</span>
            </Link>
            <span className="ml-2 text-xs sm:text-sm text-brand-100/80">[{current.category_name}]</span>
          </div>
        </div>
      </div>

      {/* Continuous marquee of all items */}
      <div className="w-full overflow-hidden bg-brand-800/60">
        <div className="mx-auto flex items-center gap-3 px-4 py-2 max-w-7xl">
          <span className="font-semibold uppercase tracking-wide text-xs sm:text-sm text-brand-100">{labelAll}</span>
          <div className="relative flex-1">
            <div className="animate-marquee whitespace-nowrap will-change-transform" style={{ animationDuration: `${marqueeSpeedMs}ms` }}>
              {duplicated.map((a, i) => (
                <span key={`${a.slug}-${i}`} className="mx-6 inline-block">
                  <Link href={`/articles/${a.slug}`} className="hover:underline hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40">
                    {a.title}
                  </Link>
                  <span className="ml-2 text-brand-100/80">[{a.category_name}]</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


