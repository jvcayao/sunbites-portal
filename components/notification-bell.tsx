"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CreditCard,
  ExternalLink,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { NotificationItem } from "@/components/notification-item";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEcho } from "@/components/providers/echo-provider";
import { notificationApi } from "@/lib/api/notifications";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

import type {
  NotificationListResponse,
  ParentNotification,
} from "@/types/notification";

interface Props {
  className?: string;
}

function groupByDate(
  items: ParentNotification[],
): { label: string; items: ParentNotification[] }[] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
  return [
    {
      label: "Today",
      items: items.filter((n) => new Date(n.created_at) >= startOfToday),
    },
    {
      label: "Yesterday",
      items: items.filter(
        (n) =>
          new Date(n.created_at) >= startOfYesterday &&
          new Date(n.created_at) < startOfToday,
      ),
    },
    {
      label: "Earlier",
      items: items.filter((n) => new Date(n.created_at) < startOfYesterday),
    },
  ].filter((g) => g.items.length > 0);
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
                      : "bg-amber-100 text-amber-700 border-amber-300",
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
                        {notification.data.school_month}{" "}
                        {notification.data.school_year}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Due date</span>
                      <span className="font-medium">
                        {new Date(
                          notification.data.due_date,
                        ).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {notification.data.students.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-border pt-3">
                        {notification.data.students.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-foreground">
                              {s.full_name}
                            </span>
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
                    const firstWithId = notification.data.students.find(
                      (s) => s.id != null,
                    );
                    router.push(
                      firstWithId
                        ? `/students/${firstWithId.id}?tab=payment-history`
                        : "/students",
                    );
                  }}
                >
                  <CreditCard
                    className="h-3.5 w-3.5 mr-1.5"
                    aria-hidden="true"
                  />
                  View Payments
                </Button>
              )}
              {isAnnouncement && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  <ExternalLink
                    className="h-3.5 w-3.5 mr-1.5"
                    aria-hidden="true"
                  />
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
// Notification Panel
// ---------------------------------------------------------------------------

function NotificationPanel({
  onClose,
  onItemSelect,
}: {
  onClose: () => void;
  onItemSelect: (n: ParentNotification) => void;
}) {
  const queryClient = useQueryClient();

  const { data: listData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.list(),
  });

  const { data: countData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => notificationApi.unreadCount(),
  });

  const unreadCount = countData?.count ?? 0;
  const notifications = listData?.data ?? [];

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unread-count"] });
  }

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData(["notifications"]) as
        | NotificationListResponse
        | undefined;
      queryClient.setQueryData(
        ["notifications"],
        (old: NotificationListResponse | undefined) => ({
          ...old,
          data: old?.data?.map((n: ParentNotification) =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
        }),
      );
      return { prev };
    },
    onError: (
      _err: unknown,
      _id: string,
      ctx: { prev: NotificationListResponse | undefined } | undefined,
    ) => {
      if (ctx?.prev) queryClient.setQueryData(["notifications"], ctx.prev);
    },
    onSettled: () => invalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.destroy(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData(["notifications"]) as
        | NotificationListResponse
        | undefined;
      queryClient.setQueryData(
        ["notifications"],
        (old: NotificationListResponse | undefined) => ({
          ...old,
          data: old?.data?.filter((n: ParentNotification) => n.id !== id),
        }),
      );
      return { prev };
    },
    onError: (
      _err: unknown,
      _id: string,
      ctx: { prev: NotificationListResponse | undefined } | undefined,
    ) => {
      if (ctx?.prev) queryClient.setQueryData(["notifications"], ctx.prev);
    },
    onSettled: () => invalidateAll(),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => invalidateAll(),
  });

  function handleOpen(n: ParentNotification) {
    if (n.read_at === null) {
      markReadMutation.mutate(n.id);
    }
    onItemSelect(n);
  }

  const groups = groupByDate(notifications);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold">Notifications</span>
        {unreadCount > 0 && (
          <button
            type="button"
            aria-label="Mark all as read"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-muted"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto">
        {isLoading && (
          <div className="space-y-px">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-muted" />
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bell
              className="mb-2 h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-xs text-muted-foreground">
              No new notifications
            </p>
          </div>
        )}

        {!isLoading &&
          groups.map((group) => (
            <div key={group.label}>
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {group.label}
              </p>
              {group.items.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markReadMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isMarkingRead={
                    markReadMutation.isPending &&
                    markReadMutation.variables === n.id
                  }
                  isDeleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === n.id
                  }
                  onNavigate={onClose}
                  onCardClick={() => handleOpen(n)}
                />
              ))}
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-2.5 text-center">
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-xs text-primary hover:underline"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bell
// ---------------------------------------------------------------------------

export function NotificationBell({ className }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<ParentNotification | null>(null);
  const queryClient = useQueryClient();
  const echo = useEcho();
  const parent = useAuthStore((s) => s.parent);

  const { data } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => notificationApi.unreadCount(),
    enabled: !!parent,
  });

  const unreadCount = data?.count ?? 0;

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unread-count"] });
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.destroy(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData(["notifications"]) as
        | NotificationListResponse
        | undefined;
      queryClient.setQueryData(
        ["notifications"],
        (old: NotificationListResponse | undefined) => ({
          ...old,
          data: old?.data?.filter((n: ParentNotification) => n.id !== id),
        }),
      );
      return { prev };
    },
    onError: (
      _err: unknown,
      _id: string,
      ctx: { prev: NotificationListResponse | undefined } | undefined,
    ) => {
      if (ctx?.prev) queryClient.setQueryData(["notifications"], ctx.prev);
    },
    onSettled: () => {
      invalidateAll();
      setSelectedNotification(null);
    },
  });

  useEffect(() => {
    if (!echo || !parent) return;
    const channel = echo
      .private(`parents.${parent.id}`)
      .listen("PaymentReminderNotification", () => {
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      })
      .listen("AnnouncementNotification", () => {
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });
    return () => {
      channel.stopListening("PaymentReminderNotification");
      channel.stopListening("AnnouncementNotification");
    };
  }, [echo, parent, queryClient]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label={
                unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : "Notifications"
              }
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
                className,
              )}
            />
          }
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
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0">
          <NotificationPanel
            onClose={() => setOpen(false)}
            onItemSelect={(n) => {
              setSelectedNotification(n);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <NotificationDetailSheet
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeleting={
          deleteMutation.isPending &&
          deleteMutation.variables === selectedNotification?.id
        }
      />
    </>
  );
}
