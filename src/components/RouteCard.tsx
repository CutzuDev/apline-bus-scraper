import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { type Route } from "@/lib/api";
import { getNextBus } from "@/lib/time";

function GripIcon() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="6" r="1.5"/>
      <circle cx="10" cy="6" r="1.5"/>
      <circle cx="4" cy="10" r="1.5"/>
      <circle cx="10" cy="10" r="1.5"/>
      <circle cx="4" cy="14" r="1.5"/>
      <circle cx="10" cy="14" r="1.5"/>
    </svg>
  );
}

interface RouteCardProps {
  route: Route;
  showDelete?: boolean;
  onDelete?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function RouteCard({ route, showDelete, onDelete, dragHandleProps }: RouteCardProps) {
  const nextBus = route.cachedBusTimes ? getNextBus(route.cachedBusTimes) : null;

  return (
    <div className="flex items-stretch">
      {dragHandleProps && (
        <button
          {...dragHandleProps}
          className="touch-none flex items-center px-2 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing rounded-l-xl"
          aria-label="Reordoneaza"
        >
          <GripIcon />
        </button>
      )}
      <Link to={`/route/${route.id}`} className={`block flex-1 min-w-0 ${dragHandleProps ? "" : "w-full"}`}>
        <div className={`bg-card border border-border p-4 hover:border-primary/50 transition-colors active:scale-[0.99] h-full ${dragHandleProps ? "rounded-r-xl border-l-0" : "rounded-xl"}`}>
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
    </div>
  );
}
