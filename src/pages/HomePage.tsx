import { useRoutes } from "@/hooks/useRoutes";
import { RouteCard } from "@/components/RouteCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export function HomePage() {
  const { routes, loading } = useRoutes();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-4xl mb-4">—</p>
        <h2 className="text-lg font-bold text-foreground mb-1">Nicio ruta configurata</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Adauga rute de autobuz din dashboard.
        </p>
        <Link to="/dashboard">
          <Button>Mergi la Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {routes.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
