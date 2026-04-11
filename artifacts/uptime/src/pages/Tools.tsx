import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

import { IpCalcTool } from "@/components/tools/IpCalcTool";
import { CidrTool } from "@/components/tools/CidrTool";
import { BandwidthTool } from "@/components/tools/BandwidthTool";
import { GeoIpTool } from "@/components/tools/GeoIpTool";
import { DnsTool } from "@/components/tools/DnsTool";
import { MacTool } from "@/components/tools/MacTool";
import { EmailHeaderTool } from "@/components/tools/EmailHeaderTool";
import { DeepLinkTool } from "@/components/tools/DeepLinkTool";
import { PasswordTool } from "@/components/tools/PasswordTool";

import { Calculator, Network, Timer, MapPin, Globe, Cpu, Mail, Link2, Lock } from "lucide-react";

export default function Tools() {
  const { t, tAny, dir } = useLanguage();

  const modules = [
    {
      id: "planning",
      label: t("tools.module1"),
      color: "from-blue-500/10 to-transparent border-blue-500/20",
      dotColor: "bg-blue-500",
      tools: [
        { value: "ipcalc", icon: Calculator, key: "ipCalc", component: IpCalcTool },
        { value: "cidr", icon: Network, key: "cidr", component: CidrTool },
        { value: "bandwidth", icon: Timer, key: "bandwidth", component: BandwidthTool },
      ],
    },
    {
      id: "scan",
      label: t("tools.module2"),
      color: "from-cyan-500/10 to-transparent border-cyan-500/20",
      dotColor: "bg-cyan-400",
      tools: [
        { value: "geoip", icon: MapPin, key: "geoip", component: GeoIpTool },
        { value: "dns", icon: Globe, key: "dns", component: DnsTool },
        { value: "mac", icon: Cpu, key: "mac", component: MacTool },
      ],
    },
    {
      id: "analysis",
      label: t("tools.module3"),
      color: "from-purple-500/10 to-transparent border-purple-500/20",
      dotColor: "bg-purple-400",
      tools: [
        { value: "emailheader", icon: Mail, key: "emailHeader", component: EmailHeaderTool },
        { value: "deeplink", icon: Link2, key: "deepLink", component: DeepLinkTool },
        { value: "password", icon: Lock, key: "password", component: PasswordTool },
      ],
    },
  ];

  let globalIndex = 0;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans" dir={dir}>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-2">{t("tools.pageTitle")}</h1>
          <p className="text-muted-foreground">{t("tools.pageDesc")}</p>
        </div>

        <div className="space-y-8">
          {modules.map((mod) => (
            <div key={mod.id}>
              <div className={`flex items-center gap-3 mb-4 pb-3 border-b border-border`}>
                <span className={`w-2.5 h-2.5 rounded-full ${mod.dotColor} flex-shrink-0`} />
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{mod.label}</h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-3" dir={dir}>
                {mod.tools.map((tool) => {
                  const idx = ++globalIndex;
                  const Icon = tool.icon;
                  const ToolComponent = tool.component;
                  const toolT = tAny(`tools.${tool.key}`) as { label: string; sublabel: string; desc: string };

                  return (
                    <AccordionItem
                      key={tool.value}
                      value={tool.value}
                      className="bg-card border border-border rounded-xl px-0 py-0 overflow-hidden data-[state=open]:border-foreground/30 transition-all duration-200"
                      data-testid={`accordion-${tool.value}`}
                    >
                      <AccordionTrigger className="hover:no-underline px-6 py-5 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-4 text-right w-full">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="h-4 w-4 text-foreground" />
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
                          <span className="flex-shrink-0 text-xs text-muted-foreground/50 font-mono ml-2">
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
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
