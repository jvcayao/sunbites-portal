import { http, HttpResponse } from "msw";

import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";

import { server } from "@/__tests__/mocks/server";

import NotificationsPage from "./page";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Router mock
// ---------------------------------------------------------------------------

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const paymentReminderFixture = {
  id: "notif-1",
  type: "App\\Notifications\\PaymentReminderNotification",
  data: {
    school_month: "august",
    school_year: 2026,
    due_date: "2026-08-01",
    students: [{ name: "Juan Santos", amount: 2430 }],
    total_amount: 2430,
  },
  read_at: null,
  created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
};

const announcementFixture = {
  id: "notif-2",
  type: "App\\Notifications\\AnnouncementNotification",
  data: {
    announcement_id: 7,
    title: "Canteen closure notice",
    message: "The canteen will be closed on Friday due to maintenance.",
    sender_name: "Maria Santos",
    sent_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  read_at: null,
  created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupHandlers(
  notifications: unknown[],
  unreadCount = notifications.length,
) {
  server.use(
    http.get(`${API}/portal/notifications`, () =>
      HttpResponse.json({
        data: notifications,
        meta: { current_page: 1, last_page: 1, per_page: 20, total: notifications.length },
      }),
    ),
    http.get(`${API}/portal/notifications/unread-count`, () =>
      HttpResponse.json({ count: unreadCount }),
    ),
    http.patch(`${API}/portal/notifications/:id/read`, () =>
      HttpResponse.json({ message: "Marked as read." }),
    ),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockPush.mockClear();
});

describe("NotificationsPage", () => {
  it("renders a payment reminder with the correct title and preview", async () => {
    setupHandlers([paymentReminderFixture]);

    render(<NotificationsPage />);

    expect(
      await screen.findByText("Payment Reminder — August 2026"),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("1 student — ₱2,430.00"),
    ).toBeInTheDocument();
  });

  it("renders an announcement with its title and message — not 'Payment reminder'", async () => {
    setupHandlers([announcementFixture]);

    render(<NotificationsPage />);

    expect(
      await screen.findByText("Canteen closure notice"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/payment reminder/i),
    ).not.toBeInTheDocument();

    expect(
      await screen.findByText(/The canteen will be closed on Friday/),
    ).toBeInTheDocument();
  });

  it("shows the empty state when there are no notifications", async () => {
    setupHandlers([]);

    render(<NotificationsPage />);

    expect(await screen.findByText(/You're all caught up/i)).toBeInTheDocument();
  });

  it("clicking a payment reminder card navigates to /payments", async () => {
    setupHandlers([paymentReminderFixture]);

    render(<NotificationsPage />);

    const card = await screen.findByRole("article", {
      name: "Payment Reminder — August 2026",
    });

    await userEvent.click(card);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/payments");
    });
  });

  it("clicking an announcement card expands the full message inline and does not navigate", async () => {
    setupHandlers([announcementFixture]);

    render(<NotificationsPage />);

    const card = await screen.findByRole("article", {
      name: "Canteen closure notice",
    });

    // Full message is not visible before clicking
    expect(
      screen.queryByText("From: Maria Santos"),
    ).not.toBeInTheDocument();

    await userEvent.click(card);

    // Full message expands inline
    expect(
      await screen.findByText("From: Maria Santos"),
    ).toBeInTheDocument();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("cards show relative timestamps", async () => {
    setupHandlers([paymentReminderFixture, announcementFixture]);

    render(<NotificationsPage />);

    // Wait for cards to load
    await screen.findByText("Payment Reminder — August 2026");

    // Relative timestamps: "5m", "10m", "just now", etc.
    const timestamps = await screen.findAllByText(/^\d+[smhd]$|^just now$/i);

    expect(timestamps.length).toBeGreaterThanOrEqual(1);
  });
});
