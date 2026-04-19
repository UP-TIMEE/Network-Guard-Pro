import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wrench, Rss, ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";

function UptimeLogo() {
  return (
    <svg width="52" height="52" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" />
      <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.08" />
      <path d="M40 12 L55 20 L55 38 C55 50 47 58 40 62 C33 58 25 50 25 38 L25 20 Z" fill="hsl(var(--primary))" fillOpacity="0.12" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M33 40 L38 45 L48 35" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="40" cy="22" r="2" fill="hsl(var(--primary))" fillOpacity="0.6" />
      <circle cx="58" cy="32" r="1.5" fill="hsl(var(--primary))" fillOpacity="0.4" />
      <circle cx="22" cy="32" r="1.5" fill="hsl(var(--primary))" fillOpacity="0.4" />
      <circle cx="58" cy="50" r="1.5" fill="hsl(var(--primary))" fillOpacity="0.4" />
      <circle cx="22" cy="50" r="1.5" fill="hsl(var(--primary))" fillOpacity="0.4" />
      <line x1="40" y1="22" x2="58" y2="32" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
      <line x1="40" y1="22" x2="22" y2="32" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
      <line x1="58" y1="32" x2="58" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
      <line x1="22" y1="32" x2="22" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
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
        <div className="flex flex-col items-center text-center mb-10">
          <div className="mb-4 text-foreground">
            <UptimeLogo />
          </div>
          <h1
            className="text-5xl sm:text-6xl font-black text-foreground tracking-wider font-mono mb-3"
            data-testid="hero-title"
          >
            UPTIME
          </h1>
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
