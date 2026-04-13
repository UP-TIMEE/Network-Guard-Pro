import { Link, useLocation } from "wouter";
import { Moon, Sun, Shield, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const [location] = useLocation();
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("uptime_dark");
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try { localStorage.setItem("uptime_dark", String(dark)); } catch {}
  }, [dark]);

  const navItems = [
    { label: t("nav.home"),     href: "/"         },
    { label: t("nav.tools"),    href: "/tools"    },
    { label: t("nav.training"), href: "/training" },
    { label: t("nav.news"),     href: "/news"     },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo — DOM-first → appears on reading-start (RIGHT in RTL, LEFT in LTR) */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="nav-logo">
            <div className="bg-foreground rounded-lg p-1.5">
              <Shield className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-black text-foreground tracking-widest">UPTIME</span>
          </div>
        </Link>

        {/* Center nav links (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                data-testid={`nav-${item.label}`}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                  location === item.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Controls — DOM-last → appears on reading-end (LEFT in RTL, RIGHT in LTR) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            data-testid="button-theme-toggle"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={dark ? t("nav.lightMode") : t("nav.darkMode")}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            data-testid="button-lang-toggle"
            className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5 cursor-pointer hover:border-primary/50 hover:text-primary transition-colors select-none font-mono"
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                  location === item.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
