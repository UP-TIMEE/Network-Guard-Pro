import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useWhoisLookup, getWhoisLookupQueryKey } from "@workspace/api-client-react";

export function WhoisTool() {
  const [inputValue, setInputValue] = useState("");
  const [domain, setDomain] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useWhoisLookup(
    { domain: domain! },
    { query: { enabled: !!domain, queryKey: getWhoisLookupQueryKey({ domain: domain! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setDomain(inputValue.trim());
    }
  };

  return (
    <div className="space-y-6" id="whois-report">
      <form onSubmit={handleSubmit} className="flex gap-4 max-w-xl">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="أدخل اسم النطاق..."
          data-testid="input-whois"
          className="flex-1"
          dir="ltr"
        />
        <Button type="submit" disabled={isLoading} data-testid="button-submit-whois">
          {isLoading ? <Spinner className="ms-2" /> : null}
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
            <h3 className="text-lg font-bold text-primary">معلومات النطاق: <span dir="ltr">{data.domain}</span></h3>
            <ExportButton targetId="whois-report" filename={`whois-${data.domain}.pdf`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">المسجل</div>
              <div className="font-medium" dir="ltr">{data.registrar || "غير متوفر"}</div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">صاحب التسجيل</div>
              <div className="font-medium" dir="ltr">{data.registrant || "مخفي لحماية الخصوصية"}</div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">تاريخ الإنشاء</div>
              <div className="font-medium" dir="ltr">{data.createdDate || "غير متوفر"}</div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">تاريخ الإنتهاء</div>
              <div className="font-medium text-primary" dir="ltr">{data.expiryDate || "غير متوفر"}</div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">الحالة</div>
              <div className="font-medium" dir="ltr">{data.status || "غير متوفر"}</div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">خوادم الأسماء</div>
              <div className="font-mono text-sm space-y-1" dir="ltr">
                {data.nameservers?.map(ns => <div key={ns}>{ns}</div>) || "غير متوفر"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
