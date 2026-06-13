import { apiClient } from "@/lib/api/client";

import type { Branch, PreRegistrationPayload } from "@/types/pre-registration";

export const preRegistrationApi = {
  branches: () => apiClient.get<{ data: Branch[] }>("/public/branches"),
  submit: (payload: PreRegistrationPayload) =>
    apiClient.post<{ message: string }>("/public/pre-registrations", payload),
};
