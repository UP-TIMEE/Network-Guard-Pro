import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

export function ExportButton({ targetId, filename }: { targetId: string; filename: string }) {
  const handleExport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    
    // Add custom arabic font to jsPDF here if needed, but for simplicity we will use basic text.
    // jsPDF standard doesn't support Arabic natively without custom fonts (VFS).
    // Using window.print is actually safer for full RTL Arabic rendering.
    window.print();
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      data-testid="export-pdf-button"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      تصدير التقرير PDF
    </Button>
  );
}
