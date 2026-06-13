"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, MoreHorizontal, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { notificationApi } from "@/lib/api/notifications";
import { relativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/utils";

import type { ParentNotification } from "@/types/notification";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAmount(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getTitle(notification: ParentNotification): string {
  if (notification.type === "App\\Notifications\\PaymentReminderNotification") {
    const { school_month, school_year } = notification.data;
    const month =
      school_month.charAt(0).toUpperCase() + school_month.slice(1);
    return `Payment Reminder — ${month} ${school_year}`;
  }
  return notification.data.title ?? "Announcement";
}

function getPreview(notification: ParentNotification): string {
  if (notification.type === "App\\Notifications\\PaymentReminderNotification") {
    const { students, total_amount } = notification.data;
    const count = students.length;
    return `${count} student${count !== 1 ? "s" : ""} — ${formatAmount(total_amount)}`;
  }
  const { message } = notification.data;
  return message.length > 120 ? message.slice(0, 120) + "…" : message;
}

// ---------------------------------------------------------------------------
// NotificationCard
// ---------------------------------------------------------------------------

interface NotificationCardProps {
  notification: ParentNotification;
  isExpanded: boolean;
  onCardClick: (notification: ParentNotification) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationCard({
  notification,
  isExpanded,
  onCardClick,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  const isUnread = notification.read_at === null;
  const isAnnouncement =
    notification.type === "App\\Notifications\\AnnouncementNotification";
  const title = getTitle(notification);
  const preview = getPreview(notification);

  return (
    <div
      role="article"
      aria-label={title}
      className={cn(
        "relative flex cursor-pointer flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30",
        isUnread && "border-primary/30 bg-primary/5"
      )}
      onClick={() => onCardClick(notification)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Unread dot */}
          <span
            aria-hidden="true"
            className={cn(
              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
              isUnread ? "bg-primary" : "bg-transparent"
            )}
          />

          <div className="min-w-0 space-y-0.5">
            <p
              className={cn(
                "text-sm leading-snug",
                isUnread ? "font-semibold" : "font-medium"
              )}
            >
              {title}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {preview}
            </p>
            <p className="text-xs text-muted-foreground">
              {relativeTime(notification.created_at)}
            </p>
          </div>
        </div>

        {/* Context menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Notification options"
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {isUnread && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id);
                }}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Mark as read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Accordion expansion for announcements */}
      {isAnnouncement && isExpanded && (
        <div
          className="ml-5 mt-1 rounded-md border border-border bg-muted/40 p-3 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="whitespace-pre-wrap text-foreground">
            {notification.data.message}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            From: {notification.data.sender_name}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.list(),
  });

  const { data: unreadData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => notificationApi.unreadCount(),
  });

  const notifications = data?.data ?? [];
  const unreadCount = unreadData?.count ?? 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unread-count"] });
  };

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.destroy(id),
    onSuccess: invalidate,
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationApi.clearAll(),
    onSuccess: () => {
      setClearDialogOpen(false);
      invalidate();
      toast.success("All notifications cleared.");
    },
  });

  function handleCardClick(notification: ParentNotification) {
    const id = notification.id;
    const isUnread = notification.read_at === null;

    if (
      notification.type === "App\\Notifications\\PaymentReminderNotification"
    ) {
      if (isUnread) markReadMutation.mutate(id);
      router.push("/payments");
      return;
    }

    // Announcement: mark read + toggle accordion
    if (isUnread) markReadMutation.mutate(id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading notifications">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  if (notifications.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Notifications</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <Bell
            className="mb-3 h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-medium">You&apos;re all caught up</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No new notifications right now.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Notification list
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              aria-label="Mark all notifications as read"
            >
              <CheckCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setClearDialogOpen(true)}
            aria-label="Clear all notifications"
          >
            Clear all
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            isExpanded={expandedIds.has(n.id)}
            onCardClick={handleCardClick}
            onMarkRead={(id) => markReadMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>

      {/* Clear all confirmation dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your notifications. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending}
              variant="destructive"
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
