import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wrench, Rss, ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";


function UptimeShieldIcon() {
  return (
    <svg
      width="72"
      height="80"
      viewBox="0 0 72 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-foreground"
    >
      {/* Shield outer shape */}
      <path
        d="M36 2L6 14V38C6 56.5 19.2 73.2 36 78C52.8 73.2 66 56.5 66 38V14L36 2Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Inner grid — vertical dividers */}
      <line x1="26" y1="24" x2="26" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="20" x2="36" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="24" x2="46" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Inner grid — horizontal dividers */}
      <line x1="18" y1="32" x2="54" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="42" x2="56" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="52" x2="54" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
          <UptimeShieldIcon />
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
