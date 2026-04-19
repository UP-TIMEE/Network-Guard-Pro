import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

import { IpCalcTool } from "@/components/tools/IpCalcTool";
import { CidrTool } from "@/components/tools/CidrTool";
import { BandwidthTool } from "@/components/tools/BandwidthTool";
import { IPv6CompressorTool } from "@/components/tools/IPv6CompressorTool";
import { GeoIpTool } from "@/components/tools/GeoIpTool";
import { DnsTool } from "@/components/tools/DnsTool";
import { PortScanTool } from "@/components/tools/PortScanTool";
import { MacTool } from "@/components/tools/MacTool";
import { EmailHeaderTool } from "@/components/tools/EmailHeaderTool";
import { DeepLinkTool } from "@/components/tools/DeepLinkTool";
import { PasswordTool } from "@/components/tools/PasswordTool";
import { PingTool } from "@/components/tools/PingTool";

import {
  Calculator, Network, Timer, Hash, MapPin, Globe,
  ScanSearch, Cpu, Mail, Link2, Lock, Activity,
  ArrowRight, ArrowLeft, Search, LayoutGrid
} from "lucide-react";

type ModuleId = "planning" | "scan" | "analysis";

export default function Tools() {
  const { t, tAny, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const ArrowBack = isRtl ? ArrowRight : ArrowLeft;
  const ArrowFwd  = isRtl ? ArrowLeft  : ArrowRight;

  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);

  const modules = [
    {
      id: "scan" as ModuleId,
      label: isRtl ? "وحدة الفحص" : "Scanning Module",
      desc: isRtl
        ? "أدوات لاختبار الاتصال وفحص المنافذ المفتوحة"
        : "Tools for testing connectivity and scanning open ports",
      icon: ScanSearch,
      accent: "cyan",
      dotColor: "bg-cyan-400",
      border: "border-cyan-500/30 hover:border-cyan-400/60",
      iconBg: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
      iconColor: "text-cyan-400",
      arrowColor: "text-cyan-400",
      tools: [
        { value: "geoip",    icon: MapPin,     key: "geoip",    component: GeoIpTool },
        { value: "dns",      icon: Globe,      key: "dns",      component: DnsTool },
        { value: "portscan", icon: ScanSearch, key: "portScan", component: PortScanTool },
        { value: "mac",      icon: Cpu,        key: "mac",      component: MacTool },
      ],
    },
    {
      id: "planning" as ModuleId,
      label: isRtl ? "وحدة التخطيط" : "Planning Module",
      desc: isRtl
        ? "أدوات لحساب الـ Subnet وتخطيط عناوين الـ IP"
        : "Tools for Subnet calculation and IP address planning",
      icon: Network,
      accent: "blue",
      dotColor: "bg-blue-500",
      border: "border-blue-500/30 hover:border-blue-400/60",
      iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
      iconColor: "text-blue-400",
      arrowColor: "text-blue-400",
      tools: [
        { value: "ipcalc",    icon: Calculator, key: "ipCalc",    component: IpCalcTool },
        { value: "cidr",      icon: Network,    key: "cidr",      component: CidrTool },
        { value: "bandwidth", icon: Timer,      key: "bandwidth", component: BandwidthTool },
        { value: "ipv6",      icon: Hash,       key: "ipv6",      component: IPv6CompressorTool },
      ],
    },
    {
      id: "analysis" as ModuleId,
      label: isRtl ? "وحدة التحليل" : "Analysis Module",
      desc: isRtl
        ? "أدوات لاستعلامات DNS وتحليل العناوين والمسارات"
        : "Tools for DNS queries, address analysis, and routing",
      icon: Search,
      accent: "purple",
      dotColor: "bg-purple-400",
      border: "border-purple-500/30 hover:border-purple-400/60",
      iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
      iconColor: "text-purple-400",
      arrowColor: "text-purple-400",
      tools: [
        { value: "emailheader", icon: Mail,     key: "emailHeader", component: EmailHeaderTool },
        { value: "deeplink",    icon: Link2,    key: "deepLink",    component: DeepLinkTool },
        { value: "password",    icon: Lock,     key: "password",    component: PasswordTool },
        { value: "ping",        icon: Activity, key: "ping",        component: PingTool },
      ],
    },
  ];

  const activeModule = modules.find(m => m.id === selectedModule) ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans" dir={dir}>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">

        {/* ── Sub-hub: module selection ── */}
        {!selectedModule && (
          <>
            <div className="mb-10" dir={dir}>
              <div className="flex items-center gap-3 mb-2">
                <LayoutGrid className="h-6 w-6 text-foreground/60" />
                <h1 className="text-3xl font-black text-foreground">{t("tools.pageTitle")}</h1>
              </div>
              <p className="text-muted-foreground">{isRtl ? "اختر الوحدة التي تريد استخدامها" : "Select a module to get started"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {modules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModule(mod.id)}
                    className={`group text-start bg-card border ${mod.border} rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
                    dir={dir}
                  >
                    <div className={`rounded-xl p-3 w-fit mb-4 transition-colors ${mod.iconBg}`}>
                      <Icon className={`h-7 w-7 ${mod.iconColor}`} />
                    </div>
                    <h3 className="text-base font-black text-foreground mb-2">{mod.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{mod.desc}</p>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${mod.arrowColor}`}>
                      <ArrowFwd className="h-3.5 w-3.5" />
                      <span>{isRtl ? `${mod.tools.length} أدوات` : `${mod.tools.length} tools`}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Active module: tool list ── */}
        {selectedModule && activeModule && (() => {
          const Icon = activeModule.icon;
          let idx = 0;
          return (
            <>
              {/* Back button */}
              <button
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
                dir={dir}
              >
                <ArrowBack className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>{isRtl ? "الرجوع للوحدات" : "Back to Modules"}</span>
              </button>

              {/* Module header */}
              <div className="flex items-center gap-3 mb-8" dir={dir}>
                <div className={`rounded-xl p-3 ${activeModule.iconBg.replace("group-hover:bg-purple-500/20","").replace("group-hover:bg-blue-500/20","").replace("group-hover:bg-cyan-500/20","")}`}>
                  <Icon className={`h-6 w-6 ${activeModule.iconColor}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-foreground">{activeModule.label}</h1>
                  <p className="text-muted-foreground text-sm">{activeModule.desc}</p>
                </div>
              </div>

              {/* Tools accordion */}
              <Accordion type="single" collapsible className="w-full space-y-3" dir={dir}>
                {activeModule.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const ToolComponent = tool.component;
                  const toolT = tAny(`tools.${tool.key}`) as { label: string; sublabel: string; desc: string };
                  idx++;

                  return (
                    <AccordionItem
                      key={tool.value}
                      value={tool.value}
                      className="bg-card border border-border rounded-xl px-0 py-0 overflow-hidden data-[state=open]:border-foreground/30 transition-all duration-200"
                      data-testid={`accordion-${tool.value}`}
                    >
                      <AccordionTrigger className="hover:no-underline px-6 py-5 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-4 w-full">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <ToolIcon className="h-4 w-4 text-foreground" />
                          </div>
                          <div className="flex-1 text-right">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground text-base">{toolT.label}</span>
                              <span className="text-xs text-muted-foreground font-mono border border-border px-1.5 py-0.5 rounded hidden sm:inline">
                                {toolT.sublabel}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block text-right">
                              {toolT.desc}
                            </p>
                          </div>
                          <span className="flex-shrink-0 text-xs text-muted-foreground/50 font-mono">
                            {String(idx).padStart(2, "0")}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-8 pt-4 border-t border-border bg-background/50">
                        <p className="text-muted-foreground text-sm mb-6 sm:hidden">{toolT.desc}</p>
                        <ToolComponent />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </>
          );
        })()}
      </main>

      <Footer />
    </div>
  );
}
