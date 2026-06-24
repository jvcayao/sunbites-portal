import { render, screen } from "@/__tests__/test-utils";
import { PaymentMethodSplit } from "./payment-method-split";

describe("PaymentMethodSplit", () => {
  it("renders bars for non-zero methods only", () => {
    render(
      <PaymentMethodSplit
        split={{ wallet: 65, cash: 35, subscription: 0, gcash: 0 }}
        color="#F97316"
      />,
    );
    expect(screen.getByText("Wallet")).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();
    expect(screen.queryByText("Plan")).not.toBeInTheDocument();
    expect(screen.queryByText("GCash")).not.toBeInTheDocument();
  });

  it("renders Plan bar when subscription orders exist", () => {
    render(
      <PaymentMethodSplit
        split={{ wallet: 40, cash: 20, subscription: 40, gcash: 0 }}
        color="#8B5CF6"
      />,
    );
    expect(screen.getByText("Plan")).toBeInTheDocument();
  });

  it("shows percentages next to each bar", () => {
    render(
      <PaymentMethodSplit
        split={{ wallet: 65, cash: 35, subscription: 0, gcash: 0 }}
        color="#F97316"
      />,
    );
    expect(screen.getByText("65%")).toBeInTheDocument();
    expect(screen.getByText("35%")).toBeInTheDocument();
  });

  it("shows empty state when all percentages are zero", () => {
    render(
      <PaymentMethodSplit
        split={{ wallet: 0, cash: 0, subscription: 0, gcash: 0 }}
        color="#F97316"
      />,
    );
    expect(screen.getByText(/no orders this month/i)).toBeInTheDocument();
  });
});
