import { render, screen } from "@/__tests__/test-utils";
import { SpendingStatCells } from "./spending-stat-cells";
import type { SpendingSummary } from "@/types/portal";

const base: SpendingSummary = {
  monthly: [],
  top_items: [{ name: "Spaghetti", count: 18 }],
  payment_method_split: { wallet: 65, cash: 35, subscription: 0, gcash: 0 },
  ytd_total: 5950,
  this_month_total: 1250,
  last_month_total: 1050,
};

describe("SpendingStatCells", () => {
  it("shows this month total amount", () => {
    render(<SpendingStatCells data={base} />);
    expect(screen.getByText(/1,250/)).toBeInTheDocument();
  });

  it("shows upward delta when this month exceeds last month", () => {
    render(<SpendingStatCells data={base} />);
    // 1250 vs 1050 = 19% increase
    expect(screen.getByText(/19%/)).toBeInTheDocument();
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it("shows downward delta when this month is less than last month", () => {
    render(
      <SpendingStatCells
        data={{ ...base, this_month_total: 900, last_month_total: 1050 }}
      />
    );
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it("shows YTD total", () => {
    render(<SpendingStatCells data={base} />);
    expect(screen.getByText(/5,950/)).toBeInTheDocument();
  });

  it("shows top item name and order count", () => {
    render(<SpendingStatCells data={base} />);
    expect(screen.getByText("Spaghetti")).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
  });

  it("shows empty fallback when no top items", () => {
    render(<SpendingStatCells data={{ ...base, top_items: [] }} />);
    expect(screen.getByText(/no orders yet/i)).toBeInTheDocument();
  });
});
