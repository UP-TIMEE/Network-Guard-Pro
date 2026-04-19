import { useLanguage } from "@/contexts/LanguageContext";
import { Wrench } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();
  const isAr = t("footer.devBy") === "تم التطوير بواسطة";

  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="font-medium">
          {t("footer.devBy")}:{" "}
          <span className="text-foreground font-semibold">نعمان الأنصاري</span>{" "}
          {isAr ? "و" : "&"}{" "}
          <span className="text-foreground font-semibold">بلال باجرون</span>
        </div>
        <div className="font-medium">
          {t("footer.supervision")}:{" "}
          <span className="text-foreground font-semibold">المهندس عبد الرحمن المنتشري</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs opacity-60">
          <span>UPTIME &copy; {t("footer.year")}</span>
          <span className="opacity-40">|</span>
          <a
            href="mailto:BELALBAJARWAN3@GMAIL.COM"
            className="flex items-center gap-1 opacity-60 hover:opacity-100 hover:text-primary transition-all duration-150"
            title={isAr ? "تواصل مع الدعم الفني" : "Contact Support"}
          >
            <Wrench className="h-3 w-3" />
            <span>{isAr ? "الدعم الفني" : "Support"}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
