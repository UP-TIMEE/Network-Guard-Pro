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

const ACCENT_COLORS = [
  "border-cyan-500",
  "border-blue-500",
  "border-violet-500",
  "border-emerald-500",
  "border-amber-500",
  "border-rose-500",
  "border-indigo-500",
  "border-teal-500",
];

const BADGE_COLORS = [
  "bg-cyan-900/30 text-cyan-400",
  "bg-blue-900/30 text-blue-400",
  "bg-violet-900/30 text-violet-400",
  "bg-emerald-900/30 text-emerald-400",
  "bg-amber-900/30 text-amber-400",
  "bg-rose-900/30 text-rose-400",
  "bg-indigo-900/30 text-indigo-400",
  "bg-teal-900/30 text-teal-400",
];

function hashSource(source: string): number {
  let h = 0;
  for (let i = 0; i < source.length; i++) {
    h = (h * 31 + source.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
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

function SkeletonRow() {
  return (
    <div className="bg-[#1a1a1a] border-r-0 border border-border border-l-4 border-l-muted rounded-lg px-5 py-4 animate-pulse space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-5 w-20 bg-muted rounded-full" />
        <div className="h-4 w-24 bg-muted rounded-full" />
      </div>
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-3 w-full bg-muted rounded" />
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
      const res = await fetch(`${BASE}/api/news?limit=15`, {
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
      <div className="container mx-auto max-w-4xl">

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
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* ── News list — Minimalist Cyber Dashboard ── */}
        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item, i) => {
              const h          = hashSource(item.source);
              const accent     = ACCENT_COLORS[h % ACCENT_COLORS.length];
              const badge      = BADGE_COLORS[h % BADGE_COLORS.length];

              return (
                <article
                  key={i}
                  className={`
                    group bg-[#1a1a1a] border border-border rounded-lg
                    ${isRtl ? "border-r-4 border-l border-l-border" : "border-l-4 border-r border-r-border"} ${accent}
                    px-5 py-4 hover:bg-[#222]
                    transition-colors duration-200
                    animate-in fade-in slide-in-from-bottom-1
                  `}
                  style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
                >
                  {/* Source badge + date */}
                  <div className={`flex items-center gap-2 mb-2 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge}`}>
                      {item.source}
                    </span>
                    <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.date, lang)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  {/* Subtle read link */}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors duration-150 font-medium ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    {isRtl ? "اقرأ التفاصيل" : "Read details"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </article>
              );
            })}
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
