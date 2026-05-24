import { Suspense } from "react";

import { AuthLayout } from "@/components/layouts/auth-layout";
import { Skeleton } from "@/components/ui/skeleton";

import { ActivateForm } from "./activate-form";

export default function ActivatePage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        }
      >
        <ActivateForm />
      </Suspense>
    </AuthLayout>
  );
}
