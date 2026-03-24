import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoutes } from "@/hooks/useRoutes";
import { useBusTimes } from "@/hooks/useBusTimes";
import { TimeGrid } from "@/components/TimeGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/lib/time";

export function RoutePage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { routes, loading: routesLoading, deleteRoute, refetch: refetchRoutes } = useRoutes();
  const { refetch, loading: scraping, error } = useBusTimes(routeId!);

  const route = routes.find((r) => r.id === routeId);
  const [busTimes, setBusTimes] = useState<string[]>([]);
  const [cacheTimestamp, setCacheTimestamp] = useState<number | undefined>();

  useEffect(() => {
    if (route) {
      setBusTimes(route.cachedBusTimes ?? []);
      setCacheTimestamp(route.cacheTimestamp);
    }
  }, [route]);

  const handleRefetch = useCallback(async () => {
    const result = await refetch();
    if (result) {
      setBusTimes(result.busTimes);
      setCacheTimestamp(result.timestamp);
      await refetchRoutes();
    }
  }, [refetch, refetchRoutes]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Sigur vrei sa stergi aceasta ruta?")) return;
    await deleteRoute(routeId!);
    navigate("/");
  }, [deleteRoute, routeId, navigate]);

  if (routesLoading) {
    return <Skeleton className="h-64 w-full rounded-xl bg-card" />;
  }

  if (!route) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Ruta nu a fost gasita.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Inapoi acasa</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="text-sm px-3 py-1">{route.routeNumber.toUpperCase()}</Badge>
              <Badge variant="secondary">{route.direction === "dus" ? "Dus" : "Intors"}</Badge>
            </div>
            <h1 className="text-xl font-black text-foreground">{route.stationName}</h1>
            {route.directionFrom && route.directionTo && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {route.directionFrom} → {route.directionTo}
              </p>
            )}
          </div>
        </div>

        {cacheTimestamp && (
          <p className="text-xs text-muted-foreground mb-3">
            Actualizat: {formatTimestamp(cacheTimestamp)}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleRefetch} disabled={scraping} size="sm">
            {scraping ? "Se scaneaza..." : "Reincarca"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Inapoi
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Sterge
          </Button>
        </div>

        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      </div>

      {/* Timetable */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <TimeGrid busTimes={busTimes} />
      </div>

      {/* Siri endpoint */}
      <div className="bg-muted/50 border border-border rounded-xl p-3">
        <p className="text-xs text-muted-foreground font-mono text-center break-all">
          GET /api/next-bus/{route.id}
        </p>
      </div>
    </div>
  );
}
