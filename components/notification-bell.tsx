"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationApi } from "@/lib/api/notifications";
import { useAuthStore } from "@/lib/store/auth";
import { useEcho } from "@/components/providers/echo-provider";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const echo = useEcho();
  const parent = useAuthStore((s) => s.parent);

  const { data } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => notificationApi.unreadCount(),
  });

  const unreadCount = data?.count ?? 0;

  useEffect(() => {
    if (!echo || !parent) return;

    const channel = echo
      .private(`parents.${parent.id}`)
      .listen("PaymentReminderNotification", () => {
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      })
      .listen("AnnouncementNotification", () => {
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      });

    return () => {
      channel.stopListening("PaymentReminderNotification");
      channel.stopListening("AnnouncementNotification");
    };
  }, [echo, parent, queryClient]);

  return (
    <button
      type="button"
      aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      onClick={() => router.push("/notifications")}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
        className
      )}
    >
      <Bell className="h-4 w-4" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-bold text-destructive-foreground"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
