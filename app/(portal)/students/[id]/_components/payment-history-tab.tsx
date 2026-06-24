"use client";

import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { studentsApi } from "@/lib/api/portal";
import { cn } from "@/lib/utils";

import type { PaymentHistoryEntry } from "@/types/notification";

interface PaymentHistoryTabProps {
  studentId: number;
}

export function PaymentHistoryTab({ studentId }: PaymentHistoryTabProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["payment-history", studentId],
    queryFn: () => studentsApi.paymentHistory(studentId),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">Failed to load payment history.</p>
    );
  }

  const payments = data?.data ?? [];

  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">No payment records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Month</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Paid Date</th>
          </tr>
        </thead>
        <tbody className="bg-card">
          {payments.map((p: PaymentHistoryEntry) => (
            <tr key={p.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 capitalize">{p.school_month} {p.year}</td>
              <td className="px-4 py-3">
                {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(p.amount)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full border",
                    p.status === "paid"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {p.status === "paid" ? "Paid" : "Unpaid"}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-PH") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
