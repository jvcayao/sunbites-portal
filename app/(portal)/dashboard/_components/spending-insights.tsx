"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentsApi } from "@/lib/api/portal";
import type { StudentSummary } from "@/types/portal";
import { StudentSwitcher, STUDENT_COLORS } from "./student-switcher";
import { SpendingStatCells } from "./spending-stat-cells";
import { MonthlyTrendChart } from "./monthly-trend-chart";
import { TopItemsList } from "./top-items-list";
import { PaymentMethodSplit } from "./payment-method-split";
import { PaymentHistoryTimeline } from "./payment-history-timeline";

interface Props {
  students: StudentSummary[];
}

export function SpendingInsights({ students }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeStudent = students[activeIndex];
  const color = STUDENT_COLORS[activeIndex] ?? "#6B7280";

  const { data, isLoading, error } = useQuery({
    queryKey: ["spending-summary", activeStudent?.id],
    queryFn: () => studentsApi.spendingSummary(activeStudent!.id),
    enabled: students.length > 0,
  });

  if (!students.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="mb-4 px-6 pt-5">
        <h2 className="text-[15px] font-bold tracking-tight">
          Monthly Spending Overview
        </h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Canteen activity per student
        </p>
      </div>

      <div className="mb-5 px-6">
        <StudentSwitcher
          students={students}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
      </div>

      {isLoading && (
        <div className="border-y border-border">
          <div className="grid grid-cols-3 divide-x divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4">
                <div className="mb-3 h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-6 w-28 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="px-6 py-4 text-sm text-destructive">
          Failed to load spending data.
        </p>
      )}

      {data && (
        <>
          <SpendingStatCells data={data} />

          <div className="grid grid-cols-[1fr_290px] divide-x divide-border border-b border-border">
            <div className="p-6 pt-5">
              <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Monthly Trend
              </p>
              <MonthlyTrendChart data={data.monthly} color={color} />
            </div>
            <div className="p-6 pt-5">
              <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Top Items This Month
              </p>
              <TopItemsList items={data.top_items} color={color} />
            </div>
          </div>

          <div className="flex items-center gap-5 px-6 py-4">
            <p className="whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.8px] text-muted-foreground">
              Payment
              <br />
              Method
            </p>
            <div className="flex-1">
              <PaymentMethodSplit
                split={data.payment_method_split}
                color={color}
              />
            </div>
          </div>

          {activeStudent.student_type === "subscription" && (
            <PaymentHistoryTimeline student={activeStudent} color={color} />
          )}
        </>
      )}
    </div>
  );
}
