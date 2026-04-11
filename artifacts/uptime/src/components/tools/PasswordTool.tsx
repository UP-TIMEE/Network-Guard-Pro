import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StrengthResult {
  score: number;
  level: number;
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
  suggestions: string[];
  entropy: number;
}

function analyzePassword(password: string, isRtl: boolean): StrengthResult {
  const checks = [
    { label: isRtl ? "8 أحرف على الأقل" : "At least 8 characters", passed: password.length >= 8 },
    { label: isRtl ? "12 حرفاً أو أكثر (مثالي)" : "12+ characters (ideal)", passed: password.length >= 12 },
    { label: isRtl ? "أحرف كبيرة (A-Z)" : "Uppercase letters (A-Z)", passed: /[A-Z]/.test(password) },
    { label: isRtl ? "أحرف صغيرة (a-z)" : "Lowercase letters (a-z)", passed: /[a-z]/.test(password) },
    { label: isRtl ? "أرقام (0-9)" : "Numbers (0-9)", passed: /\d/.test(password) },
    { label: isRtl ? "رموز خاصة (!@#$...)" : "Special characters (!@#$...)", passed: /[^a-zA-Z0-9]/.test(password) },
    { label: isRtl ? "لا تكرار واضح" : "No obvious repetition", passed: !/(.)\1{2,}/.test(password) },
    { label: isRtl ? "لا تسلسل بسيط" : "No simple sequences", passed: !/(?:abc|123|qwerty|password|admin|letmein)/i.test(password) },
  ];

  const passed = checks.filter((c) => c.passed).length;
  let score = 0;
  if (password.length >= 8) score += 15;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  if (!/(.)\1{2,}/.test(password)) score += 5;
  if (!/(?:abc|123|qwerty|password|admin|letmein)/i.test(password)) score += 5;
  score = Math.min(100, score);
  if (!password) score = 0;

  const charset = (
    (/[a-z]/.test(password) ? 26 : 0) +
    (/[A-Z]/.test(password) ? 26 : 0) +
    (/\d/.test(password) ? 10 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 33 : 0)
  );
  const entropy = charset > 0 ? Math.round(password.length * Math.log2(charset)) : 0;

  let level = 0, label = "", color = "";
  if (!password) { level = 0; label = ""; color = "bg-muted"; }
  else if (score < 30) { level = 1; label = isRtl ? "ضعيفة جداً" : "Very Weak"; color = "bg-destructive"; }
  else if (score < 50) { level = 2; label = isRtl ? "ضعيفة" : "Weak"; color = "bg-orange-500"; }
  else if (score < 70) { level = 3; label = isRtl ? "متوسطة" : "Moderate"; color = "bg-yellow-500"; }
  else if (score < 90) { level = 4; label = isRtl ? "قوية" : "Strong"; color = "bg-green-400"; }
  else { level = 5; label = isRtl ? "قوية جداً" : "Very Strong"; color = "bg-green-500"; }

  const suggestions: string[] = [];
  if (password.length < 8) suggestions.push(isRtl ? "استخدم 8 أحرف على الأقل" : "Use at least 8 characters");
  if (password.length < 12) suggestions.push(isRtl ? "زيادة الطول إلى 12+ حرفاً يقوي كلمة المرور" : "Increase length to 12+ for better security");
  if (!/[A-Z]/.test(password)) suggestions.push(isRtl ? "أضف أحرفاً كبيرة" : "Add uppercase letters");
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push(isRtl ? "أضف رموزاً خاصة مثل: !@#$%" : "Add special characters like !@#$%");
  if (/(.)\1{2,}/.test(password)) suggestions.push(isRtl ? "تجنب تكرار الأحرف" : "Avoid repeating characters");

  return { score, level, label, color, checks, suggestions, entropy };
}

function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()-_=+[]{}|;:,.<>?";
  const all = upper + lower + digits + special;
  const arr = Array.from({ length: 16 }, (_, i) => {
    if (i === 0) return upper[Math.floor(Math.random() * upper.length)];
    if (i === 1) return lower[Math.floor(Math.random() * lower.length)];
    if (i === 2) return digits[Math.floor(Math.random() * digits.length)];
    if (i === 3) return special[Math.floor(Math.random() * special.length)];
    return all[Math.floor(Math.random() * all.length)];
  });
  return arr.sort(() => Math.random() - 0.5).join("");
}

export function PasswordTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const result = analyzePassword(password, isRtl);

  const handleGenerate = useCallback(() => {
    setPassword(generatePassword());
    setShowPassword(true);
  }, []);

  const strengthBars = Array.from({ length: 5 }, (_, i) => (
    <div
      key={i}
      className={`h-2 flex-1 rounded-full transition-all duration-500 ${
        i < result.level ? result.color : "bg-muted"
      }`}
    />
  ));

  return (
    <div className="space-y-6" id="password-report">
      <div className="space-y-3 max-w-xl">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isRtl ? "اكتب كلمة المرور هنا..." : "Type your password here..."}
            data-testid="input-password"
            className="font-mono pr-10 text-base"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button variant="outline" onClick={handleGenerate} className="gap-2 text-sm" data-testid="button-generate-password">
          <RefreshCw className="h-3.5 w-3.5" />
          {isRtl ? "توليد كلمة مرور قوية" : "Generate Strong Password"}
        </Button>
      </div>

      {password && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">{result.label}</span>
              <span className="text-xs text-muted-foreground font-mono">{result.score}/100</span>
            </div>
            <div className="flex gap-1">{strengthBars}</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: isRtl ? "الطول" : "Length", value: password.length },
              { label: isRtl ? "الإنتروبيا" : "Entropy", value: `${result.entropy} bits` },
              { label: isRtl ? "الدرجة" : "Score", value: `${result.score}%` },
              { label: isRtl ? "المستوى" : "Level", value: `${result.level}/5` },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 text-center">
                <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                <div className="font-bold text-foreground font-mono">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.checks.map((check) => (
              <div key={check.label} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                check.passed ? "text-green-400" : "text-muted-foreground"
              }`}>
                {check.passed
                  ? <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  : <XCircle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                }
                {check.label}
              </div>
            ))}
          </div>

          {result.suggestions.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-semibold text-yellow-400">{isRtl ? "اقتراحات التحسين" : "Improvement Suggestions"}</h4>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-yellow-400/90 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
