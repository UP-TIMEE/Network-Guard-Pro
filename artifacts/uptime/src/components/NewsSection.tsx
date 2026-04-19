import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, RefreshCw, AlertTriangle, Calendar, Rss, ShieldAlert } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  date: string;
  source: string;
}

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function SkeletonCard() {
  return (
    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-6 w-24 bg-white/10 rounded-full" />
        <div className="h-4 w-28 bg-white/10 rounded-full" />
      </div>
      <div className="h-4 w-full bg-white/10 rounded" />
      <div className="h-4 w-5/6 bg-white/10 rounded" />
      <div className="h-3 w-full bg-white/5 rounded" />
      <div className="h-3 w-4/5 bg-white/5 rounded" />
      <div className="h-8 w-28 bg-white/10 rounded-md mt-1" />
    </div>
  );
}

export function NewsSection() {
  const { dir, lang } = useLanguage();
  const isRtl = dir === "rtl";

  const [items, setItems]             = useState<NewsItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${BASE}/api/news?limit=16`, {
        signal: AbortSignal.timeout(20000),
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

  useEffect(() => { fetchNews(); }, []);

  return (
    <section id="news" className="py-14 px-4 border-t border-border" dir={dir}>
      <div className="container mx-auto max-w-5xl">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-black text-foreground">
                {isRtl ? "آخر المستجدات الأمنية" : "Latest Security Updates"}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              {isRtl
                ? "أحدث أخبار الأمن السيبراني من مصادر عربية موثوقة"
                : "Latest cybersecurity news from trusted Arabic sources"}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-red-500/10 text-red-400 border-red-500/20 font-medium">
              <Rss className="h-3 w-3" />
              Google News
            </span>
            <div className="flex items-center gap-2">
              {lastFetched && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(lastFetched.toISOString(), lang)}
                </span>
              )}
              <button
                onClick={fetchNews}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                {isRtl ? "تحديث" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Error state ── */}
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

        {/* ── Skeleton list ── */}
        {loading && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── News list — Classic Colored UI ── */}
        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {items.map((item, i) => (
              <article
                key={i}
                className="group flex flex-col bg-[#1e1e1e] border border-white/5 rounded-xl p-5
                           hover:-translate-y-0.5 hover:border-white/15 hover:shadow-lg
                           transition-all duration-200 animate-in fade-in slide-in-from-bottom-1"
                style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
              >
                {/* Source badge + date */}
                <div className={`flex items-center gap-2 mb-3 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {item.source}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.date, lang)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-4">
                  {item.description}
                </p>

                {/* CTA button */}
                <div className={`${isRtl ? "text-right" : "text-left"}`}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                               text-white text-xs font-bold px-4 py-2 rounded-md
                               transition-colors duration-200 ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {isRtl ? "اقرأ المقال" : "Read Article"}
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Rss className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {isRtl ? "لا توجد أخبار أمنية متاحة حالياً" : "No security news available right now"}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
