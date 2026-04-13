import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useUrlSafetyCheck, getUrlSafetyCheckQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function UrlSafetyTool() {
  const [inputValue, setInputValue] = useState("");
  const [url, setUrl] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useUrlSafetyCheck(
    { url: url! },
    { query: { enabled: !!url, queryKey: getUrlSafetyCheckQueryKey({ url: url! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUrl(inputValue.trim());
    }
  };

  return (
    <div className="space-y-6" id="url-report">
      <form onSubmit={handleSubmit} className="flex gap-4 max-w-xl">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="أدخل الرابط (URL)..."
          data-testid="input-url"
          className="flex-1"
          dir="ltr"
        />
        <Button type="submit" disabled={isLoading} data-testid="button-submit-url">
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
            <h3 className="text-lg font-bold text-primary">سلامة الرابط</h3>
            <ExportButton targetId="url-report" filename={`url-safety.pdf`} />
          </div>

          <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              {data.safe ? (
                <div className="flex items-center gap-3 bg-green-500/10 text-green-500 px-4 py-3 rounded-md border border-green-500/20 w-full">
                  <ShieldCheck className="h-6 w-6" />
                  <span className="text-lg font-bold">الرابط آمن</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-destructive/10 text-destructive px-4 py-3 rounded-md border border-destructive/20 w-full">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="text-lg font-bold">تحذير: الرابط غير آمن</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {data.score !== undefined && (
                <div>
                  <span className="text-muted-foreground block mb-2">درجة الخطورة:</span>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${data.safe ? 'bg-green-500' : 'bg-destructive'}`} 
                      style={{ width: `${100 - (data.score || 0)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {data.threats && data.threats.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-destructive mb-3 border-b border-border pb-2">التهديدات المكتشفة:</h4>
                  <ul className="list-disc list-inside text-destructive space-y-1 pr-4">
                    {data.threats.map((threat, idx) => (
                      <li key={idx}>{threat}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.categories && data.categories.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-primary mb-3">التصنيفات:</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.categories.map((cat, idx) => (
                      <Badge key={idx} variant="outline" className="bg-primary/5">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
