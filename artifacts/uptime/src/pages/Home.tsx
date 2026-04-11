import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Wrench, FlaskConical, Rss, ArrowLeft, Network, Shield, Zap } from "lucide-react";

const cards = [
  {
    id: "tools",
    icon: Wrench,
    title: "أدوات الشبكات",
    description: "مجموعة متكاملة من أدوات الفحص والتحليل الأمني للشبكات والنطاقات",
    href: "/tools",
    active: true,
    items: ["فحص IP وتتبع الموقع", "سجلات DNS وNSLookup", "فحص SSL والمنافذ"],
  },
  {
    id: "training",
    icon: FlaskConical,
    title: "تدريب ومحاكاة",
    description: "بيئات تدريب تفاعلية لاكتساب مهارات أمن الشبكات بشكل عملي",
    href: null,
    active: false,
    items: ["محاكاة الشبكات", "اختبار الاختراق", "سيناريوهات واقعية"],
  },
  {
    id: "news",
    icon: Rss,
    title: "آخر المستجدات",
    description: "متابعة أحدث التهديدات الأمنية والثغرات المكتشفة في عالم الشبكات",
    href: null,
    active: false,
    items: ["تنبيهات أمنية", "CVE الجديدة", "تقارير التهديدات"],
  },
];

const stats = [
  { label: "أداة أمنية", value: "7" },
  { label: "بروتوكول مدعوم", value: "12+" },
  { label: "فحص يومي", value: "500+" },
];

function CardInner({ card }: { card: (typeof cards)[0] }) {
  const Icon = card.icon;
  return (
    <div
      data-testid={`card-${card.id}`}
      className={`group relative rounded-2xl border p-8 h-full transition-all duration-300 ${
        card.href
          ? "cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
          : "cursor-default opacity-70"
      } ${
        card.active
          ? "bg-foreground text-background border-foreground shadow-2xl shadow-foreground/20"
          : "bg-card text-foreground border-border hover:border-foreground/30 hover:shadow-xl"
      }`}
    >
      {card.active && (
        <div className="absolute top-4 left-4 bg-background/20 text-background text-xs px-2 py-0.5 rounded-full font-semibold">
          متاح الآن
        </div>
      )}

      <div
        className={`inline-flex p-3 rounded-xl mb-6 ${
          card.active ? "bg-background/15" : "bg-muted"
        }`}
      >
        <Icon
          className={`h-7 w-7 ${card.active ? "text-background" : "text-foreground"}`}
        />
      </div>

      <h3
        className={`text-xl font-bold mb-3 ${
          card.active ? "text-background" : "text-foreground"
        }`}
      >
        {card.title}
      </h3>

      <p
        className={`text-sm leading-relaxed mb-6 ${
          card.active ? "text-background/70" : "text-muted-foreground"
        }`}
      >
        {card.description}
      </p>

      <ul className="space-y-2">
        {card.items.map((item) => (
          <li
            key={item}
            className={`flex items-center gap-2 text-sm ${
              card.active ? "text-background/80" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                card.active ? "bg-background/60" : "bg-primary"
              }`}
            />
            {item}
          </li>
        ))}
      </ul>

      {card.href ? (
        <div
          className={`mt-8 flex items-center gap-2 text-sm font-semibold ${
            card.active ? "text-background" : "text-foreground"
          }`}
        >
          <span>ابدأ الفحص</span>
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </div>
      ) : (
        <div className="mt-8 text-sm text-muted-foreground font-medium">قريباً...</div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans" dir="rtl">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center relative">
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-8 text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              منصة أمن الشبكات الاحترافية
            </div>

            <h1
              className="text-6xl md:text-8xl font-black text-foreground tracking-widest mb-6 font-mono"
              data-testid="hero-title"
            >
              UPTIME
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              منصة احترافية لتعزيز مهاراتك وكفاءتك في الشبكات
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/tools">
                <button
                  className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-lg font-bold text-base hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
                  data-testid="button-start"
                >
                  ابدأ الآن
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </Link>
              <button className="inline-flex items-center gap-2 border border-border text-foreground px-8 py-3 rounded-lg font-semibold text-base hover:bg-muted transition-all">
                <Shield className="h-4 w-4" />
                اعرف المزيد
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-2">اختر ما تريد</h2>
              <p className="text-muted-foreground">ثلاثة محاور أساسية لبناء كفاءتك في أمن الشبكات</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {cards.map((card) =>
                card.href ? (
                  <Link key={card.id} href={card.href}>
                    <CardInner card={card} />
                  </Link>
                ) : (
                  <CardInner key={card.id} card={card} />
                )
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-t border-border bg-card/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div className="space-y-3">
                <div className="inline-flex p-3 rounded-xl bg-muted mx-auto">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-bold text-foreground">أمان وموثوقية</h3>
                <p className="text-sm text-muted-foreground">أدوات مجانية وآمنة لا تخزن بياناتك</p>
              </div>
              <div className="space-y-3">
                <div className="inline-flex p-3 rounded-xl bg-muted mx-auto">
                  <Zap className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-bold text-foreground">سريع ودقيق</h3>
                <p className="text-sm text-muted-foreground">نتائج فورية من مصادر موثوقة</p>
              </div>
              <div className="space-y-3">
                <div className="inline-flex p-3 rounded-xl bg-muted mx-auto">
                  <Network className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-bold text-foreground">شبكي متكامل</h3>
                <p className="text-sm text-muted-foreground">تغطي كل احتياجات تشخيص الشبكات</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
