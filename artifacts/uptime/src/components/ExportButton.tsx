import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  targetId: string;
  filename: string;
}

const LOGO_URL = `${import.meta.env.BASE_URL}uptime-logo.png`;

async function toDataUrl(src: string): Promise<string> {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

export function ExportButton({ targetId, filename }: ExportButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;

    setBusy(true);

    const logoDataUrl = await toDataUrl(LOGO_URL);

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules).map((r) => r.cssText).join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");

    const printWindow = window.open("", "_blank");
    if (!printWindow) { setBusy(false); return; }

    const date = new Date().toLocaleDateString("ar-SA", {
      year: "numeric", month: "long", day: "numeric",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>${filename.replace(".pdf", "")}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            ${styles}
            * { box-sizing: border-box; }
            body {
              font-family: 'Cairo', sans-serif;
              background: #fff;
              color: #111;
              padding: 32px 40px;
              direction: rtl;
              font-size: 14px;
            }
            .no-print { display: none !important; }
            /* ── PDF Header ── */
            .pdf-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #111;
              padding-bottom: 14px;
              margin-bottom: 28px;
            }
            .pdf-header img {
              height: 36px;
              width: auto;
              filter: invert(1);     /* logo is white, invert → black for white paper */
            }
            .pdf-header-text {
              text-align: left;
              font-size: 12px;
              color: #555;
              line-height: 1.5;
            }
            .pdf-header-text strong {
              font-size: 15px;
              color: #111;
              display: block;
            }
            @media print {
              body { padding: 16px; }
            }
          </style>
        </head>
        <body>
          <!-- ── Logo header ── -->
          <div class="pdf-header">
            ${logoDataUrl ? `<img src="${logoDataUrl}" alt="UPTIME" />` : `<strong style="font-size:20px;font-family:monospace;">UPTIME</strong>`}
            <div class="pdf-header-text">
              <strong>تقرير تحليل الأمن السيبراني</strong>
              <span>${date}</span>
              <span>منصة UPTIME — أمن الشبكات</span>
            </div>
          </div>

          <!-- ── Report content ── -->
          ${el.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      setBusy(false);
    }, 700);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={busy}
      data-testid="button-export-pdf"
      className="gap-2 no-print"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      تحميل التقرير PDF
    </Button>
  );
}
