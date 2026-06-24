"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

import { EnrollmentStatusBadge } from "@/components/enrollment-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api/portal";
import { formatPHP } from "@/lib/format";

import type { StudentSummary } from "@/types/portal";

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
        <p className="font-semibold text-base leading-tight">
          {student.full_name}
        </p>
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
            <Wallet
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
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
    </div>
  );
}
