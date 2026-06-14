import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";

import { NotificationItem } from "./notification-item";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const announcementUnread = {
  id: "1",
  type: "App\\Notifications\\AnnouncementNotification" as const,
  data: {
    announcement_id: 10,
    title: "Holiday Notice",
    message: "School is closed on June 20.",
    sender_name: "Admin",
    sent_at: "2026-06-13T10:00:00Z",
  },
  read_at: null,
  created_at: "2026-06-13T10:00:00Z",
};

const paymentReminderUnread = {
  id: "2",
  type: "App\\Notifications\\PaymentReminderNotification" as const,
  data: {
    school_month: "June",
    school_year: 2026,
    due_date: "2026-06-30",
    students: [{ name: "Juan dela Cruz", amount: 1500 }],
    total_amount: 1500,
  },
  read_at: null,
  created_at: "2026-06-13T08:00:00Z",
};

const noop = jest.fn();

describe("NotificationItem (Portal)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders unread announcement with bold title", () => {
    render(
      <NotificationItem
        notification={announcementUnread}
        onMarkRead={noop}
        onDelete={noop}
        isMarkingRead={false}
        isDeleting={false}
      />
    );
    expect(screen.getByText("Holiday Notice")).toHaveClass("font-semibold");
  });

  it("clicking announcement expands inline body instead of navigating", async () => {
    render(
      <NotificationItem
        notification={announcementUnread}
        onMarkRead={noop}
        onDelete={noop}
        isMarkingRead={false}
        isDeleting={false}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /holiday notice/i }));
    await waitFor(() => {
      expect(screen.getByText("School is closed on June 20.")).toBeVisible();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clicking announcement again collapses the body", async () => {
    render(
      <NotificationItem
        notification={announcementUnread}
        onMarkRead={noop}
        onDelete={noop}
        isMarkingRead={false}
        isDeleting={false}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /holiday notice/i }));
    await waitFor(() => screen.getByText("School is closed on June 20."));
    await userEvent.click(screen.getByRole("button", { name: /holiday notice/i }));
    await waitFor(() => {
      expect(screen.queryByTestId("announcement-body")).not.toBeInTheDocument();
    });
  });

  it("renders payment reminder and navigates to /payments on click", async () => {
    const onNavigate = jest.fn();
    render(
      <NotificationItem
        notification={paymentReminderUnread}
        onMarkRead={noop}
        onDelete={noop}
        isMarkingRead={false}
        isDeleting={false}
        onNavigate={onNavigate}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /payment reminder/i }));
    expect(mockPush).toHaveBeenCalledWith("/payments");
    expect(onNavigate).toHaveBeenCalled();
  });
});
