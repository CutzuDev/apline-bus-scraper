import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { type Route } from "@/lib/api";
import { getNextBus } from "@/lib/time";

interface RouteCardProps {
  route: Route;
  showDelete?: boolean;
  onDelete?: () => void;
}

export function RouteCard({ route, showDelete, onDelete }: RouteCardProps) {
  const nextBus = route.cachedBusTimes ? getNextBus(route.cachedBusTimes) : null;

  return (
    <Link to={`/route/${route.id}`} className="block">
      <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors active:scale-[0.99]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge>{route.routeNumber.toUpperCase()}</Badge>
              <Badge variant="secondary">
                {route.direction === "dus" ? "Dus" : "Intors"}
              </Badge>
            </div>
            <p className="font-semibold text-foreground truncate">{route.stationName}</p>
            {route.directionFrom && route.directionTo && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {route.directionFrom} → {route.directionTo}
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            {nextBus?.next ? (
              <div>
                <p className="text-2xl font-black text-primary tabular-nums">{nextBus.next}</p>
                <p className="text-xs text-muted-foreground">in {nextBus.inMinutes} min</p>
              </div>
            ) : route.cachedBusTimes ? (
              <p className="text-xs text-muted-foreground">Niciun autobuz</p>
            ) : (
              <p className="text-xs text-muted-foreground">Fara date</p>
            )}
          </div>
        </div>

        {showDelete && onDelete && (
          <div className="mt-3 pt-3 border-t border-border">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="text-xs text-destructive hover:text-red-400 transition-colors font-medium"
            >
              Sterge ruta
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
