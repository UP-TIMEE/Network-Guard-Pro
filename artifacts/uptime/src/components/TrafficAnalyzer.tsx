import { useState } from "react";
import {
  Shield, AlertTriangle, CheckCircle2,
  RotateCcw, ChevronLeft, Terminal,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface LogTemplate {
  src: string;
  dst: string;
  proto: string;
  port: number;
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
  normals: LogTemplate[];
  malicious: LogTemplate;
  successAr: string;
}

// ─── Round Data ─────────────────────────────────────────────────────────────────
const ROUNDS: RoundDef[] = [
  {
    titleAr: "الجولة الأولى — هجوم القوة الغاشمة على SSH",
    successAr:
      "أحسنت! رصدت هجوم Brute Force — ثلاث محاولات دخول فاشلة من نفس الـ IP الخارجي (203.0.113.77) على منفذ SSH خلال أقل من ثانية واحدة. تم حظر المصدر وتفعيل الـ Firewall.",
    malicious: {
      src: "203.0.113.77", dst: "192.168.1.10",
      proto: "SSH", port: 22,
      info: "AUTH_FAIL ×3 [root/admin/ubuntu] within 0.9 s — BRUTE_FORCE",
      isMalicious: true, hintAr: "",
    },
    normals: [
      { src: "192.168.1.45",  dst: "8.8.8.8",       proto: "DNS",   port: 53,  info: "Standard query A  google.com",                          isMalicious: false, hintAr: "طلب DNS عادي للبحث عن عنوان النطاق — جزء طبيعي من التصفح." },
      { src: "192.168.1.45",  dst: "142.250.74.46", proto: "HTTPS", port: 443, info: "TLS 1.3  Application Data → accounts.google.com",        isMalicious: false, hintAr: "اتصال HTTPS مشفر بـ TLS 1.3 — آمن تماماً." },
      { src: "192.168.1.102", dst: "192.168.1.1",   proto: "HTTPS", port: 443, info: "TLS 1.3  Client Hello → router admin panel",            isMalicious: false, hintAr: "وصول HTTPS إلى لوحة الراوتر — مشفر وطبيعي." },
      { src: "192.168.1.45",  dst: "20.190.151.7",  proto: "HTTPS", port: 443, info: "TLS 1.3  Application Data → login.microsoftonline.com", isMalicious: false, hintAr: "تسجيل دخول Microsoft عبر HTTPS — آمن تماماً." },
      { src: "192.168.1.88",  dst: "151.101.1.140", proto: "HTTPS", port: 443, info: "TLS 1.3  GET /index.html → fastly.net CDN",             isMalicious: false, hintAr: "طلب HTTPS عبر شبكة CDN — تصفح عادي ومشفر." },
      { src: "192.168.1.45",  dst: "8.8.4.4",       proto: "DNS",   port: 53,  info: "Standard query A  github.com",                          isMalicious: false, hintAr: "طلب DNS لـ GitHub — نشاط تطوير طبيعي." },
      { src: "192.168.1.30",  dst: "104.21.56.8",   proto: "HTTPS", port: 443, info: "TLS 1.3  Application Data → api.cloudflare.com",        isMalicious: false, hintAr: "اتصال HTTPS إلى Cloudflare — طبيعي جداً." },
    ],
  },
  {
    titleAr: "الجولة الثانية — كلمة مرور بنص واضح عبر FTP",
    successAr:
      "أحسنت! رصدت إرسال كلمة مرور بنص واضح (Cleartext) عبر FTP على المنفذ 21. بروتوكول FTP لا يشفّر البيانات، ما يتيح لأي مهاجم على الشبكة قراءة بيانات الاعتماد. استخدم SFTP أو FTPS بدلاً من ذلك.",
    malicious: {
      src: "192.168.2.20", dst: "192.168.2.5",
      proto: "FTP", port: 21,
      info: "PASS  P@ssw0rd2024  [CLEARTEXT — no encryption]",
      isMalicious: true, hintAr: "",
    },
    normals: [
      { src: "192.168.2.20", dst: "172.217.16.46",  proto: "HTTPS", port: 443, info: "TLS 1.3  Application Data → workspace.google.com",    isMalicious: false, hintAr: "Google Workspace عبر HTTPS المشفر — آمن تماماً." },
      { src: "192.168.2.20", dst: "8.8.8.8",        proto: "DNS",   port: 53,  info: "Standard query A  files.company.net",                  isMalicious: false, hintAr: "طلب DNS للبحث عن خادم الشركة — طبيعي." },
      { src: "192.168.2.20", dst: "192.168.2.5",    proto: "HTTPS", port: 443, info: "TLS 1.2  Application Data → internal.company.net",   isMalicious: false, hintAr: "اتصال HTTPS داخلي مشفر — طبيعي في بيئات الشركات." },
      { src: "192.168.2.20", dst: "192.168.2.5",    proto: "FTP",   port: 21,  info: "USER  john.doe",                                     isMalicious: false, hintAr: "إرسال اسم المستخدم عبر FTP — غير مشفر لكن ليس كلمة المرور. ابحث عن سطر PASS." },
      { src: "192.168.2.35", dst: "104.18.12.92",   proto: "HTTPS", port: 443, info: "TLS 1.3  POST /api/v1/upload → cdn.dropbox.com",     isMalicious: false, hintAr: "رفع ملف على Dropbox عبر HTTPS المشفر — آمن." },
      { src: "192.168.2.20", dst: "8.8.8.8",        proto: "DNS",   port: 53,  info: "Standard query AAAA  outlook.office365.com",          isMalicious: false, hintAr: "طلب DNS لـ Microsoft 365 — طبيعي." },
      { src: "192.168.2.10", dst: "40.112.72.205",  proto: "HTTPS", port: 443, info: "TLS 1.3  Application Data → outlook.office365.com",  isMalicious: false, hintAr: "بريد Microsoft 365 مشفر — اتصال عمل طبيعي." },
    ],
  },
  {
    titleAr: "الجولة الثالثة — مسح المنافذ من IP خارجي",
    successAr:
      "رائع! رصدت هجوم Port Scan — طلبات SYN متسلسلة على 6 منافذ مختلفة (22، 23، 25، 80، 443، 3389) من IP خارجي خلال أقل من ثانية. هذا نشاط استطلاع يسبق محاولة الاختراق.",
    malicious: {
      src: "198.51.100.42", dst: "192.168.3.1",
      proto: "TCP", port: 22,
      info: "SYN→22 | SYN→23 | SYN→25 | SYN→80 | SYN→443 | SYN→3389  [×6 in 0.8 s]",
      isMalicious: true, hintAr: "",
    },
    normals: [
      { src: "192.168.3.50", dst: "1.1.1.1",         proto: "DNS",   port: 53,  info: "Standard query A  api.github.com",                   isMalicious: false, hintAr: "طلب DNS لـ GitHub API — نشاط مطور عادي." },
      { src: "192.168.3.50", dst: "140.82.121.4",    proto: "HTTPS", port: 443, info: "TLS 1.3  GET /repos → api.github.com",               isMalicious: false, hintAr: "طلب GitHub API عبر HTTPS المشفر — آمن." },
      { src: "192.168.3.22", dst: "172.64.155.209",  proto: "HTTPS", port: 443, info: "TLS 1.3  Application Data → www.cloudflare.com",    isMalicious: false, hintAr: "اتصال HTTPS بـ Cloudflare — طبيعي جداً." },
      { src: "192.168.3.50", dst: "8.8.8.8",         proto: "DNS",   port: 53,  info: "Standard query A  stackoverflow.com",               isMalicious: false, hintAr: "طلب DNS لـ Stack Overflow — نشاط مطور عادي." },
      { src: "192.168.3.50", dst: "151.101.129.69",  proto: "HTTPS", port: 443, info: "TLS 1.3  GET /questions → stackoverflow.com",       isMalicious: false, hintAr: "تصفح Stack Overflow عبر HTTPS — آمن تماماً." },
      { src: "192.168.3.88", dst: "192.168.3.1",     proto: "HTTPS", port: 443, info: "TLS 1.2  Application Data → router admin panel",   isMalicious: false, hintAr: "وصول HTTPS إلى لوحة الراوتر المحلي — طبيعي." },
      { src: "192.168.3.50", dst: "1.1.1.1",         proto: "DNS",   port: 53,  info: "Standard query A  npmjs.com",                       isMalicious: false, hintAr: "طلب DNS لـ npm — طبيعي لمطوري JavaScript." },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────
function pad2(n: number) { return String(Math.floor(n)).padStart(2, "0"); }

function makeTimestamp(baseMs: number, offsetMs: number) {
  const d  = new Date(baseMs + offsetMs);
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}.${ms}`;
}

function buildLogs(def: RoundDef): LogEntry[] {
  // Shuffle normals
  const normals = [...def.normals];
  for (let i = normals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [normals[i], normals[j]] = [normals[j], normals[i]];
  }
  // Insert malicious at random position
  const pos = Math.floor(Math.random() * (normals.length + 1));
  const all = [...normals.slice(0, pos), def.malicious, ...normals.slice(pos)];

  // Generate timestamps
  const base    = Date.now() - Math.floor(Math.random() * 3_600_000);
  let   elapsed = 0;
  return all.map((t, i) => {
    elapsed += 600 + Math.floor(Math.random() * 2_800);
    return { ...t, id: i, time: makeTimestamp(base, elapsed) };
  });
}

// ─── Protocol badge ──────────────────────────────────────────────────────────────
const PROTO_COLOR: Record<string, string> = {
  HTTPS: "text-emerald-300 bg-emerald-400/10 border-emerald-500/30",
  DNS:   "text-sky-300    bg-sky-400/10    border-sky-500/30",
  SSH:   "text-violet-300 bg-violet-400/10 border-violet-500/30",
  FTP:   "text-amber-300  bg-amber-400/10  border-amber-500/30",
  TCP:   "text-rose-300   bg-rose-400/10   border-rose-500/30",
};
function ProtoBadge({ proto }: { proto: string }) {
  const cls = PROTO_COLOR[proto] ?? "text-slate-300 bg-slate-400/10 border-slate-500/30";
  return (
    <span className={`inline-block border rounded px-1 py-px font-mono font-bold text-[11px] leading-none ${cls}`}>
      {proto}
    </span>
  );
}

// ─── Round dots ──────────────────────────────────────────────────────────────────
function RoundDots({ total, done, correct }: { total: number; done: number; correct: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="inline-block w-3 h-3 rounded-full border transition-colors"
          style={{
            background:   i >= done ? "transparent" : i < correct ? "rgb(34 197 94/.35)" : "rgb(239 68 68/.35)",
            borderColor:  i >= done ? "rgb(148 163 184/.3)" : i < correct ? "rgb(34 197 94/.7)" : "rgb(239 68 68/.7)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────────
export default function TrafficAnalyzer() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [phase,     setPhase]     = useState<"intro" | "playing" | "done">("intro");
  const [roundIdx,  setRoundIdx]  = useState(0);
  const [correct,   setCorrect]   = useState(0);
  const [logs,      setLogs]      = useState<LogEntry[]>([]);
  const [verdict,   setVerdict]   = useState<"idle" | "correct" | "wrong">("idle");
  const [selected,  setSelected]  = useState<number | null>(null);
  const [hint,      setHint]      = useState("");

  const total = ROUNDS.length;
  const round = ROUNDS[roundIdx];

  function launchRound(idx: number) {
    setLogs(buildLogs(ROUNDS[idx]));
    setVerdict("idle");
    setSelected(null);
    setHint("");
  }

  function startGame() {
    setRoundIdx(0); setCorrect(0);
    launchRound(0);
    setPhase("playing");
  }

  function handleRowClick(log: LogEntry) {
    if (verdict !== "idle") return;
    setSelected(log.id);
    if (log.isMalicious) {
      setVerdict("correct");
      setCorrect(c => c + 1);
    } else {
      setVerdict("wrong");
      setHint(log.hintAr);
    }
  }

  function nextRound() {
    const next = roundIdx + 1;
    if (next >= total) { setPhase("done"); return; }
    setRoundIdx(next);
    launchRound(next);
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div className="flex flex-col items-center gap-7 py-8 px-4 text-center" dir="rtl">
      <div>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Terminal className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">محلل حركة الشبكة</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          ستواجه ٣ جولات من سجلات الشبكة. في كل جولة يختبئ هجوم واحد بين اتصالات طبيعية — اكتشفه قبل أن يضرب.
        </p>
      </div>
      <div className="w-full max-w-md grid gap-2 text-start">
        {["🔴  الجولة ١ — هجوم Brute Force على SSH",
          "🟠  الجولة ٢ — كلمة مرور Cleartext عبر FTP",
          "🔵  الجولة ٣ — مسح المنافذ (Port Scan)",
        ].map((item, i) => (
          <div key={i} className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground">{item}</div>
        ))}
      </div>
      <button
        onClick={startGame}
        className="flex items-center gap-2 px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-emerald-500/20"
      >
        <Terminal className="h-4 w-4" />
        ابدأ التحليل
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );

  // ── DONE ──────────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const pct   = Math.round((correct / total) * 100);
    const grade = pct === 100 ? "محلل شبكات محترف" : pct >= 67 ? "محلل واعد" : "تحتاج مزيداً من التدريب";
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center" dir="rtl">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${
          pct === 100 ? "bg-emerald-500/10 border-emerald-500/30" :
          pct >= 67   ? "bg-amber-500/10   border-amber-500/30"   :
                        "bg-rose-500/10    border-rose-500/30"}`}>
          <Shield className={`h-10 w-10 ${pct === 100 ? "text-emerald-400" : pct >= 67 ? "text-amber-400" : "text-rose-400"}`} />
        </div>
        <div>
          <p className="text-muted-foreground text-sm mb-1">نتيجتك النهائية</p>
          <p className="text-5xl font-black text-foreground">{pct}<span className="text-2xl text-muted-foreground">%</span></p>
          <p className="text-lg font-semibold mt-1">{grade}</p>
          <p className="text-muted-foreground text-sm mt-1">{correct} من {total} جولات صحيحة</p>
        </div>
        <RoundDots total={total} done={total} correct={correct} />
        <button
          onClick={() => setPhase("intro")}
          className="flex items-center gap-2 px-6 py-2.5 bg-card border border-border rounded-xl font-semibold hover:border-foreground/30 transition-colors text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* Arabic header — RTL */}
      <div className="flex items-center justify-between gap-3 flex-wrap" dir="rtl">
        <div>
          <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-0.5">
            الجولة {roundIdx + 1} من {total}
          </p>
          <h3 className="font-black text-foreground text-base">{round.titleAr}</h3>
        </div>
        <RoundDots total={total} done={roundIdx} correct={correct} />
      </div>

      {/* ── Terminal — hard LTR, table-based ── */}
      <div
        dir="ltr"
        className="rounded-xl border border-slate-700/50 overflow-hidden bg-[#0d0d1a] shadow-xl"
      >
        {/* macOS-style title bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#141428] border-b border-slate-700/50">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="flex-1 text-center text-[11px] text-slate-500 font-mono select-none">
            wireshark-sim  ·  live capture  ·  {logs.length} packets
          </span>
        </div>

        {/* Table — fixed layout guarantees header↔data alignment */}
        <table className="w-full table-fixed border-collapse font-mono">
          <colgroup>
            <col style={{ width: "14%" }} />  {/* Time      */}
            <col style={{ width: "17%" }} />  {/* Source    */}
            <col style={{ width: "17%" }} />  {/* Dest      */}
            <col style={{ width: "9%"  }} />  {/* Proto     */}
            <col style={{ width: "7%"  }} />  {/* Port      */}
            <col style={{ width: "36%" }} />  {/* Info      */}
          </colgroup>

          {/* Header */}
          <thead>
            <tr className="bg-[#111122] border-b border-slate-700/50 text-left text-[11px] text-slate-500 uppercase tracking-wider">
              <th className="px-3 py-2 font-semibold">Time</th>
              <th className="px-3 py-2 font-semibold">Source</th>
              <th className="px-3 py-2 font-semibold">Destination</th>
              <th className="px-3 py-2 font-semibold">Proto</th>
              <th className="px-3 py-2 font-semibold">Port</th>
              <th className="px-3 py-2 font-semibold">Info</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-800/50">
            {logs.map((log, idx) => {
              const sel        = selected === log.id;
              const isRevealed = log.isMalicious && verdict !== "idle";

              const rowCls =
                sel && verdict === "correct" ? "bg-emerald-500/10 border-l-2 border-l-emerald-400" :
                sel && verdict === "wrong"   ? "bg-rose-500/10    border-l-2 border-l-rose-400"    :
                isRevealed                   ? "bg-emerald-500/5"  :
                idx % 2 === 0               ? "bg-[#0f0f1e]"      :
                                              "bg-[#0d0d1a]";

              const infoCls =
                isRevealed                   ? "text-emerald-300 font-semibold" :
                sel && verdict === "wrong"   ? "text-rose-300"                  :
                                              "text-slate-200";

              return (
                <tr
                  key={log.id}
                  onClick={() => handleRowClick(log)}
                  className={`text-sm text-left transition-colors select-none ${rowCls} ${
                    verdict === "idle" ? "cursor-pointer hover:brightness-125" : "cursor-default"
                  }`}
                >
                  <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{log.time}</td>
                  <td className="px-3 py-2.5 text-sky-400    truncate">{log.src}</td>
                  <td className="px-3 py-2.5 text-violet-400 truncate">{log.dst}</td>
                  <td className="px-3 py-2.5"><ProtoBadge proto={log.proto} /></td>
                  <td className="px-3 py-2.5 text-slate-400 text-xs">{log.port}</td>
                  <td className={`px-3 py-2.5 truncate ${infoCls}`}>{log.info}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Instruction — RTL ── */}
      {verdict === "idle" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" dir="rtl">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          انقر على السطر الذي يمثّل هجوماً شبكياً.
        </p>
      )}

      {/* ── Correct — RTL ── */}
      {verdict === "correct" && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 flex flex-col gap-3" dir="rtl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300 text-sm mb-1">✓ تم رصد الهجوم — Firewall مُفعَّل</p>
              <p className="text-emerald-200/75 text-sm leading-relaxed">{round.successAr}</p>
            </div>
          </div>
          <button
            onClick={nextRound}
            className="self-start flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg text-sm transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {roundIdx + 1 >= total ? "عرض النتيجة" : "الجولة التالية"}
          </button>
        </div>
      )}

      {/* ── Wrong — RTL ── */}
      {verdict === "wrong" && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 flex flex-col gap-3" dir="rtl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300 text-sm mb-1">✗ خطأ، هذا اتصال طبيعي — حاول مجدداً</p>
              <p className="text-rose-200/75 text-sm leading-relaxed">{hint}</p>
            </div>
          </div>
          <button
            onClick={() => { setVerdict("idle"); setSelected(null); setHint(""); }}
            className="self-start flex items-center gap-2 px-5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold rounded-lg border border-rose-500/25 text-sm transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            حاول مجدداً
          </button>
        </div>
      )}
    </div>
  );
}
