import { useRoutes } from "@/hooks/useRoutes";
import { RouteCard } from "@/components/RouteCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { routes, loading, deleteRoute } = useRoutes();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">Dashboard</h1>
        <Link to="/add-line">
          <Button size="sm">+ Adauga linie</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[88px] w-full rounded-xl bg-card" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Nu ai nicio ruta salvata.
          </p>
          <Link to="/add-line">
            <Button>Adauga prima ruta</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              showDelete
              onDelete={async () => {
                if (confirm(`Stergi ${route.routeNumber.toUpperCase()} - ${route.stationName}?`)) {
                  await deleteRoute(route.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
