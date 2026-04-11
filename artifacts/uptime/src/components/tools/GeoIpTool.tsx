import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useGeoIpLookup, getGeoIpLookupQueryKey } from "@workspace/api-client-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export function GeoIpTool() {
  const [inputValue, setInputValue] = useState("");
  const [target, setTarget] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useGeoIpLookup(
    { target: target! },
    { query: { enabled: !!target, queryKey: getGeoIpLookupQueryKey({ target: target! }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTarget(inputValue.trim());
    }
  };

  return (
    <div className="space-y-6" id="geoip-report">
      <form onSubmit={handleSubmit} className="flex gap-4 max-w-xl">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="أدخل عنوان IP أو النطاق..."
          data-testid="input-geoip"
          className="flex-1"
          dir="ltr"
        />
        <Button type="submit" disabled={isLoading} data-testid="button-submit-geoip">
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
            <h3 className="text-lg font-bold text-primary">نتائج الفحص لـ {data.query}</h3>
            <ExportButton targetId="geoip-report" filename={`geoip-${data.query}.pdf`} />
          </div>

          {data.isPrivate ? (
            <div className="p-4 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md font-semibold">
              عنوان داخلي - لا يمكن تتبعه خارجياً
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 bg-muted/50 p-4 rounded-lg">
                  <span className="text-muted-foreground">الدولة</span>
                  <span className="font-medium">{data.country || "غير متوفر"}</span>
                  
                  <span className="text-muted-foreground">المدينة</span>
                  <span className="font-medium">{data.city || "غير متوفر"}</span>
                  
                  <span className="text-muted-foreground">مزود الخدمة</span>
                  <span className="font-medium" dir="ltr">{data.isp || "غير متوفر"}</span>
                  
                  <span className="text-muted-foreground">المنظمة</span>
                  <span className="font-medium" dir="ltr">{data.org || "غير متوفر"}</span>
                </div>
              </div>
              
              {data.lat && data.lon && (
                <div className="h-[300px] rounded-lg overflow-hidden border border-border">
                  <MapContainer center={[data.lat, data.lon]} zoom={10} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[data.lat, data.lon]}>
                      <Popup>{data.city}, {data.country}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
