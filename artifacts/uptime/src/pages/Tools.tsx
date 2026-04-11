import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GeoIpTool } from "@/components/tools/GeoIpTool";
import { DnsTool } from "@/components/tools/DnsTool";
import { MacTool } from "@/components/tools/MacTool";
import { PortScanTool } from "@/components/tools/PortScanTool";
import { WhoisTool } from "@/components/tools/WhoisTool";
import { SslTool } from "@/components/tools/SslTool";
import { UrlSafetyTool } from "@/components/tools/UrlSafetyTool";
import { MapPin, Globe, Cpu, Search, FileText, Lock, AlertTriangle } from "lucide-react";

const tools = [
  {
    value: "geoip",
    icon: MapPin,
    label: "تحديد الموقع الجغرافي",
    sublabel: "Geolocation",
    desc: "تحديد الموقع الجغرافي ومعلومات مزود الخدمة لأي عنوان IP أو نطاق مع خريطة تفاعلية.",
    component: GeoIpTool,
  },
  {
    value: "dns",
    icon: Globe,
    label: "فحص سجلات الـ DNS",
    sublabel: "DNS Lookup",
    desc: "استخراج سجلات DNS من النوع A وMX وTXT لأي نطاق وعرضها منظمة.",
    component: DnsTool,
  },
  {
    value: "mac",
    icon: Cpu,
    label: "تحديد المصنّع",
    sublabel: "MAC Vendor",
    desc: "معرفة الشركة المصنعة للجهاز من خلال عنوان MAC الخاص بالشبكة.",
    component: MacTool,
  },
  {
    value: "port",
    icon: Search,
    label: "فحص المنافذ",
    sublabel: "Port Scanner",
    desc: "فحص المنافذ الأساسية (80, 443, 22, 21) لأي مضيف ورؤية حالة كل منفذ.",
    component: PortScanTool,
  },
  {
    value: "whois",
    icon: FileText,
    label: "معلومات النطاق",
    sublabel: "WHOIS Lookup",
    desc: "معلومات تسجيل النطاق: تاريخ الإنشاء والانتهاء وخوادم الأسماء والمسجِّل.",
    component: WhoisTool,
  },
  {
    value: "ssl",
    icon: Lock,
    label: "فحص الشهادة الأمنية",
    sublabel: "SSL Checker",
    desc: "التحقق من صحة شهادة SSL/TLS وتاريخ انتهائها والجهة المُصدِرة.",
    component: SslTool,
  },
  {
    value: "url",
    icon: AlertTriangle,
    label: "فحص سلامة الروابط",
    sublabel: "URL Safety",
    desc: "تحليل الروابط واكتشاف التهديدات والمخاطر المحتملة ودرجة الأمان.",
    component: UrlSafetyTool,
  },
];

export default function Tools() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans" dir="rtl">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-2">أدوات الشبكات</h1>
          <p className="text-muted-foreground">
            اختر الأداة المناسبة وادخل البيانات المطلوبة للحصول على نتائج فورية
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3" dir="rtl">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const ToolComponent = tool.component;
            return (
              <AccordionItem
                key={tool.value}
                value={tool.value}
                className="bg-card border border-border rounded-xl px-0 py-0 overflow-hidden data-[state=open]:border-foreground/40 transition-all duration-200"
                data-testid={`accordion-${tool.value}`}
              >
                <AccordionTrigger className="hover:no-underline px-6 py-5 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 text-right">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-base">{tool.label}</span>
                        <span className="text-xs text-muted-foreground font-mono border border-border px-1.5 py-0.5 rounded hidden sm:inline">
                          {tool.sublabel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block text-right">
                        {tool.desc}
                      </p>
                    </div>
                    <span className="mr-auto flex-shrink-0 text-xs text-muted-foreground/60 font-mono">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-8 pt-2 border-t border-border bg-background/50">
                  <p className="text-muted-foreground text-sm mb-6 sm:hidden">{tool.desc}</p>
                  <ToolComponent />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </main>

      <Footer />
    </div>
  );
}
