import type { SpendingSummary } from "@/types/portal";

interface Props {
  split: SpendingSummary["payment_method_split"];
  color: string;
}

type MethodKey = keyof SpendingSummary["payment_method_split"];

const METHOD_CONFIG: Record<MethodKey, { label: string; bg: (color: string) => string }> = {
  wallet: { label: "Wallet", bg: (c) => c },
  subscription: { label: "Plan", bg: () => "#34D399" },
  cash: { label: "Cash", bg: () => "#CBD5E1" },
  gcash: { label: "GCash", bg: () => "#0064D3" },
};

export function PaymentMethodSplit({ split, color }: Props) {
  const activeKeys = (Object.keys(METHOD_CONFIG) as MethodKey[]).filter(
    (k) => split[k] > 0,
  );

  if (!activeKeys.length) {
    return (
      <p className="text-sm text-muted-foreground">No orders this month.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {activeKeys.map((key) => (
        <div key={key} className="flex items-center gap-2.5">
          <span className="w-[42px] flex-shrink-0 text-[12px] text-muted-foreground">
            {METHOD_CONFIG[key].label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${split[key]}%`,
                backgroundColor: METHOD_CONFIG[key].bg(color),
              }}
            />
          </div>
          <span className="w-8 flex-shrink-0 text-right text-[12px] font-bold text-foreground">
            {split[key]}%
          </span>
        </div>
      ))}
    </div>
  );
}
