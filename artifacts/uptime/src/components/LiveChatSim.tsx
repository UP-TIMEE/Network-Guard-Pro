import { useState, useEffect, useRef } from "react";
import {
  ShieldAlert, ShieldCheck, Wifi, WifiOff,
  RefreshCw, Circle, CheckCheck, AlertTriangle,
} from "lucide-react";

// ─── Scenario Data ─────────────────────────────────────────────────────────────
interface Choice {
  text: string;
  type: "correct" | "wrong" | "partial";
  nextId: string;
}

interface ScenarioNode {
  id: string;
  attackerMsg: string;
  choices: Choice[];
}

type Outcome = { type: "breach" | "success"; message: string } | null;

// ── Scenario 1: IT Support OTP ────────────────────────────────────────────────
const IT_NODES: ScenarioNode[] = [
  {
    id: "s1_start",
    attackerMsg:
      "مرحباً، معك أحمد الزهراني من قسم الدعم التقني 🔧\n\nلاحظ نظامنا نشاطاً غير معتاد من عنوان IP جهازك خلال الساعة الماضية. نحتاج لتطبيق تحديث أمني عاجل قبل نهاية الدوام.\n\nالرجاء مشاركتي رمز الـ OTP الذي وصلك للتو على جوالك.",
    choices: [
      {
        text: "حسناً، الرمز هو: 4-9-2-0. هل جهازي آمن الآن؟",
        type: "wrong",
        nextId: "breach",
      },
      {
        text: "أنا مشغول الآن، ممكن نعمل ذلك بعد ساعة؟",
        type: "partial",
        nextId: "s1_pressure",
      },
      {
        text: "عذراً، ما رقم تذكرة الدعم؟ سأتصل بالتحويلة الداخلية لقسم الـ IT للتأكيد أولاً.",
        type: "correct",
        nextId: "success",
      },
    ],
  },
  {
    id: "s1_pressure",
    attackerMsg:
      "أفهم أنك مشغول، لكن هذا تحديث أمني إلزامي من الإدارة العليا ⚠️\n\nإذا لم تزودني بالرمز خلال دقيقتين، سيتم فصل جهازك من الشبكة تلقائياً ولن تتمكن من إكمال عملك اليوم.\n\nالوقت ينفد — ما الرمز؟",
    choices: [
      {
        text: "حسناً، لا تفصله! الرمز: 4-9-2-0",
        type: "wrong",
        nextId: "breach",
      },
      {
        text: "مهما كان الضغط، سأتصل الآن بالرقم الرسمي للـ IT للتأكيد أولاً.",
        type: "correct",
        nextId: "success",
      },
    ],
  },
];

const OUTCOMES: Record<string, Outcome> = {
  breach: {
    type: "breach",
    message:
      "⚠️ لقد تم اختراقك!\n\nقسم الـ IT الحقيقي لا يطلب رمز OTP أبداً عبر المحادثة. هذا الرمز يمنح المهاجم وصولاً كاملاً لحسابك وجهازك.\n\nالقاعدة الذهبية: أي طلب عاجل لبيانات اعتماد = علامة هجوم مؤكدة.",
  },
  success: {
    type: "success",
    message:
      "✅ أحسنت! المهاجم انسحب.\n\nطلبك للتحقق عبر القنوات الرسمية كشف عملية الاحتيال. المهاجمون يعتمدون على الإلحاح والضغط النفسي — التحقق المستقل يُبطل هجومهم دائماً.",
  },
};

// ── Sidebar contacts (decorative + active) ────────────────────────────────────
const CONTACTS = [
  {
    id: "it",
    name: "أحمد الزهراني — IT دعم",
    avatar: "أح",
    avatarColor: "bg-blue-600",
    preview: "لاحظنا نشاطاً غريباً من جهازك...",
    time: "الآن",
    online: true,
    active: true,
  },
  {
    id: "hr",
    name: "سارة — الموارد البشرية",
    avatar: "سا",
    avatarColor: "bg-purple-600",
    preview: "إشعار: تحديث سياسة الإجازات",
    time: "٩:١٥ ص",
    online: false,
    active: false,
  },
  {
    id: "ceo",
    name: "م. خالد — المدير التنفيذي",
    avatar: "خا",
    avatarColor: "bg-emerald-700",
    preview: "قريباً: سيناريو CEO Fraud",
    time: "أمس",
    online: false,
    active: false,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function now() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
        أح
      </div>
      <div className="bg-[#2a2d35] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
        <span className="ms-1 text-[11px] text-slate-400">جاري الكتابة...</span>
      </div>
    </div>
  );
}

function AttackerBubble({ text, ts }: { text: string; ts: string }) {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
        أح
      </div>
      <div className="max-w-[75%]">
        <div className="bg-[#2a2d35] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-100 leading-relaxed whitespace-pre-line">
          {text}
        </div>
        <p className="text-[10px] text-slate-500 mt-1 ms-1">{ts}</p>
      </div>
    </div>
  );
}

function UserBubble({ text, ts }: { text: string; ts: string }) {
  return (
    <div className="flex items-end justify-end gap-2 mb-4">
      <div className="max-w-[75%]">
        <div className="bg-primary/80 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white leading-relaxed">
          {text}
        </div>
        <div className="flex items-center justify-end gap-1 mt-1 me-1">
          <p className="text-[10px] text-slate-500">{ts}</p>
          <CheckCheck className="h-3 w-3 text-sky-400" />
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
        أنت
      </div>
    </div>
  );
}

function OutcomeBanner({
  outcome,
  onRestart,
}: {
  outcome: Outcome;
  onRestart: () => void;
}) {
  if (!outcome) return null;
  const isBreath = outcome.type === "breach";
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-4 my-4 ${
        isBreath
          ? "bg-rose-950/60 border-rose-500/40"
          : "bg-emerald-950/60 border-emerald-500/40"
      }`}
    >
      <div className="flex items-start gap-3">
        {isBreath ? (
          <ShieldAlert className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <p
          className={`text-sm leading-relaxed whitespace-pre-line font-medium ${
            isBreath ? "text-rose-200" : "text-emerald-200"
          }`}
        >
          {outcome.message}
        </p>
      </div>
      <button
        onClick={onRestart}
        className={`self-start flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
          isBreath
            ? "bg-rose-500 hover:bg-rose-400 text-white"
            : "bg-emerald-500 hover:bg-emerald-400 text-white"
        }`}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        أعد المحاولة
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface ChatMessage {
  id: number;
  role: "attacker" | "user";
  text: string;
  ts: string;
}

export default function LiveChatSim() {
  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [nodeId,      setNodeId]      = useState<string>("s1_start");
  const [typing,      setTyping]      = useState(false);
  const [outcome,     setOutcome]     = useState<Outcome>(null);
  const [shake,       setShake]       = useState(false);
  const [redFlash,    setRedFlash]    = useState(false);
  const [started,     setStarted]     = useState(false);
  const [choicesLocked, setChoicesLocked] = useState(false);
  const msgCounter = useRef(0);
  const scrollRef  = useRef<HTMLDivElement>(null);

  // ── Auto-scroll ──
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, outcome]);

  // ── Add attacker message after typing delay ──
  function showAttackerMsg(text: string, afterMs = 2000) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      msgCounter.current += 1;
      setMessages(prev => [
        ...prev,
        { id: msgCounter.current, role: "attacker", text, ts: now() },
      ]);
      setChoicesLocked(false);
    }, afterMs);
  }

  // ── Start conversation ──
  function start() {
    setStarted(true);
    const firstNode = IT_NODES.find(n => n.id === "s1_start")!;
    showAttackerMsg(firstNode.attackerMsg, 1500);
  }

  // ── Handle user choice ──
  function choose(choice: Choice) {
    if (choicesLocked || outcome) return;
    setChoicesLocked(true);

    // Add user bubble
    msgCounter.current += 1;
    const userMsg: ChatMessage = {
      id: msgCounter.current,
      role: "user",
      text: choice.text,
      ts: now(),
    };
    setMessages(prev => [...prev, userMsg]);

    if (choice.nextId === "breach") {
      // Screen shake + red flash
      setShake(true);
      setRedFlash(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setRedFlash(false), 800);
      setTimeout(() => setOutcome(OUTCOMES["breach"]), 900);
    } else if (choice.nextId === "success") {
      setTimeout(() => setOutcome(OUTCOMES["success"]), 600);
    } else {
      // Partial — find next node and show attacker reply
      const nextNode = IT_NODES.find(n => n.id === choice.nextId);
      if (nextNode) {
        showAttackerMsg(nextNode.attackerMsg, 2200);
        setNodeId(nextNode.id);
      }
    }
  }

  // ── Restart ──
  function restart() {
    setMessages([]);
    setNodeId("s1_start");
    setTyping(false);
    setOutcome(null);
    setShake(false);
    setRedFlash(false);
    setChoicesLocked(false);
    setStarted(false);
  }

  const currentNode = IT_NODES.find(n => n.id === nodeId);
  const showChoices  = !typing && !outcome && currentNode && messages.some(m => m.role === "attacker") && !choicesLocked;

  // ─── INTRO ───
  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">محاكي المحادثة المباشرة</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
            محادثة تفاعلية حية تحاكي هجوم <span className="text-white font-semibold">Spear Phishing</span> عبر نظام الشات الداخلي للشركة. كل رد تختاره يغير مسار المحادثة — هل ستكتشف المهاجم في الوقت المناسب؟
          </p>
        </div>
        <div className="w-full max-w-sm grid gap-2 text-start">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1e2029] border border-white/10 rounded-xl text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">انتبه للضغط النفسي والإلحاح الزائف</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1e2029] border border-white/10 rounded-xl text-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">التحقق عبر القنوات الرسمية هو دائماً الخيار الصحيح</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1e2029] border border-white/10 rounded-xl text-sm">
            <Wifi className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-slate-300">سيناريو: دعم تقني IT مزيف يطلب رمز OTP</span>
          </div>
        </div>
        <button
          onClick={start}
          className="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-blue-900/40"
        >
          <ShieldAlert className="h-4 w-4" />
          ابدأ المحادثة
        </button>
      </div>
    );
  }

  // ─── CHAT UI ───
  return (
    <div
      dir="rtl"
      className={`relative flex h-[580px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#1a1c23] text-sm
        ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
      style={{ direction: "rtl" }}
    >
      {/* Red breach flash overlay */}
      {redFlash && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-rose-600/25 border-4 border-rose-500/60 rounded-2xl transition-opacity" />
      )}

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-l border-white/8 bg-[#16181f]">
        {/* Workspace header */}
        <div className="px-4 py-3.5 border-b border-white/8 flex items-center justify-between">
          <div>
            <p className="font-black text-white text-sm leading-tight">UPTIME Corp</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Circle className="h-2 w-2 fill-emerald-400" /> متصل
            </p>
          </div>
          <div className="w-7 h-7 rounded-full bg-primary/80 flex items-center justify-center text-white text-[10px] font-bold">
            أنت
          </div>
        </div>

        {/* Section label */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">المحادثات المباشرة</p>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto">
          {CONTACTS.map(c => (
            <div
              key={c.id}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                c.active ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-8 h-8 rounded-full ${c.avatarColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                  {c.avatar}
                </div>
                {c.online && (
                  <span className="absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#16181f]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${c.active ? "text-white" : "text-slate-300"}`}>{c.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{c.preview}</p>
              </div>
              <p className="text-[10px] text-slate-600 shrink-0">{c.time}</p>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div className="px-4 py-3 border-t border-white/8 flex items-center gap-2">
          <WifiOff className="h-3.5 w-3.5 text-amber-400" />
          <p className="text-[10px] text-amber-400 font-medium">وضع المحاكاة — بيانات اختبارية</p>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-5 py-3 border-b border-white/8 flex items-center gap-3 bg-[#1e2029]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              أح
            </div>
            <span className="absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1e2029]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">أحمد الزهراني</p>
            <p className="text-[10px] text-slate-400">دعم تقني — IT Support</p>
          </div>
          <div className="ms-auto flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] text-amber-400 font-semibold">محادثة مشبوهة</span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col"
        >
          {/* System message */}
          <div className="text-center mb-5">
            <span className="text-[10px] text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              بدأت المحادثة — اليوم
            </span>
          </div>

          {messages.map(m =>
            m.role === "attacker" ? (
              <AttackerBubble key={m.id} text={m.text} ts={m.ts} />
            ) : (
              <UserBubble key={m.id} text={m.text} ts={m.ts} />
            )
          )}

          {typing && <TypingIndicator />}

          {outcome && <OutcomeBanner outcome={outcome} onRestart={restart} />}
        </div>

        {/* Choice buttons */}
        {showChoices && currentNode && (
          <div className="border-t border-white/8 bg-[#1e2029] px-4 py-3 flex flex-col gap-2">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">اختر ردك:</p>
            {currentNode.choices.map((c, i) => {
              const color =
                c.type === "correct"
                  ? "border-emerald-600/40 hover:bg-emerald-500/10 hover:border-emerald-500/60 text-slate-200"
                  : c.type === "partial"
                  ? "border-amber-600/30 hover:bg-amber-500/10 hover:border-amber-500/50 text-slate-200"
                  : "border-rose-600/30 hover:bg-rose-500/10 hover:border-rose-500/50 text-slate-200";
              return (
                <button
                  key={i}
                  onClick={() => choose(c)}
                  className={`w-full text-start px-4 py-2.5 rounded-xl border transition-all text-xs leading-relaxed ${color}`}
                >
                  <span className="font-bold text-slate-400 me-2">{["أ", "ب", "ج"][i]}.</span>
                  {c.text}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Shake keyframes injected via style tag */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          10%,50%  { transform: translateX(-6px); }
          20%,60%  { transform: translateX(6px); }
          30%,70%  { transform: translateX(-5px); }
          40%,80%  { transform: translateX(5px); }
          90%      { transform: translateX(-3px); }
        }
        .animate-\\[shake_0\\.5s_ease-in-out\\] {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
