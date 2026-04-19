import { useState, useEffect, useRef } from "react";
import {
  Mail, MessageSquare, Smartphone, Flag, ShieldAlert, CheckCircle2,
  Inbox, Star, Trash2, Send, ChevronRight, AlertTriangle, Lock,
  RotateCcw, Battery, Signal, Wifi
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab   = "email" | "chat" | "sms";
type Phase = "idle" | "glitch" | "breach" | "success";

// ─── Glitch overlay ───────────────────────────────────────────────────────────
function GlitchOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-50 rounded-xl overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-rose-600/80 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-white font-black text-3xl tracking-widest opacity-90 select-none"
          style={{ textShadow: "0 0 20px #ff0000, 2px 2px 0 #000" }}
        >
          ⚠ BREACH ⚠
        </span>
      </div>
    </div>
  );
}

// ─── Breach screen ────────────────────────────────────────────────────────────
function BreachScreen({ title, body, onRetry }: { title: string; body: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center" dir="rtl">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
        <ShieldAlert className="h-8 w-8 text-rose-400" />
      </div>
      <div>
        <p className="text-rose-400 font-black text-lg mb-1">{title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">{body}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold hover:border-rose-400/40 transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
        حاول مجدداً
      </button>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ title, body, onNext }: { title: string; body: string; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center" dir="rtl">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      </div>
      <div>
        <p className="text-emerald-400 font-black text-lg mb-1">{title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">{body}</p>
      </div>
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-colors"
      >
        المحاكي التالي
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR 1 — Phishing Email
// ─────────────────────────────────────────────────────────────────────────────
function EmailSimulator({ onResult }: { onResult: (r: "correct" | "wrong") => void }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card text-sm" dir="rtl">

      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 border-b border-border">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <span className="flex-1 text-center text-xs text-muted-foreground font-mono">Outlook — صندوق الوارد</span>
      </div>

      <div className="flex h-[420px]">
        {/* Sidebar */}
        <div className="w-44 shrink-0 border-l border-border bg-muted/20 flex flex-col gap-0.5 p-2">
          {[
            { icon: Inbox,  label: "الوارد",   count: "3", active: true },
            { icon: Send,   label: "المُرسَل",  count: "",  active: false },
            { icon: Star,   label: "المميَّز",  count: "",  active: false },
            { icon: Trash2, label: "المحذوف",  count: "",  active: false },
          ].map(({ icon: Icon, label, count, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-default select-none ${active ? "bg-sky-500/15 text-sky-300" : "text-muted-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-xs font-medium">{label}</span>
              {count && <span className="text-[10px] bg-sky-500/20 text-sky-300 rounded-full px-1.5 py-0.5 font-bold">{count}</span>}
            </div>
          ))}

          <div className="mt-3 px-2 text-[10px] text-muted-foreground/60 uppercase tracking-widest">الرسائل</div>
          {[
            { from: "الموارد البشرية", subj: "⚠ عاجل: تحديث", unread: true },
            { from: "أحمد العمري",     subj: "اجتماع الأسبوع", unread: false },
            { from: "نظام الشركة",     subj: "تقرير شهر مارس", unread: false },
          ].map((m, i) => (
            <div
              key={i}
              className={`px-2.5 py-2 rounded-lg cursor-default select-none ${i === 0 ? "bg-sky-500/10 border border-sky-500/25" : ""}`}
            >
              <p className={`text-[11px] truncate ${m.unread ? "font-bold text-foreground" : "text-muted-foreground"}`}>{m.from}</p>
              <p className="text-[10px] text-muted-foreground truncate">{m.subj}</p>
            </div>
          ))}
        </div>

        {/* Email body */}
        <div className="flex-1 overflow-y-auto flex flex-col">

          {/* Email header */}
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-foreground mb-3">⚠ عاجل: يجب تحديث بيانات الراتب خلال ٢٤ ساعة</h2>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-right">المُرسِل:</span>
                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-rose-300">
                  hr-noreply@company-updates-hr.net
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-right">إلى:</span>
                <span>موظف عزيز</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-right">التاريخ:</span>
                <span>اليوم — ٩:٠٢ ص</span>
              </div>
            </div>
          </div>

          {/* Email content */}
          <div className="flex-1 p-4 text-foreground/80 leading-relaxed text-sm space-y-3">
            <p>عزيزي الموظف،</p>
            <p>
              بسبب الترقية إلى نظام الرواتب الجديد،{" "}
              <strong className="text-amber-300">يجب عليك تحديث بياناتك البنكية فوراً</strong>{" "}
              لضمان استلام راتب شهر أبريل في موعده. فريق الموارد البشرية لن يكون مسؤولاً عن أي تأخير في حال عدم التحديث.
            </p>
            <p className="text-rose-300/70 text-xs">المهلة: ٢٤ ساعة من الآن</p>

            {/* Phishing button */}
            <div className="py-2">
              <button
                onClick={() => onResult("wrong")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-sky-600/25"
              >
                <Lock className="h-4 w-4" />
                تحديث البيانات الآن
              </button>
            </div>

            <p className="text-muted-foreground text-xs">
              الرابط:{" "}
              <span
                className="font-mono text-rose-300 underline cursor-pointer"
                onClick={() => onResult("wrong")}
              >
                http://company-updates-hr.net/payroll-update?token=xK9pL2
              </span>
            </p>
            <p className="text-xs text-muted-foreground border-t border-border pt-3 mt-3">
              مع أطيب التحيات،<br />
              <strong>فريق الموارد البشرية</strong> — شركتك للتطوير
            </p>
          </div>

          {/* Action bar */}
          <div className="p-3 border-t border-border bg-muted/20 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onResult("correct")}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 font-bold rounded-lg text-xs transition-colors"
            >
              <Flag className="h-3.5 w-3.5" />
              إبلاغ عن تصيد 🚩
            </button>
            <span className="text-[10px] text-muted-foreground">ما هو الإجراء الصحيح؟</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR 2 — CEO Fraud / Live Chat (OTP Scam)
// ─────────────────────────────────────────────────────────────────────────────
type ChatMsg = { from: "them" | "me"; text: string };

const CHAT_SCRIPT = [
  "مرحباً، أنا خالد — مدير قسم الـ IT. كيف حالك؟",
  "ممتاز. لدينا تحديث أمني عاجل على نظامك يجب تفعيله الآن.",
  "سيصلك كود OTP على هاتفك. أرسله لي هنا فوراً حتى أُكمل العملية من طرفنا.",
];

function ChatSimulator({ onResult }: { onResult: (r: "correct" | "wrong") => void }) {
  const [msgs,   setMsgs]   = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [stage,  setStage]  = useState(0);
  const [chosen, setChosen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage >= CHAT_SCRIPT.length) return;
    setTyping(true);
    const delay = stage === 0 ? 800 : 1600;
    const t = setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { from: "them", text: CHAT_SCRIPT[stage] }]);
      setStage(s => s + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  function handleChoice(r: "correct" | "wrong") {
    if (chosen) return;
    setChosen(true);
    const replyText = r === "correct"
      ? "لا أستطيع إرسال الكود بدون تذكرة رسمية. يرجى فتح طلب دعم رسمي."
      : "حسناً، الكود هو: 847291";
    setMsgs(m => [...m, { from: "me", text: replyText }]);
    setTimeout(() => onResult(r), 900);
  }

  const showButtons = stage >= CHAT_SCRIPT.length && !typing && !chosen;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card text-sm" dir="rtl">

      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 border-b border-border">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <span className="flex-1 text-center text-xs text-muted-foreground font-mono">Microsoft Teams</span>
      </div>

      <div className="flex h-[420px]">
        {/* Sidebar */}
        <div className="w-44 shrink-0 border-l border-border bg-muted/20 flex flex-col p-2 gap-1">
          <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest px-2 mb-1">المحادثات</div>
          {[
            { name: "خالد — IT Support", active: true,  unread: true },
            { name: "مجموعة المشاريع",  active: false, unread: false },
            { name: "سارة — HR",         active: false, unread: false },
          ].map((c, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-default select-none ${c.active ? "bg-violet-500/15 border border-violet-500/25" : ""}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${c.active ? "bg-violet-500/30 text-violet-300" : "bg-muted/50 text-muted-foreground"}`}>
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] truncate ${c.unread ? "font-bold text-foreground" : "text-muted-foreground"}`}>{c.name}</p>
                {c.unread && <p className="text-[10px] text-violet-300">رسالة جديدة</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">

          {/* Chat header */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border bg-muted/10">
            <div className="w-8 h-8 rounded-full bg-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-sm">خ</div>
            <div>
              <p className="text-sm font-bold text-foreground">خالد — IT Support</p>
              <p className="text-[10px] text-emerald-400">● متصل الآن</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  m.from === "them"
                    ? "bg-muted/60 text-foreground rounded-tl-sm"
                    : "bg-sky-600 text-white rounded-tr-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-end">
                <div className="bg-muted/60 px-3 py-2 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Reply options — shown after all messages arrive */}
          {showButtons && (
            <div className="p-3 border-t border-border bg-muted/10 flex flex-col gap-2">
              <p className="text-[10px] text-muted-foreground text-center">اختر ردك:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleChoice("wrong")}
                  className="flex-1 py-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  إرسال الكود الآن
                </button>
                <button
                  onClick={() => handleChoice("correct")}
                  className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  طلب تذكرة رسمية
                </button>
              </div>
            </div>
          )}
          {!showButtons && (
            <div className="p-3 border-t border-border bg-muted/10">
              <div className="w-full h-7 bg-muted/30 rounded-lg flex items-center px-3 text-xs text-muted-foreground/50 cursor-default select-none">
                اكتب رسالتك...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR 3 — Smishing (SMS)
// ─────────────────────────────────────────────────────────────────────────────
function SmsSimulator({ onResult }: { onResult: (r: "correct" | "wrong") => void }) {
  const now = new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex justify-center py-4">
      {/* Phone frame */}
      <div className="relative w-64 rounded-[2.5rem] border-[6px] border-foreground/20 bg-[#111] overflow-hidden shadow-2xl shadow-black/50">

        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-2 bg-[#111]">
          <span className="text-white text-[10px] font-bold">{now}</span>
          <div className="flex items-center gap-1">
            <Signal  className="h-3 w-3 text-white" />
            <Wifi    className="h-3 w-3 text-white" />
            <Battery className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* App bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1c1c1e] border-b border-white/10">
          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
            <MessageSquare className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-white text-[11px] font-bold">ARAMEX-SA</p>
            <p className="text-white/40 text-[9px]">رسائل نصية</p>
          </div>
        </div>

        {/* SMS messages */}
        <div className="bg-[#111] px-3 py-3 min-h-[280px] flex flex-col gap-3">

          {/* Incoming message 1 */}
          <div className="flex flex-col items-end gap-0.5">
            <div className="max-w-[90%] bg-[#2c2c2e] px-3 py-2 rounded-2xl rounded-tr-sm">
              <p className="text-white text-[11px] leading-relaxed" dir="rtl">
                مرحباً، طردك في انتظار التوصيل. يرجى دفع رسوم التخليص ١٥ ريال لاستكمال التسليم خلال ٢٤ ساعة.
              </p>
            </div>
            <p className="text-white/30 text-[9px] px-1">{now}</p>
          </div>

          {/* Incoming message 2 (link) */}
          <div className="flex flex-col items-end gap-0.5">
            <div className="max-w-[90%] bg-[#2c2c2e] px-3 py-2 rounded-2xl rounded-tr-sm">
              <p className="text-[11px] leading-relaxed font-mono text-sky-400 underline" dir="ltr">
                http://aramex-sa-pay.tk/pay?id=88291
              </p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Warning badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl" dir="rtl">
            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-[10px]">رقم غير محفوظ · رابط مشبوه</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-[#1c1c1e] border-t border-white/10 p-3 flex gap-2">
          <button
            onClick={() => onResult("wrong")}
            className="flex-1 py-2 bg-blue-500/80 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl transition-colors"
          >
            فتح الرابط
          </button>
          <button
            onClick={() => onResult("correct")}
            className="flex-1 py-2 bg-rose-500/80 hover:bg-rose-500 text-white text-[11px] font-bold rounded-xl transition-colors"
          >
            حظر الرقم 🚫
          </button>
        </div>

        {/* Home bar */}
        <div className="bg-[#111] flex justify-center py-2">
          <div className="w-20 h-1 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREACH / SUCCESS DATA
// ─────────────────────────────────────────────────────────────────────────────
const BREACH_DATA: Record<Tab, { title: string; body: string }> = {
  email: {
    title: "وقعت في فخ التصيد الإلكتروني!",
    body:  "الرابط كان مزيفاً. المهاجمون سرقوا بياناتك البنكية. العلامات الدالة: نطاق غريب (company-updates-hr.net)، لغة عاجلة، طلب بيانات حساسة عبر رابط خارجي.",
  },
  chat: {
    title: "تمت سرقة كود OTP الخاص بك!",
    body:  "المهاجم كان ينتحل صفة موظف IT. إرسال كود OTP عبر المحادثة يُمكّن المهاجم من الدخول لحسابك مباشرةً. الإجراء الصحيح: دائماً اطلب تذكرة دعم رسمية.",
  },
  sms: {
    title: "وقعت في فخ الـ Smishing!",
    body:  "الرابط المنتهي بـ .tk وطلب دفع مبالغ غير رسمية هي علامات واضحة. شركات الشحن الحقيقية لا تطلب الدفع عبر روابط SMS مجهولة المصدر.",
  },
};

const SUCCESS_DATA: Record<Tab, { title: string; body: string }> = {
  email: {
    title: "ممتاز! أنقذت بياناتك 🛡️",
    body:  "الإبلاغ عن رسائل التصيد هو الإجراء الصحيح. انتبه دائماً لنطاق المُرسِل، واللغة العاجلة، وأي روابط تطلب معلومات حساسة.",
  },
  chat: {
    title: "قرار صائب! حمايتك من الاختراق 🔐",
    body:  "طلب التذكرة الرسمية يُنشئ مساراً موثقاً ويمنع الاحتيال. لا تُرسل بيانات حساسة عبر المحادثات المباشرة مهما بدا الطلب عاجلاً.",
  },
  sms: {
    title: "سلامة عقلك 💯 — رقم محظور!",
    body:  "حظر الأرقام المشبوهة والإبلاغ عنها يحمي الآخرين أيضاً. تذكر: لا تفتح روابط من أرقام مجهولة تطلب معلومات مالية.",
  },
};

const TAB_ORDER: Tab[] = ["email", "chat", "sms"];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SocialEngineeringLab() {
  const [activeTab,  setActiveTab]  = useState<Tab>("email");
  const [phase,      setPhase]      = useState<Phase>("idle");
  const [chatKey,    setChatKey]    = useState(0);

  function handleResult(r: "correct" | "wrong") {
    setPhase(r === "wrong" ? "glitch" : "success");
  }

  function handleRetry() {
    if (activeTab === "chat") setChatKey(k => k + 1);
    setPhase("idle");
  }

  function handleNext() {
    const next = TAB_ORDER[(TAB_ORDER.indexOf(activeTab) + 1) % TAB_ORDER.length];
    if (next === "chat") setChatKey(k => k + 1);
    setActiveTab(next);
    setPhase("idle");
  }

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    if (tab === "chat") setChatKey(k => k + 1);
    setPhase("idle");
  }

  const tabMeta: Record<Tab, { label: string; icon: typeof Mail }> = {
    email: { label: "محاكي الإيميل", icon: Mail },
    chat:  { label: "محاكي الشات",  icon: MessageSquare },
    sms:   { label: "محاكي الجوال", icon: Smartphone },
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-black text-foreground mb-1">محاكي الهندسة الاجتماعية</h2>
        <p className="text-muted-foreground text-sm">
          ثلاثة سيناريوهات واقعية — هل ستكتشف الهجوم قبل فوات الأوان؟
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {TAB_ORDER.map(tab => {
          const { label, icon: Icon } = tabMeta[tab];
          return (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                activeTab === tab
                  ? "bg-sky-500/15 border-sky-500/40 text-sky-300"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Simulator area */}
      <div className="relative">

        {/* Glitch overlay (stays on top of simulator until onDone) */}
        {phase === "glitch" && (
          <GlitchOverlay onDone={() => setPhase("breach")} />
        )}

        {/* Result screens */}
        {phase === "breach" && (
          <BreachScreen
            title={BREACH_DATA[activeTab].title}
            body={BREACH_DATA[activeTab].body}
            onRetry={handleRetry}
          />
        )}
        {phase === "success" && (
          <SuccessScreen
            title={SUCCESS_DATA[activeTab].title}
            body={SUCCESS_DATA[activeTab].body}
            onNext={handleNext}
          />
        )}

        {/* Simulators (hidden under glitch, shown in idle) */}
        {(phase === "idle" || phase === "glitch") && (
          <>
            {activeTab === "email" && <EmailSimulator onResult={handleResult} />}
            {activeTab === "chat"  && <ChatSimulator  key={chatKey} onResult={handleResult} />}
            {activeTab === "sms"   && <SmsSimulator   onResult={handleResult} />}
          </>
        )}
      </div>
    </div>
  );
}
