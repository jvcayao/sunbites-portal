import { apiClient } from "./client";

import type { AuthParent } from "@/types/auth";
import type {
  ActivityResponse,
  DashboardData,
  FeedbackItem,
  FeedbackResponse,
  MealPlanData,
  StudentDetail,
  WalletData,
} from "@/types/portal";

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
  }) => apiClient.post<{ message: string }>("/portal/profile/change-password", payload),

  uploadPhoto: async (file: File): Promise<{ profile_photo_path: string }> => {
    const { useAuthStore } = await import("@/lib/store/auth");
    const token = useAuthStore.getState().token;
    const formData = new FormData();
    formData.append("photo", file);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/portal/profile/photo`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(url, { method: "POST", headers, body: formData });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Upload failed." }));
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

  activity: (id: number, params: { page?: number; per_page?: number }) =>
    apiClient.get<ActivityResponse>(`/portal/students/${id}/activity`, {
      params: {
        page: params.page,
        per_page: params.per_page,
      },
    }),

  wallet: (id: number) =>
    apiClient.get<WalletData>(`/portal/students/${id}/wallet`),

  setAlert: (id: number, threshold: number) =>
    apiClient.patch<{ message: string }>(
      `/portal/students/${id}/wallet/alert`,
      { threshold }
    ),
};

// --- Meal Plan ---

export const mealPlanApi = {
  get: () => apiClient.get<MealPlanData>("/portal/meal-planner"),
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
    apiClient.post<{ message: string }>("/portal/auth/password/email", { email }),

  resetPassword: (payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => apiClient.post<{ message: string }>("/portal/auth/password/reset", payload),
};
