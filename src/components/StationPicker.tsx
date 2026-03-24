import { cn } from "@/lib/utils";
import type { StationData } from "@/lib/api";

interface StationPickerProps {
  stations: StationData[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function StationPicker({ stations, selectedIndex, onSelect }: StationPickerProps) {
  return (
    <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
      {stations.map((station, i) => (
        <button
          key={`${station.route}-${i}`}
          onClick={() => onSelect(i)}
          className={cn(
            "w-full text-left p-3 rounded-lg border transition-all",
            selectedIndex === i
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border hover:border-primary/40 hover:bg-muted text-foreground"
          )}
        >
          <p className="font-medium text-sm">{station.name}</p>
        </button>
      ))}
    </div>
  );
}
