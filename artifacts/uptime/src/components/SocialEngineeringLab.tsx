import { useState, useEffect } from "react";
import {
  ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck,
  Inbox, Star, Trash2, Send, Lock, Phone, PhoneOff,
  Monitor, Usb, Globe, X, ChevronRight, RotateCcw,
  Battery, Signal, Wifi, WifiOff, Briefcase, DoorOpen,
  UserCheck, FileText, Flag, MessageSquare, Mail,
  PhoneCall, ShieldOff, Mic, MicOff
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
type Pts = 0 | 5 | 10 | 20;

interface Scenario {
  id:         number;
  attackName: string;
}

const MAX_PTS_PER_ROUND = 20;

const SCENARIOS: Scenario[] = [
  { id: 1,  attackName: "التصيد الإلكتروني (Phishing)"       },
  { id: 2,  attackName: "التصيد النصي (Smishing)"            },
  { id: 3,  attackName: "التصيد الصوتي (Vishing)"            },
  { id: 4,  attackName: "الطعم (Baiting)"                    },
  { id: 5,  attackName: "برمجيات التخويف (Scareware)"        },
  { id: 6,  attackName: "احتيال الرؤساء (CEO Fraud)"         },
  { id: 7,  attackName: "الواي فاي الوهمي (Evil Twin)"       },
  { id: 8,  attackName: "التصيد السحابي (Cloud Spoofing)"    },
  { id: 9,  attackName: "تصيد التوظيف (LinkedIn Phishing)"   },
  { id: 10, attackName: "الاختراق الفيزيائي (Tailgating)"   },
];

// ─── Result Modal ────────────────────────────────────────────────────────────
interface ModalProps { points: Pts; attackName: string; feedback: string; isLast: boolean; onNext: () => void; }
function ResultModal({ points, attackName, feedback, isLast, onNext }: ModalProps) {
  const tier =
    points === 20 ? { label: "+20 نقطة — مثالي!",      color: "text-emerald-400", ring: "bg-emerald-500/15 border-emerald-500/30", icon: <CheckCircle2  className="h-5 w-5 text-emerald-400"/> } :
    points === 10 ? { label: "+10 نقاط — آمن",          color: "text-sky-400",     ring: "bg-sky-500/15 border-sky-500/30",         icon: <ShieldCheck   className="h-5 w-5 text-sky-400"/>    } :
    points === 5  ? { label: "+5 نقاط — محفوف بخطر",   color: "text-amber-400",   ring: "bg-amber-500/15 border-amber-500/30",     icon: <AlertTriangle className="h-5 w-5 text-amber-400"/>  } :
                    { label: "+0 نقطة — خطأ فادح",      color: "text-rose-400",    ring: "bg-rose-500/15 border-rose-500/30",       icon: <ShieldAlert   className="h-5 w-5 text-rose-400"/>   };
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 flex flex-col gap-4" dir="rtl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${tier.ring}`}>{tier.icon}</div>
          <div>
            <p className={`font-black text-sm ${tier.color}`}>{tier.label}</p>
            <p className="text-[11px] text-muted-foreground">{attackName}</p>
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed border-t border-border pt-3">{feedback}</p>
        <button onClick={onNext} className="flex items-center justify-center gap-2 w-full py-2.5 bg-foreground text-background font-bold rounded-xl text-sm hover:opacity-90 transition-opacity">
          {isLast ? "عرض النتيجة النهائية" : "السيناريو التالي"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Progress bar ────────────────────────────────────────────────────────────
function ProgressBar({ current, total, score }: { current: number; total: number; score: number }) {
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <div className="flex gap-1.5 flex-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < current ? "bg-emerald-500" : i === current ? "bg-sky-400" : "bg-muted/40"}`} />
        ))}
      </div>
      <span className="text-xs font-mono text-muted-foreground shrink-0">
        {current + 1}/{total} — <span className="text-foreground font-bold">{score}</span> نقطة
      </span>
    </div>
  );
}

// ─── Hotspot hint ────────────────────────────────────────────────────────────
function HotspotHint() {
  return (
    <div className="flex items-center justify-center gap-2 py-1.5 text-[11px] text-muted-foreground" dir="rtl">
      <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse"/>
      انقر على العناصر القابلة للنقر داخل الواجهة
    </div>
  );
}

// Clickable hotspot wrapper
function Hotspot({ children, onClick, className = "" }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer ring-2 ring-transparent hover:ring-sky-400/60 hover:brightness-110 transition-all duration-150 rounded-lg focus:outline-none focus:ring-sky-400 ${className}`}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 1 — Phishing Email
// Hotspots: phishing link (0) | delete (10) | report phishing (20)
// ═══════════════════════════════════════════════════════════════════════════════
function EmailSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card" dir="rtl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 border-b border-border">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/60"/>
          <span className="w-3 h-3 rounded-full bg-amber-500/60"/>
          <span className="w-3 h-3 rounded-full bg-emerald-500/60"/>
        </div>
        <span className="flex-1 text-center text-xs text-muted-foreground font-mono">Outlook — صندوق الوارد</span>
      </div>
      <div className="flex h-[390px]">
        {/* Sidebar */}
        <div className="w-36 shrink-0 border-l border-border bg-muted/20 flex flex-col gap-0.5 p-2">
          {[{icon: Inbox, label:"الوارد", count:"3", active:true},{icon: Send, label:"المُرسَل", count:"", active:false},{icon: Star, label:"المميَّز", count:"", active:false},{icon: Trash2, label:"المحذوف", count:"", active:false}].map(({icon: Icon, label, count, active}) => (
            <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-default select-none text-xs ${active?"bg-sky-500/15 text-sky-300":"text-muted-foreground"}`}>
              <Icon className="h-3.5 w-3.5 shrink-0"/><span className="flex-1">{label}</span>
              {count && <span className="text-[10px] bg-sky-500/20 text-sky-300 rounded-full px-1.5 font-bold">{count}</span>}
            </div>
          ))}
          <div className="mt-2 space-y-0.5">
            {[{from:"الموارد البشرية",subj:"⚠ عاجل: تحديث",hi:true},{from:"أحمد العمري",subj:"اجتماع الأسبوع",hi:false},{from:"نظام الشركة",subj:"تقرير مارس",hi:false}].map((m,i) => (
              <div key={i} className={`px-2 py-1.5 rounded-lg cursor-default ${i===0?"bg-sky-500/10 border border-sky-500/20":""}`}>
                <p className={`text-[11px] truncate ${m.hi?"font-bold text-foreground":"text-muted-foreground"}`}>{m.from}</p>
                <p className="text-[10px] text-muted-foreground/70 truncate">{m.subj}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar with action buttons */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 border-b border-border">
            <Hotspot onClick={() => onHotspot(10, "قرار آمن لنفسك، لكنك لم تحمِ زملاءك من نفس الهجوم. الإبلاغ كان الخطوة الأكثر أهمية لحماية الشركة كاملاً.")}
              className="flex items-center gap-1 px-2 py-1 text-[10px] bg-muted/60 border border-border text-muted-foreground rounded-md">
              <Trash2 className="h-3 w-3"/> حذف
            </Hotspot>
            <Hotspot onClick={() => onHotspot(20, "مثالي! أنت تحمي نفسك وشبكة الشركة بأكملها. فريق الأمن يتمكن من حظر المهاجم فوراً ويحذر بقية الموظفين.")}
              className="flex items-center gap-1 px-2 py-1 text-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-md">
              <Flag className="h-3 w-3"/> إبلاغ عن تصيد
            </Hotspot>
          </div>
          {/* Email header */}
          <div className="p-3 border-b border-border">
            <p className="font-bold text-foreground text-sm mb-2">⚠ عاجل: يجب تحديث بيانات الراتب خلال ٢٤ ساعة</p>
            <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
              <div className="flex gap-2"><span className="w-12 text-right shrink-0">المُرسِل:</span><span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground">hr@uptirne.com</span></div>
              <div className="flex gap-2"><span className="w-12 text-right shrink-0">إلى:</span><span>موظف عزيز</span></div>
            </div>
          </div>
          {/* Email body */}
          <div className="flex-1 overflow-y-auto p-3 text-sm space-y-2 text-foreground/80 leading-relaxed">
            <p>عزيزي الموظف،</p>
            <p>بسبب الترقية لنظام الرواتب الجديد، <strong className="text-amber-300">يجب تحديث بياناتك البنكية فوراً</strong> لضمان استلام راتب أبريل في موعده.</p>
            <p className="text-rose-300/60 text-xs">المهلة: ٢٤ ساعة</p>
            <Hotspot onClick={() => onHotspot(0, "خطأ فادح! لقد تم اختراقك. البريد hr@uptirne.com يستخدم (rn) ليشبه (m) — هجوم Homoglyph كلاسيكي. لا تنقر على روابط الإيميلات العاجلة قبل التحقق من عنوان المرسل.")}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600/80 text-white font-bold rounded-lg text-xs w-fit">
              <Lock className="h-3.5 w-3.5"/> تحديث البيانات الآن
            </Hotspot>
            <p className="text-[11px] text-muted-foreground">الرابط:
              <Hotspot onClick={() => onHotspot(0, "خطأ فادح! الرابط يشير لنطاق مزيف uptirne.com بدلاً من uptime.com — فارق حرف واحد فقط. المهاجمون يعتمدون على عدم انتباهك لهذا الفارق الدقيق.")}
                className="inline font-mono text-blue-400 underline mr-1">
                http://portal.uptirne.com/payroll-update
              </Hotspot>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 2 — Smishing (SMS)
// Hotspots: phishing link (0) | ignore/swipe (10) | block+report (20)
// ═══════════════════════════════════════════════════════════════════════════════
function SmsSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
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
        <div className="bg-[#111] px-3 py-3 min-h-[220px] flex flex-col gap-2.5">
          <div className="flex flex-col items-end gap-0.5">
            <div className="max-w-[90%] bg-[#2c2c2e] px-3 py-2 rounded-2xl rounded-tr-sm">
              <p className="text-white text-[11px] leading-relaxed" dir="rtl">طردك موقوف! يرجى دفع رسوم التخليص ١٥ ريال لاستكمال التسليم خلال ٢٤ ساعة.</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <div className="max-w-[90%] bg-[#2c2c2e] px-3 py-2 rounded-2xl rounded-tr-sm">
              <Hotspot onClick={() => onHotspot(0, "تم سرقة بياناتك البنكية! المواقع المنتهية بـ .tk وطلبات الدفع العاجلة عبر SMS علامات تصيد واضحة. أرامكس لا يطلب الدفع عبر روابط SMS.")}
                className="text-[11px] font-mono text-sky-400 underline" >
                http://aramex-sa-pay.tk/pay?id=88291
              </Hotspot>
            </div>
          </div>
          <div className="flex-1"/>
          {/* Action bar */}
          <div className="flex gap-2">
            <Hotspot onClick={() => onHotspot(10, "أنت بأمان، لكن المرسل لا يزال يستهدف أشخاصاً آخرين. الإبلاغ والحظر معاً يوقفان الحملة بشكل كامل.")}
              className="flex-1 py-1.5 bg-[#2c2c2e] text-white/60 text-[10px] rounded-xl text-center">
              تجاهل
            </Hotspot>
            <Hotspot onClick={() => onHotspot(20, "ممتاز! حظر الرقم والإبلاغ عنه يُسهم في وقف هذه الحملة وحماية الآخرين. شبكات الاتصال تستخدم هذه البلاغات لتعليق الأرقام المشبوهة.")}
              className="flex-1 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] rounded-xl text-center">
              🚫 حظر وإبلاغ
            </Hotspot>
          </div>
        </div>
        <div className="bg-[#111] flex justify-center py-1.5"><div className="w-16 h-1 rounded-full bg-white/20"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 3 — Vishing (Active call — caller asking for password)
// Hotspots: give password (0) | hang up (10) | hang up + report (20)
// ═══════════════════════════════════════════════════════════════════════════════
function VishingSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
  const [pulse, setPulse] = useState(true);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 900); return () => clearInterval(t); }, []);
  return (
    <div className="flex justify-center py-2">
      <div className="w-60 rounded-[2.2rem] border-[5px] border-foreground/15 bg-[#111] overflow-hidden shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-1.5 bg-[#111]">
          <span className="text-white text-[10px] font-bold">00:48</span>
          <div className="flex items-center gap-1"><Signal className="h-3 w-3 text-white"/><Battery className="h-3.5 w-3.5 text-white"/></div>
        </div>
        <div className="bg-gradient-to-b from-[#1a1a2e] to-[#111] px-5 py-6 flex flex-col items-center gap-3 min-h-[280px]">
          <div className="relative flex items-center justify-center">
            <div className={`absolute w-20 h-20 rounded-full border border-amber-400/20 transition-all duration-1000 ${pulse?"scale-110 opacity-50":"scale-100 opacity-20"}`}/>
            <div className="w-14 h-14 rounded-full bg-[#2c2c2e] border border-amber-500/40 flex items-center justify-center">
              <Phone className="h-6 w-6 text-amber-400"/>
            </div>
          </div>
          <div className="text-center" dir="rtl">
            <p className="text-white font-black text-base">رقم مجهول</p>
            <p className="text-white/50 text-[10px]">مكالمة جارية · 00:48</p>
          </div>
          <div className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5" dir="rtl">
            <p className="text-white/50 text-[9px] mb-1">المتصل يقول:</p>
            <p className="text-white text-[11px] leading-relaxed">"فريق الدعم الفني — رصدنا نشاطاً مشبوهاً على حسابك. نحتاج كلمة مرورك <strong className="text-amber-300">للتحقق الفوري</strong> قبل تعطل الحساب!"</p>
          </div>
          {/* Action buttons */}
          <div className="flex gap-3 w-full mt-1">
            <Hotspot onClick={() => onHotspot(0, "كارثي! المهاجم حصل على كلمة مرورك. الدعم التقني الشرعي لا يطلب كلمات المرور أبداً عبر الهاتف تحت أي ظرف كان.")}
              className="flex-1 flex flex-col items-center gap-1 py-2 bg-amber-500/15 border border-amber-500/30 rounded-2xl">
              <Mic className="h-5 w-5 text-amber-400"/>
              <span className="text-amber-300 text-[10px]">أعطِ كلمة المرور</span>
            </Hotspot>
            <Hotspot onClick={() => onHotspot(10, "أنت بأمان، لكن المهاجم لا يزال يتصل بموظفين آخرين. إبلاغ فريق الأمن يوقفه ويُحذّر الجميع.")}
              className="flex-1 flex flex-col items-center gap-1 py-2 bg-rose-500/15 border border-rose-500/30 rounded-2xl">
              <PhoneOff className="h-5 w-5 text-rose-400"/>
              <span className="text-rose-300 text-[10px]">أنهِ المكالمة</span>
            </Hotspot>
            <Hotspot onClick={() => onHotspot(20, "مثالي! إنهاء المكالمة وإبلاغ فريق الأمن يوقف المهاجم ويحذر بقية الموظفين. فريق الأمن يتمكن من تحليل الرقم وتعقّبه.")}
              className="flex-1 flex flex-col items-center gap-1 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl">
              <ShieldCheck className="h-5 w-5 text-emerald-400"/>
              <span className="text-emerald-300 text-[10px]">أنهِ + أبلِغ</span>
            </Hotspot>
          </div>
        </div>
        <div className="bg-[#111] flex justify-center py-1.5"><div className="w-16 h-1 rounded-full bg-white/20"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 4 — Baiting (USB)
// Hotspots: open files (0) | close notification (10) | report to security (20)
// ═══════════════════════════════════════════════════════════════════════════════
function BaitingSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-md">
        <div className="rounded-t-xl border border-border bg-gradient-to-br from-slate-900 to-slate-800 p-8 min-h-[300px] relative flex items-start justify-end" dir="rtl">
          {/* Desktop icons (decorative) */}
          <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-30">
            {[Monitor, Globe, Mail].map((Icon, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"><Icon className="h-5 w-5 text-white/60"/></div>
                <span className="text-white/40 text-[9px]">ملف</span>
              </div>
            ))}
          </div>
          {/* System notification popup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl shadow-2xl overflow-hidden" dir="rtl">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#252525] border-b border-[#3a3a3a]">
              <Usb className="h-4 w-4 text-amber-400"/>
              <span className="text-white text-xs font-semibold flex-1">تم توصيل جهاز USB</span>
              <Hotspot onClick={() => onHotspot(10, "أنت بأمان، لكن الـUSB لا تزال خطراً على زميل آخر قد يجدها. التسليم لفريق الأمن يضمن تحليلها في بيئة آمنة.")}
                className="w-5 h-5 flex items-center justify-center rounded">
                <X className="h-3.5 w-3.5 text-white/50"/>
              </Hotspot>
            </div>
            <div className="px-4 py-3 flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0">
                  <Usb className="h-5 w-5 text-amber-400"/>
                </div>
                <div>
                  <p className="text-white text-xs font-bold mb-0.5">جهاز تخزين غير معروف</p>
                  <p className="text-white/60 text-[11px] leading-relaxed">يحتوي على <strong className="text-amber-300">١٢ ملفاً</strong> بما فيها "كلمات_مرور_2024.xlsx"</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Hotspot onClick={() => onHotspot(0, "اختراق فوري! USB المفخخة تُشغّل كودها الخبيث تلقائياً عند الفتح. حتى قبل أن تقرأ أي ملف، البرنامج الضار ينسخ نفسه على جهازك.")}
                  className="flex-1 py-1.5 bg-sky-600/80 text-white text-[11px] font-bold rounded-lg text-center">
                  فتح الملفات
                </Hotspot>
                <Hotspot onClick={() => onHotspot(20, "صحيح تماماً! فريق الأمن يتعامل مع الـUSB في بيئة معزولة (sandbox) ويحلل محتواها ويحذر الموظفين من هذا النوع من الهجمات.")}
                  className="flex-1 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-lg text-center">
                  إبلاغ الأمن
                </Hotspot>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-b-xl border-x border-b border-border bg-[#1a1a1a] px-4 py-1.5 flex items-center justify-between">
          <div className="flex gap-2">{[Monitor, Globe, Mail].map((Icon, i) => (<div key={i} className="w-6 h-6 bg-white/10 rounded flex items-center justify-center"><Icon className="h-3.5 w-3.5 text-white/50"/></div>))}</div>
          <span className="text-white/30 text-[10px] font-mono">{new Date().toLocaleTimeString("ar-SA", {hour:"2-digit", minute:"2-digit"})}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 5 — Scareware
// Hotspots: "Scan now" button (0) | popup X (10) | close tab X (20)
// ═══════════════════════════════════════════════════════════════════════════════
function ScarewareSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-lg">
        {/* Browser chrome */}
        <div className="rounded-t-xl border border-border bg-[#292929] px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/60 cursor-default"/>
            <span className="w-3 h-3 rounded-full bg-amber-500/60 cursor-default"/>
            <span className="w-3 h-3 rounded-full bg-emerald-500/60 cursor-default"/>
          </div>
          {/* Tab bar with close button */}
          <div className="flex items-center gap-1 bg-[#3a3a3a] rounded-t-md px-2 py-1 text-[10px]">
            <Globe className="h-2.5 w-2.5 text-white/40"/>
            <span className="text-white/50 mr-1">news-arabic.com</span>
            <Hotspot onClick={() => onHotspot(20, "مثالي! إغلاق المتصفح كاملاً يقطع تحميل الكود الخبيث. إبلاغ فريق الأمن يجعلهم يحظرون الموقع ويتحققون من سلامة جهازك.")}
              className="ml-1 w-3.5 h-3.5 flex items-center justify-center bg-white/10 rounded-sm hover:bg-rose-500/60">
              <X className="h-2.5 w-2.5 text-white/70"/>
            </Hotspot>
          </div>
          <div className="flex-1 bg-[#1a1a1a] rounded-lg px-3 py-1 text-[11px] text-white/40 font-mono flex items-center gap-2">
            <Globe className="h-3 w-3 shrink-0"/>
            https://news-arabic.com/article/2024
          </div>
        </div>
        {/* Page content */}
        <div className="border-x border-border bg-white/5 px-6 py-4 min-h-[200px] relative" dir="rtl">
          <div className="space-y-2 opacity-20 blur-sm select-none">
            <div className="h-4 bg-foreground/20 rounded w-3/4"/>
            <div className="h-3 bg-foreground/10 rounded w-full"/>
            <div className="h-3 bg-foreground/10 rounded w-5/6"/>
          </div>
          {/* Scareware popup */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-rose-950 border-2 border-rose-500 rounded-2xl overflow-hidden shadow-2xl shadow-rose-500/30">
              <div className="bg-rose-600 px-4 py-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-white"/>
                <span className="text-white text-xs font-black flex-1">⚠ تحذير أمني حرج</span>
                <Hotspot onClick={() => onHotspot(10, "أغلقت النافذة، لكن الموقع لا يزال مفتوحاً وقد يحاول إعادة النافذة. إغلاق التبويب بالكامل ثم إبلاغ فريق الأمن هو الخطوة الصحيحة.")}
                  className="w-5 h-5 flex items-center justify-center rounded">
                  <X className="h-3.5 w-3.5 text-white/80"/>
                </Hotspot>
              </div>
              <div className="px-4 py-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto animate-pulse">
                  <ShieldAlert className="h-7 w-7 text-rose-400"/>
                </div>
                <div>
                  <p className="text-white font-black text-base">جهازك مصاب بـ 3 فيروسات!</p>
                  <p className="text-rose-300 text-xs mt-1">تم اكتشاف برامج تجسس خطيرة. قد تتأثر بياناتك.</p>
                </div>
                <Hotspot onClick={() => onHotspot(0, "حمّلت برنامجاً خبيثاً! هذه النافذة هي نفسها البرمجية الضارة. الضغط عليها يُثبّتها على جهازك. هذا الأسلوب يُسمى Scareware — يخيفك لتثبيت مزيد من البرمجيات الضارة.")}
                  className="w-full py-2.5 bg-rose-500/80 text-white font-black rounded-xl text-sm animate-pulse">
                  فحص وإزالة الفيروسات الآن!
                </Hotspot>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-b-xl border-x border-b border-border bg-[#1a1a1a] px-4 py-1 text-[10px] text-white/20 font-mono">
          تحميل: security-scan-now.tk...
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 6 — CEO Fraud (WhatsApp-style)
// Hotspots: send gift card codes (0) | ignore (10) | call to verify (20)
// ═══════════════════════════════════════════════════════════════════════════════
function CeoFraudSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
  const now = new Date().toLocaleTimeString("ar-SA", {hour:"2-digit", minute:"2-digit"});
  return (
    <div className="flex justify-center py-2">
      <div className="w-72 rounded-[2.2rem] border-[5px] border-foreground/15 bg-[#111] overflow-hidden shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-1.5 bg-[#111]">
          <span className="text-white text-[10px] font-bold">{now}</span>
          <div className="flex items-center gap-1"><Signal className="h-3 w-3 text-white"/><Wifi className="h-3 w-3 text-white"/><Battery className="h-3.5 w-3.5 text-white"/></div>
        </div>
        {/* WhatsApp header */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#075e54]">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm">م</div>
          <div className="flex-1">
            <p className="text-white text-[12px] font-bold">محمد العسيري — المدير</p>
            <p className="text-white/50 text-[9px]">متصل الآن</p>
          </div>
          {/* Phone icon = correct hotspot */}
          <Hotspot onClick={() => onHotspot(20, "مثالي! التحقق الصوتي المباشر يكشف الاحتيال فوراً — المدير الحقيقي لن يعرف شيئاً عن الطلب. إبلاغ فريق الأمن يحمي الشركة من نفس المهاجم.")}
            className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center">
            <PhoneCall className="h-4 w-4 text-white"/>
          </Hotspot>
        </div>
        {/* Chat messages */}
        <div className="bg-[#0b1015] px-3 py-3 min-h-[220px] flex flex-col gap-2">
          {[
            "أحتاج مساعدة عاجلة — لا يمكنني التحدث الآن، أنا في اجتماع VIP.",
            "اشترِ بطاقات هدايا Apple/Amazon بقيمة ٢٠٠٠ ريال وأرسل الأكواد الآن. بطاقة الشركة معطلة.",
          ].map((msg, i) => (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] bg-[#1f2c34] px-3 py-2 rounded-xl rounded-tl-sm">
                <p className="text-white text-[11px] leading-relaxed" dir="rtl">{msg}</p>
                <p className="text-white/30 text-[9px] text-left mt-0.5">{now} ✓✓</p>
              </div>
            </div>
          ))}
          <div className="flex-1"/>
        </div>
        {/* Input bar = wrong hotspot */}
        <Hotspot onClick={() => onHotspot(0, "وقعت في الفخ! المهاجمون يفضلون بطاقات الهدايا لأن أموالها غير قابلة للتتبع أو الاسترجاع أبداً بمجرد إرسال الكود. الرؤساء لا يطلبون ذلك عبر واتساب.")}
          className="bg-[#1f2c34] border-t border-white/10 px-3 py-2.5 flex items-center gap-2 w-full rounded-none">
          <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-white/30 text-[10px]" dir="rtl">أرسل أكواد البطاقات...</div>
          <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center shrink-0">
            <Send className="h-3.5 w-3.5 text-white"/>
          </div>
        </Hotspot>
        <div className="bg-[#111] flex justify-center py-1.5"><div className="w-16 h-1 rounded-full bg-white/20"/></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 7 — Evil Twin WiFi
// Hotspots: evil twin (0) | secure network (20)
// ═══════════════════════════════════════════════════════════════════════════════
function EvilTwinSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-muted/40 border-b border-border" dir="rtl">
          <Wifi className="h-5 w-5 text-sky-400"/>
          <div>
            <p className="font-bold text-foreground text-sm">اختيار شبكة Wi-Fi</p>
            <p className="text-muted-foreground text-xs">٣ شبكات متاحة في هذا الموقع</p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2.5" dir="rtl">
          {/* Safe network */}
          <Hotspot onClick={() => onHotspot(20, "قرار صحيح! الشبكة المحمية بـ WPA3 هي شبكة الشركة الرسمية. تجنّب دائماً الشبكات المفتوحة في بيئات العمل — لا يوجد سبب وجيه لشبكة عمل مفتوحة.")}
            className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
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
          </Hotspot>
          {/* Evil Twin */}
          <Hotspot onClick={() => onHotspot(0, "اتصلت بشبكة المهاجم! هو الآن يراقب كل بياناتك بأسلوب Man-in-the-Middle ويعترض كلمات مرورك وجلساتك المصرفية. الشبكات المفتوحة خطر دائم.")}
            className="flex items-center gap-3 px-4 py-3 bg-sky-500/5 border border-sky-500/20 rounded-xl relative">
            <div className="absolute top-2 left-3 text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">جديدة!</div>
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
          </Hotspot>
          {/* Weak other network */}
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/20 border border-border rounded-xl opacity-40 cursor-default">
            <div className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0"><WifiOff className="h-4 w-4 text-muted-foreground"/></div>
            <div className="flex-1 text-right"><p className="text-sm text-muted-foreground">Visitor_Net</p><p className="text-xs text-muted-foreground">🔒 محمية</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 8 — Cloud Spoofing (Google Drive email)
// Hotspots: "Open in Drive" (0) | sender domain (5) | delete+report (20)
// ═══════════════════════════════════════════════════════════════════════════════
function CloudSpoofSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-md" dir="rtl">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/60"/>
              <span className="w-3 h-3 rounded-full bg-amber-500/60"/>
              <span className="w-3 h-3 rounded-full bg-emerald-500/60"/>
            </div>
            <span className="flex-1 text-center text-xs text-muted-foreground font-mono">Gmail</span>
            <div className="flex gap-1.5">
              <Hotspot onClick={() => onHotspot(10, "حذفت الإيميل — أنت بأمان. لكن إبلاغ فريق الأمن يمنع وصول نفس الرسالة لزملائك ويحظر النطاق المزيف.")}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-muted/60 border border-border text-muted-foreground rounded-md">
                <Trash2 className="h-2.5 w-2.5"/> حذف
              </Hotspot>
              <Hotspot onClick={() => onHotspot(20, "مثالي! إبلاغ فريق الأمن يحلل الإيميل ويحظر نطاق g00gle-docs.com ويحذر جميع الموظفين من هذه الحملة فوراً.")}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-md">
                <Flag className="h-2.5 w-2.5"/> إبلاغ
              </Hotspot>
            </div>
          </div>
          <div className="p-4">
            <p className="font-bold text-foreground text-sm mb-3">📎 تمت مشاركة ملف معك على Google Drive</p>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-4">
              <div className="flex gap-2">
                <span className="w-14 shrink-0 text-right">المُرسِل:</span>
                <Hotspot onClick={() => onHotspot(5, "لاحظت النطاق المزيف g00gle-docs.com! هذا وعي جيد، لكن مجرد التحقق من العنوان دون حذف الإيميل والإبلاغ عنه لا يكفي لحماية الآخرين.")}
                  className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-rose-400 inline-block">
                  drive-share@g00gle-docs.com
                </Hotspot>
              </div>
              <div className="flex gap-2"><span className="w-14 shrink-0 text-right">إلى:</span><span>أنت</span></div>
            </div>
            <div className="border border-border rounded-xl overflow-hidden mb-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/20">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-emerald-400"/>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-bold text-foreground">رواتب_2026.xlsx</p>
                  <p className="text-xs text-muted-foreground">Google Sheets · شارك معك بواسطة: عبدالله.مدير</p>
                </div>
              </div>
              <div className="px-4 py-2.5 bg-card border-t border-border">
                <Hotspot onClick={() => onHotspot(0, "سُرقت بيانات حسابك! صفحة تسجيل الدخول كانت مزيفة. النطاق g00gle-docs.com يستخدم صفراً بدلاً من حرف O — هجوم Homoglyph كلاسيكي.")}
                  className="w-full py-2 bg-[#1a73e8]/80 text-white font-bold rounded-lg text-sm text-center block">
                  فتح في Google Drive
                </Hotspot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 9 — LinkedIn Phishing
// Hotspots: malicious link (0) | ignore (10) | report account (20)
// ═══════════════════════════════════════════════════════════════════════════════
function LinkedinPhishSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-md" dir="rtl">
        <div className="bg-[#1b1f23] border border-[#38434f] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#283540] border-b border-[#38434f]">
            <div className="w-6 h-6 rounded bg-[#0a66c2] flex items-center justify-center">
              <Briefcase className="h-3.5 w-3.5 text-white"/>
            </div>
            <span className="text-white/70 text-xs font-bold flex-1">LinkedIn — رسائل مباشرة</span>
            <Hotspot onClick={() => onHotspot(20, "ممتاز! إبلاغ LinkedIn يُعلّق الحساب المزيف ويوقف الهجوم قبل استهداف محترفين آخرين. الحسابات المزيفة تستهدف عشرات الأشخاص يومياً.")}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-md">
              <Flag className="h-2.5 w-2.5"/> إبلاغ عن الحساب
            </Hotspot>
          </div>
          <div className="flex h-[300px]">
            <div className="w-36 shrink-0 border-l border-[#38434f] bg-[#1b1f23] p-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#0a66c2]/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-[10px] font-bold">ك</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[10px] font-bold truncate">كريم — Recruiter</p>
                  <p className="text-white/40 text-[9px]">رسالة جديدة</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#38434f] bg-[#1e2730]">
                <div className="w-7 h-7 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-bold text-sm">ك</div>
                <div>
                  <p className="text-white text-xs font-bold">كريم المنصوري</p>
                  <p className="text-[#0a66c2] text-[10px]">Senior Talent Acquisition @ GlobalTech</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {["مرحباً! رأيت ملفك الشخصي وأنت مناسب تماماً لوظيفة مدير أمن المعلومات.",
                  "الراتب: ٤٥,٠٠٠ ريال + حوافز. العمل عن بُعد بالكامل!",
                ].map((msg, i) => (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] bg-[#2d3b45] px-3 py-2 rounded-xl rounded-tl-sm">
                      <p className="text-white text-[11px] leading-relaxed" dir="rtl">{msg}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[#2d3b45] px-3 py-2 rounded-xl rounded-tl-sm">
                    <p className="text-white text-[11px] leading-relaxed" dir="rtl">حمّل العقد من هذا الرابط وأرسله موقعاً:</p>
                    <Hotspot onClick={() => onHotspot(0, "حمّلت ملفاً ضاراً! الرابط المختصر bit.ly أعاد توجيهك لموقع مزيف نزّل برنامج تجسس. الروابط المختصرة في عروض العمل علامة تحذير واضحة.")}
                      className="font-mono text-sky-400 underline text-[10px] block mt-1">
                      bit.ly/contract-CISO-2026
                    </Hotspot>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 border-t border-[#38434f] bg-[#1e2730]">
                <Hotspot onClick={() => onHotspot(10, "تجاهلت الرسالة — أنت بأمان. لكن الحساب المزيف لا يزال يستهدف محترفين آخرين. الإبلاغ عنه يوقف الهجوم بشكل كامل.")}
                  className="w-full py-1.5 bg-[#2d3b45] text-white/50 text-[10px] rounded-lg text-center">
                  تجاهل الرسالة
                </Hotspot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 10 — Tailgating
// Hotspots: hold door (0) | close door politely (10) | ask for badge + report (20)
// ═══════════════════════════════════════════════════════════════════════════════
function TailgatingSim({ onHotspot }: { onHotspot: (pts: Pts, fb: string) => void }) {
  return (
    <div className="flex justify-center py-4">
      <div className="w-full max-w-md" dir="rtl">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-800 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"/>
            <p className="text-white text-sm font-bold">نظام التحكم في الدخول — الباب B-07</p>
            <div className="mr-auto text-[10px] text-white/40 font-mono">ACCESS GRANTED</div>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5 text-emerald-400"/>
              </div>
              <div>
                <p className="text-emerald-300 text-xs font-bold">تم التحقق من هويتك</p>
                <p className="text-muted-foreground text-[11px]">بطاقة موظف #2847 — مصرّح بالدخول</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
              <DoorOpen className="h-5 w-5 text-amber-400 shrink-0 mt-0.5"/>
              <div>
                <p className="text-amber-300 text-xs font-bold mb-1">موقف يستوجب قراراً</p>
                <p className="text-foreground/80 text-xs leading-relaxed">خلفك شخص يحمل كوبَي قهوة ويقول:</p>
                <div className="mt-2 bg-card border border-border rounded-lg px-3 py-2">
                  <p className="text-foreground text-xs italic">"أخي، يداي ممتلئتان! أبقِ الباب مفتوحاً لحظة، بطاقتي في جيبي"</p>
                </div>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Hotspot onClick={() => onHotspot(0, "سمحت لشخص غير مصرح له بالدخول! يمكنه الآن سرقة معدات أو الوصول لأجهزة في القسم الآمن. الأشخاص ذوو النوايا السيئة يتعمدون شغل أيديهم لاستثارة مشاعر المساعدة.")}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-bold rounded-xl">
                <DoorOpen className="h-4 w-4"/> أبقِ الباب مفتوحاً
              </Hotspot>
              <Hotspot onClick={() => onHotspot(10, "قرار آمن — أغلقت الباب. لكن الشخص قد يحاول مع موظف آخر. إبلاغ فريق الأمن يعطيهم فرصة للتحقق من هوية هذا الشخص.")}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-bold rounded-xl">
                <X className="h-4 w-4"/> اعتذر وأغلق الباب
              </Hotspot>
              <Hotspot onClick={() => onHotspot(20, "البروتوكول الأمني الكامل! طلب البطاقة يكشف إن كان موظفاً حقيقياً، وإبلاغ فريق الأمن يمنع الشخص من المحاولة مجدداً مع موظف آخر.")}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold rounded-xl">
                <ShieldCheck className="h-4 w-4"/> اطلب بطاقته وأبلِغ الأمن
              </Hotspot>
            </div>
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
    pct >= 90 ? { label: "محلل أمني محترف 🏆",      color: "text-emerald-400", ring: "border-emerald-500/40 bg-emerald-500/10" } :
    pct >= 70 ? { label: "مستوى متقدم — ممتاز",      color: "text-sky-400",     ring: "border-sky-500/40 bg-sky-500/10"         } :
    pct >= 50 ? { label: "مستوى جيد — واصل التعلم", color: "text-amber-400",   ring: "border-amber-500/40 bg-amber-500/10"     } :
                { label: "تحتاج مزيداً من التدريب", color: "text-rose-400",    ring: "border-rose-500/40 bg-rose-500/10"       };

  const ptColor = (pts: number) => pts === 20 ? "text-emerald-400" : pts === 10 ? "text-sky-400" : pts === 5 ? "text-amber-400" : "text-rose-400";
  const ptIcon  = (pts: number) =>
    pts === 20 ? <CheckCircle2  className="h-3 w-3 text-emerald-400"/> :
    pts === 10 ? <ShieldCheck   className="h-3 w-3 text-sky-400"/>     :
    pts === 5  ? <AlertTriangle className="h-3 w-3 text-amber-400"/>   :
                 <ShieldAlert   className="h-3 w-3 text-rose-400"/>;

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center" dir="rtl">
      <div className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center border-2 ${grade.ring}`}>
        <p className="text-3xl font-black text-foreground leading-none">{score}</p>
        <p className="text-xs text-muted-foreground">/{maxScore}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm mb-0.5">نتيجتك النهائية</p>
        <p className={`text-lg font-black ${grade.color}`}>{grade.label}</p>
      </div>
      <div className="w-full max-w-sm flex flex-col gap-2" dir="rtl">
        {history.map((pts, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${pts === 20 ? "bg-emerald-500/15 border-emerald-500/40" : pts === 10 ? "bg-sky-500/15 border-sky-500/40" : pts === 5 ? "bg-amber-500/15 border-amber-500/40" : "bg-rose-500/15 border-rose-500/40"}`}>
              {ptIcon(pts)}
            </span>
            <span className="flex-1 text-xs text-right text-muted-foreground truncate">{SCENARIOS[i].attackName}</span>
            <span className={`text-xs font-mono font-bold shrink-0 ${ptColor(pts)}`}>+{pts}/{MAX_PTS_PER_ROUND}</span>
          </div>
        ))}
      </div>
      <button onClick={onRestart} className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold hover:border-foreground/30 transition-colors">
        <RotateCcw className="h-4 w-4"/> إعادة الاختبار
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
  const [history,    setHistory]    = useState<number[]>([]);
  const [phase,      setPhase]      = useState<Phase>("playing");
  const [lastPts,    setLastPts]    = useState<Pts>(0);
  const [lastFb,     setLastFb]     = useState("");

  function handleHotspot(pts: Pts, fb: string) {
    if (phase !== "playing") return;
    setLastPts(pts);
    setLastFb(fb);
    setScore(s => s + pts);
    setHistory(h => [...h, pts]);
    setPhase("modal");
  }

  function handleNext() {
    const next = roundIdx + 1;
    if (next >= SCENARIOS.length) setPhase("done");
    else { setRoundIdx(next); setPhase("playing"); }
  }

  function handleRestart() {
    setRoundIdx(0); setScore(0); setHistory([]); setPhase("playing");
  }

  const scenario = SCENARIOS[roundIdx];
  const isLast   = roundIdx === SCENARIOS.length - 1;

  if (phase === "done") return <DoneScreen score={score} history={history} onRestart={handleRestart}/>;

  return (
    <div className="flex flex-col gap-3" dir="rtl">
      {/* Header */}
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

      <HotspotHint/>

      {/* Simulator + modal overlay */}
      <div className="relative">
        {phase === "modal" && (
          <ResultModal points={lastPts} attackName={scenario.attackName} feedback={lastFb} isLast={isLast} onNext={handleNext}/>
        )}
        {roundIdx === 0 && <EmailSim        onHotspot={handleHotspot}/>}
        {roundIdx === 1 && <SmsSim          onHotspot={handleHotspot}/>}
        {roundIdx === 2 && <VishingSim      onHotspot={handleHotspot}/>}
        {roundIdx === 3 && <BaitingSim      onHotspot={handleHotspot}/>}
        {roundIdx === 4 && <ScarewareSim    onHotspot={handleHotspot}/>}
        {roundIdx === 5 && <CeoFraudSim     onHotspot={handleHotspot}/>}
        {roundIdx === 6 && <EvilTwinSim     onHotspot={handleHotspot}/>}
        {roundIdx === 7 && <CloudSpoofSim   onHotspot={handleHotspot}/>}
        {roundIdx === 8 && <LinkedinPhishSim onHotspot={handleHotspot}/>}
        {roundIdx === 9 && <TailgatingSim   onHotspot={handleHotspot}/>}
      </div>
    </div>
  );
}
