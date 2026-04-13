import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ShieldCheck, ShieldX, AlertTriangle, Lock, LockOpen,
  Mail, MousePointerClick, RefreshCw, Trophy, ChevronRight,
  Eye, Flag, ExternalLink, CheckCircle, XCircle, Info, Skull,
} from "lucide-react";

// ─────────────── Types ───────────────
type Step = "intro" | "inbox" | "phishing" | "result";
type InboxChoice = "report" | "click" | null;

interface TrainingState {
  step: Step;
  inboxChoice: InboxChoice;
  foundErrors: Set<string>;
  hoverBtn: boolean;
}

// ─────────────── Helpers ───────────────
const ERROR_IDS = ["url-bar", "no-lock", "wrong-logo"] as const;
type ErrorId = typeof ERROR_IDS[number];

function calcScore(state: TrainingState): number {
  let score = 0;
  if (state.inboxChoice === "report") score += 40;
  ERROR_IDS.forEach((id) => { if (state.foundErrors.has(id)) score += 20; });
  return score;
}

function ScoreBadge({ score, isRtl }: { score: number; isRtl: boolean }) {
  if (score >= 80)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-sm font-bold">
        <Trophy className="h-4 w-4" />
        {isRtl ? "خبير في الأمن السيبراني" : "Cybersecurity Expert"}
      </span>
    );
  if (score >= 50)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-sm font-bold">
        <ShieldCheck className="h-4 w-4" />
        {isRtl ? "مستوى متوسط" : "Intermediate Level"}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-sm font-bold">
      <AlertTriangle className="h-4 w-4" />
      {isRtl ? "مبتدئ — يحتاج تدريباً" : "Beginner — Needs Training"}
    </span>
  );
}

// ─────────────── Screens ───────────────

function IntroScreen({ isRtl, onStart }: { isRtl: boolean; onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-8 py-12 px-4 max-w-xl mx-auto">
      <div className="p-5 rounded-3xl bg-primary/10 border border-primary/20">
        <ShieldCheck className="h-14 w-14 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-foreground mb-3">
          {isRtl ? "تدريب الهندسة الاجتماعية" : "Social Engineering Training"}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {isRtl
            ? "ستواجه سيناريوهين من الهجمات الحقيقية. مهمتك اكتشاف العلامات الحمراء واتخاذ القرار الصحيح. القرارات التي تتخذها ستُحدد مستوى وعيك الأمني."
            : "You will face two real-world attack scenarios. Your mission is to spot the red flags and make the right decisions. Your choices will determine your security awareness level."}
        </p>
      </div>

      <div className="w-full grid grid-cols-2 gap-3 text-start" dir={isRtl ? "rtl" : "ltr"}>
        {[
          { icon: Mail,            label: isRtl ? "سيناريو ١: بريد مفخّخ"       : "Scenario 1: Phishing Email" },
          { icon: LockOpen,        label: isRtl ? "سيناريو ٢: صفحة دخول مزيفة"  : "Scenario 2: Fake Login Page" },
          { icon: Eye,             label: isRtl ? "اكتشف العلامات الحمراء"       : "Spot the red flags" },
          { icon: Trophy,          label: isRtl ? "قيّم مستوى وعيك الأمني"       : "Evaluate your security level" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 bg-card border border-border rounded-xl p-3">
            <Icon className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground font-medium">{label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="flex items-center gap-2 px-8 py-3.5 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
        {isRtl ? "ابدأ التدريب" : "Start Training"}
      </button>
    </div>
  );
}

// ── Scenario 1: Inbox ──
function InboxScreen({
  isRtl,
  onChoose,
}: {
  isRtl: boolean;
  onChoose: (choice: InboxChoice) => void;
}) {
  const [hover, setHover] = useState(false);
  const [senderClicked, setSenderClicked] = useState(false);
  const [trapped, setTrapped] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Auto-advance after trap is triggered
  useEffect(() => {
    if (!trapped) return;
    if (countdown <= 0) {
      onChoose("click");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [trapped, countdown, onChoose]);

  const handleTrap = () => {
    if (trapped) return;
    setTrapped(true);
    setCountdown(3);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Training badge */}
      <div className="flex items-center gap-2 mb-6 text-yellow-400">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-semibold">
          {isRtl ? "السيناريو الأول — صندوق الوارد" : "Scenario 1 — Inbox"}
        </span>
        <span className="ms-auto text-xs text-muted-foreground">
          {isRtl ? "ابحث عن العلامات الحمراء" : "Look for red flags"}
        </span>
      </div>

      {/* ── TRAP BANNER ── */}
      {trapped && (
        <div className="mb-4 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-start gap-3 bg-red-950/60 border border-red-500/50 rounded-2xl p-4 shadow-lg">
            <div className="p-2 bg-red-500/20 rounded-xl flex-shrink-0">
              <Skull className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-red-400 text-sm mb-1">
                {isRtl ? "⚠️ لقد وقعت في الفخ!" : "⚠️ You fell for the trap!"}
              </p>
              <p className="text-xs text-red-300/80 leading-relaxed">
                {isRtl
                  ? "النقر على الروابط المشبوهة هو الخطوة الأولى نحو الاختراق. سيُنقَل حسابك الآن إلى صفحة تسجيل الدخول المزيفة لتعيش تجربة الهجوم كاملاً."
                  : "Clicking suspicious links is the first step toward a breach. You will now be taken to the fake login page to experience the full attack."}
              </p>
              <p className="text-xs text-red-400/70 mt-2 font-mono">
                {isRtl
                  ? `الانتقال خلال ${countdown} ثانية...`
                  : `Redirecting in ${countdown}s...`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email client shell */}
      <div className={`bg-card border rounded-2xl overflow-hidden shadow-xl transition-colors ${trapped ? "border-red-500/40" : "border-border"}`}>

        {/* Title bar */}
        <div className="bg-muted/60 px-4 py-2.5 flex items-center gap-2 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
            {isRtl ? "البريد الإلكتروني — صندوق الوارد" : "Mail — Inbox"}
          </div>
        </div>

        {/* Sidebar + main */}
        <div className="flex min-h-[400px]">
          {/* Sidebar */}
          <div className="w-40 border-e border-border bg-muted/20 p-3 hidden sm:block flex-shrink-0">
            <div className="space-y-1 text-xs text-muted-foreground">
              {["📥 الوارد (1)", "📤 المُرسَل", "🗑️ المحذوفة", "📁 الأرشيف"].map(f => (
                <div key={f} className={`px-2 py-1.5 rounded-lg cursor-default ${f.includes("الوارد") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Email content */}
          <div className="flex-1 p-5 space-y-4">
            {/* Subject */}
            <div className="border-b border-border pb-4">
              <h2 className="font-black text-foreground text-lg mb-3 flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                {isRtl ? "تحديث عاجل لكلمة المرور — إجراء مطلوب" : "Urgent Password Update — Action Required"}
              </h2>

              {/* Headers */}
              <div className="space-y-1.5 text-sm">
                {/* FROM — red flag: suspicious domain */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted-foreground w-16 text-xs flex-shrink-0">
                    {isRtl ? "من:" : "From:"}
                  </span>
                  <button
                    onClick={() => setSenderClicked(true)}
                    className={`
                      font-mono text-xs px-2 py-0.5 rounded border transition-all cursor-pointer
                      ${senderClicked
                        ? "bg-red-500/15 border-red-500/40 text-red-400"
                        : "bg-muted/50 border-border text-foreground hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"}
                    `}
                    title={isRtl ? "انقر لفحص المُرسِل" : "Click to inspect sender"}
                  >
                    admin@up-time-support.com
                  </button>
                  {senderClicked && (
                    <span className="text-xs text-red-400 flex items-center gap-1 animate-in fade-in">
                      <AlertTriangle className="h-3 w-3" />
                      {isRtl ? "دومين مشبوه!" : "Suspicious domain!"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-16 text-xs flex-shrink-0">
                    {isRtl ? "إلى:" : "To:"}
                  </span>
                  <span className="text-xs text-foreground">you@company.com</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-16 text-xs flex-shrink-0">
                    {isRtl ? "التاريخ:" : "Date:"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isRtl ? "الأحد، ١٢ أبريل ٢٠٢٦، ٨:٤٧ ص" : "Sunday, Apr 12 2026, 08:47 AM"}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-3 text-sm text-foreground leading-relaxed">
              <p>{isRtl ? "عزيزي الموظف،" : "Dear Employee,"}</p>
              <p>
                {isRtl
                  ? "تم رصد نشاط غير اعتيادي على حسابك. لحماية بياناتك، يُرجى تحديث كلمة المرور خلال الـ 24 ساعة القادمة. الفشل في ذلك سيؤدي إلى تعليق الحساب مؤقتاً."
                  : "Unusual activity has been detected on your account. To protect your data, please update your password within the next 24 hours. Failure to do so will result in a temporary account suspension."}
              </p>
              <p className="text-muted-foreground text-xs">
                {isRtl ? "— فريق دعم تقنية المعلومات" : "— IT Support Team"}
              </p>

              {/* CTA button — TRAP DOOR */}
              <div className="pt-2">
                <div className="relative inline-block">
                  <button
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onClick={handleTrap}
                    disabled={trapped}
                    className={`
                      px-5 py-2.5 rounded-lg text-sm font-bold transition-colors
                      ${trapped
                        ? "bg-red-700 text-white cursor-not-allowed opacity-80"
                        : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"}
                    `}
                  >
                    {isRtl ? "تحديث الآن" : "Update Now"}
                  </button>
                  {/* Fake URL preview on hover */}
                  {hover && !trapped && (
                    <div className="absolute bottom-full mb-1 start-0 bg-gray-900 text-red-400 text-xs font-mono px-2 py-1 rounded shadow-lg border border-red-500/30 whitespace-nowrap animate-in fade-in z-10 flex items-center gap-1">
                      <LockOpen className="h-3 w-3 flex-shrink-0" />
                      http://malicious-update.ru/reset-password?token=abc123
                    </div>
                  )}
                </div>
                {hover && !trapped && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1.5 animate-in fade-in">
                    <AlertTriangle className="h-3 w-3" />
                    {isRtl ? "الرابط يشير إلى موقع خارجي مشبوه!" : "Link points to a suspicious external site!"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint */}
      {!trapped && (
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-3 border border-border">
          <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>
            {isRtl
              ? "مرّر المؤشر على زر 'تحديث الآن' لرؤية الرابط الحقيقي. انقر على عنوان المُرسِل لفحصه. ثم اتخذ قرارك الصحيح."
              : "Hover over 'Update Now' to reveal the real link. Click the sender address to inspect it. Then make the right call."}
          </span>
        </div>
      )}

      {/* Action button — Report Phishing only (the correct action) */}
      {!trapped && (
        <div className="mt-6">
          <button
            onClick={() => onChoose("report")}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            <Flag className="h-5 w-5" />
            {isRtl ? "التبليغ عن تصيد احتيالي" : "Report as Phishing"}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {isRtl
              ? "هذا هو الإجراء الصحيح الوحيد — أو جرّب النقر على زر التحديث داخل البريد لترى ماذا سيحدث"
              : "This is the only correct action — or try clicking the Update button inside the email to see what happens"}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Scenario 2: Fake Login Page ──
const PHISHING_ERRORS: Record<ErrorId, { labelAr: string; labelEn: string; hintAr: string; hintEn: string }> = {
  "url-bar":   { labelAr: "عنوان URL مشبوه",      labelEn: "Suspicious URL",         hintAr: "الدومين ليس microsoft.com والبروتوكول HTTP غير مشفّر",  hintEn: "Domain is not microsoft.com and HTTP is unencrypted" },
  "no-lock":   { labelAr: "غياب قفل الأمان",       labelEn: "Missing Lock Icon",       hintAr: "المواقع الآمنة تعرض 🔒 HTTPS في شريط العنوان",           hintEn: "Secure sites show 🔒 HTTPS in the address bar" },
  "wrong-logo": { labelAr: "شعار غير رسمي",         labelEn: "Unofficial Logo",         hintAr: "خطوط الشعار ونسبه لا تطابق الشعار الرسمي لـ Microsoft",  hintEn: "Logo proportions don't match the official Microsoft logo" },
};

function PhishingScreen({
  isRtl,
  onDone,
}: {
  isRtl: boolean;
  onDone: (found: Set<string>) => void;
}) {
  const [found, setFound] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: ErrorId) => {
    if (submitted) return;
    setFound((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => onDone(found), 400);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Badge */}
      <div className="flex items-center gap-2 mb-6 text-red-400">
        <ShieldX className="h-4 w-4" />
        <span className="text-sm font-semibold">
          {isRtl ? "السيناريو الثاني — صفحة الدخول المزيفة" : "Scenario 2 — Fake Login Page"}
        </span>
        <span className="ms-auto text-xs text-muted-foreground">
          {isRtl ? "انقر على الأخطاء التي تراها" : "Click on the errors you see"}
        </span>
      </div>

      {/* Browser shell */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">

        {/* Browser chrome */}
        <div className="bg-muted/60 px-3 py-2 border-b border-border space-y-2">
          {/* Window controls */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>
          {/* URL bar — red flag: no lock + wrong domain */}
          <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-1.5 border border-border">
            {/* Lock icon area — red flag 2 */}
            <button
              onClick={() => toggle("no-lock")}
              className={`transition-colors rounded flex-shrink-0 ${found.has("no-lock") ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}
              title={isRtl ? "انقر إذا رأيت خطأ هنا" : "Click if you spot an error here"}
            >
              <LockOpen className="h-3.5 w-3.5" />
            </button>
            {/* URL — red flag 1 */}
            <button
              onClick={() => toggle("url-bar")}
              className={`
                flex-1 text-start font-mono text-xs truncate transition-colors rounded px-0.5
                ${found.has("url-bar") ? "text-red-400" : "text-muted-foreground hover:text-red-400"}
              `}
              title={isRtl ? "انقر إذا رأيت خطأ هنا" : "Click if you spot an error here"}
            >
              http://microsoft-365.up-time-support.com/login/auth?redirect=portal
            </button>
          </div>
        </div>

        {/* Page body */}
        <div className="p-8 flex flex-col items-center gap-5">
          {/* Logo — red flag 3 */}
          <button
            onClick={() => toggle("wrong-logo")}
            className={`transition-all rounded-xl p-2 ${found.has("wrong-logo") ? "ring-2 ring-red-500/50 bg-red-500/5" : "hover:bg-muted/50"}`}
            title={isRtl ? "انقر إذا رأيت خطأ هنا" : "Click if you spot an error here"}
          >
            {/* Slightly "off" Microsoft logo */}
            <div className="grid grid-cols-2 gap-0.5 w-10 h-10">
              <div className="bg-[#F25022] rounded-sm" />
              <div className="bg-[#7FBA00] rounded-sm" />
              <div className="bg-[#00A4EF] rounded-sm" />
              <div className="bg-[#FFB900] rounded-sm" style={{ borderRadius: "50%" }} />
            </div>
          </button>

          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">Microsoft 365</h3>
            <p className="text-sm text-muted-foreground">
              {isRtl ? "تسجيل الدخول إلى حسابك" : "Sign in to your account"}
            </p>
          </div>

          {/* Form (non-functional) */}
          <div className="w-full max-w-xs space-y-3">
            <input
              readOnly
              placeholder={isRtl ? "البريد الإلكتروني أو اسم المستخدم" : "Email or username"}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none cursor-not-allowed"
            />
            <input
              readOnly type="password" placeholder={isRtl ? "كلمة المرور" : "Password"}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none cursor-not-allowed"
            />
            <button
              disabled
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold opacity-60 cursor-not-allowed"
            >
              {isRtl ? "تسجيل الدخول" : "Sign In"}
            </button>
          </div>
        </div>
      </div>

      {/* Found error chips */}
      <div className="mt-4 space-y-2">
        {found.size > 0 && (
          <p className="text-xs text-muted-foreground">
            {isRtl ? `اكتشفت ${found.size} من ${ERROR_IDS.length} أخطاء` : `Found ${found.size} of ${ERROR_IDS.length} errors`}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {[...found].map((id) => {
            const err = PHISHING_ERRORS[id as ErrorId];
            return (
              <span key={id} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="h-3 w-3" />
                {isRtl ? err.labelAr : err.labelEn}
                <span className="text-muted-foreground">— {isRtl ? err.hintAr : err.hintEn}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-3 border border-border">
        <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        <span>
          {isRtl
            ? "انقر على أي عنصر تشك في كونه مزوّراً: شريط العنوان، أيقونة القفل، أو الشعار."
            : "Click on any element you suspect is fake: the URL bar, the lock icon, or the logo."}
        </span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitted}
        className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 transition-colors disabled:opacity-60"
      >
        {submitted ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
        {isRtl ? "إرسال التقرير وعرض النتائج" : "Submit & View Results"}
      </button>
    </div>
  );
}

// ── Results Screen ──
function ResultScreen({
  isRtl,
  state,
  onRestart,
}: {
  isRtl: boolean;
  state: TrainingState;
  onRestart: () => void;
}) {
  const score = calcScore(state);

  const fell = state.inboxChoice === "click";

  const checks: { id: string; labelAr: string; labelEn: string; pass: boolean; pointsAr: string; pointsEn: string; penaltyAr?: string; penaltyEn?: string }[] = [
    {
      id: "inbox",
      labelAr: fell ? "نقرت على الرابط المشبوه داخل البريد" : "التعرف على بريد التصيد والإبلاغ عنه",
      labelEn: fell ? "You clicked the suspicious link in the email" : "Identified and reported the phishing email",
      pass: state.inboxChoice === "report",
      pointsAr: "+٤٠ نقطة",
      pointsEn: "+40 pts",
      penaltyAr: fell ? "−٤٠ نقطة (وقعت في الفخ)" : undefined,
      penaltyEn: fell ? "−40 pts (fell for the trap)" : undefined,
    },
    {
      id: "url-bar",
      labelAr: "اكتشاف عنوان URL المزيّف",
      labelEn: "Detected the fake URL",
      pass: state.foundErrors.has("url-bar"),
      pointsAr: "+٢٠ نقطة",
      pointsEn: "+20 pts",
    },
    {
      id: "no-lock",
      labelAr: "ملاحظة غياب قفل HTTPS",
      labelEn: "Noticed the missing HTTPS lock",
      pass: state.foundErrors.has("no-lock"),
      pointsAr: "+٢٠ نقطة",
      pointsEn: "+20 pts",
    },
    {
      id: "wrong-logo",
      labelAr: "اكتشاف الشعار المزوّر",
      labelEn: "Spotted the fake logo",
      pass: state.foundErrors.has("wrong-logo"),
      pointsAr: "+٢٠ نقطة",
      pointsEn: "+20 pts",
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-10" dir={isRtl ? "rtl" : "ltr"}>
      {/* Score header */}
      <div className="text-center mb-8 space-y-4">
        <div className={`inline-flex p-5 rounded-3xl ${score >= 80 ? "bg-emerald-500/10" : score >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
          <Trophy className={`h-14 w-14 ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-yellow-400" : "text-red-400"}`} />
        </div>

        <div>
          <div className="text-6xl font-black text-foreground mb-1">{score}<span className="text-2xl text-muted-foreground">/100</span></div>
          <ScoreBadge score={score} isRtl={isRtl} />
        </div>

        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {fell
            ? (isRtl
                ? "وقعت في فخ التصيد ونقرت على الرابط الخبيث. هذا يُعرّض بياناتك للاختراق في الواقع الحقيقي."
                : "You fell for the phishing trap and clicked the malicious link. In a real scenario this would expose your data.")
            : score >= 80
            ? (isRtl ? "ممتاز! لديك وعي أمني عالٍ وقدرة على اكتشاف هجمات الهندسة الاجتماعية." : "Excellent! You have high security awareness and can detect social engineering attacks.")
            : score >= 50
            ? (isRtl ? "جيد. اكتشفت بعض الأخطاء لكن لا تزال بحاجة لتعزيز وعيك الأمني." : "Good. You spotted some errors but still need to strengthen your security awareness.")
            : (isRtl ? "يُنصح بالمزيد من التدريب. هجمات التصيد أكثر احترافاً مما تبدو عليه." : "More training recommended. Phishing attacks are more sophisticated than they appear.")}
        </p>
      </div>

      {/* Trap context banner */}
      {fell && (
        <div className="mb-6 flex items-start gap-3 bg-red-950/40 border border-red-500/30 rounded-2xl p-4">
          <Skull className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300/80 leading-relaxed">
            {isRtl
              ? "بعد نقرك على الزر، تم توجيهك تلقائياً إلى صفحة تسجيل دخول مزيفة — هذا ما يحدث في الهجمات الحقيقية. المرحلة التالية كانت سرقة كلمة مرورك."
              : "After clicking the button, you were automatically redirected to a fake login page — this is what happens in real attacks. The next step would have been stealing your password."}
          </p>
        </div>
      )}

      {/* Check list */}
      <div className="space-y-2.5 mb-8">
        {checks.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-3 p-3.5 rounded-xl border ${c.pass ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}
          >
            {c.pass
              ? <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              : <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />}
            <span className={`flex-1 text-sm font-medium ${c.pass ? "text-foreground" : "text-muted-foreground"}`}>
              {isRtl ? c.labelAr : c.labelEn}
            </span>
            {c.pass && (
              <span className="text-xs font-bold text-emerald-400">
                {isRtl ? c.pointsAr : c.pointsEn}
              </span>
            )}
            {!c.pass && (c.penaltyAr || c.penaltyEn) && (
              <span className="text-xs font-bold text-red-400">
                {isRtl ? c.penaltyAr : c.penaltyEn}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-2">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {isRtl ? "نصائح للحماية" : "Protection Tips"}
        </h4>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          {(isRtl
            ? ["تحقق دائماً من دومين المُرسِل قبل النقر على أي رابط.", "لا تثق بأي رسالة تطلب منك التصرف العاجل.", "تحقق من HTTPS 🔒 في شريط العنوان قبل إدخال بياناتك.", "عند الشك، أبلغ قسم أمن المعلومات فوراً."]
            : ["Always verify the sender's domain before clicking any link.", "Don't trust emails that demand urgent action.", "Verify HTTPS 🔒 in the address bar before entering credentials.", "When in doubt, report to your IT Security team immediately."]
          ).map((tip) => (
            <li key={tip} className="flex items-start gap-1.5">
              <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5 text-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 border border-border text-muted-foreground rounded-xl font-semibold hover:bg-muted hover:text-foreground transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        {isRtl ? "إعادة التدريب" : "Restart Training"}
      </button>
    </div>
  );
}

// ─────────────── Main Page ───────────────
export default function Training() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [state, setState] = useState<TrainingState>({
    step: "intro",
    inboxChoice: null,
    foundErrors: new Set(),
    hoverBtn: false,
  });

  const handleInboxChoice = (choice: InboxChoice) => {
    if (choice === "report") {
      setState((s) => ({ ...s, inboxChoice: "report", step: "phishing" }));
    } else {
      setState((s) => ({ ...s, inboxChoice: "click", step: "phishing" }));
    }
  };

  const handlePhishingDone = (found: Set<string>) => {
    setState((s) => ({ ...s, foundErrors: found, step: "result" }));
  };

  const handleRestart = () => {
    setState({ step: "intro", inboxChoice: null, foundErrors: new Set(), hoverBtn: false });
  };

  // Step indicator
  const steps = [
    { key: "intro",    labelAr: "مقدمة",      labelEn: "Intro"    },
    { key: "inbox",    labelAr: "البريد",      labelEn: "Email"    },
    { key: "phishing", labelAr: "صفحة الدخول", labelEn: "Login"    },
    { key: "result",   labelAr: "النتيجة",     labelEn: "Result"   },
  ];
  const stepIdx = steps.findIndex((s) => s.key === state.step);

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={dir}>
      <Header />

      <main className="flex-1">
        {/* Page title */}
        <div className="border-b border-border py-6 px-4">
          <div className="container mx-auto max-w-2xl">
            <h1 className="text-xl font-black text-foreground flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {isRtl ? "تدريب ومحاكاة — الهندسة الاجتماعية" : "Training & Simulation — Social Engineering"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRtl ? "اختبر مهاراتك في اكتشاف هجمات التصيد الاحتيالي" : "Test your ability to detect phishing attacks"}
            </p>

            {/* Progress steps */}
            <div className="flex items-center gap-0 mt-5">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center gap-1 flex-1 ${i === 0 ? (isRtl ? "items-end" : "items-start") : i === steps.length - 1 ? (isRtl ? "items-start" : "items-end") : "items-center"}`}>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                      i < stepIdx ? "bg-primary border-primary text-primary-foreground"
                      : i === stepIdx ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                    }`}>
                      {i < stepIdx ? <CheckCircle className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-xs hidden sm:block ${i === stepIdx ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                      {isRtl ? s.labelAr : s.labelEn}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 max-w-[60px] mx-1 transition-colors ${i < stepIdx ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active screen */}
        <div className="container mx-auto max-w-2xl">
          {state.step === "intro"    && <IntroScreen    isRtl={isRtl} onStart={() => setState((s) => ({ ...s, step: "inbox" }))} />}
          {state.step === "inbox"    && <InboxScreen    isRtl={isRtl} onChoose={handleInboxChoice} />}
          {state.step === "phishing" && <PhishingScreen isRtl={isRtl} onDone={handlePhishingDone} />}
          {state.step === "result"   && <ResultScreen   isRtl={isRtl} state={state} onRestart={handleRestart} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
