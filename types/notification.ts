export interface PaymentReminderData {
  school_month: string;
  school_year: number;
  due_date: string;
  students: Array<{ id?: number; full_name: string; amount: number }>;
  total_amount: number;
  note?: string;
}

export interface AnnouncementData {
  announcement_id: number;
  title: string | null;
  message: string;
  sender_name: string;
  sent_at: string;
}

export interface CreditChargedData {
  student_id: number;
  student_name: string;
  amount: number;
  outstanding_balance: number;
}

export interface CreditSettledData {
  student_id: number;
  student_name: string;
  amount: number;
  outstanding_balance: number;
  was_waived: boolean;
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
    }
  | {
      id: string;
      type: "App\\Notifications\\CreditChargedNotification";
      data: CreditChargedData;
      read_at: string | null;
      created_at: string;
    }
  | {
      id: string;
      type: "App\\Notifications\\CreditSettledNotification";
      data: CreditSettledData;
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
  status: "paid" | "unpaid" | "voided";
  paid_at: string | null;
}
