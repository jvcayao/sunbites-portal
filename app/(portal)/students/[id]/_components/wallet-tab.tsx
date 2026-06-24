"use client";

import { startTransition, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { studentsApi } from "@/lib/api/portal";
import { formatDate, formatPHP } from "@/lib/format";
import { getDateRange, type DateRangeFilter } from "@/lib/date-range";
import { cn } from "@/lib/utils";
import { FilterPills } from "./filter-pills";

import type { ApiError } from "@/types/auth";
import type { Transaction } from "@/types/portal";

const TYPE_PILLS = [
  { value: "all", label: "All" },
  { value: "deposit", label: "Top-up" },
  { value: "withdraw", label: "Deductions" },
];

const TIME_PILLS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
];

interface WalletTabProps {
  studentId: number;
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.amount >= 0;
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(tx.created_at)}</td>
      <td className="px-4 py-3 text-sm capitalize">{tx.type}</td>
      <td
        className={cn(
          "px-4 py-3 text-right text-sm font-semibold tabular-nums",
          isCredit ? "text-green-600 dark:text-green-400" : "text-destructive",
        )}
      >
        {isCredit ? "+" : ""}
        {formatPHP(tx.amount)}
      </td>
    </tr>
  );
}

export function WalletTab({ studentId }: WalletTabProps) {
  const queryClient = useQueryClient();
  const [alertInput, setAlertInput] = useState<string>("");
  const [alertEditing, setAlertEditing] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const typeParam = typeFilter === "all" ? undefined : (typeFilter as "deposit" | "withdraw");
  const dateRange = timeFilter === "all" ? undefined : getDateRange(timeFilter as DateRangeFilter);

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-wallet", studentId, typeFilter, timeFilter, page],
    queryFn: () =>
      studentsApi.wallet(studentId, {
        page,
        type: typeParam,
        from: dateRange?.from,
        to: dateRange?.to,
      }),
  });

  useEffect(() => {
    if (data && !alertEditing) {
      startTransition(() => setAlertInput(String(data.wallet_alert_threshold)));
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

  function handleSaveAlert() {
    const threshold = Number(alertInput);
    if (isNaN(threshold) || threshold < 0) {
      toast.error("Enter a valid threshold amount.");
      return;
    }
    alertMutation.mutate(threshold);
  }

  function handleTypeChange(value: string) {
    setTypeFilter(value);
    setPage(1);
  }

  function handleTimeChange(value: string) {
    setTimeFilter(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Balance */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Current Balance</p>
        <p className="mt-1 text-4xl font-bold tabular-nums">
          {data ? formatPHP(data.balance) : "—"}
        </p>
      </div>

      {/* Low Balance Alert */}
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
                {data ? formatPHP(data.wallet_alert_threshold) : "—"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAlertInput(String(data?.wallet_alert_threshold ?? 0));
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
              <Button size="sm" onClick={handleSaveAlert} disabled={alertMutation.isPending}>
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

      {/* Filters */}
      <div className="space-y-2">
        <FilterPills pills={TYPE_PILLS} active={typeFilter} onSelect={handleTypeChange} ariaLabel="Filter by type" />
        <FilterPills pills={TIME_PILLS} active={timeFilter} onSelect={handleTimeChange} ariaLabel="Filter by time" />
      </div>

      {/* Transactions */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load transactions. Please try again.</p>
      ) : !data?.data.length ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No transactions match the selected filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {data.data.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>

          {(data.meta.current_page > 1 || data.meta.current_page < data.meta.last_page) && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={data.meta.current_page === 1}
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
                disabled={data.meta.current_page === data.meta.last_page}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
