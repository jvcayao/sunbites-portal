"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CreditCard, ExternalLink, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NotificationItem } from "@/components/notification-item";
import { notificationApi } from "@/lib/api/notifications";
import { cn } from "@/lib/utils";

import type {
  NotificationListResponse,
  ParentNotification,
} from "@/types/notification";

type Tab = "all" | "unread";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByDate(
  items: ParentNotification[]
): { label: string; items: ParentNotification[] }[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
  return [
    { label: "Today", items: items.filter((n) => new Date(n.created_at) >= startOfToday) },
    {
      label: "Yesterday",
      items: items.filter(
        (n) =>
          new Date(n.created_at) >= startOfYesterday &&
          new Date(n.created_at) < startOfToday
      ),
    },
    { label: "Earlier", items: items.filter((n) => new Date(n.created_at) < startOfYesterday) },
  ].filter((g) => g.items.length > 0);
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function NotificationSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border border-l-4 border-l-muted bg-card p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail Sheet
// ---------------------------------------------------------------------------

interface DetailSheetProps {
  notification: ParentNotification | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function NotificationDetailSheet({
  notification,
  onClose,
  onDelete,
  isDeleting,
}: DetailSheetProps) {
  const router = useRouter();

  const isPayment =
    notification?.type === "App\\Notifications\\PaymentReminderNotification";
  const isAnnouncement =
    notification?.type === "App\\Notifications\\AnnouncementNotification";

  return (
    <Sheet open={notification !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {notification && (
          <div className="px-2 pb-6 space-y-6">
            <SheetHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
                    isPayment
                      ? "bg-red-100 text-red-700 border-red-300"
                      : "bg-amber-100 text-amber-700 border-amber-300"
                  )}
                >
                  {isPayment ? "Payment" : "Announcement"}
                </span>
                {notification.read_at === null && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/30">
                    Unread
                  </span>
                )}
              </div>
              <SheetTitle className="text-left">
                {isPayment
                  ? "Payment Reminder"
                  : (notification.data.title ?? "Announcement")}
              </SheetTitle>
              <SheetDescription className="text-left">
                {new Date(notification.created_at).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </SheetDescription>
            </SheetHeader>

            {/* Content */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              {isPayment ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Payment Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Period</span>
                      <span className="font-medium capitalize">
                        {notification.data.school_month} {notification.data.school_year}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Due date</span>
                      <span className="font-medium">
                        {new Date(notification.data.due_date).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {notification.data.students.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-border pt-3">
                        {notification.data.students.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{s.name}</span>
                            <span className="font-semibold text-foreground">
                              ₱{s.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                      <span className="text-sm font-semibold">Total</span>
                      <span className="text-base font-bold text-foreground">
                        ₱{notification.data.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Message
                  </p>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {notification.data.message}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    From: {notification.data.sender_name}
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(notification.id)}
                disabled={isDeleting}
                className="text-destructive border-destructive/40 hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
              {isPayment && (
                <Button
                  size="sm"
                  onClick={() => {
                    onClose();
                    const students = notification.data.students;
                    const firstWithId = students.find((s) => s.id != null);
                    router.push(
                      firstWithId
                        ? `/students/${firstWithId.id}?tab=payment-history`
                        : "/students"
                    );
                  }}
                >
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  View Payments
                </Button>
              )}
              {isAnnouncement && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<ParentNotification | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.list(),
  });

  const { data: countData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => notificationApi.unreadCount(),
  });

  const unreadCount = countData?.count ?? 0;
  const notifications = data?.data ?? [];

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unread-count"] });
  }

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData(["notifications"]) as NotificationListResponse | undefined;
      queryClient.setQueryData(["notifications"], (old: NotificationListResponse | undefined) => ({
        ...old,
        data: old?.data?.map((n: ParentNotification) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        ),
      }));
      return { prev };
    },
    onError: (_err: unknown, _id: string, ctx: { prev: NotificationListResponse | undefined } | undefined) => {
      if (ctx?.prev) queryClient.setQueryData(["notifications"], ctx.prev);
    },
    onSettled: () => invalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.destroy(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData(["notifications"]) as NotificationListResponse | undefined;
      queryClient.setQueryData(["notifications"], (old: NotificationListResponse | undefined) => ({
        ...old,
        data: old?.data?.filter((n: ParentNotification) => n.id !== id),
      }));
      return { prev };
    },
    onError: (_err: unknown, _id: string, ctx: { prev: NotificationListResponse | undefined } | undefined) => {
      if (ctx?.prev) queryClient.setQueryData(["notifications"], ctx.prev);
      toast.error("Failed to delete notification.");
    },
    onSettled: () => {
      invalidateAll();
      setSelectedNotification(null);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      invalidateAll();
      toast.success("All notifications marked as read.");
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationApi.clearAll(),
    onSuccess: () => {
      invalidateAll();
      setClearDialogOpen(false);
      toast.success("All notifications cleared.");
    },
  });

  function handleOpen(notification: ParentNotification) {
    setSelectedNotification(notification);
    if (notification.read_at === null) {
      markReadMutation.mutate(notification.id);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Activity</p>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>
        <NotificationSkeleton />
      </div>
    );
  }

  const displayed =
    activeTab === "unread"
      ? notifications.filter((n) => n.read_at === null)
      : notifications;

  const groups = groupByDate(displayed);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Activity</p>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              aria-label="Mark all notifications as read"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              <span>Mark all read</span>
            </Button>
          )}
          {notifications.length > 0 && (
            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Clear all notifications"
                  />
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Clear all</span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your notifications. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => clearAllMutation.mutate()}
                    disabled={clearAllMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {clearAllMutation.isPending ? "Clearing…" : "Clear all"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "all"}
          className={cn(
            "px-3 py-2 text-sm transition-colors",
            activeTab === "all"
              ? "-mb-px border-b-2 border-primary font-semibold text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "unread"}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm transition-colors",
            activeTab === "unread"
              ? "-mb-px border-b-2 border-primary font-semibold text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("unread")}
        >
          Unread
          {unreadCount > 0 && (
            <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Empty state */}
      {displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-muted-foreground">You&apos;re all caught up</p>
        </div>
      )}

      {/* Grouped list */}
      {groups.map((group) => (
        <div key={group.label} className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
              {group.label}
            </p>
            <Separator className="flex-1" />
          </div>
          <div className="flex flex-col gap-3">
            {group.items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                variant="card"
                onCardClick={() => handleOpen(n)}
                onMarkRead={(id) => markReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
                isMarkingRead={
                  markReadMutation.isPending && markReadMutation.variables === n.id
                }
                isDeleting={
                  deleteMutation.isPending && deleteMutation.variables === n.id
                }
              />
            ))}
          </div>
        </div>
      ))}

      {/* Detail sheet */}
      <NotificationDetailSheet
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeleting={
          deleteMutation.isPending &&
          deleteMutation.variables === selectedNotification?.id
        }
      />
    </div>
  );
}
