import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wrench, Rss, ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";


function UptimeHeroIcon() {
  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-foreground"
    >
      {/* Outer ring */}
      <circle cx="44" cy="44" r="41" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
      {/* Middle ring */}
      <circle cx="44" cy="44" r="30" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" strokeDasharray="4 3" />

      {/* Network nodes */}
      <circle cx="44" cy="14" r="4" fill="currentColor" fillOpacity="0.9" />
      <circle cx="70" cy="30" r="3.5" fill="currentColor" fillOpacity="0.7" />
      <circle cx="70" cy="58" r="3.5" fill="currentColor" fillOpacity="0.7" />
      <circle cx="44" cy="74" r="4" fill="currentColor" fillOpacity="0.9" />
      <circle cx="18" cy="58" r="3.5" fill="currentColor" fillOpacity="0.7" />
      <circle cx="18" cy="30" r="3.5" fill="currentColor" fillOpacity="0.7" />

      {/* Connecting edges */}
      <line x1="44" y1="14" x2="70" y2="30" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
      <line x1="70" y1="30" x2="70" y2="58" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
      <line x1="70" y1="58" x2="44" y2="74" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
      <line x1="44" y1="74" x2="18" y2="58" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
      <line x1="18" y1="58" x2="18" y2="30" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
      <line x1="18" y1="30" x2="44" y2="14" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />

      {/* Cross diagonals */}
      <line x1="44" y1="14" x2="70" y2="58" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.15" />
      <line x1="44" y1="14" x2="18" y2="58" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.15" />
      <line x1="18" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.15" />
      <line x1="18" y1="30" x2="44" y2="74" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.15" />
      <line x1="70" y1="30" x2="44" y2="74" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.15" />
      <line x1="18" y1="58" x2="70" y2="58" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.15" />

      {/* Center node — bright */}
      <circle cx="44" cy="44" r="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx="44" cy="44" r="3" fill="currentColor" fillOpacity="0.9" />

      {/* Spokes from center */}
      <line x1="44" y1="38" x2="44" y2="18" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <line x1="44" y1="50" x2="44" y2="70" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <line x1="50" y1="44" x2="67" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <line x1="38" y1="44" x2="21" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <line x1="50" y1="44" x2="67" y2="55" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <line x1="38" y1="44" x2="21" y2="55" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
    </svg>
  );
}

export default function Home() {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans" dir={dir}>
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* ── Compact brand identity ── */}
        <div className="flex flex-col items-center text-center mb-10 gap-5">
          <UptimeHeroIcon />
          <p className="text-base text-muted-foreground max-w-md leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* ── Feature cards — directly visible, no scroll needed ── */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — Network Tools */}
          <Link href="/tools">
            <div
              data-testid="card-tools"
              className="group bg-foreground text-background rounded-2xl p-6 cursor-pointer hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] shadow-lg h-full"
            >
              <div className="bg-background/10 rounded-xl p-3 w-fit mb-4 group-hover:bg-background/20 transition-colors">
                <Wrench className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black mb-2">{t("home.card1Title")}</h3>
              <p className="text-sm opacity-70 leading-relaxed">{t("home.card1Desc")}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-60">
                <ArrowIcon className="h-3.5 w-3.5" />
                <span>{isRtl ? "استكشف الأدوات" : "Explore Tools"}</span>
              </div>
            </div>
          </Link>

          {/* Card 2 — Training */}
          <Link href="/training">
            <div
              data-testid="card-training"
              className="group bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="bg-muted rounded-xl p-3 w-fit mb-4 group-hover:bg-primary/10 transition-colors">
                <GraduationCap className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-black mb-2 text-foreground">{t("home.card2Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("home.card2Desc")}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <ArrowIcon className="h-3.5 w-3.5" />
                <span>{isRtl ? "ابدأ التدريب" : "Start Training"}</span>
              </div>
            </div>
          </Link>

          {/* Card 3 — News */}
          <Link href="/news">
            <div
              data-testid="card-news"
              className="group bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="bg-muted rounded-xl p-3 w-fit mb-4 group-hover:bg-primary/10 transition-colors">
                <Rss className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-black mb-2 text-foreground">{t("home.card3Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("home.card3Desc")}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <ArrowIcon className="h-3.5 w-3.5" />
                <span>{isRtl ? "اطّلع على الأخبار" : "View News Feed"}</span>
              </div>
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
