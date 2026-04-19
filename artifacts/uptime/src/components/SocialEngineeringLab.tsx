import { useState, useEffect, useRef } from "react";
import {
  Mail, MessageSquare, Smartphone, Flag, ShieldAlert, CheckCircle2,
  Inbox, Star, Trash2, Send, AlertTriangle, Lock, Phone, PhoneOff,
  Monitor, Usb, Globe, X, ChevronRight, RotateCcw,
  Battery, Signal, Wifi, WifiOff, Briefcase, DoorOpen,
  UserCheck, FileText, ShieldCheck, UserX
} from "lucide-react";

// ─── Scenario data ─────────────────────────────────────────────────────────────
interface Option {
  text:     string;
  points:   0 | 5 | 10 | 20;
  feedback: string;
}
interface Scenario {
  id:         number;
  type:       "email" | "sms" | "vishing" | "baiting" | "scareware" | "ceofraud" | "eviltwin" | "cloudspoofing" | "linkedinphish" | "tailgating";
  attackName: string;
  options:    Option[];
}

const MAX_PTS_PER_ROUND = 20;

const SCENARIOS: Scenario[] = [
  {
    id: 1, type: "email", attackName: "التصيد الإلكتروني (Phishing)",
    options: [
      { text: "الضغط على الرابط وتحديث البيانات",     points: 0,  feedback: "خطأ فادح! لقد تم اختراقك. البريد hr@uptirne.com يستخدم (rn) ليشبه (m) في كلمة uptime — هجوم Homoglyph كلاسيكي." },
      { text: "الرد على الإيميل للاستفسار",            points: 5,  feedback: "قرار خطير! الرد يؤكد للمهاجم أن بريدك الإلكتروني نشط ويفتح باب تواصل مع المحتال." },
      { text: "تجاهل الإيميل وحذفه",                  points: 10, feedback: "قرار آمن لنفسك، لكنك لم تحمِ زملاءك من نفس الهجوم. الإبلاغ خطوة أكثر أهمية." },
      { text: "الإبلاغ عنه كبريد تصيد (Report Phishing)", points: 20, feedback: "مثالي! أنت تحمي نفسك وشبكة الشركة بأكملها. فريق الأمن يتمكن من حظر المهاجم فوراً." },
    ],
  },
  {
    id: 2, type: "sms", attackName: "التصيد النصي (Smishing)",
    options: [
      { text: "الضغط على الرابط ودفع الرسوم",         points: 0,  feedback: "تم سرقة بياناتك البنكية! المواقع المنتهية بـ .tk وطلبات الدفع العاجلة عبر SMS علامات تصيد واضحة." },
      { text: "إعادة توجيه الرسالة لصديق للتحقق",     points: 5,  feedback: "قرار خطير! أنت تنشر الهجوم وتُعرّض صديقك للخطر أيضاً. التحقق يكون دائماً من المصدر الرسمي مباشرة." },
      { text: "تجاهل الرسالة وحذفها",                  points: 10, feedback: "أنت بأمان، لكن المرسل لا يزال يستهدف أشخاصاً آخرين. الإبلاغ يوقف الحملة." },
      { text: "حظر الرقم والإبلاغ عنه كاحتيال",       points: 20, feedback: "ممتاز! أسهمت في وقف هذه الحملة وحماية الآخرين من نفس الرقم." },
    ],
  },
  {
    id: 3, type: "vishing", attackName: "التصيد الصوتي (Vishing)",
    options: [
      { text: "إعطاء كلمة المرور هاتفياً للتحقق",    points: 0,  feedback: "كارثي! المهاجم حصل على كلمة مرورك. الدعم التقني الشرعي لا يطلب كلمات المرور عبر الهاتف أبداً تحت أي ظرف." },
      { text: "تغيير كلمة المرور مباشرة بعد المكالمة", points: 5,  feedback: "غير كافٍ! المهاجم استخدم كلمة مرورك أثناء المكالمة. يجب رفض الطلب من البداية." },
      { text: "إنهاء المكالمة دون إعطاء أي بيانات",   points: 10, feedback: "أنت بأمان، لكن المهاجم لا يزال يتصل بآخرين. الإبلاغ لفريق الأمن يوقفه." },
      { text: "إنهاء المكالمة والإبلاغ لفريق الأمن",  points: 20, feedback: "مثالي! أنت حميت نفسك وفضحت المهاجم. فريق الأمن يتمكن من تحليل المكالمة وتحذير الموظفين الآخرين." },
    ],
  },
  {
    id: 4, type: "baiting", attackName: "الطعم (Baiting)",
    options: [
      { text: "توصيل USB وفتح الملفات لمعرفة صاحبه",  points: 0,  feedback: "اختراق فوري! USB المفخخة تُشغّل كودها الخبيث تلقائياً عند التوصيل قبل أن تفتح أي ملف." },
      { text: "توصيل USB على جهازي الشخصي فقط",        points: 5,  feedback: "جهازك الشخصي الآن مصاب أيضاً! المهاجمون يستهدفون الأجهزة الشخصية لأنها أقل حماية من أجهزة العمل." },
      { text: "ترك USB مكانه وعدم لمسه",               points: 10, feedback: "أنت بأمان، لكن USB لا تزال خطراً على زميل آخر قد يجدها. التسليم لفريق الأمن ضروري." },
      { text: "تسليم USB لفريق الأمن فوراً دون لمسها", points: 20, feedback: "صحيح تماماً! فريق الأمن يتعامل معها في بيئة معزولة ويحلل محتواها ويحذر الموظفين." },
    ],
  },
  {
    id: 5, type: "scareware", attackName: "برمجيات التخويف (Scareware)",
    options: [
      { text: "الضغط على 'فحص الآن' لإزالة الفيروس",  points: 0,  feedback: "حمّلت برنامجاً خبيثاً! هذه النوافذ هي نفسها البرمجية الضارة. الضغط هو ما يُثبّتها على جهازك." },
      { text: "إعادة تشغيل الكمبيوتر",                points: 5,  feedback: "النافذة ستعود عند إعادة التشغيل إذا كانت بالفعل بدأت التثبيت. إغلاق المتصفح أولاً هو الخطوة الصحيحة." },
      { text: "إغلاق المتصفح بالكامل",                 points: 10, feedback: "آمن في الغالب، لكن لم تتحقق من سلامة الجهاز. إبلاغ فريق الأمن يضمن عدم وجود أضرار خفية." },
      { text: "إغلاق المتصفح وإبلاغ فريق الأمن فوراً", points: 20, feedback: "مثالي! الفريق يتحقق من سلامة الجهاز ويُضيف الموقع الخبيث لقائمة الحظر لحماية الجميع." },
    ],
  },
  {
    id: 6, type: "ceofraud", attackName: "احتيال الرؤساء (CEO Fraud)",
    options: [
      { text: "شراء البطاقات وإرسال الأكواد فوراً",    points: 0,  feedback: "وقعت في الفخ! المخترقون يفضلون بطاقات الهدايا لأن أموالها غير قابلة للتتبع أو الاسترجاع بمجرد إرسال الكود." },
      { text: "إرسال رسالة عبر نفس الواتساب للتأكد",  points: 5,  feedback: "خطأ! أنت تتحقق من المحتال نفسه. التحقق يجب أن يكون عبر قناة اتصال مختلفة تماماً." },
      { text: "رفض الطلب وعدم الرد",                   points: 10, feedback: "أنت لم تخسر مالاً، لكن إبلاغ فريق الأمن يحمي زملاءك الآخرين الذين قد تصلهم نفس الرسالة." },
      { text: "الاتصال بالمدير هاتفياً وإبلاغ فريق الأمن", points: 20, feedback: "مثالي! التحقق الصوتي يكشف الاحتيال فوراً، وإبلاغ الأمن يحمي الشركة بأكملها من هذا المهاجم." },
    ],
  },
  {
    id: 7, type: "eviltwin", attackName: "الواي فاي الوهمي (Evil Twin)",
    options: [
      { text: "الاتصال بالشبكة السريعة المفتوحة",      points: 0,  feedback: "اتصلت بشبكة المهاجم! هو الآن يراقب كل بياناتك بأسلوب Man-in-the-Middle ويعترض كلمات مرورك." },
      { text: "الاتصال بالشبكة المفتوحة مع VPN",       points: 5,  feedback: "أفضل من لا شيء، لكن VPN لا تحميك من جميع هجمات Evil Twin. تجنب الشبكات المفتوحة في بيئات العمل." },
      { text: "رفض الاتصال بأي شبكة مشبوهة",          points: 10, feedback: "أنت بأمان، لكن الإبلاغ عن الشبكة الوهمية لفريق الأمن يحمي زملاءك الآخرين في المبنى." },
      { text: "رفض الشبكة المفتوحة والإبلاغ عنها",    points: 20, feedback: "ممتاز! فريق الأمن يتمكن من تحديد الجهاز المزيف وإزالته من المبنى قبل أن يستهدف موظفين آخرين." },
    ],
  },
  {
    id: 8, type: "cloudspoofing", attackName: "التصيد السحابي (Cloud Spoofing)",
    options: [
      { text: "الضغط على 'فتح في Drive' وتسجيل الدخول", points: 0,  feedback: "سُرقت بيانات حسابك! صفحة تسجيل الدخول كانت مزيفة. لاحظ النطاق: g00gle-docs.com وليس google.com." },
      { text: "تنزيل الملف مباشرة دون تسجيل الدخول",  points: 5,  feedback: "خطر! الملف نفسه قد يحتوي على كود خبيث. لا تفتح ملفات من مصادر غير موثوقة حتى دون تسجيل الدخول." },
      { text: "تجاهل الإيميل وحذفه",                  points: 10, feedback: "أنت بأمان، لكن إبلاغ فريق الأمن يمنع وصول نفس الرسالة لزملائك في الشركة." },
      { text: "التحقق من المرسل داخلياً وإبلاغ الأمن", points: 20, feedback: "مثالي! فريق الأمن يحلل الإيميل ويحظر النطاق المزيف ويحذر جميع الموظفين من هذه الحملة." },
    ],
  },
  {
    id: 9, type: "linkedinphish", attackName: "تصيد التوظيف (LinkedIn Phishing)",
    options: [
      { text: "الضغط على الرابط وتحميل العقد",         points: 0,  feedback: "حمّلت ملفاً ضاراً! الرابط المختصر bit.ly أعاد توجيهك لموقع مزيف نزّل برنامج تجسس على جهازك." },
      { text: "إرسال سيرتك الذاتية على الرابط",        points: 5,  feedback: "شاركت بياناتك الشخصية مع مجهول! المهاجمون يستخدمون بيانات السيرة الذاتية في هجمات تصيد أكثر استهدافاً." },
      { text: "تجاهل الرسالة وحذفها",                  points: 10, feedback: "أنت بأمان، لكن الحساب المزيف لا يزال يستهدف محترفين آخرين. الإبلاغ يوقف الهجوم." },
      { text: "تجاهل الرسالة والإبلاغ عن الحساب",     points: 20, feedback: "ممتاز! LinkedIn يتمكن من تعليق الحساب المزيف وإيقاف الهجوم قبل استهداف محترفين آخرين." },
    ],
  },
  {
    id: 10, type: "tailgating", attackName: "الاختراق الفيزيائي (Tailgating)",
    options: [
      { text: "إبقاء الباب مفتوحاً مساعدةً له",        points: 0,  feedback: "سمحت لشخص غير مصرح له بالدخول! يمكنه الآن سرقة معدات أو الوصول لأجهزة داخل القسم الآمن." },
      { text: "انتظاره ليدخل خلفك بدون بطاقة",         points: 5,  feedback: "لا تزال تسمح بتجاوز بروتوكول الأمن. كل شخص يدخل المنطقة الآمنة يجب أن يُثبت هويته ببطاقته." },
      { text: "الاعتذار بلطف وإغلاق الباب",            points: 10, feedback: "أنت اتخذت القرار الصحيح، لكن إبلاغ الأمن عن هذا الشخص يمنع محاولته مجدداً مع موظف آخر." },
      { text: "الاعتذار وطلب بطاقته وإبلاغ الأمن",    points: 20, feedback: "البروتوكول الأمني الكامل! أنت حميت المنطقة الآمنة وأعطيت فريق الأمن فرصة التحقق من هوية هذا الشخص." },
    ],
  },
];

// ─── Result modal ──────────────────────────────────────────────────────────────
interface ModalProps {
  points:     number;
  attackName: string;
  feedback:   string;
  isLast:     boolean;
  onNext:     () => void;
}
function ResultModal({ points, attackName, feedback, isLast, onNext }: ModalProps) {
  const tier =
    points === 20 ? { label: `+20 نقطة — مثالي!`,     color: "text-emerald-400", ring: "bg-emerald-500/15 border-emerald-500/30", icon: <CheckCircle2 className="h-5 w-5 text-emerald-400"/> } :
    points === 10 ? { label: `+10 نقاط — آمن`,         color: "text-sky-400",     ring: "bg-sky-500/15     border-sky-500/30",     icon: <ShieldCheck  className="h-5 w-5 text-sky-400"/>     } :
    points === 5  ? { label: `+5 نقاط — محفوف بخطر`,  color: "text-amber-400",   ring: "bg-amber-500/15   border-amber-500/30",   icon: <AlertTriangle className="h-5 w-5 text-amber-400"/>  } :
                    { label: `+0 نقطة — خطأ فادح`,     color: "text-rose-400",    ring: "bg-rose-500/15    border-rose-500/30",    icon: <ShieldAlert  className="h-5 w-5 text-rose-400"/>    };
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 flex flex-col gap-4" dir="rtl">
        {/* Icon + status */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${tier.ring}`}>
            {tier.icon}
          </div>
          <div>
            <p className={`font-black text-sm ${tier.color}`}>{tier.label}</p>
            <p className="text-[11px] text-muted-foreground">{attackName}</p>
          </div>
        </div>

        {/* Feedback */}
        <p className="text-sm text-foreground/80 leading-relaxed border-t border-border pt-3">
          {feedback}
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
function EmailSim() {
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
            <div className="flex items-center gap-2 px-4 py-2 bg-sky-600/80 text-white font-bold rounded-lg text-xs cursor-default select-none w-fit">
              <Lock className="h-3.5 w-3.5"/> تحديث البيانات الآن
            </div>
            <p className="text-[11px] text-muted-foreground">الرابط: <span className="font-mono text-blue-500">http://portal.uptirne.com/payroll-update</span></p>
          </div>
          <div className="p-2.5 border-t border-border bg-muted/20 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0"/>
            <span className="text-[10px] text-amber-300">اختر من الخيارات أدناه</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 2 — Smishing (SMS)
// ═══════════════════════════════════════════════════════════════════════════════
function SmsSim() {
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
        <div className="bg-[#1c1c1e] border-t border-white/10 px-3 py-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0"/>
          <span className="text-amber-300 text-[10px]">اختر من الخيارات أدناه</span>
        </div>
        <div className="bg-[#111] flex justify-center py-1.5"><div className="w-16 h-1 rounded-full bg-white/20"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 3 — Vishing (Incoming Call)
// ═══════════════════════════════════════════════════════════════════════════════
function VishingSim() {
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

        {/* Indicator */}
        <div className="bg-[#1c1c1e] border-t border-white/10 px-3 py-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0"/>
          <span className="text-amber-300 text-[10px]">اختر من الخيارات أدناه</span>
        </div>
        <div className="bg-[#111] flex justify-center py-1.5"><div className="w-16 h-1 rounded-full bg-white/20"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 4 — Baiting (USB)
// ═══════════════════════════════════════════════════════════════════════════════
function BaitingSim() {
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
              <div className="flex items-center gap-1.5 pt-1">
                <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0"/>
                <span className="text-amber-300 text-[10px]">اختر من الخيارات أدناه</span>
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
function ScarewareSim() {
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
                <X className="h-3.5 w-3.5 text-white/60 cursor-default"/>
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
                <div className="w-full py-2.5 bg-rose-500/80 text-white font-black rounded-xl text-sm animate-pulse cursor-default select-none">
                  فحص وإزالة الفيروسات الآن!
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-amber-400"/>
                  <span className="text-amber-300 text-[10px]">اختر من الخيارات أدناه</span>
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
function CeoFraudSim() {
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
        {/* Indicator */}
        <div className="bg-[#1c1c1e] border-t border-white/10 px-3 py-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0"/>
          <span className="text-amber-300 text-[10px]">اختر من الخيارات أدناه</span>
        </div>
        <div className="bg-[#111] flex justify-center py-1.5"><div className="w-16 h-1 rounded-full bg-white/20"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 7 — Evil Twin WiFi
// ═══════════════════════════════════════════════════════════════════════════════
function EvilTwinSim() {
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
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl cursor-default">
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
          </div>

          {/* Evil Twin */}
          <div className="flex items-center gap-3 px-4 py-3 bg-sky-500/5 border border-sky-500/20 rounded-xl relative cursor-default">
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
          </div>

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
function CloudSpoofSim() {
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
                <div className="w-full py-2 bg-[#1a73e8]/80 text-white font-bold rounded-lg text-sm text-center cursor-default select-none">
                  فتح في Google Drive
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              هذا الملف تمت مشاركته معك. انقر للعرض والتحرير.
              <br/>
              <span className="font-mono text-[10px]">drive.google.g00gle-docs.com/file/d/1xK9pL2...</span>
            </p>
          </div>
          {/* Indicator bar */}
          <div className="px-4 py-3 border-t border-border bg-muted/10 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0"/>
            <span className="text-amber-300 text-xs">اختر من الخيارات أدناه</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 9 — LinkedIn Phishing
// ═══════════════════════════════════════════════════════════════════════════════
function LinkedinPhishSim() {
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
              {/* Indicator */}
              <div className="p-2.5 border-t border-[#38434f] bg-[#1e2730] flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0"/>
                <span className="text-amber-300 text-[10px]">اختر من الخيارات أدناه</span>
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
function TailgatingSim() {
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

          {/* Indicator */}
          <div className="px-4 pb-4 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0"/>
            <span className="text-amber-300 text-xs">اختر من الخيارات أدناه</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DONE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function DoneScreen({ score, history, onRestart }: { score: number; history: number[]; onRestart: () => void }) {
  const maxScore = SCENARIOS.length * MAX_PTS_PER_ROUND;
  const pct = (score / maxScore) * 100;
  const grade =
    pct >= 90 ? { label: "محلل أمني محترف 🏆",       color: "text-emerald-400", ring: "border-emerald-500/40 bg-emerald-500/10" } :
    pct >= 70 ? { label: "مستوى متقدم — ممتاز",       color: "text-sky-400",     ring: "border-sky-500/40     bg-sky-500/10"     } :
    pct >= 50 ? { label: "مستوى جيد — واصل التعلم",  color: "text-amber-400",   ring: "border-amber-500/40  bg-amber-500/10"   } :
                { label: "تحتاج مزيداً من التدريب",  color: "text-rose-400",    ring: "border-rose-500/40   bg-rose-500/10"    };

  const ptColor = (pts: number) =>
    pts === 20 ? "text-emerald-400" : pts === 10 ? "text-sky-400" : pts === 5 ? "text-amber-400" : "text-rose-400";
  const ptIcon = (pts: number) =>
    pts === 20 ? <CheckCircle2 className="h-3 w-3 text-emerald-400"/> :
    pts === 10 ? <ShieldCheck   className="h-3 w-3 text-sky-400"/> :
    pts === 5  ? <AlertTriangle className="h-3 w-3 text-amber-400"/> :
                 <ShieldAlert   className="h-3 w-3 text-rose-400"/>;

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center" dir="rtl">
      {/* Score circle */}
      <div className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center border-2 ${grade.ring}`}>
        <p className="text-3xl font-black text-foreground leading-none">{score}</p>
        <p className="text-xs text-muted-foreground">/{maxScore}</p>
      </div>

      <div>
        <p className="text-muted-foreground text-sm mb-0.5">نتيجتك النهائية</p>
        <p className={`text-lg font-black ${grade.color}`}>{grade.label}</p>
      </div>

      {/* Per-round results */}
      <div className="w-full max-w-sm flex flex-col gap-2" dir="rtl">
        {history.map((pts, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
              pts === 20 ? "bg-emerald-500/15 border-emerald-500/40" :
              pts === 10 ? "bg-sky-500/15     border-sky-500/40"     :
              pts === 5  ? "bg-amber-500/15   border-amber-500/40"   :
                           "bg-rose-500/15    border-rose-500/40"
            }`}>
              {ptIcon(pts)}
            </span>
            <span className="flex-1 text-xs text-right text-muted-foreground truncate">{SCENARIOS[i].attackName}</span>
            <span className={`text-xs font-mono font-bold shrink-0 ${ptColor(pts)}`}>+{pts}/{MAX_PTS_PER_ROUND}</span>
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
  const [roundIdx,    setRoundIdx]    = useState(0);
  const [score,       setScore]       = useState(0);
  const [history,     setHistory]     = useState<number[]>([]);
  const [phase,       setPhase]       = useState<Phase>("playing");
  const [lastOption,  setLastOption]  = useState<Option | null>(null);

  function handleOptionSelect(opt: Option) {
    setLastOption(opt);
    setScore(s => s + opt.points);
    setHistory(h => [...h, opt.points]);
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
    setLastOption(null);
  }

  const scenario = SCENARIOS[roundIdx];
  const isLast   = roundIdx === SCENARIOS.length - 1;

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
            <p className="text-[10px] text-muted-foreground">/{SCENARIOS.length * MAX_PTS_PER_ROUND} نقطة</p>
          </div>
        </div>
        <ProgressBar current={roundIdx} total={SCENARIOS.length} score={score}/>
      </div>

      {/* Simulator container */}
      <div className="relative">

        {/* Result modal overlay */}
        {phase === "modal" && lastOption && (
          <ResultModal
            points={lastOption.points}
            attackName={scenario.attackName}
            feedback={lastOption.feedback}
            isLast={isLast}
            onNext={handleNext}
          />
        )}

        {/* Render active simulator (purely visual — no action buttons inside) */}
        {scenario.type === "email"         && <EmailSim/>}
        {scenario.type === "sms"           && <SmsSim/>}
        {scenario.type === "vishing"       && <VishingSim/>}
        {scenario.type === "baiting"       && <BaitingSim/>}
        {scenario.type === "scareware"     && <ScarewareSim/>}
        {scenario.type === "ceofraud"      && <CeoFraudSim/>}
        {scenario.type === "eviltwin"      && <EvilTwinSim/>}
        {scenario.type === "cloudspoofing" && <CloudSpoofSim/>}
        {scenario.type === "linkedinphish" && <LinkedinPhishSim/>}
        {scenario.type === "tailgating"    && <TailgatingSim/>}
      </div>

      {/* ── Options panel ─────────────────────────────────────────────────── */}
      {phase === "playing" && (
        <div className="flex flex-col gap-2 pt-1" dir="rtl">
          <p className="text-xs text-muted-foreground font-semibold">ماذا ستفعل؟</p>
          {scenario.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionSelect(opt)}
              className="w-full text-right px-4 py-3 bg-card border border-border hover:border-foreground/30 hover:bg-muted/40 rounded-xl text-sm text-foreground transition-colors leading-relaxed"
            >
              <span className="font-mono text-muted-foreground text-xs ml-2">{String.fromCharCode(0x0041 + i)}.</span>
              {opt.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
