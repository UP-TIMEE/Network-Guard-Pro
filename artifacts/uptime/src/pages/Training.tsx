import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { RapidFireLab } from "@/components/RapidFireLab";
import TrafficAnalyzer from "@/components/TrafficAnalyzer";
import SocialEngineeringLab from "@/components/SocialEngineeringLab";
import {
  ShieldCheck, Mail, Zap, Terminal,
  ArrowLeft, ArrowRight, GraduationCap
} from "lucide-react";

type SimId = "social" | "rapid" | "traffic";

export default function Training() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";
  const ArrowBack = isRtl ? ArrowRight : ArrowLeft;
  const ArrowFwd  = isRtl ? ArrowLeft  : ArrowRight;

  const [active, setActive] = useState<SimId | null>(null);

  const sims = [
    {
      id: "social" as SimId,
      icon: Mail,
      title: isRtl ? "محاكي الهندسة الاجتماعية" : "Social Engineering Sim",
      desc: isRtl
        ? "اختبر وعيك الأمني عبر 10 سيناريوهات واقعية تفاعلية"
        : "Test your security awareness through 10 interactive real-world scenarios",
      accent: "emerald",
      border: "border-emerald-500/30 hover:border-emerald-400/60",
      iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
      iconColor: "text-emerald-400",
      arrowColor: "text-emerald-400",
    },
    {
      id: "rapid" as SimId,
      icon: Zap,
      title: isRtl ? "مختبر القرارات السريعة" : "Rapid-Fire Decision Lab",
      desc: isRtl
        ? "تحدي اتخاذ القرار السريع في فحص الروابط والمواقف الأمنية"
        : "Challenge your rapid decision-making in link inspection and security scenarios",
      accent: "amber",
      border: "border-amber-500/30 hover:border-amber-400/60",
      iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
      iconColor: "text-amber-400",
      arrowColor: "text-amber-400",
    },
    {
      id: "traffic" as SimId,
      icon: Terminal,
      title: isRtl ? "محلل حركة الشبكة" : "Traffic Analyzer",
      desc: isRtl
        ? "محاكي Wireshark لاكتشاف الهجمات من خلال تحليل الـ Logs"
        : "Wireshark-style simulator to detect attacks through log analysis",
      accent: "violet",
      border: "border-violet-500/30 hover:border-violet-400/60",
      iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
      iconColor: "text-violet-400",
      arrowColor: "text-violet-400",
    },
  ];

  const activeSim = sims.find(s => s.id === active) ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={dir}>
      <Header />

      <main className="flex-1">

        {/* ── Training Hub ── */}
        {!active && (
          <div className="container mx-auto max-w-4xl px-4 py-10">
            <div className="mb-10" dir={dir}>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-6 w-6 text-foreground/60" />
                <h1 className="text-3xl font-black text-foreground">
                  {isRtl ? "تدريب ومحاكاة" : "Training & Simulation"}
                </h1>
              </div>
              <p className="text-muted-foreground">
                {isRtl
                  ? "اختر المحاكي الذي تريد البدء به"
                  : "Choose a simulator to get started"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sims.map((sim) => {
                const Icon = sim.icon;
                return (
                  <button
                    key={sim.id}
                    onClick={() => setActive(sim.id)}
                    className={`group text-start bg-card border ${sim.border} rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
                    dir={dir}
                  >
                    <div className={`rounded-xl p-3 w-fit mb-4 transition-colors ${sim.iconBg}`}>
                      <Icon className={`h-7 w-7 ${sim.iconColor}`} />
                    </div>
                    <h3 className="text-base font-black text-foreground mb-2">{sim.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{sim.desc}</p>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${sim.arrowColor}`}>
                      <ArrowFwd className="h-3.5 w-3.5" />
                      <span>{isRtl ? "ابدأ الآن" : "Start now"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Active Simulator ── */}
        {active && activeSim && (
          <>
            {/* Back bar */}
            <div className="border-b border-border py-4 px-4">
              <div className="container mx-auto max-w-5xl">
                <button
                  onClick={() => setActive(null)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  dir={dir}
                >
                  <ArrowBack className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>{isRtl ? "الرجوع لأقسام التدريب" : "Back to Training"}</span>
                  <span className="text-muted-foreground/40 mx-1">/</span>
                  <span className={`font-semibold ${activeSim.iconColor}`}>{activeSim.title}</span>
                </button>
              </div>
            </div>

            {/* Simulator content */}
            {active === "social" && (
              <div className="container mx-auto max-w-2xl px-4 py-6">
                <SocialEngineeringLab />
              </div>
            )}
            {active === "rapid" && (
              <div className="container mx-auto max-w-2xl">
                <RapidFireLab isRtl={isRtl} />
              </div>
            )}
            {active === "traffic" && (
              <div className="container mx-auto max-w-5xl px-4 py-8">
                <TrafficAnalyzer />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
