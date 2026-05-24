"use client";

import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { mealPlanApi } from "@/lib/api/portal";
import { formatDate, formatPHP } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { MealPlanDay } from "@/types/portal";

const mealTypeOrder = ["AM Snack", "Lunch", "PM Snack"] as const;

function MealTypeLabel({ type }: { type: MealPlanDay["meals"][number]["type"] }) {
  const colors: Record<string, string> = {
    "AM Snack": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Lunch: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "PM Snack": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        colors[type] ?? "bg-muted text-muted-foreground"
      )}
    >
      {type}
    </span>
  );
}

function DayCard({ day }: { day: MealPlanDay }) {
  const orderedMeals = mealTypeOrder
    .map((type) => day.meals.find((m) => m.type === type))
    .filter(Boolean) as MealPlanDay["meals"];

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-semibold">{day.day}</h3>
      </div>
      <div className="divide-y divide-border">
        {orderedMeals.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">No meals scheduled.</p>
        ) : (
          orderedMeals.map((meal) => (
            <div key={meal.type} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 space-y-1">
                <MealTypeLabel type={meal.type} />
                <p className="truncate text-sm font-medium">{meal.name}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                {formatPHP(meal.price)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MealPlanSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function MealPlanPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["meal-plan"],
    queryFn: mealPlanApi.get,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meal Plan</h1>
        {data?.week_start && (
          <p className="mt-1 text-sm text-muted-foreground">
            Week of {formatDate(data.week_start)}
          </p>
        )}
      </div>

      {isLoading ? (
        <MealPlanSkeleton />
      ) : error ? (
        <p className="text-sm text-destructive">
          Failed to load meal plan. Please refresh the page.
        </p>
      ) : !data?.days.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No meal plan available for this week.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {data.days.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </div>
      )}
    </div>
  );
}
