import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ExportButton } from "@/components/ExportButton";
import { useGeoIpLookup, getGeoIpLookupQueryKey } from "@workspace/api-client-react";
import { AlertTriangle, Globe, MapPin, Building2, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeDomain } from "@/lib/sanitize";
import "leaflet/dist/leaflet.css";

export function GeoIpTool() {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [target, setTarget] = useState<string | undefined>(undefined);
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    import("react-leaflet").then((leaflet) => {
      import("leaflet").then((L) => {
        const icon = L.default.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        L.default.Marker.prototype.options.icon = icon;
        setMapComponents({
          MapContainer: leaflet.MapContainer,
          TileLayer: leaflet.TileLayer,
          Marker: leaflet.Marker,
          Popup: leaflet.Popup,
        });
      });
    });
  }, []);

  const { data, isLoading, error } = useGeoIpLookup(
    { target: target! },
    { query: { enabled: !!target, queryKey: getGeoIpLookupQueryKey({ target: target! }) } }
  );

  useEffect(() => {
    if (data && !isLoading) {
      if (data.isPrivate) {
        toast({ title: "عنوان داخلي", description: "هذا عنوان IP خاص بالشبكة المحلية", variant: "default" });
      } else {
        toast({ title: "✓ تم الفحص بنجاح", description: `${data.city ?? ""} — ${data.country ?? ""}`.replace(/^—\s*/, ""), variant: "default" });
      }
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast({ title: "فشل الفحص", description: "تأكد من صحة عنوان IP أو النطاق", variant: "destructive" });
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeDomain(inputValue);
    if (clean) {
      setTarget(undefined);
      setTimeout(() => setTarget(clean), 10);
    }
  };

  const infoRows = data && !data.isPrivate ? [
    { label: "الدولة", value: data.country, icon: Globe },
    { label: "المدينة", value: data.city, icon: MapPin },
    { label: "مزود الخدمة", value: data.isp, icon: Wifi },
    { label: "المنظمة", value: data.org, icon: Building2 },
    { label: "المنطقة الزمنية", value: data.timezone, icon: null },
    { label: "الإحداثيات", value: data.lat && data.lon ? `${data.lat}, ${data.lon}` : null, icon: null },
  ] : [];

  return (
    <div className="space-y-6" id="geoip-report">
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="8.8.8.8  أو  google.com"
          data-testid="input-geoip"
          className="flex-1 font-mono"
          dir="ltr"
        />
        <Button type="submit" disabled={isLoading} data-testid="button-submit-geoip" className="min-w-[80px]">
          {isLoading ? <Spinner /> : "فحص"}
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>فشل الفحص - تأكد من صحة عنوان IP أو النطاق</span>
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-foreground">
              نتائج الفحص:{" "}
              <span className="font-mono text-primary" dir="ltr">{data.query}</span>
            </h3>
            <ExportButton targetId="geoip-report" filename={`geoip-${data.query}.pdf`} />
          </div>

          {data.isPrivate ? (
            <div className="flex items-start gap-3 p-5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1">عنوان شبكة داخلية (Private IP)</div>
                <div className="text-sm text-yellow-400/80">
                  هذا العنوان ({data.ip}) يتبع النطاق الداخلي ولا يمكن تتبعه على الإنترنت.
                  العناوين الداخلية مثل 192.168.x.x و 10.x.x.x و 172.16.x.x مخصصة للشبكات المحلية فقط.
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="grid grid-cols-1 gap-3">
                {infoRows.map((row) =>
                  row.value ? (
                    <div
                      key={row.label}
                      className="flex items-center justify-between bg-muted/30 border border-border/50 px-4 py-3 rounded-lg"
                    >
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="font-medium text-sm text-foreground" dir="ltr">
                        {row.value}
                      </span>
                    </div>
                  ) : null
                )}
              </div>

              {MapComponents && data.lat && data.lon && (
                <div className="h-64 lg:h-auto min-h-[240px] rounded-xl overflow-hidden border border-border">
                  <MapComponents.MapContainer
                    center={[data.lat, data.lon]}
                    zoom={10}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={true}
                  >
                    <MapComponents.TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapComponents.Marker position={[data.lat, data.lon]}>
                      <MapComponents.Popup>
                        {data.city}, {data.country}
                      </MapComponents.Popup>
                    </MapComponents.Marker>
                  </MapComponents.MapContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
