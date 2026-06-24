"use client";

import { cn } from "@/lib/utils";

export const STUDENT_COLORS = ["#E8694E", "#7C6FD4", "#0891B2", "#059669"];

interface Props {
  students: Array<{ id: number; full_name: string }>;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function StudentSwitcher({ students, activeIndex, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {students.map((student, i) => {
        const color = STUDENT_COLORS[i] ?? "#6B7280";
        const isActive = i === activeIndex;

        return (
          <button
            key={student.id}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-all",
              isActive
                ? "border-transparent text-white"
                : "border-border text-muted-foreground hover:border-muted hover:bg-muted/30 hover:text-foreground",
            )}
            style={isActive ? { backgroundColor: color } : undefined}
          >
            <span
              className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
              style={{
                backgroundColor: isActive ? "rgba(255,255,255,0.65)" : color,
              }}
            />
            {student.full_name.split(" ")[0]}
          </button>
        );
      })}
    </div>
  );
}
