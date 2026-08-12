import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExportButton } from "@/components/ExportButton";
import { AlertTriangle, Copy, Check } from "lucide-react";

function expandIPv6(addr: string): string | null {
  if (!addr) return null;
  let a = addr.trim().toLowerCase();
  if (a.includes(":::")) return null;
  const dcount = (a.match(/::/g) || []).length;
  if (dcount > 1) return null;
  if (a.includes("::")) {
    const halves = a.split("::");
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves[1] ? halves[1].split(":") : [];
    const missing = 8 - left.length - right.length;
    if (missing < 0) return null;
    const middle = Array(missing).fill("0000");
    const groups = [...left, ...middle, ...right];
    a = groups.join(":");
  }
  const parts = a.split(":");
  if (parts.length !== 8) return null;
  for (const p of parts) {
    if (!/^[0-9a-f]{1,4}$/.test(p)) return null;
  }
  return parts.map((p) => p.padStart(4, "0")).join(":");
}

function compressIPv6(expanded: string): string {
  const parts = expanded.split(":");
  const zeros = parts.map((p) => p === "0000");

  let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (zeros[i]) {
      if (curStart === -1) { curStart = i; curLen = 1; }
      else curLen++;
    } else {
      if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
      curStart = -1; curLen = 0;
    }
  }
  if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }

  const stripped = parts.map((p) => p.replace(/^0+/, "") || "0");
  if (bestLen < 2) return stripped.join(":");

  const before = stripped.slice(0, bestStart);
  const after = stripped.slice(bestStart + bestLen);
  return (before.length ? before.join(":") + ":" : ":") + ":" + (after.length ? after.join(":") : "");
}

function parseIPv6Type(expanded: string): string {
  const parts = expanded.split(":").map((p) => parseInt(p, 16));
  const p0 = parts[0];
  if (expanded === "0000:0000:0000:0000:0000:0000:0000:0001") return "Loopback (::1)";
  if (expanded === "0000:0000:0000:0000:0000:0000:0000:0000") return "Unspecified (::)";
  if (p0 >= 0xfe80 && p0 <= 0xfebf) return "Link-Local";
  if (p0 >= 0xfec0 && p0 <= 0xfeff) return "Site-Local (deprecated)";
  if (p0 >= 0xff00) return "Multicast";
  if (p0 >= 0x2000 && p0 <= 0x3fff) return "Global Unicast";
  if (p0 >= 0xfc00 && p0 <= 0xfdff) return "Unique Local";
  return "Unknown";
}

export function IPv6CompressorTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ expanded: string; compressed: string; type: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleProcess = () => {
    setError(""); setResult(null);
    const expanded = expandIPv6(input.trim());
    if (!expanded) {
      setError(isRtl ? "عنوان IPv6 غير صالح. تأكد من صحة الصيغة." : "Invalid IPv6 address. Please check the format.");
      return;
    }
    const compressed = compressIPv6(expanded);
    const type = parseIPv6Type(expanded);
    setResult({ expanded, compressed, type });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const examples = [
    "2001:0db8:0000:0000:0000:0000:0000:0001",
    "fe80:0000:0000:0000:0204:61ff:fe9d:f156",
    "::1",
    "2001:db8::1",
  ];

  return (
    <div className="space-y-6" id="ipv6-report">
      <div className="space-y-3 max-w-xl">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">{isRtl ? "عنوان IPv6" : "IPv6 Address"}</label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleProcess()}
            placeholder="2001:0db8:0000:0000:0000:0000:0000:0001"
            dir="ltr"
            className="font-mono"
            data-testid="input-ipv6"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleProcess} data-testid="button-process-ipv6">
            {isRtl ? "ضغط وتحليل" : "Compress & Analyze"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">{isRtl ? "أمثلة:" : "Examples:"}</span>
          {examples.map((ex) => (
            <button key={ex} onClick={() => setInput(ex)} className="text-xs font-mono px-2 py-0.5 rounded border border-border hover:border-primary/50 hover:text-primary transition-colors">
              {ex.length > 20 ? ex.slice(0, 18) + "..." : ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">{isRtl ? "نتيجة التحليل" : "Analysis Result"}</h3>
            <ExportButton targetId="ipv6-report" filename="ipv6-analysis.pdf" />
          </div>

          <div className="space-y-3">
            {[
              { label: isRtl ? "الصيغة المضغوطة" : "Compressed Form", value: result.compressed, highlight: true },
              { label: isRtl ? "الصيغة الكاملة الموسّعة" : "Full Expanded Form", value: result.expanded },
              { label: isRtl ? "نوع العنوان" : "Address Type", value: result.type },
            ].map((row) => (
              <div key={row.label} className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border ${row.highlight ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/50"}`}>
                <span className="text-sm text-muted-foreground shrink-0">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm break-all ${row.highlight ? "text-primary font-bold" : "text-foreground"}`} dir="ltr">{row.value}</span>
                  {(row.highlight || row.label.includes("Expanded") || row.label.includes("موسّعة")) && (
                    <button onClick={() => copy(row.value)} className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                      {copied === row.value ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: isRtl ? "المجموعات" : "Groups", value: "8" },
              { label: isRtl ? "بت لكل مجموعة" : "Bits/Group", value: "16" },
              { label: isRtl ? "إجمالي البتات" : "Total Bits", value: "128" },
              { label: isRtl ? "وفّر أحرف" : "Chars Saved", value: String(result.expanded.replace(/:/g, "").length - result.compressed.replace(/:/g, "").length) },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 text-center">
                <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                <div className="font-bold text-foreground font-mono">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
