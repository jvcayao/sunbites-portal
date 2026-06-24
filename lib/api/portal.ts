import { apiClient } from "./client";

import type { AuthParent } from "@/types/auth";
import type {
  ActivityResponse,
  DashboardData,
  FeedbackItem,
  FeedbackResponse,
  MealPlanResponse,
  StudentDetail,
  WalletData,
} from "@/types/portal";
import type { PaymentHistoryEntry } from "@/types/notification";

// --- Profile ---

export const profileApi = {
  get: () => apiClient.get<AuthParent>("/portal/profile"),

  update: (payload: {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
  }) => apiClient.patch<AuthParent>("/portal/profile", payload),

  changePassword: (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiClient.post<{ message: string }>(
      "/portal/profile/change-password",
      payload,
    ),

  uploadPhoto: async (file: File): Promise<{ profile_photo_url: string }> => {
    const { useAuthStore } = await import("@/lib/store/auth");
    const token = useAuthStore.getState().token;
    const formData = new FormData();
    formData.append("photo", file);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/portal/profile/photo`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!response.ok) {
      const err = await response
        .json()
        .catch(() => ({ message: "Upload failed." }));
      throw err;
    }
    return response.json();
  },
};

// --- Dashboard ---

export const dashboardApi = {
  get: () => apiClient.get<DashboardData>("/portal/dashboard"),
};

// --- Students ---

export const studentsApi = {
  list: () => apiClient.get<{ data: StudentDetail[] }>("/portal/students"),

  fetchPhoto: async (id: number): Promise<string | null> => {
    const { useAuthStore } = await import("@/lib/store/auth");
    const token = useAuthStore.getState().token;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/portal/students/${id}/photo`;
    const headers: Record<string, string> = { Accept: "image/*" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(url, { headers });
    if (response.status === 404) return null;
    if (!response.ok) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  uploadPhoto: async (
    id: number,
    file: File,
  ): Promise<{ photo_url: string }> => {
    const { useAuthStore } = await import("@/lib/store/auth");
    const token = useAuthStore.getState().token;
    const formData = new FormData();
    formData.append("photo", file);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/portal/students/${id}/photo`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!response.ok) {
      const err = await response
        .json()
        .catch(() => ({ message: "Upload failed." }));
      throw err;
    }
    return response.json();
  },

  activity: (
    id: number,
    params: {
      page?: number;
      per_page?: number;
      payment_method?: "cash" | "wallet";
      from?: string;
      to?: string;
    },
  ) =>
    apiClient.get<ActivityResponse>(`/portal/students/${id}/activity`, {
      params: {
        page: params.page,
        per_page: params.per_page,
        payment_method: params.payment_method,
        from: params.from,
        to: params.to,
      },
    }),

  wallet: (
    id: number,
    params?: {
      page?: number;
      type?: "deposit" | "withdraw";
      from?: string;
      to?: string;
    },
  ) =>
    apiClient.get<WalletData>(`/portal/students/${id}/wallet`, {
      params: {
        page: params?.page,
        type: params?.type,
        from: params?.from,
        to: params?.to,
      },
    }),

  setAlert: (id: number, threshold: number) =>
    apiClient.patch<{ message: string }>(
      `/portal/students/${id}/wallet/alert`,
      { threshold },
    ),

  paymentHistory: (id: number) =>
    apiClient.get<{ data: PaymentHistoryEntry[] }>(
      `/portal/students/${id}/payment-history`,
    ),
};

// --- Meal Plan ---

export const mealPlanApi = {
  get: (month: string, week: number) =>
    apiClient.get<MealPlanResponse>("/portal/meal-planner", {
      params: { month, week },
    }),
};

// --- Feedback ---

export const feedbackApi = {
  list: () => apiClient.get<FeedbackResponse>("/portal/feedback"),

  submit: (payload: {
    student_id?: number;
    category: string;
    rating: number;
    message: string;
  }) => apiClient.post<FeedbackItem>("/portal/feedback", payload),
};

// --- Auth (additional endpoints not in auth.ts) ---

export const portalAuthApi = {
  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/portal/auth/password/email", {
      email,
    }),

  resetPassword: (payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiClient.post<{ message: string }>("/portal/auth/password/reset", payload),
};
