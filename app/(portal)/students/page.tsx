"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";

import { useAuthStore } from "@/lib/store/auth";

import { EnrollmentStatusBadge } from "@/components/enrollment-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { studentsApi } from "@/lib/api/portal";
import { formatPHP } from "@/lib/format";

import type { StudentDetail } from "@/types/portal";

function StudentRowSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}

function StudentRow({ student }: { student: StudentDetail }) {
  return (
    <Link
      href={`/students/${student.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-xl"
      aria-label={`View ${student.full_name}'s details`}
    >
      <Card className="transition-colors group-hover:bg-muted/30">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-start gap-3">
              <div>
                <CardTitle className="text-base">{student.full_name}</CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {student.grade_level} &middot; {student.branch_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <EnrollmentStatusBadge status={student.enrollment_status} />
              <ChevronRight
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <span className="text-muted-foreground">Wallet balance: </span>
            <span className="font-semibold tabular-nums">
              {formatPHP(student.wallet_balance)}
            </span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function StudentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: studentsApi.list,
  });

  // Keep has_subscription_student flag accurate after staff enrollment changes.
  const updateParent = useAuthStore((s) => s.updateParent);
  const parent = useAuthStore((s) => s.parent);

  useEffect(() => {
    const students = data?.data;
    if (!students || !parent) return;
    const hasSubscription = students.some((s) => s.student_type === "subscription");
    if (parent.has_subscription_student !== hasSubscription) {
      updateParent({ ...parent, has_subscription_student: hasSubscription });
    }
  }, [data, parent, updateParent]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All students linked to your account.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <StudentRowSkeleton />
          <StudentRowSkeleton />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          Failed to load students. Please refresh the page.
        </p>
      ) : !data?.data.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">
            No students linked to your account.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((student) => (
            <StudentRow key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
