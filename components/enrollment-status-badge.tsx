import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { StudentSummary } from "@/types/portal";

interface EnrollmentStatusBadgeProps {
  status: StudentSummary["enrollment_status"];
  className?: string;
}

const statusConfig: Record<
  StudentSummary["enrollment_status"],
  { label: string; className: string }
> = {
  enrolled: {
    label: "Enrolled",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  graduated: {
    label: "Graduated",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  banned: {
    label: "Banned",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function EnrollmentStatusBadge({
  status,
  className,
}: EnrollmentStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
