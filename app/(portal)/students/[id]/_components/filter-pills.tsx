import { cn } from "@/lib/utils";

interface Pill {
  value: string;
  label: string;
}

interface FilterPillsProps {
  pills: Pill[];
  active: string;
  onSelect: (value: string) => void;
  className?: string;
}

export function FilterPills({ pills, active, onSelect, className }: FilterPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group">
      {pills.map((pill) => (
        <button
          key={pill.value}
          type="button"
          onClick={() => onSelect(pill.value)}
          aria-pressed={active === pill.value}
          className={cn(
            "px-3 py-1 text-sm font-medium rounded-full transition-colors",
            active === pill.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}
