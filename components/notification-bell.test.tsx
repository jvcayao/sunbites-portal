import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { server } from "@/__tests__/mocks/server";
import { NotificationBell } from "./notification-bell";
import type { ParentNotification } from "@/types/notification";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

jest.mock("@/components/providers/echo-provider", () => ({
  useEcho: () => null,
}));

const mockAuthState = { parent: { id: 1, name: "Parent" }, token: null };
jest.mock("@/lib/store/auth", () => ({
  useAuthStore: Object.assign(
    (sel: (s: typeof mockAuthState) => unknown) => sel(mockAuthState),
    { getState: () => mockAuthState }
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

function setupHandlers(count = 0, items: ParentNotification[] = []) {
  server.use(
    http.get(`${API}/portal/notifications/unread-count`, () =>
      HttpResponse.json({ count })
    ),
    http.get(`${API}/portal/notifications`, () =>
      HttpResponse.json({
        data: items,
        meta: { current_page: 1, last_page: 1, per_page: 20, total: items.length },
      })
    )
  );
}

describe("NotificationBell (Portal)", () => {
  it("renders bell without badge when count is 0", async () => {
    setupHandlers(0);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    });
  });

  it("renders badge when unread count > 0", async () => {
    setupHandlers(3);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "3 unread notifications" })
      ).toBeInTheDocument();
    });
  });

  it("clicking bell opens the panel", async () => {
    setupHandlers(0, []);
    render(<NotificationBell />);
    await waitFor(() => screen.getByRole("button", { name: "Notifications" }));
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    await waitFor(() => {
      expect(screen.getByText("View all notifications →")).toBeInTheDocument();
    });
  });

  it("shows empty state when no notifications", async () => {
    setupHandlers(0, []);
    render(<NotificationBell />);
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    await waitFor(() => {
      expect(screen.getByText("You're all caught up")).toBeInTheDocument();
    });
  });
});
