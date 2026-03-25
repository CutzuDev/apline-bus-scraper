import { useState, useEffect, useCallback } from "react";
import { api, type Route } from "@/lib/api";
import { useUser } from "./useUser";

export function useRoutes() {
  const { currentUser } = useUser();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    if (!currentUser) {
      setRoutes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.getRoutes(currentUser);
      setRoutes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la incarcarea rutelor");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const addRoute = useCallback(
    async (route: Route) => {
      if (!currentUser) return;
      await api.addRoute(currentUser, route);
      await fetchRoutes();
    },
    [currentUser, fetchRoutes]
  );

  const deleteRoute = useCallback(
    async (id: string) => {
      if (!currentUser) return;
      await api.deleteRoute(currentUser, id);
      await fetchRoutes();
    },
    [currentUser, fetchRoutes]
  );

  const reorderRoutes = useCallback(
    async (newRoutes: Route[]) => {
      if (!currentUser) return;
      setRoutes(newRoutes); // optimistic update
      try {
        await api.reorderRoutes(currentUser, newRoutes.map(r => r.id));
      } catch {
        await fetchRoutes(); // revert on failure
      }
    },
    [currentUser, fetchRoutes]
  );

  return { routes, loading, error, addRoute, deleteRoute, reorderRoutes, refetch: fetchRoutes };
}
