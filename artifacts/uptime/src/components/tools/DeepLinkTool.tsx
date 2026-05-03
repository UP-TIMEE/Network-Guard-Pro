import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Link2,
  XCircle,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

/* ── Known-TLD whitelist ──────────────────────────────────────────────────── */

const KNOWN_TLDS = new Set([
  "com","net","org","edu","gov","mil","int","info","biz","name","pro","mobi",
  "coop","aero","museum","tel","travel","jobs","cat","post","xxx",
  "app","web","dev","ai","io","co","me","tv","cc","ws","bz","us","eu","cx",
  "online","site","store","shop","tech","digital","cloud","media","news",
  "agency","consulting","services","solutions","systems","global","group",
  "network","link","click","email","support","blog","wiki","forum",
  "sa","ae","eg","kw","qa","bh","om","jo","iq","sy","ly","tn","ma","dz","ye",
  "uk","de","fr","ru","cn","jp","kr","in","br","au","ca","it","es","nl","pl",
  "se","no","dk","fi","ch","at","be","pt","cz","hu","ro","bg","hr","gr","tr",
  "pk","bd","ng","za","mx","ar","cl","pe","ve",
]);

/* ── Strict URL validation ────────────────────────────────────────────────── */

type ValidationState = "empty" | "valid" | "invalid";

interface ValidationResult {
  state: ValidationState;
  messageAr: string;
  messageEn: string;
}

function validateUrl(raw: string): ValidationResult {
  const s = raw.trim();
  if (!s) return { state: "empty", messageAr: "", messageEn: "" };

  const hasScheme = /^https?:\/\//i.test(s);
  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(s) && !hasScheme) {
    return {
      state: "invalid",
      messageAr: "البروتوكول غير مدعوم — استخدم https:// أو http://",
      messageEn: "Unsupported scheme — use https:// or http://",
    };
  }

  const withScheme = hasScheme ? s : `https://${s}`;
  let hostname: string;
  try {
    hostname = new URL(withScheme).hostname.toLowerCase();
  } catch {
    return { state: "invalid", messageAr: "الرابط غير صالح — تحقق من الصيغة", messageEn: "Invalid URL — check the format" };
  }

  if (!hostname) return { state: "invalid", messageAr: "لم يُعثر على نطاق في الرابط", messageEn: "No hostname found in URL" };

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    const parts = hostname.split(".").map(Number);
    return parts.every((p) => p >= 0 && p <= 255)
      ? { state: "valid", messageAr: "", messageEn: "" }
      : { state: "invalid", messageAr: "عنوان IP غير صالح", messageEn: "Invalid IP address" };
  }

  if (!hostname.includes(".")) {
    return { state: "invalid", messageAr: "النطاق يجب أن يحتوي على امتداد (مثل .com أو .net أو .sa)", messageEn: "Domain must include a TLD (e.g. .com, .net, .sa)" };
  }

  const labels = hostname.split(".");
  const tld = labels[labels.length - 1];

  if (!/^[a-z]{2,8}$/.test(tld)) {
    return { state: "invalid", messageAr: `الامتداد ".${tld}" غير صالح`, messageEn: `Extension ".${tld}" is invalid` };
  }
  if (!KNOWN_TLDS.has(tld)) {
    return { state: "invalid", messageAr: `الامتداد ".${tld}" غير معروف — استخدم امتداداً صالحاً (.com, .net, .sa)`, messageEn: `".${tld}" is not a recognized extension` };
  }

  const labelRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
  const bad = labels.slice(0, -1).find((l) => !labelRegex.test(l));
  if (bad) return { state: "invalid", messageAr: `جزء النطاق "${bad}" يحتوي على أحرف غير مسموح بها`, messageEn: `Domain label "${bad}" contains invalid characters` };

  return { state: "valid", messageAr: "", messageEn: "" };
}

/* ── VirusTotal result type ───────────────────────────────────────────────── */

interface VtResult {
  url: string;
  safe: boolean;
  maliciousCount: number;
  totalEngines: number;
  threatNames: string[];
  stats: { malicious?: number; suspicious?: number; harmless?: number; undetected?: number };
  permalink: string;
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export function DeepLinkTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [inputValue, setInputValue]    = useState("");
  const [liveVal, setLiveVal]          = useState<ValidationResult>({ state: "empty", messageAr: "", messageEn: "" });
  const [isLoading, setIsLoading]      = useState(false);
  const [vtResult, setVtResult]        = useState<VtResult | null>(null);
  const [scanError, setScanError]      = useState<string | null>(null);
  const [scannedUrl, setScannedUrl]    = useState<string>("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputValue.trim()) { setLiveVal({ state: "empty", messageAr: "", messageEn: "" }); return; }
    debounceRef.current = setTimeout(() => setLiveVal(validateUrl(inputValue)), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUrl(inputValue);
    setLiveVal(validation);
    if (validation.state !== "valid") return;

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
        if (data?.error === "VT_API_KEY_MISSING") {
          setScanError(isRtl ? "مفتاح VirusTotal API غير مُضاف — يرجى إضافة VT_API_KEY في إعدادات البيئة" : "VirusTotal API key not configured — add VT_API_KEY to environment settings");
        } else if (data?.error === "ANALYSIS_TIMEOUT") {
          setScanError(isRtl ? "انتهت مهلة التحليل — حاول مرة أخرى بعد قليل" : "Analysis timed out — please try again shortly");
        } else {
          setScanError(data?.error ?? (isRtl ? "فشل الفحص" : "Scan failed"));
        }
        return;
      }

      setVtResult(data as VtResult);
    } catch {
      setScanError(isRtl ? "تعذر الاتصال بخادم الفحص — تحقق من اتصالك" : "Could not reach the scan server — check your connection");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBorder =
    liveVal.state === "valid"   ? "border-green-500 focus-visible:ring-green-500" :
    liveVal.state === "invalid" ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <div className="space-y-6" id="deeplink-report">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xl">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://example.com/path?param=value"
              data-testid="input-deeplink"
              className={`w-full font-mono pr-9 ${inputBorder}`}
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              disabled={isLoading}
            />
            {liveVal.state === "valid"   && <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />}
            {liveVal.state === "invalid" && <XCircle      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />}
          </div>
          <Button
            type="submit"
            disabled={isLoading || liveVal.state === "invalid"}
            data-testid="button-submit-deeplink"
            className="min-w-[90px]"
          >
            {isLoading ? <Spinner /> : (isRtl ? "فحص" : "Check")}
          </Button>
        </div>

        {liveVal.state === "invalid" && (
          <div className="flex items-start gap-2 text-destructive text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>{isRtl ? liveVal.messageAr : liveVal.messageEn}</span>
          </div>
        )}
        {liveVal.state === "valid" && !isLoading && (
          <div className="flex items-center gap-2 text-green-500 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{isRtl ? "الرابط صالح — يمكنك الفحص" : "URL looks valid — ready to scan"}</span>
          </div>
        )}
      </form>

      {/* Loading state */}
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

      {/* Error */}
      {scanError && !isLoading && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{scanError}</span>
        </div>
      )}

      {/* VirusTotal Results */}
      {vtResult && !isLoading && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <img src="https://www.virustotal.com/gui/images/favicon.png" alt="VT" className="h-4 w-4 opacity-80" />
              {isRtl ? "نتائج VirusTotal" : "VirusTotal Results"}
            </h3>
            <ExportButton targetId="deeplink-report" filename="virustotal-report.pdf" />
          </div>

          {/* Main verdict */}
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

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { key: "malicious",  labelAr: "خطير",     labelEn: "Malicious",  color: "text-red-400" },
              { key: "suspicious", labelAr: "مشبوه",    labelEn: "Suspicious", color: "text-orange-400" },
              { key: "harmless",   labelAr: "آمن",      labelEn: "Harmless",   color: "text-green-400" },
              { key: "undetected", labelAr: "غير محدد", labelEn: "Undetected", color: "text-muted-foreground" },
            ].map(({ key, labelAr, labelEn, color }) => (
              <div key={key} className="bg-muted/20 border border-border/50 rounded-lg p-3">
                <div className={`text-2xl font-black ${color}`}>
                  {vtResult.stats[key as keyof typeof vtResult.stats] ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{isRtl ? labelAr : labelEn}</div>
              </div>
            ))}
          </div>

          {/* URL Details + Threat Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-muted/20 border border-border/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                {isRtl ? "تفاصيل الرابط" : "URL Details"}
              </h4>
              {(() => {
                try {
                  const u = new URL(scannedUrl);
                  return (
                    <div className="space-y-1 text-xs">
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
                } catch {
                  return null;
                }
              })()}
            </div>

            {vtResult.threatNames.length > 0 ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {isRtl ? "محركات صنّفته خطراً" : "Engines that flagged it"}
                </h4>
                <ul className="space-y-1">
                  {vtResult.threatNames.map((engine, i) => (
                    <li key={i} className="text-xs text-destructive flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block flex-shrink-0" />
                      {engine}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-400 flex-shrink-0" />
                <span className="text-sm text-green-400 font-medium">
                  {isRtl ? "لا توجد محركات صنّفته تهديداً" : "No engines flagged this URL"}
                </span>
              </div>
            )}
          </div>

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
