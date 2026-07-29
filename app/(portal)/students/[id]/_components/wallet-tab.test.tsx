import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/mocks/server";
import { WalletTab } from "./wallet-tab";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const mockWallet = {
  balance: 500,
  credit_balance: 0,
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

describe("WalletTab — outstanding credit (spec 14)", () => {
  function serveWallet(creditBalance: number) {
    server.use(
      http.get(`${API}/portal/students/1/wallet`, () =>
        HttpResponse.json({ ...mockWallet, credit_balance: creditBalance }),
      ),
    );
  }

  it("shows the outstanding credit when the student owes money", async () => {
    serveWallet(150);
    render(<WalletTab studentId={1} />);

    expect(await screen.findByText("Outstanding Credit")).toBeInTheDocument();
    expect(screen.getByText("PHP 150.00")).toBeInTheDocument();
  });

  it("tells parents it must be settled at the counter and cannot be paid online", async () => {
    serveWallet(150);
    render(<WalletTab studentId={1} />);

    expect(
      await screen.findByText(/credit cannot be paid online/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/canteen counter/i)).toBeInTheDocument();
  });

  it("hides the credit card entirely when nothing is owed", async () => {
    serveWallet(0);
    render(<WalletTab studentId={1} />);

    // Wait for real data before asserting absence, or the assertion would pass merely
    // because the query had not resolved yet.
    await waitFor(() =>
      expect(screen.getAllByText("PHP 500.00").length).toBeGreaterThan(0),
    );
    expect(screen.queryByText("Outstanding Credit")).not.toBeInTheDocument();
  });

  it("still shows the wallet balance alongside the credit card", async () => {
    serveWallet(150);
    render(<WalletTab studentId={1} />);

    // Gate on a data-dependent element: the "Current Balance" label renders immediately
    // with an em dash while the query is still in flight.
    expect(await screen.findByText("Outstanding Credit")).toBeInTheDocument();

    expect(screen.getByText("Current Balance")).toBeInTheDocument();
    // The mocked deposit row also renders PHP 500.00, so assert presence, not uniqueness.
    expect(screen.getAllByText("PHP 500.00").length).toBeGreaterThan(0);
    expect(screen.getByText("PHP 150.00")).toBeInTheDocument();
  });
});
