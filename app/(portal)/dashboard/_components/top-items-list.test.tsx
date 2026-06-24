import { render, screen } from "@/__tests__/test-utils";
import { TopItemsList } from "./top-items-list";
import type { TopItem } from "@/types/portal";

const items: TopItem[] = [
  { name: "Spaghetti", count: 18 },
  { name: "Rice w/ Chicken", count: 14 },
  { name: "Orange Juice", count: 12 },
];

describe("TopItemsList", () => {
  it("renders all item names", () => {
    render(<TopItemsList items={items} color="#F97316" />);
    expect(screen.getByText("Spaghetti")).toBeInTheDocument();
    expect(screen.getByText("Rice w/ Chicken")).toBeInTheDocument();
    expect(screen.getByText("Orange Juice")).toBeInTheDocument();
  });

  it("renders order counts with × symbol", () => {
    render(<TopItemsList items={items} color="#F97316" />);
    expect(screen.getByText("18×")).toBeInTheDocument();
    expect(screen.getByText("14×")).toBeInTheDocument();
  });

  it("renders rank numbers starting at 1", () => {
    render(<TopItemsList items={items} color="#F97316" />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows empty state when items array is empty", () => {
    render(<TopItemsList items={[]} color="#F97316" />);
    expect(screen.getByText(/no orders this month/i)).toBeInTheDocument();
  });
});
