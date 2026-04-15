import { useState } from "react";
import {
  ShieldCheck, ShieldX, Trophy, ChevronLeft,
  RotateCcw, CheckCircle2, XCircle, X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Data ──────────────────────────────────────────────────────────────────────
interface Scenario {
  id: number;
  category: string;
  emoji: string;
  situation: string;
  options: [string, string];
  correctIndex: 0 | 1;
  wrongExplanation: string;
  rightExplanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    category: "التصيد الإلكتروني  (Phishing)",
    emoji: "📧",
    situation:
      "وصلك إيميل من عنوان hr-dept@company-portal.net يطلب منك تسجيل الدخول فوراً عبر رابط لتأكيد زيادة راتبك السنوية قبل انتهاء الموعد اليوم.",
    options: [
      "أضغط الرابط وأسجل دخولي لتأكيد الزيادة",
      "أتجاهل الرابط وأتواصل مع الـ HR مباشرةً داخلياً",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! رسائل التصيد تستغل الإلحاح والإغراء المالي لدفعك للتصرف دون تفكير. النقر على الرابط قد يسرق بيانات اعتمادك.",
    rightExplanation:
      "ممتاز! التواصل المباشر مع الجهة عبر قنواتها الداخلية هو الأسلوب الصحيح. لا تثق بأي رابط في بريد غير متوقع حتى لو بدا رسمياً.",
  },
  {
    id: 2,
    category: "الطعم  (Baiting)",
    emoji: "💾",
    situation:
      "وجدت فلاش ميموري USB في مواقف سيارات الشركة مكتوب عليه 'رواتب الإدارة العليا 2026'. يبدو أن أحداً نسيه.",
    options: [
      "أشبكه بجهازي لأعرف محتواه وصاحبه",
      "أسلمه مباشرةً لقسم الأمن السيبراني دون فتحه",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! يُوضع هذا الـ USB عمداً — مجرد توصيله بجهازك قد ينفّذ برمجية خبيثة تلقائياً حتى دون فتح أي ملف. هذا هجوم Baiting كلاسيكي.",
    rightExplanation:
      "ممتاز! تسليم الـ USB لفريق الأمن دون لمسه هو الإجراء الصحيح. يمكنهم فحصه في بيئة معزولة وتحديد ما إذا كان أداة هجوم.",
  },
  {
    id: 3,
    category: "التصيد الصوتي  (Vishing)",
    emoji: "📞",
    situation:
      "اتصال هاتفي من شخص يقدم نفسه بأنه من دعم الشبكات IT، يخبرك بوجود هجوم إلكتروني نشط ويطلب كلمة مرورك فوراً لتأمين حسابك قبل 5 دقائق.",
    options: [
      "أعطيه كلمة المرور لأن الأمر مستعجل",
      "أرفض وأتصل بالتحويلة الرسمية لـ IT للتأكد",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! فريق IT الحقيقي لا يطلب كلمة مرورك مطلقاً عبر الهاتف. الإلحاح الزائف أسلوب ضغط معروف في هجمات Vishing.",
    rightExplanation:
      "ممتاز! أنهِ المكالمة وتحقق من الرقم الرسمي للـ IT. القاعدة الذهبية: لا أحد يحتاج كلمة مرورك — حتى فريق الدعم.",
  },
  {
    id: 4,
    category: "التتبع الجسدي  (Tailgating)",
    emoji: "🚪",
    situation:
      "أثناء دخولك من الباب الآمن بالبطاقة الممغنطة، شخص يحمل أكواب قهوة يطلب منك بابتسامة إبقاء الباب مفتوحاً لأنه نسي بطاقته في مكتبه.",
    options: [
      "أفتح له الباب مساعدةً — يبدو موظفاً",
      "أعتذر بلطف وأطلب منه العودة بطاقته أو استدعاء زميل",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! هجوم Tailgating يعتمد على حسن النية والإحراج الاجتماعي. المظهر الودي لا يعني صلاحية الدخول.",
    rightExplanation:
      "ممتاز! الإجراءات الأمنية لا استثناء فيها حتى مع الأشخاص الودودين. أبواب الأمان موجودة لسبب، والاعتذار بلطف يحافظ على الأمن والعلاقات.",
  },
  {
    id: 5,
    category: "التصيد بالرسائل  (Smishing)",
    emoji: "📱",
    situation:
      "رسالة نصية SMS تفيد بأن شحنتك من أرامكو لوجستيك توقفت وتطلب دفع 15 ريال عبر رابط لتحديث عنوان التوصيل.",
    options: [
      "أدفع المبلغ البسيط عبر الرابط لاستلام طردي",
      "أحذف الرسالة وأتحقق مباشرةً من موقع شركة الشحن",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! المبلغ الصغير مقصود لتقليل تشككك. الرابط يستهدف بيانات بطاقتك المصرفية كاملةً وليس فقط 15 ريالاً.",
    rightExplanation:
      "ممتاز! شركات الشحن الحقيقية لا تطلب دفعات عبر روابط SMS. ادخل دائماً للموقع الرسمي مباشرةً وتحقق برقم التتبع.",
  },
  {
    id: 6,
    category: "الشبكات المزيفة  (Evil Twin)",
    emoji: "📶",
    situation:
      "أنت في مقهى وتحتاج إرسال ملف عمل سري. تجد شبكتين: 'CafePlus_WiFi' بكلمة مرور، و'Free_Cafe_WiFi' مفتوحة تماماً.",
    options: [
      "أشبك على المفتوحة للسرعة — ما في شيء يستحق الاختراق",
      "أستخدم بيانات جوالي الشخصية (5G) لإرسال الملف",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! الشبكات المفتوحة مجهولة المصدر قد تكون نقطة وصول مزيفة (Evil Twin) تعترض كل بياناتك بما فيها الملفات السرية.",
    rightExplanation:
      "ممتاز! للبيانات الحساسة، بيانات الجوال أو VPN موثوق هما الخياران الآمنان. لا تثق بأي شبكة عامة مجهولة المصدر.",
  },
  {
    id: 7,
    category: "المقايضة  (Quid Pro Quo)",
    emoji: "🎁",
    situation:
      "مندوب مبيعات يتصل ويعرض نسخة مجانية من برنامج تصميم بقيمة 2000 دولار، مقابل إعطائه معلومات عن هيكل شبكتكم الداخلية وعدد الخوادم.",
    options: [
      "أوافق — المعلومات ليست سرية وأستفيد من البرنامج",
      "أرفض وأبلغ مسؤول الأمن السيبراني بالاتصال",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! معلومات البنية التحتية للشبكة تُعد من أهم الأصول الاستخباراتية التي يسعى المهاجمون لجمعها قبل أي هجوم.",
    rightExplanation:
      "ممتاز! رفض العروض المغرية مقابل معلومات حساسة والإبلاغ عنها يحمي المنظمة. الإبلاغ يساعد في رصد محاولات الاستطلاع.",
  },
  {
    id: 8,
    category: "نبش النفايات  (Dumpster Diving)",
    emoji: "🗑️",
    situation:
      "انتهيت من كتابة مسودة ورقية تحتوي على كلمات مرور مؤقتة لخوادم الاختبار ولم تعد تحتاجها.",
    options: [
      "أرميها في سلة المهملات العادية — هي مؤقتة فقط",
      "أمررها في آلة تمزيق الورق (Shredder) قبل التخلص منها",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! المهاجمون يفتشون النفايات المكتبية بحثاً عن مثل هذه المعلومات. 'مؤقتة' لا تعني 'غير ضارة' — خاصةً إن لم تُغيَّر بعد.",
    rightExplanation:
      "ممتاز! أي وثيقة تحتوي بيانات اعتماد أو معلومات حساسة يجب تمزيقها. التخلص الآمن من الوثائق جزء أساسي من سياسة أمن المعلومات.",
  },
  {
    id: 9,
    category: "الذريعة  (Pretexting)",
    emoji: "🔧",
    situation:
      "شخص يرتدي زي عمال النظافة يطلب الجلوس على مكتبك لثوانٍ 'لإصلاح مقبس كهرباء' أسفل مكتبك بينما أنت مشغول.",
    options: [
      "أسمح له وأبتعد قليلاً — المهمة بسيطة",
      "أطلب منه هوية العمل وتصريح الصيانة قبل السماح",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! الوصول لمنطقة عملك أو جهازك لثوانٍ كافٍ لزرع جهاز تنصت أو USB خبيث. الزي الرسمي لا يُثبت الهوية.",
    rightExplanation:
      "ممتاز! طلب التحقق من الهوية والتصريح الرسمي إجراء قياسي. الشخص الحقيقي سيفهم ذلك، والمحتال سيتراجع.",
  },
  {
    id: 10,
    category: "انتحال الإدارة  (CEO Fraud)",
    emoji: "💸",
    situation:
      "رسالة واتساب مستعجلة من رقم مجهول مع صورة مديرك التنفيذي، يطلب منك شراء بطاقات هدايا iTunes بقيمة 5000 ريال للعملاء وإرسال الأكواد فوراً.",
    options: [
      "أنفذ الطلب فوراً — مديري يثق بي لمثل هذه المهام",
      "أتصل بمديري على رقمه المعروف للتأكد شخصياً",
    ],
    correctIndex: 1,
    wrongExplanation:
      "خطأ! هذا احتيال CEO Fraud كلاسيكي. المديرون التنفيذيون لا يطلبون بطاقات هدايا عبر واتساب. الإلحاح وسيلة ضغط للتحايل على تفكيرك.",
    rightExplanation:
      "ممتاز! التحقق الشخصي المباشر مع المدير عبر قناة موثوقة معروفة هو الإجراء الصحيح دائماً. هذا النوع من الاحتيال يكلف الشركات ملايين سنوياً.",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-muted-foreground font-mono">
        <span>السيناريو {current} من {total}</span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function FeedbackModal({
  correct,
  explanation,
  onNext,
  isLast,
}: {
  correct: boolean;
  explanation: string;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl flex flex-col gap-5 ${
          correct
            ? "bg-[#0d1f0d] border-emerald-500/40"
            : "bg-[#1f0d0d] border-rose-500/40"
        }`}
        dir="rtl"
      >
        {/* Icon + heading */}
        <div className="flex items-center gap-3">
          {correct ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-8 w-8 text-rose-400 shrink-0" />
          )}
          <div>
            <p className={`font-black text-lg ${correct ? "text-emerald-300" : "text-rose-300"}`}>
              {correct ? "قرار صحيح! ✓" : "قرار خاطئ ✗"}
            </p>
            <p className="text-muted-foreground text-xs">
              {correct ? "هذا بالضبط ما يفعله المحترف" : "هكذا يقع الضحايا في الفخ"}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <p className={`text-sm leading-relaxed ${correct ? "text-emerald-200/80" : "text-rose-200/80"}`}>
          {explanation}
        </p>

        {/* Action */}
        <button
          onClick={onNext}
          className={`self-start flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
            correct
              ? "bg-emerald-500 hover:bg-emerald-400 text-white"
              : "bg-rose-500   hover:bg-rose-400   text-white"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          {isLast ? "عرض النتيجة النهائية" : "السيناريو التالي"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SocialEngineeringLab() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [phase,      setPhase]      = useState<"intro" | "playing" | "done">("intro");
  const [idx,        setIdx]        = useState(0);
  const [score,      setScore]      = useState(0);
  const [chosen,     setChosen]     = useState<0 | 1 | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [isCorrect,  setIsCorrect]  = useState(false);

  const scenario = SCENARIOS[idx];
  const total    = SCENARIOS.length;
  const isLast   = idx === total - 1;

  function choose(opt: 0 | 1) {
    if (chosen !== null) return;
    const correct = opt === scenario.correctIndex;
    setChosen(opt);
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowModal(true);
  }

  function next() {
    setShowModal(false);
    if (isLast) {
      setPhase("done");
    } else {
      setIdx(i => i + 1);
      setChosen(null);
    }
  }

  function restart() {
    setPhase("intro");
    setIdx(0);
    setScore(0);
    setChosen(null);
    setShowModal(false);
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div className="flex flex-col items-center gap-7 py-8 px-4 text-center" dir="rtl">
      <div>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">محاكي الهندسة الاجتماعية</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          ١٠ مواقف حقيقية من هجمات الهندسة الاجتماعية. اقرأ كل سيناريو واتخذ القرار الصحيح — هل ستنجح في اكتشاف جميعها؟
        </p>
      </div>

      <div className="w-full max-w-lg grid grid-cols-2 gap-2 text-start text-sm">
        {SCENARIOS.map(s => (
          <div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-xs text-muted-foreground">
            <span className="text-base">{s.emoji}</span>
            <span className="font-medium text-foreground line-clamp-1">{s.category}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setPhase("playing")}
        className="flex items-center gap-2 px-7 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors text-sm shadow-lg"
      >
        <ShieldCheck className="h-4 w-4" />
        ابدأ المحاكاة
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const pct   = Math.round((score / total) * 100);
    const grade =
      pct === 100 ? "خبير أمن سيبراني — لا يُخدع!" :
      pct >= 80   ? "محترف — واعٍ بالمخاطر" :
      pct >= 60   ? "جيد — لكن هناك ثغرات" :
                    "مبتدئ — تحتاج مزيداً من التدريب";

    const gradeColor =
      pct === 100 ? "text-emerald-400" :
      pct >= 80   ? "text-sky-400"     :
      pct >= 60   ? "text-amber-400"   :
                    "text-rose-400";

    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center" dir="rtl">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${
          pct >= 80 ? "bg-emerald-500/10 border-emerald-500/30" :
          pct >= 60 ? "bg-amber-500/10   border-amber-500/30"   :
                      "bg-rose-500/10    border-rose-500/30"}`}>
          <Trophy className={`h-10 w-10 ${pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-rose-400"}`} />
        </div>

        <div>
          <p className="text-muted-foreground text-sm mb-1">نتيجتك النهائية</p>
          <p className="text-5xl font-black text-foreground">{score}<span className="text-2xl text-muted-foreground">/{total}</span></p>
          <p className={`text-lg font-bold mt-1 ${gradeColor}`}>{grade}</p>
          <p className="text-muted-foreground text-sm mt-1">{pct}% من القرارات صحيحة</p>
        </div>

        {/* Score dots */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
          {SCENARIOS.map((_, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full border"
              style={{
                background:  i < score ? "rgb(34 197 94/.35)" : "rgb(239 68 68/.35)",
                borderColor: i < score ? "rgb(34 197 94/.7)"  : "rgb(239 68 68/.7)",
              }}
            />
          ))}
        </div>

        <button
          onClick={restart}
          className="flex items-center gap-2 px-6 py-2.5 bg-card border border-border rounded-xl font-semibold hover:border-foreground/30 transition-colors text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // ── PLAYING ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 py-6 px-2" dir="rtl">

      {/* Progress */}
      <ProgressBar current={idx + 1} total={total} />

      {/* Scenario card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
          <span className="text-2xl">{scenario.emoji}</span>
          <div>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest">
              هجوم من النوع
            </p>
            <p className="font-black text-foreground text-sm">{scenario.category}</p>
          </div>
          <span className="ms-auto text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">
            #{String(scenario.id).padStart(2, "0")}
          </span>
        </div>

        {/* Situation text */}
        <div className="px-5 py-5">
          <p className="text-sm text-muted-foreground font-semibold mb-2 uppercase tracking-wider text-[11px]">الموقف</p>
          <p className="text-foreground text-base leading-relaxed font-medium">{scenario.situation}</p>
        </div>
      </div>

      {/* Choice prompt */}
      <p className="text-sm text-muted-foreground text-center">ماذا ستفعل؟</p>

      {/* Option buttons */}
      <div className="grid grid-cols-1 gap-3">
        {scenario.options.map((opt, i) => {
          const picked = chosen === i;
          const correct = i === scenario.correctIndex;

          let btnCls = "w-full text-start px-5 py-4 rounded-xl border font-medium text-sm transition-all duration-200 ";
          if (chosen === null) {
            btnCls += "bg-card border-border hover:border-primary/50 hover:bg-primary/5 text-foreground cursor-pointer";
          } else if (picked && correct) {
            btnCls += "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 cursor-default";
          } else if (picked && !correct) {
            btnCls += "bg-rose-500/10 border-rose-500/40 text-rose-300 cursor-default";
          } else if (!picked && correct && chosen !== null) {
            btnCls += "bg-emerald-500/5 border-emerald-500/20 text-emerald-400/60 cursor-default";
          } else {
            btnCls += "bg-card border-border text-muted-foreground cursor-default opacity-50";
          }

          return (
            <button
              key={i}
              onClick={() => choose(i as 0 | 1)}
              disabled={chosen !== null}
              className={btnCls}
            >
              <span className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                  chosen === null ? "border-border text-muted-foreground"
                  : picked && correct ? "border-emerald-400 bg-emerald-400 text-white"
                  : picked && !correct ? "border-rose-400 bg-rose-400 text-white"
                  : !picked && correct && chosen !== null ? "border-emerald-400/40 text-emerald-400/40"
                  : "border-border/50"
                }`}>
                  {i === 0 ? "أ" : "ب"}
                </span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback modal */}
      {showModal && (
        <FeedbackModal
          correct={isCorrect}
          explanation={isCorrect ? scenario.rightExplanation : scenario.wrongExplanation}
          onNext={next}
          isLast={isLast}
        />
      )}
    </div>
  );
}
