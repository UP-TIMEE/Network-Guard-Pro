import { useLanguage } from "@/contexts/LanguageContext";
import { Mail } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();
  const isAr = t("footer.devBy") === "تم التطوير بواسطة";

  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">

        {/* Left — dev credits */}
        <div className="font-medium">
          {t("footer.devBy")}:{" "}
          <span className="text-foreground font-semibold">نعمان الأنصاري</span>{" "}
          {isAr ? "و" : "&"}{" "}
          <span className="text-foreground font-semibold">بلال باجرون</span>
        </div>

        {/* Center — supervision */}
        <div className="font-medium">
          {t("footer.supervision")}:{" "}
          <span className="text-foreground font-semibold">المهندس عبد الرحمن المنتشري</span>
        </div>

        {/* Right — copyright + support button */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs opacity-50">UPTIME © {t("footer.year")}</span>

          <a
            href="mailto:BELALBAJARWAN3@GMAIL.COM"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-transparent text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted transition-all duration-200"
            title={isAr ? "تواصل مع الدعم الفني" : "Contact Support"}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>{isAr ? "الدعم الفني" : "Support"}</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
