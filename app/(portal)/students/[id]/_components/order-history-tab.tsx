"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { studentsApi } from "@/lib/api/portal";
import { formatDate, formatPHP } from "@/lib/format";
import { getDateRange, type DateRangeFilter } from "@/lib/date-range";
import { FilterPills } from "./filter-pills";

import type { ActivityItem } from "@/types/portal";

const METHOD_PILLS = [
  { value: "all", label: "All" },
  { value: "cash", label: "Cash" },
  { value: "wallet", label: "Wallet" },
];

const TIME_PILLS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  wallet: "Wallet",
  subscription: "Subscription",
  gcash: "GCash",
};

interface OrderHistoryTabProps {
  studentId: number;
}

function OrderRow({ item }: { item: ActivityItem }) {
  const itemNames = item.items.map((i) => `${i.name} x${i.quantity}`).join(", ");
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(item.created_at)}</td>
      <td className="px-4 py-3 text-sm">{itemNames}</td>
      <td className="px-4 py-3 text-sm">{PAYMENT_METHOD_LABELS[item.payment_method] ?? item.payment_method}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">{formatPHP(item.total)}</td>
    </tr>
  );
}

export function OrderHistoryTab({ studentId }: OrderHistoryTabProps) {
  const [methodFilter, setMethodFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const methodParam = methodFilter === "all" ? undefined : (methodFilter as "cash" | "wallet");
  const dateRange = timeFilter === "all" ? undefined : getDateRange(timeFilter as DateRangeFilter);

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-activity", studentId, methodFilter, timeFilter, page],
    queryFn: () =>
      studentsApi.activity(studentId, {
        page,
        per_page: perPage,
        payment_method: methodParam,
        from: dateRange?.from,
        to: dateRange?.to,
      }),
  });

  function handleMethodChange(value: string) {
    setMethodFilter(value);
    setPage(1);
  }

  function handleTimeChange(value: string) {
    setTimeFilter(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-2">
        <FilterPills pills={METHOD_PILLS} active={methodFilter} onSelect={handleMethodChange} />
        <FilterPills pills={TIME_PILLS} active={timeFilter} onSelect={handleTimeChange} />
      </div>

      {/* Summary */}
      {data && (
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
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load order history. Please try again.</p>
      ) : !data?.data.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No orders match the selected filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Method</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {data.data.map((item) => (
                  <OrderRow key={item.id} item={item} />
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
