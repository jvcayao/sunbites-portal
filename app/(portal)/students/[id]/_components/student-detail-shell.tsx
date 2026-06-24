"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { studentsApi } from "@/lib/api/portal";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

import { StudentHeader } from "./student-header";
import { ProfileTab } from "./profile-tab";
import { WalletTab } from "./wallet-tab";
import { OrderHistoryTab } from "./order-history-tab";
import { PaymentHistoryTab } from "./payment-history-tab";

type TabId = "profile" | "wallet" | "order-history" | "payment";

const BASE_TABS: { id: TabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "wallet", label: "Wallet" },
  { id: "order-history", label: "Order History" },
];

interface StudentDetailShellProps {
  studentId: number;
}

function HeaderSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start gap-5">
        <Skeleton className="h-20 w-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentDetailShell({ studentId }: StudentDetailShellProps) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialTab = (searchParams.get("tab") as TabId | null) ?? "profile";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: studentsApi.list,
  });

  const updateParent = useAuthStore((s) => s.updateParent);
  const parent = useAuthStore((s) => s.parent);

  useEffect(() => {
    const students = studentsData?.data;
    if (!students || !parent) return;
    const hasSubscription = students.some((s) => s.student_type === "subscription");
    if (parent.has_subscription_student !== hasSubscription) {
      updateParent({ ...parent, has_subscription_student: hasSubscription });
    }
  }, [studentsData, parent, updateParent]);

  const student = studentsData?.data.find((s) => s.id === studentId);
  const isSubscription = student?.student_type === "subscription";

  const tabs = isSubscription
    ? [...BASE_TABS, { id: "payment" as TabId, label: "Payment" }]
    : BASE_TABS;

  function handlePhotoUploaded() {
    queryClient.invalidateQueries({ queryKey: ["students"] });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/students"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Students
      </Link>

      {/* Student header */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : student ? (
        <StudentHeader student={student} onPhotoUploaded={handlePhotoUploaded} />
      ) : (
        <p className="text-sm text-muted-foreground">Student not found.</p>
      )}

      {/* Tab bar */}
      {student && (
        <>
          <div className="border-b border-border">
            <nav className="-mb-px flex gap-4" aria-label="Student tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  className={cn(
                    "border-b-2 pb-3 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === "profile" && <ProfileTab student={student} />}
          {activeTab === "wallet" && <WalletTab studentId={studentId} />}
          {activeTab === "order-history" && <OrderHistoryTab studentId={studentId} />}
          {activeTab === "payment" && isSubscription && <PaymentHistoryTab studentId={studentId} />}
        </>
      )}
    </div>
  );
}
