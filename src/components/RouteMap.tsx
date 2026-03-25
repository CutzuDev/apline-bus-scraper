import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface StopPoint {
  name: string;
  lat: number;
  lng: number;
}

interface MapRouteData {
  polyline: [number, number][];
  stops: StopPoint[];
  relationId: number;
}

interface RouteMapProps {
  routeNumber: string;
  direction: string;
  stationName: string;
  directionFrom?: string;
  directionTo?: string;
}

function stopWords(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/ă/g, "a").replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/ș/g, "s").replace(/ş/g, "s")
    .replace(/ț/g, "t").replace(/ţ/g, "t")
    .replace(/[^a-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(w => w.length >= 3);
}

function matchesStop(osmName: string, ratbvName: string): boolean {
  const osmWords = new Set(stopWords(osmName));
  return stopWords(ratbvName).some(w => osmWords.has(w));
}

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      map.fitBounds(coords, { padding: [20, 20] });
    }
  }, [map, coords]);
  return null;
}

export function RouteMap({ routeNumber, direction, stationName, directionFrom, directionTo }: RouteMapProps) {
  const [data, setData] = useState<MapRouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ line: routeNumber, direction });
    if (directionFrom) params.set("from", directionFrom);
    if (directionTo) params.set("to", directionTo);

    fetch(`/api/map-route?${params}`)
      .then((res) => {
        if (!res.ok) return res.json().then((e) => { throw new Error(e.error ?? "Eroare"); });
        return res.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [routeNumber, direction, directionFrom, directionTo]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm animate-pulse">
        Se incarca harta...
      </div>
    );
  }

  if (error || !data || data.polyline.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-muted-foreground text-xs">
        Harta indisponibila
      </div>
    );
  }

  const trackedStop = data.stops.find((s) => matchesStop(s.name, stationName));

  return (
    <div className="rounded-xl overflow-hidden" style={{ height: 280 }}>
      <MapContainer
        center={data.polyline[Math.floor(data.polyline.length / 2)]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitBounds coords={data.polyline} />

        {/* Route polyline */}
        <Polyline
          positions={data.polyline}
          pathOptions={{ color: "#52b4ff", weight: 4, opacity: 0.85 }}
        />

        {/* Stop markers — skip the tracked stop so the orange marker stands out */}
        {data.stops.map((stop, i) => stop === trackedStop ? null : (
          <CircleMarker
            key={i}
            center={[stop.lat, stop.lng]}
            radius={4}
            pathOptions={{
              color: "#52b4ff",
              fillColor: "#111111",
              fillOpacity: 1,
              weight: 2,
            }}
          >
            {stop.name && <Tooltip direction="top" offset={[0, -4]}>{stop.name}</Tooltip>}
          </CircleMarker>
        ))}

        {/* Tracked station highlight */}
        {trackedStop && (
          <CircleMarker
            center={[trackedStop.lat, trackedStop.lng]}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#ff7300",
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent>
              {trackedStop.name || stationName}
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
