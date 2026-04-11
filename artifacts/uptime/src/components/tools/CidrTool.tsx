import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeftRight } from "lucide-react";

const MASK_TO_CIDR: Record<string, number> = {};
const CIDR_TO_MASK: Record<number, string> = {};

for (let i = 0; i <= 32; i++) {
  const maskNum = i === 0 ? 0 : ((0xFFFFFFFF << (32 - i)) >>> 0);
  const mask = [(maskNum >>> 24) & 255, (maskNum >>> 16) & 255, (maskNum >>> 8) & 255, maskNum & 255].join(".");
  MASK_TO_CIDR[mask] = i;
  CIDR_TO_MASK[i] = mask;
}

function maskToBinary(mask: string): string {
  return mask.split(".").map((o) => parseInt(o).toString(2).padStart(8, "0")).join(".");
}

function cidrToHex(cidr: number): string {
  const maskNum = cidr === 0 ? 0 : ((0xFFFFFFFF << (32 - cidr)) >>> 0);
  return "0x" + maskNum.toString(16).toUpperCase().padStart(8, "0");
}

function hostsInSubnet(cidr: number): number {
  if (cidr >= 32) return 1;
  if (cidr === 31) return 2;
  return Math.pow(2, 32 - cidr) - 2;
}

interface ConvertResult {
  cidr: number;
  mask: string;
  binary: string;
  hex: string;
  hosts: number;
  subnets255: number;
}

export function CidrTool() {
  const { dir } = useLanguage();
  const [mode, setMode] = useState<"mask2cidr" | "cidr2mask">("cidr2mask");
  const [cidrInput, setCidrInput] = useState("24");
  const [maskInput, setMaskInput] = useState("255.255.255.0");
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState("");

  const handleConvert = () => {
    setError("");
    if (mode === "cidr2mask") {
      const n = parseInt(cidrInput);
      if (isNaN(n) || n < 0 || n > 32) {
        setError(dir === "rtl" ? "البادئة يجب أن تكون بين 0 و 32" : "Prefix must be between 0 and 32");
        return;
      }
      const mask = CIDR_TO_MASK[n];
      setResult({ cidr: n, mask, binary: maskToBinary(mask), hex: cidrToHex(n), hosts: hostsInSubnet(n), subnets255: Math.pow(2, n > 24 ? 0 : 24 - n) });
    } else {
      const cidr = MASK_TO_CIDR[maskInput.trim()];
      if (cidr === undefined) {
        setError(dir === "rtl" ? "قناع شبكة غير صالح" : "Invalid subnet mask");
        return;
      }
      setResult({ cidr, mask: maskInput.trim(), binary: maskToBinary(maskInput.trim()), hex: cidrToHex(cidr), hosts: hostsInSubnet(cidr), subnets255: Math.pow(2, cidr > 24 ? 0 : 24 - cidr) });
    }
  };

  const commonCidrs = [8, 16, 24, 25, 26, 27, 28, 29, 30, 31, 32];

  return (
    <div className="space-y-6" id="cidr-report">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => setMode("cidr2mask")}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${mode === "cidr2mask" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
        >
          {dir === "rtl" ? "CIDR ← قناع" : "CIDR → Mask"}
        </button>
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={() => setMode("mask2cidr")}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${mode === "mask2cidr" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
        >
          {dir === "rtl" ? "قناع ← CIDR" : "Mask → CIDR"}
        </button>
      </div>

      <div className="flex gap-3 max-w-xl items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1.5 block">
            {mode === "cidr2mask" ? (dir === "rtl" ? "البادئة (0-32)" : "Prefix (0-32)") : (dir === "rtl" ? "قناع الشبكة" : "Subnet Mask")}
          </label>
          {mode === "cidr2mask" ? (
            <Input value={cidrInput} onChange={(e) => setCidrInput(e.target.value)} placeholder="24" dir="ltr" className="font-mono" type="number" min={0} max={32} />
          ) : (
            <Input value={maskInput} onChange={(e) => setMaskInput(e.target.value)} placeholder="255.255.255.0" dir="ltr" className="font-mono" />
          )}
        </div>
        <Button onClick={handleConvert} data-testid="button-convert-cidr">{dir === "rtl" ? "تحويل" : "Convert"}</Button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center">{dir === "rtl" ? "شائعة:" : "Common:"}</span>
        {commonCidrs.map((c) => (
          <button
            key={c}
            onClick={() => { setCidrInput(String(c)); setMode("cidr2mask"); }}
            className="text-xs font-mono px-2 py-1 rounded border border-border hover:border-primary/50 hover:text-primary transition-colors"
          >
            /{c}
          </button>
        ))}
      </div>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="font-bold text-foreground">{dir === "rtl" ? "نتيجة التحويل" : "Conversion Result"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: dir === "rtl" ? "تدوين CIDR" : "CIDR Notation", value: `/${result.cidr}` },
              { label: dir === "rtl" ? "قناع الشبكة" : "Subnet Mask", value: result.mask },
              { label: dir === "rtl" ? "المضيفون القابلون للاستخدام" : "Usable Hosts", value: result.hosts.toLocaleString() },
              { label: dir === "rtl" ? "تمثيل HEX" : "HEX Representation", value: result.hex },
              { label: dir === "rtl" ? "التمثيل الثنائي" : "Binary Representation", value: result.binary, mono: true, full: true },
            ].map((row) => (
              <div key={row.label} className={`flex items-center justify-between bg-muted/30 border border-border/50 px-4 py-3 rounded-lg gap-2 ${row.full ? "sm:col-span-2" : ""}`}>
                <span className="text-sm text-muted-foreground shrink-0">{row.label}</span>
                <span className={`text-sm text-foreground font-medium ${(row as any).mono ? "font-mono text-xs break-all" : ""}`} dir="ltr">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
