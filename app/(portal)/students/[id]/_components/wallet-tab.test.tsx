import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/mocks/server";
import { WalletTab } from "./wallet-tab";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const mockWallet = {
  balance: 500,
  wallet_alert_threshold: 50,
  data: [
    {
      id: 1,
      type: "deposit",
      amount: 500,
      meta: null,
      created_at: "2026-06-01T10:00:00Z",
    },
  ],
  meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
};

describe("WalletTab", () => {
  beforeEach(() => {
    server.use(
      http.get(`${API}/portal/students/1/wallet`, () =>
        HttpResponse.json(mockWallet),
      ),
    );
  });

  it("renders current balance", async () => {
    render(<WalletTab studentId={1} />);
    expect(await screen.findByText("Current Balance")).toBeInTheDocument();
    expect(await screen.findByText(/\+PHP 500\.00/i)).toBeInTheDocument();
  });

  it("selecting Top-up pill calls API with type=deposit", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/portal/students/1/wallet`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockWallet);
      }),
    );

    render(<WalletTab studentId={1} />);
    await screen.findByText("Current Balance");

    await userEvent.click(screen.getByRole("button", { name: "Top-up" }));

    await waitFor(() => {
      expect(capturedUrl).toContain("type=deposit");
    });
  });

  it("selecting Deductions pill calls API with type=withdraw", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/portal/students/1/wallet`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ ...mockWallet, data: [] });
      }),
    );

    render(<WalletTab studentId={1} />);
    await screen.findByText("Current Balance");

    await userEvent.click(screen.getByRole("button", { name: "Deductions" }));

    await waitFor(() => {
      expect(capturedUrl).toContain("type=withdraw");
    });
  });
});
