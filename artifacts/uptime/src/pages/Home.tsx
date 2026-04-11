import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GeoIpTool } from "@/components/tools/GeoIpTool";
import { DnsTool } from "@/components/tools/DnsTool";
import { MacTool } from "@/components/tools/MacTool";
import { PortScanTool } from "@/components/tools/PortScanTool";
import { WhoisTool } from "@/components/tools/WhoisTool";
import { SslTool } from "@/components/tools/SslTool";
import { UrlSafetyTool } from "@/components/tools/UrlSafetyTool";
import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 shadow-sm shadow-black/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">UPTIME</h1>
            <p className="text-xs text-muted-foreground font-medium">منصة الوعي الأمني المتقدمة</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="text-center space-y-4 py-8">
          <h2 className="text-4xl font-bold text-foreground">أدوات الفحص والتحليل</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            مجموعة متكاملة من الأدوات الأمنية المخصصة لمهندسي الشبكات والمختصين في الأمن السيبراني.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4" dir="rtl">
          <AccordionItem value="geoip" className="bg-card border border-card-border rounded-xl px-6 py-2 shadow-sm data-[state=open]:border-primary/50 data-[state=open]:shadow-primary/5 transition-all">
            <AccordionTrigger className="hover:no-underline text-lg font-bold text-foreground hover:text-primary transition-colors">
              <div className="flex items-center gap-3">
                تتبع الموقع الجغرافي (IP/Domain Geolocation)
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <p className="text-muted-foreground mb-6">تحديد الموقع الجغرافي ومعلومات مزود الخدمة لأي عنوان IP أو نطاق.</p>
              <GeoIpTool />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="dns" className="bg-card border border-card-border rounded-xl px-6 py-2 shadow-sm data-[state=open]:border-primary/50 data-[state=open]:shadow-primary/5 transition-all">
            <AccordionTrigger className="hover:no-underline text-lg font-bold text-foreground hover:text-primary transition-colors">
              <div className="flex items-center gap-3">
                فحص سجلات DNS
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <p className="text-muted-foreground mb-6">استخراج سجلات DNS لنطاق معين وعرضها بشكل منظم.</p>
              <DnsTool />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mac" className="bg-card border border-card-border rounded-xl px-6 py-2 shadow-sm data-[state=open]:border-primary/50 data-[state=open]:shadow-primary/5 transition-all">
            <AccordionTrigger className="hover:no-underline text-lg font-bold text-foreground hover:text-primary transition-colors">
              <div className="flex items-center gap-3">
                تحديد المصنّع (MAC Vendor)
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <p className="text-muted-foreground mb-6">معرفة الشركة المصنعة لبطاقة الشبكة باستخدام عنوان MAC.</p>
              <MacTool />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="port" className="bg-card border border-card-border rounded-xl px-6 py-2 shadow-sm data-[state=open]:border-primary/50 data-[state=open]:shadow-primary/5 transition-all">
            <AccordionTrigger className="hover:no-underline text-lg font-bold text-foreground hover:text-primary transition-colors">
              <div className="flex items-center gap-3">
                فحص المنافذ (Port Scanner)
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <p className="text-muted-foreground mb-6">فحص المنافذ الشائعة لمضيف معين للتحقق من المنافذ المفتوحة والمغلقة.</p>
              <PortScanTool />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="whois" className="bg-card border border-card-border rounded-xl px-6 py-2 shadow-sm data-[state=open]:border-primary/50 data-[state=open]:shadow-primary/5 transition-all">
            <AccordionTrigger className="hover:no-underline text-lg font-bold text-foreground hover:text-primary transition-colors">
              <div className="flex items-center gap-3">
                معلومات النطاق (WHOIS)
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <p className="text-muted-foreground mb-6">الاستعلام عن معلومات تسجيل النطاقات، تواريخ الإنشاء والانتهاء.</p>
              <WhoisTool />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ssl" className="bg-card border border-card-border rounded-xl px-6 py-2 shadow-sm data-[state=open]:border-primary/50 data-[state=open]:shadow-primary/5 transition-all">
            <AccordionTrigger className="hover:no-underline text-lg font-bold text-foreground hover:text-primary transition-colors">
              <div className="flex items-center gap-3">
                فحص الشهادة الأمنية (SSL Checker)
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <p className="text-muted-foreground mb-6">التحقق من صحة وصلاحية شهادات SSL/TLS للمواقع الإلكترونية.</p>
              <SslTool />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="url" className="bg-card border border-card-border rounded-xl px-6 py-2 shadow-sm data-[state=open]:border-primary/50 data-[state=open]:shadow-primary/5 transition-all">
            <AccordionTrigger className="hover:no-underline text-lg font-bold text-foreground hover:text-primary transition-colors">
              <div className="flex items-center gap-3">
                فحص سلامة الروابط (URL Safety)
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <p className="text-muted-foreground mb-6">التحقق من سلامة الروابط واكتشاف التهديدات والبرمجيات الخبيثة.</p>
              <UrlSafetyTool />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <Footer />
    </div>
  );
}
