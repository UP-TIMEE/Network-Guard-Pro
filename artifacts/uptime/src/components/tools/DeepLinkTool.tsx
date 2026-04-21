import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUrlSafetyCheck, getUrlSafetyCheckQueryKey } from "@workspace/api-client-react";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Link2,
  XCircle,
  CheckCircle2,
} from "lucide-react";

/* ── Known-TLD whitelist ──────────────────────────────────────────────────── */

const KNOWN_TLDS = new Set([
  // Generic
  "com","net","org","edu","gov","mil","int","info","biz","name","pro","mobi",
  "coop","aero","museum","tel","travel","jobs","cat","post","xxx",
  // New Generic
  "app","web","dev","ai","io","co","me","tv","cc","ws","bz","us","eu","cx",
  "online","site","store","shop","tech","digital","cloud","media","news",
  "agency","consulting","services","solutions","systems","global","group",
  "network","link","click","email","support","blog","wiki","forum",
  // Country codes — Arab world + common
  "sa","ae","eg","kw","qa","bh","om","jo","iq","sy","ly","tn","ma","dz","ye",
  "uk","de","fr","ru","cn","jp","kr","in","br","au","ca","it","es","nl","pl",
  "se","no","dk","fi","ch","at","be","pt","cz","hu","ro","bg","hr","gr","tr",
  "pk","bd","ng","za","mx","ar","cl","pe","co","ve",
  // Sponsored / special
  "museum","int","arpa","gov","mil",
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

  // Must start with http/https OR be a bare domain/IP
  const hasScheme = /^https?:\/\//i.test(s);

  // If it has a scheme, require it to be http or https (reject ftp://, javascript:// etc.)
  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(s) && !hasScheme) {
    return {
      state: "invalid",
      messageAr: "البروتوكول غير مدعوم — استخدم https:// أو http://",
      messageEn: "Unsupported scheme — use https:// or http://",
    };
  }

  const withScheme = hasScheme ? s : `https://${s}`;

  let hostname: string;
  let url: URL;
  try {
    url = new URL(withScheme);
    hostname = url.hostname.toLowerCase();
  } catch {
    return {
      state: "invalid",
      messageAr: "الرابط غير صالح — تحقق من الصيغة",
      messageEn: "Invalid URL — check the format",
    };
  }

  if (!hostname) {
    return {
      state: "invalid",
      messageAr: "لم يُعثر على نطاق في الرابط",
      messageEn: "No hostname found in URL",
    };
  }

  // Allow valid IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    const parts = hostname.split(".").map(Number);
    if (parts.every((p) => p >= 0 && p <= 255)) {
      return { state: "valid", messageAr: "", messageEn: "" };
    }
    return {
      state: "invalid",
      messageAr: "عنوان IP غير صالح",
      messageEn: "Invalid IP address",
    };
  }

  // Reject plain hostnames without a dot (e.g. "localhost", "hello")
  if (!hostname.includes(".")) {
    return {
      state: "invalid",
      messageAr: "النطاق يجب أن يحتوي على امتداد (مثل .com أو .net أو .sa)",
      messageEn: "Domain must include a TLD extension (e.g. .com, .net, .sa)",
    };
  }

  // Extract TLD (last label)
  const labels = hostname.split(".");
  const tld = labels[labels.length - 1];

  // TLD must be 2-8 alphabetic characters
  if (!/^[a-z]{2,8}$/.test(tld)) {
    return {
      state: "invalid",
      messageAr: `الامتداد "${tld}" غير صالح — يجب أن يتكون من حروف فقط (2-8 أحرف)`,
      messageEn: `Extension ".${tld}" is invalid — must be 2-8 alphabetic characters`,
    };
  }

  // Strict whitelist check
  if (!KNOWN_TLDS.has(tld)) {
    return {
      state: "invalid",
      messageAr: `الامتداد ".${tld}" غير معروف — استخدم امتداداً صالحاً (مثل .com، .net، .sa)`,
      messageEn: `".${tld}" is not a recognized extension — use a valid one (e.g. .com, .net, .sa)`,
    };
  }

  // Each label must match valid domain-label format
  const labelRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
  const invalidLabel = labels.slice(0, -1).find((l) => !labelRegex.test(l));
  if (invalidLabel) {
    return {
      state: "invalid",
      messageAr: `جزء النطاق "${invalidLabel}" يحتوي على أحرف غير مسموح بها`,
      messageEn: `Domain label "${invalidLabel}" contains invalid characters`,
    };
  }

  return { state: "valid", messageAr: "", messageEn: "" };
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function scoreColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-destructive";
}

function scoreLabel(score: number, isRtl: boolean) {
  if (score >= 80) return isRtl ? "آمن" : "Safe";
  if (score >= 60) return isRtl ? "محتمل الخطورة" : "Potentially Risky";
  return isRtl ? "خطر" : "Dangerous";
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export function DeepLinkTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [inputValue, setInputValue]     = useState("");
  const [url, setUrl]                   = useState<string | undefined>(undefined);
  const [liveValidation, setLiveValid]  = useState<ValidationResult>({ state: "empty", messageAr: "", messageEn: "" });

  // Debounce live validation so it fires 400 ms after user stops typing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputValue.trim()) {
      setLiveValid({ state: "empty", messageAr: "", messageEn: "" });
      return;
    }
    debounceRef.current = setTimeout(() => {
      setLiveValid(validateUrl(inputValue));
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputValue]);

  const { data, isLoading, error } = useUrlSafetyCheck(
    { url: url! },
    { query: { enabled: !!url, queryKey: getUrlSafetyCheckQueryKey({ url: url! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateUrl(inputValue);
    setLiveValid(result);

    if (result.state !== "valid") {
      setUrl(undefined);
      return;
    }

    let u = inputValue.trim();
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    setUrl(u);
  };

  const score = data?.score ?? 100;

  // Border color based on live state
  const inputBorder =
    liveValidation.state === "valid"
      ? "border-green-500 focus-visible:ring-green-500"
      : liveValidation.state === "invalid"
      ? "border-destructive focus-visible:ring-destructive"
      : "";

  return (
    <div className="space-y-6" id="deeplink-report">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xl">
        <div className="flex gap-3">
          {/* Input with validation indicator icon */}
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
            />
            {/* Inline icon */}
            {liveValidation.state === "valid" && (
              <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
            )}
            {liveValidation.state === "invalid" && (
              <XCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || liveValidation.state === "invalid"}
            data-testid="button-submit-deeplink"
            className="min-w-[80px]"
          >
            {isLoading ? <Spinner /> : (isRtl ? "فحص" : "Check")}
          </Button>
        </div>

        {/* Live validation feedback */}
        {liveValidation.state === "invalid" && (
          <div className="flex items-start gap-2 text-destructive text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>{isRtl ? liveValidation.messageAr : liveValidation.messageEn}</span>
          </div>
        )}
        {liveValidation.state === "valid" && (
          <div className="flex items-center gap-2 text-green-500 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{isRtl ? "الرابط صالح — يمكنك الفحص" : "URL looks valid — ready to scan"}</span>
          </div>
        )}
      </form>

      {/* API / network error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{isRtl ? "فشل فحص الرابط" : "Failed to check URL"}</span>
        </div>
      )}

      {/* Results */}
      {data && liveValidation.state !== "invalid" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">{isRtl ? "نتائج الفحص العميق" : "Deep Check Results"}</h3>
            <ExportButton targetId="deeplink-report" filename="deeplink-check.pdf" />
          </div>

          <div className={`flex items-center gap-4 p-5 rounded-xl border ${
            data.safe
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}>
            {data.safe
              ? <ShieldCheck className="h-8 w-8 flex-shrink-0" />
              : <ShieldAlert className="h-8 w-8 flex-shrink-0" />
            }
            <div>
              <div className="text-lg font-black">{scoreLabel(score, isRtl)}</div>
              <div className="text-sm opacity-80 font-mono break-all" dir="ltr">{url}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{isRtl ? "درجة الأمان" : "Safety Score"}</span>
              <span className="font-bold text-foreground">{score}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${scoreColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-muted/20 border border-border/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                {isRtl ? "تفاصيل الرابط" : "URL Details"}
              </h4>
              {(() => {
                try {
                  const u = new URL(url!);
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
                  return <div className="text-muted-foreground text-xs">{isRtl ? "تعذر تحليل الرابط" : "Could not parse URL"}</div>;
                }
              })()}
            </div>

            {(data.threats?.length ?? 0) > 0 ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {isRtl ? "التهديدات المكتشفة" : "Detected Threats"}
                </h4>
                <ul className="space-y-1">
                  {data.threats!.map((t, i) => (
                    <li key={i} className="text-xs text-destructive flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-400 flex-shrink-0" />
                <span className="text-sm text-green-400 font-medium">
                  {isRtl ? "لم يتم اكتشاف أي تهديدات" : "No threats detected"}
                </span>
              </div>
            )}
          </div>

          {(data.categories?.length ?? 0) > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                {isRtl ? "التصنيفات" : "Categories"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.categories!.map((cat, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/30 text-foreground">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
