import { apiClient } from "./client";

import type { AuthParent } from "@/types/auth";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  parent: AuthParent;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>("/portal/auth/login", payload),

  logout: () =>
    apiClient.post<void>("/portal/auth/logout"),
};
