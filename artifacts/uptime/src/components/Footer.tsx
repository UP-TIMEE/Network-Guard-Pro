import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="font-medium">
          {t("footer.devBy")}:{" "}
          <span className="text-foreground font-semibold">نعمان الأنصاري</span>{" "}
          {t("footer.devBy") === "تم التطوير بواسطة" ? "و" : "&"}{" "}
          <span className="text-foreground font-semibold">بلال باجرون</span>
        </div>
        <div className="font-medium">
          {t("footer.supervision")}:{" "}
          <span className="text-foreground font-semibold">
            المهندس عبد الرحمن المنتشري
          </span>
        </div>
        <div className="font-mono text-xs opacity-60">UPTIME &copy; {t("footer.year")}</div>
      </div>
    </footer>
  );
}
