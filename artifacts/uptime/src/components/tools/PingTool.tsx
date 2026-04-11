import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wifi, WifiOff, Activity, Clock } from "lucide-react";

interface PingResult {
  host: string;
  results: { seq: number; latencyMs: number | null; status: "success" | "timeout" }[];
  avgMs: number | null;
  minMs: number | null;
  maxMs: number | null;
  packetLoss: number;
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function pingOnce(host: string): Promise<{ latencyMs: number | null; status: "success" | "timeout" }> {
  try {
    const res = await fetch(`${BASE}/api/tools/ping?host=${encodeURIComponent(host)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("failed");
    const data = await res.json() as { latencyMs: number; open: boolean };
    if (!data.open) return { latencyMs: null, status: "timeout" };
    return { latencyMs: data.latencyMs, status: "success" };
  } catch {
    return { latencyMs: null, status: "timeout" };
  }
}

export function PingTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [host, setHost] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PingResult | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef(false);

  const PING_COUNT = 4;

  const handlePing = async () => {
    const h = host.trim();
    if (!h) return;
    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);
    abortRef.current = false;

    const results: PingResult["results"] = [];

    for (let i = 0; i < PING_COUNT; i++) {
      if (abortRef.current) break;
      const r = await pingOnce(h);
      results.push({ seq: i + 1, ...r });
      setProgress(i + 1);
      if (i < PING_COUNT - 1) await new Promise((res) => setTimeout(res, 600));
    }

    const successful = results.filter((r) => r.latencyMs !== null);
    const latencies = successful.map((r) => r.latencyMs!);
    const avgMs = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;
    const minMs = latencies.length ? Math.min(...latencies) : null;
    const maxMs = latencies.length ? Math.max(...latencies) : null;
    const packetLoss = Math.round(((PING_COUNT - successful.length) / PING_COUNT) * 100);

    setResult({ host: h, results, avgMs, minMs, maxMs, packetLoss });
    setLoading(false);
  };

  const latencyColor = (ms: number | null) => {
    if (ms === null) return "text-destructive";
    if (ms < 50) return "text-green-400";
    if (ms < 150) return "text-yellow-400";
    return "text-orange-400";
  };

  const qualityLabel = (avg: number | null, loss: number) => {
    if (loss === 100) return isRtl ? "لا يمكن الوصول" : "Unreachable";
    if (!avg) return isRtl ? "خطأ" : "Error";
    if (avg < 30 && loss === 0) return isRtl ? "ممتاز" : "Excellent";
    if (avg < 80 && loss === 0) return isRtl ? "جيد جداً" : "Very Good";
    if (avg < 150) return isRtl ? "جيد" : "Good";
    return isRtl ? "متأخر" : "High Latency";
  };

  return (
    <div className="space-y-6" id="ping-report">
      <form onSubmit={(e) => { e.preventDefault(); handlePing(); }} className="flex gap-3 max-w-xl">
        <Input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="google.com  أو  8.8.8.8"
          dir="ltr"
          className="flex-1 font-mono"
          data-testid="input-ping"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !host.trim()} className="min-w-[90px]" data-testid="button-submit-ping">
          {loading ? <Spinner /> : (isRtl ? "اختبار" : "Test")}
        </Button>
      </form>

      {loading && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 animate-pulse text-primary" />
            <span>{isRtl ? `إرسال حزمة ${progress} من ${PING_COUNT}...` : `Sending packet ${progress} of ${PING_COUNT}...`}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden max-w-md">
            <div className="h-1.5 bg-primary rounded-full transition-all duration-500" style={{ width: `${(progress / PING_COUNT) * 100}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">
              {isRtl ? "نتائج Ping: " : "Ping Results: "}
              <span className="font-mono text-primary" dir="ltr">{result.host}</span>
            </h3>
            <ExportButton targetId="ping-report" filename={`ping-${result.host}.pdf`} />
          </div>

          <div className={`flex items-center gap-4 p-4 rounded-xl border ${result.packetLoss === 100 ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-green-500/10 border-green-500/20 text-green-400"}`}>
            {result.packetLoss === 100 ? <WifiOff className="h-6 w-6 flex-shrink-0" /> : <Wifi className="h-6 w-6 flex-shrink-0" />}
            <div>
              <div className="text-base font-bold">{qualityLabel(result.avgMs, result.packetLoss)}</div>
              <div className="text-xs opacity-75">
                {result.avgMs !== null
                  ? (isRtl ? `متوسط الكمون: ${result.avgMs}ms` : `Avg latency: ${result.avgMs}ms`)
                  : (isRtl ? "لا يوجد اتصال" : "No connection")}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {isRtl ? "سجل الحزم" : "Packet Log"}
            </h4>
            {result.results.map((r) => (
              <div key={r.seq} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/20 border border-border/40">
                <span className="font-mono text-xs text-muted-foreground w-8 text-center">{`#${r.seq}`}</span>
                {r.status === "success" ? (
                  <>
                    <div className={`font-mono font-bold text-sm flex-1 ${latencyColor(r.latencyMs)}`} dir="ltr">
                      {r.latencyMs}ms
                    </div>
                    <div className="w-24 bg-muted rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${r.latencyMs! < 50 ? "bg-green-400" : r.latencyMs! < 150 ? "bg-yellow-400" : "bg-orange-400"}`}
                        style={{ width: `${Math.min(100, (r.latencyMs! / 200) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-green-400">✓</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-sm text-destructive flex-1">{isRtl ? "انتهت المهلة" : "Timeout"}</span>
                    <span className="text-xs text-destructive">✗</span>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: isRtl ? "أدنى كمون" : "Min", value: result.minMs !== null ? `${result.minMs}ms` : "—" },
              { label: isRtl ? "أقصى كمون" : "Max", value: result.maxMs !== null ? `${result.maxMs}ms` : "—" },
              { label: isRtl ? "متوسط الكمون" : "Avg", value: result.avgMs !== null ? `${result.avgMs}ms` : "—" },
              { label: isRtl ? "فقد الحزم" : "Loss", value: `${result.packetLoss}%` },
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
