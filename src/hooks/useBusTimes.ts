import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useUser } from "./useUser";

export function useBusTimes(routeId: string) {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!currentUser) return null;
    setLoading(true);
    setError(null);
    try {
      const result = await api.scrapeTimes(currentUser, routeId);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la scanare");
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, routeId]);

  return { refetch, loading, error };
}
