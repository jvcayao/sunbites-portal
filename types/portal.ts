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
  items: { name: string; qty: number; price: number }[];
  total: number;
  payment_method: "wallet" | "cash";
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
  total_spent: number;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export interface WalletData {
  balance: number;
  wallet_alert_threshold: number;
  recent_transactions: Transaction[];
}

export interface MealPlanDay {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  meals: { type: "AM Snack" | "Lunch" | "PM Snack"; name: string; price: number }[];
}

export interface MealPlanData {
  week_start: string;
  days: MealPlanDay[];
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
