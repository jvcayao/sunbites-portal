export interface PaymentReminderData {
  school_month: string;
  school_year: number;
  due_date: string;
  students: Array<{ name: string; amount: number }>;
  total_amount: number;
}

export interface AnnouncementData {
  announcement_id: number;
  title: string | null;
  message: string;
  sender_name: string;
  sent_at: string;
}

export type ParentNotification =
  | {
      id: string;
      type: "App\\Notifications\\PaymentReminderNotification";
      data: PaymentReminderData;
      read_at: string | null;
      created_at: string;
    }
  | {
      id: string;
      type: "App\\Notifications\\AnnouncementNotification";
      data: AnnouncementData;
      read_at: string | null;
      created_at: string;
    };

export interface NotificationListResponse {
  data: ParentNotification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PaymentHistoryEntry {
  id: number;
  school_month: string;
  year: number;
  amount: number;
  status: "paid" | "unpaid";
  paid_at: string | null;
}
