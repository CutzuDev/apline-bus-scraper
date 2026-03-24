import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScrapeLine } from "@/hooks/useScrapeLine";
import { useRoutes } from "@/hooks/useRoutes";
import { DirectionToggle } from "@/components/DirectionToggle";
import { StationPicker } from "@/components/StationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Route } from "@/lib/api";

export function AddLinePage() {
  const navigate = useNavigate();
  const { scrape, metadataDus, metadataIntors, loading: scraping, error: scrapeError } = useScrapeLine();
  const { addRoute } = useRoutes();

  const [routeNumber, setRouteNumber] = useState("");
  const [direction, setDirection] = useState<"dus" | "intors">("dus");
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMetadata = direction === "intors" ? metadataIntors : metadataDus;

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    if (!routeNumber.trim()) return;
    setSelectedStation(null);
    await scrape(routeNumber.trim().toLowerCase());
  }

  async function handleAddRoute() {
    if (selectedStation === null || !currentMetadata) return;

    const station = currentMetadata.stations[selectedStation];
    const num = routeNumber.trim().toLowerCase();
    const linkMatch = station.link.match(/line_[^_]+_(\d+)_cl/);
    const stationSlug = linkMatch ? linkMatch[1] : String(selectedStation + 1);

    const newRoute: Route = {
      id: `${num}-${stationSlug}-${direction}`,
      routeNumber: num,
      direction,
      stationName: station.name,
      stationSlug,
      url: station.link,
      directionFrom: currentMetadata.stations[0]?.name,
      directionTo: currentMetadata.stations[currentMetadata.stations.length - 1]?.name,
    };

    setAdding(true);
    setError(null);
    try {
      await addRoute(newRoute);
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la adaugarea rutei");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-foreground">Adauga linie noua</h1>

      {/* Step 1 */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pasul 1 — Numarul liniei
        </p>
        <form onSubmit={handleScrape} className="flex gap-2">
          <Input
            placeholder="ex: 23b, 5, 12"
            value={routeNumber}
            onChange={(e) => setRouteNumber(e.target.value)}
            disabled={scraping}
          />
          <Button type="submit" disabled={scraping || !routeNumber.trim()}>
            {scraping ? "..." : "Scaneaza"}
          </Button>
        </form>
        {scrapeError && <p className="text-sm text-destructive">{scrapeError}</p>}
      </div>

      {/* Step 2 */}
      {metadataDus && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Pasul 2 — Directie si statie
            </p>
            <p className="font-bold text-foreground">{metadataDus.lineName}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Directie
            </label>
            <DirectionToggle
              selected={direction}
              onChange={(dir) => {
                setDirection(dir);
                setSelectedStation(null);
              }}
            />
          </div>

          {currentMetadata && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Statie ({currentMetadata.stations.length})
                </label>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                    {currentMetadata.stations[0]?.name}
                  </span>
                  <span>→</span>
                  <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium border border-border">
                    {currentMetadata.stations[currentMetadata.stations.length - 1]?.name}
                  </span>
                </div>
              </div>
              <StationPicker
                stations={currentMetadata.stations}
                selectedIndex={selectedStation}
                onSelect={setSelectedStation}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleAddRoute}
            disabled={selectedStation === null || adding}
            className="w-full"
          >
            {adding ? "Se adauga..." : "Adauga ruta"}
          </Button>
        </div>
      )}
    </div>
  );
}
