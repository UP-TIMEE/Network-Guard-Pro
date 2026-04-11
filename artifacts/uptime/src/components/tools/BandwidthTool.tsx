import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const SIZE_UNITS = ["KB", "MB", "GB", "TB"] as const;
const SPEED_UNITS = ["Kbps", "Mbps", "Gbps"] as const;
type SizeUnit = typeof SIZE_UNITS[number];
type SpeedUnit = typeof SPEED_UNITS[number];

const SIZE_TO_BITS: Record<SizeUnit, number> = {
  KB: 8 * 1024,
  MB: 8 * 1024 * 1024,
  GB: 8 * 1024 * 1024 * 1024,
  TB: 8 * 1024 * 1024 * 1024 * 1024,
};
const SPEED_TO_BPS: Record<SpeedUnit, number> = {
  Kbps: 1024,
  Mbps: 1024 * 1024,
  Gbps: 1024 * 1024 * 1024,
};

function formatTime(seconds: number, isRtl: boolean): string {
  if (seconds < 1) return isRtl ? `${(seconds * 1000).toFixed(0)} ميلي ثانية` : `${(seconds * 1000).toFixed(0)} ms`;
  if (seconds < 60) return isRtl ? `${seconds.toFixed(2)} ثانية` : `${seconds.toFixed(2)} seconds`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return isRtl ? `${m} دقيقة و ${s} ثانية` : `${m} min ${s} sec`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return isRtl ? `${h} ساعة و ${m} دقيقة` : `${h} hr ${m} min`;
}

export function BandwidthTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [fileSize, setFileSize] = useState("1");
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>("GB");
  const [speed, setSpeed] = useState("100");
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("Mbps");
  const [result, setResult] = useState<{ time: string; bits: number; bytes: number } | null>(null);

  const handleCalc = () => {
    const fileBits = parseFloat(fileSize) * SIZE_TO_BITS[sizeUnit];
    const bps = parseFloat(speed) * SPEED_TO_BPS[speedUnit];
    if (!fileBits || !bps) return;
    const seconds = fileBits / bps;
    setResult({ time: formatTime(seconds, isRtl), bits: fileBits, bytes: fileBits / 8 });
  };

  const presets = [
    { label: isRtl ? "أغنية MP3" : "MP3 Song", size: "5", unit: "MB" as SizeUnit },
    { label: isRtl ? "فيلم HD" : "HD Movie", size: "4", unit: "GB" as SizeUnit },
    { label: isRtl ? "لعبة" : "Game", size: "50", unit: "GB" as SizeUnit },
    { label: isRtl ? "صورة 4K" : "4K Photo", size: "25", unit: "MB" as SizeUnit },
  ];

  return (
    <div className="space-y-6" id="bandwidth-report">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">{isRtl ? "حجم الملف" : "File Size"}</label>
          <div className="flex gap-2">
            <input
              type="number" min="0" value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              dir="ltr"
            />
            <select
              value={sizeUnit}
              onChange={(e) => setSizeUnit(e.target.value as SizeUnit)}
              className="bg-input border border-border rounded-md px-2 py-2 text-sm text-foreground focus:outline-none"
            >
              {SIZE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">{isRtl ? "سرعة الاتصال" : "Connection Speed"}</label>
          <div className="flex gap-2">
            <input
              type="number" min="0" value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              dir="ltr"
            />
            <select
              value={speedUnit}
              onChange={(e) => setSpeedUnit(e.target.value as SpeedUnit)}
              className="bg-input border border-border rounded-md px-2 py-2 text-sm text-foreground focus:outline-none"
            >
              {SPEED_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">{isRtl ? "أمثلة:" : "Examples:"}</span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => { setFileSize(p.size); setSizeUnit(p.unit); }}
            className="text-xs px-2.5 py-1 rounded border border-border hover:border-primary/50 hover:text-primary transition-colors"
          >
            {p.label} ({p.size} {p.unit})
          </button>
        ))}
      </div>

      <Button onClick={handleCalc} data-testid="button-calc-bandwidth">
        {isRtl ? "احسب وقت النقل" : "Calculate Transfer Time"}
      </Button>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
          <div className="bg-muted/20 border border-border rounded-xl p-6 text-center">
            <div className="text-muted-foreground text-sm mb-2">{isRtl ? "وقت النقل المتوقع" : "Estimated Transfer Time"}</div>
            <div className="text-3xl font-black text-foreground" dir="ltr">{result.time}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/30 border border-border/50 px-4 py-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">{isRtl ? "حجم الملف (بت)" : "File Size (bits)"}</div>
              <div className="font-mono text-sm text-foreground" dir="ltr">{result.bits.toLocaleString()}</div>
            </div>
            <div className="bg-muted/30 border border-border/50 px-4 py-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">{isRtl ? "حجم الملف (بايت)" : "File Size (bytes)"}</div>
              <div className="font-mono text-sm text-foreground" dir="ltr">{result.bytes.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
