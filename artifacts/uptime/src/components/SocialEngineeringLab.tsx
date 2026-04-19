import { useState, useEffect, useRef } from "react";
import {
  Mail, MessageSquare, Smartphone, Flag, ShieldAlert, CheckCircle2,
  Inbox, Star, Trash2, Send, AlertTriangle, Lock, Phone, PhoneOff,
  Monitor, Usb, Globe, X, ChevronRight, RotateCcw,
  Battery, Signal, Wifi, WifiOff, Cloud, Briefcase, DoorOpen,
  Gift, UserCheck, FileText, ShieldCheck, UserX
} from "lucide-react";

// ─── Scenario data ─────────────────────────────────────────────────────────────
interface Scenario {
  id:          number;
  type:        "email" | "sms" | "vishing" | "baiting" | "scareware" | "ceofraud" | "eviltwin" | "cloudspoofing" | "linkedinphish" | "tailgating";
  attackName:  string;
  correctBtn:  string;   // green choice label
  wrongBtn:    string;   // red choice label
  correctExp:  string;   // shown in modal when correct
  wrongExp:    string;   // shown in modal when wrong
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    type: "email",
    attackName: "التصيد الإلكتروني (Phishing)",
    correctBtn: "تجاهل وإبلاغ 🚩",
    wrongBtn:   "الضغط على الرابط",
    correctExp: "قرار ممتاز! لاحظت الخدعة البصرية — البريد hr@uptirne.com يستخدم حرفَي (rn) ليشبه حرف (m) في كلمة uptime. هذا ما يُسمى Homoglyph Attack.",
    wrongExp:   "وقعت في الفخ! البريد hr@uptirne.com مزيف — (rn) وليس (m). دائماً تحقق من كل حرف في نطاق المُرسِل قبل النقر على أي رابط.",
  },
  {
    id: 2,
    type: "sms",
    attackName: "التصيد النصي (Smishing)",
    correctBtn: "حظر الرقم 🚫",
    wrongBtn:   "دفع الرسوم",
    correctExp: "صحيح! شركات الشحن الرسمية لا تطلب دفعات عبر روابط SMS. الرابط المنتهي بـ .tk وعدم حفظ الرقم علامات كافية للتنبّه.",
    wrongExp:   "هذا موقع تصيد! بمجرد إدخال بياناتك البنكية لدفع الـ 15 ريال سُرقت جميع معلوماتك المالية.",
  },
  {
    id: 3,
    type: "vishing",
    attackName: "التصيد الصوتي (Vishing)",
    correctBtn: "إنهاء المكالمة فوراً",
    wrongBtn:   "إعطاء الباسوورد",
    correctExp: "تصرف احترافي! لا توجد جهة دعم تقني شرعية تطلب كلمة المرور عبر الهاتف أبداً. إنهاء المكالمة والإبلاغ هو الإجراء الصحيح.",
    wrongExp:   "المهاجم حصل على كلمة مرورك! كان يُقنعك بالتحدث بسرعة لتقليل تفكيرك. الدعم التقني الحقيقي لا يطلب كلمات المرور أبداً.",
  },
  {
    id: 4,
    type: "baiting",
    attackName: "الطعم (Baiting)",
    correctBtn: "فصل USB وتسليمه للأمن",
    wrongBtn:   "فتح الملفات لمعرفة صاحبه",
    correctExp: "قرار حكيم! وصلات USB المجهولة قد تحتوي على برمجيات خبيثة تُشغَّل تلقائياً بمجرد التوصيل. فريق الأمن هو المختص بالتعامل معها.",
    wrongExp:   "فتحت الملفات وأصبح جهازك مصاباً! هذا ما يُسمى بالـ Baiting. المهاجمون يتركون USB مُبرمجة في أماكن عامة عمداً لإغراء الضحايا.",
  },
  {
    id: 5,
    type: "scareware",
    attackName: "برمجيات التخويف (Scareware)",
    correctBtn: "إغلاق النافذة فوراً",
    wrongBtn:   "الضغط للفحص",
    correctExp: "ممتاز! النوافذ المنبثقة التي تدّعي اكتشاف فيروسات هي نفسها البرمجية الخبيثة. أغلق المتصفح كاملاً إن لزم الأمر.",
    wrongExp:   "الضغط على 'فحص' حمّل برنامجاً خبيثاً! هذه النوافذ مصممة لإثارة الذعر لدفعك للتصرف دون تفكير. المتصفح الحقيقي لا يُظهر تنبيهات بهذا الشكل.",
  },
  {
    id: 6,
    type: "ceofraud",
    attackName: "احتيال الرؤساء (CEO Fraud)",
    correctBtn: "الاتصال بالمدير للتأكد",
    wrongBtn:   "شراء البطاقات وإرسالها",
    correctExp: "قرار سليم! الاتصال الصوتي المباشر بالمدير هو الإجراء الوحيد الصحيح عند الطلبات المالية عبر الرسائل. المحتال يعتمد على الإلحاح والثقة لمنعك من التحقق.",
    wrongExp:   "لقد وقعت في الفخ! المخترقون يفضلون طلب بطاقات الهدايا لأن الأموال تصبح غير قابلة للتتبع أو الاسترجاع بمجرد إرسال الكود، عكس الحوالات البنكية. لا تنفذ طلبات مالية غير معتادة عبر الرسائل النصية دون تحقق صوتي.",
  },
  {
    id: 7,
    type: "eviltwin",
    attackName: "الواي فاي الوهمي (Evil Twin)",
    correctBtn: "الاتصال بالشبكة الآمنة",
    wrongBtn:   "الاتصال بالشبكة السريعة",
    correctExp: "تصرف ذكي! الشبكة المفتوحة بدون كلمة مرور في بيئة الشركة علامة خطر واضحة. المهاجم يُحاكي اسم الشبكة الرسمية لاعتراض بياناتك.",
    wrongExp:   "اتصلت بشبكة Evil Twin! المهاجم الآن يراقب كل اتصالاتك ويعترض بياناتك بأسلوب Man-in-the-Middle. الشبكات المفتوحة في الشركات تستوجب الريبة دائماً.",
  },
  {
    id: 8,
    type: "cloudspoofing",
    attackName: "التصيد السحابي (Cloud Spoofing)",
    correctBtn: "التأكد من المرسل داخلياً",
    wrongBtn:   "الضغط لتسجيل الدخول",
    correctExp: "احتراس ممتاز! إشعارات المشاركة المزيفة تُحاكي Google Drive أو OneDrive بدقة. التحقق من المرسل عبر قناة رسمية يكشف الاحتيال فوراً.",
    wrongExp:   "سُرقت بيانات حسابك! صفحة تسجيل الدخول كانت مزيفة. هذا النوع من الهجمات يستهدف الموظفين الذين يتلقون ملفات كثيرة ويضغطون دون تمحيص.",
  },
  {
    id: 9,
    type: "linkedinphish",
    attackName: "تصيد التوظيف (LinkedIn Phishing)",
    correctBtn: "تجاهل وإبلاغ",
    wrongBtn:   "الضغط لتحميل العقد",
    correctExp: "قرار صحيح! الروابط المختصرة مثل bit.ly تُخفي الوجهة الحقيقية. المسمى الوظيفي الرائع والراتب الخيالي أدوات إغراء كلاسيكية في هجمات التوظيف المزيف.",
    wrongExp:   "حمّلت ملفاً ضاراً! الرابط المختصر أعاد توجيهك لموقع مزيف نزّل برنامج تجسس. عروض العمل المبالغ فيها عبر رسائل مباشرة تستوجب التحقق المزدوج دائماً.",
  },
  {
    id: 10,
    type: "tailgating",
    attackName: "الاختراق الفيزيائي (Tailgating)",
    correctBtn: "الاعتذار والطلب منه استخدام بطاقته",
    wrongBtn:   "إبقاء الباب مفتوحاً مساعدةً",
    correctExp: "تصرف احترافي! كل شخص يدخل منطقة آمنة يجب أن يُثبت هويته ببطاقته الخاصة. المساعدة الاجتماعية شعور طبيعي، لكن المهاجمين يستغلون اللطف الإنساني تحديداً.",
    wrongExp:   "سمحت لشخص غير مصرح له بالدخول! Tailgating هو استغلال اللطف الاجتماعي لاختراق المناطق المحظورة. يمكن لهذا الشخص سرقة معدات أو وثائق سرية.",
  },
];

const TOTAL_PTS = 10; // per round (10 × 10 = 100 total)

// ─── Result modal ──────────────────────────────────────────────────────────────
interface ModalProps {
  correct:    boolean;
  attackName: string;
  explanation:string;
  isLast:     boolean;
  onNext:     () => void;
}
function ResultModal({ correct, attackName, explanation, isLast, onNext }: ModalProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 flex flex-col gap-4" dir="rtl">
        {/* Icon + status */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${correct ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-rose-500/15 border border-rose-500/30"}`}>
            {correct
              ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              : <ShieldAlert  className="h-5 w-5 text-rose-400" />
            }
          </div>
          <div>
            <p className={`font-black text-sm ${correct ? "text-emerald-400" : "text-rose-400"}`}>
              {correct ? `إجابة صحيحة! +${TOTAL_PTS} نقطة` : "إجابة خاطئة — 0 نقطة"}
            </p>
            <p className="text-[11px] text-muted-foreground">{attackName}</p>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-sm text-foreground/80 leading-relaxed border-t border-border pt-3">
          {explanation}
        </p>

        {/* Next button */}
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-foreground text-background font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          {isLast ? "عرض النتيجة النهائية" : "السيناريو التالي"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total, score }: { current: number; total: number; score: number }) {
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <div className="flex gap-1.5 flex-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < current   ? "bg-emerald-500" :
              i === current ? "bg-sky-400"     :
                              "bg-muted/40"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-mono text-muted-foreground shrink-0">
        {current + 1}/{total} — <span className="text-foreground font-bold">{score}</span> نقطة
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 1 — Phishing Email
// ═══════════════════════════════════════════════════════════════════════════════
function EmailSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card" dir="rtl">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 border-b border-border">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/60"/>
          <span className="w-3 h-3 rounded-full bg-amber-500/60"/>
          <span className="w-3 h-3 rounded-full bg-emerald-500/60"/>
        </div>
        <span className="flex-1 text-center text-xs text-muted-foreground font-mono">Outlook — صندوق الوارد</span>
      </div>
      <div className="flex h-[380px]">
        {/* Sidebar */}
        <div className="w-36 shrink-0 border-l border-border bg-muted/20 flex flex-col gap-0.5 p-2">
          {[{icon: Inbox, label:"الوارد", count:"3", active:true},
            {icon: Send,  label:"المُرسَل", count:"", active:false},
            {icon: Star,  label:"المميَّز", count:"", active:false},
            {icon: Trash2,label:"المحذوف", count:"", active:false}
          ].map(({icon: Icon, label, count, active}) => (
            <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-default select-none text-xs ${active?"bg-sky-500/15 text-sky-300":"text-muted-foreground"}`}>
              <Icon className="h-3.5 w-3.5 shrink-0"/>
              <span className="flex-1">{label}</span>
              {count && <span className="text-[10px] bg-sky-500/20 text-sky-300 rounded-full px-1.5 font-bold">{count}</span>}
            </div>
          ))}
          <div className="mt-2 space-y-0.5">
            {[{from:"الموارد البشرية",subj:"⚠ عاجل: تحديث",hi:true},
              {from:"أحمد العمري",    subj:"اجتماع الأسبوع",hi:false},
              {from:"نظام الشركة",   subj:"تقرير مارس",hi:false}
            ].map((m,i) => (
              <div key={i} className={`px-2 py-1.5 rounded-lg cursor-default ${i===0?"bg-sky-500/10 border border-sky-500/20":""}`}>
                <p className={`text-[11px] truncate ${m.hi?"font-bold text-foreground":"text-muted-foreground"}`}>{m.from}</p>
                <p className="text-[10px] text-muted-foreground/70 truncate">{m.subj}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border">
            <p className="font-bold text-foreground text-sm mb-2">⚠ عاجل: يجب تحديث بيانات الراتب خلال ٢٤ ساعة</p>
            <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
              <div className="flex gap-2"><span className="w-12 text-right shrink-0">المُرسِل:</span><span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground">hr@uptirne.com</span></div>
              <div className="flex gap-2"><span className="w-12 text-right shrink-0">إلى:</span><span>موظف عزيز</span></div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 text-sm space-y-2 text-foreground/80 leading-relaxed">
            <p>عزيزي الموظف،</p>
            <p>بسبب الترقية لنظام الرواتب الجديد، <strong className="text-amber-300">يجب تحديث بياناتك البنكية فوراً</strong> لضمان استلام راتب أبريل في موعده.</p>
            <p className="text-rose-300/60 text-xs">المهلة: ٢٤ ساعة</p>
            <button onClick={() => onChoice("wrong")} className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors">
              <Lock className="h-3.5 w-3.5"/> تحديث البيانات الآن
            </button>
            <p className="text-[11px] text-muted-foreground">الرابط: <span className="font-mono text-blue-500 hover:underline cursor-pointer" onClick={() => onChoice("wrong")}>http://portal.uptirne.com/payroll-update</span></p>
          </div>
          <div className="p-2.5 border-t border-border bg-muted/20 flex items-center gap-2">
            <button onClick={() => onChoice("correct")} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 font-bold rounded-lg text-xs transition-colors">
              <Flag className="h-3.5 w-3.5"/> تجاهل وإبلاغ 🚩
            </button>
            <span className="text-[10px] text-muted-foreground">أي إجراء تتخذ؟</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 2 — Smishing (SMS)
// ═══════════════════════════════════════════════════════════════════════════════
function SmsSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  const now = new Date().toLocaleTimeString("ar-SA", {hour:"2-digit", minute:"2-digit"});
  return (
    <div className="flex justify-center py-2">
      <div className="w-60 rounded-[2.2rem] border-[5px] border-foreground/15 bg-[#111] overflow-hidden shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-1.5 bg-[#111]">
          <span className="text-white text-[10px] font-bold">{now}</span>
          <div className="flex items-center gap-1"><Signal className="h-3 w-3 text-white"/><Wifi className="h-3 w-3 text-white"/><Battery className="h-3.5 w-3.5 text-white"/></div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1c1c1e] border-b border-white/10">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"><MessageSquare className="h-3 w-3 text-white"/></div>
          <div><p className="text-white text-[11px] font-bold">ARAMEX-SA</p><p className="text-white/40 text-[9px]">رسائل نصية</p></div>
        </div>
        <div className="bg-[#111] px-3 py-3 min-h-[240px] flex flex-col gap-2.5">
          <div className="flex flex-col items-end gap-0.5">
            <div className="max-w-[90%] bg-[#2c2c2e] px-3 py-2 rounded-2xl rounded-tr-sm">
              <p className="text-white text-[11px] leading-relaxed" dir="rtl">طردك موقوف! يرجى دفع رسوم التخليص ١٥ ريال لاستكمال التسليم خلال ٢٤ ساعة.</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <div className="max-w-[90%] bg-[#2c2c2e] px-3 py-2 rounded-2xl rounded-tr-sm">
              <p className="text-[11px] font-mono text-sky-400 underline" dir="ltr">http://aramex-sa-pay.tk/pay?id=88291</p>
            </div>
          </div>
          <div className="flex-1"/>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl" dir="rtl">
            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0"/>
            <p className="text-amber-300 text-[10px]">رقم غير محفوظ · رابط مشبوه</p>
          </div>
        </div>
        <div className="bg-[#1c1c1e] border-t border-white/10 p-2.5 flex gap-2">
          <button onClick={() => onChoice("wrong")} className="flex-1 py-1.5 bg-blue-500/80 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl transition-colors">دفع الرسوم</button>
          <button onClick={() => onChoice("correct")} className="flex-1 py-1.5 bg-rose-500/80 hover:bg-rose-500 text-white text-[11px] font-bold rounded-xl transition-colors">حظر الرقم 🚫</button>
        </div>
        <div className="bg-[#111] flex justify-center py-1.5"><div className="w-16 h-1 rounded-full bg-white/20"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 3 — Vishing (Incoming Call)
// ═══════════════════════════════════════════════════════════════════════════════
function VishingSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex justify-center py-2">
      <div className="w-60 rounded-[2.2rem] border-[5px] border-foreground/15 bg-[#111] overflow-hidden shadow-2xl shadow-black/60">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-1.5 bg-[#111]">
          <span className="text-white text-[10px] font-bold">مكالمة واردة</span>
          <div className="flex items-center gap-1"><Signal className="h-3 w-3 text-white"/><Battery className="h-3.5 w-3.5 text-white"/></div>
        </div>

        {/* Call screen */}
        <div className="bg-gradient-to-b from-[#1a1a2e] to-[#111] px-5 py-8 flex flex-col items-center gap-4 min-h-[300px]">
          {/* Caller avatar (pulsing ring) */}
          <div className="relative flex items-center justify-center">
            <div className={`absolute w-24 h-24 rounded-full border-2 border-amber-400/30 transition-transform duration-1000 ${pulse ? "scale-110 opacity-60" : "scale-100 opacity-30"}`}/>
            <div className={`absolute w-20 h-20 rounded-full border-2 border-amber-400/50 transition-transform duration-700 ${pulse ? "scale-105 opacity-80" : "scale-100 opacity-50"}`}/>
            <div className="w-16 h-16 rounded-full bg-[#2c2c2e] border border-amber-500/40 flex items-center justify-center">
              <Phone className="h-7 w-7 text-amber-400"/>
            </div>
          </div>

          {/* Caller info */}
          <div className="text-center" dir="rtl">
            <p className="text-white font-black text-lg">رقم مجهول</p>
            <p className="text-amber-300 text-xs mt-0.5">+966-XXXXXXXX</p>
            <p className="text-white/40 text-[10px] mt-1">مكالمة واردة...</p>
          </div>

          {/* What the caller says */}
          <div className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5" dir="rtl">
            <p className="text-white/60 text-[10px] mb-1">الجهة المتصلة تقول:</p>
            <p className="text-white text-xs leading-relaxed">
              "معك فريق الدعم الفني — رصدنا نشاطاً مشبوهاً على حسابك. لحماية بياناتك، نحتاج كلمة المرور الحالية للتحقق <strong className='text-amber-300'>فوراً</strong>."
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-[#1c1c1e] border-t border-white/10 p-3 flex justify-around">
          <button onClick={() => onChoice("wrong")} className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-colors">
              <Phone className="h-5 w-5 text-white"/>
            </div>
            <span className="text-white/60 text-[9px]">إعطاء الباسوورد</span>
          </button>
          <button onClick={() => onChoice("correct")} className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center transition-colors">
              <PhoneOff className="h-5 w-5 text-white"/>
            </div>
            <span className="text-white/60 text-[9px]">إنهاء المكالمة</span>
          </button>
        </div>
        <div className="bg-[#111] flex justify-center py-1.5"><div className="w-16 h-1 rounded-full bg-white/20"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 4 — Baiting (USB)
// ═══════════════════════════════════════════════════════════════════════════════
function BaitingSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  return (
    <div className="flex justify-center py-4">
      {/* Desktop screen frame */}
      <div className="w-full max-w-md">
        {/* Desktop area */}
        <div className="rounded-t-xl border border-border bg-gradient-to-br from-slate-900 to-slate-800 p-8 min-h-[300px] relative flex items-start justify-end" dir="rtl">
          {/* Desktop icons (decorative) */}
          <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-40">
            {[Monitor, Globe, Mail].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white/60"/>
                </div>
                <span className="text-white/40 text-[9px]">ملف</span>
              </div>
            ))}
          </div>

          {/* System notification popup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl shadow-2xl overflow-hidden" dir="rtl">
            {/* Notification header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#252525] border-b border-[#3a3a3a]">
              <Usb className="h-4 w-4 text-amber-400"/>
              <span className="text-white text-xs font-semibold flex-1">إشعار النظام</span>
              <X className="h-3.5 w-3.5 text-white/40"/>
            </div>
            {/* Content */}
            <div className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0">
                  <Usb className="h-5 w-5 text-amber-400"/>
                </div>
                <div>
                  <p className="text-white text-xs font-bold mb-0.5">تم توصيل جهاز USB</p>
                  <p className="text-white/60 text-[11px] leading-relaxed">تم اكتشاف جهاز تخزين غير معروف. يحتوي على <strong className="text-amber-300">١٢ ملفاً</strong> بما فيها "كلمات_مرور_2024.xlsx"</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => onChoice("wrong")} className="flex-1 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-[11px] font-semibold rounded-lg transition-colors">فتح الملفات</button>
                <button onClick={() => onChoice("correct")} className="flex-1 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-semibold rounded-lg transition-colors">تجاهل وتسليم للأمن</button>
              </div>
            </div>
          </div>
        </div>
        {/* Taskbar */}
        <div className="rounded-b-xl border-x border-b border-border bg-[#1a1a1a] px-4 py-1.5 flex items-center justify-between">
          <div className="flex gap-2">
            {[Monitor, Globe, Mail].map((Icon, i) => (
              <div key={i} className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
                <Icon className="h-3.5 w-3.5 text-white/50"/>
              </div>
            ))}
          </div>
          <span className="text-white/30 text-[10px] font-mono">
            {new Date().toLocaleTimeString("ar-SA", {hour:"2-digit", minute:"2-digit"})}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 5 — Scareware (Browser Popup)
// ═══════════════════════════════════════════════════════════════════════════════
function ScarewareSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-lg">
        {/* Browser chrome */}
        <div className="rounded-t-xl border border-border bg-[#292929] px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/60"/>
            <span className="w-3 h-3 rounded-full bg-amber-500/60"/>
            <span className="w-3 h-3 rounded-full bg-emerald-500/60"/>
          </div>
          <div className="flex-1 bg-[#1a1a1a] rounded-lg px-3 py-1 text-[11px] text-white/40 font-mono flex items-center gap-2">
            <Globe className="h-3 w-3 shrink-0"/>
            https://news-arabic.com/article/2024
          </div>
        </div>

        {/* Page content */}
        <div className="border-x border-border bg-white/5 px-6 py-4 min-h-[200px] relative" dir="rtl">
          {/* Fake article blurred in background */}
          <div className="space-y-2 opacity-20 blur-sm select-none">
            <div className="h-4 bg-foreground/20 rounded w-3/4"/>
            <div className="h-3 bg-foreground/10 rounded w-full"/>
            <div className="h-3 bg-foreground/10 rounded w-5/6"/>
            <div className="h-3 bg-foreground/10 rounded w-full"/>
          </div>

          {/* Scareware popup overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-rose-950 border-2 border-rose-500 rounded-2xl overflow-hidden shadow-2xl shadow-rose-500/30">
              {/* Popup header */}
              <div className="bg-rose-600 px-4 py-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-white"/>
                <span className="text-white text-xs font-black flex-1">⚠ تحذير أمني حرج</span>
                <X className="h-3.5 w-3.5 text-white/60 cursor-pointer" onClick={() => onChoice("correct")}/>
              </div>
              {/* Popup content */}
              <div className="px-4 py-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto animate-pulse">
                  <ShieldAlert className="h-7 w-7 text-rose-400"/>
                </div>
                <div>
                  <p className="text-white font-black text-base">جهازك مصاب بـ 3 فيروسات!</p>
                  <p className="text-rose-300 text-xs mt-1">تم اكتشاف برامج تجسس خطيرة. قد تتأثر بياناتك الشخصية.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => onChoice("wrong")} className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-xl text-sm transition-colors animate-pulse">
                    فحص وإزالة الفيروسات الآن!
                  </button>
                  <button onClick={() => onChoice("correct")} className="w-full py-2 text-white/40 text-xs hover:text-white/70 transition-colors">
                    إغلاق النافذة فوراً
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Browser status bar */}
        <div className="rounded-b-xl border-x border-b border-border bg-[#1a1a1a] px-4 py-1 text-[10px] text-white/20 font-mono">
          تحميل: security-scan-now.tk...
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 6 — CEO Fraud (WhatsApp-style)
// ═══════════════════════════════════════════════════════════════════════════════
function CeoFraudSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  const now = new Date().toLocaleTimeString("ar-SA", {hour:"2-digit", minute:"2-digit"});
  return (
    <div className="flex justify-center py-2">
      <div className="w-72 rounded-[2.2rem] border-[5px] border-foreground/15 bg-[#111] overflow-hidden shadow-2xl shadow-black/60">
        {/* Status */}
        <div className="flex items-center justify-between px-5 py-1.5 bg-[#111]">
          <span className="text-white text-[10px] font-bold">{now}</span>
          <div className="flex items-center gap-1"><Signal className="h-3 w-3 text-white"/><Wifi className="h-3 w-3 text-white"/><Battery className="h-3.5 w-3.5 text-white"/></div>
        </div>
        {/* WhatsApp header */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#075e54]">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm">م</div>
          <div>
            <p className="text-white text-[12px] font-bold">محمد العسيري — المدير التنفيذي</p>
            <p className="text-white/50 text-[9px]">متصل الآن</p>
          </div>
        </div>
        {/* Chat */}
        <div className="bg-[#0b1015] px-3 py-3 min-h-[230px] flex flex-col gap-2.5" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg opacity='0.03' xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3C/svg%3E\")"}}>
          {/* Messages */}
          {[
            "أهلاً بك. أنا حالياً في اجتماع مغلق مع عملاء VIP للشركة ولا أستطيع الخروج.",
            "أحتاج إرسال بطاقات هدايا رقمية (Apple / Amazon) بقيمة 2000 ريال كعربون شكر لهم فوراً، لكن بطاقة الشركة البنكية معلقة معي الآن.",
            "الرجاء شراء البطاقات من حسابك وإرسال الأكواد لي هنا بسرعة. سأوجّه قسم المالية بتعويضك غداً صباحاً.",
          ].map((msg, i) => (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] bg-[#1f2c34] px-3 py-2 rounded-xl rounded-tl-sm">
                <p className="text-white text-[11px] leading-relaxed" dir="rtl">{msg}</p>
                <p className="text-white/30 text-[9px] text-left mt-0.5">{now} ✓✓</p>
              </div>
            </div>
          ))}
          <div className="flex-1"/>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl" dir="rtl">
            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0"/>
            <p className="text-amber-300 text-[10px]">طلب مالي عبر رسائل — لا ترسل أكواداً قبل التحقق الصوتي!</p>
          </div>
        </div>
        {/* Actions */}
        <div className="bg-[#1c1c1e] border-t border-white/10 p-2.5 flex gap-2">
          <button onClick={() => onChoice("wrong")} className="flex-1 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-xl transition-colors">شراء البطاقات</button>
          <button onClick={() => onChoice("correct")} className="flex-1 py-2 bg-rose-500/80 hover:bg-rose-500 text-white text-[10px] font-bold rounded-xl transition-colors">الاتصال للتأكد 📞</button>
        </div>
        <div className="bg-[#111] flex justify-center py-1.5"><div className="w-16 h-1 rounded-full bg-white/20"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 7 — Evil Twin WiFi
// ═══════════════════════════════════════════════════════════════════════════════
function EvilTwinSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-muted/40 border-b border-border" dir="rtl">
          <Wifi className="h-5 w-5 text-sky-400"/>
          <div>
            <p className="font-bold text-foreground text-sm">اختيار شبكة Wi-Fi</p>
            <p className="text-muted-foreground text-xs">٣ شبكات متاحة في هذا الموقع</p>
          </div>
        </div>
        {/* Networks */}
        <div className="p-4 flex flex-col gap-2.5" dir="rtl">
          {/* Safe network */}
          <button onClick={() => onChoice("correct")}
            className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl transition-colors group">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Wifi className="h-4 w-4 text-emerald-400"/>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-bold text-foreground">Corporate_Secure</p>
              <p className="text-xs text-emerald-400">🔒 محمية بكلمة مرور — WPA3</p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex gap-0.5">{[1,2,3,4].map(b=><div key={b} className="w-1 bg-emerald-400 rounded-sm" style={{height:`${b*4}px`}}/>)}</div>
              <span className="text-[9px] text-muted-foreground">قوية</span>
            </div>
          </button>

          {/* Evil Twin */}
          <button onClick={() => onChoice("wrong")}
            className="flex items-center gap-3 px-4 py-3 bg-sky-500/5 border border-sky-500/20 hover:border-sky-500/50 rounded-xl transition-colors relative">
            <div className="absolute top-2 left-3 text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">جديدة</div>
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Wifi className="h-4 w-4 text-sky-400"/>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-bold text-foreground">Corporate_Free_Speed</p>
              <p className="text-xs text-sky-300">🔓 مفتوحة بدون كلمة مرور — أسرع!</p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(b=><div key={b} className="w-1 bg-sky-400 rounded-sm" style={{height:`${b*4}px`}}/>)}</div>
              <span className="text-[9px] text-muted-foreground">ممتازة</span>
            </div>
          </button>

          {/* Other network */}
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/20 border border-border rounded-xl opacity-40 cursor-default">
            <div className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
              <WifiOff className="h-4 w-4 text-muted-foreground"/>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm text-muted-foreground">Visitor_Net</p>
              <p className="text-xs text-muted-foreground">🔒 محمية</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/8 border border-amber-500/20 rounded-xl mt-1" dir="rtl">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0"/>
            <p className="text-amber-300 text-xs">أي الشبكتين تختار؟</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 8 — Cloud Spoofing (Google Drive notification)
// ═══════════════════════════════════════════════════════════════════════════════
function CloudSpoofSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-md" dir="rtl">
        {/* Email-style container */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Email header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/60"/>
              <span className="w-3 h-3 rounded-full bg-amber-500/60"/>
              <span className="w-3 h-3 rounded-full bg-emerald-500/60"/>
            </div>
            <span className="flex-1 text-center text-xs text-muted-foreground font-mono">Gmail</span>
          </div>
          <div className="p-4">
            {/* Subject */}
            <p className="font-bold text-foreground text-sm mb-3">📎 تمت مشاركة ملف معك على Google Drive</p>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-4">
              <div className="flex gap-2"><span className="w-14 shrink-0 text-right">المُرسِل:</span><span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">drive-share@g00gle-docs.com</span></div>
              <div className="flex gap-2"><span className="w-14 shrink-0 text-right">إلى:</span><span>أنت</span></div>
            </div>

            {/* Drive file card */}
            <div className="border border-border rounded-xl overflow-hidden mb-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/20">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-emerald-400"/>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-bold text-foreground">رواتب_2026.xlsx</p>
                  <p className="text-xs text-muted-foreground">Google Sheets · شارك معك بواسطة: عبدالله.مدير@company.com</p>
                </div>
              </div>
              <div className="px-4 py-2.5 bg-card border-t border-border">
                <button onClick={() => onChoice("wrong")} className="w-full py-2 bg-[#1a73e8] hover:bg-[#1967d2] text-white font-bold rounded-lg text-sm transition-colors">
                  فتح في Google Drive
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              هذا الملف تمت مشاركته معك. انقر للعرض والتحرير.
              <br/>
              <span className="font-mono text-[10px]">drive.google.g00gle-docs.com/file/d/1xK9pL2...</span>
            </p>
          </div>
          {/* Action bar */}
          <div className="px-4 py-3 border-t border-border bg-muted/10 flex items-center gap-2">
            <button onClick={() => onChoice("correct")} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-bold rounded-lg text-xs transition-colors">
              <UserCheck className="h-3.5 w-3.5"/>
              التأكد من المرسل داخلياً
            </button>
            <span className="text-[10px] text-muted-foreground">لاحظت شيئاً مريباً؟</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 9 — LinkedIn Phishing
// ═══════════════════════════════════════════════════════════════════════════════
function LinkedinPhishSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-md" dir="rtl">
        <div className="bg-[#1b1f23] border border-[#38434f] rounded-2xl overflow-hidden">
          {/* LinkedIn header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#283540] border-b border-[#38434f]">
            <div className="w-6 h-6 rounded bg-[#0a66c2] flex items-center justify-center">
              <Briefcase className="h-3.5 w-3.5 text-white"/>
            </div>
            <span className="text-white/70 text-xs font-bold">LinkedIn — رسائل مباشرة</span>
          </div>

          {/* Message thread */}
          <div className="flex h-[320px]">
            {/* Contacts sidebar */}
            <div className="w-36 shrink-0 border-l border-[#38434f] bg-[#1b1f23] p-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#0a66c2]/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-[10px] font-bold">ك</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[10px] font-bold truncate">كريم — Recruiter</p>
                  <p className="text-white/40 text-[9px]">رسالة جديدة</p>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#38434f] bg-[#1e2730]">
                <div className="w-7 h-7 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold text-sm">ك</div>
                <div>
                  <p className="text-white text-xs font-bold">كريم المنصوري</p>
                  <p className="text-[#0a66c2] text-[10px]">Senior Talent Acquisition @ GlobalTech</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {[
                  "مرحباً! رأيت ملفك الشخصي وأنت مناسب تماماً لوظيفة مدير أمن المعلومات لدينا.",
                  "الراتب: ٤٥,٠٠٠ ريال + حوافز + تأمين شامل. العمل عن بُعد بالكامل!",
                  "حمّل العقد النموذجي من هذا الرابط وأرسله موقعاً: bit.ly/contract-CISO-2026",
                ].map((msg, i) => (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] bg-[#2d3b45] px-3 py-2 rounded-xl rounded-tl-sm">
                      <p className="text-white text-[11px] leading-relaxed" dir="rtl">{msg}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div className="p-2.5 border-t border-[#38434f] bg-[#1e2730] flex gap-2">
                <button onClick={() => onChoice("wrong")} className="flex-1 py-1.5 bg-[#0a66c2] hover:bg-[#0855a5] text-white text-[10px] font-bold rounded-lg transition-colors">تحميل العقد</button>
                <button onClick={() => onChoice("correct")} className="flex-1 py-1.5 bg-rose-500/80 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors">تجاهل وإبلاغ 🚩</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 10 — Tailgating (Smart Door Badge)
// ═══════════════════════════════════════════════════════════════════════════════
function TailgatingSim({ onChoice }: { onChoice: (c: "correct"|"wrong") => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-md" dir="rtl">
        {/* Smart badge panel */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-800 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"/>
            <p className="text-white text-sm font-bold">نظام التحكم في الدخول — الباب B-07</p>
            <div className="mr-auto text-[10px] text-white/40 font-mono">ACCESS GRANTED</div>
          </div>

          {/* Scene illustration */}
          <div className="p-5 flex flex-col gap-4">
            {/* Status card */}
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5 text-emerald-400"/>
              </div>
              <div>
                <p className="text-emerald-300 text-xs font-bold">تم التحقق من هويتك</p>
                <p className="text-muted-foreground text-[11px]">بطاقة موظف #2847 — مصرّح بالدخول</p>
              </div>
            </div>

            {/* Situation */}
            <div className="flex items-start gap-3 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
              <DoorOpen className="h-5 w-5 text-amber-400 shrink-0 mt-0.5"/>
              <div>
                <p className="text-amber-300 text-xs font-bold mb-1">موقف يستوجب قراراً</p>
                <p className="text-foreground/80 text-xs leading-relaxed">
                  أنت تدخل من الباب الآمن للقسم التقني. خلفك مباشرةً شخص يحمل كوبَي قهوة ويقول لك:
                </p>
                <div className="mt-2 bg-card border border-border rounded-lg px-3 py-2">
                  <p className="text-foreground text-xs italic">"أخي، يداي ممتلئتان! أبقِ الباب مفتوحاً لحظة، بطاقتي في جيبي"</p>
                </div>
              </div>
            </div>

            {/* Info badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/8 border border-rose-500/20 rounded-xl">
              <UserX className="h-3.5 w-3.5 text-rose-400 shrink-0"/>
              <p className="text-rose-300 text-xs">الشخص لا يحمل بطاقة موظف مرئية</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex gap-2.5">
            <button onClick={() => onChoice("wrong")} className="flex-1 py-2.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-semibold rounded-xl text-xs transition-colors">
              إبقاء الباب مفتوحاً 🚪
            </button>
            <button onClick={() => onChoice("correct")} className="flex-1 py-2.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 font-bold rounded-xl text-xs transition-colors">
              الاعتذار وطلب بطاقته 🛡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DONE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function DoneScreen({ score, history, onRestart }: { score: number; history: boolean[]; onRestart: () => void }) {
  const maxScore = SCENARIOS.length * TOTAL_PTS;
  const grade =
    score >= 90 ? { label: "محلل أمني محترف 🏆",  color: "text-emerald-400", ring: "border-emerald-500/40 bg-emerald-500/10" } :
    score >= 70 ? { label: "مستوى متقدم — ممتاز",  color: "text-sky-400",     ring: "border-sky-500/40     bg-sky-500/10"     } :
    score >= 50 ? { label: "مستوى جيد — واصل التعلم", color: "text-amber-400",  ring: "border-amber-500/40  bg-amber-500/10"  } :
                  { label: "تحتاج مزيداً من التدريب", color: "text-rose-400",   ring: "border-rose-500/40   bg-rose-500/10"   };

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center" dir="rtl">
      {/* Score circle */}
      <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 ${grade.ring}`}>
        <p className="text-3xl font-black text-foreground leading-none">{score}</p>
        <p className="text-xs text-muted-foreground">/{maxScore}</p>
      </div>

      <div>
        <p className="text-muted-foreground text-sm mb-0.5">نتيجتك النهائية</p>
        <p className={`text-lg font-black ${grade.color}`}>{grade.label}</p>
      </div>

      {/* Per-round results */}
      <div className="w-full max-w-xs flex flex-col gap-2" dir="rtl">
        {history.map((correct, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${correct ? "bg-emerald-500/15 border border-emerald-500/40" : "bg-rose-500/15 border border-rose-500/40"}`}>
              {correct
                ? <CheckCircle2 className="h-3 w-3 text-emerald-400"/>
                : <ShieldAlert   className="h-3 w-3 text-rose-400"/>
              }
            </span>
            <span className="flex-1 text-xs text-right text-muted-foreground">{SCENARIOS[i].attackName}</span>
            <span className={`text-xs font-mono font-bold ${correct ? "text-emerald-400" : "text-rose-400"}`}>
              {correct ? `+${TOTAL_PTS}` : "0"}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold hover:border-foreground/30 transition-colors"
      >
        <RotateCcw className="h-4 w-4"/>
        إعادة الاختبار
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
type Phase = "playing" | "modal" | "done";

export default function SocialEngineeringLab() {
  const [roundIdx,   setRoundIdx]   = useState(0);
  const [score,      setScore]      = useState(0);
  const [history,    setHistory]    = useState<boolean[]>([]);
  const [phase,      setPhase]      = useState<Phase>("playing");
  const [lastChoice, setLastChoice] = useState<"correct"|"wrong">("correct");

  function handleChoice(choice: "correct"|"wrong") {
    const correct = choice === "correct";
    setLastChoice(choice);
    if (correct) setScore(s => s + TOTAL_PTS);
    setHistory(h => [...h, correct]);
    setPhase("modal");
  }

  function handleNext() {
    const next = roundIdx + 1;
    if (next >= SCENARIOS.length) {
      setPhase("done");
    } else {
      setRoundIdx(next);
      setPhase("playing");
    }
  }

  function handleRestart() {
    setRoundIdx(0);
    setScore(0);
    setHistory([]);
    setPhase("playing");
  }

  const scenario = SCENARIOS[roundIdx];
  const isLast   = roundIdx === SCENARIOS.length - 1;

  // Done screen
  if (phase === "done") {
    return <DoneScreen score={score} history={history} onRestart={handleRestart}/>;
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">

      {/* Header + progress */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-black text-foreground">محاكي الهندسة الاجتماعية</h2>
            <p className="text-muted-foreground text-xs">{scenario.attackName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-foreground leading-none">{score}</p>
            <p className="text-[10px] text-muted-foreground">/{SCENARIOS.length * TOTAL_PTS} نقطة</p>
          </div>
        </div>
        <ProgressBar current={roundIdx} total={SCENARIOS.length} score={score}/>
      </div>

      {/* Simulator container */}
      <div className="relative">

        {/* Result modal overlay */}
        {phase === "modal" && (
          <ResultModal
            correct={lastChoice === "correct"}
            attackName={scenario.attackName}
            explanation={lastChoice === "correct" ? scenario.correctExp : scenario.wrongExp}
            isLast={isLast}
            onNext={handleNext}
          />
        )}

        {/* Render active simulator */}
        {scenario.type === "email"         && <EmailSim         onChoice={handleChoice}/>}
        {scenario.type === "sms"           && <SmsSim           onChoice={handleChoice}/>}
        {scenario.type === "vishing"       && <VishingSim        onChoice={handleChoice}/>}
        {scenario.type === "baiting"       && <BaitingSim        onChoice={handleChoice}/>}
        {scenario.type === "scareware"     && <ScarewareSim      onChoice={handleChoice}/>}
        {scenario.type === "ceofraud"      && <CeoFraudSim       onChoice={handleChoice}/>}
        {scenario.type === "eviltwin"      && <EvilTwinSim       onChoice={handleChoice}/>}
        {scenario.type === "cloudspoofing" && <CloudSpoofSim     onChoice={handleChoice}/>}
        {scenario.type === "linkedinphish" && <LinkedinPhishSim  onChoice={handleChoice}/>}
        {scenario.type === "tailgating"    && <TailgatingSim     onChoice={handleChoice}/>}
      </div>
    </div>
  );
}
