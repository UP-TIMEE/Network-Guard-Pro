import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useMacVendorLookup, getMacVendorLookupQueryKey } from "@workspace/api-client-react";

export function MacTool() {
  const [inputValue, setInputValue] = useState("");
  const [mac, setMac] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useMacVendorLookup(
    { mac: mac! },
    { query: { enabled: !!mac, queryKey: getMacVendorLookupQueryKey({ mac: mac! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setMac(inputValue.trim());
    }
  };

  return (
    <div className="space-y-6" id="mac-report">
      <form onSubmit={handleSubmit} className="flex gap-4 max-w-xl">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="أدخل عنوان MAC..."
          data-testid="input-mac"
          className="flex-1"
          dir="ltr"
        />
        <Button type="submit" disabled={isLoading} data-testid="button-submit-mac">
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
            <h3 className="text-lg font-bold text-primary">نتائج فحص MAC</h3>
            <ExportButton targetId="mac-report" filename={`mac-${data.mac}.pdf`} />
          </div>

          <div className="bg-muted/50 p-6 rounded-lg border border-border">
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <span className="text-muted-foreground">العنوان:</span>
              <span className="font-mono font-medium" dir="ltr">{data.mac}</span>
              
              <span className="text-muted-foreground">المصنّع:</span>
              <span className="font-bold text-primary" dir="ltr">{data.vendor || "غير معروف"}</span>
              
              <span className="text-muted-foreground">الحالة:</span>
              <span>
                {data.found ? (
                  <span className="text-green-500 font-medium">تم العثور عليه</span>
                ) : (
                  <span className="text-destructive font-medium">لم يتم العثور عليه</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
