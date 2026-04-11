import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExportButton } from "@/components/ExportButton";
import { CheckCircle, AlertTriangle, Clock, Server } from "lucide-react";

interface Hop {
  from: string;
  by: string;
  date: string;
  delay: string;
  raw: string;
}

interface ParsedHeader {
  from: string;
  to: string;
  subject: string;
  date: string;
  messageId: string;
  returnPath: string;
  spf: string;
  dkim: string;
  dmarc: string;
  xSpamScore: string;
  hops: Hop[];
  warnings: string[];
}

function parseEmailHeaders(raw: string): ParsedHeader {
  const get = (pattern: RegExp): string => {
    const m = raw.match(pattern);
    return m ? m[1].trim() : "";
  };

  const fromField = get(/^From:\s*(.+)$/im);
  const toField = get(/^To:\s*(.+)$/im);
  const subject = get(/^Subject:\s*(.+)$/im);
  const date = get(/^Date:\s*(.+)$/im);
  const messageId = get(/^Message-ID:\s*(.+)$/im);
  const returnPath = get(/^Return-Path:\s*(.+)$/im);
  const spf = get(/spf=([^\s;]+)/i);
  const dkim = get(/dkim=([^\s;]+)/i);
  const dmarc = get(/dmarc=([^\s;]+)/i);
  const xSpamScore = get(/X-Spam-Score:\s*(.+)$/im) || get(/X-SpamScore:\s*(.+)$/im);

  const receivedBlocks = raw.match(/^Received:[\s\S]*?(?=^[A-Za-z]|\n\n|$)/gim) || [];
  const hops: Hop[] = receivedBlocks.slice(0, 10).map((block, i) => {
    const fromMatch = block.match(/from\s+([^\s]+)/i);
    const byMatch = block.match(/by\s+([^\s]+)/i);
    const dateMatch = block.match(/;\s*(.+)$/im);
    const from = fromMatch ? fromMatch[1] : "غير معروف";
    const by = byMatch ? byMatch[1] : "غير معروف";
    const dateStr = dateMatch ? dateMatch[1].trim() : "";
    const delay = i > 0 && dateStr ? "—" : "";
    return { from, by, date: dateStr, delay, raw: block.slice(0, 120) + "..." };
  });

  const warnings: string[] = [];
  if (!spf || spf.toLowerCase() === "fail") warnings.push("SPF فشل أو غير موجود");
  if (!dkim || dkim.toLowerCase() === "fail") warnings.push("DKIM فشل أو غير موجود");
  if (!dmarc || dmarc.toLowerCase() === "fail") warnings.push("DMARC فشل أو غير موجود");
  if (xSpamScore && parseFloat(xSpamScore) > 5) warnings.push(`درجة الـ Spam مرتفعة: ${xSpamScore}`);
  if (hops.length > 8) warnings.push("عدد كبير من التحويلات - مشبوه");
  if (fromField && returnPath && !returnPath.includes(fromField.replace(/.*<|>.*/g, ""))) {
    warnings.push("عنوان Return-Path لا يتطابق مع المرسل");
  }

  return { from: fromField, to: toField, subject, date, messageId, returnPath, spf, dkim, dmarc, xSpamScore, hops, warnings };
}

const SAMPLE = `From: sender@example.com
To: recipient@domain.com
Subject: Test Email
Date: Mon, 1 Jan 2024 12:00:00 +0000
Message-ID: <abc123@example.com>
Return-Path: <sender@example.com>
Received: from mail.example.com (mail.example.com [203.0.113.1])
  by mx.domain.com with ESMTP; Mon, 1 Jan 2024 12:00:00 +0000
Received: from client.example.com ([192.168.1.1])
  by mail.example.com with SMTP; Mon, 1 Jan 2024 11:59:55 +0000
Authentication-Results: mx.domain.com;
  spf=pass smtp.mailfrom=example.com;
  dkim=pass header.d=example.com;
  dmarc=pass action=none header.from=example.com
X-Spam-Score: 0.1`;

export function EmailHeaderTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ParsedHeader | null>(null);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setResult(parseEmailHeaders(input));
  };

  const authBadge = (val: string, label: string) => {
    const status = val.toLowerCase();
    const isPass = status === "pass";
    const isNone = status === "none" || !val;
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
        isPass ? "bg-green-500/10 border-green-500/20 text-green-400" :
        isNone ? "bg-muted/30 border-border/50 text-muted-foreground" :
        "bg-destructive/10 border-destructive/20 text-destructive"
      }`}>
        {isPass ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        <span className="font-mono text-xs">{label}</span>
        <span className="font-bold">{val || (isRtl ? "غير موجود" : "None")}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="email-header-report">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {isRtl ? "الصق ترويسة الإيميل (Headers) هنا:" : "Paste email headers here:"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRtl ? "الصق محتوى الترويسة هنا..." : "Paste raw email headers here..."}
          className="w-full h-44 bg-input border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          dir="ltr"
          data-testid="textarea-email-header"
        />
        <div className="flex gap-2">
          <Button onClick={handleAnalyze} data-testid="button-analyze-email">
            {isRtl ? "تحليل الترويسة" : "Analyze Headers"}
          </Button>
          <Button variant="outline" onClick={() => setInput(SAMPLE)} className="text-xs">
            {isRtl ? "مثال" : "Sample"}
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">{isRtl ? "نتائج التحليل" : "Analysis Results"}</h3>
            <ExportButton targetId="email-header-report" filename="email-header-analysis.pdf" />
          </div>

          {result.warnings.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                {isRtl ? "تحذيرات أمنية" : "Security Warnings"}
              </div>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-destructive flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" /> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {authBadge(result.spf, "SPF")}
            {authBadge(result.dkim, "DKIM")}
            {authBadge(result.dmarc, "DMARC")}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: isRtl ? "المرسل" : "From", value: result.from },
              { label: isRtl ? "المستلم" : "To", value: result.to },
              { label: isRtl ? "الموضوع" : "Subject", value: result.subject },
              { label: isRtl ? "التاريخ" : "Date", value: result.date },
              { label: isRtl ? "معرف الرسالة" : "Message-ID", value: result.messageId },
              { label: isRtl ? "عنوان الإرجاع" : "Return-Path", value: result.returnPath },
              ...(result.xSpamScore ? [{ label: "Spam Score", value: result.xSpamScore }] : []),
            ].filter(r => r.value).map((row) => (
              <div key={row.label} className="flex items-start justify-between bg-muted/30 border border-border/50 px-4 py-3 rounded-lg gap-2">
                <span className="text-sm text-muted-foreground shrink-0">{row.label}</span>
                <span className="text-sm text-foreground font-mono break-all text-left" dir="ltr">{row.value}</span>
              </div>
            ))}
          </div>

          {result.hops.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Server className="h-4 w-4" />
                {isRtl ? `مسار التوجيه (${result.hops.length} محطة)` : `Routing Path (${result.hops.length} hops)`}
              </h4>
              <div className="space-y-2">
                {result.hops.map((hop, i) => (
                  <div key={i} className="bg-muted/20 border border-border/40 rounded-lg px-4 py-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{i + 1}</span>
                      <Clock className="h-3 w-3" />
                      <span dir="ltr">{hop.date || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{isRtl ? "من:" : "from:"}</span>
                      <span className="font-mono text-foreground" dir="ltr">{hop.from}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{isRtl ? "إلى:" : "by:"}</span>
                      <span className="font-mono text-foreground" dir="ltr">{hop.by}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
