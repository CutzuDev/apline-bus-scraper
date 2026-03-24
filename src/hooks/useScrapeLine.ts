import { useState, useCallback } from "react";
import { api, type LineMetadata } from "@/lib/api";

export function useScrapeLine() {
  const [metadataDus, setMetadataDus] = useState<LineMetadata | null>(null);
  const [metadataIntors, setMetadataIntors] = useState<LineMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrape = useCallback(async (routeNumber: string) => {
    setLoading(true);
    setError(null);
    setMetadataDus(null);
    setMetadataIntors(null);

    try {
      const dusUrl = `https://www.ratbv.ro/afisaje/${routeNumber}-dus.html`;
      const intorsUrl = `https://www.ratbv.ro/afisaje/${routeNumber}-intors.html`;

      const dus = await api.scrapeLine(dusUrl);
      setMetadataDus(dus);

      try {
        const intors = await api.scrapeLine(intorsUrl);
        setMetadataIntors(intors);
      } catch {
        // Intors might not exist for some lines, use reversed dus
        const reversed: LineMetadata = {
          lineName: dus.lineName,
          stations: [...dus.stations].reverse(),
        };
        setMetadataIntors(reversed);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la scanarea liniei");
    } finally {
      setLoading(false);
    }
  }, []);

  return { scrape, metadataDus, metadataIntors, loading, error };
}
