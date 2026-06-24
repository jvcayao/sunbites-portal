import { render, screen } from "@/__tests__/test-utils";
import { MonthlyTrendChart } from "./monthly-trend-chart";
import type { MonthlySpending } from "@/types/portal";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
  Cell: () => null,
}));

const mockData: MonthlySpending[] = [
  { month: "2026-01", label: "Jan", total: 850 },
  { month: "2026-02", label: "Feb", total: 920 },
  { month: "2026-06", label: "Jun", total: 1250 },
];

describe("MonthlyTrendChart", () => {
  it("renders bar chart when data is provided", () => {
    render(<MonthlyTrendChart data={mockData} color="#F97316" />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("renders empty state message when data array is empty", () => {
    render(<MonthlyTrendChart data={[]} color="#F97316" />);
    expect(screen.getByText(/no spending data/i)).toBeInTheDocument();
    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
  });
});
