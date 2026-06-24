"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { feedbackApi, studentsApi } from "@/lib/api/portal";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

import type { ApiError } from "@/types/auth";
import type { FeedbackItem } from "@/types/portal";

// ---- Validation ----

const CATEGORIES = [
  { value: "FoodQuality", label: "Food Quality" },
  { value: "Service", label: "Service" },
  { value: "PortionSize", label: "Portion Size" },
  { value: "Cleanliness", label: "Cleanliness" },
  { value: "General", label: "General" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as [
  CategoryValue,
  ...CategoryValue[],
];

const feedbackSchema = z.object({
  student_id: z.number().optional(),
  category: z.enum(CATEGORY_VALUES, { error: "Please select a category" }),
  rating: z.number({ error: "Please select a rating" }).min(1).max(5),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

// ---- Category badge ----

const categoryColors: Record<string, string> = {
  FoodQuality:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Service: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PortionSize:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Cleanliness:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  General: "bg-muted text-muted-foreground",
};

const categoryLabel: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
);

function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        categoryColors[category] ?? "bg-muted text-muted-foreground",
      )}
    >
      {categoryLabel[category] ?? category}
    </Badge>
  );
}

function StarRating({
  value,
  onChange,
  error,
}: {
  value: number | undefined;
  onChange: (n: number) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Rating</Label>
      <div className="flex items-center gap-1" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            className={cn(
              "text-2xl leading-none transition-colors",
              (value ?? 0) >= star
                ? "text-amber-400"
                : "text-muted-foreground/30 hover:text-amber-300",
            )}
          >
            ★
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// ---- Submit Feedback Form ----

function FeedbackForm() {
  const queryClient = useQueryClient();
  const { data: studentsData } = useQuery({
    queryKey: ["students"],
    queryFn: studentsApi.list,
  });

  // Keep has_subscription_student flag accurate after staff enrollment changes.
  const updateParent = useAuthStore((s) => s.updateParent);
  const parent = useAuthStore((s) => s.parent);

  useEffect(() => {
    const students = studentsData?.data;
    if (!students || !parent) return;
    const hasSubscription = students.some(
      (s) => s.student_type === "subscription",
    );
    if (parent.has_subscription_student !== hasSubscription) {
      updateParent({ ...parent, has_subscription_student: hasSubscription });
    }
  }, [studentsData, parent, updateParent]);

  const [values, setValues] = useState<Partial<FeedbackFormData>>({
    student_id: undefined,
    category: undefined,
    rating: undefined,
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const mutation = useMutation({
    mutationFn: feedbackApi.submit,
    onSuccess: () => {
      toast.success("Feedback submitted. Thank you!");
      setValues({
        student_id: undefined,
        category: undefined,
        rating: undefined,
        message: "",
      });
      setFieldErrors({});
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? "Failed to submit feedback.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = feedbackSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }
    setFieldErrors({});
    mutation.mutate(result.data);
  }

  return (
    <section aria-labelledby="feedback-form-heading">
      <h2 id="feedback-form-heading" className="mb-4 text-lg font-semibold">
        Submit Feedback
      </h2>
      <div className="rounded-xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Student selector */}
          <div className="space-y-1.5">
            <Label htmlFor="student-select">About (optional)</Label>
            <select
              id="student-select"
              value={values.student_id ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  student_id: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">General / Not about a specific student</option>
              {studentsData?.data.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Category selector */}
          <div className="space-y-1.5">
            <Label htmlFor="category-select">Category</Label>
            <select
              id="category-select"
              value={values.category ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  category: e.target.value as CategoryValue,
                }))
              }
              aria-invalid={!!fieldErrors.category}
              aria-describedby={
                fieldErrors.category ? "category-error" : undefined
              }
              className={cn(
                "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                fieldErrors.category && "border-destructive",
              )}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p
                id="category-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {fieldErrors.category[0]}
              </p>
            )}
          </div>

          {/* Star Rating */}
          <StarRating
            value={values.rating}
            onChange={(n) => setValues((v) => ({ ...v, rating: n }))}
            error={fieldErrors.rating?.[0]}
          />

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              rows={4}
              placeholder="Share your feedback…"
              value={values.message ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, message: e.target.value }))
              }
              aria-invalid={!!fieldErrors.message}
              aria-describedby={
                fieldErrors.message ? "message-error" : undefined
              }
              className={cn(
                "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none",
                fieldErrors.message && "border-destructive",
              )}
            />
            {fieldErrors.message && (
              <p
                id="message-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {fieldErrors.message[0]}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting…" : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ---- Previous Feedback List ----

function FeedbackItemCard({ item }: { item: FeedbackItem }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CategoryBadge category={item.category} />
        </div>
        <time
          dateTime={item.created_at}
          className="shrink-0 text-xs text-muted-foreground"
        >
          {formatDate(item.created_at)}
        </time>
      </div>

      <p className="text-sm">{item.message}</p>

      {item.admin_reply && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="mb-1 text-xs font-medium text-primary">Staff Reply</p>
          <p className="text-sm">{item.admin_reply}</p>
          {item.replied_at && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(item.replied_at)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PreviousFeedbackSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["feedback"],
    queryFn: feedbackApi.list,
  });

  return (
    <section aria-labelledby="previous-feedback-heading">
      <h2 id="previous-feedback-heading" className="mb-4 text-lg font-semibold">
        My Previous Feedback
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">
          Failed to load feedback history.
        </p>
      ) : !data?.data.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <MessageSquare
            className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            No feedback submitted yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((item) => (
            <FeedbackItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

// ---- Main Page ----

export default function FeedbackPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your thoughts and view admin responses.
        </p>
      </div>

      <FeedbackForm />
      <PreviousFeedbackSection />
    </div>
  );
}
