import { cn } from "@/lib/utils";

interface DirectionToggleProps {
  selected: "dus" | "intors";
  onChange: (dir: "dus" | "intors") => void;
}

export function DirectionToggle({ selected, onChange }: DirectionToggleProps) {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-xl">
      {(["dus", "intors"] as const).map((dir) => (
        <button
          key={dir}
          onClick={() => onChange(dir)}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
            selected === dir
              ? "bg-primary text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {dir === "dus" ? "Dus" : "Intors"}
        </button>
      ))}
    </div>
  );
}
