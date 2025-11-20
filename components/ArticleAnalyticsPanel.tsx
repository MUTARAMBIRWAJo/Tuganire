"use client";

import { useEffect, useState } from "react";

type AnalyticsResponse = {
  topArticles: { article_id: string; slug: string | null; title: string | null; view_count: number }[];
  uniqueVisitorsPerDay: { day: string; unique_visitors: number }[];
  avgReadTimePerArticle: {
    article_id: string;
    slug: string | null;
    title: string | null;
    avg_read_time_seconds: number;
    view_count: number;
  }[];
  browsers: { browser: string; views: number }[];
  devices: { device_type: string; views: number }[];
  trafficByHour: { hour: number; views: number }[];
};

export function ArticleAnalyticsPanel() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  async function loadAnalytics(range?: { from?: string; to?: string }) {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (range?.from) params.set("from", range.from);
      if (range?.to) params.set("to", range.to);

      const qs = params.toString();
      const url = qs ? `/api/admin/article-analytics?${qs}` : "/api/admin/article-analytics";

      const res = await fetch(url);
      if (!res.ok) {
        setError("Failed to load analytics");
        setData(null);
        return;
      }
      const json = await res.json();
      setData(json as AnalyticsResponse);
    } catch (e) {
      setError("Failed to load analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) return <div>Loading analytics5</div>;
  if (error) return <div>{error}</div>;
  if (!data) return <div>No analytics data</div>;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => loadAnalytics({ from: from || undefined, to: to || undefined })}
          className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground"
        >
          Apply
        </button>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Top Articles (by views)</h2>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
          {data.topArticles.map((a) => (
            <li key={a.article_id}>
              <span className="font-semibold mr-2">{a.title ?? "Untitled"}</span>
              <span className="text-xs text-muted-foreground mr-2">
                ({a.slug ?? a.article_id})
              </span>
              <span>{a.view_count} views</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Unique Visitors Per Day</h2>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
          {data.uniqueVisitorsPerDay.map((d) => (
            <li key={d.day}>
              {d.day}: {d.unique_visitors} visitors
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Average Read Time Per Article</h2>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
          {data.avgReadTimePerArticle.map((a) => (
            <li key={a.article_id}>
              <span className="font-semibold mr-2">{a.title ?? "Untitled"}</span>
              <span className="text-xs text-muted-foreground mr-2">
                ({a.slug ?? a.article_id})
              </span>
              <span>
                {a.avg_read_time_seconds.toFixed(1)}s avg ({a.view_count} views)
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Browsers</h2>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
          {data.browsers.map((b) => (
            <li key={b.browser}>
              {b.browser}: {b.views} views
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Devices</h2>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
          {data.devices.map((d) => (
            <li key={d.device_type}>
              {d.device_type}: {d.views} views
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Traffic By Hour (UTC)</h2>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
          {data.trafficByHour.map((h) => (
            <li key={h.hour}>
              {h.hour}:00 - {h.views} views
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
