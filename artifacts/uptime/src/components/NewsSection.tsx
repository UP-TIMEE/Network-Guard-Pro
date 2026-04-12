import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, RefreshCw, AlertTriangle, Calendar, Globe, Rss } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  date: string;
  source: string;
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-24 bg-muted rounded-full" />
        <div className="h-3 w-16 bg-muted rounded-full" />
      </div>
      <div className="h-5 w-full bg-muted rounded-md" />
      <div className="h-5 w-3/4 bg-muted rounded-md" />
      <div className="h-3 w-full bg-muted rounded-md" />
      <div className="h-3 w-5/6 bg-muted rounded-md" />
      <div className="h-8 w-28 bg-muted rounded-lg" />
    </div>
  );
}

function formatDate(iso: string, lang: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

const SOURCE_COLOR: Record<string, string> = {
  "البوابة التقنية": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "عرب هاردوير":    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export function NewsSection() {
  const { dir, lang, t } = useLanguage();
  const isRtl = dir === "rtl";
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${BASE}/api/news?limit=6`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json() as { items: NewsItem[] };
      setItems(data.items ?? []);
      setLastFetched(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <section id="news" className="py-16 px-4 border-t border-border" dir={dir}>
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rss className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black text-foreground">
                {isRtl ? "آخر المستجدات" : "Latest Updates"}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              {isRtl
                ? "أحدث الأخبار والتقارير من مصادر الأمن السيبراني العالمية"
                : "Latest news and reports from global cybersecurity sources"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastFetched && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {isRtl ? "آخر تحديث: " : "Updated: "}
                {formatDate(lastFetched.toISOString(), lang)}
              </span>
            )}
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
              title={isRtl ? "تحديث" : "Refresh"}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {isRtl ? "تحديث" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Source badges */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {isRtl ? "المصادر:" : "Sources:"}
          </span>
          {["البوابة التقنية", "عرب هاردوير"].map((src) => (
            <span
              key={src}
              className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${SOURCE_COLOR[src] ?? "bg-muted text-muted-foreground border-border"}`}
            >
              {src}
            </span>
          ))}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">
                {isRtl ? "تعذّر جلب الأخبار" : "Failed to load news"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRtl ? "تحقق من اتصالك بالإنترنت وحاول مجدداً" : "Check your connection and try again"}
              </p>
            </div>
            <button
              onClick={fetchNews}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {isRtl ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* News cards */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <article
                key={i}
                className="group bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-foreground/20 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Source + Date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${SOURCE_COLOR[item.source] ?? "bg-muted text-muted-foreground border-border"}`}
                  >
                    {item.source}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    {formatDate(item.date, lang)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                {item.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {item.description}
                  </p>
                )}

                {/* Read more link */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors mt-auto pt-2 border-t border-border/50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {isRtl ? "اقرأ المزيد" : "Read More"}
                </a>
              </article>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Rss className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>{isRtl ? "لا توجد أخبار حالياً" : "No news available right now"}</p>
          </div>
        )}
      </div>
    </section>
  );
}
