import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { usePortScan, getPortScanQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Info } from "lucide-react";

export function PortScanTool() {
  const { dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [inputValue, setInputValue] = useState("");
  const [host, setHost] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = usePortScan(
    { host: host! },
    { query: { enabled: !!host, queryKey: getPortScanQueryKey({ host: host! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) setHost(inputValue.trim());
  };

  return (
    <div className="space-y-6" id="port-report">
      <div className="flex items-start gap-3 p-4 bg-primary/8 border border-primary/20 rounded-lg text-primary text-sm">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{isRtl ? "تنبيه: هذا فحص أساسي وسريع للمنافذ الشائعة فقط (80, 443, 22, 21 وغيرها)." : "Note: This is a basic quick scan of common ports only (80, 443, 22, 21 and more)."}</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isRtl ? "أدخل عنوان المضيف..." : "Enter host address..."}
          data-testid="input-port"
          className="flex-1 font-mono"
          dir="ltr"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()} data-testid="button-submit-port" className="min-w-[80px]">
          {isLoading ? <Spinner /> : (isRtl ? "فحص" : "Scan")}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
          {isRtl ? "حدث خطأ أثناء الفحص" : "An error occurred during scanning"}
        </div>
      )}

      {data && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-foreground">
              {isRtl ? "نتائج فحص المنافذ: " : "Port Scan Results: "}
              <span className="text-primary font-mono" dir="ltr">{data.host}</span>
            </h3>
            <ExportButton targetId="port-report" filename={`ports-${data.host}.pdf`} />
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className={isRtl ? "text-right" : "text-left"}>{isRtl ? "المنفذ" : "Port"}</TableHead>
                  <TableHead className={isRtl ? "text-right" : "text-left"}>{isRtl ? "الخدمة" : "Service"}</TableHead>
                  <TableHead className={isRtl ? "text-right" : "text-left"}>{isRtl ? "الحالة" : "Status"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.ports.map((portInfo) => (
                  <TableRow key={portInfo.port}>
                    <TableCell className="font-mono font-bold">{portInfo.port}</TableCell>
                    <TableCell className="font-mono text-muted-foreground text-sm">{portInfo.service}</TableCell>
                    <TableCell>
                      {portInfo.open ? (
                        <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">
                          {isRtl ? "مفتوح" : "Open"}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20">
                          {isRtl ? "مغلق" : "Closed"}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {data.ports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      {isRtl ? "لم يتم العثور على منافذ" : "No ports found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
