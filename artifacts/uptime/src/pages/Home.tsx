import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wrench, BookOpen, Rss, Zap, ArrowLeft, ArrowRight, Shield, Network, X } from "lucide-react";

function UptimeLogo() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" />
      <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.08" />
      <path
        d="M40 12 L55 20 L55 38 C55 50 47 58 40 62 C33 58 25 50 25 38 L25 20 Z"
        fill="hsl(var(--primary))"
        fillOpacity="0.12"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
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

function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, dir } = useLanguage();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200"
        dir={dir}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-5">
          <div className="p-4 rounded-2xl bg-muted">
            <UptimeLogo />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground mb-1">{t("hero.aboutTitle")}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{t("hero.aboutDesc")}</p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            {t("hero.aboutClose")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans" dir={dir}>
      <Header />

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="mb-6 text-foreground">
            <UptimeLogo />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-muted-foreground text-sm mb-6 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>{t("hero.badge")}</span>
          </div>

          <h1
            className="text-6xl sm:text-8xl font-black text-foreground tracking-wider mb-4 font-mono"
            data-testid="hero-title"
          >
            UPTIME
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/tools">
              <span
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-colors cursor-pointer"
                data-testid="button-start"
              >
                <ArrowIcon className="h-4 w-4" />
                {t("hero.startNow")}
              </span>
            </Link>
            <button
              onClick={() => setAboutOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-muted-foreground font-semibold rounded-xl hover:bg-muted hover:text-foreground transition-colors"
              data-testid="button-about"
            >
              <Shield className="h-4 w-4" />
              {t("hero.aboutUs")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-12 mt-16 pt-10 border-t border-border w-full max-w-xs">
            {[
              { value: "+500", label: t("hero.stat1") },
              { value: "12",   label: t("hero.stat2") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature cards */}
        <section id="features" className="py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-foreground mb-2">{t("home.sectionTitle")}</h2>
              <p className="text-muted-foreground">{t("home.sectionSub")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/tools">
                <div
                  data-testid="card-tools"
                  className="group bg-foreground text-background rounded-2xl p-6 cursor-pointer hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] shadow-lg h-full"
                >
                  <div className="bg-background/10 rounded-xl p-3 w-fit mb-4 group-hover:bg-background/20 transition-colors">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black mb-2">{t("home.card1Title")}</h3>
                  <p className="text-sm opacity-70 leading-relaxed">{t("home.card1Desc")}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold opacity-60">
                    <ArrowIcon className="h-3.5 w-3.5" />
                    <span>{isRtl ? "استكشف الأدوات" : "Explore Tools"}</span>
                  </div>
                </div>
              </Link>

              <div
                data-testid="card-training"
                className="bg-card border border-border rounded-2xl p-6 opacity-60 h-full"
              >
                <div className="bg-muted rounded-xl p-3 w-fit mb-4">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-black mb-2 text-foreground">{t("home.card2Title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("home.card2Desc")}</p>
                <div className="mt-4 inline-flex items-center text-xs font-semibold text-muted-foreground border border-border px-2.5 py-1 rounded-full">
                  {t("home.soon")}
                </div>
              </div>

              <div
                data-testid="card-news"
                className="bg-card border border-border rounded-2xl p-6 opacity-60 h-full"
              >
                <div className="bg-muted rounded-xl p-3 w-fit mb-4">
                  <Rss className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-black mb-2 text-foreground">{t("home.card3Title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("home.card3Desc")}</p>
                <div className="mt-4 inline-flex items-center text-xs font-semibold text-muted-foreground border border-border px-2.5 py-1 rounded-full">
                  {t("home.soon")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="py-16 border-t border-border bg-card/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Shield,  title: isRtl ? "أمان وموثوقية" : "Secure & Reliable", desc: isRtl ? "أدوات مجانية وآمنة لا تخزن بياناتك" : "Free and secure tools that don't store your data" },
                { icon: Zap,     title: isRtl ? "سريع ودقيق" : "Fast & Accurate",       desc: isRtl ? "نتائج فورية من مصادر موثوقة" : "Instant results from trusted sources" },
                { icon: Network, title: isRtl ? "شبكي متكامل" : "Fully Integrated",     desc: isRtl ? "تغطي كل احتياجات تشخيص الشبكات" : "Covers all your network diagnostic needs" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="space-y-3">
                  <div className="inline-flex p-3 rounded-xl bg-muted mx-auto">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
