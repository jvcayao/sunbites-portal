"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { EnrollmentStatusBadge } from "@/components/enrollment-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { studentsApi } from "@/lib/api/portal";
import { formatDate, formatPHP } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { ApiError } from "@/types/auth";
import type { ActivityItem, Transaction } from "@/types/portal";

// ---- Tabs ----

type Tab = "activity" | "wallet";

const tabs: { id: Tab; label: string }[] = [
  { id: "activity", label: "Activity" },
  { id: "wallet", label: "Wallet" },
];

// ---- Activity Tab ----

function ActivityItemRow({ item }: { item: ActivityItem }) {
  const itemNames = item.items.map((i) => `${i.name} x${i.quantity}`).join(", ");
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(item.created_at)}
      </td>
      <td className="px-4 py-3 text-sm">{itemNames}</td>
      <td className="px-4 py-3 text-sm">
        {item.payment_method === "wallet"
          ? "Wallet"
          : item.payment_method === "subscription"
            ? "Subscription"
            : item.payment_method === "gcash"
              ? "GCash"
              : "Cash"}
      </td>
      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">
        {formatPHP(item.total)}
      </td>
    </tr>
  );
}

function ActivityTab({ studentId }: { studentId: number }) {
  const [page, setPage] = useState(1);
  const perPage = 15;

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-activity", studentId, page],
    queryFn: () => studentsApi.activity(studentId, { page, per_page: perPage }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load activity. Please try again.
      </p>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">No order activity yet.</p>
      </div>
    );
  }

  const hasMore = data.meta.current_page < data.meta.last_page;
  const hasPrev = data.meta.current_page > 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total spent:{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {formatPHP(data.spending_total)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {data.meta.total} order{data.meta.total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Method
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {data.data.map((item) => (
              <ActivityItemRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      {(hasPrev || hasMore) && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={!hasPrev}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {data.meta.current_page} of {data.meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// ---- Wallet Tab ----

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.amount >= 0;
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(tx.created_at)}
      </td>
      <td className="px-4 py-3 text-sm capitalize">{tx.type}</td>
      <td
        className={cn(
          "px-4 py-3 text-right text-sm font-semibold tabular-nums",
          isCredit ? "text-green-600 dark:text-green-400" : "text-destructive"
        )}
      >
        {isCredit ? "+" : ""}
        {formatPHP(tx.amount)}
      </td>
    </tr>
  );
}

function WalletTab({ studentId }: { studentId: number }) {
  const queryClient = useQueryClient();
  const [alertInput, setAlertInput] = useState<string>("");
  const [alertEditing, setAlertEditing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-wallet", studentId],
    queryFn: () => studentsApi.wallet(studentId),
  });

  useEffect(() => {
    if (data && !alertEditing) {
      setAlertInput(String(data.wallet_alert_threshold));
    }
  }, [data, alertEditing]);

  const alertMutation = useMutation({
    mutationFn: (threshold: number) => studentsApi.setAlert(studentId, threshold),
    onSuccess: () => {
      toast.success("Wallet alert threshold updated.");
      setAlertEditing(false);
      queryClient.invalidateQueries({ queryKey: ["student-wallet", studentId] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to update threshold.");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-40" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-destructive">
        Failed to load wallet. Please try again.
      </p>
    );
  }

  function handleSaveAlert() {
    const threshold = Number(alertInput);
    if (isNaN(threshold) || threshold < 0) {
      toast.error("Enter a valid threshold amount.");
      return;
    }
    alertMutation.mutate(threshold);
  }

  return (
    <div className="space-y-6">
      {/* Balance */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Current Balance</p>
        <p className="mt-1 text-4xl font-bold tabular-nums">
          {formatPHP(data.balance)}
        </p>
      </div>

      {/* Alert threshold */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Low Balance Alert</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Get notified when balance drops below this amount.
            </p>
          </div>
          {!alertEditing ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tabular-nums">
                {formatPHP(data.wallet_alert_threshold)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAlertInput(String(data.wallet_alert_threshold));
                  setAlertEditing(true);
                }}
              >
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="1"
                value={alertInput}
                onChange={(e) => setAlertInput(e.target.value)}
                className="w-28"
                aria-label="Alert threshold amount"
              />
              <Button
                size="sm"
                onClick={handleSaveAlert}
                disabled={alertMutation.isPending}
              >
                {alertMutation.isPending ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAlertEditing(false)}
                disabled={alertMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Recent Transactions</h3>
        {data.data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {data.data.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main Page ----

function StudentDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-5 w-40" />
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = Number(params.id);
  const [activeTab, setActiveTab] = useState<Tab>("activity");

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: studentsApi.list,
  });

  const student = studentsData?.data.find((s) => s.id === studentId);

  return (
    <div className="space-y-6">
      {/* Student header */}
      {studentsLoading ? (
        <StudentDetailSkeleton />
      ) : student ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{student.full_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {student.grade_level} &middot; {student.branch_name}
            </p>
          </div>
          <EnrollmentStatusBadge status={student.enrollment_status} />
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold">Student</h1>
        </div>
      )}

      {/* Tab bar */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-4" aria-label="Student tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={cn(
                "border-b-2 pb-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "activity" ? (
        <ActivityTab studentId={studentId} />
      ) : (
        <WalletTab studentId={studentId} />
      )}
    </div>
  );
}
