"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { mealPlanApi } from "@/lib/api/portal";
import { cn } from "@/lib/utils";

import type { MealPlanDay } from "@/types/portal";

// ─── Constants ────────────────────────────────────────────────────────────────

const SCHOOL_MONTHS = [
  { key: "june", label: "Jun" },
  { key: "july", label: "Jul" },
  { key: "august", label: "Aug" },
  { key: "september", label: "Sep" },
  { key: "october", label: "Oct" },
  { key: "november", label: "Nov" },
  { key: "december", label: "Dec" },
  { key: "january", label: "Jan" },
  { key: "february", label: "Feb" },
  { key: "march", label: "Mar" },
] as const;

const WEEK_TABS = [1, 2, 3, 4] as const;

const COLUMNS = [
  { key: "ulam", label: "Ulam", bg: "bg-orange-50" },
  { key: "vegetables", label: "Vegetables", bg: "bg-green-50" },
  { key: "fruit", label: "Fruit", bg: "bg-blue-50" },
  { key: "soup", label: "Soup", bg: "bg-sky-50" },
  { key: "snacks", label: "Snacks", bg: "bg-purple-50" },
] as const;

// ─── Sub-components ────────────────────────────────────────────────────────────

function PillButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border-2 px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:border-primary/50",
        className,
      )}
    >
      {children}
    </button>
  );
}

function MealPlanSkeleton() {
  return (
    <div className="mt-4 overflow-x-auto">
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

function MealPlanError() {
  return (
    <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
      <p className="text-sm text-destructive">
        Failed to load meal plan. Please try again.
      </p>
    </div>
  );
}

function MealPlanNotAvailable() {
  return (
    <div className="mt-4 rounded-xl bg-muted p-6 text-center">
      <p className="text-sm text-muted-foreground">
        Meal plan for this week is not yet available.
      </p>
    </div>
  );
}

function MealGrid({ days }: { days: MealPlanDay[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="w-24 bg-primary px-3 py-2 text-left text-sm font-semibold text-primary-foreground">
              Day
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className="bg-primary px-3 py-2 text-left text-sm font-semibold text-primary-foreground"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.day} className="border-b border-border">
              <td className="bg-muted px-3 py-2 text-sm font-bold text-primary">
                {day.day_label}
              </td>
              {COLUMNS.map((col) => (
                <td key={col.key} className={cn("px-3 py-2 text-sm", col.bg)}>
                  {day[col.key] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MealPlanPage() {
  const [activeMonth, setActiveMonth] = useState<string>("june");
  const [activeWeek, setActiveWeek] = useState<number>(1);

  // TODO: If the API adds multi-branch support, add a branch selector above the
  // month tabs here. For now, the backend derives branch from the linked student.

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal-meal-plan", activeMonth, activeWeek],
    queryFn: () => mealPlanApi.get(activeMonth, activeWeek),
  });

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Meal Plan</h1>

      {/* Month tab row — all 10 school months, horizontally scrollable */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {SCHOOL_MONTHS.map((m) => (
            <PillButton
              key={m.key}
              active={activeMonth === m.key}
              onClick={() => setActiveMonth(m.key)}
            >
              {m.label}
            </PillButton>
          ))}
        </div>
      </div>

      {/* Week tabs */}
      <div className="mt-3 flex gap-2">
        {WEEK_TABS.map((week) => (
          <PillButton
            key={week}
            active={activeWeek === week}
            onClick={() => setActiveWeek(week)}
          >
            Week {week}
          </PillButton>
        ))}
      </div>

      {/* Content states */}
      {isLoading ? (
        <MealPlanSkeleton />
      ) : error ? (
        <MealPlanError />
      ) : !data?.visible_to_parents ? (
        <MealPlanNotAvailable />
      ) : (
        <MealGrid days={data.days} />
      )}
    </div>
  );
}
