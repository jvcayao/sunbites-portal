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

const mockAuthState = { parent: { id: 1, name: "Parent User" }, token: null };
jest.mock("@/lib/store/auth", () => ({
  useAuthStore: Object.assign(
    (sel: (s: typeof mockAuthState) => unknown) => sel(mockAuthState),
    { getState: () => mockAuthState }
  ),
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
    students: [{ id: 42, name: "Juan Santos", amount: 2430 }],
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

describe("NotificationsPage (Portal)", () => {
  it("renders a payment reminder with the correct title and preview", async () => {
    setupHandlers([paymentReminderFixture]);

    render(<NotificationsPage />);

    expect(await screen.findByText("Payment Reminder")).toBeInTheDocument();
    expect(
      screen.getByText("august 2026 — ₱2,430 due")
    ).toBeInTheDocument();
  });

  it("renders an announcement with its title and message", async () => {
    setupHandlers([announcementFixture]);

    render(<NotificationsPage />);

    expect(await screen.findByText("Canteen closure notice")).toBeInTheDocument();
    expect(
      screen.getByText("The canteen will be closed on Friday due to maintenance.")
    ).toBeInTheDocument();
  });

  it("shows the empty state when there are no notifications", async () => {
    setupHandlers([]);

    render(<NotificationsPage />);

    expect(await screen.findByText(/You're all caught up/i)).toBeInTheDocument();
  });

  it("clicking a payment reminder opens the sheet and the view button navigates to /payments", async () => {
    setupHandlers([paymentReminderFixture]);

    render(<NotificationsPage />);

    const item = await screen.findByRole("button", {
      name: /payment reminder/i,
    });

    await userEvent.click(item);

    const viewBtn = await screen.findByRole("button", { name: /view payments/i });
    await userEvent.click(viewBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/students/42?tab=payment-history");
    });
  });

  it("clicking an announcement does not navigate away", async () => {
    setupHandlers([announcementFixture]);

    render(<NotificationsPage />);

    const item = await screen.findByRole("button", {
      name: /canteen closure notice/i,
    });

    await userEvent.click(item);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows the 'Today' date group header for notifications created today", async () => {
    setupHandlers([paymentReminderFixture]);

    render(<NotificationsPage />);

    expect(await screen.findByText("Today")).toBeInTheDocument();
  });

  it("Unread tab filters to only unread notifications", async () => {
    const readFixture = {
      ...paymentReminderFixture,
      id: "notif-read",
      read_at: new Date().toISOString(),
    };
    setupHandlers([paymentReminderFixture, readFixture], 1);

    render(<NotificationsPage />);

    await screen.findAllByText("Payment Reminder");

    await userEvent.click(screen.getByRole("tab", { name: /unread/i }));

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /payment reminder/i })
      ).toHaveLength(1);
    });
  });
});
