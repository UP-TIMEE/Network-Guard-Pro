import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMacVendorLookup, getMacVendorLookupQueryKey } from "@workspace/api-client-react";
import { Cpu, CheckCircle2, XCircle, Copy, Check, Info } from "lucide-react";

function formatMac(raw: string): string {
  const clean = raw.replace(/[^A-Fa-f0-9]/g, "");
  return clean.match(/.{1,2}/g)?.join(":").toUpperCase() ?? raw.toUpperCase();
}

function MacIcon({ vendor }: { vendor: string }) {
  const initial = vendor.trim().charAt(0).toUpperCase() || "?";
  const hue = [...vendor].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0"
      style={{ background: `hsl(${hue}, 60%, 38%)` }}
    >
      {initial}
    </div>
  );
}

const EXAMPLES = ["00:1A:2B:3C:4D:5E", "FC:FB:FB:00:00:01", "00:50:56:C0:00:08", "B8:27:EB:00:00:00"];

export function MacTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [inputValue, setInputValue] = useState("");
  const [mac, setMac] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useMacVendorLookup(
    { mac: mac! },
    { query: { enabled: !!mac, queryKey: getMacVendorLookupQueryKey({ mac: mac! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = inputValue.trim();
    if (v) setMac(v);
  };

  const handleCopy = () => {
    if (data?.vendor) {
      navigator.clipboard.writeText(data.vendor).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const oui = mac ? mac.replace(/[^A-Fa-f0-9]/g, "").slice(0, 6).toUpperCase().match(/.{1,2}/g)?.join(":") : "";

  return (
    <div className="space-y-6" id="mac-report">
      <div className="flex items-start gap-3 p-4 bg-primary/8 border border-primary/20 rounded-lg text-primary text-sm">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>
          {isRtl
            ? "أدخل عنوان MAC كاملاً (مثل: AA:BB:CC:DD:EE:FF) أو الـ OUI الأولى (6 خانات) فقط."
            : "Enter a full MAC address (e.g. AA:BB:CC:DD:EE:FF) or just the OUI prefix (first 6 hex digits)."}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">
            {isRtl ? "عنوان MAC" : "MAC Address"}
          </label>
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="AA:BB:CC:DD:EE:FF"
              data-testid="input-mac"
              className="flex-1 font-mono tracking-widest"
              dir="ltr"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="min-w-[90px]"
              data-testid="button-submit-mac"
            >
              {isLoading ? <Spinner /> : (isRtl ? "بحث" : "Lookup")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">{isRtl ? "أمثلة:" : "Examples:"}</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setInputValue(ex)}
              className="text-xs font-mono px-2 py-0.5 rounded border border-border hover:border-primary/50 hover:text-primary transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <XCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">
            {isRtl ? "تعذّر جلب البيانات — تحقق من صحة العنوان وحاول مجدداً." : "Failed to fetch data — check the address and try again."}
          </span>
        </div>
      )}

      {data && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">
              {isRtl ? "نتيجة تحديد المصنّع" : "Vendor Lookup Result"}
            </h3>
            <ExportButton targetId="mac-report" filename={`mac-${mac?.replace(/:/g, "")}.pdf`} />
          </div>

          {/* Main Result Card */}
          <div className={`rounded-2xl border p-6 ${data.found ? "bg-card border-border" : "bg-destructive/5 border-destructive/20"}`}>
            <div className="flex items-center gap-5">
              {data.found ? (
                <MacIcon vendor={data.vendor ?? "?"} />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Cpu className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {data.found ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                  <span className={`text-xs font-semibold ${data.found ? "text-green-400" : "text-destructive"}`}>
                    {data.found
                      ? (isRtl ? "تم التعرف على المصنّع" : "Vendor Identified")
                      : (isRtl ? "غير معروف في قاعدة البيانات" : "Unknown in Database")}
                  </span>
                </div>
                <div className="text-xl font-black text-foreground truncate" dir="ltr">
                  {data.vendor ?? (isRtl ? "غير معروف" : "Unknown")}
                </div>
                {data.found && (
                  <button
                    onClick={handleCopy}
                    className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? (isRtl ? "تم النسخ" : "Copied!") : (isRtl ? "نسخ الاسم" : "Copy name")}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: isRtl ? "عنوان MAC المدخل" : "Input MAC Address",
                value: formatMac(data.mac),
                mono: true,
              },
              {
                label: isRtl ? "بادئة OUI" : "OUI Prefix",
                value: oui || "—",
                mono: true,
              },
              {
                label: isRtl ? "قاعدة البيانات" : "Data Source",
                value: "api.macvendors.com",
                mono: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-muted/30 border border-border/50 rounded-xl px-4 py-3"
              >
                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                <div className={`text-sm font-semibold text-foreground break-all ${item.mono ? "font-mono" : ""}`} dir="ltr">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* What is OUI */}
          <div className="p-4 bg-muted/20 border border-border/40 rounded-xl text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">
              {isRtl ? "ما هو OUI؟ " : "What is OUI? "}
            </span>
            {isRtl
              ? "الـ OUI (Organizationally Unique Identifier) هو أول 24 بت من عنوان MAC، وتُخصصه IEEE لكل شركة مصنّعة للتعريف بها."
              : "The OUI (Organizationally Unique Identifier) is the first 24 bits of a MAC address, assigned by IEEE to uniquely identify each hardware manufacturer."}
          </div>
        </div>
      )}
    </div>
  );
}
