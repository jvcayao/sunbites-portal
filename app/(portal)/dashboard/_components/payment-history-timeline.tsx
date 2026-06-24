"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { studentsApi } from "@/lib/api/portal";
import type { StudentSummary } from "@/types/portal";

const MONTH_LABELS: Record<string, string> = {
  june: "Jun",
  july: "Jul",
  august: "Aug",
  september: "Sep",
  october: "Oct",
  november: "Nov",
  december: "Dec",
  january: "Jan",
  february: "Feb",
  march: "Mar",
  april: "Apr",
  may: "May",
};

function isCurrentSchoolMonth(schoolMonth: string, year: number): boolean {
  const now = new Date();
  const currentMonthName = now
    .toLocaleString("en-US", { month: "long" })
    .toLowerCase();
  return schoolMonth === currentMonthName && year === now.getFullYear();
}

interface Props {
  student: StudentSummary;
  color: string;
}

export function PaymentHistoryTimeline({ student, color }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["payment-history", student.id],
    queryFn: () => studentsApi.paymentHistory(student.id),
  });

  if (isLoading) {
    return (
      <div className="border-t border-border px-6 py-4">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const entries = data?.data ?? [];
  if (!entries.length) return null;

  const recent = entries.slice(-5);
  const currentEntry = recent.find((p) =>
    isCurrentSchoolMonth(p.school_month, p.year),
  );
  const isOverdue = currentEntry !== undefined && currentEntry.status !== "paid";

  return (
    <div className="border-t border-border px-6 py-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-muted-foreground">
          Subscription Payments · {new Date().getFullYear()}
        </p>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            isOverdue
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600",
          )}
        >
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              isOverdue ? "bg-red-500" : "bg-emerald-500",
            )}
          />
          {isOverdue ? "Overdue" : "Current"}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {recent.map((payment) => {
          const isCurrent = isCurrentSchoolMonth(
            payment.school_month,
            payment.year,
          );
          const isPaid = payment.status === "paid";

          return (
            <div
              key={`${payment.school_month}-${payment.year}`}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2.5",
                isCurrent ? "border-transparent" : "border-border",
              )}
              style={
                isCurrent
                  ? {
                      backgroundColor: `${color}12`,
                      borderColor: `${color}40`,
                    }
                  : undefined
              }
            >
              <span
                className="text-[11px] font-bold uppercase tracking-[0.4px]"
                style={{ color: isCurrent ? color : undefined }}
              >
                {MONTH_LABELS[payment.school_month] ?? payment.school_month}
              </span>
              <span className="-mt-1 text-[10px] text-muted-foreground">
                {payment.year}
              </span>
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  isPaid ? "bg-emerald-50" : "bg-red-50",
                )}
              >
                {isPaid ? (
                  <CheckIcon
                    className="h-3.5 w-3.5 text-emerald-600"
                    strokeWidth={2.5}
                  />
                ) : (
                  <XIcon
                    className="h-3.5 w-3.5 text-red-600"
                    strokeWidth={2.5}
                  />
                )}
              </div>
              <span
                className="text-[11px] font-bold"
                style={{ color: isCurrent ? color : undefined }}
              >
                ₱{payment.amount.toLocaleString("en-PH")}
              </span>
              <span
                className={cn(
                  "text-center text-[10px]",
                  isPaid ? "text-muted-foreground" : "font-semibold text-red-500",
                )}
              >
                {isPaid
                  ? payment.paid_at
                    ? new Date(payment.paid_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"
                  : "Unpaid"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
