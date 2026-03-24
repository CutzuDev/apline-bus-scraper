import { useState } from "react";
import { getNextBus } from "@/lib/time";
import { cn } from "@/lib/utils";

interface TimeGridProps {
  busTimes: string[];
}

export function TimeGrid({ busTimes }: TimeGridProps) {
  const { index: nextIndex } = getNextBus(busTimes);
  const [expanded, setExpanded] = useState(false);

  if (busTimes.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground text-sm">
          Nu sunt date. Apasa "Reincarca" pentru a scana.
        </p>
      </div>
    );
  }

  // Collapsed: show next bus + 3 upcoming (4 total from nextIndex)
  const startIndex = nextIndex === -1 ? 0 : nextIndex;
  const visibleTimes = expanded ? busTimes : busTimes.slice(startIndex, startIndex + 4);
  const hiddenCount = busTimes.length - (startIndex + 4);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
        {visibleTimes.map((time, i) => {
          const realIndex = expanded ? i : startIndex + i;
          return (
            <div
              key={`${time}-${realIndex}`}
              className={cn(
                "text-center py-2 px-1 rounded-lg text-sm font-semibold tabular-nums transition-all",
                realIndex === nextIndex
                  ? "bg-primary text-black animate-pulse shadow-[0_0_12px_rgba(255,115,0,0.4)] scale-105"
                  : realIndex < nextIndex || nextIndex === -1
                  ? "bg-muted text-muted-foreground/50"
                  : "bg-muted text-foreground"
              )}
            >
              {time}
            </div>
          );
        })}
      </div>

      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          + {hiddenCount} ore urmatoare
        </button>
      )}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          Restrange
        </button>
      )}
    </div>
  );
}
