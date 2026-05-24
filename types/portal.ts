export interface StudentSummary {
  id: number;
  student_number: string;
  full_name: string;
  grade_level: string;
  branch_name: string;
  wallet_balance: number;
  wallet_alert_threshold: number;
  enrollment_status: "enrolled" | "paused" | "graduated" | "banned";
  student_type: "subscription" | "non_subscription";
}

export interface StudentDetail extends StudentSummary {}

export interface RecentOrder {
  id: number;
  student_full_name: string;
  total: number;
  payment_method: "wallet" | "cash";
  created_at: string;
}

export interface DashboardData {
  students: StudentSummary[];
  recent_orders: RecentOrder[];
}

export interface ActivityItem {
  id: number;
  items: { name: string; quantity: number; price: number; line_total: number }[];
  total: number;
  payment_method: "wallet" | "cash" | "gcash" | "subscription";
  created_at: string;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ActivityResponse {
  data: ActivityItem[];
  meta: PaginatedMeta;
  spending_total: number;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface WalletData {
  balance: number;
  wallet_alert_threshold: number;
  data: Transaction[];
  meta: PaginatedMeta;
}

export interface MealPlanGridItem {
  day: string;
  day_label: string;
  ulam: string;
  vegetables: string;
  fruit: string;
  soup: string;
}

export interface MealPlanData {
  grid: MealPlanGridItem[];
}

export interface FeedbackItem {
  id: number;
  category: string;
  message: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface FeedbackResponse {
  data: FeedbackItem[];
  meta: PaginatedMeta;
}
