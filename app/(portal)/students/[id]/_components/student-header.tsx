"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

import { EnrollmentStatusBadge } from "@/components/enrollment-status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { studentsApi } from "@/lib/api/portal";
import { cn } from "@/lib/utils";

import { StudentQrActions } from "./student-qr-actions";

import type { StudentSummary } from "@/types/portal";

interface StudentHeaderProps {
  student: StudentSummary;
  onPhotoUploaded: () => void;
  className?: string;
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function StudentHeader({
  student,
  onPhotoUploaded,
  className,
}: StudentHeaderProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!student.photo_url) return;

    let aborted = false;
    let fetchedUrl: string | null = null;

    studentsApi.fetchPhoto(student.id).then((fetched) => {
      if (aborted) {
        if (fetched) URL.revokeObjectURL(fetched);
        return;
      }
      fetchedUrl = fetched;
      setBlobUrl(fetched);
    });

    return () => {
      aborted = true;
      if (fetchedUrl) URL.revokeObjectURL(fetchedUrl);
    };
  }, [student.id, student.photo_url]);

  // Derive display URL: when photo_url is null, don't show a stale blob
  const displayUrl = student.photo_url ? blobUrl : null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      await studentsApi.uploadPhoto(student.id, file);
      toast.success("Photo updated.");
      onPhotoUploaded();
    } catch {
      toast.error("Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const isSubscription = student.student_type === "subscription";

  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-5", className)}
    >
      <div className="flex flex-wrap items-start gap-5">
        {/* Avatar with upload overlay */}
        <div className="relative shrink-0">
          <Avatar className="h-20 w-20">
            {displayUrl && (
              <AvatarImage src={displayUrl} alt={student.full_name} />
            )}
            <AvatarFallback className="text-xl font-semibold">
              {getInitials(student.full_name)}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            disabled={uploading}
            aria-label="Upload student photo"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        {/* Student info */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{student.full_name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {student.grade_level}
            {student.branch_name && ` · ${student.branch_name}`}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <EnrollmentStatusBadge status={student.enrollment_status} />
            <Badge
              variant="outline"
              className={cn(
                "border-transparent font-medium",
                isSubscription
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isSubscription ? "Subscription" : "Non-Subscription"}
            </Badge>
          </div>
        </div>

        {/* Right: QR actions */}
        {student.qr_code && (
          <StudentQrActions
            student={student}
            blobUrl={displayUrl}
            className="self-end"
          />
        )}
      </div>
    </div>
  );
}
