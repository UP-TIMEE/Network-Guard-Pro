import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  targetId: string;
  filename: string;
}

export function ExportButton({ targetId, filename }: ExportButtonProps) {
  const handleExport = () => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");

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
              padding: 32px;
              direction: rtl;
              font-size: 14px;
            }
            .no-print { display: none !important; }
            @media print {
              body { padding: 16px; }
            }
          </style>
        </head>
        <body>
          <h2 style="border-bottom:2px solid #222;padding-bottom:8px;margin-bottom:24px;font-size:20px;">
            تقرير UPTIME - ${new Date().toLocaleDateString("ar-SA")}
          </h2>
          ${el.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 600);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      data-testid="button-export-pdf"
      className="gap-2 no-print"
    >
      <Download className="h-4 w-4" />
      تحميل التقرير PDF
    </Button>
  );
}
