import { Link } from "wouter";
import { Home, Wrench, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 font-sans" dir="rtl">

      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.03]">
          <defs>
            <pattern id="grid404" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid404)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">

        {/* Logo */}
        <img
          src={`${base}/uptime-logo.png`}
          alt="UPTIME"
          className="h-7 w-auto dark:invert-0 invert mb-12 opacity-60"
        />

        {/* Error code */}
        <div className="relative mb-6">
          <span className="text-[10rem] leading-none font-black text-foreground/5 select-none absolute inset-0 flex items-center justify-center pointer-events-none">
            404
          </span>
          <div className="relative flex items-center justify-center gap-3 py-6">
            <div className="w-10 h-10 rounded-full border-2 border-destructive/60 flex items-center justify-center">
              <span className="text-destructive font-black text-lg">!</span>
            </div>
            <span className="text-6xl font-black text-foreground tracking-tighter">404</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-black text-foreground mb-3">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-10">
          الرابط الذي طلبته غير موجود أو تم نقله.
          <br />
          <span className="text-xs font-mono opacity-50">Page not found — the requested route does not exist.</span>
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/">
            <button className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02]">
              <Home className="h-4 w-4" />
              الصفحة الرئيسية
            </button>
          </Link>
          <Link href="/tools">
            <button className="inline-flex items-center gap-2 border border-border bg-card text-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-muted transition-all duration-200 hover:scale-[1.02]">
              <Wrench className="h-4 w-4" />
              أدوات الشبكات
            </button>
          </Link>
        </div>

        {/* Decorative nodes */}
        <div className="mt-16 flex items-center gap-2 opacity-20 select-none" aria-hidden>
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`rounded-full bg-foreground ${i === 2 ? "w-3 h-3" : "w-1.5 h-1.5"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
