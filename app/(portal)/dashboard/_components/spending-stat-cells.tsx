import { cn } from "@/lib/utils";
import type { SpendingSummary } from "@/types/portal";

interface Props {
  data: SpendingSummary;
}

function formatAmount(n: number) {
  return `₱${Math.round(n).toLocaleString("en-PH")}`;
}

export function SpendingStatCells({ data }: Props) {
  const delta =
    data.last_month_total > 0
      ? Math.round(
          (Math.abs(data.this_month_total - data.last_month_total) /
            data.last_month_total) *
            100
        )
      : null;
  const isUp = data.this_month_total > data.last_month_total;
  const isDown = data.this_month_total < data.last_month_total;
  const topItem = data.top_items[0];

  return (
    <div className="grid grid-cols-3 divide-x divide-border border-y border-border">
      <div className="px-6 py-4">
        <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">
          This Month
        </p>
        <p className="text-2xl font-extrabold leading-none tracking-tight">
          {formatAmount(data.this_month_total)}
        </p>
        {delta !== null && (
          <p
            className={cn(
              "mt-1.5 flex items-center gap-0.5 text-[11px] font-medium",
              isUp
                ? "text-red-500"
                : isDown
                  ? "text-emerald-500"
                  : "text-muted-foreground"
            )}
          >
            {isUp ? "↑" : isDown ? "↓" : ""} {delta}% vs last month
          </p>
        )}
      </div>

      <div className="px-6 py-4">
        <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">
          Year to Date
        </p>
        <p className="text-2xl font-extrabold leading-none tracking-tight">
          {formatAmount(data.ytd_total)}
        </p>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          School year total
        </p>
      </div>

      <div className="px-6 py-4">
        <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">
          Top Item
        </p>
        {topItem ? (
          <>
            <p className="mt-1 text-[15px] font-bold leading-tight">
              {topItem.name}
            </p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {topItem.count}&times; ordered this month
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No orders yet</p>
        )}
      </div>
    </div>
  );
}
