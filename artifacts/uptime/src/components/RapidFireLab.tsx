import { useState, useEffect, useCallback } from "react";
import {
  Link2, MessageSquare, Mail, MessageCircle,
  ShieldCheck, ShieldX, Trophy, Zap, Clock,
  AlertTriangle, CheckCircle, ChevronRight, RefreshCw,
} from "lucide-react";

// ─────────────────────────── Data ───────────────────────────

type ScenarioType = "url" | "sms" | "email" | "message";

interface Scenario {
  id: number;
  content: string;
  type: ScenarioType;
  isMalicious: boolean;
  explanation: string;
}

const securityScenarios: Scenario[] = [
  {
    id: 1,
    content: "http://paypal.com.secure-verify.net/login",
    type: "url",
    isMalicious: true,
    explanation:
      "النطاق الحقيقي هو paypal.com، لكن هنا يُستخدَم كنطاق فرعي داخل secure-verify.net الخبيث. الموقع الشرعي ينتهي دائماً بـ paypal.com مباشرةً.",
  },
  {
    id: 2,
    content: "https://www.stc.com.sa/portal/myaccount",
    type: "url",
    isMalicious: false,
    explanation: "",
  },
  {
    id: 3,
    content:
      "من: البنك الأهلي\nتنبيه: رُصد نشاط مشبوه في حسابك. تحقق فوراً:\nahli-bank-secure.link/auth?token=91827",
    type: "sms",
    isMalicious: true,
    explanation:
      "الرابط ahli-bank-secure.link ليس النطاق الرسمي (alahli.com). البنوك لا ترسل روابط اتخاذ إجراء عاجل عبر SMS — اتصل دائماً بالرقم الرسمي على بطاقتك.",
  },
  {
    id: 4,
    content: "no-reply@google.com",
    type: "email",
    isMalicious: false,
    explanation: "",
  },
  {
    id: 5,
    content:
      "مرحباً، أنا من برنامج حساب المواطن. أرسل رقم هويتك ورمز OTP لتأكيد أهليتك للحصول على دعم بقيمة ريال 2,000.",
    type: "message",
    isMalicious: true,
    explanation:
      "لا توجد جهة حكومية تطلب رقم الهوية أو رمز OTP عبر رسائل خاصة. رمز OTP سري تماماً ولا يُشارَك مع أي شخص تحت أي ذريعة.",
  },
];

const TIMER_SECONDS = 10;

// ─────────────────────────── Type icons ───────────────────────────

function TypeIcon({ type, className }: { type: ScenarioType; className?: string }) {
  const cls = className ?? "h-5 w-5";
  if (type === "url")     return <Link2         className={cls} />;
  if (type === "sms")     return <MessageSquare className={cls} />;
  if (type === "email")   return <Mail          className={cls} />;
  return                         <MessageCircle className={cls} />;
}

function typeLabel(type: ScenarioType, isRtl: boolean): string {
  const map: Record<ScenarioType, [string, string]> = {
    url:     ["رابط URL",    "URL Link"   ],
    sms:     ["رسالة SMS",   "SMS Message"],
    email:   ["عنوان بريد",  "Email"      ],
    message: ["رسالة نصية",  "Chat Msg"   ],
  };
  return map[type][isRtl ? 0 : 1];
}

// ─────────────────────────── Score badge ───────────────────────────

function ScoreBadge({ correct, total, isRtl }: { correct: number; total: number; isRtl: boolean }) {
  const pct = Math.round((correct / total) * 100);
  if (pct === 100)
    return (
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-sm font-bold">
        <Trophy className="h-4 w-4" />
        {isRtl ? "محقق أمني محترف" : "Security Expert"}
      </span>
    );
  if (pct >= 60)
    return (
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-sm font-bold">
        <ShieldCheck className="h-4 w-4" />
        {isRtl ? "وعي جيد — استمر في التدريب" : "Good Awareness — Keep Training"}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-sm font-bold">
      <AlertTriangle className="h-4 w-4" />
      {isRtl ? "تحتاج مزيداً من التدريب" : "Needs More Training"}
    </span>
  );
}

// ─────────────────────────── Main component ───────────────────────────

type LabPhase = "intro" | "playing" | "finished";
type Verdict  = "idle" | "correct" | "wrong" | "timeout";

export function RapidFireLab({ isRtl }: { isRtl: boolean }) {
  const [phase,      setPhase]      = useState<LabPhase>("intro");
  const [cardIdx,    setCardIdx]    = useState(0);
  const [correct,    setCorrect]    = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(TIMER_SECONDS);
  const [verdict,    setVerdict]    = useState<Verdict>("idle");
  const [timerActive, setTimerActive] = useState(false);

  const scenario = securityScenarios[cardIdx];
  const total    = securityScenarios.length;

  // ── Timer countdown ──
  useEffect(() => {
    if (!timerActive || verdict !== "idle") return;
    if (timeLeft <= 0) {
      setVerdict("timeout");
      setTimerActive(false);
      return;
    }
    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, timeLeft, verdict]);

  // ── Start a card ──
  const startCard = useCallback((idx: number) => {
    setCardIdx(idx);
    setTimeLeft(TIMER_SECONDS);
    setVerdict("idle");
    setTimerActive(true);
  }, []);

  const startGame = () => {
    setCorrect(0);
    setPhase("playing");
    startCard(0);
  };

  // ── Player answers ──
  const handleAnswer = (guessedMalicious: boolean) => {
    if (verdict !== "idle") return;
    setTimerActive(false);

    if (guessedMalicious === scenario.isMalicious) {
      setCorrect((c) => c + 1);
      setVerdict("correct");
      // Flash green then advance
      setTimeout(() => advance(), 700);
    } else {
      setVerdict("wrong");
    }
  };

  const advance = () => {
    const next = cardIdx + 1;
    if (next >= total) {
      setPhase("finished");
    } else {
      startCard(next);
    }
  };

  // ── Timer bar ──
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor =
    timeLeft > 6 ? "bg-emerald-500"
    : timeLeft > 3 ? "bg-yellow-500"
    : "bg-red-500";

  // ═══════════════════════════════════ INTRO ════════════════════════════════
  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center text-center gap-8 py-12 px-4 max-w-xl mx-auto">
        <div className="p-5 rounded-3xl bg-primary/10 border border-primary/20">
          <Zap className="h-14 w-14 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-foreground mb-3">
            {isRtl ? "مختبر القرارات السريعة" : "Rapid-Fire Decision Lab"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isRtl
              ? "ستُعرض عليك 5 بطاقات — روابط، رسائل وعناوين بريد. لديك 10 ثوانٍ لكل قرار: هل هو آمن أم خبيث؟"
              : "You'll see 5 cards — URLs, messages and emails. You have 10 seconds per card: Safe or Malicious?"}
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 text-start" dir={isRtl ? "rtl" : "ltr"}>
          {[
            { icon: Clock,        label: isRtl ? "10 ثوانٍ لكل قرار"    : "10 seconds per decision" },
            { icon: Link2,        label: isRtl ? "روابط خبيثة مُخفية"  : "Disguised malicious URLs" },
            { icon: MessageSquare,label: isRtl ? "رسائل تصيد احتيالي"   : "Phishing SMS & messages"  },
            { icon: Trophy,       label: isRtl ? "نتيجة بالنسبة المئوية": "Final percentage score"   },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 bg-card border border-border rounded-xl p-3">
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={startGame}
          className="flex items-center gap-2 px-8 py-3.5 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
          {isRtl ? "ابدأ المختبر" : "Start Lab"}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════ FINISHED ═════════════════════════════
  if (phase === "finished") {
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="flex flex-col items-center text-center gap-8 py-12 px-4 max-w-xl mx-auto animate-in fade-in duration-500">
        <div className="p-5 rounded-3xl bg-primary/10 border border-primary/20">
          <Trophy className="h-14 w-14 text-primary" />
        </div>

        <div>
          <p className="text-muted-foreground text-sm mb-1 font-medium">
            {isRtl ? "نتيجتك النهائية" : "Your Final Score"}
          </p>
          <div className="text-7xl font-black text-foreground mb-1">{pct}%</div>
          <p className="text-muted-foreground text-sm">
            {isRtl ? `${correct} من ${total} إجابات صحيحة` : `${correct} out of ${total} correct`}
          </p>
        </div>

        <ScoreBadge correct={correct} total={total} isRtl={isRtl} />

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {securityScenarios.map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full border"
              style={{
                backgroundColor: i < correct ? "rgb(34 197 94 / 0.4)" : "rgb(239 68 68 / 0.4)",
                borderColor:     i < correct ? "rgb(34 197 94 / 0.6)" : "rgb(239 68 68 / 0.6)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => { setPhase("intro"); }}
          className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-semibold hover:border-foreground/30 transition-colors text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          {isRtl ? "إعادة المحاولة" : "Try Again"}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════ PLAYING ══════════════════════════════

  const isWrongOrTimeout = verdict === "wrong" || verdict === "timeout";
  const isFlashCorrect   = verdict === "correct";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Progress indicator ── */}
      <div className="flex items-center justify-between mb-5 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {isRtl ? `البطاقة ${cardIdx + 1} من ${total}` : `Card ${cardIdx + 1} of ${total}`}
        </span>
        <span className="flex items-center gap-1.5 font-mono tabular-nums">
          <Clock className="h-3.5 w-3.5" />
          {timeLeft}s
        </span>
      </div>

      {/* ── Card ── */}
      <div
        className={`
          relative rounded-2xl border overflow-hidden shadow-xl transition-all duration-300
          ${isFlashCorrect   ? "border-emerald-500/80 bg-emerald-500/5 scale-[1.01]" : ""}
          ${isWrongOrTimeout ? "border-red-500/50" : ""}
          ${verdict === "idle" ? "border-border bg-card" : ""}
        `}
      >
        {/* Timer bar */}
        <div className="h-1.5 w-full bg-muted relative overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${timerColor}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* Type badge */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-2">
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-muted/40 text-muted-foreground border-border font-medium">
            <TypeIcon type={scenario.type} className="h-3.5 w-3.5" />
            {typeLabel(scenario.type, isRtl)}
          </span>
          <div className="flex gap-1 ms-auto">
            {securityScenarios.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i < cardIdx ? "bg-primary/60" : i === cardIdx ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6 min-h-[160px] flex items-center justify-center">
          <p
            className={`
              font-mono font-bold text-center leading-relaxed break-all
              ${scenario.type === "url"   ? "text-blue-400 text-base sm:text-lg"   : ""}
              ${scenario.type === "email" ? "text-cyan-400  text-base sm:text-xl"  : ""}
              ${scenario.type !== "url" && scenario.type !== "email"
                ? "text-foreground text-sm sm:text-base font-sans whitespace-pre-line text-start" : ""}
            `}
          >
            {scenario.content}
          </p>
        </div>

        {/* ── Correct flash overlay ── */}
        {isFlashCorrect && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 animate-in fade-in duration-100 pointer-events-none">
            <CheckCircle className="h-20 w-20 text-emerald-400 drop-shadow-lg" />
          </div>
        )}

        {/* ── Wrong / Timeout overlay ── */}
        {isWrongOrTimeout && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-red-950/90 px-6 py-8 animate-in fade-in duration-200">
            <div className="p-3 bg-red-500/20 rounded-2xl">
              <ShieldX className="h-10 w-10 text-red-400" />
            </div>
            <div className="text-center">
              <p className="font-black text-red-400 text-base mb-1">
                {verdict === "timeout"
                  ? (isRtl ? "⏱ انتهى الوقت!" : "⏱ Time's Up!")
                  : (isRtl ? "❌ إجابة خاطئة" : "❌ Wrong Answer")}
              </p>
              <p className="text-xs text-red-300/80 leading-relaxed max-w-sm">
                {scenario.explanation ||
                  (isRtl
                    ? "هذا المحتوى آمن — لا توجد علامات تهديد واضحة."
                    : "This content is safe — no threat indicators found.")}
              </p>
            </div>
            <button
              onClick={advance}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-xl text-sm font-bold transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
              {isRtl ? "متابعة" : "Continue"}
            </button>
          </div>
        )}

        {/* ── Answer buttons ── */}
        {verdict === "idle" && (
          <div className="grid grid-cols-2 gap-3 px-5 pb-5">
            <button
              onClick={() => handleAnswer(false)}
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-95"
            >
              <ShieldCheck className="h-5 w-5" />
              {isRtl ? "آمن 🟢" : "Safe 🟢"}
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-black text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-95"
            >
              <ShieldX className="h-5 w-5" />
              {isRtl ? "خبيث 🔴" : "Malicious 🔴"}
            </button>
          </div>
        )}
      </div>

      {/* Hint bar */}
      {verdict === "idle" && (
        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          {isRtl
            ? "فحص الرابط بدقة — هل النطاق صحيح؟ هل المرسل موثوق؟"
            : "Examine carefully — is the domain correct? Is the sender trusted?"}
        </p>
      )}
    </div>
  );
}
