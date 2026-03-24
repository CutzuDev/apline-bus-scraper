import { getNextBus } from "@/lib/time";
import { cn } from "@/lib/utils";

interface TimeGridProps {
  busTimes: string[];
}

export function TimeGrid({ busTimes }: TimeGridProps) {
  const { index: nextIndex } = getNextBus(busTimes);

  if (busTimes.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground text-sm">
          Nu sunt date. Apasa "Reincarca" pentru a scana.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
      {busTimes.map((time, i) => (
        <div
          key={`${time}-${i}`}
          className={cn(
            "text-center py-2 px-1 rounded-lg text-sm font-semibold tabular-nums transition-all",
            i === nextIndex
              ? "bg-primary text-black animate-pulse shadow-[0_0_12px_rgba(255,115,0,0.4)] scale-105"
              : i < nextIndex || nextIndex === -1
              ? "bg-muted text-muted-foreground/50"
              : "bg-muted text-foreground"
          )}
        >
          {time}
        </div>
      ))}
    </div>
  );
}
