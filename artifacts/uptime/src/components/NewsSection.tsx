import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, RefreshCw, AlertTriangle, Calendar, Globe, Rss, ShieldAlert } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  date: string;
  source: string;
}

const SOURCE_COLOR: Record<string, string> = {
  "البوابة التقنية": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "عالم التقنية":   "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

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

function SkeletonRow() {
  return (
    <div className="flex gap-4 p-5 bg-card border border-border rounded-2xl animate-pulse">
      <div className="flex flex-col gap-2 w-28 flex-shrink-0">
        <div className="h-5 w-24 bg-muted rounded-full" />
        <div className="h-3 w-20 bg-muted rounded-full" />
        <div className="h-3 w-16 bg-muted rounded-full mt-auto" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-5 w-full bg-muted rounded-md" />
        <div className="h-5 w-5/6 bg-muted rounded-md" />
        <div className="h-3 w-full bg-muted rounded-md mt-2" />
        <div className="h-3 w-4/5 bg-muted rounded-md" />
      </div>
    </div>
  );
}

export function NewsSection() {
  const { dir, lang } = useLanguage();
  const isRtl = dir === "rtl";

  const [items, setItems]           = useState<NewsItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
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
    <section id="news" className="py-16 px-4 border-t border-border" dir={dir}>
      <div className="container mx-auto max-w-4xl">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
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
            {/* Sources legend */}
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              {["البوابة التقنية", "عالم التقنية"].map((src) => (
                <span
                  key={src}
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${SOURCE_COLOR[src] ?? "bg-muted text-muted-foreground border-border"}`}
                >
                  {src}
                </span>
              ))}
            </div>

            {/* Last fetched + Refresh */}
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
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* ── News list (vertical, full-width) ── */}
        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <article
                key={i}
                className="group bg-card border border-border rounded-2xl hover:border-foreground/20 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 overflow-hidden"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <div className={`flex gap-0 h-full ${isRtl ? "flex-row-reverse" : "flex-row"}`}>

                  {/* ── Meta column (source · date · link) ── */}
                  <div
                    className={`
                      flex flex-col gap-2 px-4 py-4 w-[140px] flex-shrink-0
                      border-border/60 bg-muted/20
                      ${isRtl ? "border-l items-end text-right" : "border-r items-start text-left"}
                    `}
                  >
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-semibold leading-tight text-center ${SOURCE_COLOR[item.source] ?? "bg-muted text-muted-foreground border-border"}`}
                    >
                      {item.source}
                    </span>

                    <span className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="leading-tight">{formatDate(item.date, lang)}</span>
                    </span>

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/70 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {isRtl ? "اقرأ" : "Read"}
                    </a>
                  </div>

                  {/* ── Content column (title · description) ── */}
                  <div className="flex-1 px-5 py-4 flex flex-col gap-2 min-w-0">
                    <h3
                      className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

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
