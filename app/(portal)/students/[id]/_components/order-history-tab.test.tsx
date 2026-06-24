import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/mocks/server";
import { OrderHistoryTab } from "./order-history-tab";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const mockActivity = {
  spending_total: 150,
  data: [
    {
      id: 1,
      items: [{ name: "Rice Meal", quantity: 1, price: 80, line_total: 80 }],
      total: 80,
      payment_method: "cash",
      created_at: "2026-06-01T10:00:00Z",
    },
  ],
  meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
};

describe("OrderHistoryTab", () => {
  beforeEach(() => {
    server.use(
      http.get(`${API}/portal/students/1/activity`, () => HttpResponse.json(mockActivity)),
    );
  });

  it("renders orders and total spent", async () => {
    render(<OrderHistoryTab studentId={1} />);
    expect(await screen.findByText("Rice Meal x1")).toBeInTheDocument();
    expect(screen.getByText(/PHP 150\.00/i)).toBeInTheDocument();
  });

  it("selecting Cash pill calls API with payment_method=cash", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/portal/students/1/activity`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockActivity);
      }),
    );

    render(<OrderHistoryTab studentId={1} />);
    await screen.findByText("Rice Meal x1");

    await userEvent.click(screen.getByRole("button", { name: "Cash" }));

    await waitFor(() => {
      expect(capturedUrl).toContain("payment_method=cash");
    });
  });

  it("selecting Today pill calls API with from and to date params", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/portal/students/1/activity`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockActivity);
      }),
    );

    render(<OrderHistoryTab studentId={1} />);
    await screen.findByText("Rice Meal x1");

    await userEvent.click(screen.getByRole("button", { name: "Today" }));

    await waitFor(() => {
      expect(capturedUrl).toContain("from=");
      expect(capturedUrl).toContain("to=");
    });
  });

  it("shows empty state when no orders match", async () => {
    server.use(
      http.get(`${API}/portal/students/1/activity`, () =>
        HttpResponse.json({ ...mockActivity, data: [], meta: { ...mockActivity.meta, total: 0 } }),
      ),
    );

    render(<OrderHistoryTab studentId={1} />);

    expect(await screen.findByText(/No orders match/i)).toBeInTheDocument();
  });
});
