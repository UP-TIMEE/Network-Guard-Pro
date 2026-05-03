import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

import { IpCalcTool }          from "@/components/tools/IpCalcTool";
import { CidrTool }            from "@/components/tools/CidrTool";
import { BandwidthTool }       from "@/components/tools/BandwidthTool";
import { IPv6CompressorTool }  from "@/components/tools/IPv6CompressorTool";
import { GeoIpTool }           from "@/components/tools/GeoIpTool";
import { DnsTool }             from "@/components/tools/DnsTool";
import { PortScanTool }        from "@/components/tools/PortScanTool";
import { MacTool }             from "@/components/tools/MacTool";
import { EmailHeaderTool }     from "@/components/tools/EmailHeaderTool";
import { DeepLinkTool }        from "@/components/tools/DeepLinkTool";
import { PasswordTool }        from "@/components/tools/PasswordTool";
import { PingTool }            from "@/components/tools/PingTool";

import {
  Calculator, Network, Timer, Hash, MapPin, Globe,
  ScanSearch, Cpu, Mail, Link2, Lock, Activity,
  ShieldAlert, Radar, Wifi, Wrench, HelpCircle,
} from "lucide-react";

/* ── Section definition type ─────────────────────────────────────────────── */

interface ToolDef {
  value: string;
  icon: React.ElementType;
  key: string;
  component: React.ComponentType;
}

interface SectionDef {
  id: string;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: React.ElementType;
  accent: {
    badge:  string;   // badge bg + text
    icon:   string;   // icon color
    iconBg: string;   // icon container bg
    border: string;   // left/right accent border on header
    dot:    string;   // dot color
    glow:   string;   // subtle glow behind header icon
  };
  tools: ToolDef[];
}

/* ── 4 sections ──────────────────────────────────────────────────────────── */

const SECTIONS: SectionDef[] = [
  {
    id: "threat",
    labelAr: "تحليل التهديدات الأمنية",
    labelEn: "Security & Threat Analysis",
    descAr: "فحص الروابط والتحقق من التهديدات وتحليل البيانات الأمنية",
    descEn: "Scan links, detect threats, and analyze security data",
    icon: ShieldAlert,
    accent: {
      badge:  "bg-red-500/10 text-red-400 border border-red-500/20",
      icon:   "text-red-400",
      iconBg: "bg-red-500/10",
      border: "border-s-red-500",
      dot:    "bg-red-400",
      glow:   "shadow-red-500/20",
    },
    tools: [
      { value: "deeplink",    icon: Link2, key: "deepLink",    component: DeepLinkTool },
      { value: "emailheader", icon: Mail,  key: "emailHeader", component: EmailHeaderTool },
      { value: "password",    icon: Lock,  key: "password",    component: PasswordTool },
    ],
  },
  {
    id: "recon",
    labelAr: "الاستطلاع وجمع المعلومات",
    labelEn: "Reconnaissance",
    descAr: "جمع معلومات الهوية والموقع الجغرافي وبيانات الشبكة",
    descEn: "Gather identity, geolocation, and network intelligence",
    icon: Radar,
    accent: {
      badge:  "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
      icon:   "text-cyan-400",
      iconBg: "bg-cyan-500/10",
      border: "border-s-cyan-500",
      dot:    "bg-cyan-400",
      glow:   "shadow-cyan-500/20",
    },
    tools: [
      { value: "geoip", icon: MapPin, key: "geoip", component: GeoIpTool },
      { value: "dns",   icon: Globe,  key: "dns",   component: DnsTool },
      { value: "mac",   icon: Cpu,    key: "mac",   component: MacTool },
    ],
  },
  {
    id: "diagnostics",
    labelAr: "فحص وتشخيص الشبكات",
    labelEn: "Network Diagnostics",
    descAr: "اختبار الاتصال وفحص المنافذ وقياس الكمون",
    descEn: "Test connectivity, scan ports, and measure latency",
    icon: Wifi,
    accent: {
      badge:  "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      icon:   "text-blue-400",
      iconBg: "bg-blue-500/10",
      border: "border-s-blue-500",
      dot:    "bg-blue-500",
      glow:   "shadow-blue-500/20",
    },
    tools: [
      { value: "portscan", icon: ScanSearch, key: "portScan", component: PortScanTool },
      { value: "ping",     icon: Activity,   key: "ping",     component: PingTool },
    ],
  },
  {
    id: "engineering",
    labelAr: "هندسة وتخطيط الشبكات",
    labelEn: "Network Engineering",
    descAr: "حسابات الشبكات وتخطيط العناوين وتحويل البروتوكولات",
    descEn: "Network calculations, IP planning, and protocol conversion",
    icon: Wrench,
    accent: {
      badge:  "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      icon:   "text-purple-400",
      iconBg: "bg-purple-500/10",
      border: "border-s-purple-500",
      dot:    "bg-purple-400",
      glow:   "shadow-purple-500/20",
    },
    tools: [
      { value: "ipcalc",    icon: Calculator, key: "ipCalc",    component: IpCalcTool },
      { value: "cidr",      icon: Network,    key: "cidr",      component: CidrTool },
      { value: "bandwidth", icon: Timer,      key: "bandwidth", component: BandwidthTool },
      { value: "ipv6",      icon: Hash,       key: "ipv6",      component: IPv6CompressorTool },
    ],
  },
];

/* ── Section header component ────────────────────────────────────────────── */

function SectionHeader({ section, isRtl }: { section: SectionDef; isRtl: boolean }) {
  const Icon = section.icon;
  const label = isRtl ? section.labelAr : section.labelEn;
  const desc  = isRtl ? section.descAr  : section.descEn;
  const count = section.tools.length;

  return (
    <div className={`flex items-center gap-4 ps-4 border-s-[3px] ${section.accent.border}`}>
      <div className={`rounded-xl p-2.5 ${section.accent.iconBg} shadow-lg ${section.accent.glow}`}>
        <Icon className={`h-5 w-5 ${section.accent.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-black text-foreground">{label}</h2>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${section.accent.badge}`}>
            {count} {isRtl ? "أدوات" : "tools"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
      </div>
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────────────────────────── */

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="flex gap-1">
        <span className="w-1 h-1 rounded-full bg-border" />
        <span className="w-1 h-1 rounded-full bg-border/60" />
        <span className="w-1 h-1 rounded-full bg-border/30" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export default function Tools() {
  const { t, tAny, dir } = useLanguage();
  const isRtl = dir === "rtl";

  // Global tool counter across all sections
  let globalIdx = 0;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans" dir={dir}>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">

        {/* ── Page title ── */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-1">{t("tools.pageTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "لوحة تحكم أمنية متكاملة — 12 أداة احترافية في 4 أقسام"
              : "Integrated security dashboard — 12 professional tools in 4 sections"}
          </p>
        </div>

        {/* ── Sections ── */}
        {SECTIONS.map((section, sIdx) => {
          return (
            <div key={section.id}>
              {/* Section header */}
              <SectionHeader section={section} isRtl={isRtl} />

              {/* Tools accordion */}
              <Accordion
                type="single"
                collapsible
                className="w-full space-y-3 mt-5"
                dir={dir}
              >
                {section.tools.map((tool) => {
                  const ToolIcon      = tool.icon;
                  const ToolComponent = tool.component;
                  const toolT = tAny(`tools.${tool.key}`) as {
                    label: string;
                    sublabel: string;
                    desc: string;
                  };
                  globalIdx++;
                  const displayIdx = globalIdx;

                  return (
                    <AccordionItem
                      key={tool.value}
                      value={tool.value}
                      className="bg-card border border-border rounded-xl px-0 py-0 overflow-hidden data-[state=open]:border-foreground/30 transition-all duration-200"
                      data-testid={`accordion-${tool.value}`}
                    >
                      <AccordionTrigger className="hover:no-underline px-6 py-5 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-4 w-full">
                          {/* Tool icon */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${section.accent.iconBg} flex items-center justify-center`}>
                            <ToolIcon className={`h-4 w-4 ${section.accent.icon}`} />
                          </div>

                          {/* Tool labels */}
                          <div className="flex-1 text-right">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground text-base">
                                {toolT.label}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono border border-border px-1.5 py-0.5 rounded hidden sm:inline">
                                {toolT.sublabel}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-border hover:border-foreground/40 cursor-help transition-colors">
                                    <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-[260px] text-center text-xs leading-relaxed"
                                >
                                  {toolT.desc}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block text-right">
                              {toolT.desc}
                            </p>
                          </div>

                          {/* Tool number */}
                          <span className="flex-shrink-0 text-xs text-muted-foreground/40 font-mono">
                            {String(displayIdx).padStart(2, "0")}
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-6 pb-8 pt-4 border-t border-border bg-background/50">
                        <p className="text-muted-foreground text-sm mb-6 sm:hidden">
                          {toolT.desc}
                        </p>
                        <ToolComponent />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              {/* Divider between sections (not after last) */}
              {sIdx < SECTIONS.length - 1 && <SectionDivider />}
            </div>
          );
        })}

        {/* Bottom padding */}
        <div className="h-12" />
      </main>

      <Footer />
    </div>
  );
}
