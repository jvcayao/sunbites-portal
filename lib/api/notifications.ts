import { apiClient } from "./client";

import type { NotificationListResponse } from "@/types/notification";

export const notificationApi = {
  list: (page?: number) =>
    apiClient.get<NotificationListResponse>("/portal/notifications", {
      params: { page },
    }),

  unreadCount: () =>
    apiClient.get<{ count: number }>("/portal/notifications/unread-count"),

  markRead: (id: string) =>
    apiClient.patch<{ message: string }>(
      `/portal/notifications/${id}/read`,
      {},
    ),

  markAllRead: () =>
    apiClient.post<{ message: string }>(
      "/portal/notifications/mark-all-read",
      {},
    ),

  destroy: (id: string) =>
    apiClient.delete<{ message: string }>(`/portal/notifications/${id}`),

  clearAll: () =>
    apiClient.delete<{ message: string }>("/portal/notifications"),
};
