import { useState, useMemo } from "react";
import { Shield, AlertTriangle, CheckCircle2, RotateCcw, ChevronRight, Terminal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface LogTemplate {
  src: string;
  dst: string;
  proto: string;
  port: number;
  len: number;
  info: string;
  isMalicious: boolean;
  hintAr: string;
}

interface LogEntry extends LogTemplate {
  id: number;
  time: string;
}

interface RoundDef {
  titleAr: string;
  attackTypeAr: string;
  normals: LogTemplate[];
  malicious: LogTemplate;
  successAr: string;
}

// ─── Round Definitions ──────────────────────────────────────────────────────────
const ROUND_DEFS: RoundDef[] = [
  // ══ ROUND 1 — SSH Brute Force ══
  {
    titleAr:     "الجولة الأولى — هجوم القوة الغاشمة",
    attackTypeAr: "Brute Force على SSH",
    successAr: "ممتاز! اكتشفت هجوم Brute Force — ثلاث محاولات تسجيل دخول فاشلة متتالية من نفس الـ IP الخارجي (203.0.113.77) على المنفذ 22 خلال ثانية واحدة. تم تفعيل الـ Firewall وحظر المصدر.",
    malicious: {
      src: "203.0.113.77", dst: "192.168.1.10", proto: "SSH", port: 22, len: 64,
      info: "AUTH_FAIL ×3  [root / admin / ubuntu]  within 0.9s — BRUTE_FORCE DETECTED",
      isMalicious: true, hintAr: "",
    },
    normals: [
      { src: "192.168.1.45",  dst: "8.8.8.8",        proto: "DNS",   port: 53,  len: 72,   info: "Standard query A  google.com",                           isMalicious: false, hintAr: "طلب DNS عادي للبحث عن عنوان النطاق — جزء طبيعي من التصفح." },
      { src: "192.168.1.45",  dst: "142.250.74.46",  proto: "HTTPS", port: 443, len: 1380, info: "TLS 1.3  Application Data  →  accounts.google.com",       isMalicious: false, hintAr: "اتصال HTTPS مشفر بـ TLS 1.3 — آمن تماماً." },
      { src: "192.168.1.102", dst: "192.168.1.1",    proto: "HTTPS", port: 443, len: 540,  info: "TLS 1.3  Client Hello  →  router admin panel",            isMalicious: false, hintAr: "وصول HTTPS إلى لوحة الراوتر المحلي — طبيعي ومشفر." },
      { src: "192.168.1.45",  dst: "20.190.151.7",   proto: "HTTPS", port: 443, len: 890,  info: "TLS 1.3  Application Data  →  login.microsoftonline.com", isMalicious: false, hintAr: "تسجيل دخول Microsoft مشفر بـ TLS — آمن." },
      { src: "192.168.1.88",  dst: "151.101.1.140",  proto: "HTTPS", port: 443, len: 720,  info: "TLS 1.3  GET /index.html  →  fastly.net CDN",             isMalicious: false, hintAr: "طلب HTTPS عبر شبكة CDN — تصفح عادي ومشفر." },
      { src: "192.168.1.45",  dst: "8.8.4.4",        proto: "DNS",   port: 53,  len: 68,   info: "Standard query A  github.com",                           isMalicious: false, hintAr: "طلب DNS لـ GitHub — نشاط تطوير طبيعي." },
      { src: "192.168.1.30",  dst: "104.21.56.8",    proto: "HTTPS", port: 443, len: 612,  info: "TLS 1.3  Application Data  →  api.cloudflare.com",        isMalicious: false, hintAr: "اتصال HTTPS إلى Cloudflare — طبيعي جداً." },
    ],
  },

  // ══ ROUND 2 — FTP Cleartext ══
  {
    titleAr:     "الجولة الثانية — بيانات غير مشفرة",
    attackTypeAr: "كلمة مرور Cleartext عبر FTP",
    successAr: "أحسنت! اكتشفت إرسال كلمة مرور بنص واضح عبر FTP (Port 21). بروتوكول FTP لا يشفر البيانات، ما يتيح لأي مهاجم على الشبكة رؤية بيانات الاعتماد. استخدم SFTP أو FTPS بدلاً من ذلك.",
    malicious: {
      src: "192.168.2.20", dst: "192.168.2.5", proto: "FTP", port: 21, len: 48,
      info: "PASS  P@ssw0rd2024  [CLEARTEXT — no encryption]",
      isMalicious: true, hintAr: "",
    },
    normals: [
      { src: "192.168.2.20",  dst: "172.217.16.46",  proto: "HTTPS", port: 443, len: 1280, info: "TLS 1.3  Application Data  →  workspace.google.com",     isMalicious: false, hintAr: "Google Workspace عبر HTTPS المشفر — آمن تماماً." },
      { src: "192.168.2.20",  dst: "8.8.8.8",        proto: "DNS",   port: 53,  len: 70,   info: "Standard query A  files.company.net",                   isMalicious: false, hintAr: "طلب DNS للبحث عن خادم الشركة — طبيعي تماماً." },
      { src: "192.168.2.20",  dst: "192.168.2.5",    proto: "HTTPS", port: 443, len: 840,  info: "TLS 1.2  Application Data  →  internal.company.net",    isMalicious: false, hintAr: "اتصال HTTPS داخلي مشفر — طبيعي في بيئات الشركات." },
      { src: "192.168.2.20",  dst: "192.168.2.5",    proto: "FTP",   port: 21,  len: 32,   info: "USER  john.doe",                                        isMalicious: false, hintAr: "إرسال اسم المستخدم عبر FTP — مشبوه لكن ليس الإجابة، انظر في نفس الجلسة لكلمة المرور." },
      { src: "192.168.2.35",  dst: "104.18.12.92",   proto: "HTTPS", port: 443, len: 950,  info: "TLS 1.3  POST /api/v1/upload  →  cdn.dropbox.com",      isMalicious: false, hintAr: "رفع ملف على Dropbox عبر HTTPS المشفر — آمن." },
      { src: "192.168.2.20",  dst: "8.8.8.8",        proto: "DNS",   port: 53,  len: 66,   info: "Standard query AAAA  outlook.office365.com",            isMalicious: false, hintAr: "طلب DNS لـ Microsoft 365 — طبيعي." },
      { src: "192.168.2.10",  dst: "40.112.72.205",  proto: "HTTPS", port: 443, len: 1100, info: "TLS 1.3  Application Data  →  outlook.office365.com",   isMalicious: false, hintAr: "بريد Microsoft 365 مشفر — اتصال عمل طبيعي." },
    ],
  },

  // ══ ROUND 3 — Port Scan ══
  {
    titleAr:     "الجولة الثالثة — مسح المنافذ",
    attackTypeAr: "Port Scan من IP خارجي",
    successAr: "رائع! اكتشفت هجوم Port Scan — طلبات SYN متسلسلة على 6 منافذ مختلفة (22، 23، 25، 80، 443، 3389) من IP خارجي واحد خلال أقل من ثانية واحدة. هذا نشاط استطلاع يسبق الاختراق.",
    malicious: {
      src: "198.51.100.42", dst: "192.168.3.1", proto: "TCP", port: 22, len: 40,
      info: "SYN→22  SYN→23  SYN→25  SYN→80  SYN→443  SYN→3389  [PORT_SCAN ×6 in 0.8s]",
      isMalicious: true, hintAr: "",
    },
    normals: [
      { src: "192.168.3.50",  dst: "1.1.1.1",         proto: "DNS",   port: 53,  len: 74,   info: "Standard query A  api.github.com",                    isMalicious: false, hintAr: "طلب DNS لـ GitHub API — نشاط مطور عادي." },
      { src: "192.168.3.50",  dst: "140.82.121.4",    proto: "HTTPS", port: 443, len: 1420, info: "TLS 1.3  GET /repos  →  api.github.com",              isMalicious: false, hintAr: "طلب GitHub API عبر HTTPS — آمن ومشفر." },
      { src: "192.168.3.22",  dst: "172.64.155.209",  proto: "HTTPS", port: 443, len: 600,  info: "TLS 1.3  Application Data  →  www.cloudflare.com",   isMalicious: false, hintAr: "اتصال HTTPS بـ Cloudflare — طبيعي جداً." },
      { src: "192.168.3.50",  dst: "8.8.8.8",         proto: "DNS",   port: 53,  len: 68,   info: "Standard query A  stackoverflow.com",                isMalicious: false, hintAr: "طلب DNS لـ Stack Overflow — نشاط مطور عادي." },
      { src: "192.168.3.50",  dst: "151.101.129.69",  proto: "HTTPS", port: 443, len: 1050, info: "TLS 1.3  GET /questions  →  stackoverflow.com",       isMalicious: false, hintAr: "تصفح Stack Overflow عبر HTTPS — آمن." },
      { src: "192.168.3.88",  dst: "192.168.3.1",     proto: "HTTPS", port: 443, len: 430,  info: "TLS 1.2  Application Data  →  router admin panel",   isMalicious: false, hintAr: "وصول HTTPS إلى لوحة الراوتر — طبيعي." },
      { src: "192.168.3.50",  dst: "1.1.1.1",         proto: "DNS",   port: 53,  len: 70,   info: "Standard query A  npmjs.com",                        isMalicious: false, hintAr: "طلب DNS لـ npm — طبيعي لمطوري JavaScript." },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────
function padTwo(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatTime(baseMs: number, offsetMs: number): string {
  const d = new Date(baseMs + offsetMs);
  const h  = padTwo(d.getHours());
  const m  = padTwo(d.getMinutes());
  const s  = padTwo(d.getSeconds());
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

function buildLog(def: RoundDef): LogEntry[] {
  const normals = [...def.normals];

  // Fisher-Yates shuffle on normals so order is unpredictable
  for (let i = normals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [normals[i], normals[j]] = [normals[j], normals[i]];
  }

  // Insert malicious entry at a random position (not always the middle)
  const insertAt = Math.floor(Math.random() * (normals.length + 1));
  const templates = [
    ...normals.slice(0, insertAt),
    def.malicious,
    ...normals.slice(insertAt),
  ];

  // Generate realistic sequential timestamps
  const baseMs = Date.now() - Math.floor(Math.random() * 3_600_000); // random point in last hour
  let elapsed = 0;

  return templates.map((t, i) => {
    elapsed += 800 + Math.floor(Math.random() * 2_400); // 0.8-3.2 s between packets
    return { ...t, id: i, time: formatTime(baseMs, elapsed) };
  });
}

// ─── Sub-components ─────────────────────────────────────────────────────────────
function RoundDots({ total, done, correct }: { total: number; done: number; correct: number }) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full border transition-colors"
          style={{
            backgroundColor: i >= done ? "transparent"
              : i < correct ? "rgb(34 197 94 / 0.35)"
              : "rgb(239 68 68 / 0.35)",
            borderColor: i >= done ? "rgb(148 163 184 / 0.3)"
              : i < correct ? "rgb(34 197 94 / 0.7)"
              : "rgb(239 68 68 / 0.7)",
          }}
        />
      ))}
    </div>
  );
}

const PROTO_CLS: Record<string, string> = {
  HTTPS: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  DNS:   "text-sky-400    border-sky-400/30    bg-sky-400/10",
  SSH:   "text-violet-400 border-violet-400/30 bg-violet-400/10",
  FTP:   "text-amber-400  border-amber-400/30  bg-amber-400/10",
  TCP:   "text-rose-400   border-rose-400/30   bg-rose-400/10",
};

function ProtoBadge({ proto }: { proto: string }) {
  const cls = PROTO_CLS[proto] ?? "text-slate-400 border-slate-400/30 bg-slate-400/10";
  return (
    <span className={`inline-block font-mono text-[11px] px-1.5 py-0.5 rounded border font-bold tracking-wide whitespace-nowrap ${cls}`}>
      {proto}
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function TrafficAnalyzer() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [phase,     setPhase]     = useState<"intro" | "playing" | "finished">("intro");
  const [roundIdx,  setRoundIdx]  = useState(0);
  const [correct,   setCorrect]   = useState(0);
  const [verdict,   setVerdict]   = useState<"idle" | "correct" | "wrong">("idle");
  const [selected,  setSelected]  = useState<number | null>(null);
  const [wrongHint, setWrongHint] = useState("");

  // Build shuffled logs for every round on mount / when round changes
  const [logs, setLogs] = useState<LogEntry[]>([]);

  function startRound(idx: number) {
    setLogs(buildLog(ROUND_DEFS[idx]));
    setVerdict("idle");
    setSelected(null);
    setWrongHint("");
  }

  function startGame() {
    setRoundIdx(0);
    setCorrect(0);
    startRound(0);
    setPhase("playing");
  }

  function handleClick(log: LogEntry) {
    if (verdict !== "idle") return;
    setSelected(log.id);
    if (log.isMalicious) {
      setVerdict("correct");
      setCorrect((c) => c + 1);
    } else {
      setVerdict("wrong");
      setWrongHint(log.hintAr);
    }
  }

  function handleNext() {
    const next = roundIdx + 1;
    if (next >= ROUND_DEFS.length) {
      setPhase("finished");
    } else {
      setRoundIdx(next);
      startRound(next);
    }
  }

  const round   = ROUND_DEFS[roundIdx];
  const isLast  = roundIdx === ROUND_DEFS.length - 1;
  const total   = ROUND_DEFS.length;

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-8 py-6 px-4 text-center" dir="rtl">
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Terminal className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-3">محلل حركة الشبكة</h2>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto text-sm">
            ستواجه 3 جولات من سجلات الشبكة الحقيقية. في كل جولة يختبئ هجوم واحد بين حركة طبيعية — اكتشفه قبل أن يضرب.
          </p>
        </div>

        <div className="w-full max-w-md grid gap-2.5 text-start">
          {[
            "🔴  الجولة ١ — هجوم Brute Force على SSH",
            "🟠  الجولة ٢ — كلمة مرور Cleartext عبر FTP",
            "🔵  الجولة ٣ — مسح المنافذ (Port Scan)",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground">
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={startGame}
          className="flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-emerald-500/20"
        >
          <Terminal className="h-4 w-4" />
          ابدأ التحليل
          <ChevronRight className="h-4 w-4 rotate-180" />
        </button>
      </div>
    );
  }

  // ── FINISHED ─────────────────────────────────────────────────────────────────
  if (phase === "finished") {
    const pct   = Math.round((correct / total) * 100);
    const grade = pct === 100 ? "محلل شبكات محترف"
                : pct >= 67   ? "محلل واعد"
                :               "تحتاج مزيداً من التدريب";

    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center" dir="rtl">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${
          pct === 100 ? "bg-emerald-500/10 border-emerald-500/30"
          : pct >= 67 ? "bg-amber-500/10   border-amber-500/30"
          :             "bg-rose-500/10    border-rose-500/30"
        }`}>
          <Shield className={`h-10 w-10 ${pct === 100 ? "text-emerald-400" : pct >= 67 ? "text-amber-400" : "text-rose-400"}`} />
        </div>

        <div>
          <p className="text-muted-foreground text-sm mb-1">نتيجتك النهائية</p>
          <p className="text-5xl font-black text-foreground">{pct}<span className="text-2xl text-muted-foreground">%</span></p>
          <p className="text-lg font-semibold text-foreground mt-1">{grade}</p>
          <p className="text-muted-foreground text-sm mt-1">{correct} من {total} جولات صحيحة</p>
        </div>

        <RoundDots total={total} done={total} correct={correct} />

        <button
          onClick={() => setPhase("intro")}
          className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-semibold hover:border-foreground/30 transition-colors text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────────
  // Grid columns fixed to fit max-w-2xl container (≈648px usable)
  // 88 + 108 + 108 + 54 + 36 + 1fr = 394px fixed → info gets ~254px
  const COLS = "88px 108px 108px 54px 36px 1fr";

  return (
    <div className="flex flex-col gap-4">

      {/* Arabic header — RTL isolated */}
      <div className="flex items-center justify-between flex-wrap gap-3" dir="rtl">
        <div>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-0.5">محلل حركة الشبكة</p>
          <h3 className="font-black text-foreground text-base">{round.titleAr}</h3>
        </div>
        <RoundDots total={total} done={roundIdx} correct={correct} />
      </div>

      {/* Terminal window — forced LTR as a self-contained block */}
      <div className="rounded-xl border border-slate-700/60 overflow-hidden shadow-xl w-full" dir="ltr">

        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a2e] border-b border-slate-700/60 w-full">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 shrink-0" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 shrink-0" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 shrink-0" />
          <span className="mx-auto text-xs text-slate-500 font-mono">
            wireshark-sim — live capture — {logs.length} packets
          </span>
        </div>

        {/* Column headers */}
        <div
          className="grid w-full font-mono text-xs text-slate-500 px-3 py-1.5 border-b border-slate-700/40 bg-[#0f0f1a] text-left"
          style={{ gridTemplateColumns: COLS }}
        >
          <span>Time</span>
          <span>Source</span>
          <span>Destination</span>
          <span>Proto</span>
          <span>Port</span>
          <span>Info</span>
        </div>

        {/* Log rows */}
        <div className="bg-[#0d0d1a] divide-y divide-slate-800/40 w-full">
          {logs.map((log, idx) => {
            const isSelected  = selected === log.id;
            const revealRight = log.isMalicious && verdict !== "idle";

            const rowBg =
              isSelected && verdict === "correct" ? "bg-emerald-500/10 border-l-2 border-emerald-400"
              : isSelected && verdict === "wrong"  ? "bg-rose-500/10    border-l-2 border-rose-400"
              : revealRight                         ? "bg-emerald-500/5  border-l-2 border-emerald-700/40"
              : idx % 2 === 0                       ? "bg-[#0f0f1a]"
              :                                       "bg-[#0d0d1a]";

            return (
              <div
                key={log.id}
                onClick={() => handleClick(log)}
                className={`grid w-full items-center px-3 py-2 font-mono text-xs select-none transition-colors text-left ${rowBg} ${
                  verdict === "idle" ? "cursor-pointer hover:bg-slate-700/25" : "cursor-default"
                }`}
                style={{ gridTemplateColumns: COLS }}
              >
                <span className="text-slate-500">{log.time}</span>
                <span className="text-sky-400 truncate">{log.src}</span>
                <span className="text-violet-400 truncate">{log.dst}</span>
                <ProtoBadge proto={log.proto} />
                <span className="text-slate-400">{log.port}</span>
                <span className={`truncate text-[13px] ${
                  revealRight                         ? "text-emerald-300 font-semibold"
                  : isSelected && verdict === "wrong" ? "text-rose-300"
                  :                                     "text-slate-200"
                }`}>
                  {log.info}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arabic instruction/verdict — RTL isolated */}
      {verdict === "idle" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-1" dir="rtl">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>⚠️ انقر على السطر الذي تعتقد أنه يمثل هجوماً شبكياً.</span>
        </div>
      )}

      {/* Correct verdict — RTL isolated */}
      {verdict === "correct" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col gap-3" dir="rtl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300 text-sm mb-1">✓ تم اكتشاف الهجوم — Firewall مُفعَّل</p>
              <p className="text-emerald-200/80 text-sm leading-relaxed">{round.successAr}</p>
            </div>
          </div>
          <button
            onClick={handleNext}
            className="self-start flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg transition-colors text-sm"
          >
            <ChevronRight className="h-4 w-4" />
            {isLast ? "عرض النتيجة" : "الجولة التالية"}
          </button>
        </div>
      )}

      {/* Wrong verdict — RTL isolated */}
      {verdict === "wrong" && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex flex-col gap-3" dir="rtl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300 text-sm mb-1">✗ اختيار خاطئ — حاول مرة أخرى</p>
              <p className="text-rose-200/80 text-sm leading-relaxed">{wrongHint}</p>
            </div>
          </div>
          <button
            onClick={() => { setVerdict("idle"); setSelected(null); setWrongHint(""); }}
            className="self-start flex items-center gap-2 px-5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-lg border border-rose-500/30 transition-colors text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            حاول مجدداً
          </button>
        </div>
      )}
    </div>
  );
}
