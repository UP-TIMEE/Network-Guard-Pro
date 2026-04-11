import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useDnsLookup, getDnsLookupQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function DnsTool() {
  const [inputValue, setInputValue] = useState("");
  const [domain, setDomain] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useDnsLookup(
    { domain: domain! },
    { query: { enabled: !!domain, queryKey: getDnsLookupQueryKey({ domain: domain! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setDomain(inputValue.trim());
    }
  };

  return (
    <div className="space-y-6" id="dns-report">
      <form onSubmit={handleSubmit} className="flex gap-4 max-w-xl">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="أدخل اسم النطاق..."
          data-testid="input-dns"
          className="flex-1"
          dir="ltr"
        />
        <Button type="submit" disabled={isLoading} data-testid="button-submit-dns">
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
            <h3 className="text-lg font-bold text-primary">سجلات النطاق: <span dir="ltr">{data.domain}</span></h3>
            <ExportButton targetId="dns-report" filename={`dns-${data.domain}.pdf`} />
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="text-right">النوع (Type)</TableHead>
                  <TableHead className="text-right">القيمة (Value)</TableHead>
                  <TableHead className="text-right">زمن البقاء (TTL)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((rec, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{rec.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-left" dir="ltr">{rec.value}</TableCell>
                    <TableCell>{rec.ttl}</TableCell>
                  </TableRow>
                ))}
                {data.records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      لم يتم العثور على سجلات
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
