import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { usePortScan, getPortScanQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function PortScanTool() {
  const [inputValue, setInputValue] = useState("");
  const [host, setHost] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = usePortScan(
    { host: host! },
    { query: { enabled: !!host, queryKey: getPortScanQueryKey({ host: host! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setHost(inputValue.trim());
    }
  };

  return (
    <div className="space-y-6" id="port-report">
      <Alert className="bg-primary/10 border-primary/20 text-primary">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          تنبيه: هذا فحص أساسي وسريع للمنافذ الشائعة فقط (80, 443, 22, 21 وغيرها).
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="flex gap-4 max-w-xl">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="أدخل عنوان المضيف..."
          data-testid="input-port"
          className="flex-1"
          dir="ltr"
        />
        <Button type="submit" disabled={isLoading} data-testid="button-submit-port">
          {isLoading ? <Spinner className="ml-2" /> : null}
          فحص
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
          حدث خطأ أثناء الفحص
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">نتائج فحص المنافذ: <span dir="ltr">{data.host}</span></h3>
            <ExportButton targetId="port-report" filename={`ports-${data.host}.pdf`} />
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="text-right">المنفذ</TableHead>
                  <TableHead className="text-right">الخدمة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.ports.map((portInfo) => (
                  <TableRow key={portInfo.port}>
                    <TableCell className="font-mono">{portInfo.port}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{portInfo.service}</TableCell>
                    <TableCell>
                      {portInfo.open ? (
                        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">مفتوح</Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">مغلق</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {data.ports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      لم يتم العثور على منافذ
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
