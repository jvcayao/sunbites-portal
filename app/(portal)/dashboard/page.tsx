"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShoppingBag, Wallet } from "lucide-react";

import { EnrollmentStatusBadge } from "@/components/enrollment-status-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api/portal";
import { formatDate, formatPHP } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { RecentOrder, StudentSummary } from "@/types/portal";

function StudentCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-28" />
      <div className="pt-2 border-t border-border">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
    </div>
  );
}

function StudentCard({ student }: { student: StudentSummary }) {
  const isSubscription = student.student_type === "subscription";

  return (
    <Link
      href={`/students/${student.id}`}
      className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`View details for ${student.full_name}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-semibold text-base leading-tight">{student.full_name}</p>
        <EnrollmentStatusBadge status={student.enrollment_status} />
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {student.grade_level} &middot; {student.branch_name}
      </p>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={
            isSubscription
              ? "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700"
              : "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground"
          }
        >
          {isSubscription ? "Subscription" : "Non-Subscription"}
        </span>
      </div>

      <div className="pt-3 border-t border-border flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-lg font-bold tabular-nums">
              {formatPHP(student.wallet_balance)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Wallet balance</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

type MethodFilter = "all" | "cash" | "wallet";
type DateFilter = "all" | "today" | "week" | "month";

const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  all: "All time",
  today: "Today",
  week: "This week",
  month: "This month",
};

function isWithinDateFilter(dateStr: string, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (filter === "today") return date >= startOfDay;
  if (filter === "week") {
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    return date >= startOfWeek;
  }
  if (filter === "month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  return true;
}

function RecentOrderRow({ order }: { order: RecentOrder }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm font-medium">{order.student_full_name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(order.created_at)}
      </td>
      <td className="px-4 py-3 text-sm">
        <Badge
          variant={order.payment_method === "wallet" ? "default" : "secondary"}
          className="rounded-full text-xs capitalize"
        >
          {order.payment_method === "wallet" ? "Wallet" : "Cash"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">
        {formatPHP(order.total)}
      </td>
    </tr>
  );
}

function RecentOrdersSection({
  orders,
  students,
}: {
  orders: RecentOrder[];
  students: StudentSummary[];
}) {
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const filtered = orders.filter((o) => {
    const byStudent = studentFilter === "all" || o.student_full_name === studentFilter;
    const byMethod = methodFilter === "all" || o.payment_method === methodFilter;
    const byDate = isWithinDateFilter(o.created_at, dateFilter);
    return byStudent && byMethod && byDate;
  });

  const totalAmount = filtered.reduce((sum, o) => sum + o.total, 0);

  return (
    <section aria-labelledby="orders-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="orders-heading" className="text-base font-semibold">
          Recent Orders
        </h2>
        <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {students.length > 1 && (
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            aria-label="Filter by student"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All Students</option>
            {students.map((s) => (
              <option key={s.id} value={s.full_name}>
                {s.full_name}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1" role="group" aria-label="Filter by payment method">
          {(["all", "cash", "wallet"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethodFilter(m)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                methodFilter === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Filter by date">
          {(["all", "today", "week", "month"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDateFilter(d)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                dateFilter === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {DATE_FILTER_LABELS[d]}
            </button>
          ))}
        </div>

        {filtered.length > 0 && (
          <p className="ml-auto text-xs text-muted-foreground tabular-nums">
            {filtered.length} order{filtered.length !== 1 ? "s" : ""} &middot; {formatPHP(totalAmount)}
          </p>
        )}
      </div>

      {/* Table */}
      {!filtered.length ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No orders match the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {students.length > 1 && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Student</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Method</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  {students.length > 1 && (
                    <td className="px-4 py-3 text-sm font-medium">{order.student_full_name}</td>
                  )}
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      variant={order.payment_method === "wallet" ? "default" : "secondary"}
                      className="rounded-full text-xs capitalize"
                    >
                      {order.payment_method === "wallet" ? "Wallet" : "Cash"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">
                    {formatPHP(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your linked students and recent activity.
        </p>
      </div>

      {/* Students */}
      <section aria-labelledby="students-heading">
        <h2 id="students-heading" className="mb-4 text-base font-semibold">
          Your Students
        </h2>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StudentCardSkeleton />
            <StudentCardSkeleton />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">
            Failed to load dashboard. Please refresh the page.
          </p>
        ) : !data?.students.length ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No students linked to your account yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Orders */}
      {isLoading ? (
        <section aria-labelledby="orders-heading">
          <h2 id="orders-heading" className="text-base font-semibold mb-3">Recent Orders</h2>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </section>
      ) : data ? (
        <RecentOrdersSection
          orders={data.recent_orders}
          students={data.students}
        />
      ) : null}
    </div>
  );
}
