"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";

import { EnrollmentStatusBadge } from "@/components/enrollment-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api/portal";
import { formatDate, formatPHP } from "@/lib/format";

import type { RecentOrder, StudentSummary } from "@/types/portal";

function StudentCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20" />
      </CardContent>
    </Card>
  );
}

function StudentCard({ student }: { student: StudentSummary }) {
  return (
    <Link
      href={`/students/${student.id}`}
      className="group block rounded-xl ring-1 ring-foreground/10 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`View details for ${student.full_name}`}
    >
      <Card className="h-full ring-0 transition-colors group-hover:bg-muted/30">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{student.full_name}</CardTitle>
            <EnrollmentStatusBadge status={student.enrollment_status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {student.grade_level} &middot; {student.branch_name}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1.5 text-sm">
            <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium">{formatPHP(student.wallet_balance)}</span>
            <span className="text-muted-foreground">balance</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RecentOrderRow({ order }: { order: RecentOrder }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4 text-sm font-medium">{order.student_full_name}</td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">
        {formatDate(order.created_at)}
      </td>
      <td className="py-3 pr-4 text-sm">
        <span className="inline-flex items-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium capitalize">
          {order.payment_method === "wallet" ? "Wallet" : "Cash"}
        </span>
      </td>
      <td className="py-3 text-right text-sm font-semibold tabular-nums">
        {formatPHP(order.total)}
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your linked students and recent activity.
        </p>
      </div>

      {/* Students section */}
      <section aria-labelledby="students-heading">
        <h2 id="students-heading" className="mb-4 text-lg font-semibold">
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
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
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

      {/* Recent orders section */}
      <section aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="mb-4 text-lg font-semibold">
          Recent Orders
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? null : !data?.recent_orders.length ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No recent orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3 pr-4 text-left text-xs font-medium text-muted-foreground">
                    Student
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium text-muted-foreground">
                    Method
                  </th>
                  <th className="py-3 text-right text-xs font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card px-4">
                {data.recent_orders.map((order) => (
                  <RecentOrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
