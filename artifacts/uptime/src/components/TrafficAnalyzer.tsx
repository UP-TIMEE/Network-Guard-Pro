import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle2, RotateCcw, ChevronRight, Terminal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LogEntry {
  id: number;
  time: string;
  src: string;
  dst: string;
  proto: string;
  port: number;
  len: number;
  info: string;
  isMalicious: boolean;
  wrongClickHint: { ar: string; en: string };
}

interface Round {
  id: number;
  titleAr: string;
  titleEn: string;
  attackTypeAr: string;
  attackTypeEn: string;
  logs: LogEntry[];
  maliciousId: number;
  successAr: string;
  successEn: string;
}

// ─── Round Data ───────────────────────────────────────────────────────────────
const ROUNDS: Round[] = [
  // ══════════════════ ROUND 1 — SSH Brute Force ══════════════════
  {
    id: 1,
    titleAr: "الجولة ١ — هجوم القوة الغاشمة",
    titleEn: "Round 1 — Brute Force Attack",
    attackTypeAr: "Brute Force على SSH",
    attackTypeEn: "SSH Brute Force",
    maliciousId: 5,
    successAr: "ممتاز! اكتشفت هجوم Brute Force — محاولات تسجيل دخول متكررة وفاشلة من IP خارجي واحد على منفذ SSH 22 خلال ثوانٍ قليلة. تم تفعيل الـ Firewall وحظر المصدر.",
    successEn: "Excellent! You detected a Brute Force attack — repeated failed SSH login attempts from a single external IP on port 22 within seconds. Firewall activated and source blocked.",
    logs: [
      { id: 1,  time: "08:41:02.114", src: "192.168.1.45",  dst: "8.8.8.8",        proto: "DNS",   port: 53,  len: 72,  info: "Standard query A google.com",                          isMalicious: false, wrongClickHint: { ar: "هذا طلب DNS عادي للبحث عن عنوان نطاق — جزء طبيعي تماماً من تصفح الإنترنت.", en: "This is a normal DNS query — a standard part of browsing." } },
      { id: 2,  time: "08:41:03.882", src: "192.168.1.45",  dst: "142.250.74.46",  proto: "HTTPS", port: 443, len: 1380, info: "TLS 1.3 Application Data → accounts.google.com",        isMalicious: false, wrongClickHint: { ar: "اتصال HTTPS مشفر بـ TLS 1.3 — آمن تماماً.", en: "Encrypted HTTPS connection using TLS 1.3 — completely safe." } },
      { id: 3,  time: "08:41:05.210", src: "192.168.1.102", dst: "192.168.1.1",    proto: "HTTPS", port: 443, len: 540,  info: "TLS 1.3 Client Hello → router admin panel",              isMalicious: false, wrongClickHint: { ar: "وصول HTTPS إلى لوحة الراوتر المحلي — طبيعي.", en: "Local router admin panel access via HTTPS — normal." } },
      { id: 4,  time: "08:41:07.003", src: "192.168.1.45",  dst: "20.190.151.7",   proto: "HTTPS", port: 443, len: 890,  info: "TLS 1.3 Application Data → login.microsoftonline.com",   isMalicious: false, wrongClickHint: { ar: "تسجيل دخول Microsoft مشفر بـ TLS — اتصال آمن.", en: "Encrypted Microsoft login via TLS — safe connection." } },
      { id: 5,  time: "08:41:08.441", src: "203.0.113.77",  dst: "192.168.1.10",   proto: "SSH",   port: 22,  len: 64,   info: "FAILED login attempt #1 — user: admin  [AUTH_FAIL]",    isMalicious: true,  wrongClickHint: { ar: "", en: "" } },
      { id: 6,  time: "08:41:09.002", src: "203.0.113.77",  dst: "192.168.1.10",   proto: "SSH",   port: 22,  len: 64,   info: "FAILED login attempt #2 — user: root   [AUTH_FAIL]",    isMalicious: false, wrongClickHint: { ar: "هذا أيضاً جزء من الهجوم — لكن انقر على أول سطر مشبوه.", en: "Also part of the attack — but click the first suspicious line." } },
      { id: 7,  time: "08:41:09.614", src: "203.0.113.77",  dst: "192.168.1.10",   proto: "SSH",   port: 22,  len: 64,   info: "FAILED login attempt #3 — user: ubuntu  [AUTH_FAIL]",   isMalicious: false, wrongClickHint: { ar: "محاولة ثالثة من نفس الـ IP — جزء من الهجوم المبدوء في السطر #5.", en: "Third attempt from same IP — part of the attack started at line #5." } },
      { id: 8,  time: "08:41:11.780", src: "192.168.1.88",  dst: "151.101.1.140",  proto: "HTTPS", port: 443, len: 720,  info: "TLS 1.3 GET /index.html → fastly.net CDN",               isMalicious: false, wrongClickHint: { ar: "طلب HTTPS عبر شبكة CDN — تصفح عادي.", en: "HTTPS request via CDN — normal web browsing." } },
      { id: 9,  time: "08:41:13.055", src: "192.168.1.45",  dst: "8.8.4.4",        proto: "DNS",   port: 53,  len: 68,   info: "Standard query A github.com",                          isMalicious: false, wrongClickHint: { ar: "طلب DNS لـ GitHub — جزء طبيعي من التطوير أو التصفح.", en: "DNS query for GitHub — normal development or browsing activity." } },
    ],
  },

  // ══════════════════ ROUND 2 — FTP Cleartext ══════════════════
  {
    id: 2,
    titleAr: "الجولة ٢ — بيانات غير مشفرة",
    titleEn: "Round 2 — Cleartext Credentials",
    attackTypeAr: "كلمة مرور نصية عبر FTP",
    attackTypeEn: "FTP Cleartext Password",
    maliciousId: 14,
    successAr: "أحسنت! اكتشفت إرسال كلمة مرور بنص واضح عبر FTP — البروتوكول لا يشفر البيانات، ما يتيح لأي مهاجم على الشبكة رؤية بيانات الاعتماد. استخدم SFTP أو FTPS بدلاً من ذلك.",
    successEn: "Well done! You detected a cleartext FTP password — FTP transmits data unencrypted, allowing any attacker on the network to capture credentials. Use SFTP or FTPS instead.",
    logs: [
      { id: 11, time: "14:22:01.334", src: "192.168.2.20",  dst: "172.217.16.46",  proto: "HTTPS", port: 443, len: 1280, info: "TLS 1.3 Application Data → workspace.google.com",        isMalicious: false, wrongClickHint: { ar: "Google Workspace عبر HTTPS المشفر — آمن تماماً.", en: "Google Workspace over encrypted HTTPS — completely safe." } },
      { id: 12, time: "14:22:03.118", src: "192.168.2.20",  dst: "8.8.8.8",        proto: "DNS",   port: 53,  len: 70,   info: "Standard query A files.company.net",                   isMalicious: false, wrongClickHint: { ar: "طلب DNS للبحث عن خادم الشركة — طبيعي.", en: "DNS query for company server — normal." } },
      { id: 13, time: "14:22:04.902", src: "192.168.2.20",  dst: "192.168.2.5",    proto: "HTTPS", port: 443, len: 840,  info: "TLS 1.2 Application Data → internal.company.net",      isMalicious: false, wrongClickHint: { ar: "اتصال HTTPS داخلي مشفر — طبيعي في بيئات الشركات.", en: "Encrypted internal HTTPS connection — normal in corporate environments." } },
      { id: 14, time: "14:22:06.550", src: "192.168.2.20",  dst: "192.168.2.5",    proto: "FTP",   port: 21,  len: 48,   info: "PASS P@ssw0rd2024  [CLEARTEXT — no encryption]",       isMalicious: true,  wrongClickHint: { ar: "", en: "" } },
      { id: 15, time: "14:22:07.223", src: "192.168.2.20",  dst: "192.168.2.5",    proto: "FTP",   port: 21,  len: 32,   info: "RETR /backups/users.csv",                              isMalicious: false, wrongClickHint: { ar: "طلب ملف عبر FTP — مشكلته أن الجلسة انطلقت بكلمة مرور نصية في السطر السابق.", en: "File download via FTP — the issue is the cleartext password in the previous line." } },
      { id: 16, time: "14:22:09.440", src: "192.168.2.35",  dst: "104.18.12.92",   proto: "HTTPS", port: 443, len: 950,  info: "TLS 1.3 POST /api/v1/upload → cdn.dropbox.com",        isMalicious: false, wrongClickHint: { ar: "رفع ملف على Dropbox عبر HTTPS المشفر — آمن.", en: "Encrypted Dropbox file upload via HTTPS — safe." } },
      { id: 17, time: "14:22:11.002", src: "192.168.2.20",  dst: "8.8.8.8",        proto: "DNS",   port: 53,  len: 66,   info: "Standard query AAAA outlook.office365.com",            isMalicious: false, wrongClickHint: { ar: "طلب DNS لـ Microsoft 365 — طبيعي.", en: "DNS query for Microsoft 365 — normal." } },
      { id: 18, time: "14:22:12.780", src: "192.168.2.10",  dst: "40.112.72.205",  proto: "HTTPS", port: 443, len: 1100, info: "TLS 1.3 Application Data → outlook.office365.com",     isMalicious: false, wrongClickHint: { ar: "بريد Microsoft 365 مشفر — اتصال عمل طبيعي.", en: "Encrypted Microsoft 365 mail — normal work connection." } },
    ],
  },

  // ══════════════════ ROUND 3 — Port Scan ══════════════════
  {
    id: 3,
    titleAr: "الجولة ٣ — مسح المنافذ",
    titleEn: "Round 3 — Port Scanning",
    attackTypeAr: "Port Scan من IP خارجي",
    attackTypeEn: "External Port Scan",
    maliciousId: 24,
    successAr: "رائع! اكتشفت هجوم Port Scan — طلبات SYN متسلسلة على منافذ متتالية (22، 23، 25، 80، 443، 3389) من IP خارجي واحد خلال ثانية واحدة. هذا مؤشر استطلاع يسبق الهجوم.",
    successEn: "Brilliant! You detected a Port Scan — sequential SYN probes on consecutive ports (22, 23, 25, 80, 443, 3389) from a single external IP within one second. This is pre-attack reconnaissance.",
    logs: [
      { id: 21, time: "19:05:01.228", src: "192.168.3.50",  dst: "1.1.1.1",         proto: "DNS",   port: 53,  len: 74,   info: "Standard query A api.github.com",                      isMalicious: false, wrongClickHint: { ar: "طلب DNS لـ GitHub API — جزء من عمل المطورين.", en: "DNS query for GitHub API — normal developer activity." } },
      { id: 22, time: "19:05:02.441", src: "192.168.3.50",  dst: "140.82.121.4",    proto: "HTTPS", port: 443, len: 1420, info: "TLS 1.3 GET /repos → api.github.com",                   isMalicious: false, wrongClickHint: { ar: "طلب GitHub API عبر HTTPS — اتصال تطوير آمن.", en: "GitHub API over HTTPS — safe development connection." } },
      { id: 23, time: "19:05:03.880", src: "192.168.3.22",  dst: "172.64.155.209",  proto: "HTTPS", port: 443, len: 600,  info: "TLS 1.3 Application Data → www.cloudflare.com",        isMalicious: false, wrongClickHint: { ar: "اتصال HTTPS بـ Cloudflare — طبيعي جداً.", en: "HTTPS connection to Cloudflare — completely normal." } },
      { id: 24, time: "19:05:05.100", src: "198.51.100.42", dst: "192.168.3.1",     proto: "TCP",   port: 22,  len: 40,   info: "SYN →22 | SYN →23 | SYN →25 | SYN →80 | SYN →443 | SYN →3389  [PORT_SCAN ×6 in 0.9s]", isMalicious: true, wrongClickHint: { ar: "", en: "" } },
      { id: 25, time: "19:05:06.220", src: "192.168.3.50",  dst: "8.8.8.8",         proto: "DNS",   port: 53,  len: 68,   info: "Standard query A stackoverflow.com",                   isMalicious: false, wrongClickHint: { ar: "طلب DNS لـ Stack Overflow — نشاط مطور عادي.", en: "DNS query for Stack Overflow — normal developer activity." } },
      { id: 26, time: "19:05:07.550", src: "192.168.3.50",  dst: "151.101.129.69",  proto: "HTTPS", port: 443, len: 1050, info: "TLS 1.3 GET /questions → stackoverflow.com",            isMalicious: false, wrongClickHint: { ar: "تصفح Stack Overflow عبر HTTPS — آمن.", en: "Browsing Stack Overflow over HTTPS — safe." } },
      { id: 27, time: "19:05:09.002", src: "192.168.3.88",  dst: "192.168.3.1",     proto: "HTTPS", port: 443, len: 430,  info: "TLS 1.2 Application Data → router admin panel",        isMalicious: false, wrongClickHint: { ar: "وصول HTTPS إلى لوحة الراوتر — طبيعي.", en: "HTTPS router admin access — normal." } },
      { id: 28, time: "19:05:10.440", src: "192.168.3.50",  dst: "1.1.1.1",         proto: "DNS",   port: 53,  len: 70,   info: "Standard query A npmjs.com",                          isMalicious: false, wrongClickHint: { ar: "طلب DNS لـ npm — طبيعي لمطوري JavaScript.", en: "DNS query for npm — normal for JavaScript developers." } },
    ],
  },
];

// ─── Score Badge ──────────────────────────────────────────────────────────────
function RoundDots({ total, current, correct }: { total: number; current: number; correct: number }) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const ok   = i < correct;
        return (
          <div
            key={i}
            className="w-3 h-3 rounded-full border transition-colors"
            style={{
              backgroundColor: !done ? "transparent" : ok ? "rgb(34 197 94 / 0.35)" : "rgb(239 68 68 / 0.35)",
              borderColor:     !done ? "rgb(148 163 184 / 0.3)" : ok ? "rgb(34 197 94 / 0.7)" : "rgb(239 68 68 / 0.7)",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Protocol Badge ───────────────────────────────────────────────────────────
function ProtoBadge({ proto }: { proto: string }) {
  const colors: Record<string, string> = {
    HTTPS: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    DNS:   "text-sky-400    border-sky-400/30    bg-sky-400/10",
    SSH:   "text-violet-400 border-violet-400/30 bg-violet-400/10",
    FTP:   "text-amber-400  border-amber-400/30  bg-amber-400/10",
    TCP:   "text-rose-400   border-rose-400/30   bg-rose-400/10",
    HTTP:  "text-orange-400 border-orange-400/30 bg-orange-400/10",
  };
  const cls = colors[proto] ?? "text-slate-400 border-slate-400/30 bg-slate-400/10";
  return (
    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border font-bold tracking-wider ${cls}`}>
      {proto}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TrafficAnalyzer() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [phase,       setPhase]       = useState<"intro" | "playing" | "finished">("intro");
  const [roundIdx,    setRoundIdx]    = useState(0);
  const [correct,     setCorrect]     = useState(0);
  const [verdict,     setVerdict]     = useState<"idle" | "correct" | "wrong">("idle");
  const [selected,    setSelected]    = useState<number | null>(null);
  const [wrongHint,   setWrongHint]   = useState("");
  const [clickedLog,  setClickedLog]  = useState<number | null>(null);

  const round   = ROUNDS[roundIdx];
  const isLast  = roundIdx === ROUNDS.length - 1;

  function handleLogClick(log: LogEntry) {
    if (verdict !== "idle") return;

    setClickedLog(log.id);

    if (log.isMalicious) {
      setSelected(log.id);
      setVerdict("correct");
      setCorrect((c) => c + 1);
    } else {
      setSelected(log.id);
      setVerdict("wrong");
      setWrongHint(isRtl ? log.wrongClickHint.ar : log.wrongClickHint.en);
    }
  }

  function handleNext() {
    if (isLast) {
      setPhase("finished");
    } else {
      setRoundIdx((r) => r + 1);
      setVerdict("idle");
      setSelected(null);
      setClickedLog(null);
      setWrongHint("");
    }
  }

  function restart() {
    setPhase("intro");
    setRoundIdx(0);
    setCorrect(0);
    setVerdict("idle");
    setSelected(null);
    setClickedLog(null);
    setWrongHint("");
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-8 py-8 px-4 text-center" dir={isRtl ? "rtl" : "ltr"}>
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Terminal className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-3">
            {isRtl ? "محلل حركة الشبكة" : "Network Traffic Analyzer"}
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {isRtl
              ? "ستواجه 3 جولات من سجلات الشبكة الحقيقية. في كل جولة، حدّد السطر الذي يمثل هجوماً شبكياً واحداً مختبئاً بين حركة طبيعية."
              : "Face 3 rounds of real-looking network logs. Each round hides one malicious entry — find it among the normal traffic."}
          </p>
        </div>

        <div className="w-full max-w-lg grid grid-cols-1 gap-3 text-start" dir={isRtl ? "rtl" : "ltr"}>
          {[
            { ar: "🔴  هجوم Brute Force على SSH",   en: "🔴  SSH Brute Force Attack" },
            { ar: "🟠  كلمة مرور Cleartext عبر FTP", en: "🟠  FTP Cleartext Password" },
            { ar: "🔵  مسح المنافذ (Port Scan)",      en: "🔵  Port Scan Reconnaissance" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground">
              <span>{isRtl ? item.ar : item.en}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setPhase("playing")}
          className="flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-emerald-500/20"
        >
          <Terminal className="h-4 w-4" />
          {isRtl ? "ابدأ التحليل" : "Start Analysis"}
          <ChevronRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
        </button>
      </div>
    );
  }

  // ── FINISHED ───────────────────────────────────────────────────────────────
  if (phase === "finished") {
    const pct   = Math.round((correct / ROUNDS.length) * 100);
    const grade = pct === 100 ? (isRtl ? "محلل شبكات محترف" : "Network Security Expert")
                : pct >= 67   ? (isRtl ? "محلل واعد"        : "Promising Analyst")
                :               (isRtl ? "تحتاج مزيداً من التدريب" : "Keep Practicing");

    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center" dir={isRtl ? "rtl" : "ltr"}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${
          pct === 100 ? "bg-emerald-500/10 border-emerald-500/30" :
          pct >= 67   ? "bg-amber-500/10   border-amber-500/30"   :
                        "bg-rose-500/10    border-rose-500/30"
        }`}>
          <Shield className={`h-10 w-10 ${pct === 100 ? "text-emerald-400" : pct >= 67 ? "text-amber-400" : "text-rose-400"}`} />
        </div>

        <div>
          <p className="text-muted-foreground text-sm mb-1">{isRtl ? "نتيجتك" : "Your Score"}</p>
          <p className="text-5xl font-black text-foreground">{pct}<span className="text-2xl text-muted-foreground">%</span></p>
          <p className="text-lg font-semibold text-foreground mt-1">{grade}</p>
          <p className="text-muted-foreground text-sm mt-1">
            {isRtl ? `${correct} من ${ROUNDS.length} جولات صحيحة` : `${correct} of ${ROUNDS.length} rounds correct`}
          </p>
        </div>

        <RoundDots total={ROUNDS.length} current={ROUNDS.length} correct={correct} />

        <button
          onClick={restart}
          className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-semibold hover:border-foreground/30 transition-colors text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          {isRtl ? "إعادة المحاولة" : "Try Again"}
        </button>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4" dir={isRtl ? "rtl" : "ltr"}>

      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            {isRtl ? "محلل حركة الشبكة" : "Network Traffic Analyzer"}
          </p>
          <h3 className="font-black text-foreground text-base">{isRtl ? round.titleAr : round.titleEn}</h3>
        </div>
        <RoundDots total={ROUNDS.length} current={roundIdx} correct={correct} />
      </div>

      {/* Terminal window */}
      <div className="rounded-xl border border-slate-700/60 overflow-hidden shadow-xl">
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a2e] border-b border-slate-700/60">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="mx-auto text-[11px] text-slate-500 font-mono tracking-wider">
            wireshark-sim — {isRtl ? "حركة مباشرة" : "live capture"} — {round.logs.length} {isRtl ? "حزمة" : "packets"}
          </span>
        </div>

        {/* Column headers */}
        <div className="grid font-mono text-[10px] text-slate-500 px-4 py-1.5 border-b border-slate-700/40 bg-[#0f0f1a]"
          style={{ gridTemplateColumns: "100px 130px 130px 64px 48px 1fr" }}>
          <span>{isRtl ? "الوقت" : "Time"}</span>
          <span>Source</span>
          <span>Destination</span>
          <span>Proto</span>
          <span>Port</span>
          <span>{isRtl ? "المعلومات" : "Info"}</span>
        </div>

        {/* Log rows */}
        <div className="bg-[#0d0d1a] divide-y divide-slate-800/50">
          {round.logs.map((log, idx) => {
            const isSelected = selected === log.id;
            const rowBg =
              isSelected && verdict === "correct" ? "bg-emerald-500/10 border-l-2 border-l-emerald-400" :
              isSelected && verdict === "wrong"   ? "bg-rose-500/10    border-l-2 border-l-rose-400"    :
              log.isMalicious && verdict !== "idle" ? "bg-emerald-500/5 border-l-2 border-l-emerald-600/50" :
              idx % 2 === 0 ? "bg-[#0f0f1a]" : "bg-[#0d0d1a]";

            return (
              <div
                key={log.id}
                onClick={() => handleLogClick(log)}
                className={`grid items-center px-4 py-2 font-mono text-[11px] gap-2 cursor-pointer transition-all duration-150 hover:brightness-125 select-none ${rowBg} ${
                  verdict !== "idle" ? "cursor-default" : "hover:bg-slate-700/20"
                }`}
                style={{ gridTemplateColumns: "100px 130px 130px 64px 48px 1fr" }}
              >
                <span className="text-slate-500 text-[10px]">{log.time}</span>
                <span className="text-sky-400 truncate">{log.src}</span>
                <span className="text-violet-400 truncate">{log.dst}</span>
                <ProtoBadge proto={log.proto} />
                <span className="text-slate-400">{log.port}</span>
                <span className={`truncate ${
                  log.isMalicious && verdict !== "idle" ? "text-emerald-300 font-bold" :
                  isSelected && verdict === "wrong"     ? "text-rose-300"              :
                                                          "text-slate-300"
                }`}>
                  {log.info}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instruction / verdict */}
      {verdict === "idle" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{isRtl ? "انقر على السطر الذي تعتقد أنه يمثل هجوماً شبكياً." : "Click the log entry you believe represents a network attack."}</span>
        </div>
      )}

      {verdict === "correct" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="font-bold text-emerald-300 text-sm">
                {isRtl ? "✓ تم اكتشاف الهجوم — Firewall مُفعَّل" : "✓ Attack Detected — Firewall Activated"}
              </p>
              <p className="text-emerald-200/80 text-sm leading-relaxed">
                {isRtl ? round.successAr : round.successEn}
              </p>
            </div>
          </div>
          <button
            onClick={handleNext}
            className="self-end flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg transition-colors text-sm"
          >
            {isLast
              ? (isRtl ? "عرض النتيجة" : "See Results")
              : (isRtl ? "الجولة التالية" : "Next Round")}
            <ChevronRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}

      {verdict === "wrong" && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="font-bold text-rose-300 text-sm">
                {isRtl ? "✗ اختيار خاطئ — حاول مرة أخرى" : "✗ Wrong Selection — Try Again"}
              </p>
              <p className="text-rose-200/80 text-sm leading-relaxed">{wrongHint}</p>
            </div>
          </div>
          <button
            onClick={() => { setVerdict("idle"); setSelected(null); setClickedLog(null); setWrongHint(""); }}
            className="self-end flex items-center gap-2 px-5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-lg border border-rose-500/30 transition-colors text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            {isRtl ? "حاول مجدداً" : "Try Again"}
          </button>
        </div>
      )}
    </div>
  );
}
