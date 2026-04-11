import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExportButton } from "@/components/ExportButton";
import { AlertTriangle } from "lucide-react";

function ipToNum(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}
function numToIp(num: number): string {
  return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join(".");
}
function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d+$/.test(p) && parseInt(p) >= 0 && parseInt(p) <= 255);
}
function toBinary(num: number): string {
  return (num >>> 0).toString(2).padStart(32, "0").replace(/(.{8})/g, "$1.").slice(0, -1);
}

interface CalcResult {
  network: string; broadcast: string; firstHost: string; lastHost: string;
  totalHosts: number; usableHosts: number; subnetMask: string; wildcardMask: string;
  binaryMask: string; binaryNetwork: string; ipClass: string;
}

function calculate(ip: string, prefix: number): CalcResult {
  const maskNum = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
  const ipNum = ipToNum(ip);
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;
  const firstHost = prefix >= 31 ? networkNum : networkNum + 1;
  const lastHost = prefix >= 31 ? broadcastNum : broadcastNum - 1;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2);

  const firstOctet = (ipNum >>> 24) & 255;
  let ipClass = "A";
  if (firstOctet >= 192) ipClass = "C";
  else if (firstOctet >= 128) ipClass = "B";

  return {
    network: numToIp(networkNum),
    broadcast: numToIp(broadcastNum),
    firstHost: numToIp(firstHost),
    lastHost: numToIp(lastHost),
    totalHosts,
    usableHosts,
    subnetMask: numToIp(maskNum),
    wildcardMask: numToIp(~maskNum >>> 0),
    binaryMask: toBinary(maskNum),
    binaryNetwork: toBinary(networkNum),
    ipClass,
  };
}

export function IpCalcTool() {
  const { t, dir } = useLanguage();
  const [ipInput, setIpInput] = useState("192.168.1.0");
  const [prefix, setPrefix] = useState(24);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");

  const handleCalc = () => {
    setError("");
    if (!isValidIp(ipInput)) {
      setError(dir === "rtl" ? "عنوان IP غير صالح" : "Invalid IP address");
      return;
    }
    if (prefix < 0 || prefix > 32) {
      setError(dir === "rtl" ? "يجب أن يكون البادئة بين 0 و 32" : "Prefix must be between 0 and 32");
      return;
    }
    setResult(calculate(ipInput, prefix));
  };

  const rows = result ? [
    { label: dir === "rtl" ? "عنوان الشبكة" : "Network Address", value: result.network },
    { label: dir === "rtl" ? "عنوان البث" : "Broadcast Address", value: result.broadcast },
    { label: dir === "rtl" ? "أول مضيف" : "First Host", value: result.firstHost },
    { label: dir === "rtl" ? "آخر مضيف" : "Last Host", value: result.lastHost },
    { label: dir === "rtl" ? "قناع الشبكة" : "Subnet Mask", value: result.subnetMask },
    { label: dir === "rtl" ? "قناع الاستثناء" : "Wildcard Mask", value: result.wildcardMask },
    { label: dir === "rtl" ? "إجمالي المضيفين" : "Total Hosts", value: result.totalHosts.toLocaleString() },
    { label: dir === "rtl" ? "المضيفون القابلون للاستخدام" : "Usable Hosts", value: result.usableHosts.toLocaleString() },
    { label: dir === "rtl" ? "فئة الـ IP" : "IP Class", value: `Class ${result.ipClass}` },
    { label: dir === "rtl" ? "القناع الثنائي" : "Binary Mask", value: result.binaryMask, mono: true },
    { label: dir === "rtl" ? "الشبكة الثنائية" : "Binary Network", value: result.binaryNetwork, mono: true },
  ] : [];

  return (
    <div className="space-y-6" id="ipcalc-report">
      <div className="flex flex-wrap gap-3 max-w-xl items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-muted-foreground mb-1.5 block">{dir === "rtl" ? "عنوان IP" : "IP Address"}</label>
          <Input value={ipInput} onChange={(e) => setIpInput(e.target.value)} placeholder="192.168.1.0" dir="ltr" className="font-mono" />
        </div>
        <div className="w-28">
          <label className="text-xs text-muted-foreground mb-1.5 block">{dir === "rtl" ? "البادئة (CIDR)" : "Prefix (CIDR)"}</label>
          <Input
            type="number" min={0} max={32} value={prefix}
            onChange={(e) => setPrefix(parseInt(e.target.value) || 0)}
            dir="ltr" className="font-mono"
          />
        </div>
        <Button onClick={handleCalc} data-testid="button-calc-ip">{t("tools.calculate")}</Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">
              {dir === "rtl" ? "نتائج" : "Results"}: <span className="font-mono text-primary" dir="ltr">{ipInput}/{prefix}</span>
            </h3>
            <ExportButton targetId="ipcalc-report" filename={`ipcalc-${ipInput}-${prefix}.pdf`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between bg-muted/30 border border-border/50 px-4 py-3 rounded-lg gap-2">
                <span className="text-sm text-muted-foreground shrink-0">{row.label}</span>
                <span className={`text-sm text-foreground font-medium ${row.mono ? "font-mono text-xs break-all" : ""}`} dir="ltr">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
