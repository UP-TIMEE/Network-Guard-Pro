import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUrlSafetyCheck, getUrlSafetyCheckQueryKey } from "@workspace/api-client-react";
import { AlertTriangle, ShieldCheck, ShieldAlert, Link2 } from "lucide-react";

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

export function DeepLinkTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [inputValue, setInputValue] = useState("");
  const [url, setUrl] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useUrlSafetyCheck(
    { url: url! },
    { query: { enabled: !!url, queryKey: getUrlSafetyCheckQueryKey({ url: url! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      let u = inputValue.trim();
      if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
      setUrl(u);
    }
  };

  const score = data?.score ?? 100;

  return (
    <div className="space-y-6" id="deeplink-report">
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="https://example.com/path?param=value"
          data-testid="input-deeplink"
          className="flex-1 font-mono"
          dir="ltr"
        />
        <Button type="submit" disabled={isLoading} data-testid="button-submit-deeplink" className="min-w-[80px]">
          {isLoading ? <Spinner /> : (isRtl ? "فحص" : "Check")}
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{isRtl ? "فشل فحص الرابط" : "Failed to check URL"}</span>
        </div>
      )}

      {data && (
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
              <div className={`h-2.5 rounded-full transition-all duration-700 ${scoreColor(score)}`} style={{ width: `${score}%` }} />
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
                        { label: isRtl ? "النطاق" : "Domain", val: u.hostname },
                        { label: isRtl ? "المسار" : "Path", val: u.pathname || "/" },
                        { label: isRtl ? "المعاملات" : "Params", val: u.search || isRtl ? "لا يوجد" : "None" },
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
                <span className="text-sm text-green-400 font-medium">{isRtl ? "لم يتم اكتشاف أي تهديدات" : "No threats detected"}</span>
              </div>
            )}
          </div>

          {(data.categories?.length ?? 0) > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">{isRtl ? "التصنيفات" : "Categories"}</h4>
              <div className="flex flex-wrap gap-2">
                {data.categories!.map((cat, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/30 text-foreground">{cat}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
