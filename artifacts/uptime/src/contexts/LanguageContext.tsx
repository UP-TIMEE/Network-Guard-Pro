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
      learnMore: "اعرف المزيد",
      stat1: "فحص يومي",
      stat2: "بروتوكول مدعوم",
      stat3: "أداة أمنية",
    },
    home: {
      sectionTitle: "اختر ما تريد",
      sectionSub: "ثلاثة محاور أساسية لبناء كفاءتك في أمن الشبكات",
      card1Title: "أدوات الشبكات",
      card1Desc: "9 أدوات تقنية متكاملة للتحليل والفحص والتخطيط",
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

      ipCalc: { label: "حاسبة IPv4", sublabel: "IP Calculator", desc: "حساب عنوان الشبكة والبث والمضيفين من IP ومعدل البادئة CIDR." },
      cidr: { label: "محول CIDR", sublabel: "CIDR Converter", desc: "التحويل بين نموذج CIDR وقناع الشبكة مع العرض الثنائي." },
      bandwidth: { label: "حاسبة النطاق الترددي", sublabel: "Bandwidth Calc", desc: "حساب وقت نقل البيانات بناءً على الحجم وسرعة الاتصال." },
      geoip: { label: "تحديد الموقع الجغرافي", sublabel: "Geolocation", desc: "تحديد الموقع الجغرافي ومعلومات مزود الخدمة لأي عنوان IP أو نطاق." },
      dns: { label: "فحص سجلات الـ DNS", sublabel: "DNS Lookup", desc: "استخراج سجلات DNS من النوع A وMX وTXT لأي نطاق." },
      mac: { label: "تحديد المصنّع", sublabel: "MAC Vendor", desc: "معرفة الشركة المصنعة للجهاز من خلال عنوان MAC الخاص بالشبكة." },
      emailHeader: { label: "محلل ترويسة الإيميل", sublabel: "Email Header", desc: "تحليل ترويسة الرسائل الإلكترونية وعرض مسار التوجيه والبيانات الوصفية." },
      deepLink: { label: "فحص الروابط العميق", sublabel: "Deep Link Check", desc: "فحص شامل للروابط واكتشاف التهديدات والمحتوى الضار." },
      password: { label: "اختبار قوة كلمة المرور", sublabel: "Password Strength", desc: "تقييم قوة كلمة المرور ومستوى أمانها مع اقتراحات التحسين." },
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
      learnMore: "Learn More",
      stat1: "Daily Scans",
      stat2: "Supported Protocols",
      stat3: "Security Tools",
    },
    home: {
      sectionTitle: "Choose Your Path",
      sectionSub: "Three core pillars to build your network security expertise",
      card1Title: "Network Tools",
      card1Desc: "9 integrated technical tools for analysis, scanning, and planning",
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

      ipCalc: { label: "IPv4 Calculator", sublabel: "IP Calculator", desc: "Calculate network address, broadcast, and host range from an IP and CIDR prefix." },
      cidr: { label: "CIDR Converter", sublabel: "CIDR Converter", desc: "Convert between CIDR notation and subnet mask with binary display." },
      bandwidth: { label: "Bandwidth Calculator", sublabel: "Bandwidth Calc", desc: "Calculate data transfer time based on file size and connection speed." },
      geoip: { label: "IP Geolocation", sublabel: "Geolocation", desc: "Locate any IP or domain geographically with ISP info and an interactive map." },
      dns: { label: "DNS Lookup", sublabel: "DNS Lookup", desc: "Extract A, MX, and TXT DNS records for any domain." },
      mac: { label: "MAC Vendor Lookup", sublabel: "MAC Vendor", desc: "Identify the device manufacturer from a MAC address." },
      emailHeader: { label: "Email Header Analyzer", sublabel: "Email Header", desc: "Analyze email headers to reveal routing paths and metadata." },
      deepLink: { label: "Deep Link Check", sublabel: "Deep Link Check", desc: "Comprehensive URL scanning to detect threats and malicious content." },
      password: { label: "Password Strength Test", sublabel: "Password Strength", desc: "Evaluate password strength and security level with improvement suggestions." },
    },
    footer: {
      devBy: "Developed by",
      supervision: "Under supervision of",
      year: "2025",
    },
  },
} as const;

type TranslationKey<T> = T extends Record<string, unknown>
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${TranslationKey<T[K]>}` : never }[keyof T]
  : never;

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
    document.documentElement.style.fontFamily = l === "ar" ? "'Cairo', sans-serif" : "'Cairo', sans-serif";
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
