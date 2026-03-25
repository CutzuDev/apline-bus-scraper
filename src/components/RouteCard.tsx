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
    <Link to={`/route/${route.id}`} className="block">
      <div className="bg-card border border-border rounded-xl hover:border-primary/50 transition-colors active:scale-[0.99]">
        <div className="flex items-center gap-1 p-4">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              onClick={(e) => e.preventDefault()}
              className="touch-none shrink-0 flex items-center justify-center w-6 mr-1 text-muted-foreground/30 hover:text-muted-foreground/60 cursor-grab active:cursor-grabbing transition-colors"
              aria-label="Reordoneaza"
            >
              <GripIcon />
            </button>
          )}

          <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
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
        </div>

        {showDelete && onDelete && (
          <div className="px-4 pb-4 pt-0">
            <div className="border-t border-border pt-3">
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
          </div>
        )}
      </div>
    </Link>
  );
}
