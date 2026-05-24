"use client";

import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { mealPlanApi } from "@/lib/api/portal";

import type { MealPlanGridItem } from "@/types/portal";

const mealFields: { key: keyof Pick<MealPlanGridItem, "ulam" | "vegetables" | "fruit" | "soup">; label: string }[] = [
  { key: "ulam", label: "Ulam" },
  { key: "vegetables", label: "Vegetables" },
  { key: "fruit", label: "Fruit" },
  { key: "soup", label: "Soup" },
];

function DayCard({ item }: { item: MealPlanGridItem }) {
  const hasContent = mealFields.some((f) => item[f.key]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-semibold">{item.day_label}</h3>
      </div>
      <div className="divide-y divide-border">
        {!hasContent ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">No meals scheduled.</p>
        ) : (
          mealFields.map(({ key, label }) =>
            item[key] ? (
              <div key={key} className="px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-medium">{item[key]}</p>
              </div>
            ) : null
          )
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
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
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
      <h1 className="text-2xl font-bold">Meal Plan</h1>

      {isLoading ? (
        <MealPlanSkeleton />
      ) : error ? (
        <p className="text-sm text-destructive">
          Failed to load meal plan. Please refresh the page.
        </p>
      ) : !data?.grid.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No meal plan available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {data.grid.map((item) => (
            <DayCard key={item.day} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
