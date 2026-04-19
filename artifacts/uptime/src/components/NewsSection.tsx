import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ExternalLink, RefreshCw, AlertTriangle, Calendar,
  Rss, ShieldAlert, Shield, Lock, Wifi, Bug, Eye, Server,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  date: string;
  source: string;
}

/* ── Consistent palettes, hashed by source name ── */
const BADGE_COLORS = [
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
  "bg-cyan-600 text-white",
  "bg-emerald-600 text-white",
  "bg-amber-600 text-white",
  "bg-rose-600 text-white",
  "bg-indigo-600 text-white",
  "bg-teal-600 text-white",
];

const THUMB_GRADIENTS = [
  "from-blue-600 to-indigo-700",
  "from-violet-600 to-purple-700",
  "from-cyan-600 to-blue-700",
  "from-emerald-600 to-teal-700",
  "from-amber-500 to-orange-600",
  "from-rose-600 to-pink-700",
  "from-indigo-600 to-blue-800",
  "from-teal-500 to-cyan-700",
];

const THUMB_ICONS = [Shield, Lock, Wifi, Bug, Eye, Server, ShieldAlert, Rss];

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

/* ── Skeleton card (matches new 2-col grid layout) ── */
function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse flex flex-col">
      <div className="h-28 bg-muted/60" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="h-4 w-24 bg-muted rounded-full" />
        </div>
        <div className="h-4 w-full bg-muted rounded-md" />
        <div className="h-4 w-4/5 bg-muted rounded-md" />
        <div className="h-3 w-full bg-muted rounded-md" />
        <div className="h-3 w-3/4 bg-muted rounded-md" />
        <div className="mt-2 h-8 w-32 bg-muted rounded-lg" />
      </div>
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

        {/* ── Skeleton grid ── */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── News grid ── */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {items.map((item, i) => {
              const h          = hashSource(item.source);
              const gradient   = THUMB_GRADIENTS[h % THUMB_GRADIENTS.length];
              const badgeColor = BADGE_COLORS[h % BADGE_COLORS.length];
              const ThumbIcon  = THUMB_ICONS[h % THUMB_ICONS.length];

              return (
                <article
                  key={i}
                  className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden
                             hover:-translate-y-1 hover:border-cyan-500/50
                             hover:shadow-[0_0_20px_rgba(6,182,212,0.18)]
                             transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
                >
                  {/* ── Gradient thumbnail strip ── */}
                  <div className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <div className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                        backgroundSize: "30px 30px",
                      }}
                    />
                    <div className="relative z-10 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <ThumbIcon className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* ── Content ── */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    {/* Source badge + date */}
                    <div className={`flex items-center gap-2 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeColor}`}>
                        {item.source}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.date, lang)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors duration-200">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                      {item.description}
                    </p>

                    {/* CTA button */}
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-1 self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg
                                 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold
                                 transition-colors duration-200 ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {isRtl ? "اقرأ المقال" : "Read Article"}
                    </a>
                  </div>
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
