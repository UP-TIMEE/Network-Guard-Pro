import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Link2,
  XCircle,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
  HelpCircle,
} from "lucide-react";

/* ── TLD validation: accept any 2-10 alphabetic character TLD ─────────────── */
const VALID_TLD_RE = /^[a-z]{2,10}$/i;

/* ── Strict URL validation (onSubmit only) ───────────────────────────────── */

function validateUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "ar:الرجاء إدخال رابط|en:Please enter a URL";

  const hasScheme = /^https?:\/\//i.test(s);
  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(s) && !hasScheme)
    return "ar:البروتوكول غير مدعوم — استخدم https:// أو http://|en:Unsupported scheme — use https:// or http://";

  const withScheme = hasScheme ? s : `https://${s}`;
  let hostname: string;
  try { hostname = new URL(withScheme).hostname.toLowerCase(); }
  catch { return "ar:الرابط غير صالح — تحقق من الصيغة|en:Invalid URL — check the format"; }

  if (!hostname) return "ar:لم يُعثر على نطاق في الرابط|en:No hostname found in URL";

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    const parts = hostname.split(".").map(Number);
    return parts.every((p) => p >= 0 && p <= 255)
      ? null
      : "ar:عنوان IP غير صالح|en:Invalid IP address";
  }

  if (!hostname.includes("."))
    return "ar:النطاق يجب أن يحتوي على امتداد (.com, .net, .sa)|en:Domain must include a TLD (.com, .net, .sa)";

  const labels = hostname.split(".");
  const tld = labels[labels.length - 1];

  if (!VALID_TLD_RE.test(tld))
    return `ar:الامتداد ".${tld}" غير صالح — يجب أن يتكون من حروف فقط (2-10 أحرف)|en:Extension ".${tld}" is invalid — must be 2-10 alphabetic characters`;

  const labelRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
  const bad = labels.slice(0, -1).find((l) => !labelRegex.test(l));
  if (bad)
    return `ar:جزء النطاق "${bad}" يحتوي على أحرف غير مسموح بها|en:Domain label "${bad}" contains invalid characters`;

  return null;
}

function msg(raw: string, isRtl: boolean) {
  const [ar, en] = raw.split("|");
  return isRtl ? ar.replace("ar:", "") : en.replace("en:", "");
}

/* ── Engine result types ─────────────────────────────────────────────────── */

interface EngineEntry { engine: string; category: string; result: string }

interface VtResult {
  url: string;
  safe: boolean;
  maliciousCount: number;
  totalEngines: number;
  threatNames: string[];
  engineResults: EngineEntry[];
  stats: Record<string, number>;
  permalink: string;
}

/* ── Engine category helpers ─────────────────────────────────────────────── */

const THREAT_CATS = new Set(["malicious", "phishing", "suspicious"]);
const CLEAN_CATS  = new Set(["harmless", "clean"]);

function categoryIcon(cat: string) {
  if (THREAT_CATS.has(cat))
    return <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />;
  if (CLEAN_CATS.has(cat))
    return <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />;
  return <MinusCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />;
}

function categoryLabel(cat: string, isRtl: boolean): { text: string; cls: string } {
  if (cat === "malicious")  return { text: isRtl ? "خطير"       : "Malicious",  cls: "text-destructive" };
  if (cat === "phishing")   return { text: isRtl ? "تصيّد"      : "Phishing",   cls: "text-destructive" };
  if (cat === "suspicious") return { text: isRtl ? "مشبوه"      : "Suspicious", cls: "text-orange-400"  };
  if (CLEAN_CATS.has(cat))  return { text: isRtl ? "آمن"        : "Clean",      cls: "text-green-500"   };
  return                           { text: isRtl ? "غير محدد"   : "Undetected", cls: "text-muted-foreground" };
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export function DeepLinkTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [inputValue, setInputValue] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [vtResult, setVtResult]     = useState<VtResult | null>(null);
  const [scanError, setScanError]   = useState<string | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Validate only on submit ──
    const validationErr = validateUrl(inputValue);
    if (validationErr) {
      setSubmitError(msg(validationErr, isRtl));
      return;
    }
    setSubmitError(null);

    let url = inputValue.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    setIsLoading(true);
    setVtResult(null);
    setScanError(null);
    setScannedUrl(url);

    try {
      const resp = await fetch("/api/tools/virustotal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        if (data?.error === "VT_API_KEY_MISSING")
          setScanError(isRtl ? "مفتاح VirusTotal API غير مُضاف في إعدادات البيئة (VT_API_KEY)" : "VirusTotal API key not configured — add VT_API_KEY to environment settings");
        else if (data?.error === "ANALYSIS_TIMEOUT")
          setScanError(isRtl ? "انتهت مهلة التحليل — حاول مرة أخرى بعد قليل" : "Analysis timed out — please try again shortly");
        else
          setScanError(data?.error ?? (isRtl ? "فشل الفحص" : "Scan failed"));
        return;
      }
      setVtResult(data as VtResult);
    } catch {
      setScanError(isRtl ? "تعذر الاتصال بخادم الفحص — تحقق من اتصالك" : "Could not reach the scan server — check your connection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="deeplink-report">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xl">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (submitError) setSubmitError(null);
            }}
            placeholder="https://example.com/path?param=value"
            data-testid="input-deeplink"
            className={`flex-1 font-mono ${submitError ? "border-destructive focus-visible:ring-destructive" : ""}`}
            dir="ltr"
            autoComplete="off"
            spellCheck={false}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-submit-deeplink"
            className="min-w-[90px]"
          >
            {isLoading ? <Spinner /> : (isRtl ? "فحص" : "Check")}
          </Button>
        </div>

        {/* Validation error — shown only after submit */}
        {submitError && (
          <div className="flex items-start gap-2 text-destructive text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
      </form>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-10 text-muted-foreground">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <ShieldAlert className="absolute inset-0 m-auto h-6 w-6 text-primary" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">{isRtl ? "جارٍ الفحص عبر VirusTotal…" : "Scanning via VirusTotal…"}</p>
            <p className="text-xs">{isRtl ? "قد يستغرق الفحص حتى 30 ثانية" : "This may take up to 30 seconds"}</p>
          </div>
        </div>
      )}

      {/* API error */}
      {scanError && !isLoading && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{scanError}</span>
        </div>
      )}

      {/* Results */}
      {vtResult && !isLoading && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <img src="https://www.virustotal.com/gui/images/favicon.png" alt="VT" className="h-4 w-4 opacity-80" />
              {isRtl ? "نتائج VirusTotal" : "VirusTotal Results"}
            </h3>
            <ExportButton targetId="deeplink-report" filename="virustotal-report.pdf" />
          </div>

          {/* Verdict banner */}
          {vtResult.safe ? (
            <div className="flex items-center gap-4 p-5 rounded-xl border bg-green-500/10 border-green-500/30 text-green-400">
              <ShieldCheck className="h-10 w-10 flex-shrink-0" />
              <div>
                <div className="text-xl font-black">
                  {isRtl ? "✅ آمن 100% — لم يتم اكتشاف أي تهديدات" : "✅ 100% Safe — No threats detected"}
                </div>
                <div className="text-sm opacity-75 mt-0.5">
                  {isRtl
                    ? `تم فحصه بواسطة ${vtResult.totalEngines} محرك أمني ولم يُكتشف أي تهديد`
                    : `Scanned by ${vtResult.totalEngines} security engines — all clear`}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-5 rounded-xl border bg-destructive/10 border-destructive/30 text-destructive">
              <ShieldAlert className="h-10 w-10 flex-shrink-0" />
              <div>
                <div className="text-xl font-black">
                  {isRtl
                    ? `⚠️ تحذير عالي الخطورة: تم تصنيف هذا الرابط كتهديد من قبل ${vtResult.maliciousCount} محركات أمنية`
                    : `⚠️ HIGH RISK: Flagged as threat by ${vtResult.maliciousCount} security engine${vtResult.maliciousCount !== 1 ? "s" : ""}`}
                </div>
                <div className="text-sm opacity-75 mt-0.5 font-mono break-all" dir="ltr">{scannedUrl}</div>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { key: "malicious",  labelAr: "خطير",     labelEn: "Malicious",  color: "text-red-400" },
              { key: "suspicious", labelAr: "مشبوه",    labelEn: "Suspicious", color: "text-orange-400" },
              { key: "harmless",   labelAr: "آمن",      labelEn: "Harmless",   color: "text-green-400" },
              { key: "undetected", labelAr: "غير محدد", labelEn: "Undetected", color: "text-muted-foreground" },
            ].map(({ key, labelAr, labelEn, color }) => (
              <div key={key} className="bg-muted/20 border border-border/50 rounded-lg p-3">
                <div className={`text-2xl font-black ${color}`}>
                  {vtResult.stats[key] ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{isRtl ? labelAr : labelEn}</div>
              </div>
            ))}
          </div>

          {/* URL details */}
          <div className="bg-muted/20 border border-border/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              {isRtl ? "تفاصيل الرابط" : "URL Details"}
            </h4>
            {(() => {
              try {
                const u = new URL(scannedUrl);
                return (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {[
                      { label: isRtl ? "البروتوكول" : "Protocol", val: u.protocol },
                      { label: isRtl ? "النطاق"     : "Domain",   val: u.hostname },
                      { label: isRtl ? "المسار"     : "Path",     val: u.pathname || "/" },
                      { label: isRtl ? "المعاملات"  : "Params",   val: u.search || (isRtl ? "لا يوجد" : "None") },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-mono text-foreground break-all" dir="ltr">{row.val}</span>
                      </div>
                    ))}
                  </div>
                );
              } catch { return null; }
            })()}
          </div>

          {/* ── Engine Details Accordion ── */}
          {(vtResult.engineResults?.length ?? 0) > 0 && (
            <Accordion type="single" collapsible className="border border-border/50 rounded-lg overflow-hidden">
              <AccordionItem value="engines" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{isRtl ? "تفاصيل المحركات الأمنية" : "Security Vendors"}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      ({vtResult.totalEngines} {isRtl ? "محرك" : "engines"})
                    </span>
                    {vtResult.maliciousCount > 0 && (
                      <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                        {vtResult.maliciousCount} {isRtl ? "تهديد" : "threat(s)"}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-border/30">
                    {vtResult.engineResults.map((entry) => {
                      const { text, cls } = categoryLabel(entry.category, isRtl);
                      const isThreat = THREAT_CATS.has(entry.category);
                      return (
                        <div
                          key={entry.engine}
                          className={`flex items-center justify-between gap-2 px-3 py-2 text-xs bg-background
                            ${isThreat ? "bg-destructive/5" : ""}`}
                        >
                          <span className="font-medium text-foreground truncate" title={entry.engine}>
                            {entry.engine}
                          </span>
                          <div className={`flex items-center gap-1.5 flex-shrink-0 ${cls}`}>
                            {categoryIcon(entry.category)}
                            <span className="font-semibold whitespace-nowrap">{text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* VT permalink */}
          <a
            href={vtResult.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {isRtl ? "عرض التقرير الكامل على VirusTotal" : "View full report on VirusTotal"}
          </a>
        </div>
      )}
    </div>
  );
}
