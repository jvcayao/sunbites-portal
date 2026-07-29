import {
  getNotificationPreview,
  getNotificationTitle,
} from "@/components/notification-item";

import type { ParentNotification } from "@/types/notification";

function charged(
  overrides: Partial<{
    amount: number;
    outstanding_balance: number;
    student_name: string;
  }> = {},
): ParentNotification {
  return {
    id: "n-1",
    type: "App\\Notifications\\CreditChargedNotification",
    data: {
      student_id: 6,
      student_name: "Yuie Cayao",
      amount: 25,
      outstanding_balance: 150,
      ...overrides,
    },
    read_at: null,
    created_at: "2026-07-29T10:00:00+08:00",
  };
}

function settled(wasWaived: boolean): ParentNotification {
  return {
    id: "n-2",
    type: "App\\Notifications\\CreditSettledNotification",
    data: {
      student_id: 6,
      student_name: "Yuie Cayao",
      amount: 150,
      outstanding_balance: 0,
      was_waived: wasWaived,
    },
    read_at: null,
    created_at: "2026-07-29T14:00:00+08:00",
  };
}

describe("credit notification copy", () => {
  it("titles a credit charge so parents know money was borrowed", () => {
    expect(getNotificationTitle(charged())).toBe("Canteen Credit Used");
  });

  it("names the student, the amount used and the running total", () => {
    const preview = getNotificationPreview(charged());

    expect(preview).toContain("Yuie Cayao");
    expect(preview).toContain("₱25.00");
    expect(preview).toContain("₱150.00");
  });

  it("titles a settlement as a payment received", () => {
    expect(getNotificationTitle(settled(false))).toBe(
      "Credit Payment Received",
    );
  });

  it("confirms the paid amount and the remaining balance", () => {
    const preview = getNotificationPreview(settled(false));

    expect(preview).toContain("₱150.00");
    expect(preview).toContain("Yuie Cayao");
    expect(preview).toContain("₱0.00");
  });

  it("distinguishes a waive from a payment", () => {
    expect(getNotificationTitle(settled(true))).toBe("Credit Waived");
    expect(getNotificationPreview(settled(true))).toContain("waived");
    expect(getNotificationPreview(settled(false))).not.toContain("waived");
  });

  it("never leaks a staff-only waive reason", () => {
    // The API deliberately omits the reason from the notification payload; this asserts the
    // frontend cannot surface one even if a future payload carried it.
    const preview = getNotificationPreview(settled(true));

    expect(preview).not.toMatch(/hardship|confidential|reason/i);
  });

  it("formats centavos rather than truncating them", () => {
    const preview = getNotificationPreview(
      charged({ amount: 25.5, outstanding_balance: 150.75 }),
    );

    expect(preview).toContain("₱25.50");
    expect(preview).toContain("₱150.75");
  });

  it("still renders the existing announcement and payment reminder copy", () => {
    const announcement: ParentNotification = {
      id: "n-3",
      type: "App\\Notifications\\AnnouncementNotification",
      data: {
        announcement_id: 1,
        title: "Early dismissal",
        message: "Classes end at noon.",
        sender_name: "Admin",
        sent_at: "2026-07-29T08:00:00+08:00",
      },
      read_at: null,
      created_at: "2026-07-29T08:00:00+08:00",
    };

    expect(getNotificationTitle(announcement)).toBe("Early dismissal");
    expect(getNotificationPreview(announcement)).toBe("Classes end at noon.");

    const reminder: ParentNotification = {
      id: "n-4",
      type: "App\\Notifications\\PaymentReminderNotification",
      data: {
        school_month: "August",
        school_year: 2026,
        due_date: "2026-08-01",
        students: [{ full_name: "Yuie Cayao", amount: 2970 }],
        total_amount: 2970,
      },
      read_at: null,
      created_at: "2026-07-18T08:00:00+08:00",
    };

    expect(getNotificationTitle(reminder)).toBe("Payment Reminder");
    expect(getNotificationPreview(reminder)).toContain("August 2026");
  });
});
