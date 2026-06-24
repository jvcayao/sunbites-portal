export interface SubscriptionMonthlyCategoryStatus {
  allocated: number;
  used: number;
  remaining: number;
}

export interface SubscriptionMonthlyStatus {
  month: string;
  year: number;
  categories: {
    meal: SubscriptionMonthlyCategoryStatus;
    snack: SubscriptionMonthlyCategoryStatus;
    drink: SubscriptionMonthlyCategoryStatus;
    extra: SubscriptionMonthlyCategoryStatus;
  };
}

export interface StudentSummary {
  id: number;
  student_number: string;
  full_name: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  section: string | null;
  birthday: string | null;
  notes: string | null;
  qr_code: string | null;
  photo_url: string | null;
  branch_name: string;
  allergies: string | null;
  wallet_balance: number;
  wallet_alert_threshold: number;
  enrollment_status: "enrolled" | "paused" | "graduated" | "banned";
  student_type: "subscription" | "non_subscription";
  subscription_monthly_status: SubscriptionMonthlyStatus | null;
}

export type StudentDetail = StudentSummary;

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
  items: {
    name: string;
    quantity: number;
    price: number;
    line_total: number;
  }[];
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

// --- Meal-planner response shape (GET /portal/meal-planner?month=&week=) ---

export interface MealPlanDay {
  day: string;
  day_label: string;
  ulam?: string | null;
  vegetables?: string | null;
  fruit?: string | null;
  soup?: string | null;
  snacks?: string | null;
}

export interface MealPlanResponse {
  visible_to_parents: boolean;
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

export interface MonthlySpending {
  month: string; // "2026-01"
  label: string; // "Jan"
  total: number;
}

export interface TopItem {
  name: string;
  count: number;
}

export interface SpendingSummary {
  monthly: MonthlySpending[];
  top_items: TopItem[];
  payment_method_split: {
    wallet: number;
    cash: number;
    subscription: number;
    gcash: number;
  };
  ytd_total: number;
  this_month_total: number;
  last_month_total: number;
}

export interface PaymentHistoryResponse {
  data: import("@/types/notification").PaymentHistoryEntry[];
}
