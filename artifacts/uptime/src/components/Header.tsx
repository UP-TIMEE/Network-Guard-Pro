import { Link, useLocation } from "wouter";
import { Moon, Sun, Shield, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [location] = useLocation();
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { label: "الرئيسية", href: "/" },
    { label: "أدوات الشبكات", href: "/tools" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side: theme + language */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            data-testid="button-theme-toggle"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="تبديل المظهر"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <span className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5 cursor-pointer hover:border-primary/50 hover:text-primary transition-colors select-none">
            EN
          </span>
        </div>

        {/* Center: nav links (hidden on mobile) */}
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

        {/* Right side: logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="nav-logo">
            <div className="bg-foreground rounded-lg p-1.5">
              <Shield className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-black text-foreground tracking-widest">UPTIME</span>
          </div>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          data-testid="button-mobile-menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
