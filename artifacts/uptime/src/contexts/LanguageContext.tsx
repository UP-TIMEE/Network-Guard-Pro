import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "ar" | "en";

export const translations = {
  ar: {
    nav: {
      home: "الرئيسية",
      tools: "أدوات الشبكات",
      lightMode: "الوضع الفاتح",
      darkMode: "الوضع الداكن",
    },
    hero: {
      badge: "منصة أمن الشبكات الاحترافية",
      subtitle: "منصة احترافية لتعزيز مهاراتك وكفاءتك في الشبكات",
      startNow: "ابدأ الآن",
      aboutUs: "نبذة عنا",
      stat1: "فحص يومي",
      stat2: "أداة أمنية",
      aboutTitle: "عن منصة UPTIME",
      aboutDesc: "UPTIME هي منصة متخصصة في أمن الشبكات تجمع أدوات التشخيص والتحليل في مكان واحد. هدفها مركزة الأدوات التقنية وتعزيز الوعي الأمني لدى المتخصصين والمتعلمين في مجال الشبكات وأمن المعلومات.",
      aboutClose: "إغلاق",
    },
    home: {
      sectionTitle: "اختر ما تريد",
      sectionSub: "ثلاثة محاور أساسية لبناء كفاءتك في أمن الشبكات",
      card1Title: "أدوات الشبكات",
      card1Desc: "12 أداة تقنية متكاملة للتحليل والفحص والتخطيط",
      card2Title: "تدريب ومحاكاة",
      card2Desc: "سيناريوهات تدريبية واختبارات عملية لرفع كفاءتك",
      card3Title: "آخر المستجدات",
      card3Desc: "أحدث الأخبار والتقارير في مجال أمن المعلومات",
      soon: "قريباً",
    },
    tools: {
      pageTitle: "أدوات الشبكات",
      pageDesc: "اختر الأداة المناسبة وادخل البيانات المطلوبة للحصول على نتائج فورية",
      module1: "وحدة التخطيط",
      module2: "وحدة الفحص",
      module3: "وحدة التحليل",
      check: "فحص",
      calculate: "احسب",
      analyze: "تحليل",
      results: "نتائج الفحص",
      export: "تصدير PDF",
      checkError: "فشل الفحص - تأكد من صحة البيانات المدخلة",
      noRecords: "لم يتم العثور على سجلات",

      ipCalc:    { label: "حاسبة IPv4",                  sublabel: "IP Calculator",      desc: "حساب عنوان الشبكة والبث والمضيفين من IP ومعدل البادئة CIDR." },
      cidr:      { label: "محول CIDR",                   sublabel: "CIDR Converter",     desc: "التحويل بين نموذج CIDR وقناع الشبكة مع العرض الثنائي." },
      bandwidth: { label: "حاسبة النطاق الترددي",         sublabel: "Bandwidth Calc",     desc: "حساب وقت نقل البيانات بناءً على الحجم وسرعة الاتصال." },
      ipv6:      { label: "ضاغط IPv6",                   sublabel: "IPv6 Compressor",    desc: "ضغط وتوسيع عناوين IPv6 وتحديد نوعها وإحصاءاتها." },
      geoip:     { label: "تحديد الموقع الجغرافي",        sublabel: "Geolocation",        desc: "تحديد الموقع الجغرافي ومعلومات مزود الخدمة لأي عنوان IP أو نطاق." },
      dns:       { label: "فحص سجلات الـ DNS",           sublabel: "DNS Lookup",         desc: "استخراج سجلات DNS من النوع A وMX وTXT لأي نطاق." },
      portScan:  { label: "فحص المنافذ البسيط",           sublabel: "Port Scanner",       desc: "فحص سريع للمنافذ الشائعة (80، 443، 22، 21 وغيرها) لأي مضيف." },
      mac:       { label: "تحديد المصنّع",                sublabel: "MAC Vendor",         desc: "معرفة الشركة المصنعة للجهاز من خلال عنوان MAC الخاص بالشبكة." },
      emailHeader: { label: "محلل ترويسة الإيميل",        sublabel: "Email Header",       desc: "تحليل ترويسة الرسائل الإلكترونية وعرض مسار التوجيه والبيانات الوصفية." },
      deepLink:  { label: "فحص الروابط العميق",           sublabel: "Deep Link Check",    desc: "فحص شامل للروابط واكتشاف التهديدات والمحتوى الضار." },
      password:  { label: "اختبار قوة كلمة المرور",       sublabel: "Password Strength",  desc: "تقييم قوة كلمة المرور ومستوى أمانها مع اقتراحات التحسين." },
      ping:      { label: "اختبار Ping والكمون",          sublabel: "Ping & Latency",     desc: "قياس زمن استجابة المضيف وجودة الاتصال بإرسال 4 حزم اختبارية." },
    },
    footer: {
      devBy: "تم التطوير بواسطة",
      supervision: "بإشراف",
      year: "2025",
    },
  },

  en: {
    nav: {
      home: "Home",
      tools: "Network Tools",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
    },
    hero: {
      badge: "Professional Network Security Platform",
      subtitle: "A professional platform to enhance your network skills and efficiency",
      startNow: "Get Started",
      aboutUs: "About Us",
      stat1: "Daily Scans",
      stat2: "Security Tools",
      aboutTitle: "About UPTIME",
      aboutDesc: "UPTIME is a specialized network security platform that centralizes diagnostic and analysis tools in one place. Its goal is to consolidate technical tools and raise security awareness among professionals and learners in networking and information security.",
      aboutClose: "Close",
    },
    home: {
      sectionTitle: "Choose Your Path",
      sectionSub: "Three core pillars to build your network security expertise",
      card1Title: "Network Tools",
      card1Desc: "12 integrated technical tools for analysis, scanning, and planning",
      card2Title: "Training & Simulation",
      card2Desc: "Training scenarios and practical tests to boost your skills",
      card3Title: "Latest Updates",
      card3Desc: "Latest news and reports in information security",
      soon: "Coming Soon",
    },
    tools: {
      pageTitle: "Network Tools",
      pageDesc: "Select the right tool and enter the required data for instant results",
      module1: "Planning Module",
      module2: "Scan Module",
      module3: "Analysis Module",
      check: "Scan",
      calculate: "Calculate",
      analyze: "Analyze",
      results: "Scan Results",
      export: "Export PDF",
      checkError: "Scan failed - please verify your input",
      noRecords: "No records found",

      ipCalc:    { label: "IPv4 Calculator",         sublabel: "IP Calculator",      desc: "Calculate network address, broadcast, and host range from an IP and CIDR prefix." },
      cidr:      { label: "CIDR Converter",          sublabel: "CIDR Converter",     desc: "Convert between CIDR notation and subnet mask with binary display." },
      bandwidth: { label: "Bandwidth Calculator",    sublabel: "Bandwidth Calc",     desc: "Calculate data transfer time based on file size and connection speed." },
      ipv6:      { label: "IPv6 Compressor",         sublabel: "IPv6 Compressor",    desc: "Compress and expand IPv6 addresses, identify their type and statistics." },
      geoip:     { label: "IP Geolocation",          sublabel: "Geolocation",        desc: "Locate any IP or domain geographically with ISP info and an interactive map." },
      dns:       { label: "DNS Lookup",              sublabel: "DNS Lookup",         desc: "Extract A, MX, and TXT DNS records for any domain." },
      portScan:  { label: "Simple Port Scanner",     sublabel: "Port Scanner",       desc: "Quick scan of common ports (80, 443, 22, 21 and more) for any host." },
      mac:       { label: "MAC Vendor Lookup",       sublabel: "MAC Vendor",         desc: "Identify the device manufacturer from a MAC address." },
      emailHeader: { label: "Email Header Analyzer", sublabel: "Email Header",       desc: "Analyze email headers to reveal routing paths and metadata." },
      deepLink:  { label: "Deep Link Check",         sublabel: "Deep Link Check",    desc: "Comprehensive URL scanning to detect threats and malicious content." },
      password:  { label: "Password Strength Test",  sublabel: "Password Strength",  desc: "Evaluate password strength and security level with improvement suggestions." },
      ping:      { label: "Ping & Latency Test",     sublabel: "Ping & Latency",     desc: "Measure host response time and connection quality by sending 4 test packets." },
    },
    footer: {
      devBy: "Developed by",
      supervision: "Under supervision of",
      year: "2025",
    },
  },
} as const;

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  tAny: (key: string) => any;
  dir: "rtl" | "ltr";
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  t: (k) => k,
  tAny: (k) => k,
  dir: "rtl",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("uptime_lang") as Lang) || "ar";
    } catch {
      return "ar";
    }
  });

  const applyLang = (l: Lang) => {
    document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", l);
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("uptime_lang", l); } catch {}
    applyLang(l);
  };

  useEffect(() => {
    applyLang(lang);
  }, []);

  const traverse = (key: string): any => {
    const parts = key.split(".");
    let result: any = translations[lang];
    for (const p of parts) {
      if (result == null) return key;
      result = result[p];
    }
    return result;
  };

  const t = (key: string): string => {
    const val = traverse(key);
    return typeof val === "string" ? val : key;
  };

  const tAny = (key: string): any => traverse(key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tAny, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
