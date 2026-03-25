import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { type Route } from "@/lib/api";
import { getNextBus } from "@/lib/time";

function GripIcon() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="10" cy="6" r="1.5" />
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="4" cy="14" r="1.5" />
      <circle cx="10" cy="14" r="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

interface RouteCardProps {
  route: Route;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  selecting?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}

export function RouteCard({ route, dragHandleProps, selecting, selected, onToggle }: RouteCardProps) {
  const nextBus = route.cachedBusTimes ? getNextBus(route.cachedBusTimes) : null;

  // Left slot: checkbox in select mode, grip handle in normal mode
  const leftSlot = selecting ? (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle?.(); }}
      className={`touch-none shrink-0 flex items-center justify-center w-6 h-6 mr-1 rounded-md border-2 transition-colors ${
        selected
          ? "bg-destructive border-destructive text-white"
          : "border-muted-foreground/30 hover:border-muted-foreground/60"
      }`}
      aria-label={selected ? "Deselecteaza" : "Selecteaza"}
    >
      {selected && <CheckIcon />}
    </button>
  ) : dragHandleProps ? (
    <button
      {...dragHandleProps}
      onClick={(e) => e.preventDefault()}
      className="touch-none shrink-0 flex items-center justify-center w-6 mr-1 text-muted-foreground/30 hover:text-muted-foreground/60 cursor-grab active:cursor-grabbing transition-colors"
      aria-label="Reordoneaza"
    >
      <GripIcon />
    </button>
  ) : null;

  const info = (
    <div className="flex w-full items-center justify-between gap-3 flex-1 min-w-0">
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
  );

  return (
    <div className={`bg-card border rounded-xl transition-colors ${selected ? "border-destructive/60 bg-destructive/5" : "border-border"}`}>
      <div className="w-full flex items-center gap-1 p-4">
        {leftSlot}
        {selecting ? (
          <div onClick={onToggle} className="flex-1 min-w-0 cursor-pointer active:scale-[0.99]">
            {info}
          </div>
        ) : (
          <Link to={`/route/${route.id}`} className="flex-1 min-w-0 hover:opacity-80 active:scale-[0.99] transition-all">
            {info}
          </Link>
        )}
      </div>
    </div>
  );
}
