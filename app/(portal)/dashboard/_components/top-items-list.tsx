import type { TopItem } from "@/types/portal";

interface Props {
  items: TopItem[];
  color: string;
}

export function TopItemsList({ items, color }: Props) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground">No orders this month.</p>
    );
  }

  const max = items[0].count;

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={item.name} className="flex items-center gap-2.5">
          <span className="w-3.5 flex-shrink-0 text-center text-[10.5px] font-bold text-muted-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 truncate text-[13px] font-medium text-foreground">
              {item.name}
            </p>
            <div className="h-[5px] overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((item.count / max) * 100)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
          <span className="min-w-[28px] flex-shrink-0 text-right text-[12px] font-semibold text-muted-foreground">
            {item.count}×
          </span>
        </li>
      ))}
    </ul>
  );
}
