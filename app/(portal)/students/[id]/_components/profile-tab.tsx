import { cn } from "@/lib/utils";
import { formatBirthday } from "@/lib/format";

import type { StudentSummary } from "@/types/portal";

interface ProfileTabProps {
  student: StudentSummary;
}

function InfoField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border py-3 last:border-0", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

export function ProfileTab({ student }: ProfileTabProps) {
  const isSubscription = student.student_type === "subscription";

  const allergiesValue = student.allergies ? (
    <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      {student.allergies}
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-8">
          {/* Left column */}
          <div>
            <InfoField label="First Name" value={student.first_name || "—"} />
            <InfoField label="Last Name" value={student.last_name || "—"} />
            <InfoField label="Grade Level" value={student.grade_level || "—"} />
            <InfoField label="Section" value={student.section || "—"} />
            <InfoField
              label="Birthday"
              value={student.birthday ? formatBirthday(student.birthday) : "—"}
            />
          </div>
          {/* Right column */}
          <div>
            <InfoField
              label="Student Number"
              value={student.student_number || "—"}
            />
            <InfoField
              label="Student Type"
              value={isSubscription ? "Subscription" : "Non-Subscription"}
            />
            <InfoField label="Allergies" value={allergiesValue} />
            <InfoField label="Notes" value={student.notes || "—"} />
          </div>
        </div>
      </div>

      {/* Meals This Month — subscription students only */}
      {isSubscription && student.subscription_monthly_status && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Meals This Month —{" "}
            {(() => {
              const m = student.subscription_monthly_status.month;
              return m.charAt(0).toUpperCase() + m.slice(1);
            })()}{" "}
            {student.subscription_monthly_status.year}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(student.subscription_monthly_status.categories)
              .filter(([, s]) => s.allocated > 0)
              .map(([cat, s]) => (
                <div
                  key={cat}
                  className="rounded-lg border border-border bg-muted/30 p-3 text-center"
                >
                  <p className="text-xs font-medium text-muted-foreground capitalize mb-1">
                    {cat}
                  </p>
                  <p className="text-lg font-bold tabular-nums">
                    {s.used}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {s.allocated}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      s.remaining === 0
                        ? "font-semibold text-destructive"
                        : s.remaining <= 5
                          ? "font-semibold text-amber-600"
                          : "text-muted-foreground",
                    )}
                  >
                    {s.remaining} remaining
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
