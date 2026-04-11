import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useSslCheck, getSslCheckQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

export function SslTool() {
  const [inputValue, setInputValue] = useState("");
  const [domain, setDomain] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useSslCheck(
    { domain: domain! },
    { query: { enabled: !!domain, queryKey: getSslCheckQueryKey({ domain: domain! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setDomain(inputValue.trim());
    }
  };

  return (
    <div className="space-y-6" id="ssl-report">
      <form onSubmit={handleSubmit} className="flex gap-4 max-w-xl">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="أدخل اسم النطاق..."
          data-testid="input-ssl"
          className="flex-1"
          dir="ltr"
        />
        <Button type="submit" disabled={isLoading} data-testid="button-submit-ssl">
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
            <h3 className="text-lg font-bold text-primary">الشهادة الأمنية: <span dir="ltr">{data.domain}</span></h3>
            <ExportButton targetId="ssl-report" filename={`ssl-${data.domain}.pdf`} />
          </div>

          <div className="bg-muted/20 border border-border p-6 rounded-lg space-y-6">
            <div className="flex items-center gap-4 border-b border-border pb-4">
              <span className="text-lg font-semibold">حالة الشهادة:</span>
              {data.valid && !data.expired ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-sm py-1 px-3">صالحة وموثوقة</Badge>
              ) : (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-sm py-1 px-3">غير صالحة أو منتهية</Badge>
              )}
              {data.selfSigned && (
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">توقيع ذاتي</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">مصدر الشهادة (Issuer)</div>
                <div className="font-medium" dir="ltr">{data.issuer || "غير متوفر"}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">البروتوكول</div>
                <div className="font-medium font-mono" dir="ltr">{data.protocol || "غير متوفر"}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">تاريخ الإصدار</div>
                <div className="font-medium" dir="ltr">{data.validFrom || "غير متوفر"}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">تاريخ الإنتهاء</div>
                <div className="font-medium text-primary" dir="ltr">{data.validTo || "غير متوفر"}</div>
              </div>

              {data.daysRemaining !== undefined && (
                <div className="md:col-span-2 bg-primary/5 border border-primary/20 p-4 rounded-md">
                  <div className="text-sm text-primary mb-1">الأيام المتبقية لانتهاء الصلاحية</div>
                  <div className="text-2xl font-bold text-primary">{data.daysRemaining} <span className="text-sm font-normal">يوم</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
