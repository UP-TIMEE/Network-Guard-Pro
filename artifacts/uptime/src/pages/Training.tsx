import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { RapidFireLab } from "@/components/RapidFireLab";
import TrafficAnalyzer from "@/components/TrafficAnalyzer";
import SocialEngineeringLab from "@/components/SocialEngineeringLab";
import LiveChatSim from "@/components/LiveChatSim";
import { ShieldCheck, Mail, Zap, Terminal, MessageSquare } from "lucide-react";

export default function Training() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [activeTab, setActiveTab] = useState<"social" | "rapid" | "traffic" | "chat">("social");

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={dir}>
      <Header />

      <main className="flex-1">
        {/* Page header + tabs */}
        <div className="border-b border-border py-6 px-4">
          <div className="container mx-auto max-w-2xl">
            <h1 className="text-xl font-black text-foreground flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {isRtl ? "تدريب ومحاكاة" : "Training & Simulation"}
            </h1>
            <p className="text-muted-foreground text-sm mb-5">
              {isRtl
                ? "اختبر مهاراتك في اكتشاف التهديدات السيبرانية"
                : "Test your ability to detect cyber threats"}
            </p>

            {/* ── Module tabs ── */}
            <div className="flex flex-wrap gap-2 p-1 bg-muted/40 border border-border rounded-xl">
              <button
                onClick={() => setActiveTab("social")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "social"
                    ? "bg-card border border-border shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="h-4 w-4" />
                {isRtl ? "محاكي الهندسة الاجتماعية" : "Social Engineering Sim"}
              </button>
              <button
                onClick={() => setActiveTab("rapid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "rapid"
                    ? "bg-card border border-border shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-4 w-4" />
                {isRtl ? "مختبر القرارات السريعة" : "Rapid-Fire Lab"}
              </button>
              <button
                onClick={() => setActiveTab("traffic")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "traffic"
                    ? "bg-card border border-border shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Terminal className="h-4 w-4" />
                {isRtl ? "محلل حركة الشبكة" : "Traffic Analyzer"}
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "chat"
                    ? "bg-card border border-border shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                {isRtl ? "محاكي المحادثة المباشرة" : "Live Chat Sim"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Active module ── */}
        {activeTab === "social" && (
          <div className="container mx-auto max-w-2xl px-4 py-6">
            <SocialEngineeringLab />
          </div>
        )}

        {activeTab === "rapid" && (
          <div className="container mx-auto max-w-2xl">
            <RapidFireLab isRtl={isRtl} />
          </div>
        )}

        {activeTab === "traffic" && (
          <div className="container mx-auto max-w-5xl px-4 py-8">
            <TrafficAnalyzer />
          </div>
        )}

        {activeTab === "chat" && (
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <LiveChatSim />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
